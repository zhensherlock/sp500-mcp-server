import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import '../index.css'
import { CompanyOfficersApp } from '@/components/company-officers/company-officers-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <CompanyOfficersApp />
  </React.StrictMode>,
)
