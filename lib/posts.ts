import { demoCategories, demoPosts } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import type { Category, Post, Profile } from "@/lib/types";

const postSelect = "*, category:categories(*), author:profiles(display_name)";
const legacyPostSelect = "*, category:categories(*)";

function isMissingProfilesRelation(error: { code?: string } | null) {
  return error?.code === "PGRST200";
}

type SupabaseServerClient = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function attachAuthors(supabase: SupabaseServerClient, posts: Post[]) {
  const authorIds = [...new Set(posts.map((post) => post.author_id).filter(Boolean))] as string[];
  if (authorIds.length === 0) return posts;

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", authorIds);
  if (error) throw error;

  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.display_name]));
  return posts.map((post) => ({
    ...post,
    author: post.author_id && names.has(post.author_id)
      ? { display_name: names.get(post.author_id)! }
      : null
  }));
}

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

  const { data: category } = options?.category
    ? await supabase.from("categories").select("id").eq("slug", options.category).maybeSingle()
    : { data: null };

  const fetchPosts = async (selection: string) => {
    let query = supabase
      .from("posts")
      .select(selection)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false });
    if (options?.category) {
      query = category ? query.eq("category_id", category.id) : query.eq("category_id", "none");
    }
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    if (options?.limit) query = query.limit(options.limit);
    return query;
  };

  let usedLegacySelect = false;
  let { data, error } = await fetchPosts(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPosts(legacyPostSelect));
  }
  if (error) throw error;
  const posts = (data ?? []) as unknown as Post[];
  return usedLegacySelect ? attachAuthors(supabase, posts) : posts;
}

export async function getPostBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return demoPosts.find((post) => post.slug === slug) ?? null;
  }

  const supabase = await createClient();
  if (!supabase) return null;
  const fetchPost = (selection: string) => supabase
      .from("posts")
      .select(selection)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

  let usedLegacySelect = false;
  let { data, error } = await fetchPost(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPost(legacyPostSelect));
  }

  if (error) throw error;
  if (!data) return null;
  const post = data as unknown as Post;
  return usedLegacySelect ? (await attachAuthors(supabase, [post]))[0] ?? null : post;
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
  const fetchPosts = (selection: string) => supabase
    .from("posts")
    .select(selection)
    .order("updated_at", { ascending: false });
  let usedLegacySelect = false;
  let { data, error } = await fetchPosts(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPosts(legacyPostSelect));
  }
  if (error) throw error;
  const posts = (data ?? []) as unknown as Post[];
  return usedLegacySelect ? attachAuthors(supabase, posts) : posts;
}

export async function getAdminPost(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const fetchPost = (selection: string) => supabase
    .from("posts")
    .select(selection)
    .eq("id", id)
    .maybeSingle();
  let usedLegacySelect = false;
  let { data, error } = await fetchPost(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPost(legacyPostSelect));
  }
  if (error) throw error;
  if (!data) return null;
  const post = data as unknown as Post;
  return usedLegacySelect ? (await attachAuthors(supabase, [post]))[0] ?? null : post;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function getCommunityPosts() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const fetchPosts = (selection: string) => supabase
    .from("posts")
    .select(selection)
    .eq("author_id", auth.user.id)
    .order("updated_at", { ascending: false });
  let usedLegacySelect = false;
  let { data, error } = await fetchPosts(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPosts(legacyPostSelect));
  }
  if (error) throw error;
  const posts = (data ?? []) as unknown as Post[];
  return usedLegacySelect ? attachAuthors(supabase, posts) : posts;
}

export async function getCommunityPost(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const fetchPost = (selection: string) => supabase
    .from("posts")
    .select(selection)
    .eq("id", id)
    .eq("author_id", auth.user.id)
    .maybeSingle();
  let usedLegacySelect = false;
  let { data, error } = await fetchPost(postSelect);
  if (isMissingProfilesRelation(error)) {
    usedLegacySelect = true;
    ({ data, error } = await fetchPost(legacyPostSelect));
  }
  if (error) throw error;
  if (!data) return null;
  const post = data as unknown as Post;
  return usedLegacySelect ? (await attachAuthors(supabase, [post]))[0] ?? null : post;
}
