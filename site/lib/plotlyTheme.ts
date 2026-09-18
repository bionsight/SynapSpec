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

// Tool colors for the three-tool comparison charts — Okabe-Ito colorblind-safe
// palette, matching the $viz-1/2/3 already used by the hand-built "Accuracy vs
// depth" SVG scatter on the same page (_benchmark.scss's .bench-scatter-dot-*).
export const TOOL_COLORS: Record<string, string> = {
  synapspec: "#0072b2",
  diann: "#e69f00",
  spectronaut: "#009e73",
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

// Plotly sizes a chart from its container's rendered width at draw time. A
// container inside a CSS-only radio/label toggle (the no-JS tab pattern used
// throughout these pages) is `display: none` at first paint whenever it isn't
// the default-selected tab, so drawing into it eagerly bakes in some fallback
// size that's wrong once CSS reveals the real (usually narrower) width later.
//
// Rather than draw wrong and fix it up with a resize, defer the draw itself:
// wait for a ResizeObserver notification carrying a real, nonzero width —
// immediately, if the target is already visible, or once CSS gives it a box
// later. A zero-width entry is ignored and left observing: some browsers
// fire an initial callback for a target that isn't actually being rendered
// yet (contrary to spec — see https://github.com/w3c/csswg-drafts/issues/11280),
// and disconnecting on that one would draw once against a fake size and
// never get another chance to redraw once the element is genuinely shown.
export function drawWhenVisible(el: Element, draw: () => void) {
  const observer = new ResizeObserver((entries) => {
    if (entries[0].contentRect.width === 0) return;
    observer.disconnect();
    draw();
  });
  observer.observe(el);
}

// Different problem from drawWhenVisible: that one waits for a CSS-hidden
// panel to become shown (width goes 0 → real), which happens on first paint
// for anything not behind a no-JS toggle — no use for deferring work on an
// ordinary, always-visible container. This one waits for the user to
// actually scroll near the element, for widgets whose data is one or more
// multi-megabyte fetches (ScatterWidget's per-tool point clouds) rather than
// something already inlined in the page HTML — so the fetch + Plotly draw
// don't run, and jank the page, until there's a reason to.
//
// rootMargin gives it a head start: the callback fires while the element is
// still `rootMargin` away from the viewport, so on a normal scroll-down read
// the data is usually already loaded by the time it comes into view.
export function whenNearViewport(el: Element, callback: () => void, rootMargin = "600px") {
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      callback();
    },
    { rootMargin },
  );
  observer.observe(el);
}
