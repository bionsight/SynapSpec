import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact SynapSpec' }] }),
  component: ContactPage,
})

function ContactPage() {
  return <div className="container page">
    <div className="section-heading"><p className="eyebrow">Contact</p><h1>Let&apos;s discuss your research</h1><p>Ask about the platform, collaboration, or technical support.</p></div>
    <section className="contact-layout section"><div className="prose"><h2>Get in touch</h2><p>We support research teams exploring proteomics workflows, collaborations, and new applications of DIA mass spectrometry.</p><h3>Email</h3><p><a href="mailto:contact@bionsight.com">contact@bionsight.com</a></p><h3>GitHub</h3><p>Use Discussions for technical questions and community support, or open an Issue for reproducible bugs.</p><div className="actions"><a className="button" href="https://github.com/bionsight/SynapSpec/discussions" target="_blank" rel="noreferrer">Join discussions</a><a className="button button-secondary" href="https://github.com/bionsight/SynapSpec/issues" target="_blank" rel="noreferrer">Report an issue</a></div><h3>Collaborations</h3><p>We work with academic institutions, pharmaceutical companies, and biotechnology organizations worldwide.</p></div><aside className="contact-panel"><p className="eyebrow">Community first</p><h2>Prefer GitHub?</h2><p>Questions, ideas, and collaboration proposals are welcome in the community forum.</p><a className="button" href="https://github.com/bionsight/SynapSpec/discussions/new?category=general" target="_blank" rel="noreferrer">Start a discussion</a></aside></section>
  </div>
}
