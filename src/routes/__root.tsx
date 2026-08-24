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
        content: 'Advanced proteomics research and development solutions for scientific discovery.',
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
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[radial-gradient(circle_at_50%_-30%,#e4f7fa,transparent_42%),#f6fafc]" aria-hidden="true">
          <div className="absolute -right-56 top-40 size-[30rem] rounded-full bg-[#bde9ed]/45 blur-lg" />
          <div className="absolute -bottom-8 -left-40 size-88 rounded-full bg-[#d9e8fb]/45 blur-lg" />
        </div>
        <Header />
        <main className="min-h-[calc(100vh-10rem)]">
          <Outlet />
        </main>
        <Footer />
        <Scripts />
      </body>
    </html>
  )
}
