import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import { CompanyFilingsApp } from '@/components/company-filings/company-filings-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyFilingsApp />
  </React.StrictMode>,
)
