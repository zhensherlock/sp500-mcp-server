import React from 'react'
import ReactDOM from 'react-dom/client'
import '@workspace/ui/globals.css'
import './index.css'
import { DebugApp } from '@/components/debugger/debug-app'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <DebugApp />
  </React.StrictMode>,
)
