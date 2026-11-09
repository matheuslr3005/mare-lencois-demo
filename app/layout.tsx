import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maré Lençóis · Aluguel de buggy, quadriciclo e e-bike",
  description: "Reserve online buggy, quadriciclo e e-bike nos Lençóis Maranhenses. Veja a disponibilidade por data e pague com Pix.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
