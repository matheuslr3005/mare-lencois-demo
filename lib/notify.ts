// Notificações pós-pagamento: e-mail e WhatsApp para o cliente e aviso ao dono.
// Sem chaves de API, tudo fica SIMULADO e aparece na aba "Notificações" do painel.
// Com RESEND_API_KEY, o e-mail ao cliente é enviado de verdade.
import { randomBytes } from "node:crypto";
import { ADDONS, getProduct } from "./fleet";
import { brl } from "./format";
import { fmtLong } from "./dates";
import { WHATSAPP_NUMBER } from "./whatsapp";
import { OutboxMessage, StoredBooking, getStore } from "./store";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const ownerWhatsApp = () => (process.env.OWNER_WHATSAPP || WHATSAPP_NUMBER).replace(/\D/g, "");
const toBrPhone = (p: string) => {
  const d = p.replace(/\D/g, "");
  return d.length <= 11 ? `55${d}` : d;
};
const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

function emailHtml(b: StoredBooking) {
  const product = getProduct(b.productId)!;
  const extras = ADDONS.filter((a) => b.addons.includes(a.id)).map((a) => a.name);
  const row = (l: string, v: string) =>
    `<tr><td style="padding:8px 0;color:#6b7c85;font-size:13px">${l}</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#06303f">${v}</td></tr>`;
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#fff6e5;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:20px;overflow:hidden">
<tr><td style="background:#06303f;padding:22px 28px;color:#fff;font-size:20px;font-weight:800">Maré <span style="color:#ff6a4d">Lençóis</span></td></tr>
<tr><td style="padding:32px 28px 8px"><div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#17a168">RESERVA CONFIRMADA</div>
<h1 style="margin:8px 0 0;font-size:26px;color:#06303f">Tudo certo, ${esc(b.customer!.name.split(" ")[0])}!</h1>
<p style="color:#4a5b64;line-height:1.5">Recebemos o seu pagamento. Apresente o código abaixo na retirada do veículo.</p></td></tr>
<tr><td style="padding:8px 28px"><div style="background:#fff6e5;border:2px dashed #f7e3bc;border-radius:14px;padding:16px;text-align:center">
<div style="font-size:12px;color:#6b7c85">CÓDIGO DO VOUCHER</div><div style="font-size:28px;font-weight:800;letter-spacing:3px;color:#ff6a4d;font-family:monospace">${esc(b.voucher!)}</div></div></td></tr>
<tr><td style="padding:8px 28px 0"><table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f1e6cf">
${row("Veículo", `${b.quantity}x ${esc(product.name)}`)}${row("Retirada", fmtLong(b.start))}${row("Devolução", fmtLong(b.end))}
${extras.length ? row("Extras", esc(extras.join(", "))) : ""}${row("Pagamento", b.method === "pix" ? "Pix" : "Cartão")}${row("Total pago", brl(b.total))}
</table></td></tr>
<tr><td style="padding:24px 28px"><a href="${waLink(ownerWhatsApp(), `Olá! Minha reserva é ${b.voucher}.`)}" style="display:inline-block;background:#17a168;color:#fff;text-decoration:none;font-weight:700;padding:14px 26px;border-radius:999px">Falar com a equipe no WhatsApp</a>
<p style="margin:20px 0 0;font-size:12px;color:#6b7c85;line-height:1.5">Cancelamento gratuito até 24h antes da retirada. Leve um documento com foto. Este é um e-mail de demonstração.</p></td></tr>
</table></td></tr></table></body></html>`;
}

async function sendEmailReal(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || "Maré Lençóis <onboarding@resend.dev>", to: [to], subject, html }),
  });
  return res.ok;
}

export async function notifyPaid(b: StoredBooking) {
  if (!b.customer || !b.voucher) return;
  const product = getProduct(b.productId)!;
  const when = b.start === b.end ? fmtLong(b.start) : `${fmtLong(b.start)} a ${fmtLong(b.end)}`;
  const outbox = getStore().outbox;
  const push = (m: Omit<OutboxMessage, "id" | "createdAt" | "bookingId">) =>
    outbox.push({ ...m, id: randomBytes(6).toString("hex"), createdAt: Date.now(), bookingId: b.id });

  // 1) E-mail de confirmação ao cliente
  const subject = `Reserva confirmada ${b.voucher} · Maré Lençóis`;
  const html = emailHtml(b);
  const text = `Reserva confirmada! Código ${b.voucher}. ${b.quantity}x ${product.name}, ${when}. Total ${brl(b.total)}.`;
  let status: OutboxMessage["status"] = "simulado";
  if (process.env.RESEND_API_KEY && b.customer.email) {
    status = (await sendEmailReal(b.customer.email, subject, html).catch(() => false)) ? "enviado" : "falhou";
  }
  push({ channel: "email", audience: "cliente", to: b.customer.email ?? "(sem e-mail)", subject, text, html, status });

  // 2) WhatsApp ao cliente (em produção: WhatsApp Cloud API com template aprovado)
  const customerMsg = `Olá, ${b.customer.name.split(" ")[0]}! 🌴 Sua reserva na Maré Lençóis está confirmada.\n\n${b.quantity}x ${product.name}\n${when}\nCódigo: ${b.voucher}\nTotal: ${brl(b.total)}\n\nQualquer dúvida é só responder por aqui.`;
  push({ channel: "whatsapp", audience: "cliente", to: b.customer.phone, text: customerMsg, link: waLink(toBrPhone(b.customer.phone), customerMsg), status: "simulado" });

  // 3) Aviso ao dono
  const extras = ADDONS.filter((a) => b.addons.includes(a.id)).map((a) => a.name);
  const ownerMsg = `💰 Nova reserva PAGA\n\n${b.customer.name} · ${b.customer.phone}\n${b.customer.email ?? ""}\n\n${b.quantity}x ${product.name}\n${when}${extras.length ? `\nExtras: ${extras.join(", ")}` : ""}\nPago via ${b.method === "pix" ? "Pix" : "cartão"}: ${brl(b.total)}\nCódigo: ${b.voucher}`;
  push({ channel: "whatsapp", audience: "lojista", to: ownerWhatsApp(), text: ownerMsg, link: waLink(ownerWhatsApp(), ownerMsg), status: "simulado" });

  console.log(`[notify] ${b.voucher}: e-mail (${status}), WhatsApp cliente e aviso ao lojista registrados.`);
}
