import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { CommunityPostForm } from "@/components/community-post-form";
import { getCategories, getCommunityPost } from "@/lib/posts";

export default async function EditCommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([getCommunityPost(id), getCategories()]);
  if (!post) notFound();
  if (post.status === "published") redirect(`/posts/${post.slug}`);
  return <section className="editor-page page-shell"><Link href="/community" className="back-link"><ArrowLeft size={17} /> voltar à minha área</Link><CommunityPostForm post={post} categories={categories} /></section>;
}
