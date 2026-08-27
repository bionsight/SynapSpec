import { createFileRoute } from '@tanstack/react-router'

import { SectionHead } from '../components/Section'
import { coreFeatures } from '../data/site'
import { block, container, eyebrow, panel } from '../ui'

export const Route = createFileRoute('/about')({
  head: () => ({ meta: [{ title: 'About SynapSpec' }] }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <p className={eyebrow}>About</p>
        <h1 className="mt-3 text-[30px] tracking-[-0.035em] md:text-[40px]">About SynapSpec</h1>
        <p className="mt-3 max-w-[46ch] text-[15.5px] text-ink-600 md:text-[17px]">
          Comprehensive proteomics software platform for advanced mass spectrometry data analysis.
        </p>
      </div>

      <section className={block}>
        <SectionHead title="Core Features">
          Powerful analytical capabilities designed for modern proteomics research.
        </SectionHead>
        <div className="grid gap-4 md:grid-cols-3">
          {coreFeatures.map(([title, description]) => (
            <article className={panel} key={title}>
              <h3 className="text-base">{title}</h3>
              <p className="mt-2 text-sm text-ink-600">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={block}>
        <SectionHead title="Developed by Bionsight">
          SynapSpec is developed and maintained by Bionsight, a biotechnology company dedicated to
          advancing scientific discovery through AI-powered proteomics solutions.
        </SectionHead>
        <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://www.bionsight.com" target="_blank" rel="noreferrer">
          www.bionsight.com
        </a>
      </section>
    </div>
  )
}
