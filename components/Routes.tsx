const ROUTES = [
  { name: "Lagoa Azul", note: "Água cristalina entre as dunas", time: "Meio dia", tag: "Clássico", photo: "/img/routes/lagoa-azul.jpg", focus: "center 55%" },
  { name: "Lagoa Bonita", note: "A mais fotografada do parque", time: "Dia inteiro", tag: "Mais fotos", photo: "/img/routes/lagoa-bonita.jpg", focus: "center 45%" },
  { name: "Atins & Caburé", note: "Praia, kitesurf e peixe fresco", time: "Dia inteiro", tag: "Gastronomia", photo: "/img/routes/atins-cabure.jpg", focus: "38% center" },
  { name: "Pequenos Lençóis", note: "Dunas, rio e vento do fim de tarde", time: "Meio dia", tag: "Pôr do sol", photo: "/img/routes/pequenos-lencois.jpg", focus: "center 40%" },
];

export function Routes() {
  return (
    <section id="roteiros" className="mx-auto max-w-6xl px-5 py-24">
      <p className="text-sm font-bold uppercase tracking-widest text-hibiscus">Roteiros sugeridos</p>
      <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-deep md:text-6xl">Pra onde ir com a sua reserva.</h2>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ROUTES.map((r) => (
          <article key={r.name} className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[28px] bg-deep p-6 text-white shadow-xl transition duration-300 hover:-translate-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.photo} alt={r.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110" style={{ objectPosition: r.focus }} />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/20 to-transparent" />
            <span className="absolute left-5 top-5 rounded-full bg-deep/60 px-3 py-1 text-xs font-bold backdrop-blur">{r.tag}</span>
            <h3 className="relative text-3xl font-extrabold leading-none drop-shadow">{r.name}</h3>
            <p className="relative mt-2 text-sm font-medium text-white/90">{r.note}</p>
            <p className="relative mt-3 text-xs font-bold uppercase tracking-wider text-white/80">{r.time}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink/50">Fotos de exemplo (Pexels). Aqui entram as fotos e os roteiros reais do cliente.</p>
    </section>
  );
}
