import { useEffect, useState } from 'react'

const consentKey = 'cookieConsent'
const accepted = 'accepted'
const declined = 'declined'
const GA_MEASUREMENT_ID = 'G-94DZ0M7QBZ'
const MIXPANEL_TOKEN = '0af3e19a73b0a8fa536568138d6f08a7'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    mixpanel?: {
      init: (token: string, options?: Record<string, unknown>) => void
      register: (properties: Record<string, unknown>) => void
      track: (event: string, properties?: Record<string, unknown>) => void
    }
    synapSpecGoogleAnalyticsLoaded?: boolean
    synapSpecMixpanelLoaded?: boolean
  }
}

function appendScript(src: string, onLoad?: () => void) {
  const script = document.createElement('script')
  script.async = true
  script.src = src
  script.onload = onLoad ?? null
  document.head.appendChild(script)
}

function loadAnalytics(includeGoogleAnalytics: boolean) {
  if (includeGoogleAnalytics && !window.synapSpecGoogleAnalyticsLoaded) {
    window.synapSpecGoogleAnalyticsLoaded = true
    window.dataLayer = window.dataLayer ?? []
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args)
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true })
    appendScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`)
  }

  if (window.synapSpecMixpanelLoaded) return
  window.synapSpecMixpanelLoaded = true
  appendScript('https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js', () => {
    window.mixpanel?.init(MIXPANEL_TOKEN, {
      persistence: 'localStorage',
      api_transport: 'sendBeacon',
      ignore_dnt: true,
    })
    window.mixpanel?.register({ product: 'SynapSpec', site: window.location.hostname || 'local' })
    window.mixpanel?.track('website_page_viewed', {
      page_title: document.title,
      page_path: window.location.pathname,
      page_url: window.location.href,
      referrer: document.referrer || null,
    })
  })
}

export function CookieConsent({ product = 'synapspec' }: { product?: 'synapspec' | 'spectralens' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = window.localStorage.getItem(consentKey)

    if (consent === accepted) {
      loadAnalytics(product === 'synapspec')
      return
    }

    if (consent !== null) return

    const timeout = window.setTimeout(() => setIsVisible(true), 800)
    return () => window.clearTimeout(timeout)
  }, [product])

  function setConsent(value: typeof accepted | typeof declined) {
    window.localStorage.setItem(consentKey, value)
    setIsVisible(false)
    if (value === accepted) loadAnalytics(product === 'synapspec')
  }

  if (!isVisible) return null

  return (
    <section className="cookie-consent" aria-label="Cookie and privacy consent">
      <div className="cookie-consent__content">
        <div className="cookie-consent__text">
          <h2>{product === 'synapspec' ? '🍪 Cookie & Privacy Consent' : 'Cookie & Privacy Consent'}</h2>
          {product === 'synapspec' ? (
            <p>
              We use Google Analytics and Mixpanel to collect anonymized usage statistics. You can accept or
              decline analytics cookies. <a className="font-medium text-brand-700 underline hover:text-brand-800" href="/privacy/">Privacy Policy</a>
            </p>
          ) : (
            <p>We collect anonymized usage statistics to improve this website. You can accept or decline analytics cookies.</p>
          )}
        </div>
        <div className="cookie-consent__actions">
          <button className="cookie-consent__accept" type="button" onClick={() => setConsent(accepted)}>
            Accept All
          </button>
          <button className="cookie-consent__decline" type="button" onClick={() => setConsent(declined)}>
            Decline
          </button>
        </div>
      </div>
    </section>
  )
}
