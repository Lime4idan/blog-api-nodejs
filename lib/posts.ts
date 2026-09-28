import { demoCategories, demoPosts } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Category, Post } from "@/lib/types";

const postSelect = "*, category:categories(*)";

export async function getPublishedPosts(options?: {
  category?: string;
  search?: string;
  limit?: number;
}) {
  const search = options?.search?.trim().toLowerCase();

  if (!isSupabaseConfigured) {
    let posts = demoPosts;
    if (options?.category) {
      posts = posts.filter((post) => post.category?.slug === options.category);
    }
    if (search) {
      posts = posts.filter((post) =>
        `${post.title} ${post.excerpt}`.toLowerCase().includes(search)
      );
    }
    return posts.slice(0, options?.limit ?? posts.length);
  }

  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select(postSelect)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (options?.category) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", options.category)
      .maybeSingle();
    query = category ? query.eq("category_id", category.id) : query.eq("category_id", "none");
  }
  if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function getPostBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Post | null;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return demoCategories;
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data as Category[];
}

export async function getAdminPosts() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as Post[];
}

export async function getAdminPost(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("posts")
    .select(postSelect)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as Post | null;
}
