import records from './benchmark-comparisons.json'

export const comparisonRecords = records
export type ComparisonRecord = (typeof comparisonRecords)[number]
export const findComparison = (slug: string) => comparisonRecords.find((record) => record.slug === slug)
