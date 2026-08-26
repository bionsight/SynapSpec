---
layout: default
title: "Benchmarks"
description: "SynapSpec benchmark history on the LFQBench standard dataset — identification depth and quantification accuracy measured on every tracked release of the engine"
---

{% assign bm = site.data.benchmarks %}
{% assign runs_desc = bm.runs | sort: "date" | reverse %}
{% assign peak = bm.runs | map: "total_precursors" | sort | last %}

<div class="container">

  <div class="section-header">
    <h1>Benchmarks</h1>
    <p class="section-subtitle">
      SynapSpec is measured against LFQBench, a standard dataset whose true protein
      ratios are known in advance. Every run on the {{ bm.filter.branch }} branch is
      recorded here &mdash; improvements and regressions alike.
    </p>
  </div>

  <section class="py-lg">
    <div class="bench-meta">
      <span><i class="fas fa-list-ol"></i> {{ bm.coverage.run_count }} runs</span>
      <span><i class="fas fa-calendar-day"></i> {{ bm.coverage.date_from }} &ndash; {{ bm.coverage.date_to }}</span>
      <span><i class="fas fa-flask"></i> {{ bm.dataset.name }} &middot; {{ bm.dataset.instrument }}</span>
    </div>
  </section>

  <!-- ── Trend ───────────────────────────────────────────────── -->
  <section class="py-lg">
    <div class="section-header">
      <h2>Identification Depth Over Time</h2>
      <p class="section-subtitle">Total precursors identified across the {{ bm.dataset.files }}-file benchmark.</p>
    </div>

    <div class="bench-trend">
      {% for run in bm.runs %}
        {% assign height = run.total_precursors | times: 100 | divided_by: peak %}
        <a class="bench-trend-bar" href="{{ '/benchmarks/' | append: run.slug | append: '/' | relative_url }}"
           title="{{ run.date }} — {{ run.total_precursors_display }} precursors">
          <span class="bench-trend-fill" style="height: {{ height }}%;"></span>
          <span class="bench-trend-date">{{ run.date | date: "%b" }}</span>
        </a>
      {% endfor %}
    </div>
    <p class="bench-axis-note">
      Bars are scaled against the highest value in the series ({{ peak }}). Click any bar for that run's detail.
    </p>
  </section>

  <!-- ── History table ───────────────────────────────────────── -->
  <section class="py-lg">
    <div class="section-header">
      <h2>All Runs</h2>
    </div>

    <div class="bench-table-wrap">
      <table class="bench-table">
        <thead>
          <tr>
            <th>Date</th>
            <th class="num">Precursors</th>
            <th class="num">Protein groups</th>
            <th class="num">Runtime</th>
            <th>Instance</th>
            <th>Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {% for run in runs_desc %}
            <tr>
              <td>
                <a href="{{ '/benchmarks/' | append: run.slug | append: '/' | relative_url }}">{{ run.date }}</a>
              </td>
              <td class="num">{{ run.total_precursors_display }}</td>
              <td class="num">{{ run.total_proteins_display }}</td>
              <td class="num">{% if run.runtime_hours %}{{ run.runtime_hours }} h{% else %}&mdash;{% endif %}</td>
              <td><code>{{ run.instance }}</code></td>
              <td>
                {% if run.has_accuracy %}
                  <span class="bench-badge is-on">measured</span>
                {% else %}
                  <span class="bench-badge">&mdash;</span>
                {% endif %}
              </td>
            </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>

    <p class="bench-axis-note">
      Quantification accuracy has been recorded since {{ bm.coverage.date_to }}
      ({{ bm.coverage.accuracy_count }} of {{ bm.coverage.run_count }} runs);
      earlier runs report identification depth only.
      Runtime reflects a single run on shared infrastructure and is not comparable across instance types.
    </p>
  </section>

</div>
