import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <span className="eyebrow">fim da página, não da conversa</span>
        <p>Notas sobre código, arte e tudo que aparece no caminho.</p>
      </div>
      <div className="footer-links">
        <a href="https://github.com/Lime4idan" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.linkedin.com/in/alicia-borges-570652401/" target="_blank" rel="noreferrer">LinkedIn</a>
        <Link href="/community/login">Comunidade</Link>
        <Link href="/admin/login">Admin</Link>
      </div>
    </footer>
  );
}
