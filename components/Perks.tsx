const ITEMS = ["Pix e cartão em até 12x", "Capacete e óculos inclusos", "Retirada em minutos", "Guia local opcional", "Cancelamento grátis em 24h", "Atendimento humano no WhatsApp"];

export function Perks() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden bg-deep py-4 text-sand" aria-label="Diferenciais">
      <div className="marquee flex w-max gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-[15px] font-semibold">
            {t}
            <svg width="14" height="14" viewBox="0 0 20 20" aria-hidden><circle cx="10" cy="10" r="8" fill="#FFC233" /></svg>
          </span>
        ))}
      </div>
    </div>
  );
}
