import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { appendOrderToSheet, findOrderByStripeSessionId } from "@/lib/google-sheets";
import {
  sendConfirmationToCustomer,
  sendInternalOrderNotification,
  sendOverbookingAlert,
} from "@/lib/email";
import { isSlotAvailable, normalizeTime, normalizeDate } from "@/lib/availability";
import Stripe from "stripe";

export const runtime = "nodejs";

interface ItemMeta {
  id: string;
  name: string;
  qty: number;
  price: number;
  deposit: number;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] Falta STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Configuración incompleta." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Firma faltante." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    if (!meta) {
      console.error("[stripe-webhook] Sesión sin metadata:", session.id);
      return NextResponse.json({ error: "Metadata vacía." }, { status: 400 });
    }

    // Dedup: skip if already processed
    try {
      const existing = await findOrderByStripeSessionId(session.id);
      if (existing) {
        console.log("[stripe-webhook] Pedido ya procesado:", session.id);
        return NextResponse.json({ received: true });
      }
    } catch (err) {
      console.error("[stripe-webhook] Error en dedup check:", err);
    }

    let items: ItemMeta[] = [];
    try {
      items = JSON.parse(meta.items ?? "[]");
    } catch {
      console.error("[stripe-webhook] Error parseando items:", session.id);
    }

    const totalDeposit = Number(meta.totalDeposit);
    const totalPending = Number(meta.totalPending);
    const reservationDate = normalizeDate(meta.reservationDate ?? "");
    const reservationTime = normalizeTime(meta.reservationTime ?? "");
    const deliveryMethod = meta.deliveryMethod ?? "delivery";
    const deliveryAddress = meta.deliveryAddress ?? "";
    const deliveryDetails = meta.deliveryDetails ?? "";
    const postalCode = meta.postalCode ?? "";
    const deliveryZone = meta.deliveryZone ?? "";

    // Re-validate slot availability before saving
    let slotStillAvailable = false;
    try {
      slotStillAvailable = await isSlotAvailable(reservationDate, reservationTime);
    } catch (err) {
      console.error("[stripe-webhook] Error validando slot:", err);
      // benefit of the doubt: save as NEEDS_REVIEW
      slotStillAvailable = false;
    }

    const orderStatus = slotStillAvailable ? "PAID" : "NEEDS_REVIEW";

    try {
      for (const item of items) {
        await appendOrderToSheet({
          createdAt: new Date().toISOString(),
          status: orderStatus,
          stripeSessionId: session.id,
          customerName: meta.customerName,
          email: meta.email,
          phone: meta.phone,
          productId: item.id,
          productName: item.name,
          quantity: item.qty,
          reservationDate,
          reservationTime,
          notes: meta.notes ?? "",
          finalPrice: item.price * item.qty,
          depositPaid: item.deposit * item.qty,
          pendingAmount: (item.price - item.deposit) * item.qty,
          deliveryMethod,
          deliveryAddress,
          deliveryDetails,
          postalCode,
          deliveryZone,
        });
      }

      const emailItems = items.map((item) => ({
        productName: item.name,
        quantity: item.qty,
        finalPrice: item.price,
      }));

      if (slotStillAvailable) {
        const deliveryEmailFields = {
          deliveryMethod,
          deliveryAddress,
          deliveryDetails,
          postalCode,
          deliveryZone,
        };

        await sendConfirmationToCustomer({
          customerName: meta.customerName,
          email: meta.email,
          phone: meta.phone,
          items: emailItems,
          reservationDate,
          reservationTime,
          depositPaid: totalDeposit,
          pendingAmount: totalPending,
          notes: meta.notes,
          ...deliveryEmailFields,
        });

        await sendInternalOrderNotification({
          customerName: meta.customerName,
          email: meta.email,
          phone: meta.phone,
          items: emailItems,
          reservationDate,
          reservationTime,
          depositPaid: totalDeposit,
          pendingAmount: totalPending,
          notes: meta.notes,
          ...deliveryEmailFields,
        });
      } else {
        await sendOverbookingAlert({
          customerName: meta.customerName,
          email: meta.email,
          phone: meta.phone,
          items: emailItems,
          reservationDate,
          reservationTime,
          stripeSessionId: session.id,
          depositPaid: totalDeposit,
          pendingAmount: totalPending,
        });
      }
    } catch (err) {
      console.error("[stripe-webhook] Error procesando pedido:", session.id, err);
      return NextResponse.json(
        { error: "Error al procesar el pedido. Requiere revisión manual." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}
