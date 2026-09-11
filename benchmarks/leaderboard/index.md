---
layout: default
title: "LFQBench leaderboard"
description: "SynapSpec, DIA-NN and Spectronaut ranked by LFQ quantification accuracy on the same six LFQBench input files, per dataset"
# 아직 공개 전 — 내비게이션에 링크를 걸지 않고 색인도 막는다
noindex: true
sitemap: false
---

{% assign scatter_sets = site.data.benchmark_comparison_scatter %}

<div class="container">

  <div class="breadcrumbs">
    <a href="{{ '/benchmarks/' | relative_url }}">&larr; Benchmarks</a> / Leaderboard
  </div>

  <div class="page-header">
    <h1>LFQBench leaderboard</h1>
    <p class="section-subtitle">SynapSpec, DIA-NN and Spectronaut on the same six LFQBench input files, ranked by quantification accuracy within each dataset.</p>
  </div>

  <div class="bench-callout">
    Ranked by median absolute log&#8322; fold-change error only &mdash; lower is more accurate. This is not the
    whole picture: a tool with more precursors identified is not automatically worse, and one with fewer is
    not automatically more careful. See each dataset&rsquo;s <a href="#oe480" class="bench-link">Accuracy vs.
    depth</a> chart for both axes together before drawing conclusions. Same caveats as the comparison pages:
    not a current-release ranking, archived reports, execution settings not reconciled.
  </div>

  {% for scatter in scatter_sets %}
    {% assign record = site.data.benchmark_comparisons | where: "slug", scatter.ledger_slug | first %}
    {% assign ranked = scatter.tools | sort: "median_epsilon" %}
    {% assign anchor = "astral" %}
    {% if scatter.ledger_slug == "lfqbench-202409-archived" %}{% assign anchor = "oe480" %}{% endif %}

  <section id="{{ anchor }}" class="py-lg bench-border-t">
    <div class="bench-header-split">
      <h2>{{ record.name }}</h2>
      <a href="{{ '/benchmarks/' | append: scatter.ledger_slug | append: '/' | relative_url }}" class="bench-link">Full comparison &amp; accuracy vs. depth</a>
    </div>
    <div class="bench-table-wrap">
      <table class="bench-table bench-leaderboard-table">
        <thead>
          <tr><th>#</th><th>Tool</th><th class="num">Median |error| (log&#8322; FC)</th><th class="num">Precursors identified</th></tr>
        </thead>
        <tbody>
          {% for tool in ranked %}
            {% assign full_tool = record.tools | where: "id", tool.id | first %}
          <tr class="{% if forloop.first %}bench-leaderboard-lead{% endif %}">
            <td><span class="bench-rank-badge bench-rank-badge-{{ forloop.index }}">{{ forloop.index }}</span></td>
            <th scope="row">{{ tool.label }}</th>
            <td class="num">{{ tool.median_epsilon | round: 3 }}</td>
            <td class="num">{{ full_tool.precursors_display }}</td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </section>
  {% endfor %}

</div>
