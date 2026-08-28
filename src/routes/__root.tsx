import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from '@tanstack/react-router'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
import { CookieConsent } from '../components/CookieConsent'
import { SpectraLensFooter, SpectraLensHeader } from '../components/SpectraLensChrome'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'description',
        content:
          'SynapSpec - Advanced DIA-MS analysis software solution for proteomics research and drug discovery',
      },
    ],
    links: [
      { rel: 'icon', href: '/images/favicon.png', type: 'image/png' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const isSpectraLens = useRouterState({ select: (state) => state.location.pathname.startsWith('/spectralens') })

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {isSpectraLens ? <SpectraLensHeader /> : <Header />}
        <main>
          <Outlet />
        </main>
        {isSpectraLens ? <SpectraLensFooter /> : <Footer />}
        <CookieConsent product={isSpectraLens ? 'spectralens' : 'synapspec'} />
        <Scripts />
      </body>
    </html>
  )
}
