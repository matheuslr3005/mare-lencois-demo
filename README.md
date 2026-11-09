# Maré Lençóis · Demo de site de reservas

**Demo online:** https://mare-lencois-demo.vercel.app

Demonstração de um site de aluguel de **buggy, quadriciclo e e-bike** para os Lençóis Maranhenses, com
calendário de disponibilidade, reserva com pagamento simulado e painel do lojista.

> **Versão demonstrativa.** Nome, preços e textos são ilustrativos, os dados ficam em memória e o
> pagamento é simulado. Nenhuma cobrança real é feita.

## O que tem

- Hero com vídeo, frota com fotos, roteiros e FAQ
- Reserva em 3 passos: escolha do veículo e das datas, dados e pagamento, voucher
- **Disponibilidade por data** calculada no servidor, com reserva temporária de 10 minutos e proteção contra reserva dupla
- Pagamento Pix/cartão **simulado** (em produção, o Mercado Pago confirma por webhook)
- Atendimento por **WhatsApp** (link com a mensagem pronta)
- **Painel do lojista** em `/admin`, com login, estoque, reservas e caixa de saída de notificações
- Confirmação por e-mail e WhatsApp (simulada; e-mail real opcional com Resend)

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha ADMIN_EMAIL, ADMIN_PASSWORD e SESSION_SECRET
npm run dev
```

Abra `http://localhost:3000`. O painel fica em `http://localhost:3000/admin`.

Para gerar um `SESSION_SECRET`: `openssl rand -hex 32`.

## Variáveis de ambiente

| Variável | Para quê |
|---|---|
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Login do painel (sem elas o login fica desativado) |
| `SESSION_SECRET` | Assina o cookie de sessão (mínimo 32 caracteres) |
| `OWNER_EMAIL`, `OWNER_WHATSAPP` | Para onde vão os avisos de nova reserva |
| `RESEND_API_KEY`, `EMAIL_FROM` | Opcional: envia o e-mail de confirmação de verdade |

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4

## Sobre a hospedagem do demo

Na Vercel os dados ficam na memória do servidor e **reiniciam** a cada novo deploy ou quando o servidor "dorme". É suficiente para demonstração. Em produção, use um banco de dados.

## Próximos passos para produção

1. Trocar o armazenamento em memória por Postgres (ex.: Supabase) com restrição de datas sobrepostas
2. Integrar o Mercado Pago (Pix e cartão) e confirmar o pagamento por webhook
3. Ativar o e-mail real (Resend) e a WhatsApp Cloud API
4. Substituir fotos e vídeo de exemplo pelo material do cliente

## Créditos

Fotos e vídeo de exemplo: [Pexels](https://www.pexels.com) (licença gratuita). Substitua pelo material do cliente antes de publicar.
