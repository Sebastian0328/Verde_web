import { google } from "googleapis";

// La private key en Vercel se pega con \n literales; los reemplazamos por saltos reales
function getPrivateKey(): string {
  const key = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (!key) throw new Error("Falta GOOGLE_SHEETS_PRIVATE_KEY");
  return key.replace(/\\n/g, "\n");
}

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: getPrivateKey(),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export interface OrderRow {
  createdAt: string;
  status: string;
  stripeSessionId: string;
  customerName: string;
  email: string;
  phone: string;
  productId: string;
  productName: string;
  quantity: number;
  deliveryDay: string;
  notes: string;
  finalPrice: number;
  depositPaid: number;
  pendingAmount: number;
}

// Guarda un pedido confirmado en la pestaña "Pedidos"
// Nota: no se valida duplicado aquí por falta de BD.
// Para evitar dobles, comprueba en la hoja que el stripeSessionId no exista antes de insertar.
export async function appendOrderToSheet(order: OrderRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("Falta GOOGLE_SHEETS_SPREADSHEET_ID");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    order.createdAt,
    order.status,
    order.stripeSessionId,
    order.customerName,
    order.email,
    order.phone,
    order.productId,
    order.productName,
    order.quantity,
    order.deliveryDay,
    order.notes,
    order.finalPrice,
    order.depositPaid,
    order.pendingAmount,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Pedidos!A:N",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

export interface WaitlistRow {
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Guarda una entrada en la pestaña "Waitlist"
export async function appendWaitlistToSheet(entry: WaitlistRow): Promise<void> {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  if (!spreadsheetId) throw new Error("Falta GOOGLE_SHEETS_SPREADSHEET_ID");

  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const row = [
    entry.createdAt,
    entry.name,
    entry.email,
    entry.phone,
    entry.message,
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Waitlist!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
