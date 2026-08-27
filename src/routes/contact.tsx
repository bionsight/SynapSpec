import { createFileRoute } from '@tanstack/react-router'

import { button, container, eyebrow } from '../ui'

export const Route = createFileRoute('/contact')({
  head: () => ({ meta: [{ title: 'Contact SynapSpec' }] }),
  component: ContactPage,
})

function ContactPage() {
  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <p className={eyebrow}>Contact</p>
        <h1 className="mt-3 text-[30px] tracking-[-0.035em] md:text-[40px]">Contact Us</h1>
        <p className="mt-3 max-w-[46ch] text-[15.5px] text-ink-600 md:text-[17px]">
          Ready to advance your research? Let&apos;s discuss how we can help.
        </p>
      </div>

      <section className="grid gap-10 pb-10 md:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.75fr)] md:pb-16">
        <div className="max-w-[46rem]">
          <h2 className="text-[23px] tracking-[-0.03em]">Get in Touch</h2>
          <p className="mt-2 text-ink-600">
            We&apos;re here to support your research goals. Whether you&apos;re interested in our services,
            have questions about our platform, or want to explore collaboration opportunities, we&apos;d
            love to hear from you.
          </p>

          <h3 className="mt-8 text-base">Email</h3>
          <p className="mt-2">
            <a className="font-semibold text-brand-700 hover:text-brand-800" href="mailto:contact@bionsight.com">contact@bionsight.com</a>
          </p>

          <h3 className="mt-8 text-base">GitHub</h3>
          <p className="mt-2 text-ink-600">
            For technical discussions, feature requests, and community support:
          </p>
          <div className="mt-5 grid gap-3 md:flex md:flex-wrap">
            <a className={`${button('primary', 'md')} w-full md:w-auto`} href="https://github.com/bionsight/SynapSpec/discussions" target="_blank" rel="noreferrer">Join Discussions</a>
            <a className={`${button('secondary', 'md')} w-full md:w-auto`} href="https://github.com/bionsight/SynapSpec/issues" target="_blank" rel="noreferrer">Report Issues</a>
          </div>

          <h3 className="mt-8 text-base">Collaborations</h3>
          <p className="mt-2 text-ink-600">
            Interested in research collaborations or partnerships? We work with academic institutions,
            pharmaceutical companies, and biotechnology organizations worldwide.
          </p>
        </div>

        <aside className="self-start rounded-lg bg-ink-900 p-6 text-white">
          <p className="font-mono text-[11.5px] tracking-caps text-white/60 uppercase">Community first</p>
          <h2 className="mt-3 text-[23px] tracking-[-0.03em]">Prefer GitHub?</h2>
          <p className="mt-2 text-sm text-white/60">
            For faster responses and to engage with our community, we recommend using GitHub. Questions,
            ideas, and collaboration proposals are welcome.
          </p>
          <a
            className="mt-5 inline-flex h-9 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-ink-100"
            href="https://github.com/bionsight/SynapSpec/discussions/new?category=general"
            target="_blank"
            rel="noreferrer"
          >
            Start a Discussion
          </a>
        </aside>
      </section>
    </div>
  )
}
