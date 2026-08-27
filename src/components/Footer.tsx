import { Link } from '@tanstack/react-router'

import { caps, container } from '../ui'
import { Logo } from './Logo'

type FooterLink = { label: string; to: string } | { label: string; href: string }

/* 링크 대상은 전부 실재하는 곳이다. 이름표는 라이브에 있는 것을 그대로 쓴다
   (Home / About / Download / Contact / Documentation / GitHub). SpectraLens 만
   라이브에 없는 페이지인데, 이 저장소에는 실제로 존재한다. */
const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Home', to: '/' },
      { label: 'Download', to: '/download' },
      { label: 'SpectraLens', to: '/spectralens' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: 'https://docs.synapspec.ai' },
      { label: 'Installation Guide', href: 'https://docs.synapspec.ai/installation/' },
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
          <p>
            SynapSpec is developed and maintained by Bionsight, a biotechnology company dedicated to
            advancing scientific discovery through AI-powered proteomics solutions.
          </p>
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
                    <Link className="transition-colors hover:text-brand-700" to={link.to}>{link.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={`${container} border-t border-ink-200 py-5 text-[13px] text-ink-500`}>
        © {new Date().getFullYear()} Bionsight. Accelerating drug discovery through AI-powered proteomics.
      </div>
    </footer>
  )
}
