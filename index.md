---
layout: default
title: "Home"
description: "SynapSpec - Advanced DIA-MS analysis software solution for proteomics research and drug discovery"
---

<section class="hero">
  <div class="container">
    <h1>{{ site.company.tagline }}</h1>
    <p class="hero-subtitle">
      Advanced DIA mass spectrometry analysis solution for proteomics research.
      Accelerate your drug discovery and protein function studies with our cutting-edge software.
    </p>
    <div class="hero-actions">
      <a href="{{ '/download/' | relative_url }}" class="btn btn-large">Download Solution</a>
      <a href="https://github.com/bionsight/SynapSpec/discussions" class="btn btn-large btn-outline" target="_blank" rel="noopener">Join Community</a>
    </div>
  </div>
</section>

<section class="py-xl">
  <div class="container">
    <div class="section-header">
      <h2>SynapSpec DIA Analysis Solution</h2>
      <p class="section-subtitle">
        Comprehensive software solution for DIA-MS data processing and analysis in proteomics research
      </p>
    </div>

    <div class="services-grid">
      {% for service in site.data.services %}
      <div class="card">
        <div class="card-header">
          <div class="card-icon">
            <i class="{{ service.icon }}"></i>
          </div>
          <h3>{{ service.name }}</h3>
        </div>
        <div class="card-content">
          <p>{{ service.description }}</p>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>

<section class="py-xl highlight-section">
  <div class="container text-center">
    <div class="section-header">
      <h2>Ready to Try SynapSpec?</h2>
      <p class="section-subtitle">
        Download our DIA analysis solution or reach out to discuss how it can advance your proteomics research
      </p>
    </div>
    <a href="{{ '/download/' | relative_url }}" class="btn btn-large btn-accent">Download Now</a>
    <a href="{{ '/contact/' | relative_url }}" class="btn btn-large btn-outline" style="margin-left: 1rem;">Contact Us</a>
  </div>
</section>
