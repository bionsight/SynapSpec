import { createFileRoute } from '@tanstack/react-router'

import { SectionHead } from '../components/Section'
import { block, button, caps, container, eyebrow, panel } from '../ui'

const features = [
  ['Precursor-centered inspection', 'Add a peptide sequence and charge state, then inspect the targeted signal without processing the entire experiment.'],
  ['Interactive XIC views', 'Review precursor MS1 and fragment MS2 XICs with linear or log scale and optional TIC or base-peak overlays.'],
  ['iRT and charge prediction', 'Use model-based iRT and charge predictions to begin with a focused search window.'],
  ['Spectrum context', 'Compare experimental and predicted spectra alongside chromatographic evidence.'],
  ['Raw-file workspace', 'Keep local raw files, converted files, peptide lists, and analysis settings together.'],
  ['Exportable review', 'Export CSV results for notes, sharing, and downstream manual curation.'],
] as const

const facts = [
  ['Targeted', 'Precursor-first'],
  ['Views', 'MS1 and MS2 XIC'],
  ['Context', 'iRT, RT, spectra'],
  ['Output', 'CSV export'],
] as const

const quickStart = [
  'Add and select the DIA raw files to inspect.',
  'Use the precursor toolbar to enter peptide sequences and optional charge states.',
  'Select precursors, review settings, then run targeted extraction.',
  'Inspect iRT-RT, spectra, MS1 XIC, and MS2 XIC views before exporting results.',
] as const

export const Route = createFileRoute('/spectralens')({
  head: () => ({ meta: [{ title: 'SpectraLens | Targeted DIA peak inspection' }] }),
  component: SpectraLensPage,
})

function SpectraLensPage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 md:py-20`}>
          <div>
            <p className={eyebrow}>Targeted DIA peak inspection</p>
            <h1 className="mt-3 text-[31px]/[1.06] tracking-[-0.035em] text-balance md:text-[46px]">
              Inspect one precursor without running the whole pipeline.
            </h1>
            <p className="mt-4 text-[15.5px] text-ink-600 md:max-w-[34ch] md:text-[17px]">
              Load raw files, enter a precursor, and read MS1 and MS2 peak evidence directly — no full DIA
              analysis in between.
            </p>
            <div className="mt-6 grid gap-3 md:flex md:flex-wrap">
              <a className={`${button('primary', 'lg')} w-full md:w-auto`} href="https://github.com/bionsight/SpectraLens/releases/tag/v0.4.5" target="_blank" rel="noreferrer">Download latest</a>
              <a className={`${button('secondary', 'lg')} w-full md:w-auto`} href="#docs">Read the docs</a>
            </div>
            <p className="mt-5 font-mono text-xs text-ink-500">macOS 10.14+ · Windows 10/11 &nbsp;·&nbsp; v0.4.5</p>
          </div>
          <img
            className="rounded-lg border border-ink-200 shadow-xl"
            src="/images/spectralens/spectralens_window.png"
            alt="SpectraLens desktop application showing precursor selection and XIC peak plots"
          />
        </div>
      </section>

      <section className="bg-ink-900 text-white">
        <div className={`${container} grid grid-cols-2 gap-6 py-10 md:grid-cols-4`}>
          {facts.map(([label, value]) => (
            <div key={label}>
              <span className="block font-mono text-[11.5px] tracking-caps text-white/60 uppercase">{label}</span>
              <strong className="mt-1 block text-[18px] font-semibold tracking-[-0.02em]">{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className={container}>
        <section className={block}>
          <SectionHead title="Fast answers before a full analysis run">
            Focused visual confirmation for selected precursors and raw files.
          </SectionHead>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map(([title, text]) => (
              <article className={panel} key={title}>
                <h3 className="text-base">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={block} id="docs">
          <SectionHead title="Install and use SpectraLens">
            SpectraLens is distributed as a local desktop app for macOS and Windows.
          </SectionHead>
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.75fr)]">
            <article className="max-w-[46rem]">
              <div className="grid gap-3 md:flex md:flex-wrap">
                <a className={`${button('primary', 'md')} w-full md:w-auto`} href="https://d35ag17soow82e.cloudfront.net/0.4.5/SpectraLens-macos-0.4.5.dmg">macOS app</a>
                <a className={`${button('secondary', 'md')} w-full md:w-auto`} href="https://d35ag17soow82e.cloudfront.net/0.4.5/SpectraLens-windows-0.4.5.msi">Windows app</a>
              </div>

              <h3 className={`${caps} mt-8 font-semibold`}>Quick start</h3>
              <ol className="mt-3 grid list-none gap-3 p-0 text-sm">
                {quickStart.map((step, index) => (
                  <li className="border-t border-ink-100 pt-3" key={step}>
                    <span className="font-mono text-[11.5px] text-brand-700">0{index + 1}</span>
                    <p className="mt-1 text-ink-600">{step}</p>
                  </li>
                ))}
              </ol>

              <h3 className={`${caps} mt-8 font-semibold`}>Precursor input</h3>
              <p className="mt-3 text-sm text-ink-600">
                Use one sequence per line or commas between entries. Add a charge suffix such as{' '}
                <code>PEPTIDESEQ.2</code>; use UniMod notation such as <code>C(UniMod:4)</code> for modifications.
              </p>

              <h3 className={`${caps} mt-8 font-semibold`}>Support</h3>
              <p className="mt-3 text-sm text-ink-600">
                Ask questions in{' '}
                <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://github.com/bionsight/SpectraLens/discussions" target="_blank" rel="noreferrer">GitHub Discussions</a>{' '}
                or report reproducible problems through{' '}
                <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://github.com/bionsight/SpectraLens/issues" target="_blank" rel="noreferrer">GitHub Issues</a>.
              </p>
            </article>
            <aside className="grid content-start gap-4">
              <img className="rounded-md border border-ink-200" src="/images/spectralens/select_raw_files.png" alt="Raw file selection in SpectraLens" loading="lazy" />
              <img className="rounded-md border border-ink-200" src="/images/spectralens/fill_sequences.png" alt="Precursor sequence input in SpectraLens" loading="lazy" />
            </aside>
          </div>
        </section>
      </div>
    </>
  )
}
