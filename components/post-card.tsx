import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Post } from "@/lib/types";
import { PostCover } from "@/components/post-cover";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <article className="post-card">
      <Link href={`/posts/${post.slug}`} className="post-card-cover" aria-label={`Ler ${post.title}`}>
        <PostCover title={post.title} coverUrl={post.cover_url} color={post.category?.color} />
      </Link>
      <div className="post-card-body">
        <div className="post-meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <span>{post.category?.name ?? "Notas"}</span>
          <time dateTime={post.published_at ?? post.created_at}>
            {dateFormatter.format(new Date(post.published_at ?? post.created_at))}
          </time>
        </div>
        <h2><Link href={`/posts/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.excerpt}</p>
        <Link className="read-link" href={`/posts/${post.slug}`}>
          continuar lendo <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}
