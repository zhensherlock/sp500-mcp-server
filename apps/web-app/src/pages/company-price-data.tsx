import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import { CompanyPriceDataApp } from '@/components/company-price-data/company-price-data-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyPriceDataApp />
  </React.StrictMode>,
)
