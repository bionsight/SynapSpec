---
layout: default
title: "Benchmarks"
description: "SynapSpec benchmark history on the LFQBench standard dataset — three-tool comparisons on fixed inputs, and every recorded run over time"
# 아직 공개 전 — 내비게이션에 링크를 걸지 않고 색인도 막는다
noindex: true
sitemap: false
---

{% assign ledgers = site.data.benchmark_ledger %}
{% assign oe480 = ledgers[0] %}
{% assign astral = ledgers[1] %}

<div class="container">

  <div class="page-header">
    <h1>Benchmarks</h1>
    <p>Fixed input files. Three analysis tools. Recorded runs over time.</p>
  </div>

  <input type="radio" name="dataset" id="dataset-oe480" class="bench-ds-input" checked>
  <input type="radio" name="dataset" id="dataset-astral" class="bench-ds-input">

  <div class="bench-ds-head">
    <div class="bench-toggle-group" role="group" aria-label="Dataset">
      <label for="dataset-oe480" class="bench-toggle-btn">{{ oe480.name }}</label>
      <label for="dataset-astral" class="bench-toggle-btn">{{ astral.name }}</label>
    </div>
    <a href="#run-history-oe480" class="bench-ds-panel-oe480 bench-link">Run history ({{ oe480.rows.size }})</a>
    <a href="#run-history-astral" class="bench-ds-panel-astral bench-link">Run history ({{ astral.rows.size }})</a>
  </div>

  {% for ledger in ledgers %}
    {% assign is_astral = false %}
    {% if ledger.id == astral.id %}{% assign is_astral = true %}{% endif %}
    {% assign panel_class = "bench-ds-panel-oe480" %}
    {% assign anchor = "run-history-oe480" %}
    {% if is_astral %}{% assign panel_class = "bench-ds-panel-astral" %}{% assign anchor = "run-history-astral" %}{% endif %}
    {% assign comparison_row = ledger.rows | last %}

    <div class="bench-ds-panel {{ panel_class }}">

      <section class="block" aria-label="Selected results">
        <div class="section-header">
          <h2>SynapSpec &middot; DIA-NN &middot; Spectronaut</h2>
        </div>
        <p class="bench-axis-note" style="text-align: left;">{{ ledger.name }} &middot; {{ ledger.files.size }} input files &middot; Archived comparison; execution date not recorded</p>
        <p class="bench-axis-note" style="text-align: left;"><a href="{{ '/benchmarks/' | append: comparison_row.sourceSlug | append: '/' | relative_url }}" class="bench-link">Run details &amp; source</a></p>
        <p class="bench-axis-note" style="text-align: left;">Same six input filenames across tools. Releases, full settings and input checksums are not reconciled; this is not a controlled current-release ranking.</p>
        <a href="{{ '/assets/images/benchmarks/' | append: ledger.comparison.figure | relative_url }}" target="_blank" rel="noreferrer" class="bench-figure-link">
          <img src="{{ '/assets/images/benchmarks/' | append: ledger.comparison.figure | relative_url }}" width="2880" height="1600" alt="{{ ledger.name }}: SynapSpec, DIA-NN and Spectronaut precursor IDs, six-run completeness, CV and Human, Yeast, E. coli LFQ median and IQR.">
        </a>
        <div class="bench-figure-actions">
          <a href="{{ '/assets/images/benchmarks/' | append: ledger.comparison.figure | relative_url }}" target="_blank" rel="noreferrer">Open full-size figure</a>
          <a href="{{ '/assets/images/benchmarks/' | append: ledger.comparison.figure | relative_url }}" download>Download PNG</a>
        </div>
      </section>

      <section id="{{ anchor }}" class="block">
        <div class="section-header">
          <h2>Run history</h2>
          <p class="section-subtitle">One row per recorded execution or comparison bundle, newest dated runs first. Open a run to view its detailed results and figures. Dates are source display dates; undated comparisons are listed separately at the end.</p>
        </div>
        <div class="bench-table-wrap" style="max-width: 100%;">
          <table class="bench-table">
            <caption>Precursor IDs by tool &middot; &ldquo;&mdash;&rdquo; means not linked, not zero. Matching filenames do not prove identical file contents, settings or counting definitions; changes are descriptive, not isolated software improvements.</caption>
            <thead>
              <tr><th>Run / date</th><th>Commit / source</th><th class="num">SynapSpec</th><th class="num">DIA-NN</th><th class="num">Spectronaut</th><th class="num">SynapSpec time</th><th>Resource</th></tr>
            </thead>
            <tbody>
              {% for row in ledger.rows %}
              <tr>
                <th scope="row">
                  <a href="{{ '/benchmarks/' | append: row.sourceSlug | append: '/' | relative_url }}">{{ row.date | default: "Undated comparison" }}</a>
                  <span class="bench-subvalue">{{ row.label }}</span>
                </th>
                <td>{% if row.commit %}{{ row.commit }}{% elsif row.comparisonSlug %}Folder labels only{% else %}Not recorded{% endif %}</td>
                {% for value in row.counts_display %}
                  <td class="num">{{ value | default: "—" }}</td>
                {% endfor %}
                <td class="num">{% if row.runtime %}{{ row.runtime | round: 2 }} h{% else %}&mdash;{% endif %}</td>
                <td>{{ row.resource | default: "—" }}</td>
              </tr>
              {% endfor %}
            </tbody>
          </table>
        </div>
        <p class="bench-axis-note" style="text-align: left;">
          {% if ledger.rows.size > 1 %}{{ ledger.rows.size | minus: 1 }} dated SynapSpec records and one undated three-tool bundle. Only one imported three-tool bundle is available for this dataset.{% else %}Only one imported three-tool bundle is available for this dataset. A repeated-run history is not yet available.{% endif %}
        </p>
      </section>

      <details class="bench-details bench-border-t" style="border-top: 1px solid var(--bench-border, #e2e2e2); border-radius: 0; padding-top: 1.25rem;">
        <summary>Fixed input-file list</summary>
        <ul class="bench-file-list">{% for file in ledger.files %}<li>{{ file }}</li>{% endfor %}</ul>
      </details>

    </div>
  {% endfor %}

</div>
