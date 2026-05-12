import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { appendOrderToSheet } from "@/lib/google-sheets";
import { sendConfirmationToCustomer, sendInternalOrderNotification } from "@/lib/email";
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

    let items: ItemMeta[] = [];
    try {
      items = JSON.parse(meta.items ?? "[]");
    } catch {
      console.error("[stripe-webhook] Error parseando items:", session.id);
    }

    const totalDeposit = Number(meta.totalDeposit);
    const totalPending = Number(meta.totalPending);
    const totalFinal = Number(meta.totalFinal);

    try {
      // Una fila en Google Sheets por cada producto del pedido
      for (const item of items) {
        await appendOrderToSheet({
          createdAt: new Date().toISOString(),
          status: "confirmado",
          stripeSessionId: session.id,
          customerName: meta.customerName,
          email: meta.email,
          phone: meta.phone,
          productId: item.id,
          productName: item.name,
          quantity: item.qty,
          deliveryDay: meta.deliveryDay,
          notes: meta.notes ?? "",
          finalPrice: item.price * item.qty,
          depositPaid: item.deposit * item.qty,
          pendingAmount: (item.price - item.deposit) * item.qty,
        });
      }

      const emailItems = items.map((item) => ({
        productName: item.name,
        quantity: item.qty,
        finalPrice: item.price,
      }));

      await sendConfirmationToCustomer({
        customerName: meta.customerName,
        email: meta.email,
        phone: meta.phone,
        items: emailItems,
        deliveryDay: meta.deliveryDay,
        depositPaid: totalDeposit,
        pendingAmount: totalPending,
        notes: meta.notes,
      });

      await sendInternalOrderNotification({
        customerName: meta.customerName,
        email: meta.email,
        phone: meta.phone,
        items: emailItems,
        deliveryDay: meta.deliveryDay,
        depositPaid: totalDeposit,
        pendingAmount: totalPending,
        notes: meta.notes,
      });
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
