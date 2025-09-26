---
layout: default
title: "Home"
description: "Advanced chemical proteomics research and development solutions for scientific discovery"
---

<section class="hero">
  <div class="container">
    <h1>{{ site.company.tagline }}</h1>
    <p class="hero-subtitle">
      We develop cutting-edge chemical proteomics technologies to accelerate drug discovery and advance our understanding of protein function in living systems.
    </p>
    <div class="hero-actions">
      <a href="{{ '/software/' | relative_url }}" class="btn btn-large">Download Now</a>
    </div>
  </div>
</section>

<section class="py-xl">
  <div class="container">
    <div class="section-header">
      <h2>Our Core Services</h2>
      <p class="section-subtitle">
        Comprehensive chemical proteomics solutions for modern drug discovery and basic research
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
      <h2>Ready to Get Started?</h2>
      <p class="section-subtitle">
        Contact us to discuss how our chemical proteomics solutions can advance your research
      </p>
    </div>
    <a href="{{ '/contact/' | relative_url }}" class="btn btn-large btn-accent">Get in Touch</a>
  </div>
</section>
