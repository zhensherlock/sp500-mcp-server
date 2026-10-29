import { useEffect, useRef, useState } from 'react'

import { buildNewsAnalysisMessage } from './news-analysis'
import type { CompanyNewsResult, SendNewsAnalysis } from './types'

type AnalysisState = {
  source: CompanyNewsResult
  selectedUrls: string[]
  status: 'idle' | 'sending' | 'sent' | 'error'
  error: string | null
}

export function useNewsAnalysis(result: CompanyNewsResult, sendAnalysis?: SendNewsAnalysis) {
  const [state, setState] = useState<AnalysisState | null>(null)
  const requestIdRef = useRef(0)
  const pendingSourceRef = useRef<CompanyNewsResult | null>(null)
  const currentState = state?.source === result ? state : null
  const selectedUrls = currentState?.selectedUrls ?? []
  const status = currentState?.status ?? 'idle'

  useEffect(() => {
    return () => {
      requestIdRef.current += 1
      pendingSourceRef.current = null
    }
  }, [])

  function selectArticle(url: string, selected: boolean) {
    if (pendingSourceRef.current === result) return

    setState(previous => {
      const urls = previous?.source === result ? previous.selectedUrls : []
      return {
        source: result,
        selectedUrls: selected ? [...new Set([...urls, url])] : urls.filter(value => value !== url),
        status: 'idle',
        error: null,
      }
    })
  }

  async function analyzeSelected() {
    if (!sendAnalysis || pendingSourceRef.current === result || status === 'sent') return

    const selectedNews = result.news.filter(item => selectedUrls.includes(item.url))
    if (!selectedNews.length) return

    const requestId = ++requestIdRef.current
    pendingSourceRef.current = result
    setState({ source: result, selectedUrls, status: 'sending', error: null })

    try {
      const response = await sendAnalysis(buildNewsAnalysisMessage(result.symbol, selectedNews))
      if (response.isError) throw new Error('The host rejected the analysis request. Please try again.')

      if (requestId !== requestIdRef.current) return
      setState(previous => (previous?.source === result ? { ...previous, status: 'sent', error: null } : previous))
    } catch (error) {
      if (requestId !== requestIdRef.current) return
      setState(previous =>
        previous?.source === result
          ? {
              ...previous,
              status: 'error',
              error: error instanceof Error ? error.message : 'Unable to send the analysis request.',
            }
          : previous,
      )
    } finally {
      if (requestId === requestIdRef.current) pendingSourceRef.current = null
    }
  }

  return { selectedUrls, status, error: currentState?.error ?? null, selectArticle, analyzeSelected }
}
