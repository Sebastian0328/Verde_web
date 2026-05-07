import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Falta la variable de entorno RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "verde@ejemplo.com";
const TEAM_EMAIL = process.env.VERDE_TEAM_EMAIL ?? "equipo@ejemplo.com";

export interface ConfirmationEmailData {
  customerName: string;
  email: string;
  phone: string;
  productName: string;
  quantity: number;
  deliveryDay: string;
  depositPaid: number;
  pendingAmount: number;
  notes?: string;
}

// Correo de confirmación al cliente
export async function sendConfirmationToCustomer(
  data: ConfirmationEmailData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Tu reserva en Verde está confirmada",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
        <h2>¡Hola, ${data.customerName}!</h2>
        <p>Gracias por reservar en <strong>Verde</strong>.</p>
        <p>Tu pedido ya quedó confirmado:</p>

        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #555;">Producto</td><td style="padding: 6px 0;"><strong>${data.productName}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Cantidad</td><td style="padding: 6px 0;"><strong>${data.quantity}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Día de entrega</td><td style="padding: 6px 0;"><strong>${data.deliveryDay}</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Reserva pagada</td><td style="padding: 6px 0;"><strong>${data.depositPaid} €</strong></td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Valor pendiente</td><td style="padding: 6px 0;"><strong>${data.pendingAmount} €</strong></td></tr>
        </table>

        <p>Tu reserva se descuenta del precio final cuando recojas tu pedido.</p>
        <p>Te escribiremos por WhatsApp para coordinar la entrega.</p>

        <br/>
        <p style="color: #555;">Equipo Verde</p>
      </div>
    `,
  });
}

// Correo interno al equipo de Verde
export async function sendInternalOrderNotification(
  data: ConfirmationEmailData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: `Nueva reserva pagada — Verde | ${data.customerName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
        <h2>Nueva reserva confirmada</h2>

        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #555;">Cliente</td><td style="padding: 6px 0;">${data.customerName}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">WhatsApp</td><td style="padding: 6px 0;">${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Email</td><td style="padding: 6px 0;">${data.email}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Producto</td><td style="padding: 6px 0;">${data.productName}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Cantidad</td><td style="padding: 6px 0;">${data.quantity}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Día de entrega</td><td style="padding: 6px 0;">${data.deliveryDay}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Abono pagado</td><td style="padding: 6px 0;">${data.depositPaid} €</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Pendiente</td><td style="padding: 6px 0;">${data.pendingAmount} €</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Notas</td><td style="padding: 6px 0;">${data.notes ?? "—"}</td></tr>
        </table>
      </div>
    `,
  });
}

// Correo interno cuando alguien entra a la lista de espera
export async function sendWaitlistNotification(data: {
  name: string;
  email: string;
  phone: string;
  message?: string;
}): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: `Lista de espera — Verde | ${data.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #111;">
        <h2>Nuevo registro en lista de espera</h2>
        <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
          <tr><td style="padding: 6px 0; color: #555;">Nombre</td><td style="padding: 6px 0;">${data.name}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">WhatsApp</td><td style="padding: 6px 0;">${data.phone}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Email</td><td style="padding: 6px 0;">${data.email || "—"}</td></tr>
          <tr><td style="padding: 6px 0; color: #555;">Mensaje</td><td style="padding: 6px 0;">${data.message ?? "—"}</td></tr>
        </table>
      </div>
    `,
  });
}
