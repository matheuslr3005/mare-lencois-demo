"use client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { whatsappLink } from "@/lib/whatsapp";

const LINKS = [
  ["Frota", "#frota"],
  ["Reservar", "#reservar"],
  ["Roteiros", "#roteiros"],
  ["Dúvidas", "#faq"],
];

export function Header() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const dark = solid || open;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${dark ? "bg-sand/95 shadow-md backdrop-blur" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#" aria-label="Início"><Logo light={!dark} /></a>
        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} className={`text-[15px] font-semibold transition hover:text-coral ${dark ? "text-deep" : "text-white"}`}>{l}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a href={whatsappLink({})} target="_blank" rel="noreferrer" className={`rounded-full px-5 py-2.5 text-sm font-bold ring-2 transition ${dark ? "text-deep ring-deep/20 hover:ring-deep" : "text-white ring-white/60 hover:bg-white/15"}`}>WhatsApp</a>
          <a href="#reservar" className="rounded-full bg-coral px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-coral/30 transition hover:bg-[#ff7a5f]">Reservar</a>
        </div>
        <button className={`md:hidden ${dark ? "text-deep" : "text-white"}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-deep/10 bg-sand px-5 pb-5 pt-2 md:hidden">
          {LINKS.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="block py-3 text-lg font-semibold text-deep">{l}</a>
          ))}
          <a href="#reservar" onClick={() => setOpen(false)} className="mt-2 block rounded-full bg-coral py-3.5 text-center font-bold text-white">Reservar agora</a>
        </div>
      )}
    </header>
  );
}
