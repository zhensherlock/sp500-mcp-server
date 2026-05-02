import { useState } from 'react'
import { getSummaryPreview } from './utils'

type BusinessSummaryProps = {
  summary: string
}

export function BusinessSummary({ summary }: BusinessSummaryProps) {
  const [expanded, setExpanded] = useState(false)
  const { isLong, preview } = getSummaryPreview(summary)

  return (
    <section className="rounded-2xl bg-neutral-50 p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-neutral-800">Business Summary</h2>
        {isLong ? (
          <button
            className="text-sm text-blue-500 hover:text-blue-600"
            type="button"
            onClick={() => setExpanded(current => !current)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        ) : null}
      </div>
      <p className="text-sm leading-relaxed text-neutral-600">{expanded ? summary : preview}</p>
    </section>
  )
}
