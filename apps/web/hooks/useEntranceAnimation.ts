'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

type EntranceConditions = {
  isDesktop?: boolean
  reduceMotion?: boolean
}

type LoadStaggerOptions = {
  delay?: number
  duration?: number
  ease?: string
  selector?: string
  stagger?: number
  y?: number
}

function getConditions(context: gsap.Context) {
  return (context.conditions ?? {}) as EntranceConditions
}

function revealEntranceTargets(targets: gsap.TweenTarget) {
  gsap.set(targets, {
    autoAlpha: 1,
    scale: 1,
    x: 0,
    y: 0,
    clearProps: 'transform,visibility',
  })
}

export function useLoadStagger(
  containerRef: RefObject<HTMLElement | null>,
  {
    delay = 0,
    duration = 0.62,
    ease = 'power3.out',
    selector = '[data-load-entrance]',
    stagger = 0.07,
    y = 18,
  }: LoadStaggerOptions = {},
) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const query = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduceMotion } = getConditions(context)
        const targets = query(selector)
        if (!targets.length) return

        if (reduceMotion) {
          revealEntranceTargets(targets)
          return
        }

        gsap.fromTo(
          targets,
          {
            autoAlpha: 0,
            y: isDesktop ? y : Math.round(y * 0.7),
          },
          {
            autoAlpha: 1,
            y: 0,
            delay,
            duration,
            ease,
            stagger: { each: stagger, from: 'start' },
            clearProps: 'transform,visibility',
            overwrite: 'auto',
          },
        )
      },
      root,
    )

    return () => {
      mm.revert()
    }
  }, [containerRef, delay, duration, ease, selector, stagger, y])
}

export function useHeroEntrance(containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const query = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduceMotion } = getConditions(context)
        const copy = query('[data-hero-entrance]')
        const visual = query('[data-hero-visual]')
        const statIcons = query('[data-hero-stat-icon]')
        const targets = [...copy, ...visual]

        if (reduceMotion) {
          revealEntranceTargets([...targets, ...statIcons])
          return
        }

        gsap.set(copy, {
          autoAlpha: 0,
          y: isDesktop ? 28 : 18,
        })
        gsap.set(visual, {
          autoAlpha: 0,
          scale: isDesktop ? 1.035 : 1.015,
          x: isDesktop ? 34 : 0,
          y: isDesktop ? 0 : 18,
          transformOrigin: '65% 50%',
        })
        gsap.set(statIcons, {
          scale: 0.88,
          y: 6,
          transformOrigin: '50% 50%',
        })

        const tl = gsap.timeline({
          defaults: {
            ease: 'power3.out',
            overwrite: 'auto',
          },
        })

        if (copy.length) {
          tl.to(
            copy,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              stagger: { each: 0.08, from: 'start' },
              clearProps: 'transform,visibility',
            },
            0.08,
          )
        }

        if (visual.length) {
          tl.to(
            visual,
            {
              autoAlpha: 1,
              scale: 1,
              x: 0,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              clearProps: 'transform,visibility',
            },
            0.18,
          )
        }

        if (statIcons.length) {
          tl.to(
            statIcons,
            {
              scale: 1,
              y: 0,
              duration: 0.48,
              ease: 'back.out(1.35)',
              stagger: 0.06,
              clearProps: 'transform',
            },
            0.54,
          )
        }
      },
      root,
    )

    return () => {
      mm.revert()
    }
  }, [containerRef])
}

export function useScrollStagger(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  options: { stagger?: number; y?: number; start?: string } = {},
) {
  const { stagger = 0.1, y = 25, start = 'top 85%' } = options

  useEffect(() => {
    const root = containerRef.current
    if (!root) return

    const query = gsap.utils.selector(root)
    const mm = gsap.matchMedia()

    mm.add(
      {
        isDesktop: '(min-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      context => {
        const { isDesktop, reduceMotion } = getConditions(context)
        const items = query(itemSelector)
        if (!items.length) return

        if (reduceMotion) {
          revealEntranceTargets(items)
          return
        }

        gsap.set(items, {
          autoAlpha: 0,
          y: isDesktop ? y : Math.round(y * 0.72),
        })

        ScrollTrigger.create({
          trigger: root,
          start,
          onEnter: () => {
            gsap.to(items, {
              autoAlpha: 1,
              y: 0,
              duration: 0.58,
              stagger,
              ease: 'power2.out',
              clearProps: 'transform,visibility',
              overwrite: 'auto',
            })
          },
          once: true,
        })
      },
      root,
    )

    return () => {
      mm.revert()
    }
  }, [containerRef, itemSelector, stagger, y, start])
}
