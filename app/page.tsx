export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-32">
        <div className="text-center">
          <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
            S&P 500
          </h1>
          <p className="mt-6 text-xl leading-relaxed text-gray-400">
            The Standard & Poor's 500 Index tracks the performance of 500 of
            <br />
            America's largest publicly traded companies and is widely regarded
            <br />
            as the benchmark for the U.S. stock market.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div>
              <div className="text-2xl font-semibold text-white">500</div>
              <div className="mt-1">Companies</div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div>
              <div className="text-2xl font-semibold text-white">1957</div>
              <div className="mt-1">Established</div>
            </div>
            <div className="h-8 w-px bg-gray-800" />
            <div>
              <div className="text-2xl font-semibold text-white">MCP</div>
              <div className="mt-1">Data Tool</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
