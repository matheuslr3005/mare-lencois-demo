import type { StoredBooking } from "./store";
import type { BookingDTO } from "./types";
import { eachDay } from "./dates";

export const toDTO = (b: StoredBooking): BookingDTO => ({
  id: b.id,
  productId: b.productId,
  start: b.start,
  end: b.end,
  days: eachDay(b.start, b.end).length,
  quantity: b.quantity,
  addons: b.addons,
  total: b.total,
  status: b.status,
  expiresAt: b.expiresAt,
  voucher: b.voucher,
  method: b.method,
  customer: b.customer,
});
