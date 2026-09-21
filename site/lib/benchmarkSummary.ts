export interface BenchmarkSummary {
  runCount: number;
  showCompleteness: boolean;
  tools: {
    id: string;
    label: string;
    precursors: number;
    completePercent: number | null;
  }[];
}
