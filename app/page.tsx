import Link from "next/link";
import Image from "next/image";
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
        <span className="hero-doodle hero-heart" aria-hidden="true">♡</span>
        <span className="hero-doodle hero-flower" aria-hidden="true">✻</span>
        <figure className="hero-snapshot snapshot-left">
          <Image src="/assets/alicia-portrait.png" width={420} height={510} alt="Retrato de Alicia Borges" priority />
        </figure>
        <div className="hero-card">
          <div className="hero-tabs" aria-hidden="true"><span>código</span><span>arte</span><span>processo</span></div>
          <div className="hero-kicker"><span>entrelinhas</span><span>blog pessoal</span></div>
          <h1>Ideias, código<br />e arte… <em>juntos,</em><br />por aqui.</h1>
          <div className="hero-note">
            <p>Um espaço para guardar processos, tropeços e descobertas antes que eles se percam entre tantas abas abertas.</p>
          </div>
          <CodeSticker />
        </div>
        <figure className="hero-snapshot snapshot-right">
          <Image src="/assets/lorun-sketch.jpg" width={520} height={690} alt="Estudo de personagem de Soulscapes" priority />
        </figure>
        <ArrowDown className="hero-arrow" aria-hidden="true" />
      </section>

      <section className="archive" id="arquivo">
        <div className="archive-heading">
          <div>
            <span className="eyebrow">publicações</span>
            <h2>Últimas ideias</h2>
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

        {!params.busca && !params.categoria && (
          <aside className="community-callout">
            <div><span className="eyebrow">espaço aberto</span><h3>Tem uma ideia para dividir?</h3><p>Crie sua conta, escreva uma nota e envie para aparecer no Entrelinhas.</p></div>
            <Link href="/community/login" className="button-primary">participar da comunidade</Link>
          </aside>
        )}

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
