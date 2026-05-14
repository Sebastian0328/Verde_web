import type { Settings } from "./google-sheets";

export interface ActivePromotion {
  isActive: boolean;
  promoName: string;
  promoType: "percentage";
  promoValue: number;
}

export interface DiscountResult {
  isActive: boolean;
  promoName: string;
  promoType: string;
  promoValue: number;
  discountAmount: number;
  subtotalBeforeDiscount: number;
  totalAfterDiscount: number;
}

// Para activar/desactivar:  Settings → promoEnabled = TRUE / FALSE
// Para cambiar porcentaje:  Settings → promoValue = 15
// Para cambiar fechas:      Settings → promoStartDate / promoEndDate
export function getActivePromotion(settings: Settings): ActivePromotion {
  const base: ActivePromotion = {
    isActive: false,
    promoName: settings.promoName ?? "",
    promoType: "percentage",
    promoValue: settings.promoValue ?? 0,
  };

  if (!settings.promoEnabled) return base;

  const today = new Date().toISOString().slice(0, 10);
  if (settings.promoStartDate && today < settings.promoStartDate) return base;
  if (settings.promoEndDate && today > settings.promoEndDate) return base;

  if (!settings.promoValue || settings.promoValue <= 0 || settings.promoValue > 100) {
    console.warn("[promotions] promoValue fuera de rango:", settings.promoValue);
    return base;
  }

  return { ...base, isActive: true };
}

export function calculateDiscount(subtotal: number, promo: ActivePromotion): DiscountResult {
  const base: DiscountResult = {
    isActive: false,
    promoName: promo.promoName,
    promoType: promo.promoType,
    promoValue: promo.promoValue,
    discountAmount: 0,
    subtotalBeforeDiscount: subtotal,
    totalAfterDiscount: subtotal,
  };

  if (!promo.isActive || subtotal <= 0) return base;

  // Integer cents to avoid floating-point drift
  const subtotalCents = Math.round(subtotal * 100);
  const discountCents = Math.round(subtotalCents * promo.promoValue / 100);
  const totalCents = Math.max(0, subtotalCents - discountCents);

  return {
    isActive: true,
    promoName: promo.promoName,
    promoType: promo.promoType,
    promoValue: promo.promoValue,
    discountAmount: discountCents / 100,
    subtotalBeforeDiscount: subtotalCents / 100,
    totalAfterDiscount: totalCents / 100,
  };
}
