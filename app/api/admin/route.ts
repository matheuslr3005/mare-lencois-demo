import { NextResponse } from "next/server";
import { PRODUCTS } from "@/lib/fleet";
import { availabilityWindow, getStore, isActive } from "@/lib/store";
import { addDays, eachDay } from "@/lib/dates";
import { toDTO } from "@/lib/serialize";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const { today, products } = availabilityWindow(30);
  const now = Date.now();
  const all = getStore().bookings.filter((b) => b.status !== "cancelled" && isActive(b, now));
  const recent = [...getStore().bookings]
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 25)
    .map((b) => ({ ...toDTO(b), createdAt: b.createdAt, source: b.source, active: isActive(b, now) }));
  const horizon = addDays(today, 30);
  const paid = all.filter((b) => b.status === "paid" && b.start <= horizon);
  return NextResponse.json({
    today,
    kpis: {
      paid: paid.length,
      holds: all.filter((b) => b.status === "hold").length,
      revenue: paid.reduce((s, b) => s + b.total, 0),
    },
    fleet: PRODUCTS.map((p) => ({
      id: p.id,
      name: p.name,
      total: p.units,
      days: eachDay(today, addDays(today, 13)).map((d) => ({ day: d, free: products[p.id].days[d] })),
    })),
    recent,
    outbox: [...getStore().outbox].sort((a, b) => b.createdAt - a.createdAt).slice(0, 30),
  });
}
