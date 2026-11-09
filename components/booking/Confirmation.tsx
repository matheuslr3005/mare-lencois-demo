"use client";
import { ADDONS, getProduct } from "@/lib/fleet";
import { brl } from "@/lib/format";
import { fmtLong } from "@/lib/dates";
import { whatsappLink } from "@/lib/whatsapp";
import type { BookingDTO } from "@/lib/types";

export function Confirmation({ booking: b, onReset }: { booking: BookingDTO; onReset: () => void }) {
  const product = getProduct(b.productId)!;
  const extras = ADDONS.filter((a) => b.addons.includes(a.id)).map((a) => a.name);
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-palm text-4xl text-white shadow-xl shadow-palm/40">✓</div>
      <h3 className="mt-6 text-4xl font-extrabold text-deep md:text-5xl">Reserva confirmada!</h3>
      <p className="mt-3 text-lg text-ink/70">Obrigado, {b.customer?.name.split(" ")[0]}. Enviamos o voucher para <b className="text-deep">{b.customer?.email}</b> e para o seu WhatsApp.</p>

      <div className="relative mt-10 overflow-hidden rounded-3xl bg-white text-left shadow-2xl">
        <div className="flex items-center justify-between bg-deep px-7 py-4 text-white">
          <span className="font-display text-lg font-extrabold">Maré<span className="text-coral"> Lençóis</span></span>
          <span className="text-xs font-bold uppercase tracking-widest text-sun">Voucher</span>
        </div>
        <div className="grid gap-5 p-7 sm:grid-cols-2">
          <div><p className="text-xs font-bold uppercase text-ink/40">Veículo</p><p className="text-lg font-extrabold text-deep">{b.quantity}x {product.name}</p></div>
          <div><p className="text-xs font-bold uppercase text-ink/40">Código</p><p className="font-mono text-lg font-extrabold tracking-wider text-coral">{b.voucher}</p></div>
          <div><p className="text-xs font-bold uppercase text-ink/40">Retirada</p><p className="font-bold text-deep">{fmtLong(b.start)}</p></div>
          <div><p className="text-xs font-bold uppercase text-ink/40">Devolução</p><p className="font-bold text-deep">{fmtLong(b.end)}</p></div>
          {extras.length > 0 && <div className="sm:col-span-2"><p className="text-xs font-bold uppercase text-ink/40">Extras</p><p className="font-bold text-deep">{extras.join(", ")}</p></div>}
        </div>
        <div className="flex items-center justify-between border-t-2 border-dashed border-sandy bg-sand/60 px-7 py-4">
          <span className="text-sm font-semibold text-ink/60">Pago via {b.method === "pix" ? "Pix" : "cartão"}</span>
          <span className="font-display text-2xl font-extrabold text-deep">{brl(b.total)}</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={whatsappLink({ voucher: b.voucher, product: product.name, start: b.start, end: b.end, quantity: b.quantity, addons: b.addons, name: b.customer?.name })} target="_blank" rel="noreferrer" className="rounded-full bg-palm px-7 py-3.5 font-bold text-white shadow-lg shadow-palm/30 hover:bg-[#139058]">Falar com a equipe no WhatsApp</a>
        <button onClick={onReset} className="rounded-full bg-white px-7 py-3.5 font-bold text-deep ring-2 ring-deep/10 hover:ring-deep">Fazer outra reserva</button>
      </div>
      <p className="mt-6 text-sm text-ink/50">Não achou o e-mail? Olhe a caixa de spam ou fale com a gente pelo WhatsApp.</p>
    </div>
  );
}
