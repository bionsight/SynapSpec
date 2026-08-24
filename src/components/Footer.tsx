import { Link } from '@tanstack/react-router'

import { container } from '../ui'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70">
      <div className={`${container} flex min-h-24 flex-wrap items-center justify-between gap-4 py-5 max-sm:justify-center`}>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted">
          <Link className="no-underline hover:text-brand" to="/">Home</Link>
          <Link className="no-underline hover:text-brand" to="/about">About</Link>
          <Link className="no-underline hover:text-brand" to="/download">Download</Link>
          <Link className="no-underline hover:text-brand" to="/contact">Contact</Link>
          <a className="no-underline hover:text-brand" href="https://github.com/bionsight/SynapSpec" target="_blank" rel="noreferrer">GitHub</a>
        </div>
        <p className="m-0 text-center text-xs leading-6 text-muted">© {new Date().getFullYear()} Bionsight. Accelerating drug discovery through AI-powered proteomics.</p>
      </div>
    </footer>
  )
}
