'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { useHeroEntrance } from '@/hooks/useEntranceAnimation'

const SoftAurora = dynamic(() => import('@/components/SoftAurora'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
})

export default function HeroSection() {
  const { theme } = useTheme()
  const heroRef = useRef<HTMLDivElement>(null)

  useHeroEntrance(heroRef)

  const auroraColors =
    theme === 'dark' ? { color1: '#f7f7f7', color2: '#e100ff' } : { color1: '#ea580c', color2: '#f97316' }

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <SoftAurora
          speed={0.6}
          scale={1.5}
          brightness={1}
          color1={auroraColors.color1}
          color2={auroraColors.color2}
          noiseFrequency={2.5}
          noiseAmplitude={1}
          bandHeight={0.45}
          bandSpread={0.4}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={1}
          enableMouseInteraction={false}
          mouseInfluence={0.25}
        />
      </div>
      <div className="relative z-20 text-center px-6 py-16 max-w-250">
        <h1 className="hero-title animate-on-load text-[clamp(3rem,8vw,5rem)] font-bold tracking-tight leading-none mb-6 text-foreground">
          S&P 500 MCP
        </h1>
        <p className="hero-tagline animate-on-load text-[clamp(1.5rem,4vw,2rem)] leading-relaxed max-w-[80ch] mx-auto mb-12">
          <span className="text-foreground hero-chars">
            <span className="whitespace-nowrap">
              {'Empower your AI to read the U.S. stock market — real-time'.split('').map((char, i) => (
                <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
            <span className="whitespace-nowrap">
              {'S&P 500 company data, precise search, total visibility.'.split('').map((char, i) => (
                <span key={i} className="hero-char inline-block" style={{ opacity: 0 }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </span>
          </span>
        </p>
        <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
          <div className="hero-stat animate-on-load text-center">
            <div className="text-2xl font-semibold font-mono text-foreground">500</div>
            <div className="text-sm text-muted-foreground mt-1">Companies</div>
          </div>
          <div className="hero-divider animate-on-load w-px h-8 bg-border" />
          <div className="hero-stat animate-on-load text-center">
            <div className="text-2xl font-semibold font-mono text-foreground">1957</div>
            <div className="text-sm text-muted-foreground mt-1">Established</div>
          </div>
          <div className="hero-divider animate-on-load w-px h-8 bg-border" />
          <div className="hero-stat animate-on-load text-center">
            <div className="text-2xl font-semibold font-mono text-foreground">MCP</div>
            <div className="text-sm text-muted-foreground mt-1">Protocol</div>
          </div>
        </div>
      </div>
    </section>
  )
}
