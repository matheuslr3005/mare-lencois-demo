"use client";
import { useAvailability } from "./AvailabilityProvider";
import { whatsappLink } from "@/lib/whatsapp";

export function Hero() {
  const { data } = useAvailability();
  const freeToday = data ? Object.values(data.products).reduce((s, p) => s + (p.days[data.today] ?? 0), 0) : null;

  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-deep">
      {/* Vídeo de exemplo (Pexels). Troque public/video/hero.mp4 pelo vídeo do cliente. */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/video/hero-poster.jpg"
        aria-hidden
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/30 to-deep/40" />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-28 pt-40 md:pb-32">
        <p className="rise inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
          <span className="live-dot h-2.5 w-2.5 rounded-full bg-palm" />
          {freeToday === null ? "Consultando frota…" : `${freeToday} veículos livres hoje`}
        </p>
        <h1 className="rise rise-1 mt-5 max-w-3xl text-5xl font-extrabold leading-[0.95] text-white drop-shadow-lg md:text-7xl">
          Acelere pelas dunas.
          <br />
          <span className="text-sun">Mergulhe nas lagoas.</span>
        </h1>
        <p className="rise rise-2 mt-6 max-w-xl text-lg text-white/90 md:text-xl">
          Buggy, quadriciclo e e-bike nos Lençóis Maranhenses. Veja o que está livre na sua data, reserve em 2 minutos e pague com Pix.
        </p>
        <div className="rise rise-3 mt-8 flex flex-wrap gap-3">
          <a href="#reservar" className="rounded-full bg-coral px-7 py-4 text-lg font-bold text-white shadow-xl shadow-coral/40 transition hover:-translate-y-0.5 hover:bg-[#ff7a5f]">
            Ver datas e reservar
          </a>
          <a href="#frota" className="rounded-full bg-white/15 px-7 py-4 text-lg font-bold text-white ring-1 ring-white/50 backdrop-blur transition hover:bg-white/25">
            Conhecer a frota
          </a>
          <a href={whatsappLink({})} target="_blank" rel="noreferrer" className="rounded-full px-5 py-4 text-lg font-semibold text-white/90 underline-offset-4 hover:underline">
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
