"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Eye, ImagePlus, Save } from "lucide-react";
import { useFormStatus } from "react-dom";
import { MarkdownContent } from "@/components/markdown-content";
import { savePost } from "@/app/admin/actions";
import { createClient } from "@/lib/supabase/client";
import type { Category, Post } from "@/lib/types";
import { slugify } from "@/lib/slug";

const MAX_COVER_SIZE = 5 * 1024 * 1024;

function SaveButton({ uploading }: { uploading: boolean }) {
  const { pending } = useFormStatus();
  const busy = uploading || pending;

  return (
    <button className="button-primary" type="submit" disabled={busy} aria-busy={busy}>
      <Save size={17} /> {uploading ? "enviando capa..." : pending ? "salvando..." : "salvar"}
    </button>
  );
}

export function AdminPostForm({ post, categories }: { post?: Post | null; categories: Category[] }) {
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [preview, setPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [coverName, setCoverName] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const uploadedCoverRef = useRef<HTMLInputElement>(null);
  const submittingAfterUpload = useRef(false);
  const generatedSlug = useMemo(() => slug || slugify(title), [slug, title]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (submittingAfterUpload.current) {
      submittingAfterUpload.current = false;
      return;
    }

    const file = coverInputRef.current?.files?.[0];
    if (!file) return;

    event.preventDefault();
    const form = event.currentTarget;
    setSaveError("");

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setSaveError("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_COVER_SIZE) {
      setSaveError("A capa deve ter no máximo 5 MB.");
      return;
    }

    setUploadingCover(true);
    try {
      const supabase = createClient();
      if (!supabase) throw new Error("O armazenamento ainda não está configurado.");

      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Sua sessão expirou. Entre novamente para salvar.");

      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const path = `${auth.user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("blog-covers").upload(path, file, {
        cacheControl: "31536000",
        contentType: file.type,
        upsert: false
      });
      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from("blog-covers").getPublicUrl(path).data.publicUrl;
      if (uploadedCoverRef.current) uploadedCoverRef.current.value = publicUrl;
      if (coverInputRef.current) coverInputRef.current.value = "";

      submittingAfterUpload.current = true;
      form.requestSubmit();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não foi possível enviar a capa. Tente novamente.");
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <form action={savePost} className="editor-form" onSubmit={handleSubmit}>
      {post && <input type="hidden" name="id" value={post.id} />}
      <input type="hidden" name="current_cover_url" value={post?.cover_url ?? ""} />
      <input ref={uploadedCoverRef} type="hidden" name="uploaded_cover_url" defaultValue="" />
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
          <SaveButton uploading={uploadingCover} />
        </div>
      </div>

      {saveError && <p className="form-message form-error" role="alert">{saveError}</p>}

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
          <label>Status<select name="status" defaultValue={post?.status ?? "draft"}><option value="draft">Rascunho</option><option value="pending">Em revisão</option><option value="published">Publicado</option><option value="rejected">Pedir ajustes</option></select></label>
          <label>Categoria<select name="category_id" defaultValue={post?.category_id ?? ""}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <label className="check-field"><input type="checkbox" name="featured" defaultChecked={post?.featured} /> destacar na página inicial</label>
          <label className="file-field"><ImagePlus size={20} /><span>Capa do texto<small>{coverName || "JPG, PNG ou WebP · até 5 MB"}</small></span><input ref={coverInputRef} type="file" name="cover" accept="image/png,image/jpeg,image/webp" onChange={(event) => { setCoverName(event.target.files?.[0]?.name ?? ""); setSaveError(""); }} /></label>
          {post?.cover_url && <Image className="current-cover" src={post.cover_url} alt="Capa atual" width={600} height={375} />}
          <div className="markdown-help"><strong>Atalhos Markdown</strong><code>## subtítulo</code><code>**negrito**</code><code>- lista</code><code>[link](url)</code></div>
        </aside>
      </div>
    </form>
  );
}
