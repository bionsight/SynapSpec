import type { ReactNode } from 'react'

import { caps } from '../ui'

export function SectionHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-[40rem]">
      <h2 className="text-[23px] tracking-[-0.03em] md:text-[28px]">{title}</h2>
      {children ? <p className="mt-2 text-ink-600">{children}</p> : null}
    </div>
  )
}

/* 스펙 표는 좁은 폭에서 스택으로 무너뜨리지 않는다 — 열끼리 비교되어야 읽힌다. */
export function TableScroll({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto md:overflow-x-visible">
      <div className="min-w-[42rem] md:min-w-0">{children}</div>
    </div>
  )
}

/* 라이브의 요구사항은 항목마다 여러 줄이고, 그 줄들이 서로 조건을 건다
   (최소/권장/단서). 한 줄로 합치면 의미가 새므로 줄을 그대로 세운다. */
export function Requirements({
  items,
}: {
  items: readonly (readonly [string, readonly string[]])[]
}) {
  return (
    <dl className="m-0 grid gap-x-8 gap-y-5 md:grid-cols-3">
      {items.map(([term, lines]) => (
        <div className="border-t border-ink-100 pt-3" key={term}>
          <dt className={caps}>{term}</dt>
          {lines.map((line) => (
            <dd className="m-0 mt-1 text-sm text-ink-600" key={line}>{line}</dd>
          ))}
        </div>
      ))}
    </dl>
  )
}

export function Closer({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div className="mt-10 grid gap-6 border-t-2 border-brand-600 pt-6 md:flex md:flex-wrap md:items-end md:justify-between">
      <div>
        <h2 className="text-[23px] tracking-[-0.03em] md:text-[26px]">{title}</h2>
        <p className="mt-2 text-ink-600">{children}</p>
      </div>
      <div className="grid gap-3 md:flex md:flex-wrap">{actions}</div>
    </div>
  )
}
