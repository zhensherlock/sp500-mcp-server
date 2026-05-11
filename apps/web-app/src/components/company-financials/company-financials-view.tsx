import { useMemo, useState } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Search, Table2, TrendingUp } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@workspace/ui/components/chart'
import { Input } from '@workspace/ui/components/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
import { cn } from '@workspace/ui/lib/utils'

import type { CompanyFinancialsResult, FinancialCategory, FinancialMetric } from './types'
import {
  buildChartData,
  categoryOrder,
  formatDelta,
  formatMetricValue,
  formatPeriod,
  getDeltaTone,
  getMetricKey,
  getMetricsForItems,
  sortMetrics,
} from './utils'

type CompanyFinancialsViewProps = {
  result: CompanyFinancialsResult
}

type ChartMode = 'amounts' | 'margins' | 'eps' | 'custom'

const amountMetricItems = ['Total Revenue', 'Gross Profit', 'Operating Income', 'Net Income', 'EBITDA']
const epsMetricItems = ['Basic EPS', 'Diluted EPS']
const chartColors = ['#2563eb', '#16a34a', '#f97316', '#9333ea', '#0891b2']

export function CompanyFinancialsView({ result }: CompanyFinancialsViewProps) {
  const [chartMode, setChartMode] = useState<ChartMode>('amounts')
  const [activeCategory, setActiveCategory] = useState<FinancialCategory | 'All'>('All')
  const [metricSearch, setMetricSearch] = useState('')
  const sortedMetrics = useMemo(() => sortMetrics(result.metrics), [result.metrics])
  const defaultCustomItems = useMemo(
    () =>
      getMetricsForItems(sortedMetrics, amountMetricItems)
        .slice(0, 3)
        .map(metric => metric.item),
    [sortedMetrics],
  )
  const [customMetricItems, setCustomMetricItems] = useState<string[]>(defaultCustomItems)
  const derivedMetrics: FinancialMetric[] = useMemo(
    () =>
      (result.derived ?? []).map(metric => ({
        ...metric,
        changePercent: undefined,
      })),
    [result.derived],
  )
  const marginMetrics = useMemo(
    () => derivedMetrics.filter(metric => ['Gross Margin', 'Operating Margin', 'Net Margin'].includes(metric.item)),
    [derivedMetrics],
  )
  const amountMetrics = useMemo(() => getMetricsForItems(sortedMetrics, amountMetricItems).slice(0, 5), [sortedMetrics])
  const epsMetrics = useMemo(() => getMetricsForItems(sortedMetrics, epsMetricItems), [sortedMetrics])
  const customMetrics = useMemo(
    () => getMetricsForItems(sortedMetrics, customMetricItems).slice(0, 5),
    [customMetricItems, sortedMetrics],
  )
  const chartMetrics =
    chartMode === 'margins'
      ? marginMetrics
      : chartMode === 'eps'
        ? epsMetrics
        : chartMode === 'custom'
          ? customMetrics
          : amountMetrics
  const explorerMetrics = useMemo(() => {
    const search = metricSearch.trim().toLowerCase()

    return sortedMetrics.filter(metric => {
      const matchesCategory = activeCategory === 'All' || metric.category === activeCategory
      const matchesSearch = !search || metric.item.toLowerCase().includes(search)

      return matchesCategory && matchesSearch
    })
  }, [activeCategory, metricSearch, sortedMetrics])

  function toggleCustomMetric(metric: FinancialMetric) {
    setChartMode('custom')
    setCustomMetricItems(current => {
      if (current.includes(metric.item)) {
        return current.filter(item => item !== metric.item)
      }

      const selectedUnit = sortedMetrics.find(item => item.item === current[0])?.unit

      if (selectedUnit && selectedUnit !== metric.unit) {
        return [metric.item]
      }

      return [...current, metric.item].slice(-5)
    })
  }

  return (
    <main className="min-h-screen bg-white p-6 font-sans text-neutral-900 md:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <FinancialHeader result={result} />
        <KpiStrip result={result} />

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">Financial trend</h2>
                <p className="mt-1 text-sm text-neutral-500">Charted metrics use one unit group at a time.</p>
              </div>
              <Badge variant="secondary">{chartMetrics.length} metrics</Badge>
            </div>

            <Tabs value={chartMode} onValueChange={value => setChartMode(value as ChartMode)}>
              <TabsList>
                <TabsTrigger value="amounts">
                  <TrendingUp data-icon="inline-start" />
                  Amounts
                </TabsTrigger>
                <TabsTrigger value="margins">Margins</TabsTrigger>
                <TabsTrigger value="eps">EPS</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              <TabsContent value={chartMode} className="mt-4">
                <MetricTrendChart metrics={chartMetrics} periods={result.periods} />
              </TabsContent>
            </Tabs>
          </div>

          <MetricExplorer
            activeCategory={activeCategory}
            customMetricItems={customMetricItems}
            metricSearch={metricSearch}
            metrics={explorerMetrics}
            onCategoryChange={setActiveCategory}
            onMetricSearchChange={setMetricSearch}
            onToggleMetric={toggleCustomMetric}
            totalMetricCount={sortedMetrics.length}
          />
        </section>

        <FinancialMatrix metrics={sortedMetrics} periods={result.periods} />
      </div>
    </main>
  )
}

