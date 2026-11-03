'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { useLoadStagger } from '@/hooks/useEntranceAnimation'

export default function Header({ variant = 'site' }: { variant?: 'site' | 'workspace' }) {
  const isWorkspace = variant === 'workspace'
  const pathname = usePathname()
  const headerRef = useRef<HTMLElement>(null)
  const isToolsPage = pathname === '/tools'

  useLoadStagger(headerRef, {
    selector: '[data-header-entrance]',
    y: -10,
    duration: 0.5,
    stagger: 0.05,
  })

  return (
    <header ref={headerRef} className="border-b border-[#DCE8F5] bg-white">
      <div
        className={cn(
          'mx-auto flex h-19.5 items-center justify-between gap-4 px-4 sm:px-6',
          isWorkspace ? 'w-full' : 'max-w-312 xl:px-0',
        )}
      >
        <Link
          href="/"
          className={cn(
            'flex min-h-11 min-w-11 shrink-0 items-center gap-3 text-foreground no-underline',
            !isWorkspace && 'animate-on-load',
          )}
          data-header-entrance={isWorkspace ? undefined : true}
        >
          <Image src="/logo.png" alt="S&P 500 MCP" width={38} height={38} className="size-9.5" priority />
          <span className="font-heading hidden text-[18px] font-bold leading-5.75 text-[#071A33] min-[480px]:inline">
            S&amp;P 500 MCP
          </span>
        </Link>
        <nav className="flex shrink-0 items-center gap-4 sm:gap-8">
          <Link
            href="/playground"
            aria-current={pathname === '/playground' ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-11 items-center rounded-sm text-sm font-bold text-[#53657A] no-underline outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/30 aria-[current=page]:text-primary',
              !isWorkspace && 'animate-on-load',
            )}
            data-header-entrance={isWorkspace ? undefined : true}
          >
            Playground
          </Link>
          <Link
            href="/tools"
            aria-current={isToolsPage ? 'page' : undefined}
            className={cn(
              'inline-flex h-10.5 items-center rounded-sm px-2 text-[15px] font-extrabold leading-4.5 text-[#53657A] no-underline transition-colors outline-none hover:text-[#071A33] focus-visible:text-[#071A33] focus-visible:ring-3 focus-visible:ring-[#2563EB]/30 aria-[current=page]:text-[#071A33]',
              !isWorkspace && 'animate-on-load',
            )}
            data-header-entrance={isWorkspace ? undefined : true}
          >
            Tools
          </Link>
          <Link
            href="/#quick-start"
            aria-label="Get Started"
            className={cn(
              'inline-flex h-10.5 w-10.5 items-center justify-center gap-2 rounded-full bg-[#2563EB] text-[14px] font-extrabold leading-4.25 text-white no-underline shadow-[0_8px_18px_rgba(37,99,235,0.15)] outline-none transition-colors hover:bg-[#1d4ed8] focus-visible:ring-3 focus-visible:ring-[#2563EB]/30 sm:w-33.5',
              !isWorkspace && 'animate-on-load',
            )}
            data-header-entrance={isWorkspace ? undefined : true}
          >
            <span className="hidden sm:inline">Get Started</span>
            <ArrowRight className="size-3.75" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
