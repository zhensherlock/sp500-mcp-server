'use client'

import { useEffect, useRef, useState } from 'react'

export default function VideoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} className="relative py-12">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-muted/30 to-transparent" />
      <div
        className={`relative max-w-4xl mx-auto px-6 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative rounded-xl overflow-hidden shadow-lg border border-border/20">
          <video autoPlay muted loop playsInline src="/video.mp4" className="w-full" />
        </div>
      </div>
    </div>
  )
}
