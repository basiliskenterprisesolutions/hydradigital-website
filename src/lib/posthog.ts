const apiKey = import.meta.env.VITE_POSTHOG_KEY
const apiHost = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'

// posthog-js is imported dynamically rather than at the top of the file, which
// does two things. It moves the library out of the main bundle into its own
// chunk, and it lets that chunk wait until after load - PostHog otherwise pulls
// config.js, surveys.js, dead-clicks-autocapture.js and web-vitals.js while the
// page is still trying to paint. Nothing is lost by waiting: the pageview and
// the ?ref super property are both captured on init, just a moment later.
export function initPostHog() {
  if (!apiKey || !import.meta.env.PROD) return

  const start = async () => {
    const { default: posthog } = await import('posthog-js')

    posthog.init(apiKey, { api_host: apiHost })

    // Lets partner sites tag their outbound link (e.g. ?ref=some-client-site)
    // so referral traffic shows up as a distinct source, not just "direct".
    const ref = new URLSearchParams(window.location.search).get('ref')
    if (ref) {
      posthog.register({ ref })
    }
  }

  if (document.readyState === 'complete') {
    void start()
  } else {
    window.addEventListener('load', () => void start(), { once: true })
  }
}
