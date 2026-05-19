import { Link } from "@tanstack/react-router";
import logo from "@/assets/digitale-logo.png";

export function SiteHeader() {
  return (
    <header className="w-full border-b border-border/60 bg-background/90 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Digitale Têxtil" className="h-12 w-auto" />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-foreground/80 hover:text-foreground transition-colors">Início</Link>
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
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-foreground/70">
        <div>© {new Date().getFullYear()} Digitale Têxtil — Todos os direitos reservados.</div>
        <a href="https://www.digitaletextil.com.br" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">
          digitaletextil.com.br
        </a>
      </div>
    </footer>
  );
}
