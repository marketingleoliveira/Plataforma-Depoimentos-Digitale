import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/obrigado")({
  head: () => ({
    meta: [
      { title: "Obrigado! — Digitale Têxtil" },
      { name: "description", content: "Seu depoimento foi enviado com sucesso." },
    ],
  }),
  component: ThankYou,
});

function ThankYou() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[image:var(--gradient-orange)] flex items-center justify-center mb-8 shadow-[var(--shadow-orange)]">
            <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">Obrigado!</h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Recebemos seu depoimento com sucesso. Sua contribuição é muito importante
            para a Digitale Têxtil. A nossa equipe vai assistir em breve.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="px-8 py-3.5 rounded-full border border-border text-foreground font-medium hover:bg-secondary transition-colors">
              Voltar ao início
            </Link>
            <a href="https://www.digitaletextil.com.br" target="_blank" rel="noreferrer"
               className="px-8 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-orange)]">
              Visitar digitaletextil.com.br
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
