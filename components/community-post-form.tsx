"use client";

import { useState } from "react";
import { Eye, Send } from "lucide-react";
import { useFormStatus } from "react-dom";
import { MarkdownContent } from "@/components/markdown-content";
import { saveCommunityPost } from "@/app/community/actions";
import type { Category, Post } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button-primary" disabled={pending}><Send size={17} /> {pending ? "enviando..." : "enviar para revisão"}</button>;
}

export function CommunityPostForm({ post, categories }: { post?: Post | null; categories: Category[] }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [preview, setPreview] = useState(false);

  return (
    <form action={saveCommunityPost} className="editor-form community-editor-form">
      {post && <><input type="hidden" name="id" value={post.id} /><input type="hidden" name="slug" value={post.slug} /></>}
      <div className="editor-topbar">
        <div><span className="eyebrow">{post ? "editando envio" : "nova colaboração"}</span><h1>{title || "Conte uma ideia"}</h1></div>
        <div className="editor-actions">
          <button type="button" className="button-secondary" onClick={() => setPreview(!preview)}><Eye size={17} /> {preview ? "editar" : "prévia"}</button>
          <SubmitButton />
        </div>
      </div>
      <p className="review-note">Seu texto ficará privado até ser revisado pela Alicia. Você poderá acompanhar o status na sua área.</p>
      <div className="community-editor-grid">
        <div className="editor-main">
          {preview ? (
            <div className="editor-preview"><h1>{title || "Título da nota"}</h1><MarkdownContent content={content || "Comece a escrever para ver a prévia."} /></div>
          ) : (
            <>
              <label>Título<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required /></label>
              <label>Resumo<textarea name="excerpt" defaultValue={post?.excerpt} rows={3} minLength={10} maxLength={280} required /></label>
              <label>Texto em Markdown<textarea className="content-editor" name="content" value={content} onChange={(event) => setContent(event.target.value)} rows={20} minLength={20} required /></label>
            </>
          )}
        </div>
        <aside className="editor-sidebar">
          <label>Categoria<select name="category_id" defaultValue={post?.category_id ?? ""}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <div className="markdown-help"><strong>Atalhos Markdown</strong><code>## subtítulo</code><code>**negrito**</code><code>- lista</code><code>[link](url)</code></div>
        </aside>
      </div>
    </form>
  );
}
