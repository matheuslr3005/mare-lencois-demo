// Datas como strings "YYYY-MM-DD" (sem fuso) para evitar bugs de timezone.
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s: string, n: number) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
};

export const eachDay = (start: string, end: string) => {
  const out: string[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
};

export const diffDays = (start: string, end: string) =>
  Math.round((parseISO(end).getTime() - parseISO(start).getTime()) / 86400000);

// "Hoje" no Maranhão (UTC-3), igual no servidor e no navegador.
export const todayISO = () => new Date(Date.now() - 3 * 3600 * 1000).toISOString().slice(0, 10);

export const nextWeekday = (from: string, weekday: number) => {
  let d = addDays(from, 1);
  while (parseISO(d).getDay() !== weekday) d = addDays(d, 1);
  return d;
};

export const isISO = (s: unknown): s is string => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const fmtShort = (s: string) =>
  parseISO(s).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(".", "").replace(".", "");

export const fmtLong = (s: string) =>
  parseISO(s).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });

export const fmtMonth = (d: Date) => cap(d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
