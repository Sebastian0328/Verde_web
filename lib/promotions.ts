import type { Settings } from "./google-sheets";

export interface ActivePromotion {
  isActive: boolean;
  promoName: string;
  promoType: "percentage";
  promoValue: number;
  inactiveReason?: string;
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

// Normalizes date strings from Google Sheets to "YYYY-MM-DD" regardless of locale.
// Handles: ISO (2026-05-14), EU/Spanish (14/05/2026), US (5/14/2026).
export function normalizeSheetDate(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim();
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // D(D)/M(M)/YYYY — could be EU (day first) or US (month first)
  const parts = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (parts) {
    const a = parseInt(parts[1], 10);
    const b = parseInt(parts[2], 10);
    const y = parts[3];
    // a > 12 → cannot be month → DD/MM/YYYY (EU: "14/05/2026")
    if (a > 12 && b >= 1 && b <= 12) {
      return `${y}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
    }
    // b > 12 → cannot be month → MM/DD/YYYY (US: "5/14/2026")
    if (b > 12 && a >= 1 && a <= 12) {
      return `${y}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    }
    // Ambiguous (e.g. 5/6/2026) — default to EU (DD/MM) since locale is Spain
    if (a >= 1 && a <= 31 && b >= 1 && b <= 12) {
      return `${y}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
    }
  }
  return null;
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

  const today = new Date().toISOString().slice(0, 10);
  const startNormalized = normalizeSheetDate(settings.promoStartDate ?? "");
  const endNormalized   = normalizeSheetDate(settings.promoEndDate ?? "");

  // Normalize promoEnabled — accepts boolean true, "TRUE", "true", etc.
  const enabled = String(settings.promoEnabled).trim().toLowerCase() === "true";

  console.log("[promotions] promoEnabled raw:", settings.promoEnabled, "→ enabled:", enabled);
  console.log("[promotions] promoName:", settings.promoName);
  console.log("[promotions] promoType:", settings.promoType);
  console.log("[promotions] promoValue:", settings.promoValue);
  console.log("[promotions] promoStartDate raw:", settings.promoStartDate, "→ normalized:", startNormalized);
  console.log("[promotions] promoEndDate raw:", settings.promoEndDate, "→ normalized:", endNormalized);
  console.log("[promotions] today:", today);

  if (!enabled) {
    console.log("[promotions] isPromoActive: false → promo disabled");
    return { ...base, inactiveReason: "promo disabled" };
  }

  if (!settings.promoName || !settings.promoName.trim()) {
    console.log("[promotions] isPromoActive: false → missing promoName");
    return { ...base, inactiveReason: "missing promoName" };
  }

  if (settings.promoType !== "percentage") {
    console.log("[promotions] isPromoActive: false → invalid type:", settings.promoType);
    return { ...base, inactiveReason: "invalid type" };
  }

  if (!settings.promoValue || settings.promoValue <= 0 || settings.promoValue > 100) {
    console.warn("[promotions] isPromoActive: false → invalid value:", settings.promoValue);
    return { ...base, inactiveReason: "invalid value" };
  }

  if (startNormalized && today < startNormalized) {
    console.log(`[promotions] isPromoActive: false → before start date (today ${today} < start ${startNormalized})`);
    return { ...base, inactiveReason: "before start date" };
  }

  if (endNormalized && today > endNormalized) {
    console.log(`[promotions] isPromoActive: false → after end date (today ${today} > end ${endNormalized})`);
    return { ...base, inactiveReason: "after end date" };
  }

  console.log("[promotions] isPromoActive: true →", settings.promoName, settings.promoValue + "%");
  return { ...base, isActive: true, inactiveReason: undefined };
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
  const subtotalCents  = Math.round(subtotal * 100);
  const discountCents  = Math.round(subtotalCents * promo.promoValue / 100);
  const totalCents     = Math.max(0, subtotalCents - discountCents);

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
