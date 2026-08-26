---
layout: default
title: "Benchmarks"
description: "SynapSpec validation results on the LFQBench standard dataset — quantification accuracy against known ground-truth ratios"
---

{% assign bm = site.data.benchmarks %}
{% assign run = bm.runs | last %}

<div class="container">

  <div class="section-header">
    <h1>Benchmarks</h1>
    <p class="section-subtitle">
      SynapSpec is validated against LFQBench, a standard dataset whose true protein
      ratios are known in advance. Every number on this page is measured, not estimated.
    </p>
  </div>

  <section class="py-lg">
    <div class="bench-meta">
      <span><i class="fas fa-calendar-day"></i> Measured {{ run.date }}</span>
      <span><i class="fas fa-flask"></i> {{ bm.dataset.name }} &middot; {{ bm.dataset.instrument }}</span>
      <span><i class="fas fa-server"></i> AWS {{ run.instance }}</span>
    </div>
  </section>

  <!-- ── Quantification accuracy ─────────────────────────────── -->
  <section class="py-lg">
    <div class="section-header">
      <h2>Quantification Accuracy</h2>
      <p class="section-subtitle">
        LFQBench mixes human, yeast and <em>E.&nbsp;coli</em> proteins into two samples at
        fixed, known ratios. A perfect result lands exactly on the target line.
      </p>
    </div>

    <div class="bench-scale">
      {% for item in run.accuracy %}
        {% assign target_pos = item.target_log2_ratio | plus: 2.5 | times: 25 %}
        {% assign value_pos = item.median_log2_ratio | plus: 2.5 | times: 25 %}
        {% assign band_half = item.mad_from_target | times: 25 %}
        {% assign band_left = value_pos | minus: band_half %}
        {% assign band_width = band_half | times: 2 %}

        <div class="bench-species" data-species="{{ item.species }}">
          <div class="bench-species-head">
            <h3>{{ item.label }}</h3>
            <span class="bench-count">{{ item.count_display }} precursors</span>
          </div>

          <div class="bench-track">
            <div class="bench-band" style="left: {{ band_left }}%; width: {{ band_width }}%;"></div>
            <div class="bench-target" style="left: {{ target_pos }}%;">
              <span class="bench-target-label">target {{ item.target_log2_ratio }}</span>
            </div>
            <div class="bench-value" style="left: {{ value_pos }}%;">
              <span class="bench-value-label">{{ item.median_log2_ratio }}</span>
            </div>
          </div>

          <div class="bench-species-foot">
            <span>deviation from target <strong>{{ item.deviation }}</strong></span>
            <span>spread (MAD) <strong>{{ item.mad_from_target }}</strong></span>
          </div>
        </div>
      {% endfor %}

      <p class="bench-axis-note">
        Horizontal axis: log<sub>2</sub> ratio between the two samples.
        The shaded band shows the median absolute deviation &mdash; how tightly
        individual measurements cluster around the target.
      </p>
    </div>
  </section>

  <!-- ── Identification depth ────────────────────────────────── -->
  <section class="py-lg">
    <div class="section-header">
      <h2>Identification Depth</h2>
      <p class="section-subtitle">
        Totals across {{ run.files_in_experiment }} runs
        ({{ bm.dataset.conditions | size }} conditions &times; {{ bm.dataset.replicates }} replicates).
      </p>
    </div>

    <div class="bench-stats">
      <div class="bench-stat">
        <span class="bench-stat-value">{{ run.total_precursors_display }}</span>
        <span class="bench-stat-label">Precursors</span>
      </div>
      <div class="bench-stat">
        <span class="bench-stat-value">{{ run.total_proteins_display }}</span>
        <span class="bench-stat-label">Protein groups</span>
      </div>
      <div class="bench-stat">
        <span class="bench-stat-value">{{ run.runtime_hours }}<small>h</small></span>
        <span class="bench-stat-label">Wall-clock runtime</span>
      </div>
    </div>
  </section>

  <!-- ── Method ──────────────────────────────────────────────── -->
  <section class="py-lg">
    <div class="highlight-section">
      <h2>How this was measured</h2>
      <p>
        {{ bm.dataset.name }} is a community-standard benchmark for label-free quantification.
        Because the mixing ratios are fixed when the samples are prepared, the correct answer
        is known independently of any software &mdash; which makes it possible to measure
        accuracy rather than merely report output volume.
      </p>

      <div class="bench-method">
        <div>
          <h4>Dataset</h4>
          <p>
            {{ bm.dataset.instrument }} &mdash; {{ bm.dataset.files }} raw files:
            conditions {{ bm.dataset.conditions | join: " and " }},
            {{ bm.dataset.replicates }} replicates each.
          </p>
        </div>
        <div>
          <h4>Ground truth</h4>
          <p>
            Expected log<sub>2</sub> ratios &mdash;
            {%- for item in run.accuracy %} {{ item.label }} {{ item.target_log2_ratio }}
            {%- unless forloop.last %},{% endunless %}{% endfor %}.
          </p>
        </div>
        <div>
          <h4>Environment</h4>
          <p>
            AWS {{ run.instance }}, single run. Random seed fixed so the
            analysis is reproducible.
          </p>
        </div>
        <div>
          <h4>Scope</h4>
          <p>
            Measured on the {{ bm.filter.branch }} branch of the SynapSpec engine.
            Runtime reflects one run on shared infrastructure and will vary with hardware.
          </p>
        </div>
      </div>
    </div>
  </section>

</div>
