const QA = [
  ["Como funciona a disponibilidade?", "Cada veículo tem estoque próprio. Ao escolher as datas, o site mostra em tempo real quantas unidades estão livres, e trava o veículo por 10 minutos enquanto você paga."],
  ["Posso pagar com Pix?", "Sim. Pix com aprovação imediata ou cartão de crédito. Se preferir, finalize com um atendente pelo WhatsApp."],
  ["O que está incluso?", "Capacete, óculos, orientação de segurança e mapa do roteiro. Guia, fotos e seguro premium são extras opcionais."],
  ["E se chover ou eu precisar cancelar?", "Cancelamento gratuito em até 24h antes da retirada. Em caso de condição climática impeditiva, remarcamos sem custo."],
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 pb-24">
      <h2 className="text-4xl font-extrabold text-deep md:text-5xl">Dúvidas frequentes</h2>
      <div className="mt-8 space-y-3">
        {QA.map(([q, a]) => (
          <details key={q} className="group rounded-2xl bg-white px-6 py-5 shadow-md open:shadow-lg">
            <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-bold text-deep">
              {q}
              <span className="ml-4 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sand text-xl transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-ink/70">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
