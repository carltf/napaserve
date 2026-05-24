import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disable browser scroll auto-restore: on hard-load/refresh of async routes
// (dashboard, calculators) the browser restores scroll before Supabase fetches
// and charts settle, landing the viewport mid-page. Route-change scroll-to-top
// handler in App.jsx remains the source of truth for SPA transitions.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
