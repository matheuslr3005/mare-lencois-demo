"use client";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/fleet";
import { ADDONS } from "@/lib/fleet";
import type { BookingDTO } from "@/lib/types";
import { brl } from "@/lib/format";
import { fmtShort } from "@/lib/dates";
import { whatsappLink } from "@/lib/whatsapp";
import { FakeQR } from "./FakeQR";

type Props = {
  product: Product;
  start: string;
  end: string;
  days: number;
  qty: number;
  addons: string[];
  total: number;
  onBack: () => void;
  onPaid: (b: BookingDTO) => void;
  onChanged: () => void;
};

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

export function Checkout({ product, start, end, days, qty, addons, total, onBack, onPaid, onChanged }: Props) {
  const [hold, setHold] = useState<BookingDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const [method, setMethod] = useState<"pix" | "card">("pix");
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const holdId = useRef<string | null>(null);
  const done = useRef(false);

  // 1) Ao entrar no checkout, trava as unidades por 10 min (hold) no servidor.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, start, end, quantity: qty, addons }),
      });
      const json = await res.json();
      if (cancelled) {
        if (res.ok) fetch(`/api/bookings/${json.id}`, { method: "DELETE" });
        return;
      }
      if (!res.ok) return setError(json.error ?? "Não foi possível reservar.");
      holdId.current = json.id;
      setHold(json);
      onChanged();
    })();
    return () => {
      cancelled = true;
      if (holdId.current && !done.current) fetch(`/api/bookings/${holdId.current}`, { method: "DELETE" }).then(onChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hold?.expiresAt) return;
    const tick = () => setLeft(hold.expiresAt! - Date.now());
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [hold]);

  const expired = !!hold && left <= 0;
  const valid = form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim());

  const pay = async () => {
    if (!hold || !valid || paying) return;
    setPaying(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 1400)); // simula a aprovação do gateway
    const res = await fetch(`/api/bookings/${hold.id}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, customer: { ...form, email: form.email.trim() } }),
    });
    const json = await res.json();
    setPaying(false);
    if (!res.ok) return setError(json.error ?? "Falha no pagamento.");
    done.current = true;
    onPaid(json);
  };

  const pixCode = `00020126580014BR.GOV.BCB.PIX0136demo-mare-lencois-${hold?.id ?? "0000"}5204000053039865406${total}.005802BR5912MARE LENCOIS6009SAO LUIS62070503***6304DEMO`;
  const extras = ADDONS.filter((a) => addons.includes(a.id)).map((a) => a.name);

  if (error && !hold)
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-xl">
        <p className="text-5xl">😕</p>
        <p className="mt-4 text-xl font-bold text-deep">{error}</p>
        <button onClick={onBack} className="mt-6 rounded-full bg-coral px-7 py-3 font-bold text-white">Escolher outras datas</button>
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="relative rounded-3xl bg-white p-6 shadow-xl md:p-8">
        {expired && (
          <div className="absolute inset-0 z-20 grid place-items-center rounded-3xl bg-white/95 p-8 text-center">
            <div>
              <p className="font-display text-2xl font-extrabold text-deep">O tempo da reserva acabou ⏳</p>
              <p className="mt-2 text-ink/70">Liberamos o veículo para outros clientes. Escolha novamente.</p>
              <button onClick={onBack} className="mt-6 rounded-full bg-coral px-7 py-3 font-bold text-white">Voltar às datas</button>
            </div>
          </div>
        )}
        <button onClick={onBack} className="text-sm font-bold text-lagoon hover:underline">← Voltar</button>
        <h3 className="mt-3 text-3xl font-extrabold text-deep">Seus dados e pagamento</h3>

        <div className="mt-5 flex items-center gap-3 rounded-2xl bg-sun/25 px-4 py-3 text-sm font-semibold text-deep">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-sun text-base">⏱</span>
          {hold ? <>Veículo reservado para você por <b className="tabular-nums">{mmss(left)}</b></> : "Reservando o veículo…"}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-deep sm:col-span-2">Nome completo
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 font-medium outline-none transition focus:border-lagoon" placeholder="Maria Souza" autoComplete="name" />
          </label>
          <label className="block text-sm font-bold text-deep">WhatsApp
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 font-medium outline-none transition focus:border-lagoon" placeholder="(98) 99999-0000" inputMode="tel" autoComplete="tel" />
          </label>
          <label className="block text-sm font-bold text-deep">E-mail (receberá o voucher)
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 font-medium outline-none transition focus:border-lagoon" placeholder="voce@email.com" type="email" autoComplete="email" />
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2 rounded-2xl bg-sand p-1.5">
          {(["pix", "card"] as const).map((m) => (
            <button key={m} onClick={() => setMethod(m)} className={`rounded-xl py-3 font-bold transition ${method === m ? "bg-white text-deep shadow" : "text-ink/50"}`}>
              {m === "pix" ? "Pix · aprovação na hora" : "Cartão de crédito"}
            </button>
          ))}
        </div>

        {method === "pix" ? (
          <div className="mt-6 flex flex-col items-center gap-5 sm:flex-row">
            <FakeQR seed={hold?.id ?? "x"} />
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-semibold text-deep">Escaneie o QR Code ou use o Pix copia e cola:</p>
              <p className="mt-2 line-clamp-2 break-all rounded-xl bg-sand p-3 font-mono text-xs text-ink/60">{pixCode}</p>
              <button onClick={() => { navigator.clipboard?.writeText(pixCode); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="mt-2 font-bold text-lagoon hover:underline">
                {copied ? "Copiado ✓" : "Copiar código"}
              </button>
              <p className="mt-3 text-xs text-ink/50">QR ilustrativo. Em produção, o gateway gera o código real e avisa o site automaticamente quando o Pix cair.</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input className="rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 sm:col-span-2" placeholder="Número do cartão (demo)" inputMode="numeric" aria-label="Número do cartão" />
            <input className="rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3" placeholder="Validade" aria-label="Validade" />
            <input className="rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3" placeholder="CVV" aria-label="CVV" />
            <p className="text-xs text-ink/50 sm:col-span-2">Campos meramente visuais: nada é enviado ou armazenado nesta demonstração.</p>
          </div>
        )}

        {error && <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral">{error}</p>}

        <button onClick={pay} disabled={!valid || !hold || paying || expired} className="mt-6 w-full rounded-full bg-palm py-4 text-lg font-extrabold text-white shadow-xl shadow-palm/30 transition hover:bg-[#139058] disabled:cursor-not-allowed disabled:opacity-40">
          {paying ? "Processando pagamento…" : method === "pix" ? `Simular pagamento Pix · ${brl(total)}` : `Simular pagamento · ${brl(total)}`}
        </button>
        <p className="mt-3 text-center text-xs font-semibold text-ink/50">🔒 Ambiente de demonstração — nenhum pagamento real é feito.</p>
      </div>

      <aside className="h-fit rounded-3xl bg-deep p-7 text-white shadow-xl lg:sticky lg:top-24">
        <p className="text-sm font-bold uppercase tracking-widest text-sun">Resumo</p>
        <p className="mt-3 font-display text-2xl font-extrabold">{qty}x {product.name}</p>
        <p className="mt-1 text-white/70">{start === end ? fmtShort(start) : `${fmtShort(start)} → ${fmtShort(end)}`} · {days} {days > 1 ? "diárias" : "diária"}</p>
        {extras.length > 0 && <p className="mt-2 text-sm text-white/70">+ {extras.join(", ")}</p>}
        <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5">
          <span className="text-white/70">Total</span>
          <span className="font-display text-4xl font-extrabold text-sun">{brl(total)}</span>
        </div>
        <a href={whatsappLink({ product: product.name, start, end, quantity: qty, addons, total: brl(total), name: form.name || undefined })} target="_blank" rel="noreferrer" className="mt-6 block rounded-full bg-white/10 py-3 text-center text-sm font-bold ring-1 ring-white/30 transition hover:bg-white/20">
          Prefiro finalizar pelo WhatsApp
        </a>
      </aside>
    </div>
  );
}
