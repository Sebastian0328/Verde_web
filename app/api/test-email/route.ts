import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.VERDE_FROM_EMAIL;
  const to = process.env.VERDE_INTERNAL_EMAIL;

  if (!apiKey || !from || !to) {
    return NextResponse.json(
      {
        success: false,
        error: "Faltan variables de entorno: RESEND_API_KEY, VERDE_FROM_EMAIL o VERDE_INTERNAL_EMAIL",
      },
      { status: 500 }
    );
  }

  try {
    const resend = new Resend(apiKey);
    const data = await resend.emails.send({
      from,
      to,
      subject: "Prueba Resend — Verde",
      html: "<p>Resend está funcionando correctamente para Verde.</p>",
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
