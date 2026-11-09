"use client";
import { useEffect, useMemo, useState } from "react";
import { ADDONS, PRODUCTS, ProductId, getProduct } from "@/lib/fleet";
import { brl } from "@/lib/format";
import { calcTotal } from "@/lib/pricing";
import { diffDays, eachDay, fmtShort } from "@/lib/dates";
import { whatsappLink } from "@/lib/whatsapp";
import type { BookingDTO } from "@/lib/types";
import { useAvailability } from "../AvailabilityProvider";
import { Calendar } from "./Calendar";
import { Checkout } from "./Checkout";
import { Confirmation } from "./Confirmation";

export function BookingSection() {
  const { data, refresh } = useAvailability();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [productId, setProductId] = useState<ProductId>("quadri-4x4");
  const [qty, setQty] = useState(1);
  const [range, setRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });
  const [addons, setAddons] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [paid, setPaid] = useState<BookingDTO | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      setProductId((e as CustomEvent<ProductId>).detail);
      setQty(1);
    };
    window.addEventListener("select-product", on);
    return () => window.removeEventListener("select-product", on);
  }, []);

  const product = getProduct(productId)!;
  const counts = data?.products[productId]?.days ?? {};
  const { start, end } = range;
  const complete = !!start && !!end;
  const days = complete ? diffDays(start!, end!) + 1 : 0;

  const freeFor = (pid: ProductId) => {
    if (!complete || !data) return null;
    return Math.min(...eachDay(start!, end!).map((d) => data.products[pid].days[d] ?? 0));
  };
  const freeNow = freeFor(productId);
  const valid = complete && (freeNow ?? 0) >= qty;
  const price = useMemo(() => calcTotal(product, days || 1, qty, addons), [product, days, qty, addons]);

  const pick = (iso: string) => {
    setNotice(null);
    if (!start || end) return setRange({ start: iso, end: null });
    if (iso < start) return setRange({ start: iso, end: null });
    const blocked = eachDay(start, iso).some((d) => (counts[d] ?? 0) < qty);
    if (blocked) {
      setNotice("Há dias esgotados nesse intervalo. Escolha outra data de volta.");
      return setRange({ start: iso, end: null });
    }
    setRange({ start, end: iso });
  };

  const reset = () => {
    setStep(1);
    setPaid(null);
    setRange({ start: null, end: null });
    setAddons([]);
    setQty(1);
    refresh();
  };

  return (
    <section id="reservar" className="relative overflow-hidden bg-gradient-to-b from-lagoon-soft via-[#e6f9f6] to-sand py-24">
      <div className="mx-auto max-w-6xl px-5">
        <p className="text-sm font-bold uppercase tracking-widest text-lagoon">Reserva online</p>
        <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-deep md:text-6xl">Escolha a data. A gente mostra o que está livre.</h2>

        <ol className="mt-10 flex gap-2 text-sm font-bold">
          {["Datas e veículo", "Dados e pagamento", "Confirmado"].map((l, i) => (
            <li key={l} className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${step === i + 1 ? "bg-deep text-white" : step > i + 1 ? "bg-palm/15 text-palm" : "bg-white/70 text-ink/40"}`}>
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-xs">{step > i + 1 ? "✓" : i + 1}</span>
              <span className="hidden sm:inline">{l}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          {step === 3 && paid ? (
            <Confirmation booking={paid} onReset={reset} />
          ) : step === 2 && valid ? (
            <Checkout
              product={product} start={start!} end={end!} days={days} qty={qty} addons={addons} total={price.total}
              onBack={() => { setStep(1); refresh(); }}
              onPaid={(b) => { setPaid(b); setStep(3); refresh(); }}
              onChanged={refresh}
            />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                {/* 1. veículo */}
                <div className="rounded-3xl bg-white p-5 shadow-xl md:p-6">
                  <p className="mb-4 font-display text-lg font-bold text-deep">1. Qual veículo?</p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {PRODUCTS.map((p) => {
                      const f = freeFor(p.id);
                      const on = p.id === productId;
                      return (
                        <button key={p.id} onClick={() => { setProductId(p.id); setQty(1); }} aria-pressed={on}
                          className={`overflow-hidden rounded-2xl border-2 p-1.5 text-left transition ${on ? "border-deep bg-sandy/60 shadow-lg" : "border-transparent bg-sand/60 hover:border-sandy"}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.photo} alt="" loading="lazy" className={`aspect-[4/3] w-full rounded-xl object-cover transition ${on ? "" : "opacity-80 saturate-75"}`} style={{ objectPosition: p.focus }} />
                          <p className="mt-2 px-1 text-sm font-extrabold leading-tight text-deep">{p.name}</p>
                          <p className="px-1 text-xs font-semibold text-ink/60">{brl(p.price)}/dia</p>
                          <p className={`mt-1 px-1 pb-1 text-xs font-bold ${f === null ? "text-ink/40" : f === 0 ? "text-coral" : "text-palm"}`}>
                            {f === null ? "Escolha as datas" : f === 0 ? "Esgotado nas datas" : `${f} livre${f > 1 ? "s" : ""}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. datas */}
                <div className="rounded-3xl bg-white p-5 shadow-xl md:p-7">
                  <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-display text-lg font-bold text-deep">2. Quais datas?</p>
                    <p className="text-sm font-semibold text-ink/60">
                      {!start ? "Toque no dia de retirada" : !end ? "Agora toque no último dia" : `${fmtShort(start)} → ${fmtShort(end)} · ${days} ${days > 1 ? "diárias" : "diária"}`}
                    </p>
                  </div>
                  {data ? (
                    <Calendar today={data.today} windowEnd={data.windowEnd} counts={counts} qty={qty} start={start} end={end} color={product.color} onPick={pick} />
                  ) : (
                    <div className="grid h-64 place-items-center text-ink/40">Carregando disponibilidade…</div>
                  )}
                  {notice && <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral" role="status">{notice}</p>}
                </div>
              </div>

              {/* resumo */}
              <aside className="h-fit space-y-5 rounded-3xl bg-deep p-7 text-white shadow-xl lg:sticky lg:top-24">
                <p className="text-sm font-bold uppercase tracking-widest text-sun">Sua reserva</p>
                <div>
                  <p className="font-display text-2xl font-extrabold">{product.name}</p>
                  <p className="text-sm text-white/60">{product.specs.join(" · ")}</p>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm font-semibold">Quantidade</span>
                  <span className="flex items-center gap-4">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-lg hover:bg-white/30" aria-label="Menos">−</button>
                    <b className="w-4 text-center text-lg tabular-nums">{qty}</b>
                    <button onClick={() => setQty(Math.min(product.units, qty + 1))} className="grid h-8 w-8 place-items-center rounded-full bg-white/15 text-lg hover:bg-white/30" aria-label="Mais">+</button>
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-white/70">Extras</p>
                  {ADDONS.map((a) => (
                    <label key={a.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 transition hover:bg-white/10">
                      <input type="checkbox" className="h-4 w-4 accent-[#FFC233]" checked={addons.includes(a.id)} onChange={() => setAddons(addons.includes(a.id) ? addons.filter((x) => x !== a.id) : [...addons, a.id])} />
                      <span className="flex-1 text-sm font-semibold">{a.name}</span>
                      <span className="text-xs text-white/60">{brl(a.price)}/{a.per}</span>
                    </label>
                  ))}
                </div>

                <div className="border-t border-white/15 pt-5">
                  <div className="flex items-end justify-between">
                    <span className="text-white/70">{complete ? `${days} ${days > 1 ? "diárias" : "diária"} × ${qty}` : "Total"}</span>
                    <span className="font-display text-4xl font-extrabold text-sun">{complete ? brl(price.total) : "—"}</span>
                  </div>
                  {complete && !valid && <p className="mt-3 text-sm font-semibold text-coral">Só {freeNow} disponível nessas datas. Reduza a quantidade ou mude as datas.</p>}
                </div>

                <button onClick={() => setStep(2)} disabled={!valid} className="w-full rounded-full bg-coral py-4 text-lg font-extrabold shadow-xl shadow-coral/30 transition hover:bg-[#ff7a5f] disabled:cursor-not-allowed disabled:bg-white/15 disabled:shadow-none disabled:text-white/40">
                  {valid ? "Continuar para o pagamento" : "Escolha as datas"}
                </button>
                <a href={whatsappLink({ product: product.name, start, end: end ?? start, quantity: qty, addons, total: complete ? brl(price.total) : undefined })} target="_blank" rel="noreferrer"
                  className="block rounded-full py-3 text-center text-sm font-bold ring-1 ring-white/30 transition hover:bg-white/10">
                  Prefiro falar com um atendente no WhatsApp
                </a>
              </aside>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
