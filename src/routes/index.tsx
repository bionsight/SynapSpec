import { Link, createFileRoute } from '@tanstack/react-router'

import { Closer, Requirements, SectionHead } from '../components/Section'
import { exampleRun } from '../data/benchmarks'
import { requirements, services } from '../data/site'
import { block, button, container, eyebrow, panel } from '../ui'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'SynapSpec | DIA analysis solution for proteomics research' }] }),
  component: HomePage,
})

function HomePage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.62fr)] md:gap-12 md:py-20`}>
          <div>
            <p className={eyebrow}>DIA-MS data processing and analysis</p>
            <h1 className="mt-3 text-[31px]/[1.06] tracking-[-0.035em] text-balance md:text-[46px]">
              Advancing Scientific Discovery Through Proteomics
            </h1>
            <p className="mt-4 text-[15.5px] text-ink-600 md:max-w-[38ch] md:text-[17px]">
              Advanced DIA mass spectrometry analysis solution for proteomics research. Accelerate your
              drug discovery and protein function studies with our cutting-edge software.
            </p>
            <div className="mt-6 grid gap-3 md:flex md:flex-wrap">
              <Link to="/download" className={`${button('primary', 'lg')} w-full md:w-auto`}>Download Solution</Link>
              <a className={`${button('secondary', 'lg')} w-full md:w-auto`} href="https://github.com/bionsight/SynapSpec/discussions" target="_blank" rel="noreferrer">Join Community</a>
            </div>
          </div>
          <img
            className="rounded-lg border border-ink-200 shadow-xl"
            src="/images/synapspec/run_detail.png"
            alt="SynapSpec showing a finished run: precursor, peptide and protein-group counts, and the same three counts per raw file"
          />
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className={`${container} py-10`}>
          <p className="mb-5 font-mono text-[11.5px] tracking-caps text-white/60 uppercase">Example run</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {exampleRun.figures.map(([value, label]) => (
              <div key={label}>
                <div className="text-[26px]/[1.1] font-semibold tracking-[-0.03em] tabular-nums md:text-[34px]">{value}</div>
                <p className="mt-1 text-[13px] text-white/60">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-mono text-[11.5px] text-white/40">{exampleRun.footnote}</p>
        </div>
      </section>

      <div className={container}>
        <section className={block}>
          <SectionHead title="SynapSpec DIA Analysis Solution">
            Comprehensive software solution for DIA-MS data processing and analysis in proteomics research.
          </SectionHead>
          <div className="grid gap-4 md:grid-cols-3">
            {services.map(([title, description]) => (
              <article className={panel} key={title}>
                <h3 className="text-base">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={block}>
          <SectionHead title="System Requirements" />
          <Requirements items={requirements} />
          <Closer
            title="Ready to Try SynapSpec?"
            actions={
              <>
                <Link to="/download" className={`${button('primary', 'lg')} w-full md:w-auto`}>Download Now</Link>
                <Link to="/contact" className={`${button('secondary', 'lg')} w-full md:w-auto`}>Contact Us</Link>
              </>
            }
          >
            Download our DIA analysis solution or reach out to discuss how it can advance your proteomics research.
          </Closer>
        </section>
      </div>
    </>
  )
}
