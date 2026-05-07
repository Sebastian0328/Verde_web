export interface Product {
  id: string;
  name: string;
  description: string;
  finalPrice: number;       // precio total que paga el cliente al recoger
  depositAmount: number;    // abono que se paga al reservar (siempre 1 €)
  available: boolean;
  allergens?: string[];
  image?: string;           // ruta a /public o URL externa
}

export const PRODUCTS: Product[] = [
  {
    id: "bolon-clasico",
    name: "Bolón Clásico",
    description:
      "Bolón de verde relleno de queso y chicharrón. Crujiente por fuera, suave por dentro.",
    finalPrice: 6,
    depositAmount: 1,
    available: true,
    allergens: ["gluten", "lácteos"],
  },
  {
    id: "bolon-mixto",
    name: "Bolón Mixto",
    description:
      "Bolón de verde con relleno doble: queso fresco y carne mechada. La combinación perfecta.",
    finalPrice: 7,
    depositAmount: 1,
    available: true,
    allergens: ["gluten", "lácteos"],
  },
  {
    id: "combo-verde",
    name: "Combo Verde",
    description:
      "Dos bolones a elegir + ají casero + bebida natural. Ideal para compartir o comer bien.",
    finalPrice: 13,
    depositAmount: 1,
    available: true,
    allergens: ["gluten", "lácteos"],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getAvailableProducts(): Product[] {
  return PRODUCTS.filter((p) => p.available);
}
