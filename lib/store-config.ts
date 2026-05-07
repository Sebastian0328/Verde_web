export interface StoreConfig {
  reservationsOpen: boolean;
  closedMessage: string;
  deliveryDays: string[];
  maxQuantityPerOrder: number;
  currency: string;
}

// Para abrir o cerrar reservas, cambia `reservationsOpen` a true o false.
// En el futuro esto puede moverse a una variable de entorno o a Google Sheets.
export const storeConfig: StoreConfig = {
  reservationsOpen: true,

  closedMessage:
    "Las reservas de esta semana ya volaron. Nos llenamos de pedidos y preferimos cocinar bien antes que correr mal. Abrimos nuevos cupos cada semana.",

  deliveryDays: ["sábado", "domingo"],

  maxQuantityPerOrder: 10,

  currency: "eur",
};
