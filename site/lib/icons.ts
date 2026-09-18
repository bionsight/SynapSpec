// Lookup by name for the handful of pages that pick an icon from data
// (services.json, spectralens.json) rather than writing it as a literal —
// import only the icons those files actually reference, not the whole set.
import { AudioWaveform, Brain, ChartLine, Crosshair, Download, FileSpreadsheet, FolderOpen, Laptop, MousePointer, Settings, Zap } from "@lucide/astro";

export const ICONS = {
  "audio-waveform": AudioWaveform,
  brain: Brain,
  "chart-line": ChartLine,
  crosshair: Crosshair,
  download: Download,
  "file-spreadsheet": FileSpreadsheet,
  "folder-open": FolderOpen,
  laptop: Laptop,
  "mouse-pointer": MousePointer,
  settings: Settings,
  zap: Zap,
};
