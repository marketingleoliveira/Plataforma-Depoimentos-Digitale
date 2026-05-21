import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Admin Digitale Têxtil" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    navigate({ to: "/admin" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-sm space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Acesso administrativo</h1>
            <p className="text-sm text-foreground/70">Entre para gerenciar os depoimentos recebidos.</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground"
              autoComplete="email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-foreground"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-[image:var(--gradient-orange)] text-white font-semibold shadow-[var(--shadow-orange)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Entrar
          </button>
          <Link to="/" className="block text-center text-sm text-foreground/60 hover:text-foreground">Voltar ao site</Link>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
