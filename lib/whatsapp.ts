import { ADDONS } from "./fleet";
import { fmtShort } from "./dates";

// Número fictício de demonstração. Troque pelo WhatsApp real do cliente.
export const WHATSAPP_NUMBER = "5598999990000";

export function whatsappLink(opts: {
  product?: string;
  start?: string | null;
  end?: string | null;
  quantity?: number;
  addons?: string[];
  name?: string;
  voucher?: string;
  total?: string;
}) {
  const lines = ["Olá! Vim pelo site da Maré Lençóis 🌴"];
  if (opts.voucher) lines.push(`Reserva confirmada: ${opts.voucher}`);
  if (opts.product) lines.push(`Quero alugar: ${opts.quantity ?? 1}x ${opts.product}`);
  if (opts.start && opts.end)
    lines.push(opts.start === opts.end ? `Data: ${fmtShort(opts.start)}` : `Datas: ${fmtShort(opts.start)} a ${fmtShort(opts.end)}`);
  const extras = ADDONS.filter((a) => opts.addons?.includes(a.id)).map((a) => a.name);
  if (extras.length) lines.push(`Extras: ${extras.join(", ")}`);
  if (opts.total) lines.push(`Valor estimado: ${opts.total}`);
  if (opts.name) lines.push(`Nome: ${opts.name}`);
  if (!opts.product) lines.push("Gostaria de mais informações sobre os passeios.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}
