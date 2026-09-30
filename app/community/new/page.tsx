import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CommunityPostForm } from "@/components/community-post-form";
import { getCategories } from "@/lib/posts";

export default async function NewCommunityPostPage() {
  const categories = await getCategories();
  return <section className="editor-page page-shell"><Link href="/community" className="back-link"><ArrowLeft size={17} /> voltar à minha área</Link><CommunityPostForm categories={categories} /></section>;
}
