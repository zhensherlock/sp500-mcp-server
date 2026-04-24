"use client";

import { useEffect, useRef, RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHeroEntrance(
  containerRef: RefObject<HTMLElement | null>
) {
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(
        containerRef.current?.querySelectorAll(".hero-title, .hero-tagline, .hero-stat, .hero-divider") || [],
        { opacity: 1, y: 0, scaleX: 1 }
      );
      return;
    }

    ctxRef.current = gsap.context(() => {
      const title = containerRef.current?.querySelector(".hero-title");
      const tagline = containerRef.current?.querySelector(".hero-tagline");
      const stats = containerRef.current?.querySelectorAll(".hero-stat");
      const divider = containerRef.current?.querySelector(".hero-divider");

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      if (title) {
        tl.fromTo(title, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
      }

      if (tagline) {
        const chars = tagline.querySelectorAll(".hero-char");
        if (chars.length > 0) {
          tl.set(tagline, { opacity: 1 }, 0);
          tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.03, stagger: 0.02, ease: "none" }, 0.3);
        } else {
          tl.fromTo(tagline, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0.4);
        }
      }

      if (stats && stats.length > 0) {
        tl.fromTo(stats, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 2.5);
      }

      if (divider) {
        tl.fromTo(divider, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.4, ease: "power1.inOut" }, 2.4);
      }
    }, containerRef);

    return () => {
      ctxRef.current?.revert();
    };
  }, [containerRef]);
}

export function useScrollStagger(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  options: { stagger?: number; y?: number; start?: string } = {}
) {
  const { stagger = 0.1, y = 25, start = "top 85%" } = options;
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      gsap.set(containerRef.current.querySelectorAll(itemSelector), { opacity: 1, y: 0 });
      return;
    }

    ctxRef.current = gsap.context(() => {
      const items = containerRef.current?.querySelectorAll(itemSelector);
      if (!items || items.length === 0) return;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start,
        onEnter: () => {
          gsap.fromTo(
            items,
            { opacity: 0, y },
            { opacity: 1, y: 0, duration: 0.5, stagger, ease: "power2.out" }
          );
        },
        once: true,
      });
    }, containerRef);

    return () => {
      ctxRef.current?.revert();
    };
  }, [containerRef, itemSelector, stagger, y, start]);
}
