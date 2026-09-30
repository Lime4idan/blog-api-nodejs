import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommunityAuthForm } from "@/components/community-auth-form";

export default function CommunityLoginPage() {
  return (
    <section className="community-login page-shell">
      <Link href="/" className="back-link"><ArrowLeft size={17} /> voltar ao blog</Link>
      <div className="community-login-grid">
        <div>
          <span className="eyebrow">comunidade entrelinhas</span>
          <h1>Seu texto também pode morar aqui.</h1>
          <p>Crie uma conta, escreva sua nota e envie para revisão. Depois da aprovação, ela aparece no blog com seu nome.</p>
          <ul><li>uma conta por pessoa</li><li>rascunhos privados</li><li>publicação com moderação</li></ul>
        </div>
        <CommunityAuthForm />
      </div>
    </section>
  );
}