function FinancialHeader({ result }: { result: CompanyFinancialsResult }) {
  const periodRange =
    result.periods.length > 1
      ? `${formatPeriod(result.periods.at(-1) ?? '')} to ${formatPeriod(result.periods[0])}`
      : formatPeriod(result.periods[0] ?? '')

  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Company Financials</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-neutral-950">{result.symbol}</h1>
        <p className="mt-2 text-sm text-neutral-500">{periodRange}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
        <Badge variant="outline">{result.metadata?.metricCount ?? result.metrics.length} items</Badge>
        <Badge variant="outline">{result.periods.length} periods</Badge>
      </div>
    </header>
  )
}

function KpiStrip({ result }: { result: CompanyFinancialsResult }) {
  const highlights = result.highlights ?? []
  const fallbackMetrics = ['Total Revenue', 'Net Income', 'Diluted EPS']
    .map(item => result.metrics.find(metric => metric.item === item))
    .filter((metric): metric is FinancialMetric => Boolean(metric))
    .map(metric => ({
      item: metric.item,
      unit: metric.unit,
      latestValue: metric.latestValue,
      change: metric.change,
      changePercent: metric.changePercent,
    }))
  const items = highlights.length ? highlights : fallbackMetrics

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.slice(0, 4).map(item => (
        <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4" key={item.item}>
          <p className="truncate text-sm text-neutral-500">{item.item}</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <strong className="font-mono text-xl font-semibold tracking-tight text-neutral-950">
              {formatMetricValue(item.latestValue, item.unit)}
            </strong>
            <DeltaBadge change={item.change} label={formatDelta(item)} />
          </div>
        </div>
      ))}
    </section>
  )
}

