import { Link } from "@tanstack/react-router";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--gradient-navy)] flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm tracking-tight">DT</span>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-foreground tracking-tight text-sm">Digitale Têxtil</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent font-semibold">Depoimentos</div>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Início</Link>
          <Link to="/gravar" className="px-5 py-2 rounded-full bg-accent text-accent-foreground font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-orange)]">
            Gravar depoimento
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>© {new Date().getFullYear()} Digitale Têxtil — Todos os direitos reservados.</div>
        <a href="https://www.digitaletextil.com.br" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
          digitaletextil.com.br
        </a>
      </div>
    </footer>
  );
}
