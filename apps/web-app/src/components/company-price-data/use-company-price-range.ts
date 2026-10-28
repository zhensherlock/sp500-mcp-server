import { useEffect, useRef, useState } from 'react'

import type { CompanyPriceDataResult, CompanyPriceRange, RequestCompanyPrices } from './types'
import { getPriceRangeArguments, parseCompanyPriceDataFromToolResult } from './utils'

type RangeState = {
  sourceResult: CompanyPriceDataResult
  result: CompanyPriceDataResult
  selectedRange: CompanyPriceRange | null
  pendingRange: CompanyPriceRange | null
  error: string | null
}

export function useCompanyPriceRange(initialResult: CompanyPriceDataResult, requestPrices?: RequestCompanyPrices) {
  const [state, setState] = useState<RangeState | null>(null)
  const requestIdRef = useRef(0)
  // A new result from the host takes precedence over any previous UI query.
  const currentState = state?.sourceResult === initialResult ? state : null
  const result = currentState?.result ?? initialResult

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
    }
  }, [])

  async function selectRange(range: CompanyPriceRange) {
    if (!requestPrices || currentState?.pendingRange) return

    const requestId = ++requestIdRef.current
    setState({
      sourceResult: initialResult,
      result,
      selectedRange: currentState?.selectedRange ?? null,
      pendingRange: range,
      error: null,
    })

    try {
      const toolResult = await requestPrices(getPriceRangeArguments(result.symbol, range))
      const nextResult = parseCompanyPriceDataFromToolResult(toolResult)

      if (requestId !== requestIdRef.current) return

      setState(previous =>
        previous?.sourceResult === initialResult
          ? { ...previous, result: nextResult, selectedRange: range, pendingRange: null }
          : previous,
      )
    } catch (error) {
      if (requestId !== requestIdRef.current) return

      setState(previous =>
        previous?.sourceResult === initialResult
          ? {
              ...previous,
              pendingRange: null,
              error: error instanceof Error ? error.message : 'Unable to refresh price data.',
            }
          : previous,
      )
    }
  }

  return {
    error: currentState?.error ?? null,
    pendingRange: currentState?.pendingRange ?? null,
    result,
    selectedRange: currentState?.selectedRange ?? null,
    selectRange,
  }
}
