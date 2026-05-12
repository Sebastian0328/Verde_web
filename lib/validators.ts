import { z } from "zod";
import { storeConfig } from "./store-config";

const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .min(1)
    .max(storeConfig.maxQuantityPerOrder, `Máximo ${storeConfig.maxQuantityPerOrder} por producto`),
});

export const reservationSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Añade al menos un producto"),
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

export const waitlistSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email no válido").optional().or(z.literal("")),
  phone: z.string().min(6, "WhatsApp requerido"),
  message: z.string().max(300).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
