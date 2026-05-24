import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import '@/components/tool-app/configure-zod'
import { CompanyFinancialsApp } from '@/components/company-financials/company-financials-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyFinancialsApp />
  </React.StrictMode>,
)
