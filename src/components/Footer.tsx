import { Link } from '@tanstack/react-router'

import { caps, container } from '../ui'
import { Logo } from './Logo'

type FooterLink =
  | { label: string; to: string; hash?: string }
  | { label: string; href: string }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Overview', to: '/' },
      { label: 'Workflows', to: '/', hash: 'workflows' },
      { label: 'Download', to: '/download' },
      { label: 'SpectraLens', to: '/spectralens' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://docs.synapspec.ai' },
      { label: 'Installation guide', href: 'https://docs.synapspec.ai/installation/' },
      { label: 'GitHub', href: 'https://github.com/bionsight/SynapSpec' },
      { label: 'Discussions', href: 'https://github.com/bionsight/SynapSpec/discussions' },
    ],
  },
  {
    title: 'Bionsight',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'bionsight.com', href: 'https://www.bionsight.com' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50">
      <div className={`${container} grid grid-cols-2 gap-6 py-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))] md:gap-8`}>
        <div className="col-span-full text-[13px] text-ink-500 md:col-span-1 md:max-w-[26ch]">
          <Logo className="mb-3" />
          <p>Developed and maintained by Bionsight, a biotechnology company working on AI-powered proteomics.</p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h4 className={`${caps} mb-3 font-semibold`}>{column.title}</h4>
            <ul className="grid list-none gap-2 p-0 text-sm text-ink-600">
              {column.links.map((link) => (
                <li key={link.label}>
                  {'href' in link ? (
                    <a className="transition-colors hover:text-brand-700" href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                  ) : (
                    <Link className="transition-colors hover:text-brand-700" to={link.to} hash={link.hash}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  )
}
