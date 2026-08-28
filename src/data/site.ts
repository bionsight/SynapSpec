export const version = '0.11.0'

/* 이 파일의 문구는 전부 synapspec.ai 라이브에서 가져온 것이다 (2026-08-27 대조).
   원문은 scratchpad 의 live-copy.md 참조. 시안이 새로 만들어낸 주장 —
   업로드/대기열 없음, 4단계 파이프라인, 파일 포맷, 1% FDR, CUDA, 플러그인
   불필요 — 은 라이브에 근거가 없어 전부 뺐다. */

/* 라이브 홈의 6개 카드. 문구 그대로. */
export const services = [
  ['Easy Installation', 'One-click installer with automatic dependency management. Get started in minutes, not hours.'],
  ['Cross-Platform Support', 'Works seamlessly on Windows, macOS, and Linux. Same powerful features across all platforms.'],
  ['Deep Learning Optimization', 'Advanced AI algorithms optimize mass spectrometry workflows for maximum accuracy and speed.'],
  ['Intuitive Interface', 'Clean, user-friendly interface designed for both beginners and experts. No complex configuration needed.'],
  ['Real-time Processing', 'Process and analyze data in real-time with lightning-fast performance and instant feedback.'],
  ['Automated Workflows', 'Smart automation handles repetitive tasks, letting you focus on discovery and insights.'],
] as const

/* 라이브 /about/ 의 Core Features. 문구 그대로. */
export const coreFeatures = [
  ['Peptide Identification & Quantification', 'Advanced algorithms for accurate peptide identification with robust false discovery rate control and precise quantification across samples.'],
  ['Deep Learning-based Spectral Library Generation', 'Advanced deep learning models for accurate spectral library prediction and generation, enabling enhanced peptide identification and DIA analysis.'],
  ['Label-free Quantification', 'Support for both label-free and isobaric labeling methods for multiplexed quantitative proteomics experiments.'],
  ['Semi-Specific Support', 'Optimized workflows for data-independent acquisition and SWATH-MS analysis with spectral library generation and matching.'],
  ['Statistical Analysis & Differential Expression', 'Integrated statistical tools for differential expression analysis and multiple testing correction.'],
  ['Scalable Multi-Omics Solution', 'Developing scalable workflows applicable to diverse research areas including metaproteomics, immunoproteomics, and clinical proteomics for comprehensive biological insights.'],
] as const

/* 라이브 /download/ 의 System Requirements. 한 줄로 줄이면 의미가 바뀌는 항목이
   있어서(저장공간 2 TB 하한, 스레드당 4 GB, Windows Server) 줄 단위로 그대로 옮긴다. */
export const requirements = [
  ['Operating System', [
    'Windows: Windows 10, 11, or Server 2016/2019/2022 (64-bit)',
    'macOS: macOS 10.14 or higher',
    'Linux: Ubuntu 20.04 LTS or higher',
  ]],
  ['Processor', [
    'Minimum: 4 cores',
    'Recommended: Intel or AMD CPU with 16 cores or more',
  ]],
  ['Memory', [
    'Minimum: 16 GB RAM',
    'Recommended: 32 GB RAM or more',
    'Note: 4 GB RAM per thread for optimal performance',
  ]],
  ['Storage', [
    'Installation: 3 GB available disk space',
    'Data Processing: 2 TB or more (2x dataset size recommended)',
    'Recommended: SSD for improved processing speed',
  ]],
  ['Software Dependencies', [
    '.NET 8.0 or higher',
    'Mono',
  ]],
] as const

const cdn = `https://d3s63qbeileh4l.cloudfront.net/${version}`

export const downloads = {
  windowsGpu: `${cdn}/SynapSpec-windows-${version}.zip`,
  windowsCpu: `${cdn}/SynapSpec-windows-cpu-${version}.zip`,
  linuxGpu: `${cdn}/SynapSpec-linux-${version}.tar.gz`,
  linuxCpu: `${cdn}/SynapSpec-linux-cpu-${version}.tar.gz`,
  macos: `${cdn}/SynapSpec-macos-${version}.dmg`,
} as const

/* 플랫폼별 다운로드 카드. Compatible 문구는 라이브 다운로드 페이지 그대로다. */
export const builds = [
  {
    platform: 'Windows',
    compatibility: 'Compatible with Windows 10/11',
    rows: [
      { build: 'GPU', file: `SynapSpec-windows-${version}.zip`, href: downloads.windowsGpu, primary: true },
      { build: 'CPU', file: `SynapSpec-windows-cpu-${version}.zip`, href: downloads.windowsCpu, primary: false },
    ],
  },
  {
    platform: 'Linux',
    compatibility: 'Compatible with most Linux distributions',
    rows: [
      { build: 'GPU', file: `SynapSpec-linux-${version}.tar.gz`, href: downloads.linuxGpu, primary: true },
      { build: 'CPU', file: `SynapSpec-linux-cpu-${version}.tar.gz`, href: downloads.linuxCpu, primary: false },
    ],
  },
  {
    platform: 'macOS',
    compatibility: 'Compatible with macOS 10.14+',
    rows: [
      { build: '—', file: `SynapSpec-macos-${version}.dmg`, href: downloads.macos, primary: true },
    ],
  },
] as const
