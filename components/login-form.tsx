"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(event.currentTarget);
    const supabase = createClient();
    if (!supabase) {
      setMessage("Configure o Supabase para liberar o painel.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: data.get("email")?.toString() ?? "",
      password: data.get("password")?.toString() ?? ""
    });
    if (error) {
      setMessage("E-mail ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="login-icon"><LockKeyhole size={24} /></div>
      <label>E-mail<input type="email" name="email" autoComplete="email" required /></label>
      <label>Senha<input type="password" name="password" autoComplete="current-password" required /></label>
      <button className="button-primary" disabled={loading || !isSupabaseConfigured}>
        {loading ? "entrando..." : "abrir o estúdio"}
      </button>
      {!isSupabaseConfigured && <p className="setup-note">Modo de demonstração ativo. Adicione as variáveis do Supabase para entrar.</p>}
      {message && <p className="form-message" role="alert">{message}</p>}
    </form>
  );
}
