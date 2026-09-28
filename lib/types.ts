export type PostStatus = "draft" | "published";

export type Category = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

export type Post = {
  id: string;
  author_id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_url: string | null;
  status: PostStatus;
  featured: boolean;
  category_id: string | null;
  category?: Category | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};
