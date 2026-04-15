import './globals.css'

export const metadata = {
  title: 'S&P 500 MCP Server',
  description: 'S&P 500 Index data and analysis via MCP',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
