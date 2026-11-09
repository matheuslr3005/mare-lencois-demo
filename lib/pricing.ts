import { ADDONS, Product } from "./fleet";

export const HOLD_MINUTES = 10;

export function calcTotal(product: Product, days: number, qty: number, addonIds: string[]) {
  const base = product.price * days * qty;
  const extras = ADDONS.filter((a) => addonIds.includes(a.id)).reduce(
    (sum, a) => sum + (a.per === "dia" ? a.price * days * qty : a.price),
    0,
  );
  return { base, extras, total: base + extras };
}
