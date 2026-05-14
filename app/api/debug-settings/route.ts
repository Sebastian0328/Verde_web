import { NextResponse } from "next/server";
import { getSettings, getSettingsRawRows } from "@/lib/google-sheets";
import { getActivePromotion, calculateDiscount } from "@/lib/promotions";

export const dynamic = "force-dynamic";

// GET /api/debug-settings
// Diagnoses exactly what Google Sheets is returning for each Settings key.
// Does not expose credentials or secrets.
export async function GET() {
  try {
    const [rawRows, settings] = await Promise.all([
      getSettingsRawRows(),
      getSettings(),
    ]);

    const promotion = getActivePromotion(settings);
    const previewDiscount = calculateDiscount(20, promotion);

    return NextResponse.json({
      rawSettingsRows: rawRows,
      settings: {
        promoEnabled:   settings.promoEnabled,
        promoName:      settings.promoName,
        promoType:      settings.promoType,
        promoValue:     settings.promoValue,
        promoStartDate: settings.promoStartDate,
        promoEndDate:   settings.promoEndDate,
      },
      promotion: {
        isActive:               promotion.isActive,
        inactiveReason:         promotion.inactiveReason ?? null,
        discountPreviewFor20:   previewDiscount.discountAmount,
        totalAfterDiscountFor20: previewDiscount.totalAfterDiscount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