function MetricTrendChart({ metrics, periods }: { metrics: FinancialMetric[]; periods: string[] }) {
  const chartData = useMemo(() => buildChartData(metrics, periods), [metrics, periods])
  const chartConfig = useMemo(
    () =>
      metrics.reduce<ChartConfig>((config, metric, index) => {
        config[getMetricKey(metric.item)] = {
          color: chartColors[index % chartColors.length],
          label: metric.item,
        }

        return config
      }, {}),
    [metrics],
  )
  const unit = metrics[0]?.unit ?? 'raw'

  if (!metrics.length) {
    return (
      <div className="flex min-h-80 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
        No compatible metrics are available for this chart.
      </div>
    )
  }

  return (
    <ChartContainer className="h-80 w-full" config={chartConfig}>
      <LineChart data={chartData} margin={{ left: 8, right: 16, top: 16 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="periodLabel" tickLine={false} axisLine={false} tickMargin={10} />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          width={72}
          tickFormatter={(value: number | string) => formatMetricValue(Number(value), unit)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const period = payload?.[0]?.payload?.period

                return typeof period === 'string' ? formatPeriod(period) : ''
              }}
              formatter={(value, name) => {
                const metric = metrics.find(item => getMetricKey(item.item) === String(name))

                return (
                  <>
                    <span className="text-muted-foreground">{metric?.item ?? String(name)}</span>
                    <span className="ml-auto font-mono font-medium text-foreground">
                      {formatMetricValue(Number(value), metric?.unit ?? unit)}
                    </span>
                  </>
                )
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {metrics.map((metric, index) => {
          const key = getMetricKey(metric.item)

          return (
            <Line
              activeDot={{ r: 4 }}
              connectNulls
              dataKey={key}
              dot={false}
              key={metric.item}
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              type="monotone"
              yAxisId={0}
              isAnimationActive={index < 3}
            />
          )
        })}
      </LineChart>
    </ChartContainer>
  )
}

function MetricExplorer({
  activeCategory,
  customMetricItems,
  metricSearch,
  metrics,
  onCategoryChange,
  onMetricSearchChange,
  onToggleMetric,
  totalMetricCount,
}: {
  activeCategory: FinancialCategory | 'All'
  customMetricItems: string[]
  metricSearch: string
  metrics: FinancialMetric[]
  onCategoryChange: (category: FinancialCategory | 'All') => void
  onMetricSearchChange: (value: string) => void
  onToggleMetric: (metric: FinancialMetric) => void
  totalMetricCount: number
}) {
  return (
    <aside className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Metric explorer</h2>
          <p className="mt-1 text-sm text-neutral-500">{totalMetricCount} available items</p>
        </div>
        <Table2 className="text-neutral-400" />
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2">
        <Search className="text-neutral-400" />
        <Input
          aria-label="Search financial metrics"
          className="border-0 px-0 shadow-none focus-visible:ring-0"
          onChange={event => onMetricSearchChange(event.target.value)}
          placeholder="Search items"
          value={metricSearch}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(['All', ...categoryOrder] as Array<FinancialCategory | 'All'>).map(category => (
          <Button
            key={category}
            onClick={() => onCategoryChange(category)}
            size="sm"
            type="button"
            variant={activeCategory === category ? 'secondary' : 'outline'}
          >
            {category}
          </Button>
        ))}
      </div>

      <div className="mt-4 flex max-h-96 flex-col gap-2 overflow-y-auto pr-1">
        {metrics.map(metric => {
          const checked = customMetricItems.includes(metric.item)

          return (
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3 text-sm transition-colors hover:border-neutral-300',
                checked && 'border-neutral-400 bg-neutral-100',
              )}
              key={metric.item}
            >
              <input
                checked={checked}
                className="mt-1 size-4 accent-neutral-900"
                onChange={() => onToggleMetric(metric)}
                type="checkbox"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-neutral-900">{metric.item}</span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant="outline">{metric.category}</Badge>
                  <Badge variant="secondary">{metric.unit.replace('_', ' ')}</Badge>
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </aside>
  )
}

function FinancialMatrix({ metrics, periods }: { metrics: FinancialMetric[]; periods: string[] }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Financial matrix</h2>
          <p className="mt-1 text-sm text-neutral-500">Rows are reported items; columns are fiscal periods.</p>
        </div>
        <Badge variant="outline">{metrics.length} rows</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[56rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="w-72 px-4 py-3">Item</th>
              <th className="w-32 px-4 py-3">YoY</th>
              {periods.map(period => (
                <th className="px-4 py-3 text-right" key={period}>
                  {formatPeriod(period)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map(metric => (
              <tr className="border-b border-neutral-100 last:border-b-0" key={metric.item}>
                <td className="px-4 py-3 align-top">
                  <div className="font-medium text-neutral-900">{metric.item}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Badge variant="outline">{metric.category}</Badge>
                    <Badge variant="secondary">{metric.unit.replace('_', ' ')}</Badge>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <DeltaBadge change={metric.change} label={formatDelta(metric)} />
                </td>
                {periods.map(period => (
                  <td className="px-4 py-3 text-right align-top font-mono text-neutral-800" key={period}>
                    {formatMetricValue(metric.values[period], metric.unit)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function DeltaBadge({ change, label }: { change?: number; label: string }) {
  const tone = getDeltaTone(change)

  return (
    <Badge
      className={cn(
        'font-mono',
        tone === 'positive' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        tone === 'negative' && 'border-rose-200 bg-rose-50 text-rose-700',
      )}
      variant={tone === 'neutral' ? 'outline' : 'outline'}
    >
      {label}
    </Badge>
  )
}
