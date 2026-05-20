import Image from 'next/image'
import { Building2, CalendarCheck, PlugZap, Sparkles } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'

const stats = [
  {
    label: 'Companies',
    value: '500',
    icon: Building2,
    className: 'bg-blue-soft text-primary',
  },
  {
    label: 'Established',
    value: '1957',
    icon: CalendarCheck,
    className: 'bg-success-soft text-success',
  },
  {
    label: 'Protocol',
    value: 'MCP',
    icon: PlugZap,
    className: 'bg-violet-soft text-violet',
  },
]

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-hero-background px-6 py-16 lg:min-h-130 lg:py-0 xl:px-0">
      <Image
        src="/landing/hero-market.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pointer-events-none hidden object-contain max-[1561px]:object-cover md:block object-center"
      />
      <div className="relative mx-auto flex max-w-312 flex-col items-start justify-center lg:h-130">
        <div className="flex w-full max-w-136.25 flex-col items-start gap-8 md:max-[1080px]:max-w-[min(52vw,30rem)]">
          <Badge
            variant="outline"
            className="h-auto gap-2 rounded-4xl bg-card px-4 py-2 text-sm text-primary shadow-(--shadow-card) has-data-[icon=inline-start]:pl-4 [&>svg]:size-4!"
          >
            <Sparkles data-icon="inline-start" aria-hidden="true" />
            AI-ready market intelligence
          </Badge>
          <div className="flex flex-col gap-6">
            <h1 className="font-heading text-[clamp(3.5rem,7vw,4.5rem)] font-extrabold leading-[0.95] text-foreground max-[1080px]:text-[clamp(3rem,6vw,3.75rem)]">
              S&amp;P 500 MCP
            </h1>
            <p className="text-xl leading-normal text-muted-foreground">
              Empowering AI to read the U.S. stock market with real-time S&amp;P 500 company data, precise search, and
              total visibility.
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 ${index > 0 ? 'sm:border-l sm:border-border sm:pl-5' : ''}`}
                >
                  <span className={`flex size-10.5 items-center justify-center rounded-xl ${stat.className}`}>
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-heading text-2xl font-extrabold leading-none text-foreground">
                      {stat.value}
                    </span>
                    <span className="mt-1 text-[13px] font-medium text-muted-foreground">{stat.label}</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
