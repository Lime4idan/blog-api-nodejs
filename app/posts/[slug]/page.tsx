import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { PostCover } from "@/components/post-cover";
import { getPostBySlug, getPublishedPosts } from "@/lib/posts";

type PostPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Texto não encontrado" };
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = (await getPublishedPosts()).find((item) => item.slug !== post.slug);
  const published = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "long", year: "numeric"
  }).format(new Date(post.published_at ?? post.created_at));

  return (
    <article className="article-page page-shell">
      <Link href="/" className="back-link"><ArrowLeft size={17} /> voltar ao arquivo</Link>
      <header className="article-header">
        <div className="article-meta">
          <span>{post.category?.name ?? "Notas"}</span>
          {post.author?.display_name && <span>por {post.author.display_name}</span>}
          <time dateTime={post.published_at ?? post.created_at}>{published}</time>
        </div>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
      </header>

      <div className="article-cover">
        <PostCover title={post.title} coverUrl={post.cover_url} color={post.category?.color} />
      </div>

      <MarkdownContent content={post.content} />

      {related && (
        <aside className="next-note">
          <span className="eyebrow">continue folheando</span>
          <Link href={`/posts/${related.slug}`}>
            <span>{related.title}</span><ArrowUpRight size={26} />
          </Link>
        </aside>
      )}
    </article>
  );
}
