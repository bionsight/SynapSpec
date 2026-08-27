import { createFileRoute } from '@tanstack/react-router'

import { Closer, Requirements, SectionHead, TableScroll } from '../components/Section'
import { builds, requirements, version } from '../data/site'
import { block, button, caps, container, eyebrow } from '../ui'

export const Route = createFileRoute('/download')({
  head: () => ({ meta: [{ title: 'Download SynapSpec' }] }),
  component: DownloadPage,
})

const cell = 'border-b border-ink-100 px-3 py-4 text-start align-middle'

function DownloadPage() {
  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <p className={eyebrow}>Latest release · {version}</p>
        <h1 className="mt-3 text-[30px] tracking-[-0.035em] md:text-[40px]">Download SynapSpec</h1>
        <p className="mt-3 max-w-[46ch] text-[15.5px] text-ink-600 md:text-[17px]">
          Choose the build for your operating system and hardware.
        </p>
      </div>

      <TableScroll>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {['Platform', 'Compatibility', 'Build', 'File', ''].map((heading, index) => (
                <th className={`${caps} border-b border-ink-200 px-3 py-2 text-start font-semibold`} key={heading || index}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {builds.flatMap((platform) =>
              platform.rows.map((row, index) => (
                <tr key={row.file}>
                  {index === 0 && (
                    <>
                      <th className={`${cell} font-semibold`} rowSpan={platform.rows.length}>{platform.platform}</th>
                      <td className={`${cell} text-ink-600`} rowSpan={platform.rows.length}>{platform.compatibility}</td>
                    </>
                  )}
                  <td className={`${cell} text-ink-600`}>{row.build}</td>
                  <td className={`${cell} font-mono text-[12.5px] text-ink-500`}>{row.file}</td>
                  <td className={`${cell} text-end whitespace-nowrap`}>
                    <a className={button(row.primary ? 'primary' : 'secondary', 'sm')} href={row.href}>Download</a>
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </TableScroll>

      <section className={block}>
        <SectionHead title="System Requirements">
          The one-click installer handles dependencies automatically. These are the requirements for the
          analysis itself.
        </SectionHead>
        <Requirements items={requirements} />
        <Closer
          title="Installation Guide"
          actions={
            <>
              <a className={`${button('secondary', 'lg')} w-full md:w-auto`} href="https://docs.synapspec.ai/installation/" target="_blank" rel="noreferrer">View Installation Guide</a>
              <a className={`${button('ghost', 'lg')} w-full md:w-auto`} href="https://github.com/bionsight/SynapSpec/discussions" target="_blank" rel="noreferrer">Join Discussions</a>
            </>
          }
        >
          Setup instructions for each platform, plus technical discussions and community support on GitHub.
        </Closer>
      </section>
    </div>
  )
}
