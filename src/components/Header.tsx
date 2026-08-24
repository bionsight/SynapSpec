import { Link } from '@tanstack/react-router'

import { container } from '../ui'

const navigation = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/download', label: 'Download' },
  { href: 'https://docs.synapspec.ai', label: 'Documentation' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className={`${container} flex min-h-[4.7rem] flex-wrap items-center justify-between gap-4 py-3 max-sm:justify-center`}>
        <Link to="/" className="inline-flex items-center gap-2.5 text-xl text-ink no-underline" aria-label="SynapSpec home">
          <img className="size-8" src="/images/favicon.png" alt="" />
          <span><strong>Synap</strong>Spec</span>
        </Link>
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted" aria-label="Main navigation">
          {navigation.map((item) =>
            'href' in item ? (
              <a className="no-underline transition hover:text-brand" href={item.href} key={item.label} target="_blank" rel="noreferrer">{item.label}</a>
            ) : (
              <Link key={item.label} to={item.to} className="no-underline transition hover:text-brand" activeProps={{ className: 'font-bold text-brand' }}>
                {item.label}
              </Link>
            ),
          )}
        </nav>
      </div>
    </header>
  )
}
