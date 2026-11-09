import { NextResponse } from "next/server";
import { availabilityWindow } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/availability  ->  { today, windowEnd, products: { [id]: { total, days: { "YYYY-MM-DD": livres } } } }
export async function GET() {
  return NextResponse.json(availabilityWindow(120), { headers: { "Cache-Control": "no-store" } });
}
