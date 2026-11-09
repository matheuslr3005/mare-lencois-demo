"use client";
import { useState } from "react";
import { addDays, fmtMonth, parseISO, toISO } from "@/lib/dates";

type Props = {
  today: string;
  windowEnd: string;
  counts: Record<string, number>;
  qty: number;
  start: string | null;
  end: string | null;
  color: string;
  onPick: (iso: string) => void;
};

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

function Month({ base, ...p }: Props & { base: Date }) {
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const dim = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const cells: (string | null)[] = [...Array(first.getDay()).fill(null), ...Array.from({ length: dim }, (_, i) => toISO(new Date(base.getFullYear(), base.getMonth(), i + 1)))];

  return (
    <div className="min-w-0 flex-1">
      <p className="mb-3 text-center font-display text-lg font-bold text-deep">{fmtMonth(first)}</p>
      <div className="grid grid-cols-7 text-center text-xs font-bold text-ink/40">{WEEK.map((w, i) => <span key={i} className="py-1">{w}</span>)}</div>
      <div className="grid grid-cols-7">
        {cells.map((iso, i) => {
          if (!iso) return <span key={i} />;
          const n = p.counts[iso];
          const known = n !== undefined && iso >= p.today && iso <= p.windowEnd;
          const soldOut = known && n < p.qty;
          const disabled = !known || soldOut;
          const isStart = iso === p.start;
          const isEnd = iso === p.end;
          const inRange = !!p.start && !!p.end && iso > p.start && iso < p.end;
          const sel = isStart || isEnd;
          return (
            <button
              key={iso}
              disabled={disabled}
              onClick={() => p.onPick(iso)}
              title={soldOut ? "Esgotado" : known ? `${n} livre(s)` : ""}
              aria-label={`${parseISO(iso).getDate()} ${soldOut ? "esgotado" : known ? `${n} disponíveis` : "indisponível"}`}
              className={`relative flex h-11 flex-col items-center justify-center text-[15px] font-semibold transition
                ${sel ? "z-10 rounded-full text-white shadow-lg" : inRange ? "bg-coral/15 text-deep" : ""}
                ${isStart && p.end ? "rounded-r-none" : ""} ${isEnd ? "rounded-l-none" : ""}
                ${disabled ? "cursor-not-allowed text-ink/25" : !sel ? "rounded-full text-deep hover:bg-lagoon-soft" : ""}`}
              style={sel ? { background: p.color } : undefined}
            >
              <span className={soldOut ? "line-through decoration-coral/70 decoration-2" : ""}>{parseISO(iso).getDate()}</span>
              {known && !soldOut && !sel && (
                <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${n - p.qty < 2 ? "bg-sun" : "bg-palm"}`} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Calendar(props: Props) {
  const [offset, setOffset] = useState(0);
  const t = parseISO(props.today);
  const m0 = new Date(t.getFullYear(), t.getMonth() + offset, 1);
  const m1 = new Date(t.getFullYear(), t.getMonth() + offset + 1, 1);
  const lastOffset = (parseISO(props.windowEnd).getFullYear() - t.getFullYear()) * 12 + parseISO(props.windowEnd).getMonth() - t.getMonth();

  return (
    <div>
      <div className="relative">
        <button onClick={() => setOffset(Math.max(0, offset - 1))} disabled={offset === 0} aria-label="Mês anterior" className="absolute left-0 top-0 z-10 grid h-9 w-9 place-items-center rounded-full bg-sand text-deep transition hover:bg-sandy disabled:opacity-30">‹</button>
        <button onClick={() => setOffset(Math.min(lastOffset - 1, offset + 1))} disabled={offset >= lastOffset - 1} aria-label="Próximo mês" className="absolute right-0 top-0 z-10 grid h-9 w-9 place-items-center rounded-full bg-sand text-deep transition hover:bg-sandy disabled:opacity-30">›</button>
        <div className="flex gap-8 px-10">
          <Month {...props} base={m0} />
          <div className="hidden min-w-0 flex-1 md:block"><Month {...props} base={m1} /></div>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold text-ink/60">
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-palm" />Disponível</span>
        <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sun" />Últimas unidades</span>
        <span className="flex items-center gap-1.5"><s className="decoration-coral decoration-2">12</s>Esgotado</span>
      </div>
    </div>
  );
}

export { addDays };
