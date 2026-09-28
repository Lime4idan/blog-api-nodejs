"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Eye, ImagePlus, Save } from "lucide-react";
import { MarkdownContent } from "@/components/markdown-content";
import { savePost } from "@/app/admin/actions";
import type { Category, Post } from "@/lib/types";
import { slugify } from "@/lib/slug";

export function AdminPostForm({ post, categories }: { post?: Post | null; categories: Category[] }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [preview, setPreview] = useState(false);
  const generatedSlug = useMemo(() => slug || slugify(title), [slug, title]);

  return (
    <form action={savePost} className="editor-form">
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="current_cover_url" value={post?.cover_url ?? ""} />
      <input type="hidden" name="published_at" value={post?.published_at ?? ""} />

      <div className="editor-topbar">
        <div>
          <span className="eyebrow">{post ? "editando nota" : "novo rascunho"}</span>
          <h1>{post ? post.title : "O que você quer registrar?"}</h1>
        </div>
        <div className="editor-actions">
          <button type="button" className="button-secondary" onClick={() => setPreview(!preview)}>
            <Eye size={17} /> {preview ? "editar" : "prévia"}
          </button>
          <button className="button-primary" type="submit"><Save size={17} /> salvar</button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-main">
          {preview ? (
            <div className="editor-preview">
              <h1>{title || "Título da nota"}</h1>
              <MarkdownContent content={content || "Comece a escrever para ver a prévia."} />
            </div>
          ) : (
            <>
              <label>Título<input name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} required /></label>
              <label>Endereço do texto
                <div className="slug-field"><span>/posts/</span><input name="slug" value={generatedSlug} onChange={(e) => setSlug(slugify(e.target.value))} required /></div>
              </label>
              <label>Resumo<textarea name="excerpt" defaultValue={post?.excerpt} rows={3} maxLength={280} required /></label>
              <label>Texto em Markdown<textarea className="content-editor" name="content" value={content} onChange={(e) => setContent(e.target.value)} rows={20} required /></label>
            </>
          )}
        </div>

        <aside className="editor-sidebar">
          <label>Status<select name="status" defaultValue={post?.status ?? "draft"}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
          <label>Categoria<select name="category_id" defaultValue={post?.category_id ?? ""}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="check-field"><input type="checkbox" name="featured" defaultChecked={post?.featured} /> destacar na página inicial</label>
          <label className="file-field"><ImagePlus size={20} /><span>Capa do texto<small>JPG, PNG ou WebP · até 5 MB</small></span><input type="file" name="cover" accept="image/png,image/jpeg,image/webp" /></label>
          {post?.cover_url && <Image className="current-cover" src={post.cover_url} alt="Capa atual" width={600} height={375} />}
          <div className="markdown-help"><strong>Atalhos Markdown</strong><code>## subtítulo</code><code>**negrito**</code><code>- lista</code><code>[link](url)</code></div>
        </aside>
      </div>
    </form>
  );
}
