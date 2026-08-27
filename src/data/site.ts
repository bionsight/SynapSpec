export const version = '0.11.0'

/* 히어로 옆 앱 창과 숫자 띠에 쓰는 실제 실행 결과.
   출처: gh-page 브랜치의 `_data/benchmarks.json`, 2026-07-22 run (LFQBench / Orbitrap Astral).
   파생값(7h 14m, 0.08)은 그 파일의 runtime_hours 7.23 과 accuracy[].deviation 에서 나온다. */
export const exampleRun = {
  title: 'SynapSpec — LFQBench, Orbitrap Astral',
  files: '6 files',
  wallClock: '7h 14m',
  tiles: [
    ['Precursors', '261,903'],
    ['Protein groups', '17,831'],
    ['Log2 ratio error', '\u2264 0.08'],
  ],
  /* 파일 하나당 precursor 수. 축을 0 에서 시작하지 않으므로 범위를 함께 적는다 —
     여섯 파일의 편차는 2% 뿐이고, 그 점이 이 그래프가 말하려는 바다. */
  perFile: {
    label: 'Precursors per file',
    axis: [237000, 245000],
    range: '238.5k \u2013 243.6k across 6 files',
    values: [
      ['A_R1', 240598],
      ['A_R2', 238545],
      ['A_R3', 241116],
      ['B_R1', 238505],
      ['B_R2', 243552],
      ['B_R3', 243011],
    ],
  },
  figures: [
    ['261,903', 'precursors identified'],
    ['17,831', 'protein groups'],
    ['7h 14m', 'wall clock, 6 DIA files'],
    ['\u2264 0.08', 'median log2 ratio deviation from target'],
  ],
  footnote:
    'LFQBench on an Orbitrap Astral \u00b7 6 files, two conditions \u00d7 three replicates \u00b7 one 32-vCPU machine, CPU-only build \u00b7 run 2026-07-22',
} as const

export const pipeline = [
  ['01', 'Load', 'Point at a folder of acquisitions and set the experiment layout.', '.raw · .mzML · .d'],
  ['02', 'Library', 'Predict a spectral library with the deep learning model, or import your own.', 'predicted · imported · hybrid'],
  ['03', 'Search', 'Score precursors against the library with false discovery rate control.', '1% FDR · semi-specific'],
  ['04', 'Report', 'Protein groups, a quantification matrix and differential expression results.', '.tsv · .parquet'],
] as const

export const workflows = [
  ['DIA and SWATH-MS search', 'Acquisitions and a spectral library', 'Peptide identifications with false discovery rate control'],
  ['Spectral library prediction', 'A protein sequence database', 'A predicted library, or a hybrid with your own'],
  ['Semi-specific search', 'The same acquisitions', 'Identifications beyond fully tryptic peptides'],
  ['Label-free quantification', 'Identifications across runs', 'A protein-level quantification matrix'],
  ['Isobaric-label workflows', 'Multiplexed acquisitions', 'Quantification per channel'],
  ['Statistical analysis', 'A quantification matrix and sample groups', 'Differential expression, multiple-testing corrected'],
] as const

const baseRequirements = [
  ['Operating system', 'Windows 10/11, macOS 10.14+, Ubuntu 20.04+'],
  ['Processor', '4 cores minimum, 16+ recommended'],
  ['Memory', '16 GB minimum, 32 GB recommended'],
  ['Storage', '3 GB installed, plus roughly 2× your dataset'],
  ['Runtime', '.NET 8.0 or newer; Mono where required'],
] as const

export const requirements = [
  ...baseRequirements,
  ['Install', 'One-click installer, dependencies included'],
] as const

/* 다운로드 페이지는 설치 방법 대신 GPU 가 선택이라는 점을 마지막 칸에 둔다. */
export const installRequirements = [
  ...baseRequirements,
  ['GPU', 'Optional — the CPU build runs the same workflows'],
] as const

const cdn = `https://d3s63qbeileh4l.cloudfront.net/${version}`

export const downloads = {
  windowsGpu: `${cdn}/SynapSpec-windows-${version}.zip`,
  windowsCpu: `${cdn}/SynapSpec-windows-cpu-${version}.zip`,
  linuxGpu: `${cdn}/SynapSpec-linux-${version}.tar.gz`,
  linuxCpu: `${cdn}/SynapSpec-linux-cpu-${version}.tar.gz`,
  macos: `${cdn}/SynapSpec-macos-${version}.dmg`,
} as const

/* 플랫폼별 빌드 표. rowSpan 은 같은 OS 의 첫 행에만 값을 준다. */
export const builds = [
  {
    platform: 'Windows',
    rows: [
      { build: 'GPU', requirement: 'Windows 10 or 11, CUDA GPU', file: `SynapSpec-windows-${version}.zip`, href: downloads.windowsGpu, primary: true },
      { build: 'CPU', requirement: 'Windows 10 or 11', file: `SynapSpec-windows-cpu-${version}.zip`, href: downloads.windowsCpu, primary: false },
    ],
  },
  {
    platform: 'Linux',
    rows: [
      { build: 'GPU', requirement: 'Most current distributions, CUDA GPU', file: `SynapSpec-linux-${version}.tar.gz`, href: downloads.linuxGpu, primary: true },
      { build: 'CPU', requirement: 'Most current distributions', file: `SynapSpec-linux-cpu-${version}.tar.gz`, href: downloads.linuxCpu, primary: false },
    ],
  },
  {
    platform: 'macOS',
    rows: [
      { build: 'Universal', requirement: 'macOS 10.14 or newer', file: `SynapSpec-macos-${version}.dmg`, href: downloads.macos, primary: true },
    ],
  },
] as const

export const coreFeatures = [
  ['Peptide identification & quantification', 'Accurate peptide identification with false discovery rate control and quantification across samples.'],
  ['Deep learning spectral libraries', 'Model-based spectral library prediction and generation for peptide identification and DIA analysis.'],
  ['Label-free quantification', 'Support for label-free and isobaric-label workflows for multiplexed proteomics experiments.'],
  ['Semi-specific support', 'DIA and SWATH-MS workflows with spectral library generation and matching.'],
  ['Statistical analysis', 'Differential expression analysis with multiple-testing correction.'],
  ['Scalable multi-omics', 'Workflows for metaproteomics, immunoproteomics, and clinical proteomics research.'],
] as const
