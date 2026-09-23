import { Route, Routes } from 'react-router-dom'
import ScrollToTop from './components/ScrollToTop'
import SiteChrome from './components/SiteChrome'
import HomePage from './HomePage'
import ServicePage from './ServicePage'

// The homepage lives in HomePage.tsx; header, footer and the shared canvas
// chrome live in SiteChrome. Service routes are data-driven from
// src/data/services.ts and prerendered to their own HTML files at build time.
function App() {
  return (
    <SiteChrome>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services/:slug" element={<ServicePage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </SiteChrome>
  )
}

export default App
