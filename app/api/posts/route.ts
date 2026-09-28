import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const posts = await getPublishedPosts({ category, search });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase.from("posts").insert({
    title: body.title,
    slug: slugify(body.slug || body.title),
    excerpt: body.excerpt,
    content: body.content,
    category_id: body.category_id || null,
    status: body.status === "published" ? "published" : "draft",
    published_at: body.status === "published" ? new Date().toISOString() : null,
    author_id: auth.user.id
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ post: data }, { status: 201 });
}
