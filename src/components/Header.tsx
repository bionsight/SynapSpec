import { Link } from '@tanstack/react-router'
import { useState } from 'react'

import { version } from '../data/site'
import { button, container } from '../ui'
import { Logo } from './Logo'

/* 라이브 synapspec.ai 의 내비게이션 그대로. 시안이 새로 만든
   Product / Workflows 항목은 대응하는 페이지도 근거도 없어 쓰지 않는다. */
const navigation = [
  { to: '/', label: 'Home', exact: true },
  { to: '/about', label: 'About' },
  { to: '/download', label: 'Download' },
  { href: 'https://docs.synapspec.ai', label: 'Documentation' },
  { to: '/contact', label: 'Contact' },
] as const

const linkClass = 'transition-colors hover:text-brand-700'
const activeClass = 'font-semibold text-ink-900'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return navigation.map((item) =>
    'href' in item ? (
      <a className={linkClass} href={item.href} key={item.label} target="_blank" rel="noreferrer" onClick={onNavigate}>
        {item.label}
      </a>
    ) : (
      <Link
        className={linkClass}
        to={item.to}
        key={item.label}
        activeOptions={{ exact: 'exact' in item ? item.exact : false }}
        activeProps={{ className: `${linkClass} ${activeClass}` }}
        onClick={onNavigate}
      >
        {item.label}
      </Link>
    ),
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-20 bg-white">
      <div className={`${container} flex h-[54px] items-center gap-3 md:h-[60px] md:gap-6`}>
        <Logo />
        <nav className="hidden gap-5 text-sm text-ink-600 md:flex" aria-label="Main navigation">
          <NavItems />
        </nav>
        <span className="flex-auto" />
        <span className="hidden font-mono text-xs text-ink-500 md:inline">v{version}</span>
        <Link to="/download" className={button('primary', 'sm')}>Download</Link>
        <button
          type="button"
          className="p-1.5 text-ink-600 md:hidden"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen(!open)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d={open ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-ink-100 md:hidden" aria-label="Main navigation">
          <div className={`${container} grid gap-4 py-4 text-sm text-ink-600`}>
            <NavItems onNavigate={close} />
            <span className="font-mono text-xs text-ink-500">v{version}</span>
          </div>
        </nav>
      )}
    </header>
  )
}
