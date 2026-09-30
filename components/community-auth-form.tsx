"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CommunityAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() ?? "";
    const password = formData.get("password")?.toString() ?? "";
    const displayName = formData.get("display_name")?.toString().trim() ?? "";
    const supabase = createClient();

    if (!supabase) {
      setMessage("O cadastro ainda não está configurado.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/community`
        }
      });
      if (error) {
        setMessage(error.message.includes("already") ? "Este e-mail já possui uma conta." : error.message);
      } else if (data.session) {
        router.push("/community");
        router.refresh();
        return;
      } else {
        setMessage("Conta criada! Confira seu e-mail para confirmar o cadastro.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("E-mail ou senha incorretos.");
      } else {
        router.push("/community");
        router.refresh();
        return;
      }
    }
    setLoading(false);
  }

  return (
    <div className="community-auth-card">
      <div className="auth-tabs" role="tablist" aria-label="Acesso à comunidade">
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>
          criar conta
        </button>
        <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>
          entrar
        </button>
      </div>
      <form className="login-form community-login-form" onSubmit={handleSubmit}>
        <div className="login-icon">{mode === "signup" ? <UserPlus size={24} /> : <LogIn size={24} />}</div>
        {mode === "signup" && <label>Nome público<input type="text" name="display_name" minLength={2} maxLength={60} autoComplete="name" required /></label>}
        <label>E-mail<input type="email" name="email" autoComplete="email" required /></label>
        <label>Senha<input type="password" name="password" minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></label>
        <button className="button-primary" disabled={loading}>
          {loading ? "aguarde..." : mode === "signup" ? "criar minha conta" : "entrar na comunidade"}
        </button>
        {message && <p className="form-message" role="status">{message}</p>}
      </form>
    </div>
  );
}
