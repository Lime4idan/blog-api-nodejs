import Link from "next/link";
import { Edit3, ExternalLink, FileText, LogOut, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { DeletePostButton } from "@/components/delete-post-button";
import { isSupabaseConfigured } from "@/lib/config";
import { getAdminPosts } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/admin/actions";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const params = await searchParams;
  if (!isSupabaseConfigured) {
    return (
      <section className="setup-page page-shell">
        <span className="eyebrow">uma etapa antes de publicar</span>
        <h1>Conecte o banco para abrir o estúdio.</h1>
        <p>O blog público já funciona em modo de demonstração. Para criar e editar textos reais, crie um projeto no Supabase, execute o arquivo <code>supabase/schema.sql</code> e adicione as duas variáveis indicadas em <code>.env.example</code>.</p>
        <Link href="/" className="button-primary">ver o blog</Link>
      </section>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase!.auth.getUser();
  if (!data.user) redirect("/admin/login");
  const posts = await getAdminPosts();
  const publishedCount = posts.filter((post) => post.status === "published").length;

  return (
    <section className="dashboard page-shell">
      <div className="dashboard-header">
        <div><span className="eyebrow">estúdio editorial</span><h1>Seus textos</h1></div>
        <div className="dashboard-actions">
          <Link href="/" target="_blank" className="button-secondary"><ExternalLink size={17} /> ver blog</Link>
          <Link href="/admin/posts/new" className="button-primary"><Plus size={17} /> novo texto</Link>
          <form action={signOut}><button className="icon-button" aria-label="Sair"><LogOut size={17} /></button></form>
        </div>
      </div>
      {params.saved && <p className="success-banner">Texto salvo com sucesso.</p>}

      <div className="dashboard-stats">
        <div><span>total</span><strong>{posts.length}</strong></div>
        <div><span>publicados</span><strong>{publishedCount}</strong></div>
        <div><span>rascunhos</span><strong>{posts.length - publishedCount}</strong></div>
      </div>

      <div className="post-table">
        {posts.length === 0 && <div className="admin-empty"><FileText size={24} /><p>Nenhuma nota ainda. Que tal começar pelo primeiro rascunho?</p></div>}
        {posts.map((post) => (
          <div className="post-row" key={post.id}>
            <div className="status-dot" data-status={post.status} />
            <div><strong>{post.title}</strong><small>{post.category?.name ?? "Sem categoria"} · atualizado em {new Intl.DateTimeFormat("pt-BR").format(new Date(post.updated_at))}</small></div>
            <span className={`status-pill ${post.status}`}>{post.status === "published" ? "publicado" : "rascunho"}</span>
            <Link className="icon-button" href={`/admin/posts/${post.id}/edit`} aria-label="Editar texto"><Edit3 size={16} /></Link>
            <DeletePostButton id={post.id} />
          </div>
        ))}
      </div>
    </section>
  );
}
