import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Página inicial">
        <span className="brand-mark">ab</span>
        <span>
          <strong>entrelinhas</strong>
          <small>por Alicia Borges</small>
        </span>
      </Link>
      <nav aria-label="Navegação principal">
        <Link href="/">notas</Link>
        <Link href="/about">sobre</Link>
        <Link href="/admin/login">escrever</Link>
      </nav>
      <Link className="search-link" href="/?busca=" aria-label="Pesquisar textos">
        <Search size={18} />
      </Link>
      <Sparkles className="header-sparkle" size={16} aria-hidden="true" />
    </header>
  );
}
