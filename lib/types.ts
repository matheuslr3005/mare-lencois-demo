import type { ProductId } from "./fleet";

export type AvailabilityResponse = {
  today: string;
  windowEnd: string;
  products: Record<ProductId, { total: number; days: Record<string, number> }>;
};

export type BookingDTO = {
  id: string;
  productId: ProductId;
  start: string;
  end: string;
  days: number;
  quantity: number;
  addons: string[];
  total: number;
  status: "hold" | "paid" | "cancelled";
  expiresAt?: number;
  voucher?: string;
  method?: "pix" | "card";
  customer?: { name: string; phone: string; email?: string };
};
