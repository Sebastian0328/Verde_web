import { NextResponse } from "next/server";
import { getAvailabilityDays } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const days = await getAvailabilityDays();
    return NextResponse.json(days);
  } catch (error) {
    console.error("[availability]", error);
    return NextResponse.json([]);
  }
}
