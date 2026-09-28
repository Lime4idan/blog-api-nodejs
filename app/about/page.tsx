import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata: Metadata = { title: "Sobre" };

export default function AboutPage() {
  return (
    <section className="about-page page-shell">
      <span className="eyebrow">sobre este espaço</span>
      <div className="about-grid">
        <h1>Escrever também é uma forma de construir.</h1>
        <div className="about-copy">
          <p>Sou Alicia Borges, estudante de informática, desenvolvedora e artista. Gosto de projetos que deixam código, imagem e narrativa ocuparem a mesma mesa.</p>
          <p>Entrelinhas é meu arquivo de processo: um lugar para registrar decisões, estudos e dúvidas antes que elas desapareçam entre abas abertas.</p>
          <a href="https://alicia-portfolio-two.vercel.app/" target="_blank" rel="noreferrer" className="button-primary">
            conhecer meu portfólio <ArrowUpRight size={18} />
          </a>
          <Link href="/" className="text-link">voltar para as notas</Link>
        </div>
      </div>
    </section>
  );
}
