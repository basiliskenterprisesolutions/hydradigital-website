import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

// react-router does not reset scroll on client-side navigation, so a "Learn more"
// link clicked from the service cards two thirds down the homepage opened the
// service page still scrolled to that offset. Reset on PUSH/REPLACE only, so the
// browser's own restoration still works on back/forward.
//
// Nothing here runs during prerendering: effects do not fire in renderToString.
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    if (navigationType === 'POP') {
      return
    }

    // `html` carries scroll-behavior: smooth for in-page anchors. Across a route
    // change that animation has to be opted out of in both branches below: the
    // homepage's own scroll effects cancel a smooth scroll before it arrives, so
    // an animated jump does not just look wrong, it does not land at all.

    // Links like /#services from a service page still need to reach the anchor.
    if (hash) {
      const target = document.querySelector(hash)

      if (target) {
        target.scrollIntoView({ behavior: 'instant' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash, navigationType])

  return null
}

export default ScrollToTop
