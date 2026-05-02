import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import { CompanyInfoApp } from '@/components/company-info/company-info-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyInfoApp />
  </React.StrictMode>,
)
