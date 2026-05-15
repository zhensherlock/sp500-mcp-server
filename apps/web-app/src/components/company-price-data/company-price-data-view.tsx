import type { CompanyPriceDataRow, CompanyPriceDataResult } from './types'
import { formatDate, formatPrice, formatVolume } from './utils'

type CompanyPriceDataViewProps = {
  result: CompanyPriceDataResult
}

export function CompanyPriceDataView({ result }: CompanyPriceDataViewProps) {
  const sortedPrices = [...result.prices].sort((a, b) => a.trade_date.localeCompare(b.trade_date))
  const latestPrice = result.prices[0]
  const previousPrice = result.prices[1]
  const latestChange = latestPrice && previousPrice ? latestPrice.close - previousPrice.close : undefined
  const latestChangePercent =
    latestChange !== undefined && previousPrice?.close ? latestChange / previousPrice.close : undefined

  return (
    <main className="min-h-screen bg-white p-8 font-sans">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Daily OHLCV</p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{result.symbol}</h1>
          </div>
          <div className="grid gap-2 text-right sm:grid-cols-2 sm:text-left">
            <MetricLabel label="Latest close" value={latestPrice ? `$${formatPrice(latestPrice.close)}` : '-'} />
            <MetricLabel
              label="Daily move"
              tone={latestChange === undefined ? 'neutral' : latestChange >= 0 ? 'positive' : 'negative'}
              value={
                latestChange !== undefined && latestChangePercent !== undefined
                  ? `${latestChange >= 0 ? '+' : ''}${formatPrice(latestChange)} (${formatPercent(latestChangePercent)})`
                  : '-'
              }
            />
          </div>
        </header>

        <PriceChart prices={sortedPrices} />

        <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-184 border-collapse text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Open</th>
                  <th className="px-4 py-3 text-right font-semibold">High</th>
                  <th className="px-4 py-3 text-right font-semibold">Low</th>
                  <th className="px-4 py-3 text-right font-semibold">Close</th>
                  <th className="px-4 py-3 text-right font-semibold">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {result.prices.map(price => (
                  <PriceRow key={`${result.symbol}-${price.trade_date}`} price={price} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function MetricLabel({
  label,
  tone = 'neutral',
  value,
}: {
  label: string
  tone?: 'negative' | 'neutral' | 'positive'
  value: string
}) {
  const toneClassName =
    tone === 'positive' ? 'text-emerald-700' : tone === 'negative' ? 'text-rose-700' : 'text-neutral-900'

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</p>
      <p className={`mt-1 whitespace-nowrap text-sm font-semibold tabular-nums ${toneClassName}`}>{value}</p>
    </div>
  )
}

function PriceChart({ prices }: { prices: CompanyPriceDataRow[] }) {
  if (!prices.length) {
    return null
  }

  const width = 960
  const priceHeight = 300
  const volumeHeight = 86
  const gap = 20
  const height = priceHeight + volumeHeight + gap
  const padding = { bottom: 20, left: 20, right: 64, top: 24 }
  const chartWidth = width - padding.left - padding.right
  const priceBottom = padding.top + priceHeight
  const volumeBottom = height - padding.bottom
  const priceValues = prices.flatMap(price => [price.open, price.high, price.low, price.close])
  const minPrice = Math.min(...priceValues)
  const maxPrice = Math.max(...priceValues)
  const priceRange = maxPrice - minPrice || Math.max(maxPrice, 1) * 0.02
  const paddedMinPrice = minPrice - priceRange * 0.06
  const paddedMaxPrice = maxPrice + priceRange * 0.06
  const paddedPriceRange = paddedMaxPrice - paddedMinPrice
  const maxVolume = Math.max(...prices.map(price => price.volume), 1)
  const step = chartWidth / Math.max(prices.length - 1, 1)
  const candleWidth = Math.max(3, Math.min(12, step * 0.58))
  const yForPrice = (value: number) => priceBottom - ((value - paddedMinPrice) / paddedPriceRange) * priceHeight
  const xForIndex = (index: number) => padding.left + step * index
  const priceTicks = getPriceTicks(paddedMinPrice, paddedMaxPrice)
  const dateTicks = getDateTicks(prices)

  return (
    <section className="mb-6 rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Candlestick Chart</h2>
          <p className="mt-1 text-sm text-neutral-500">
            {formatDate(prices[0].trade_date)} to {formatDate(prices.at(-1)?.trade_date ?? prices[0].trade_date)}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-neutral-500">
          <LegendSwatch className="bg-emerald-600" label="Up" />
          <LegendSwatch className="bg-rose-600" label="Down" />
          <LegendSwatch className="bg-neutral-300" label="Volume" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          aria-label={`${prices.length} daily candlesticks with volume`}
          className="block h-auto min-w-[44rem] text-neutral-500"
          role="img"
          viewBox={`0 0 ${width} ${height}`}
        >
          <rect fill="#ffffff" height={height} width={width} x={0} y={0} />

          {priceTicks.map(tick => {
            const y = yForPrice(tick)

            return (
              <g key={tick}>
                <line stroke="#e5e5e5" strokeWidth="1" x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text fill="#737373" fontSize="12" textAnchor="start" x={width - padding.right + 10} y={y + 4}>
                  {formatPrice(tick)}
                </text>
              </g>
            )
          })}

          <line
            stroke="#d4d4d4"
            strokeWidth="1"
            x1={padding.left}
            x2={width - padding.right}
            y1={priceBottom}
            y2={priceBottom}
          />
          <line
            stroke="#e5e5e5"
            strokeWidth="1"
            x1={padding.left}
            x2={width - padding.right}
            y1={volumeBottom}
            y2={volumeBottom}
          />

          {prices.map((price, index) => {
            const x = xForIndex(index)
            const isUp = price.close >= price.open
            const color = isUp ? '#059669' : '#e11d48'
            const wickHigh = Math.max(price.high, price.open, price.close)
            const wickLow = Math.min(price.low, price.open, price.close)
            const yHigh = yForPrice(wickHigh)
            const yLow = yForPrice(wickLow)
            const yOpen = yForPrice(price.open)
            const yClose = yForPrice(price.close)
            const bodyY = Math.min(yOpen, yClose)
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5)
            const volumeBarHeight = (price.volume / maxVolume) * volumeHeight

            return (
              <g key={price.trade_date}>
                <line stroke={color} strokeLinecap="round" strokeWidth="1.5" x1={x} x2={x} y1={yHigh} y2={yLow} />
                <rect fill={color} height={bodyHeight} rx="1.5" width={candleWidth} x={x - candleWidth / 2} y={bodyY} />
                <rect
                  fill={isUp ? '#a7f3d0' : '#fecdd3'}
                  height={volumeBarHeight}
                  width={Math.max(1.5, candleWidth * 0.78)}
                  x={x - Math.max(1.5, candleWidth * 0.78) / 2}
                  y={volumeBottom - volumeBarHeight}
                />
              </g>
            )
          })}

          {dateTicks.map(({ index, label }) => {
            const x = xForIndex(index)

            return (
              <g key={`${index}-${label}`}>
                <line stroke="#e5e5e5" strokeWidth="1" x1={x} x2={x} y1={priceBottom} y2={volumeBottom} />
                <text fill="#737373" fontSize="12" textAnchor="middle" x={x} y={height - 4}>
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </section>
  )
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${className}`} />
      {label}
    </span>
  )
}

function PriceRow({ price }: { price: CompanyPriceDataRow }) {
  return (
    <tr>
      <td className="whitespace-nowrap px-4 py-3 font-medium text-neutral-900">{formatDate(price.trade_date)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatPrice(price.open)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatPrice(price.high)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatPrice(price.low)}</td>
      <td className="px-4 py-3 text-right tabular-nums">{formatPrice(price.close)}</td>
      <td className="px-4 py-3 text-right tabular-nums text-neutral-600">{formatVolume(price.volume)}</td>
    </tr>
  )
}

function getPriceTicks(min: number, max: number) {
  const segments = 4
  const step = (max - min) / segments

  return Array.from({ length: segments + 1 }, (_, index) => max - step * index)
}

function getDateTicks(prices: CompanyPriceDataRow[]) {
  const tickCount = Math.min(5, prices.length)
  const includeYear = new Set(prices.map(price => price.trade_date.slice(0, 4))).size > 1

  if (tickCount <= 1) {
    return [{ index: 0, label: getShortDateLabel(prices[0].trade_date, includeYear) }]
  }

  return Array.from({ length: tickCount }, (_, tickIndex) => {
    const index = Math.round((tickIndex / (tickCount - 1)) * (prices.length - 1))

    return {
      index,
      label: getShortDateLabel(prices[index].trade_date, includeYear),
    }
  })
}

function getShortDateLabel(value: string, includeYear: boolean) {
  const date = new Date(`${value}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en', {
    day: includeYear ? undefined : '2-digit',
    month: 'short',
    timeZone: 'UTC',
    year: includeYear ? 'numeric' : undefined,
  }).format(date)
}

function formatPercent(value: number) {
  return new Intl.NumberFormat('en', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'percent',
  }).format(value)
}
