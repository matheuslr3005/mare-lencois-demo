"use client";
import { PRODUCTS } from "@/lib/fleet";
import { brl } from "@/lib/format";
import { useAvailability } from "./AvailabilityProvider";

export function Fleet() {
  const { data } = useAvailability();

  const pick = (id: string) => {
    window.dispatchEvent(new CustomEvent("select-product", { detail: id }));
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="frota" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-coral">Nossa frota</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-deep md:text-6xl">Escolha como atravessar o paraíso.</h2>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p, i) => {
          const free = data?.products[p.id]?.days[data.today];
          return (
            <article
              key={p.id}
              className="group relative flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_-12px_rgba(6,48,63,.25)] transition duration-300 hover:-translate-y-2 hover:shadow-[0_24px_60px_-12px_rgba(6,48,63,.35)]"
              style={{ transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-sandy">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.photo} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: p.focus }} />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-deep/40 to-transparent" />
                {p.badge && <span className="absolute left-4 top-4 rounded-full bg-deep px-3 py-1 text-xs font-bold text-sun shadow-lg">{p.badge}</span>}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-extrabold text-deep">{p.name}</h3>
                <p className="mt-1.5 text-[15px] text-ink/70">{p.tagline}</p>
                <ul className="mt-4 space-y-1.5 text-sm font-medium text-ink/80">
                  {p.specs.map((s) => (
                    <li key={s} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
                      {s}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <p className="text-sm text-ink/60">
                    {free === undefined ? "…" : free === 0 ? <span className="font-bold text-coral">Esgotado hoje</span> : <><b className="text-palm">{free}</b> de {p.units} livres hoje</>}
                  </p>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="font-display text-3xl font-extrabold text-deep">
                      {brl(p.price)}<span className="text-sm font-medium text-ink/50"> /dia</span>
                    </p>
                    <button onClick={() => pick(p.id)} className="rounded-full bg-deep px-5 py-2.5 text-sm font-bold text-white transition hover:bg-coral">
                      Ver datas
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
