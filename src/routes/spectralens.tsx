import { createFileRoute } from '@tanstack/react-router'

const features = [
  ['Precursor-centered inspection', 'Add a peptide sequence and charge state, then inspect the targeted signal without processing the entire experiment.'],
  ['Interactive XIC views', 'Review precursor MS1 and fragment MS2 XICs with linear or log scale and optional TIC or base-peak overlays.'],
  ['iRT and charge prediction', 'Use model-based iRT and charge predictions to begin with a focused search window.'],
  ['Spectrum context', 'Compare experimental and predicted spectra alongside chromatographic evidence.'],
  ['Raw-file workspace', 'Keep local raw files, converted files, peptide lists, and analysis settings together.'],
  ['Exportable review', 'Export CSV results for notes, sharing, and downstream manual curation.'],
] as const

const workflow = ['Create a workspace', 'Add DIA raw files', 'Enter target precursors', 'Inspect MS1 and MS2 peak evidence'] as const

export const Route = createFileRoute('/spectralens')({
  head: () => ({ meta: [{ title: 'SpectraLens | Targeted DIA peak inspection' }] }),
  component: SpectraLensPage,
})

function SpectraLensPage() {
  return <>
    <section className="spectralens-hero"><div className="container spectralens-hero-grid"><div><p className="eyebrow">Targeted DIA peak inspection</p><h1>SpectraLens</h1><p className="hero-subtitle">Targeted DIA peak inspection for the precursor you care about.</p><p>Load raw files, enter a precursor, and inspect MS1/MS2 peak evidence without waiting for a full DIA pipeline.</p><div className="actions"><a className="button" href="https://github.com/bionsight/SpectraLens/releases/tag/v0.4.5" target="_blank" rel="noreferrer">Download latest</a><a className="button button-secondary" href="#docs">Read docs</a></div></div><img className="app-preview" src="/images/spectralens/spectralens_window.png" alt="SpectraLens desktop application showing precursor selection and XIC peak plots" /></div></section>
    <section className="summary-band"><div className="container highlights"><div><span>Targeted</span><strong>Precursor-first</strong></div><div><span>Views</span><strong>MS1 and MS2 XIC</strong></div><div><span>Context</span><strong>iRT, RT, spectra</strong></div><div><span>Output</span><strong>CSV export</strong></div></div></section>
    <section className="section container"><div className="section-heading"><p className="eyebrow">Why it exists</p><h2>Fast answers before a full analysis run</h2><p>Focused visual confirmation for selected precursors and raw files.</p></div><div className="card-grid">{features.map(([title, text]) => <article className="card" key={title}><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="section workflow-section"><div className="container"><div className="section-heading"><p className="eyebrow">Workflow</p><h2>From raw file to peak evidence</h2></div><ol className="workflow">{workflow.map((step) => <li key={step}>{step}</li>)}</ol></div></section>
    <section id="docs" className="section container docs"><div className="section-heading"><p className="eyebrow">Docs</p><h2>Install and use SpectraLens</h2></div><div className="docs-grid"><article className="prose"><h3>Download</h3><p>SpectraLens is distributed as a local desktop app for macOS and Windows.</p><div className="actions"><a className="button" href="https://d35ag17soow82e.cloudfront.net/0.4.5/SpectraLens-macos-0.4.5.dmg">macOS app</a><a className="button button-secondary" href="https://d35ag17soow82e.cloudfront.net/0.4.5/SpectraLens-windows-0.4.5.msi">Windows app</a></div><h3>Quick start</h3><ol><li>Add and select the DIA raw files to inspect.</li><li>Use the precursor toolbar to enter peptide sequences and optional charge states.</li><li>Select precursors, review settings, then run targeted extraction.</li><li>Inspect iRT-RT, spectra, MS1 XIC, and MS2 XIC views before exporting results.</li></ol><h3>Precursor input</h3><p>Use one sequence per line or commas between entries. Add a charge suffix such as <code>PEPTIDESEQ.2</code>; use UniMod notation such as <code>C(UniMod:4)</code> for modifications.</p><h3>Support</h3><p>Ask questions in <a href="https://github.com/bionsight/SpectraLens/discussions">GitHub Discussions</a> or report reproducible problems through <a href="https://github.com/bionsight/SpectraLens/issues">GitHub Issues</a>.</p></article><aside className="guide-images"><img src="/images/spectralens/select_raw_files.png" alt="Raw file selection in SpectraLens" loading="lazy" /><img src="/images/spectralens/fill_sequences.png" alt="Precursor sequence input in SpectraLens" loading="lazy" /></aside></div></section>
  </>
}
