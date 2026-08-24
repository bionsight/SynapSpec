import { Link, createFileRoute } from '@tanstack/react-router'

import { services } from '../data/site'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'SynapSpec | Proteomics analysis software' }] }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero-content">
          <p className="eyebrow">Bionsight · Proteomics software</p>
          <h1>Advancing scientific discovery through proteomics</h1>
          <p className="hero-subtitle">Advanced DIA mass spectrometry analysis for proteomics research, drug discovery, and protein function studies.</p>
          <div className="actions">
            <Link to="/download" className="button">Download SynapSpec</Link>
            <a href="https://github.com/bionsight/SynapSpec/discussions" className="button button-secondary" target="_blank" rel="noreferrer">Join community</a>
          </div>
        </div>
      </section>
      <section className="section container">
        <div className="section-heading">
          <p className="eyebrow">DIA analysis solution</p>
          <h2>Powerful workflows without needless complexity</h2>
          <p>Comprehensive DIA-MS data processing and analysis for modern proteomics research.</p>
        </div>
        <div className="card-grid">
          {services.map(([title, description]) => <article className="card" key={title}><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>
      <section className="section container callout">
        <div><p className="eyebrow">Get started</p><h2>Ready to try SynapSpec?</h2><p>Download the DIA analysis solution or talk with us about your proteomics workflow.</p></div>
        <div className="actions"><Link to="/download" className="button">Download now</Link><Link to="/contact" className="button button-secondary">Contact us</Link></div>
      </section>
    </>
  )
}
