import { createFileRoute } from '@tanstack/react-router'

import { downloads } from '../data/site'

const platforms = [
  ['Windows', 'Windows 10 and 11', [['GPU build', downloads.windowsGpu], ['CPU build', downloads.windowsCpu]]],
  ['Linux', 'Most current Linux distributions', [['GPU build', downloads.linuxGpu], ['CPU build', downloads.linuxCpu]]],
  ['macOS', 'macOS 10.14 or newer', [['Download for macOS', downloads.macos]]],
] as const

export const Route = createFileRoute('/download')({
  head: () => ({ meta: [{ title: 'Download SynapSpec' }] }),
  component: DownloadPage,
})

function DownloadPage() {
  return <div className="container page">
    <div className="section-heading"><p className="eyebrow">SynapSpec 0.11.0</p><h1>Download SynapSpec</h1><p>Choose the build for your operating system and hardware.</p></div>
    <section className="card-grid platform-grid">{platforms.map(([name, description, links]) => <article className="card platform-card" key={name}><h2>{name}</h2><p>{description}</p><div className="stack">{links.map(([label, href]) => <a className="button" href={href} key={label}>{label}</a>)}</div></article>)}</section>
    <p className="center"><a className="button button-secondary" href="https://docs.synapspec.ai/installation/" target="_blank" rel="noreferrer">View installation guide</a></p>
    <section className="section callout"><div className="section-heading"><p className="eyebrow">Requirements</p><h2>Plan for local analysis</h2></div><div className="requirements"><div><strong>Operating system</strong><span>Windows 10/11, macOS 10.14+, or Ubuntu 20.04+</span></div><div><strong>Processor</strong><span>4 cores minimum; 16+ cores recommended</span></div><div><strong>Memory</strong><span>16 GB minimum; 32 GB recommended</span></div><div><strong>Storage</strong><span>3 GB for installation and roughly 2× your dataset size for processing</span></div><div><strong>Runtime</strong><span>.NET 8.0 or newer; Mono where required</span></div></div></section>
  </div>
}
