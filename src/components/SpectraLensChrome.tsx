import { Link } from '@tanstack/react-router'

import { container } from '../ui'

export function SpectraLensHeader() {
  return (
    <header className="border-b border-brand-950 bg-ink-950 text-white">
      <div className={`${container} flex h-[54px] items-center`}>
        <Link className="inline-flex items-center gap-2 text-sm font-semibold" to="/spectralens" aria-label="SpectraLens home">
          <img className="h-5 w-auto" src="/images/spectralens/logo.png" alt="" />
          <span>SpectraLens</span>
        </Link>
        <nav className="ms-auto flex gap-4 text-xs text-white/75" aria-label="SpectraLens navigation">
          <a className="hover:text-white" href="#features">Features</a>
          <a className="hover:text-white" href="#workflow">Workflow</a>
          <a className="hover:text-white" href="#docs">Docs</a>
          <a className="hover:text-white" href="#download">Download</a>
        </nav>
      </div>
    </header>
  )
}

export function SpectraLensFooter() {
  return (
    <footer className="bg-ink-950 py-8 text-white/70">
      <div className={`${container} flex flex-col gap-5 text-sm md:flex-row md:items-center md:justify-between`}>
        <div className="grid gap-1">
          <strong className="text-white">SpectraLens</strong>
          <span>Targeted DIA peak inspection for focused precursor review.</span>
        </div>
        <div className="flex gap-5">
          <a className="hover:text-white" href="https://github.com/bionsight/SpectraLens/releases/tag/v0.5.0" target="_blank" rel="noreferrer">Download</a>
          <a className="hover:text-white" href="mailto:contact@bionsight.com">Contact</a>
        </div>
      </div>
    </footer>
  )
}
