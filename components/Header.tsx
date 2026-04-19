import ThemeToggle from "./ThemeToggle";
import Link from "next/link";

export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <img src="/logo.svg" alt="S&P 500 MCP" className="logo-img" />
          <span className="logo-text">S&P 500 MCP</span>
        </Link>
        <nav className="nav">
          <Link href="/tools" className="nav-link">
            Tools
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
