// _config.yml의 navigation을 그대로 옮긴 것. Jekyll의 site.navigation과 대응한다.
export type NavItem = { name: string; url: string; external?: boolean };

export const navigation: NavItem[] = [
  { name: "Home", url: "/" },
  { name: "About", url: "/about/" },
  { name: "Download", url: "/download/" },
  { name: "Benchmarks", url: "/benchmarks/" },
  { name: "Documentation", url: "https://docs.synapspec.ai", external: true },
  { name: "Contact", url: "/contact/" },
];

export const site = {
  title: "SynapSpec",
  description: "Advanced proteomics research and development solutions for scientific discovery",
  company: {
    name: "Bionsight",
    tagline: "Advancing Scientific Discovery Through Proteomics",
    email: "contact@bionsight.com",
    github: "bionsight",
  },
  github: {
    repository: "bionsight/SynapSpec",
    discussions: "https://github.com/bionsight/SynapSpec/discussions",
    issues: "https://github.com/bionsight/SynapSpec/issues",
    newDiscussion: "https://github.com/bionsight/SynapSpec/discussions/new?category=general",
  },
  analytics: {
    mixpanelToken: "0af3e19a73b0a8fa536568138d6f08a7",
  },
};
