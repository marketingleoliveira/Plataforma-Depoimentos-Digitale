import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Video } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vídeo de Parceria — Digitale Têxtil" },
      { name: "description", content: "Envie seu vídeo de parceria com a Digitale Têxtil em poucos minutos, direto pelo navegador." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6">
        <Link
          to="/gravar"
          className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-accent text-accent-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-[var(--shadow-orange)] hover:-translate-y-0.5"
        >
          <Video className="w-6 h-6" />
          Enviar Vídeo de Parceria
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}