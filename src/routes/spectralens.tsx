import { createFileRoute } from '@tanstack/react-router'

import { SectionHead } from '../components/Section'
import { spectralens } from '../data/spectralens'
import { block, button, caps, container, eyebrow, panel } from '../ui'

export const Route = createFileRoute('/spectralens')({
  head: () => ({
    meta: [
      { title: 'SpectraLens' },
      {
        name: 'description',
        content: 'SpectraLens is a targeted DIA peak inspection desktop tool for quickly checking precursor and fragment peaks in raw mass spectrometry files.',
      },
    ],
  }),
  component: SpectraLensPage,
})

function SpectraLensPage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 md:py-20`}>
          <div>
            <p className={eyebrow}>DIA peak inspection</p>
            <h1 className="mt-3 text-[31px]/[1.06] tracking-[-0.035em] text-balance md:text-[46px]">SpectraLens</h1>
            <p className="mt-4 text-[15.5px] text-ink-600 md:text-[17px]">Targeted DIA peak inspection for the precursor you care about.</p>
            <p className="mt-3 text-[15.5px] text-ink-600 md:max-w-[38ch]">
              SpectraLens is built for the moment when you do not want to run a full DIA pipeline. Load raw files,
              enter the precursor you care about, and quickly inspect the MS1/MS2 peak evidence.
            </p>
            <div className="mt-6 grid gap-3 md:flex md:flex-wrap">
              <a className={`${button('primary', 'lg')} w-full md:w-auto`} href={spectralens.releaseUrl} target="_blank" rel="noreferrer">Download Latest</a>
              <a className={`${button('secondary', 'lg')} w-full md:w-auto`} href="#docs">Read Docs</a>
            </div>
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
          {spectralens.highlights.map(([label, value]) => (
            <div key={label}>
              <span className="block font-mono text-[11.5px] tracking-caps text-white/60 uppercase">{label}</span>
              <strong className="mt-1 block text-[18px] font-semibold tracking-[-0.02em]">{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <div className={container}>
        <section className={block} id="features">
          <p className={eyebrow}>Why it exists</p>
          <SectionHead title="Fast answers before a full analysis run">
            SpectraLens is for targeted visual confirmation: a few precursors, selected raw files, and immediate
            chromatographic evidence without waiting for a full DIA analysis workflow.
          </SectionHead>
          <div className="grid gap-4 md:grid-cols-3">
            {spectralens.features.map(([title, text]) => (
              <article className={panel} key={title}>
                <h3 className="text-base">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={block} id="workflow">
          <p className={eyebrow}>Workflow</p>
          <SectionHead title="From raw file to peak evidence" />
          <ol className="grid list-none gap-4 p-0 md:grid-cols-4 md:gap-5">
            {spectralens.workflow.map(([title, text], index) => (
              <li className="border-t-2 border-brand-600 pt-4" key={title}>
                <span className="font-mono text-[11.5px] text-brand-700">{index + 1}</span>
                <h3 className="mt-1 text-base">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className={block} id="docs">
          <p className={eyebrow}>Docs</p>
          <SectionHead title="Install and use SpectraLens">
            This page keeps the working notes and user docs together because SpectraLens has a focused surface area.
          </SectionHead>
          <div className="grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)]">
            <nav className="grid content-start gap-2 text-sm text-ink-600" aria-label="SpectraLens documentation sections">
              {['Download', 'Troubleshooting', 'Quick start', 'Precursor input', 'Settings', 'Outputs', 'Support'].map((label) => (
                <a className="hover:text-brand-700" href={`#${label.toLowerCase().replace(' ', '-')}`} key={label}>{label}</a>
              ))}
            </nav>
            <article className="grid gap-10">
              <section id="download">
                <h3 className="text-xl">Download</h3>
                <p className="mt-3 text-sm text-ink-600">
                  SpectraLens is distributed as a desktop application for macOS and Windows. Download the binary for
                  your platform, launch it locally, and create a workspace to inspect DIA precursor peaks.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {spectralens.downloads.map(([platform, description, href]) => (
                    <a className={`${panel} hover:border-brand-300`} href={href} key={platform}>
                      <span className="block font-semibold">{platform}</span>
                      <span className="mt-1 block text-sm text-ink-600">{description}</span>
                    </a>
                  ))}
                </div>
              </section>

              <section id="troubleshooting">
                <h3 className="text-xl">Troubleshooting</h3>
                <h4 className="mt-5 text-base">macOS: app cannot be opened because the developer cannot be verified</h4>
                <p className="mt-2 text-sm text-ink-600">
                  Due to macOS Gatekeeper security settings, you may need to manually approve SpectraLens because the
                  current macOS build may not have an Apple Developer code signature.
                </p>
                <ol className="mt-4 grid list-decimal gap-1 ps-5 text-sm text-ink-600">
                  <li>Open System Settings or System Preferences.</li>
                  <li>Go to Privacy &amp; Security.</li>
                  <li>Scroll down to the Security section.</li>
                  <li>Find the message about SpectraLens being blocked because it is not from an identified developer, then click Open Anyway.</li>
                </ol>
                <p className="mt-4 text-sm text-ink-600">After approving the app, open SpectraLens again from Finder or Launchpad.</p>
              </section>

              <section id="quick-start">
                <h3 className="text-xl">Quick start</h3>
                <p className="mt-3 text-sm text-ink-600">
                  Start by creating or opening a local workspace. SpectraLens keeps selected raw files, target
                  precursors, settings, and exported results inside that workspace.
                </p>
                <div className="mt-5 grid gap-6">
                  {spectralens.quickStart.map(([title, text, image, alt, caption], index) => (
                    <article className="grid gap-4 border-t border-ink-100 pt-4 md:grid-cols-[minmax(0,1fr)_14rem]" key={title}>
                      <div>
                        <span className={caps}>Step {index + 1}</span>
                        <h4 className="mt-1 text-base">{title}</h4>
                        <p className="mt-2 text-sm text-ink-600">{text}</p>
                      </div>
                      <figure className="m-0">
                        <img className="rounded-md border border-ink-200" src={image} alt={alt} loading="lazy" />
                        <figcaption className="mt-1 text-xs text-ink-500">{caption}</figcaption>
                      </figure>
                    </article>
                  ))}
                </div>
              </section>

              <section id="precursor-input">
                <h3 className="text-xl">Precursor input</h3>
                <p className="mt-3 text-sm text-ink-600">
                  Paste one sequence per line or separate multiple entries with commas. Add a charge suffix with .2
                  or .3 when you want a specific charge state. If the charge is omitted, SpectraLens predicts likely
                  charge states and iRT values.
                </p>
                <pre className="mt-4 overflow-x-auto rounded-md bg-ink-900 p-4 text-xs text-ink-50"><code>{`PEPTIDESEQ.2
PEPC(UniMod:4)TIDESEQ.3
AA[Hex(1)HexNAc(2)]DD
PEPTIDES(UniMod:21)EQ,PEPTIDEM(UniMod:35)SEQ`}</code></pre>
              </section>

              <section id="settings">
                <h3 className="text-xl">Settings reference</h3>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {spectralens.settings.map(([name, value]) => (
                    <div className="border-t border-ink-100 pt-3" key={name}>
                      <dt className="font-semibold text-sm">{name}</dt>
                      <dd className="m-0 mt-1 text-sm text-ink-600">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>

              <section id="outputs">
                <h3 className="text-xl">Outputs</h3>
                <p className="mt-3 text-sm text-ink-600">
                  SpectraLens keeps precursor rows, local file status, analysis settings, and extracted result tables
                  inside the selected workspace. Use Export CSV from the visualization panel to save a reviewable
                  result table for downstream notes or manual curation.
                </p>
              </section>

              <section id="support">
                <h3 className="text-xl">Support &amp; community</h3>
                <p className="mt-3 text-sm text-ink-600">SpectraLens uses GitHub Discussions and Issues for community support, bug reports, and feature ideas.</p>
                <ul className="mt-4 grid list-disc gap-2 ps-5 text-sm text-ink-600">
                  <li><strong>Questions and usage help:</strong> ask in <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://github.com/bionsight/SpectraLens/discussions" target="_blank" rel="noreferrer">GitHub Discussions</a>.</li>
                  <li><strong>Bug reports:</strong> open a <a className="font-semibold text-brand-700 hover:text-brand-800" href="https://github.com/bionsight/SpectraLens/issues" target="_blank" rel="noreferrer">GitHub Issue</a> with your operating system, SpectraLens version, input file type, and a short description of what happened.</li>
                  <li><strong>Feature ideas:</strong> share suggestions in Discussions so they can be discussed before becoming issues.</li>
                </ul>
              </section>
            </article>
          </div>
        </section>
      </div>
    </>
  )
}
