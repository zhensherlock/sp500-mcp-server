const footerSlogan =
  'AI-ready S&P 500 company intelligence for MCP clients, with tools, app views, elicitation, and sampling built in.'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background px-6 py-6 xl:px-0">
      <p className="mx-auto max-w-250 text-center text-sm font-medium leading-[1.55] text-muted-foreground">
        {footerSlogan}
      </p>
    </footer>
  )
}
