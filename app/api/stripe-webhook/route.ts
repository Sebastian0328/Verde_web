import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { appendOrderToSheet } from "@/lib/google-sheets";
import { sendConfirmationToCustomer, sendInternalOrderNotification } from "@/lib/email";
import Stripe from "stripe";

// Next.js App Router: necesitamos el body crudo para verificar la firma de Stripe
export const runtime = "nodejs";

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

  // Leer el body como buffer para verificar la firma criptográfica
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe-webhook] Firma inválida:", err);
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  // Solo procesamos pedidos completados
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata;

    if (!meta) {
      console.error("[stripe-webhook] Sesión sin metadata:", session.id);
      return NextResponse.json({ error: "Metadata vacía." }, { status: 400 });
    }

    const orderData = {
      customerName: meta.customerName,
      email: meta.email,
      phone: meta.phone,
      productName: meta.productName,
      quantity: Number(meta.quantity),
      deliveryDay: meta.deliveryDay,
      depositPaid: Number(meta.depositPaid),
      pendingAmount: Number(meta.pendingAmount),
      notes: meta.notes,
    };

    try {
      // 1. Guardar en Google Sheets
      // Nota: si el webhook se reintenta (fallo de red, timeout), se insertará de nuevo.
      // Para evitar duplicados en producción, se recomienda verificar si session.id ya existe
      // en la hoja antes de insertar. Sin BD, esto requiere una búsqueda previa en la API.
      await appendOrderToSheet({
        createdAt: new Date().toISOString(),
        status: "confirmado",
        stripeSessionId: session.id,
        customerName: meta.customerName,
        email: meta.email,
        phone: meta.phone,
        productId: meta.productId,
        productName: meta.productName,
        quantity: Number(meta.quantity),
        deliveryDay: meta.deliveryDay,
        notes: meta.notes ?? "",
        finalPrice: Number(meta.finalPrice),
        depositPaid: Number(meta.depositPaid),
        pendingAmount: Number(meta.pendingAmount),
      });

      // 2. Email de confirmación al cliente
      await sendConfirmationToCustomer(orderData);

      // 3. Email interno al equipo de Verde
      await sendInternalOrderNotification(orderData);
    } catch (err) {
      // Registrar el error pero devolver 200 para que Stripe no reintente
      // inmediatamente. El pedido quedará pendiente de revisión manual.
      console.error("[stripe-webhook] Error procesando pedido:", session.id, err);
      return NextResponse.json(
        { error: "Error al procesar el pedido. Requiere revisión manual." },
        { status: 500 }
      );
    }
  }

  // Responder 200 para todos los demás eventos (Stripe espera este OK)
  return NextResponse.json({ received: true });
}
