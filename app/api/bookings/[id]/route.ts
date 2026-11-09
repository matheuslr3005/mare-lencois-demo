import { NextResponse } from "next/server";
import { cancelHold } from "@/lib/store";

export const dynamic = "force-dynamic";

// DELETE /api/bookings/:id -> libera a reserva temporária (cliente voltou/desistiu).
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  cancelHold(id);
  return NextResponse.json({ ok: true });
}
