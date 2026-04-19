import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-300 mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline text-foreground">
          <img src="/logo.svg" alt="S&P 500 MCP" className="w-8 h-8" />
          <span className="font-semibold text-lg tracking-tight">S&P 500 MCP</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/tools"
            className="text-sm font-medium text-muted-foreground no-underline px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-accent"
          >
            Tools
          </Link>
          <a
            href="https://github.com/zhensherlock/sp500-mcp-server"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block text-sm font-medium text-muted-foreground no-underline px-3 py-2 rounded-md transition-colors hover:text-foreground hover:bg-accent"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
