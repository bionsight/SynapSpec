import { Link, createFileRoute } from '@tanstack/react-router'

import { Closer, Requirements, SectionHead, TableScroll } from '../components/Section'
import { exampleRun, pipeline, requirements, version, workflows } from '../data/site'
import { badge, block, button, caps, container, eyebrow } from '../ui'

export const Route = createFileRoute('/')({
  head: () => ({ meta: [{ title: 'SynapSpec | DIA proteomics on your own machine' }] }),
  component: HomePage,
})

/* 그리드 선 y=24/52/80 사이에 값을 앉힌다. 축이 0 에서 시작하지 않으므로
   창 안에 실제 범위를 함께 적어야 납작한 선이 오해되지 않는다. */
const [axisMin, axisMax] = exampleRun.perFile.axis
const points = exampleRun.perFile.values.map(([name, value], index, all) => ({
  name,
  x: 16 + (index * 288) / (all.length - 1),
  y: 24 + ((axisMax - value) / (axisMax - axisMin)) * 56,
}))
const chartLabel = `Precursors per file: ${exampleRun.perFile.values.map(([name, value]) => `${name} ${value.toLocaleString('en-US')}`).join(', ')}`

/* 히어로 옆에 서는 제품 창. 형용사 대신 완료된 실행 하나를 보여주는 것이
   이 시안의 주장 전부라서, 스크린샷이 아니라 마크업으로 그린다. */
function AppWindow() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-200 bg-white text-xs/[1.45] shadow-xl">
      <div className="flex items-center gap-3 border-b border-ink-100 bg-ink-100 px-3 py-2">
        <span className="flex gap-[5px]" aria-hidden="true">
          <i className="size-[9px] rounded-full bg-ink-300" />
          <i className="size-[9px] rounded-full bg-ink-300" />
          <i className="size-[9px] rounded-full bg-ink-300" />
        </span>
        <span className="text-[11.5px] text-ink-500">{exampleRun.title}</span>
      </div>
      <div className="grid gap-4 p-4">
        <div className="flex items-baseline gap-3">
          <b className="text-[13px]">Run complete</b>
          <span className={badge}>{exampleRun.files}</span>
          <span className="ms-auto font-mono text-[11px] text-success-text">{exampleRun.wallClock}</span>
        </div>
        <span className="block h-1 overflow-hidden rounded-[2px] bg-ink-200">
          <i className="block h-full w-full bg-success" />
        </span>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {exampleRun.tiles.map(([label, value], index) => (
            <div
              className={`rounded-md border border-ink-100 bg-white p-3 ${index === exampleRun.tiles.length - 1 ? 'col-span-2 md:col-span-1' : ''}`}
              key={label}
            >
              <div className="text-[10.5px] tracking-caps text-ink-500 uppercase">{label}</div>
              <div className="mt-[2px] text-[18px] font-semibold tabular-nums">{value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-md border border-ink-100 bg-white p-3">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <span className="text-[10.5px] tracking-caps text-ink-500 uppercase">{exampleRun.perFile.label}</span>
            <span className="font-mono text-[10px] text-ink-400">{exampleRun.perFile.range}</span>
          </div>
          <svg viewBox="0 0 320 96" className="block h-auto w-full" role="img" aria-label={chartLabel}>
            <g stroke="var(--color-ink-200)" strokeWidth="1">
              <line x1="0" y1="24" x2="320" y2="24" />
              <line x1="0" y1="52" x2="320" y2="52" />
              <line x1="0" y1="80" x2="320" y2="80" />
            </g>
            <polyline fill="none" stroke="var(--color-viz-1)" strokeWidth="2" strokeLinejoin="round" points={points.map(({ x, y }) => `${x},${y}`).join(' ')} />
            <g fill="var(--color-viz-1)">
              {points.map(({ x, y, name }) => <circle cx={x} cy={y} r="2.5" key={name} />)}
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <>
      <section className="border-b border-ink-100 bg-linear-to-b from-ink-50 to-white">
        <div className={`${container} grid items-center gap-8 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-12 md:py-20`}>
          <div>
            <p className={eyebrow}>DIA mass spectrometry · Desktop</p>
            <h1 className="mt-3 text-[31px]/[1.06] tracking-[-0.035em] text-balance md:text-[46px]">
              Raw DIA files in. Quantified proteins out. On your own machine.
            </h1>
            <p className="mt-4 text-[15.5px] text-ink-600 md:max-w-[34ch] md:text-[17px]">
              Spectral library prediction, search, FDR control and label-free quantification in one local
              pipeline — nothing is uploaded, nothing is queued.
            </p>
            <div className="mt-6 grid gap-3 md:flex md:flex-wrap">
              <Link to="/download" className={`${button('primary', 'lg')} w-full md:w-auto`}>Download {version}</Link>
              <a className={`${button('secondary', 'lg')} w-full md:w-auto`} href="https://docs.synapspec.ai" target="_blank" rel="noreferrer">Read the docs</a>
            </div>
            <p className="mt-5 font-mono text-xs text-ink-500">
              Windows 10/11 · macOS 10.14+ · Ubuntu 20.04+ &nbsp;·&nbsp; GPU and CPU builds
            </p>
          </div>
          <AppWindow />
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
          <SectionHead title="Four stages, one window">
            Every stage runs locally and writes its own output, so a failed step is re-run instead of the whole analysis.
          </SectionHead>
          <div className="grid gap-4 md:grid-cols-4 md:gap-5">
            {pipeline.map(([number, title, description, io]) => (
              <div className="border-t-2 border-brand-600 pt-4" key={number}>
                <div className="font-mono text-[11.5px] text-brand-700">{number}</div>
                <h3 className="mt-1 text-base">{title}</h3>
                <p className="mt-2 text-sm text-ink-600">{description}</p>
                <p className="mt-3 font-mono text-[11.5px] text-ink-500">{io}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={block} id="workflows">
          <SectionHead title="Workflows it covers">
            What the pipeline supports today, without plugins or a separate licence.
          </SectionHead>
          <TableScroll>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {['Workflow', 'Takes', 'Returns'].map((heading) => (
                    <th className={`${caps} border-b border-ink-200 p-3 text-start font-semibold`} key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workflows.map(([workflow, takes, returns]) => (
                  <tr key={workflow}>
                    <th className="w-auto border-b border-ink-100 p-3 text-start align-top font-semibold md:w-68">{workflow}</th>
                    <td className="w-auto border-b border-ink-100 p-3 align-top text-ink-600 md:w-84">{takes}</td>
                    <td className="border-b border-ink-100 p-3 align-top text-ink-600">{returns}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        </section>

        <section className={block}>
          <SectionHead title="Runs on the hardware you already have">
            A workstation is enough. A GPU makes library prediction faster; the CPU build does the same work without one.
          </SectionHead>
          <Requirements items={requirements} />
          <Closer
            title="Try it on one of your own runs"
            actions={
              <>
                <Link to="/download" className={`${button('primary', 'lg')} w-full md:w-auto`}>Download {version}</Link>
                <Link to="/contact" className={`${button('secondary', 'lg')} w-full md:w-auto`}>Contact us</Link>
              </>
            }
          >
            Download the build for your platform, or tell us about the study you are planning.
          </Closer>
        </section>
      </div>
    </>
  )
}
