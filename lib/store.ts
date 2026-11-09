// "Banco de dados" em memória, só para a demonstração.
// Em produção, estas funções viram queries no Postgres/Supabase com a mesma lógica:
// uma reserva ocupa uma unidade de veículo num intervalo de datas.
import { randomBytes } from "node:crypto";
import { PRODUCTS, ProductId, getProduct, unitIdsOf } from "./fleet";
import { addDays, eachDay, nextWeekday, todayISO } from "./dates";
import { HOLD_MINUTES } from "./pricing";

export type StoredBooking = {
  id: string;
  productId: ProductId;
  unitIds: string[];
  start: string; // primeiro dia (inclusivo)
  end: string; // último dia (inclusivo)
  quantity: number;
  addons: string[];
  total: number;
  status: "hold" | "paid" | "cancelled";
  expiresAt?: number;
  voucher?: string;
  method?: "pix" | "card";
  customer?: { name: string; phone: string; email?: string };
  createdAt: number;
  source: "site" | "demo";
  notified?: boolean;
};

export type OutboxMessage = {
  id: string;
  channel: "email" | "whatsapp";
  audience: "cliente" | "lojista";
  to: string;
  subject?: string;
  text: string;
  html?: string;
  link?: string;
  status: "simulado" | "enviado" | "falhou";
  bookingId: string;
  createdAt: number;
};

type Store = { bookings: StoredBooking[]; seq: number; outbox: OutboxMessage[] };
const g = globalThis as unknown as { __mareStore?: Store };

export const getStore = (): Store => {
  const store = (g.__mareStore ??= seed());
  store.outbox ??= [];
  return store;
};

const mulberry32 = (a: number) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const isActive = (b: StoredBooking, now = Date.now()) =>
  b.status === "paid" || (b.status === "hold" && (b.expiresAt ?? 0) > now);

const overlaps = (b: StoredBooking, start: string, end: string) => b.start <= end && b.end >= start;

/** Unidades livres do produto em TODOS os dias do intervalo. */
export function freeUnitIds(productId: ProductId, start: string, end: string, now = Date.now()) {
  const product = getProduct(productId);
  if (!product) return [];
  const busy = new Set<string>();
  for (const b of getStore().bookings) {
    if (b.productId === productId && isActive(b, now) && overlaps(b, start, end)) b.unitIds.forEach((u) => busy.add(u));
  }
  return unitIdsOf(product).filter((u) => !busy.has(u));
}

/** Quantas unidades estão livres em cada dia da janela. */
export function availabilityWindow(days = 120) {
  const today = todayISO();
  const windowEnd = addDays(today, days - 1);
  const now = Date.now();
  const active = getStore().bookings.filter((b) => isActive(b, now) && b.end >= today);
  const products = {} as Record<ProductId, { total: number; days: Record<string, number> }>;
  for (const p of PRODUCTS) {
    const map: Record<string, number> = {};
    for (const day of eachDay(today, windowEnd)) map[day] = p.units;
    for (const b of active) {
      if (b.productId !== p.id) continue;
      for (const day of eachDay(b.start < today ? today : b.start, b.end > windowEnd ? windowEnd : b.end)) {
        map[day] = Math.max(0, map[day] - b.unitIds.length);
      }
    }
    products[p.id] = { total: p.units, days: map };
  }
  return { today, windowEnd, products };
}

export function createHold(input: {
  productId: ProductId;
  start: string;
  end: string;
  quantity: number;
  addons: string[];
  total: number;
}) {
  const free = freeUnitIds(input.productId, input.start, input.end);
  if (free.length < input.quantity) return { ok: false as const, free: free.length };
  const store = getStore();
  const booking: StoredBooking = {
    id: `bk_${randomBytes(9).toString("base64url")}`, // imprevisível: ninguém adivinha a reserva de outro
    ...input,
    unitIds: free.slice(0, input.quantity),
    status: "hold",
    expiresAt: Date.now() + HOLD_MINUTES * 60_000,
    createdAt: Date.now(),
    source: "site",
  };
  store.bookings.push(booking);
  return { ok: true as const, booking };
}

const voucherCode = () => `MRL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export function payBooking(id: string, method: "pix" | "card", customer: StoredBooking["customer"]) {
  const booking = getStore().bookings.find((b) => b.id === id);
  if (!booking) return { ok: false as const, reason: "not_found" as const };
  if (booking.status === "paid") return { ok: true as const, booking };
  if (booking.status !== "hold" || (booking.expiresAt ?? 0) <= Date.now()) {
    booking.status = "cancelled";
    return { ok: false as const, reason: "expired" as const };
  }
  booking.status = "paid";
  booking.method = method;
  booking.customer = customer;
  booking.voucher = voucherCode();
  delete booking.expiresAt;
  return { ok: true as const, booking };
}

export function cancelHold(id: string) {
  const booking = getStore().bookings.find((b) => b.id === id);
  if (booking && booking.status === "hold") booking.status = "cancelled";
  return booking;
}

// ---------- dados de exemplo ----------
function seed(): Store {
  const rnd = mulberry32(2026);
  const today = todayISO();
  const bookings: StoredBooking[] = [];
  let seq = 1000;
  const names = ["Camila R.", "João P.", "Beatriz S.", "Rafael M.", "Larissa T.", "Gustavo A.", "Fernanda C.", "Thiago L.", "Juliana B.", "Lucas H.", "Marina D.", "Pedro V."];

  const add = (productId: ProductId, unitId: string, start: string, end: string) => {
    if (bookings.some((b) => b.unitIds.includes(unitId) && overlaps(b, start, end))) return;
    const product = getProduct(productId)!;
    const days = eachDay(start, end).length;
    const name = names[Math.floor(rnd() * names.length)];
    bookings.push({
      id: `bk_${(seq++).toString(36)}`,
      productId,
      unitIds: [unitId],
      start,
      end,
      quantity: 1,
      addons: [],
      total: product.price * days,
      status: "paid",
      voucher: `MRL-${Math.floor(rnd() * 1e6).toString(36).toUpperCase().padStart(4, "X")}`,
      method: rnd() > 0.35 ? "pix" : "card",
      customer: { name, phone: "(98) 9••••-••••" },
      createdAt: Date.now() - Math.floor(rnd() * 6 * 86400000),
      source: "demo",
    });
  };

  // Fim de semana lotado, para a demo mostrar datas esgotadas.
  const sat = nextWeekday(today, 6);
  const sun = addDays(sat, 1);
  for (const p of PRODUCTS) {
    const units = unitIdsOf(p);
    const blocked = p.id === "buggy-familia" ? units.slice(0, 3) : p.id === "ebike-fat" ? units.slice(0, 2) : units;
    blocked.forEach((u) => add(p.id, u, sat, sun));
  }
  // Sexta a domingo seguinte quase cheio nos quadriciclos.
  const sat2 = addDays(sat, 7);
  unitIdsOf(PRODUCTS[2]).slice(0, 7).forEach((u) => add("quadri-4x4", u, addDays(sat2, -1), addDays(sat2, 1)));

  // Ocupação aleatória pelo resto do calendário.
  for (const p of PRODUCTS) {
    for (const u of unitIdsOf(p)) {
      let cursor = Math.floor(rnd() * 4);
      while (cursor < 115) {
        const len = 1 + Math.floor(rnd() * 3);
        add(p.id, u, addDays(today, cursor), addDays(today, cursor + len - 1));
        cursor += len + 1 + Math.floor(rnd() * 6);
      }
    }
  }
  return { bookings, seq, outbox: [] };
}
