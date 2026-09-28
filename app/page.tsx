import Link from "next/link";
import { ArrowDown, Search, X } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { CodeSticker } from "@/components/code-sticker";
import { getCategories, getPublishedPosts } from "@/lib/posts";

type HomeProps = {
  searchParams: Promise<{ busca?: string; categoria?: string }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const [posts, categories] = await Promise.all([
    getPublishedPosts({ search: params.busca, category: params.categoria }),
    getCategories()
  ]);
  const featured = !params.busca && !params.categoria ? posts.find((post) => post.featured) : null;

  return (
    <>
      <section className="hero">
        <div className="hero-kicker"><span>caderno digital</span><span>vol. 01</span></div>
        <h1>Ideias que<br /><em>não cabem</em><br />na margem.</h1>
        <div className="hero-note">
          <span className="scribble-arrow" aria-hidden="true">↳</span>
          <p>Um lugar para registrar processos, tropeços e descobertas entre arte e tecnologia.</p>
        </div>
        <CodeSticker />
        <ArrowDown className="hero-arrow" aria-hidden="true" />
      </section>

      <section className="archive" id="arquivo">
        <div className="archive-heading">
          <div>
            <span className="eyebrow">arquivo aberto</span>
            <h2>Notas recentes</h2>
          </div>
          <form className="search-form" action="/">
            <Search size={17} />
            <input name="busca" defaultValue={params.busca} placeholder="buscar uma ideia..." aria-label="Buscar textos" />
            {(params.busca || params.categoria) && <Link href="/" aria-label="Limpar filtros"><X size={16} /></Link>}
          </form>
        </div>

        <div className="category-list" aria-label="Filtrar por categoria">
          <Link className={!params.categoria ? "active" : ""} href="/">todas</Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              className={params.categoria === category.slug ? "active" : ""}
              href={`/?categoria=${category.slug}#arquivo`}
            >
              {category.name.toLowerCase()}
            </Link>
          ))}
        </div>

        {featured && (
          <div className="featured-label">
            <span>em destaque</span><span className="line" />
          </div>
        )}

        <div className="posts-grid">
          {posts.map((post, index) => <PostCard key={post.id} post={post} index={index} />)}
        </div>

        {posts.length === 0 && (
          <div className="empty-state">
            <span>⌕</span>
            <h3>Nada nessa gaveta ainda.</h3>
            <p>Tente outra palavra ou volte para todas as notas.</p>
          </div>
        )}
      </section>
    </>
  );
}
