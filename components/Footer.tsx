import { Logo } from "./Logo";
import { whatsappLink } from "@/lib/whatsapp";

export function Footer() {
  return (
    <footer className="bg-deep text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo light />
          <p className="mt-3 max-w-xs text-sm text-white/60">Aluguel de buggy, quadriciclo e e-bike no Maranhão. Aventura com segurança e reserva em minutos.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-bold">
          <a href={whatsappLink({})} target="_blank" rel="noreferrer" className="rounded-full bg-palm px-6 py-3 hover:bg-[#139058]">WhatsApp</a>
          <a href="#reservar" className="rounded-full bg-coral px-6 py-3 hover:bg-[#ff7a5f]">Reservar</a>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-white/40">Versão demonstrativa · nome, preços e textos ilustrativos · pagamento simulado · fotos e vídeo de exemplo: <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline">Pexels</a></p>
    </footer>
  );
}
