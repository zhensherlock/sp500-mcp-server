import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import '@/components/tool-app/configure-zod'
import { CompanyNewsApp } from '@/components/company-news/company-news-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyNewsApp />
  </React.StrictMode>,
)
