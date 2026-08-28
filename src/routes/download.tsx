import { createFileRoute } from '@tanstack/react-router'

import { Requirements, SectionHead, TableScroll } from '../components/Section'
import { builds, requirements } from '../data/site'
import { block, button, caps, container } from '../ui'

export const Route = createFileRoute('/download')({
  head: () => ({ meta: [{ title: 'Download SynapSpec' }] }),
  component: DownloadPage,
})

function DownloadPage() {
  return (
    <div className={container}>
      <div className="pt-10 pb-6 md:pt-16 md:pb-8">
        <h1 className="text-[30px] tracking-[-0.035em] md:text-[40px]">Download SynapSpec</h1>
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
                      <th className="border-b border-ink-100 px-3 py-4 text-start align-middle font-semibold" rowSpan={platform.rows.length}>{platform.platform}</th>
                      <td className="border-b border-ink-100 px-3 py-4 align-middle text-ink-600" rowSpan={platform.rows.length}>{platform.compatibility}</td>
                    </>
                  )}
                  <td className="border-b border-ink-100 px-3 py-4 align-middle text-ink-600">{row.build}</td>
                  <td className="border-b border-ink-100 px-3 py-4 font-mono text-[12.5px] text-ink-500">{row.file}</td>
                  <td className="border-b border-ink-100 px-3 py-4 text-end align-middle whitespace-nowrap">
                    <a className={button(row.primary ? 'primary' : 'secondary', 'sm')} href={row.href}>Download</a>
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </TableScroll>

      <section className={`${block} mt-10 mb-10 bg-ink-50 px-6 md:mt-16 md:mb-16`}>
        <SectionHead title="System Requirements" />
        <Requirements items={requirements} />
        <div className="mt-8">
          <a className={button('secondary', 'lg')} href="https://docs.synapspec.ai/installation/" target="_blank" rel="noreferrer">View Installation Guide</a>
        </div>
      </section>
    </div>
  )
}
