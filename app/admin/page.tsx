"use client";
import { useCallback, useEffect, useState } from "react";
import { getProduct } from "@/lib/fleet";
import { brl } from "@/lib/format";
import { fmtShort } from "@/lib/dates";
import { Logo } from "@/components/Logo";
import type { BookingDTO } from "@/lib/types";

type Message = {
  id: string; channel: "email" | "whatsapp"; audience: "cliente" | "lojista"; to: string; subject?: string;
  text: string; html?: string; link?: string; status: "simulado" | "enviado" | "falhou"; createdAt: number;
};
type Admin = {
  today: string;
  kpis: { paid: number; holds: number; revenue: number };
  fleet: { id: string; name: string; total: number; days: { day: string; free: number }[] }[];
  recent: (BookingDTO & { createdAt: number; source: string; active: boolean })[];
  outbox: Message[];
};

const hhmm = (t: number) => new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function Login({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    setBusy(false);
    if (res.ok) return onDone();
    setError((await res.json().catch(() => null))?.error ?? "Não foi possível entrar.");
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-deep to-[#0b4a5e] px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Logo />
        <h1 className="mt-6 text-2xl font-extrabold text-deep">Área do lojista</h1>
        <p className="mt-1 text-sm text-ink/60">Acesso restrito. Entre para ver reservas e pagamentos.</p>
        <label className="mt-6 block text-sm font-bold text-deep">E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="username" required className="mt-1.5 w-full rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 font-medium outline-none focus:border-lagoon" />
        </label>
        <label className="mt-4 block text-sm font-bold text-deep">Senha
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" required className="mt-1.5 w-full rounded-xl border-2 border-sandy bg-sand/50 px-4 py-3 font-medium outline-none focus:border-lagoon" />
        </label>
        {error && <p className="mt-4 rounded-xl bg-coral/10 px-4 py-3 text-sm font-semibold text-coral" role="alert">{error}</p>}
        <button disabled={busy} className="mt-6 w-full rounded-full bg-coral py-3.5 font-extrabold text-white shadow-lg shadow-coral/30 transition hover:bg-[#ff7a5f] disabled:opacity-50">{busy ? "Entrando…" : "Entrar"}</button>
        <a href="/" className="mt-4 block text-center text-sm font-semibold text-lagoon hover:underline">← Voltar ao site</a>
      </form>
    </div>
  );
}

function Outbox({ messages }: { messages: Message[] }) {
  const [open, setOpen] = useState<string | null>(null);
  if (!messages.length)
    return <p className="rounded-2xl bg-sand/70 p-6 text-center text-ink/60">Nenhuma notificação ainda. Faça uma reserva no site e acompanhe aqui o que o cliente e o dono recebem.</p>;
  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className="rounded-2xl border border-sandy bg-white">
          <button onClick={() => setOpen(open === m.id ? null : m.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold text-white ${m.channel === "email" ? "bg-lagoon" : "bg-[#25D366]"}`}>{m.channel === "email" ? "@" : "W"}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-extrabold text-deep">{m.channel === "email" ? "E-mail" : "WhatsApp"} para {m.audience === "cliente" ? "o cliente" : "o lojista"} · {m.to}</span>
              <span className="block truncate text-xs text-ink/60">{m.subject ?? m.text.split("\n")[0]}</span>
            </span>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${m.status === "enviado" ? "bg-palm/15 text-palm" : m.status === "falhou" ? "bg-coral/15 text-coral" : "bg-sun/30 text-deep"}`}>{m.status}</span>
            <span className="text-xs text-ink/40">{hhmm(m.createdAt)}</span>
          </button>
          {open === m.id && (
            <div className="border-t border-sandy p-4">
              {m.html ? (
                <iframe title={m.subject} sandbox="" srcDoc={m.html} className="h-[520px] w-full rounded-xl border border-sandy" />
              ) : (
                <pre className="whitespace-pre-wrap rounded-xl bg-[#e7ffdb] p-4 font-sans text-sm text-ink">{m.text}</pre>
              )}
              {m.link && <a href={m.link} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-lagoon hover:underline">Abrir no WhatsApp ↗</a>}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function AdminPage() {
  const [state, setState] = useState<"loading" | "login" | "ok">("loading");
  const [d, setD] = useState<Admin | null>(null);
  const [tab, setTab] = useState<"geral" | "notif">("geral");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin", { cache: "no-store" }).catch(() => null);
    if (!res) return;
    if (res.status === 401) {
      setD(null);
      return setState("login");
    }
    setD(await res.json());
    setState("ok");
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [load]);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setD(null);
    setState("login");
  };

  if (state === "loading") return <p className="p-10 text-ink/50">Carregando…</p>;
  if (state === "login" || !d) return <Login onDone={load} />;

  return (
    <div className="min-h-screen bg-sand">
      <header className="flex items-center justify-between gap-3 bg-deep px-6 py-4 text-white">
        <Logo light />
        <span className="hidden text-sm font-bold text-sun sm:block">Painel do lojista · atualiza sozinho</span>
        <span className="flex gap-2">
          <a href="/" className="rounded-full px-4 py-2 text-sm font-bold ring-1 ring-white/30 hover:bg-white/10">Ver site</a>
          <button onClick={logout} className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold hover:bg-white/25">Sair</button>
        </span>
      </header>
      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {[["Reservas pagas (30 dias)", String(d.kpis.paid)], ["Em checkout agora", String(d.kpis.holds)], ["Faturamento confirmado", brl(d.kpis.revenue)]].map(([l, v]) => (
            <div key={l} className="rounded-3xl bg-white p-6 shadow-md">
              <p className="text-sm font-bold text-ink/50">{l}</p>
              <p className="mt-1 font-display text-4xl font-extrabold text-deep">{v}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {([["geral", "Visão geral"], ["notif", `Notificações (${d.outbox.length})`]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${tab === k ? "bg-deep text-white" : "bg-white text-ink/60 hover:text-deep"}`}>{l}</button>
          ))}
        </div>

        {tab === "notif" ? (
          <section className="rounded-3xl bg-white p-6 shadow-md">
            <h2 className="text-2xl font-extrabold text-deep">Mensagens disparadas após cada pagamento</h2>
            <p className="mb-5 mt-1 text-sm text-ink/60">No demo os envios são simulados. Com as chaves reais, o e-mail ao cliente e os avisos por WhatsApp saem de verdade, com este mesmo conteúdo.</p>
            <Outbox messages={d.outbox} />
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-md">
              <h2 className="text-2xl font-extrabold text-deep">Estoque livre nos próximos 14 dias</h2>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[760px] border-separate border-spacing-1 text-center text-xs">
                  <thead>
                    <tr><th />{d.fleet[0].days.map((x) => <th key={x.day} className="pb-1 font-bold text-ink/50">{fmtShort(x.day).split(",")[0]}<br />{x.day.slice(8)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {d.fleet.map((p) => (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap pr-3 text-left text-sm font-bold text-deep">{p.name}</td>
                        {p.days.map((x) => {
                          const r = x.free / p.total;
                          return <td key={x.day} className="rounded-lg py-2 font-extrabold tabular-nums" style={{ background: x.free === 0 ? "#ff6a4d" : r < 0.4 ? "#ffc233" : "#bff0d6", color: x.free === 0 ? "#fff" : "#06303f" }}>{x.free}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink/50">Vermelho = esgotado · amarelo = poucas unidades.</p>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-md">
              <h2 className="text-2xl font-extrabold text-deep">Últimas reservas</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="text-xs uppercase text-ink/40"><tr><th className="py-2">Cliente</th><th>Contato</th><th>Veículo</th><th>Período</th><th>Valor</th><th>Status</th></tr></thead>
                  <tbody>
                    {d.recent.map((b) => (
                      <tr key={b.id} className={`border-t border-sandy/70 ${b.source === "site" ? "bg-lagoon-soft/50" : ""}`}>
                        <td className="py-3 font-bold text-deep">{b.customer?.name ?? "Cliente no checkout…"}{b.source === "site" && <span className="ml-2 rounded-full bg-lagoon px-2 py-0.5 text-[10px] text-white">NOVA</span>}</td>
                        <td className="text-xs text-ink/70">{b.customer?.phone}{b.customer?.email && <><br />{b.customer.email}</>}</td>
                        <td>{b.quantity}x {getProduct(b.productId)?.name}</td>
                        <td>{b.start === b.end ? fmtShort(b.start) : `${fmtShort(b.start)} → ${fmtShort(b.end)}`}</td>
                        <td className="font-bold">{brl(b.total)}</td>
                        <td>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold ${b.status === "paid" ? "bg-palm/15 text-palm" : b.active ? "bg-sun/30 text-deep" : "bg-ink/10 text-ink/50"}`}>
                            {b.status === "paid" ? `Pago · ${b.method === "pix" ? "Pix" : "Cartão"}` : b.active ? "Aguardando pagamento" : "Expirada"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
