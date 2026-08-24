import { createFileRoute } from '@tanstack/react-router'

import { coreFeatures } from '../data/site'
import { card, container } from '../ui'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About SynapSpec' }] }),
  component: AboutPage,
})

function AboutPage() {
  return <div className={`${container} py-16 sm:py-24`}>
    <div className="max-w-3xl"><p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">About</p><h1 className="text-5xl font-semibold tracking-[-.045em] sm:text-6xl">Advanced proteomics software</h1><p className="text-lg text-muted">Comprehensive software for advanced mass spectrometry data analysis.</p></div>
    <section className="py-16 sm:py-24"><div className="mb-9 max-w-2xl"><h2 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Core features</h2><p className="mb-0 text-muted">Powerful analytical capabilities for modern proteomics research.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{coreFeatures.map(([title, description]) => <article className={card} key={title}><h3 className="text-lg font-semibold tracking-[-.025em]">{title}</h3><p className="mb-0 mt-3 text-sm leading-6 text-muted">{description}</p></article>)}</div></section>
    <section className="max-w-2xl pb-8"><h2 className="text-3xl font-semibold tracking-[-.035em]">Developed by Bionsight</h2><p>SynapSpec is developed and maintained by Bionsight, a biotechnology company dedicated to advancing scientific discovery through AI-powered proteomics solutions.</p><a className="font-semibold text-brand" href="https://www.bionsight.com" target="_blank" rel="noreferrer">www.bionsight.com</a></section>
  </div>
}
