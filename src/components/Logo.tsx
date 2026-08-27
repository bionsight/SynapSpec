import { Link } from '@tanstack/react-router'

/* 시안은 브랜드 사각형에 흰 "S" 를 그려 넣었지만, 그건 자리표시였다.
   실제 마크는 460×539 세로 비율이라 정사각형에 욱여넣으면 찌그러진다 —
   높이만 잡고 폭은 비율대로 둔다. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="SynapSpec home"
      className={`inline-flex items-center gap-2 text-[17px] font-semibold text-ink-600 ${className}`}
    >
      <img className="h-[30px] w-auto" src="/images/favicon.png" alt="" width={460} height={539} />
      <span className="font-normal"><b className="font-bold">Synap</b>Spec</span>
    </Link>
  )
}
