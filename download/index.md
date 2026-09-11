---
layout: default
title: "Download SynapSpec"
description: "Download the latest version of SynapSpec for your platform"
---

{% assign dl = site.data.releases.synapspec.downloads %}

<div class="container">
  <div class="page-header">
    <h1>Download SynapSpec</h1>
  </div>

  <div class="table-scroll">
    <table>
      <thead>
        <tr>
          <th>Platform</th>
          <th>Compatibility</th>
          <th>Build</th>
          <th>File</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th rowspan="2">Windows</th>
          <td rowspan="2">Compatible with Windows 10/11</td>
          <td>GPU</td>
          <td class="file-name">SynapSpec-windows-{{ site.data.releases.synapspec.version }}.zip</td>
          <td class="col-action"><a href="{{ dl.windows_gpu }}" class="btn btn-small">Download</a></td>
        </tr>
        <tr>
          <td>CPU</td>
          <td class="file-name">SynapSpec-windows-cpu-{{ site.data.releases.synapspec.version }}.zip</td>
          <td class="col-action"><a href="{{ dl.windows_cpu }}" class="btn btn-small btn-outline">Download</a></td>
        </tr>
        <tr>
          <th rowspan="2">Linux</th>
          <td rowspan="2">Compatible with most Linux distributions</td>
          <td>GPU</td>
          <td class="file-name">SynapSpec-linux-{{ site.data.releases.synapspec.version }}.tar.gz</td>
          <td class="col-action"><a href="{{ dl.linux_gpu }}" class="btn btn-small">Download</a></td>
        </tr>
        <tr>
          <td>CPU</td>
          <td class="file-name">SynapSpec-linux-cpu-{{ site.data.releases.synapspec.version }}.tar.gz</td>
          <td class="col-action"><a href="{{ dl.linux_cpu }}" class="btn btn-small btn-outline">Download</a></td>
        </tr>
        <tr>
          <th>macOS</th>
          <td>Compatible with macOS 10.14+</td>
          <td>—</td>
          <td class="file-name">SynapSpec-macos-{{ site.data.releases.synapspec.version }}.dmg</td>
          <td class="col-action"><a href="{{ dl.macos }}" class="btn btn-small">Download</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <section class="block-plain highlight-section">
    <div class="section-header">
      <h2>System Requirements</h2>
    </div>
    {% include requirements.html %}
    <div class="mt-lg">
      <a href="https://docs.synapspec.ai/installation/" class="btn btn-outline btn-large" target="_blank" rel="noopener">View Installation Guide</a>
    </div>
  </section>
</div>
