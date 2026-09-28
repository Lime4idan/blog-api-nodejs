import { redirect } from "next/navigation";
import { AdminPostForm } from "@/components/admin-post-form";
import { isSupabaseConfigured } from "@/lib/config";
import { getCategories } from "@/lib/posts";

export default async function NewPostPage() {
  if (!isSupabaseConfigured) redirect("/admin");
  const categories = await getCategories();
  return <section className="editor-page page-shell"><AdminPostForm categories={categories} /></section>;
}
