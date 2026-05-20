'use client'

import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { Tool } from '@/app/tools/data'
import { cn } from '@workspace/ui/lib/utils'

export const toolIconPaths: Record<string, string> = {
  get_company_info: '/tool-icons/get-company-info.png',
  get_company_news: '/tool-icons/get-company-news.png',
  get_company_officers: '/tool-icons/get-company-officers.png',
  get_company_filings: '/tool-icons/get-company-filings.png',
  get_company_financials: '/tool-icons/get-company-financials.png',
  get_company_price_data: '/tool-icons/get-company-price-data.png',
}

export function getToolIconPath(toolName: string) {
  return toolIconPaths[toolName] ?? '/logo.png'
}

interface ToolCardProps {
  active?: boolean
  onOpen: (tool: Tool) => void
  tool: Tool
}

export default function ToolCard({ active = false, onOpen, tool }: ToolCardProps) {
  const iconPath = getToolIconPath(tool.name)

  return (
    <button
      type="button"
      className="group relative h-34 w-full cursor-pointer text-left xl:w-153"
      onClick={() => onOpen(tool)}
      aria-label={`Open details for ${tool.name}`}
    >
      <span
        className={cn(
          'absolute inset-0 rounded-[20px] border border-[#DCE8F5] bg-white shadow-[0_12px_24px_rgba(18,54,92,0.05)] transition-colors group-hover:border-[#93C5FD] group-hover:bg-[#F8FBFF]',
          active && 'border-[1.5px] border-[#93C5FD] bg-[#F8FBFF] shadow-[0_18px_30px_rgba(37,99,235,0.11)]',
        )}
      />
      <span
        className={cn(
          'absolute left-5.5 top-5 flex size-17 items-center justify-center overflow-hidden rounded-[21px] border border-[#DCE8F5] bg-[#EEF5FC] shadow-[0_10px_20px_rgba(18,54,92,0.07)]',
          active && 'border-[1.5px] border-[#93C5FD] shadow-[0_12px_22px_rgba(37,99,235,0.13)]',
        )}
      >
        <Image src={iconPath} alt="" width={68} height={68} className="object-cover" />
      </span>
      <span className="absolute left-27.5 right-18 top-5.5 truncate font-mono text-[16px] font-extrabold leading-5.25 text-[#071A33] xl:right-25.5">
        {tool.name}
      </span>
      <span className="absolute left-27.5 right-18 top-13 line-clamp-4 text-[14px] font-normal leading-[1.35] text-[#53657A] xl:right-25.5">
        {tool.description}
      </span>
      <span
        className={cn(
          'absolute flex items-center justify-center text-[#9AAABD] transition-all group-hover:right-5.5 group-hover:top-5 group-hover:size-8.5 group-hover:rounded-full group-hover:bg-[#2563EB] group-hover:text-white group-hover:shadow-[0_8px_16px_rgba(37,99,235,0.18)]',
          active
            ? 'right-5.5 top-5 size-8.5 rounded-full bg-[#2563EB] text-white shadow-[0_8px_16px_rgba(37,99,235,0.18)] group-hover:text-white'
            : 'right-7 top-7 size-4',
        )}
      >
        <ArrowUpRight className="size-3.5 group-hover:size-3.5" aria-hidden="true" />
      </span>
      <span className="sr-only">Open inputs, example output, and Test Call controls.</span>
    </button>
  )
}
