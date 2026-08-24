export const services = [
  ['Easy installation', 'One-click installer with automatic dependency management. Get started in minutes, not hours.'],
  ['Cross-platform support', 'Works on Windows, macOS, and Linux with the same powerful workflow.'],
  ['Deep learning optimization', 'AI-assisted mass spectrometry workflows for accuracy and speed.'],
  ['Intuitive interface', 'A focused interface designed for beginners and experts.'],
  ['Real-time processing', 'Fast processing and immediate feedback while reviewing data.'],
  ['Automated workflows', 'Automation handles repetitive tasks so researchers can focus on discovery.'],
] as const

export const coreFeatures = [
  ['Peptide identification & quantification', 'Accurate peptide identification with false discovery rate control and quantification across samples.'],
  ['Deep learning spectral libraries', 'Model-based spectral library prediction and generation for peptide identification and DIA analysis.'],
  ['Label-free quantification', 'Support for label-free and isobaric-label workflows for multiplexed proteomics experiments.'],
  ['Semi-specific support', 'DIA and SWATH-MS workflows with spectral library generation and matching.'],
  ['Statistical analysis', 'Differential expression analysis with multiple-testing correction.'],
  ['Scalable multi-omics', 'Workflows for metaproteomics, immunoproteomics, and clinical proteomics research.'],
] as const

export const downloads = {
  windowsGpu: 'https://d3s63qbeileh4l.cloudfront.net/0.11.0/SynapSpec-windows-0.11.0.zip',
  windowsCpu: 'https://d3s63qbeileh4l.cloudfront.net/0.11.0/SynapSpec-windows-cpu-0.11.0.zip',
  linuxGpu: 'https://d3s63qbeileh4l.cloudfront.net/0.11.0/SynapSpec-linux-0.11.0.tar.gz',
  linuxCpu: 'https://d3s63qbeileh4l.cloudfront.net/0.11.0/SynapSpec-linux-cpu-0.11.0.tar.gz',
  macos: 'https://d3s63qbeileh4l.cloudfront.net/0.11.0/SynapSpec-macos-0.11.0.dmg',
} as const
