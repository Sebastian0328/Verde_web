import React from "react";
import { Resend } from "resend";
import { CustomerReservationEmail } from "../emails/CustomerReservationEmail";
import { InternalOrderEmail } from "../emails/InternalOrderEmail";
import { OverbookingAlertEmail } from "../emails/OverbookingAlertEmail";

if (!process.env.RESEND_API_KEY) {
  throw new Error("Falta la variable de entorno RESEND_API_KEY");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.VERDE_FROM_EMAIL ?? "verde@ejemplo.com";
const TEAM_EMAIL = process.env.VERDE_INTERNAL_EMAIL ?? "equipo@ejemplo.com";

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
  reservationDate: string;
  reservationTime: string;
  depositPaid: number;
  pendingAmount: number;
  notes?: string;
  deliveryMethod?: string;
  deliveryAddress?: string;
  deliveryDetails?: string;
  postalCode?: string;
  deliveryZone?: string;
}

// ─── Customer confirmation ────────────────────────────────────────────────────

export async function sendConfirmationToCustomer(
  data: ConfirmationEmailData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: "Tu reserva en Verde está confirmada",
    // React.createElement avoids needing JSX in this .ts file
    react: React.createElement(CustomerReservationEmail, {
      customerName:   data.customerName,
      items:          data.items,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      deliveryMethod:  data.deliveryMethod,
      deliveryAddress: data.deliveryAddress,
      deliveryDetails: data.deliveryDetails,
      postalCode:      data.postalCode,
      deliveryZone:    data.deliveryZone,
      depositPaid:     data.depositPaid,
      pendingAmount:   data.pendingAmount,
    }),
  });
}

// ─── Internal order notification ──────────────────────────────────────────────

export async function sendInternalOrderNotification(
  data: ConfirmationEmailData & { stripeSessionId?: string }
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: `Nueva reserva pagada — Verde | ${data.customerName}`,
    react: React.createElement(InternalOrderEmail, {
      customerName:    data.customerName,
      email:           data.email,
      phone:           data.phone,
      items:           data.items,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      deliveryMethod:  data.deliveryMethod,
      deliveryAddress: data.deliveryAddress,
      deliveryDetails: data.deliveryDetails,
      postalCode:      data.postalCode,
      deliveryZone:    data.deliveryZone,
      depositPaid:     data.depositPaid,
      pendingAmount:   data.pendingAmount,
      notes:           data.notes,
      stripeSessionId: data.stripeSessionId,
    }),
  });
}

// ─── Overbooking alert ────────────────────────────────────────────────────────

export interface OverbookingAlertData {
  customerName: string;
  email: string;
  phone: string;
  items: OrderItem[];
  reservationDate: string;
  reservationTime: string;
  stripeSessionId: string;
  depositPaid: number;
  pendingAmount: number;
}

export async function sendOverbookingAlert(
  data: OverbookingAlertData
): Promise<void> {
  await resend.emails.send({
    from: FROM,
    to: TEAM_EMAIL,
    subject: "URGENTE — Posible sobrecupo en reserva Verde",
    react: React.createElement(OverbookingAlertEmail, {
      customerName:    data.customerName,
      email:           data.email,
      phone:           data.phone,
      items:           data.items,
      reservationDate: data.reservationDate,
      reservationTime: data.reservationTime,
      stripeSessionId: data.stripeSessionId,
      depositPaid:     data.depositPaid,
      pendingAmount:   data.pendingAmount,
    }),
  });
}

// ─── Waitlist (unchanged) ─────────────────────────────────────────────────────

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
