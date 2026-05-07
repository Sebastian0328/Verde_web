import { z } from "zod";
import { storeConfig } from "./store-config";

// Schema para el formulario de reserva
export const reservationSchema = z.object({
  productId: z.string().min(1, "Producto requerido"),
  quantity: z
    .number()
    .int()
    .min(1, "La cantidad mínima es 1")
    .max(storeConfig.maxQuantityPerOrder, `Máximo ${storeConfig.maxQuantityPerOrder} unidades`),
  deliveryDay: z.enum(
    storeConfig.deliveryDays as [string, ...string[]],
    { errorMap: () => ({ message: "Día de entrega no válido" }) }
  ),
  customerName: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email no válido"),
  phone: z.string().min(6, "Teléfono/WhatsApp requerido"),
  notes: z.string().max(500).optional(),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

// Schema para la lista de espera
export const waitlistSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().min(6, "WhatsApp requerido"),
  message: z.string().max(300).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
