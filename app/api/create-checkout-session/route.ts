import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductById } from "@/lib/products";
import { storeConfig } from "@/lib/store-config";
import { reservationSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = reservationSchema.parse(body);

    if (!storeConfig.reservationsOpen) {
      return NextResponse.json(
        { error: "Las reservas están cerradas en este momento." },
        { status: 403 }
      );
    }

    // Validar cada item en el backend (la fuente de verdad siempre es el servidor)
    const validatedItems = parsed.items.map((item) => {
      const product = getProductById(item.productId);
      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }
      if (!product.available) {
        throw new Error(`${product.name} no está disponible`);
      }
      return { product, quantity: item.quantity };
    });

    // Calcular totales en el backend
    const totalDeposit = validatedItems.reduce(
      (s, { product, quantity }) => s + product.depositAmount * quantity,
      0
    );
    const totalFinal = validatedItems.reduce(
      (s, { product, quantity }) => s + product.finalPrice * quantity,
      0
    );
    const totalPending = totalFinal - totalDeposit;
    const totalItems = validatedItems.reduce((s, { quantity }) => s + quantity, 0);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Una línea de Stripe por producto — transparente en el checkout
    const lineItems = validatedItems.map(({ product, quantity }) => ({
      price_data: {
        currency: storeConfig.currency,
        unit_amount: product.depositAmount * 100,
        product_data: {
          name: `Reserva — ${product.name}`,
          description: `${quantity} × ${product.finalPrice} €. Resto al recoger.`,
        },
      },
      quantity,
    }));

    // Serializar items para metadata (Stripe limita 500 chars por valor)
    const itemsMeta = JSON.stringify(
      validatedItems.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        qty: quantity,
        price: product.finalPrice,
        deposit: product.depositAmount,
      }))
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: storeConfig.currency,
      line_items: lineItems,
      metadata: {
        items: itemsMeta,
        deliveryDay: parsed.deliveryDay,
        customerName: parsed.customerName,
        email: parsed.email,
        phone: parsed.phone,
        notes: parsed.notes ?? "",
        totalItems: String(totalItems),
        totalFinal: String(totalFinal),
        totalDeposit: String(totalDeposit),
        totalPending: String(totalPending),
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

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("[create-checkout-session]", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
