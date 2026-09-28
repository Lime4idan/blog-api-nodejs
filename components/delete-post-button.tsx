"use client";

import { Trash2 } from "lucide-react";
import { deletePost } from "@/app/admin/actions";

export function DeletePostButton({ id }: { id: string }) {
  return (
    <form action={deletePost} onSubmit={(event) => {
      if (!window.confirm("Excluir este texto? Essa ação não pode ser desfeita.")) event.preventDefault();
    }}>
      <input type="hidden" name="id" value={id} />
      <button className="icon-button danger" aria-label="Excluir texto"><Trash2 size={16} /></button>
    </form>
  );
}
