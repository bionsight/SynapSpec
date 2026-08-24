import { createFileRoute } from '@tanstack/react-router'

import { container, primaryButton, secondaryButton } from '../ui'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact SynapSpec' }] }),
  component: ContactPage,
})

function ContactPage() {
  return <div className={`${container} py-16 sm:py-24`}>
    <div className="max-w-3xl"><p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">Contact</p><h1 className="text-5xl font-semibold tracking-[-.045em] sm:text-6xl">Let&apos;s discuss your research</h1><p className="text-lg text-muted">Ask about the platform, collaboration, or technical support.</p></div>
    <section className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,.75fr)]"><div className="max-w-2xl"><h2 className="text-3xl font-semibold tracking-[-.035em]">Get in touch</h2><p>We support research teams exploring proteomics workflows, collaborations, and new applications of DIA mass spectrometry.</p><h3 className="mt-8 text-lg font-semibold">Email</h3><p><a className="font-semibold text-brand" href="mailto:contact@bionsight.com">contact@bionsight.com</a></p><h3 className="mt-8 text-lg font-semibold">GitHub</h3><p>Use Discussions for technical questions and community support, or open an Issue for reproducible bugs.</p><div className="mt-6 flex flex-wrap gap-3"><a className={primaryButton} href="https://github.com/bionsight/SynapSpec/discussions" target="_blank" rel="noreferrer">Join discussions</a><a className={secondaryButton} href="https://github.com/bionsight/SynapSpec/issues" target="_blank" rel="noreferrer">Report an issue</a></div><h3 className="mt-8 text-lg font-semibold">Collaborations</h3><p>We work with academic institutions, pharmaceutical companies, and biotechnology organizations worldwide.</p></div><aside className="self-start rounded-2xl bg-deep p-8"><p className="mb-3 text-xs font-bold tracking-[.14em] text-cyan-200 uppercase">Community first</p><h2 className="text-3xl font-semibold tracking-[-.035em] text-white">Prefer GitHub?</h2><p className="text-slate-300">Questions, ideas, and collaboration proposals are welcome in the community forum.</p><a className="inline-flex min-h-11 items-center justify-center rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-deep no-underline transition hover:bg-cyan-50" href="https://github.com/bionsight/SynapSpec/discussions/new?category=general" target="_blank" rel="noreferrer">Start a discussion</a></aside></section>
  </div>
}
