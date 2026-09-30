import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Always start at the top on load / reload (and on bfcache restore from
// Safari's back-forward cache). Without this, browsers default to
// `scrollRestoration: 'auto'` which restores the previous scroll position.
if (typeof window !== 'undefined') {
  document.documentElement.classList.add('js')
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
  }
  window.scrollTo(0, 0)
  window.addEventListener('pageshow', (event) => {
    // `persisted` is true when the page was restored from bfcache.
    if (event.persisted) window.scrollTo(0, 0)
  })
}

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
