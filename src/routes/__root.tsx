import { createRootRoute, HeadContent, Outlet, Scripts } from '@tanstack/react-router'

import { Footer } from '../components/Footer'
import { Header } from '../components/Header'
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
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
