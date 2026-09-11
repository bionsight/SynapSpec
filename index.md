---
layout: default
title: "Home"
description: "SynapSpec - Advanced DIA-MS analysis software solution for proteomics research and drug discovery"
---

<section class="hero">
  <div class="container hero-grid">
    <div>
      <p class="eyebrow">DIA-MS data processing and analysis</p>
      <h1>Advancing Scientific Discovery Through Proteomics</h1>
      <p class="hero-subtitle">
        Advanced DIA mass spectrometry analysis solution for proteomics research. Accelerate your
        drug discovery and protein function studies with our cutting-edge software.
      </p>
      <div class="hero-actions">
        <a href="{{ '/download/' | relative_url }}" class="btn btn-large">Download Solution</a>
        <a href="https://github.com/bionsight/SynapSpec/discussions" class="btn btn-large btn-outline" target="_blank" rel="noopener">Join Community</a>
      </div>
    </div>
    <img src="{{ '/assets/images/synapspec/run_detail.png' | relative_url }}" alt="SynapSpec showing a finished run: precursor, peptide and protein-group counts, and the same three counts per raw file">
  </div>
</section>

<section class="stat-band">
  <div class="container">
    <p class="stat-band-label">Example run</p>
    <div class="stat-band-grid">
      {% for figure in site.data.example_run.figures %}
      <div>
        <div class="stat-value">{{ figure.value }}</div>
        <p class="stat-label">{{ figure.label }}</p>
      </div>
      {% endfor %}
    </div>
    <p class="stat-band-footnote">{{ site.data.example_run.footnote }}</p>
  </div>
</section>

<div class="container">
  <section class="block">
    <div class="section-header">
      <h2>SynapSpec DIA Analysis Solution</h2>
      <p class="section-subtitle">Comprehensive software solution for DIA-MS data processing and analysis in proteomics research.</p>
    </div>
    <div class="services-grid">
      {% for service in site.data.services %}
      <article class="card">
        <h3>{{ service.name }}</h3>
        <p>{{ service.description }}</p>
      </article>
      {% endfor %}
    </div>
  </section>

  <section class="block">
    <div class="section-header">
      <h2>System Requirements</h2>
    </div>
    {% include requirements.html %}

    <div class="closer highlight-section">
      <div>
        <h2>Ready to Try SynapSpec?</h2>
        <p>Download our DIA analysis solution or reach out to discuss how it can advance your proteomics research.</p>
      </div>
      <div class="closer-actions">
        <a href="{{ '/download/' | relative_url }}" class="btn btn-large">Download Now</a>
        <a href="{{ '/contact/' | relative_url }}" class="btn btn-large btn-outline">Contact Us</a>
      </div>
    </div>
  </section>
</div>
