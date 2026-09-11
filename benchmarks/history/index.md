---
layout: default
title: "LFQBench / Astral history"
description: "Every archived SynapSpec LFQBench run on the Orbitrap Astral dataset, identification depth over time"
# 아직 공개 전 — 내비게이션에 링크를 걸지 않고 색인도 막는다
noindex: true
sitemap: false
---

{% assign bm = site.data.benchmarks %}
{% assign runs_asc = bm.runs %}
{% assign runs_desc = bm.runs | sort: "date" | reverse %}
{% assign by_count = bm.runs | sort: "total_precursors" %}
{% assign min_count = by_count | first %}
{% assign max_count = by_count | last %}
{% assign minimum = min_count.total_precursors | divided_by: 20000 | times: 20000 %}
{% assign maximum_pad = max_count.total_precursors | plus: 19999 %}
{% assign maximum = maximum_pad | divided_by: 20000 | times: 20000 %}
{% assign span_range = maximum | minus: minimum %}
{% assign first_run = runs_asc | first %}
{% assign last_run = runs_asc | last %}
{% assign first_epoch = first_run.date | date: "%s" %}
{% assign last_epoch = last_run.date | date: "%s" %}
{% assign day_span = last_epoch | minus: first_epoch %}
{% assign steps = span_range | divided_by: 20000 %}
{% assign recorded_run_slug = site.data.benchmark_catalog.recorded_run_slug %}

<div class="container">

  <div class="breadcrumbs">
    <a href="{{ '/benchmarks/' | relative_url }}">&larr; Benchmarks</a> / Dataset history
  </div>

  <div class="page-header">
    <h1>LFQBench <span class="bench-muted">/ Orbitrap Astral</span></h1>
    <p class="section-subtitle">{{ bm.coverage.run_count }} archived runs from {{ bm.coverage.date_from }} to {{ bm.coverage.date_to }}. Same dataset, different engine runs; these are not verified release versions.</p>
    <p class="section-subtitle"><a href="{{ '/benchmarks/' | append: recorded_run_slug | append: '/' | relative_url }}" class="bench-link">View the separately imported 7 September run</a></p>
  </div>

  <section class="py-lg">
    <h2>Identification history</h2>
    <div class="bench-history-chart-wrap">
      <svg viewBox="0 0 1040 270" class="bench-history-svg" role="img" aria-label="Distinct precursor counts across {{ bm.coverage.run_count }} archived LFQBench runs. Exact counts are in the table below.">
        {% for i in (0..steps) %}
          {% assign tick_offset = i | times: 20000 %}
          {% assign tick = tick_offset | plus: minimum %}
          {% assign tick_scaled = tick_offset | times: 190 | divided_by: span_range %}
          {% assign tick_y = 225 | minus: tick_scaled %}
          {% assign tick_label_y = tick_y | plus: 4 %}
          <line x1="65" x2="975" y1="{{ tick_y }}" y2="{{ tick_y }}" class="bench-history-gridline" />
          <text x="55" y="{{ tick_label_y }}" text-anchor="end" class="bench-history-ticklabel">{{ tick | divided_by: 1000 }}k</text>
        {% endfor %}

        {% for run in runs_asc %}
          {% assign e = run.date | date: '%s' %}
          {% assign dx = e | minus: first_epoch %}
          {% assign dx_scaled = dx | times: 910 | divided_by: day_span %}
          {% assign x = 65 | plus: dx_scaled %}
          {% assign vfrac = run.total_precursors | minus: minimum %}
          {% assign v_scaled = vfrac | times: 190 | divided_by: span_range %}
          {% assign y = 225 | minus: v_scaled %}
          <circle cx="{{ x }}" cy="{{ y }}" r="5" class="bench-history-dot"><title>{{ run.date }}: {{ run.total_precursors_display }} precursors</title></circle>
        {% endfor %}

        <text x="65" y="255" class="bench-history-ticklabel">{{ first_run.date }}</text>
        <text x="975" y="255" text-anchor="end" class="bench-history-ticklabel">{{ last_run.date }}</text>
      </svg>
    </div>
    <p class="bench-axis-note" style="text-align: left;">The vertical axis starts at {{ minimum }}, not zero, to show changes. Position on the horizontal axis follows run date. Changes in settings may affect counts.</p>
  </section>

  <section class="py-lg bench-border-t">
    <h2>Archived runs</h2>
    <div class="bench-table-wrap">
      <table class="bench-table">
        <thead>
          <tr><th>Date</th><th class="num">Precursor IDs</th><th class="num">Protein IDs</th><th class="num">Elapsed time</th><th>Resource</th><th>LFQ metrics</th></tr>
        </thead>
        <tbody>
          {% for run in runs_desc %}
          <tr>
            <th scope="row"><a href="{{ '/benchmarks/' | append: run.slug | append: '/' | relative_url }}">{{ run.date }}</a></th>
            <td class="num">{{ run.total_precursors_display }}</td>
            <td class="num">{{ run.total_proteins_display }}</td>
            <td class="num">{% if run.runtime_hours %}{{ run.runtime_hours }} h{% else %}&mdash;{% endif %}</td>
            <td><code>{{ run.instance }}</code></td>
            <td>{% if run.has_accuracy %}Measured{% else %}Not recorded{% endif %}</td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
    <p class="bench-axis-note" style="text-align: left;">Runtime is not directly comparable across different instance types. Counts retain the archived source fields; bars share a zero baseline and the archive peak as their maximum.</p>
  </section>

</div>
