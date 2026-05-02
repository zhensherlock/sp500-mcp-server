import React from 'react'
import ReactDOM from 'react-dom/client'
import { Button } from '@workspace/ui/components/button'
import '@workspace/ui/globals.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <div className="p-8">
      <Button>Click me</Button>
    </div>
  </React.StrictMode>,
)
