import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Hr,
} from "@react-email/components";
import React from "react";

interface OrderItem {
  productName: string;
  quantity: number;
  finalPrice: number;
}

export interface OverbookingAlertEmailProps {
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

const V = {
  verde:   "#2E4F20",
  crema:   "#F5EDD8",
  oro:     "#FFBC23",
  negro:   "#1A1A1A",
  gris:    "#7A7A6E",
  white:   "#FFFFFF",
  alert:   "#CC2200",
  alertBg: "#FFF3F0",
  border:  "#E0D9CC",
};

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td
        style={{
          padding: "5px 12px 5px 0",
          fontSize: "12px",
          color: V.gris,
          width: "40%",
          verticalAlign: "top",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "5px 0",
          fontSize: "12px",
          color: V.negro,
          verticalAlign: "top",
        }}
      >
        {value || "—"}
      </td>
    </tr>
  );
}

export function OverbookingAlertEmail({
  customerName,
  email,
  phone,
  items,
  reservationDate,
  reservationTime,
  stripeSessionId,
  depositPaid,
  pendingAmount,
}: OverbookingAlertEmailProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>
        URGENTE — Posible sobrecupo · {customerName} · {reservationDate} {reservationTime}
      </Preview>
      <Body
        style={{
          backgroundColor: "#F5F0EB",
          fontFamily: "Arial, Helvetica, sans-serif",
          margin: 0,
          padding: "24px 16px",
        }}
      >
        <Container style={{ maxWidth: "540px", margin: "0 auto" }}>

          {/* ── Alert header ── */}
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ backgroundColor: V.alert }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "22px 28px" }}>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "10px",
                      letterSpacing: "0.25em",
                      color: "rgba(255,255,255,0.55)",
                      textTransform: "uppercase",
                    }}
                  >
                    Verde · Alerta interna
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      fontWeight: "700",
                      color: V.white,
                      lineHeight: "1.2",
                    }}
                  >
                    URGENTE — Posible sobrecupo
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Alert message ── */}
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ backgroundColor: V.alertBg }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "18px 28px" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: V.alert,
                      lineHeight: "1.6",
                      fontWeight: "600",
                    }}
                  >
                    Stripe confirmó un pago, pero el horario ya no aparece disponible en el sistema. Revisar manualmente antes de confirmar la entrega.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Body card ── */}
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ backgroundColor: V.white }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "24px 28px 0 28px" }}>

                  {/* Cliente */}
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: V.gris,
                    }}
                  >
                    Cliente
                  </p>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tbody>
                      <DataRow label="Nombre" value={customerName} />
                      <DataRow label="Email" value={email} />
                      <DataRow label="WhatsApp" value={phone} />
                    </tbody>
                  </table>

                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 0 28px" }}>
                  <Hr style={{ borderColor: V.border, margin: 0 }} />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 0 28px" }}>

                  {/* Pedido */}
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: V.gris,
                    }}
                  >
                    Pedido
                  </p>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i}>
                          <td style={{ padding: "4px 0", fontSize: "13px", color: V.negro }}>
                            {item.productName}{" "}
                            <span style={{ color: V.gris }}>×{item.quantity}</span>
                          </td>
                          <td style={{ padding: "4px 0", fontSize: "13px", color: V.negro, textAlign: "right" }}>
                            {item.finalPrice * item.quantity} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 0 28px" }}>
                  <Hr style={{ borderColor: V.border, margin: 0 }} />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 0 28px" }}>

                  {/* Fecha/Hora */}
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: V.gris,
                    }}
                  >
                    Horario con conflicto
                  </p>
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tbody>
                      <DataRow label="Fecha" value={reservationDate} />
                      <DataRow label="Hora" value={reservationTime} />
                      <DataRow label="Abono cobrado" value={`${depositPaid} €`} />
                      <DataRow label="Pendiente" value={`${pendingAmount} €`} />
                    </tbody>
                  </table>

                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 0 28px" }}>
                  <Hr style={{ borderColor: V.border, margin: 0 }} />
                </td>
              </tr>

              <tr>
                <td style={{ padding: "16px 28px 24px 28px" }}>

                  {/* Stripe ID */}
                  <p
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "9px",
                      fontWeight: "700",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: V.gris,
                    }}
                  >
                    Stripe Session ID
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "11px",
                      color: V.negro,
                      fontFamily: "monospace",
                      backgroundColor: "#F3F0EA",
                      padding: "10px 12px",
                      wordBreak: "break-all",
                    }}
                  >
                    {stripeSessionId}
                  </p>

                </td>
              </tr>
            </tbody>
          </table>

          {/* ── Footer ── */}
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ backgroundColor: V.negro }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "14px 28px", textAlign: "center" }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "9px",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "rgba(245,237,216,0.3)",
                    }}
                  >
                    VERDE · Alerta interna · Requiere acción manual
                  </p>
                </td>
              </tr>
            </tbody>
          </table>

        </Container>
      </Body>
    </Html>
  );
}
