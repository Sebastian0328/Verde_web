import { NextResponse } from "next/server";
import { getSettings } from "@/lib/google-sheets";
import { getActivePromotion } from "@/lib/promotions";

export const dynamic = "force-dynamic";

// GET /api/promotion
// Public endpoint — returns active promotion data and diagnostic raw values.
// Does not expose credentials or secrets.
export async function GET() {
  try {
    const settings = await getSettings();
    const promo = getActivePromotion(settings);

    return NextResponse.json({
      // Raw parsed values from Google Sheets (for diagnosis)
      rawPromoEnabled: settings.promoEnabled,
      rawPromoName:    settings.promoName,
      rawPromoType:    settings.promoType,
      rawPromoValue:   settings.promoValue,
      rawStartDate:    settings.promoStartDate,
      rawEndDate:      settings.promoEndDate,
      // Promotion result
      isActive:        promo.isActive,
      promoName:       promo.promoName,
      promoType:       promo.promoType,
      promoValue:      promo.promoValue,
      inactiveReason:  promo.inactiveReason ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
