"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const postSchema = z.object({
  title: z.string().trim().min(3).max(120),
  slug: z.string().trim().min(3).max(140),
  excerpt: z.string().trim().min(10).max(280),
  content: z.string().trim().min(20),
  category_id: z.string().uuid().nullable(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean()
});

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase ainda não foi configurado.");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return { supabase, user: data.user };
}

async function uploadCover(file: File, userId: string) {
  if (!file.size) return null;
  if (!file.type.startsWith("image/")) throw new Error("A capa precisa ser uma imagem.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A capa deve ter no máximo 5 MB.");

  const { supabase } = await requireUser();
  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("blog-covers").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type
  });
  if (error) throw error;
  return supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
}

export async function savePost(formData: FormData) {
  const { supabase, user } = await requireUser();
  const id = formData.get("id")?.toString();
  const requestedSlug = formData.get("slug")?.toString() || formData.get("title")?.toString() || "";
  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: slugify(requestedSlug),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category_id: formData.get("category_id")?.toString() || null,
    status: formData.get("status"),
    featured: formData.get("featured") === "on"
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Revise os campos.");

  const cover = formData.get("cover") as File | null;
  const newCoverUrl = cover?.size ? await uploadCover(cover, user.id) : null;
  const currentCoverUrl = formData.get("current_cover_url")?.toString() || null;
  const now = new Date().toISOString();
  const payload = {
    ...parsed.data,
    author_id: user.id,
    cover_url: newCoverUrl ?? currentCoverUrl,
    published_at: parsed.data.status === "published"
      ? (formData.get("published_at")?.toString() || now)
      : null
  };

  const result = id
    ? await supabase.from("posts").update(payload).eq("id", id)
    : await supabase.from("posts").insert(payload);
  if (result.error) throw result.error;

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin?saved=1");
}

export async function deletePost(formData: FormData) {
  const { supabase } = await requireUser();
  const id = formData.get("id")?.toString();
  if (!id) return;
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
