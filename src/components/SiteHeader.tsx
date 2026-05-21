import { Link } from "@tanstack/react-router";
import logo from "@/assets/digitale-logo.png";

export function SiteHeader() {
  return (
    <header className="w-full bg-background sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-center">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Digitale Têxtil" className="h-14 w-auto" />
        </Link>
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
