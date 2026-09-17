// Shared Plotly styling so every benchmark chart looks like one system instead
// of four different libraries. Matches the tokens in styles/_variables.scss —
// keep these in sync by hand, Plotly can't read SCSS variables at build time.

export const COLORS = {
  primary: "#106a9e",
  primaryDark: "#0f5680",
  primaryLight: "#aedaf3",
  text: "#1a1f26",
  textLight: "#5c6773",
  border: "#e7eaee",
  background: "#ffffff",
};

// One color per LFQBench species, kept distinct from the brand blue used
// elsewhere so a chart with all three doesn't read as "which one is the brand".
export const SPECIES_COLORS: Record<string, string> = {
  Human: "#106a9e",
  Yeast: "#d97706",
  "E. coli": "#0f9b8e",
};

export const FONT_FAMILY =
  "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export function baseLayout(overrides: Record<string, unknown> = {}) {
  return {
    font: { family: FONT_FAMILY, color: COLORS.text, size: 12 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    margin: { t: 10, r: 20, b: 40, l: 50 },
    showlegend: false,
    hoverlabel: {
      bgcolor: COLORS.background,
      bordercolor: COLORS.border,
      font: { family: FONT_FAMILY, color: COLORS.text },
    },
    ...overrides,
  };
}

export const axisStyle = {
  gridcolor: COLORS.border,
  zerolinecolor: COLORS.border,
  linecolor: COLORS.border,
  tickfont: { color: COLORS.textLight, size: 11 },
};

export const baseConfig = { displayModeBar: false, responsive: true };
