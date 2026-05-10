import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Always start at the top on load / reload (and on bfcache restore from
// Safari's back-forward cache). Without this, browsers default to
// `scrollRestoration: 'auto'` which restores the previous scroll position.
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)
  window.addEventListener('pageshow', (event) => {
    // `persisted` is true when the page was restored from bfcache.
    if (event.persisted) window.scrollTo(0, 0)
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
