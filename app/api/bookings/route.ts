import { NextResponse } from "next/server";
import { ADDONS, getProduct } from "@/lib/fleet";
import { diffDays, isISO, todayISO } from "@/lib/dates";
import { calcTotal } from "@/lib/pricing";
import { createHold } from "@/lib/store";
import { toDTO } from "@/lib/serialize";

export const dynamic = "force-dynamic";

// POST /api/bookings  -> cria uma reserva temporária (hold) de 10 min.
// A disponibilidade é REVALIDADA aqui no servidor: é isso que impede reserva dupla.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const product = getProduct(String(body?.productId));
  const { start, end } = body ?? {};
  const quantity = Number(body?.quantity);
  if (!product || !isISO(start) || !isISO(end) || end < start || start < todayISO() || !(quantity >= 1 && quantity <= product.units)) {
    return NextResponse.json({ error: "Dados da reserva inválidos." }, { status: 400 });
  }
  const addons: string[] = Array.isArray(body.addons) ? body.addons.filter((a: string) => ADDONS.some((x) => x.id === a)) : [];
  const days = diffDays(start, end) + 1;
  const { total } = calcTotal(product, days, quantity, addons);

  const result = createHold({ productId: product.id, start, end, quantity, addons, total });
  if (!result.ok) {
    return NextResponse.json(
      { error: `Só restam ${result.free} unidade(s) de ${product.name} nessas datas.`, free: result.free },
      { status: 409 },
    );
  }
  return NextResponse.json(toDTO(result.booking), { status: 201 });
}
