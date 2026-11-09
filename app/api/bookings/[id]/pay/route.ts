import { NextResponse } from "next/server";
import { payBooking } from "@/lib/store";
import { toDTO } from "@/lib/serialize";
import { notifyPaid } from "@/lib/notify";

export const dynamic = "force-dynamic";

// POST /api/bookings/:id/pay -> SIMULA o pagamento.
// Em produção: aqui só se cria a cobrança (Pix/cartão) no gateway, e quem muda
// a reserva para "paga" é o WEBHOOK do gateway (Mercado Pago / Stripe / Asaas).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const name = String(body?.customer?.name ?? "").trim();
  const phone = String(body?.customer?.phone ?? "").trim();
  const method = body?.method === "card" ? "card" : "pix";
  const email = String(body?.customer?.email ?? "").trim();
  if (name.length < 2 || phone.replace(/\D/g, "").length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Informe nome, WhatsApp e e-mail válidos." }, { status: 400 });
  }
  const result = payBooking(id, method, { name, phone, email });
  if (!result.ok) {
    const expired = result.reason === "expired";
    return NextResponse.json(
      { error: expired ? "O tempo da reserva expirou. Escolha as datas novamente." : "Reserva não encontrada." },
      { status: expired ? 410 : 404 },
    );
  }
  // Em produção este bloco roda no WEBHOOK do gateway, depois da confirmação do pagamento.
  if (!result.booking.notified) {
    result.booking.notified = true;
    await notifyPaid(result.booking).catch((e) => console.error("[notify] falhou", e));
  }
  return NextResponse.json(toDTO(result.booking));
}
