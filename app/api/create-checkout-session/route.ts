import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import { reservationSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validar los datos del formulario
    const parsed = reservationSchema.parse({
      ...body,
      quantity: Number(body.quantity),
    });

    // Verificar que las reservas estén abiertas
    if (!storeConfig.reservationsOpen) {
      return NextResponse.json(
        { error: "Las reservas están cerradas en este momento." },
        { status: 403 }
      );
    }

    // Buscar el producto en el catálogo (fuente de verdad = backend)
    const product = getProductById(parsed.productId);
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 });
    }

    if (!product.available) {
      return NextResponse.json({ error: "Este producto no está disponible." }, { status: 400 });
    }

    // Calcular precios en el backend — nunca confiar en valores del frontend
    const depositPaid = product.depositAmount * parsed.quantity;
    const finalPrice = product.finalPrice * parsed.quantity;
    const pendingAmount = finalPrice - depositPaid;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: storeConfig.currency,
      line_items: [
        {
          price_data: {
            currency: storeConfig.currency,
            unit_amount: depositPaid * 100, // Stripe trabaja en céntimos
            product_data: {
              name: `Reserva — ${product.name} x${parsed.quantity}`,
              description: `Abono de reserva. Al recoger pagarás ${pendingAmount} € más.`,
            },
          },
          quantity: 1,
        },
      ],
      // Guardar toda la info del pedido en metadata para recuperarla en el webhook
      metadata: {
        productId: product.id,
        productName: product.name,
        quantity: String(parsed.quantity),
        deliveryDay: parsed.deliveryDay,
        customerName: parsed.customerName,
        email: parsed.email,
        phone: parsed.phone,
        notes: parsed.notes ?? "",
        finalPrice: String(finalPrice),
        depositPaid: String(depositPaid),
        pendingAmount: String(pendingAmount),
      },
      customer_email: parsed.email,
      success_url: `${appUrl}/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cancelado`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    console.error("[create-checkout-session]", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
