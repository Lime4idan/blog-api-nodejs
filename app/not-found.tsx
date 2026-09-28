import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found page-shell">
      <span className="not-found-number">404</span>
      <h1>Essa página escapou do caderno.</h1>
      <Link className="button-primary" href="/">voltar ao início</Link>
    </section>
  );
}
