import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FacadeView } from './examples/FacadeView'
import { HeatMap } from './examples/HeatMap'
import { SunHours } from './examples/SunHours'
import { WindAround } from './examples/WindAround'
import './styles.css'

// Add your own page here: one entry, one component.
const PAGES = {
  sun: { label: 'Sun hours', Page: SunHours },
  wind: { label: 'Wind', Page: WindAround },
  heat: { label: 'UTCI heat', Page: HeatMap },
  facade: { label: 'Facades', Page: FacadeView },
} as const
type PageId = keyof typeof PAGES

function currentPage(): PageId {
  const id = window.location.hash.replace('#', '')
  return id in PAGES ? (id as PageId) : 'sun'
}

function App() {
  const [page, setPage] = useState<PageId>(currentPage())
  useEffect(() => {
    const onHash = () => setPage(currentPage())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const { Page } = PAGES[page]
  return (
    <>
      <nav>
        <strong>Infrared examples</strong>
        {Object.entries(PAGES).map(([id, p]) => (
          <a key={id} href={`#${id}`} className={id === page ? 'active' : ''}>
            {p.label}
          </a>
        ))}
      </nav>
      <Page key={page} />
    </>
  )
}

const root = document.getElementById('root')
if (!root) throw new Error('No #root element')
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
