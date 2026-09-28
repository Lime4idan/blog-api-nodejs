import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <section className="admin-login page-shell">
      <Link href="/" className="back-link"><ArrowLeft size={17} /> voltar ao blog</Link>
      <div className="login-grid">
        <div><span className="eyebrow">área da autora</span><h1>Hora de transformar rascunho em texto.</h1></div>
        <LoginForm />
      </div>
    </section>
  );
}
