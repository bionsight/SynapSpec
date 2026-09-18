/// <reference types="astro/client" />

// plotly.js-cartesian-dist-min ships no type declarations. We only ever call
// the handful of methods used in components/benchmark/*.astro, so `any` here
// is a deliberate boundary, not a shortcut around real typing.
declare module "plotly.js-cartesian-dist-min" {
  const Plotly: any;
  export default Plotly;
}
