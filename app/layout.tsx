import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Entrelinhas — Alicia Borges", template: "%s — Entrelinhas" },
  description: "Notas de Alicia Borges sobre código, arte, design e processos criativos.",
  openGraph: {
    title: "Entrelinhas — Alicia Borges",
    description: "Notas sobre código, arte, design e processos criativos.",
    type: "website",
    locale: "pt_BR"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="paper-noise" aria-hidden="true" />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
