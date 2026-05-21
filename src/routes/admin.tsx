import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Clock, LogOut, Search, Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Depoimentos Digitale Têxtil" }] }),
  component: AdminPage,
});

type Testimonial = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  message: string | null;
  video_path: string;
  duration_seconds: number | null;
  status: string;
};

type StatusFilter = "all" | "new" | "approved" | "rejected";

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleString("pt-BR"); } catch { return iso; }
}
function fmtDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string; Icon: typeof Clock }> = {
    new: { label: "Novo", cls: "bg-primary/10 text-primary", Icon: Clock },
    approved: { label: "Aprovado", cls: "bg-green-100 text-green-700", Icon: CheckCircle2 },
    rejected: { label: "Rejeitado", cls: "bg-red-100 text-red-700", Icon: XCircle },
  };
  const m = map[status] ?? map.new;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${m.cls}`}>
      <m.Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}

function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate({ to: "/login" });
        return;
      }
      setEmail(data.session.user.email ?? "");
      setChecking(false);
    })();
  }, [navigate]);

  useEffect(() => {
    if (checking) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checking]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("id,created_at,name,company,message,video_path,duration_seconds,status")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data as Testimonial[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: "approved" | "rejected" | "new") {
    setBusyId(id);
    const { error } = await supabase.from("testimonials").update({ status }).eq("id", id);
    if (!error) setItems((arr) => arr.map((t) => (t.id === id ? { ...t, status } : t)));
    setBusyId(null);
  }

  async function remove(id: string, video_path: string) {
    if (!confirm("Excluir este depoimento? Esta ação não pode ser desfeita.")) return;
    setBusyId(id);
    await supabase.storage.from("testimonials").remove([video_path]);
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (!error) setItems((arr) => arr.filter((t) => t.id !== id));
    setBusyId(null);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  }

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (filter !== "all" && t.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        if (!t.name.toLowerCase().includes(q) && !(t.company ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, query]);

  const counts = useMemo(() => ({
    all: items.length,
    new: items.filter((t) => t.status === "new").length,
    approved: items.filter((t) => t.status === "approved").length,
    rejected: items.filter((t) => t.status === "rejected").length,
  }), [items]);

  function videoUrl(path: string) {
    return supabase.storage.from("testimonials").getPublicUrl(path).data.publicUrl;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Depoimentos recebidos</h1>
            <p className="text-sm text-foreground/70 mt-1">Logado como {email}</p>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm px-4 h-10 rounded-lg border border-border hover:bg-secondary text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "new", "approved", "rejected"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 h-9 rounded-full text-sm font-medium border transition-colors ${
                filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground/80 border-border hover:bg-secondary"
              }`}
            >
              {{ all: "Todos", new: "Novos", approved: "Aprovados", rejected: "Rejeitados" }[f]} ({counts[f]})
            </button>
          ))}
          <div className="ml-auto relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou empresa"
              className="h-9 w-72 pl-9 pr-3 rounded-full border border-border bg-background text-sm text-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-foreground/60">Nenhum depoimento encontrado.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((t) => (
              <article key={t.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <video
                  src={videoUrl(t.video_path)}
                  controls
                  preload="metadata"
                  className="w-full aspect-video bg-black"
                />
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{t.name}</h3>
                      {t.company && <p className="text-sm text-foreground/70">{t.company}</p>}
                    </div>
                    {statusBadge(t.status)}
                  </div>
                  <div className="text-xs text-foreground/60 flex gap-3">
                    <span>{fmtDate(t.created_at)}</span>
                    <span>· {fmtDuration(t.duration_seconds)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-auto pt-3">
                    <button
                      disabled={busyId === t.id || t.status === "approved"}
                      onClick={() => updateStatus(t.id, "approved")}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Aprovar
                    </button>
                    <button
                      disabled={busyId === t.id || t.status === "rejected"}
                      onClick={() => updateStatus(t.id, "rejected")}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" /> Rejeitar
                    </button>
                    <a
                      href={videoUrl(t.video_path)}
                      download
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-secondary"
                    >
                      <Download className="h-4 w-4" /> Baixar
                    </a>
                    <button
                      disabled={busyId === t.id}
                      onClick={() => remove(t.id, t.video_path)}
                      className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 ml-auto disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
