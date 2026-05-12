import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Falta la variable de entorno RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "verde@ejemplo.com";
const TEAM_EMAIL = process.env.VERDE_TEAM_EMAIL ?? "equipo@ejemplo.com";

export interface OrderItem {
  productName: string;
  quantity: number;
  finalPrice: number;
}

export interface ConfirmationEmailData {
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  deliveryDay: string;
  depositPaid: number;
  pendingAmount: number;
  notes?: string;
}

function itemsTableRows(items: OrderItem[]): string {
  return items
    .map(
      (item) =>
        `<tr>
          <td style="padding:6px 0;color:#555;">${item.productName}</td>
          <td style="padding:6px 0;">×${item.quantity}</td>
          <td style="padding:6px 0;text-align:right;">${item.finalPrice * item.quantity} €</td>
        </tr>`
    )
    .join("");
}

export async function sendConfirmationToCustomer(
  data: ConfirmationEmailData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Tu reserva en Verde está confirmada",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2>¡Hola, ${data.customerName}!</h2>
        <p>Gracias por reservar en <strong>Verde</strong>. Tu pedido ya quedó confirmado:</p>

        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <thead>
            <tr>
              <th style="padding:6px 0;text-align:left;color:#555;font-weight:normal;">Producto</th>
              <th style="padding:6px 0;text-align:left;color:#555;font-weight:normal;">Cant.</th>
              <th style="padding:6px 0;text-align:right;color:#555;font-weight:normal;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsTableRows(data.items)}</tbody>
          <tfoot>
            <tr><td colspan="3" style="padding-top:10px;border-top:1px solid #eee;"></td></tr>
            <tr>
              <td colspan="2" style="padding:4px 0;color:#555;">Día de entrega</td>
              <td style="padding:4px 0;text-align:right;"><strong>${data.deliveryDay}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding:4px 0;color:#555;">Reserva pagada</td>
              <td style="padding:4px 0;text-align:right;"><strong>${data.depositPaid} €</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding:4px 0;color:#555;">Pendiente al recoger</td>
              <td style="padding:4px 0;text-align:right;"><strong>${data.pendingAmount} €</strong></td>
            </tr>
          </tfoot>
        </table>

        <p>Tu reserva se descuenta del precio final cuando recojas tu pedido.</p>
        <p>Te escribiremos por WhatsApp para coordinar la entrega.</p>
        <br/>
        <p style="color:#555;">Equipo Verde</p>
      </div>
    `,
  });
}

export async function sendInternalOrderNotification(
  data: ConfirmationEmailData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: `Nueva reserva pagada — Verde | ${data.customerName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2>Nueva reserva confirmada</h2>

        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#555;">Cliente</td><td>${data.customerName}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">WhatsApp</td><td>${data.phone}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Email</td><td>${data.email}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Entrega</td><td>${data.deliveryDay}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Abono pagado</td><td>${data.depositPaid} €</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Pendiente</td><td>${data.pendingAmount} €</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Notas</td><td>${data.notes ?? "—"}</td></tr>
        </table>

        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <thead>
            <tr>
              <th style="padding:6px 0;text-align:left;color:#555;font-weight:normal;">Producto</th>
              <th style="padding:6px 0;text-align:left;color:#555;font-weight:normal;">Cant.</th>
              <th style="padding:6px 0;text-align:right;color:#555;font-weight:normal;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsTableRows(data.items)}</tbody>
        </table>
      </div>
    `,
  });
}

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
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#111;">
        <h2>Nuevo registro en lista de espera</h2>
        <table style="border-collapse:collapse;width:100%;margin:16px 0;">
          <tr><td style="padding:6px 0;color:#555;">Nombre</td><td>${data.name}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">WhatsApp</td><td>${data.phone}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Email</td><td>${data.email || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#555;">Mensaje</td><td>${data.message ?? "—"}</td></tr>
        </table>
      </div>
    `,
  });
}
