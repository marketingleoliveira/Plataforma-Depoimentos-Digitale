import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { Video, Mic, Send, Clock, ShieldCheck, Smartphone } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Depoimentos em vídeo — Digitale Têxtil" },
      { name: "description", content: "Compartilhe sua experiência com a Digitale Têxtil. Grave um depoimento em vídeo direto pelo navegador, em menos de 3 minutos." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" />
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--navy) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 text-foreground">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-primary text-xs uppercase tracking-[0.25em] font-semibold mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Para clientes Digitale Têxtil
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-balance">
              Conte sua experiência<br />em <span className="text-accent">poucos minutos</span>.
            </h1>
            <p className="text-lg md:text-xl text-foreground/75 max-w-2xl leading-relaxed mb-10">
              Grave um depoimento em vídeo direto do seu navegador — sem app, sem cadastro,
              sem complicação. É rápido, prático e nos ajuda demais a continuar evoluindo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/gravar"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-[var(--shadow-orange)] hover:-translate-y-0.5"
              >
                <Video className="w-5 h-5" />
                Gravar meu depoimento
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-primary/20 text-foreground font-semibold hover:bg-primary/5 transition-colors"
              >
                Como funciona
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section id="como-funciona" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <div className="text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3">Simples e rápido</div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">3 passos para enviar</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Mic, n: "01", t: "Libere a câmera", d: "Ao abrir a gravação, autorize o uso da câmera e microfone do seu dispositivo." },
            { icon: Video, n: "02", t: "Grave seu vídeo", d: "Fale por até 3 minutos sobre sua experiência. Pode regravar quantas vezes quiser." },
            { icon: Send, n: "03", t: "Envie para nós", d: "Preencha seu nome e empresa e clique em enviar. Pronto! Recebemos na hora." },
          ].map((s) => (
            <div key={s.n} className="group relative p-8 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-[var(--shadow-soft)] transition-all">
              <div className="text-7xl font-bold text-secondary leading-none mb-4 group-hover:text-accent/15 transition-colors">{s.n}</div>
              <div className="w-12 h-12 rounded-xl bg-[var(--gradient-orange)] flex items-center justify-center mb-5 shadow-[var(--shadow-orange)]">
                <s.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{s.t}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-3 gap-12">
          {[
            { icon: Clock, t: "Menos de 3 minutos", d: "Do clique à confirmação. Sem fricção, sem cadastro." },
            { icon: Smartphone, t: "Funciona no celular", d: "Grave direto do seu smartphone, tablet ou computador." },
            { icon: ShieldCheck, t: "Seguro e privado", d: "Seu vídeo é enviado apenas para a equipe da Digitale Têxtil." },
          ].map((f) => (
            <div key={f.t} className="flex gap-5">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">{f.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-5">
          Pronto para gravar?
        </h2>
        <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
          Sua opinião é fundamental para continuarmos entregando o melhor em soluções têxteis.
        </p>
        <Link
          to="/gravar"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-[var(--gradient-orange)] text-accent-foreground font-semibold hover:opacity-90 transition-all shadow-[var(--shadow-orange)] hover:-translate-y-0.5"
        >
          <Video className="w-5 h-5" />
          Começar agora
        </Link>
      </section>

      <SiteFooter />
    </div>
  );
}
