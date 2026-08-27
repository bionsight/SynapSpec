/* 시안 A 의 공용 프리미티브. design-system.css 의 .ds-btn / .ds-badge 를
   Tailwind 유틸리티로 옮긴 것이라, 클래스 이름이 아니라 값이 원본과 맞는다. */

export const container = 'mx-auto w-[min(1120px,100%_-_2.5rem)] md:w-[min(1120px,100%_-_3rem)]'

const buttonBase =
  'inline-flex items-center justify-center gap-2 rounded-md border font-medium leading-none whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500'

const buttonSize = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-11 px-6 text-base',
} as const

const buttonVariant = {
  primary: 'border-transparent bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800',
  secondary: 'border-ink-500 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'border-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
} as const

export function button(
  variant: keyof typeof buttonVariant = 'primary',
  size: keyof typeof buttonSize = 'md',
) {
  return `${buttonBase} ${buttonSize[size]} ${buttonVariant[variant]}`
}

export const badge =
  'inline-flex items-center gap-1 rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-xs leading-snug font-medium whitespace-nowrap text-ink-600'

/* 섹션 사이 경계선과 리듬. 인접한 블록끼리만 선을 긋는다. */
export const block = 'py-10 md:py-16 [&_+_&]:border-t [&_+_&]:border-ink-100'

export const eyebrow =
  'font-mono text-[11.5px] tracking-caps uppercase text-brand-700'

export const caps = 'text-[11.5px] tracking-caps uppercase text-ink-500'

/* design-system 의 .ds-card. 시안 A 본문에는 카드가 없지만
   About/SpectraLens 의 기존 목록을 새 토큰으로 옮길 때 쓴다. */
export const panel = 'rounded-lg border border-ink-200 bg-white p-6 shadow-sm'
