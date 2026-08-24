import { Link, createFileRoute } from '@tanstack/react-router'

import { services } from '../data/site'
import { card, container, primaryButton, secondaryButton } from '../ui'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'SynapSpec | Proteomics analysis software' }] }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <section className="py-20 sm:py-32">
        <div className={`${container} max-w-4xl text-center`}>
          <p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">Bionsight · Proteomics software</p>
          <h1 className="text-balance text-5xl leading-none font-semibold tracking-[-.045em] text-ink sm:text-7xl">Advancing scientific discovery through proteomics</h1>
          <p className="mx-auto mt-6 max-w-3xl text-pretty text-lg leading-8 text-muted sm:text-xl">Advanced DIA mass spectrometry analysis for proteomics research, drug discovery, and protein function studies.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/download" className={primaryButton}>Download SynapSpec</Link>
            <a href="https://github.com/bionsight/SynapSpec/discussions" className={secondaryButton} target="_blank" rel="noreferrer">Join community</a>
          </div>
        </div>
      </section>
      <section className={`${container} py-16 sm:py-24`}>
        <div className="mb-9 max-w-2xl">
          <p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">DIA analysis solution</p>
          <h2 className="text-3xl font-semibold tracking-[-.035em] text-ink sm:text-4xl">Powerful workflows without needless complexity</h2>
          <p className="mb-0 text-muted">Comprehensive DIA-MS data processing and analysis for modern proteomics research.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(([title, description]) => <article className={card} key={title}><h3 className="text-lg font-semibold tracking-[-.025em]">{title}</h3><p className="mb-0 mt-3 text-sm leading-6 text-muted">{description}</p></article>)}
        </div>
      </section>
      <section className={`${container} mb-16 flex flex-col items-start justify-between gap-8 rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-white p-8 sm:mb-24 sm:flex-row sm:items-end sm:p-10`}>
        <div className="max-w-2xl"><p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">Get started</p><h2 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Ready to try SynapSpec?</h2><p className="mb-0 text-muted">Download the DIA analysis solution or talk with us about your proteomics workflow.</p></div>
        <div className="flex flex-wrap gap-3"><Link to="/download" className={primaryButton}>Download now</Link><Link to="/contact" className={secondaryButton}>Contact us</Link></div>
      </section>
    </>
  )
}
