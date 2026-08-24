import { createFileRoute } from '@tanstack/react-router'

import { coreFeatures } from '../data/site'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About SynapSpec' }] }),
  component: AboutPage,
})

function AboutPage() {
  return <div className="container page">
    <div className="section-heading"><p className="eyebrow">About</p><h1>Advanced proteomics software</h1><p>Comprehensive software for advanced mass spectrometry data analysis.</p></div>
    <section className="section"><div className="section-heading"><h2>Core features</h2><p>Powerful analytical capabilities for modern proteomics research.</p></div><div className="card-grid">{coreFeatures.map(([title, description]) => <article className="card" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="section prose"><h2>Developed by Bionsight</h2><p>SynapSpec is developed and maintained by Bionsight, a biotechnology company dedicated to advancing scientific discovery through AI-powered proteomics solutions.</p><a href="https://www.bionsight.com" target="_blank" rel="noreferrer">www.bionsight.com</a></section>
  </div>
}
