import { notFound, redirect } from "next/navigation";
import { AdminPostForm } from "@/components/admin-post-form";
import { isSupabaseConfigured } from "@/lib/config";
import { getAdminPost, getCategories } from "@/lib/posts";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured) redirect("/admin");
  const { id } = await params;
  const [post, categories] = await Promise.all([getAdminPost(id), getCategories()]);
  if (!post) notFound();
  return <section className="editor-page page-shell"><AdminPostForm post={post} categories={categories} /></section>;
}
