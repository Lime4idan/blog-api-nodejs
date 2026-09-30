import Link from "next/link";
import { Edit3, ExternalLink, FileText, LogOut, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { communitySignOut } from "@/app/community/actions";
import { getCommunityPosts, getCurrentProfile } from "@/lib/posts";

const statusLabel = { draft: "rascunho", pending: "em revisão", published: "publicado", rejected: "ajustes pedidos" } as const;

export default async function CommunityPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  const [profile, posts] = await Promise.all([getCurrentProfile(), getCommunityPosts()]);
  if (!profile) redirect("/community/login");

  return (
    <section className="dashboard community-dashboard page-shell">
      <div className="dashboard-header">
        <div><span className="eyebrow">comunidade entrelinhas</span><h1>Olá, {profile.display_name}.</h1><p>Guarde rascunhos e acompanhe os textos enviados para revisão.</p></div>
        <div className="dashboard-actions">
          <Link href="/" target="_blank" className="button-secondary"><ExternalLink size={17} /> ver blog</Link>
          <Link href="/community/new" className="button-primary"><Plus size={17} /> escrever</Link>
          <form action={communitySignOut}><button className="icon-button" aria-label="Sair"><LogOut size={17} /></button></form>
        </div>
      </div>
      {params.saved && <p className="success-banner">Texto enviado para revisão. Você pode voltar e ajustar enquanto ele estiver pendente.</p>}
      <div className="community-status-guide"><span><i data-status="pending" /> em revisão</span><span><i data-status="published" /> publicado</span><span><i data-status="rejected" /> precisa de ajustes</span></div>
      <div className="post-table">
        {posts.length === 0 && <div className="admin-empty"><FileText size={24} /><p>Você ainda não enviou nenhum texto.</p><Link href="/community/new" className="text-link">começar o primeiro</Link></div>}
        {posts.map((post) => (
          <div className="post-row community-post-row" key={post.id}>
            <div className="status-dot" data-status={post.status} />
            <div><strong>{post.title}</strong><small>{post.category?.name ?? "Sem categoria"} · atualizado em {new Intl.DateTimeFormat("pt-BR").format(new Date(post.updated_at))}</small></div>
            <span className={`status-pill ${post.status}`}>{statusLabel[post.status]}</span>
            {post.status === "published" ? <Link className="icon-button" href={`/posts/${post.slug}`} aria-label="Ver texto publicado"><ExternalLink size={16} /></Link> : <Link className="icon-button" href={`/community/${post.id}/edit`} aria-label="Editar texto"><Edit3 size={16} /></Link>}
          </div>
        ))}
      </div>
    </section>
  );
}
