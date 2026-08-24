import { createFileRoute } from '@tanstack/react-router'

import { downloads } from '../data/site'
import { card, container, primaryButton, secondaryButton } from '../ui'

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
  return <div className={`${container} py-16 sm:py-24`}>
    <div className="max-w-3xl"><p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">SynapSpec 0.11.0</p><h1 className="text-5xl font-semibold tracking-[-.045em] sm:text-6xl">Download SynapSpec</h1><p className="text-lg text-muted">Choose the build for your operating system and hardware.</p></div>
    <section className="mt-12 grid gap-4 md:grid-cols-3">{platforms.map(([name, description, links]) => <article className={`${card} flex min-h-60 flex-col`} key={name}><h2 className="text-2xl font-semibold tracking-[-.03em]">{name}</h2><p className="text-sm text-muted">{description}</p><div className="mt-auto grid gap-3 pt-6">{links.map(([label, href]) => <a className={primaryButton} href={href} key={label}>{label}</a>)}</div></article>)}</section>
    <p className="mt-8 text-center"><a className={secondaryButton} href="https://docs.synapspec.ai/installation/" target="_blank" rel="noreferrer">View installation guide</a></p>
    <section className="mt-16 rounded-3xl border border-cyan-200 bg-linear-to-br from-cyan-50 to-white p-8 sm:mt-24 sm:p-10"><div className="mb-8 max-w-xl"><p className="mb-3 text-xs font-bold tracking-[.14em] text-brand uppercase">Requirements</p><h2 className="text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Plan for local analysis</h2></div><div className="grid gap-6 sm:grid-cols-2"><div className="grid gap-1"><strong>Operating system</strong><span className="text-sm leading-6 text-muted">Windows 10/11, macOS 10.14+, or Ubuntu 20.04+</span></div><div className="grid gap-1"><strong>Processor</strong><span className="text-sm leading-6 text-muted">4 cores minimum; 16+ cores recommended</span></div><div className="grid gap-1"><strong>Memory</strong><span className="text-sm leading-6 text-muted">16 GB minimum; 32 GB recommended</span></div><div className="grid gap-1"><strong>Storage</strong><span className="text-sm leading-6 text-muted">3 GB for installation and roughly 2× your dataset size for processing</span></div><div className="grid gap-1"><strong>Runtime</strong><span className="text-sm leading-6 text-muted">.NET 8.0 or newer; Mono where required</span></div></div></section>
  </div>
}
