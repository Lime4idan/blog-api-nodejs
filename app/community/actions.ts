"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

const submissionSchema = z.object({
  title: z.string().trim().min(3).max(120),
  excerpt: z.string().trim().min(10).max(280),
  content: z.string().trim().min(20),
  category_id: z.string().uuid().nullable()
});

async function requireMember() {
  const supabase = await createClient();
  if (!supabase) throw new Error("Supabase não configurado.");
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/community/login");
  return { supabase, user: data.user };
}

export async function saveCommunityPost(formData: FormData) {
  const { supabase, user } = await requireMember();
  const parsed = submissionSchema.safeParse({
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category_id: formData.get("category_id")?.toString() || null
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Revise os campos.");

  const id = formData.get("id")?.toString();
  const existingSlug = formData.get("slug")?.toString();
  const slug = existingSlug || `${slugify(parsed.data.title)}-${crypto.randomUUID().slice(0, 6)}`;
  const payload = {
    ...parsed.data,
    slug,
    author_id: user.id,
    status: "pending" as const,
    featured: false,
    published_at: null
  };

  const result = id
    ? await supabase.from("posts").update(payload).eq("id", id).eq("author_id", user.id).in("status", ["draft", "pending", "rejected"])
    : await supabase.from("posts").insert(payload);
  if (result.error) throw result.error;

  revalidatePath("/community");
  revalidatePath("/admin");
  redirect("/community?saved=1");
}

export async function communitySignOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}
