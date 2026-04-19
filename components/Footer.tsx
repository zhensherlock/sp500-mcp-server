export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border py-8 px-6">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between text-sm text-muted-foreground">
        <p>S&P 500 MCP Server</p>
        <div className="flex gap-6">
          <a href="/tools" className="text-muted-foreground no-underline transition-colors hover:text-foreground">
            Documentation
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
