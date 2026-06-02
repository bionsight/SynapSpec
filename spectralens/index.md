---
layout: spectralens
title: "SpectraLens"
description: "SpectraLens is a targeted DIA peak inspection desktop tool for quickly checking precursor and fragment peaks in raw mass spectrometry files."
analytics_product: "SpectraLens"
analytics_page_type: "landing_page"
---

{% assign product = site.data.spectralens %}

<section class="spectralens-hero">
  <div class="container spectralens-hero-grid">
    <div class="spectralens-hero-copy">
      <div class="spectralens-kicker">
        <span>DIA peak inspection</span>
      </div>
      <h1>{{ product.name }}</h1>
      <p class="spectralens-lede">
        {{ product.tagline }}.
      </p>
      <p class="spectralens-hero-text">
        SpectraLens is built for the moment when you do not want to run a full DIA pipeline.
        Load raw files, enter the precursor you care about, and quickly inspect the MS1/MS2 peak evidence.
      </p>
      <div class="spectralens-actions">
        <a href="{{ product.release_url }}" class="btn btn-large" target="_blank" rel="noopener">
          <i class="fas fa-download"></i> Download Latest
        </a>
        <a href="#docs" class="btn btn-large btn-outline">
          <i class="fas fa-book-open"></i> Read Docs
        </a>
      </div>
    </div>

    <div class="spectralens-visual spectralens-screenshot-frame" aria-label="SpectraLens application preview">
      <img
        src="{{ '/assets/images/spectralens/spectralens_window.png' | relative_url }}"
        alt="SpectraLens desktop application showing precursor selection and XIC peak plots"
      >
    </div>
  </div>
</section>

<section class="spectralens-band spectralens-summary-band">
  <div class="container spectralens-highlight-grid">
    {% for item in product.highlights %}
    <div class="spectralens-highlight">
      <span>{{ item.label }}</span>
      <strong>{{ item.value }}</strong>
    </div>
    {% endfor %}
  </div>
</section>

<section id="features" class="spectralens-section">
  <div class="container">
    <div class="spectralens-section-header">
      <span>Why it exists</span>
      <h2>Fast answers before a full analysis run</h2>
      <p>
        SpectraLens is for targeted visual confirmation: a few precursors, selected raw files,
        and immediate chromatographic evidence without waiting for a full DIA analysis workflow.
      </p>
    </div>

    <div class="spectralens-feature-grid">
      {% for feature in product.features %}
      <article class="spectralens-feature">
        <div class="spectralens-feature-icon">
          <i class="{{ feature.icon }}"></i>
        </div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.text }}</p>
      </article>
      {% endfor %}
    </div>
  </div>
</section>

<section id="workflow" class="spectralens-band">
  <div class="container">
    <div class="spectralens-section-header">
      <span>Workflow</span>
      <h2>From raw file to peak evidence</h2>
    </div>

    <div class="spectralens-workflow">
      {% for step in product.workflow %}
      <article>
        <div class="spectralens-step-number">{{ forloop.index }}</div>
        <h3>{{ step.title }}</h3>
        <p>{{ step.text }}</p>
      </article>
      {% endfor %}
    </div>
  </div>
</section>

<section id="docs" class="spectralens-section spectralens-docs">
  <div class="container">
    <div class="spectralens-section-header">
      <span>Docs</span>
      <h2>Install and use SpectraLens</h2>
      <p>
        This page keeps the working notes and user docs together because SpectraLens has a focused surface area.
      </p>
    </div>

    <div class="spectralens-doc-layout">
      <aside class="spectralens-doc-nav" aria-label="SpectraLens documentation sections">
        <a href="#download">Download</a>
        <a href="#quick-start">Quick start</a>
        <a href="#precursor-input">Precursor input</a>
        <a href="#settings">Settings</a>
        <a href="#outputs">Outputs</a>
      </aside>

      <div class="spectralens-doc-content">
        <section id="download">
          <h3>Download</h3>
          <p>
            SpectraLens is distributed as a desktop application for macOS and Windows.
            Download the binary for your platform, launch it locally, and create a workspace to inspect DIA precursor peaks.
          </p>
          <div class="spectralens-download-grid">
            <a href="{{ product.download.macos_url }}" class="spectralens-download" target="_blank" rel="noopener">
              <i class="fab fa-apple"></i>
              <span>macOS</span>
              <strong>Desktop app</strong>
            </a>
            <a href="{{ product.download.windows_url }}" class="spectralens-download" target="_blank" rel="noopener">
              <i class="fab fa-windows"></i>
              <span>Windows</span>
              <strong>Desktop app</strong>
            </a>
          </div>
        </section>

        <section id="quick-start">
          <h3>Quick start</h3>
          <p>
            Start by creating or opening a local workspace. SpectraLens keeps selected raw files,
            target precursors, settings, and exported results inside that workspace.
          </p>

          <div class="spectralens-guide">
            <article class="spectralens-guide-step">
              <div class="spectralens-guide-copy">
                <span>Step 1</span>
                <h4>Add raw files</h4>
                <p>
                  Open the Raw Files panel, click <strong>Add Files</strong>, and choose the raw files you want
                  to inspect. After the files are listed, select the blue checkbox for the file or files that
                  should be included in the targeted analysis.
                </p>
              </div>
              <figure>
                <img
                  src="{{ '/assets/images/spectralens/select_raw_files.png' | relative_url }}"
                  alt="SpectraLens Raw Files panel with Add Files and file selection checkbox highlighted"
                  loading="lazy"
                >
                <figcaption>Add raw files, then select the files to use for analysis.</figcaption>
              </figure>
            </article>

            <article class="spectralens-guide-step">
              <div class="spectralens-guide-copy">
                <span>Step 2</span>
                <h4>Open the precursor input dialog</h4>
                <p>
                  Click the <strong>+</strong> button in the precursor toolbar to open the sequence input dialog.
                  If the button is not visible, collapse the Raw Files panel first so the precursor list has more space.
                </p>
              </div>
              <figure>
                <img
                  src="{{ '/assets/images/spectralens/add_sequences.png' | relative_url }}"
                  alt="SpectraLens precursor list with plus button highlighted and Raw Files panel highlighted"
                  loading="lazy"
                >
                <figcaption>Use the plus button to add target precursor sequences.</figcaption>
              </figure>
            </article>

            <article class="spectralens-guide-step">
              <div class="spectralens-guide-copy">
                <span>Step 3</span>
                <h4>Enter target sequences</h4>
                <p>
                  Add the sequence or precursor you want to check, then click <strong>Add</strong>. Use UniMod
                  notation for modifications, such as <code>C(UniMod:4)</code>. Separate multiple sequences with
                  line breaks or commas. Add a charge state after a period, such as <code>PEPTIDESEQ.2</code>.
                </p>
              </div>
              <figure>
                <img
                  src="{{ '/assets/images/spectralens/fill_sequences.png' | relative_url }}"
                  alt="SpectraLens Add Peptide dialog with sequence input examples"
                  loading="lazy"
                >
                <figcaption>Enter one or more target sequences, then add them to the precursor list.</figcaption>
              </figure>
            </article>

            <article class="spectralens-guide-step">
              <div class="spectralens-guide-copy">
                <span>Step 4</span>
                <h4>Select precursors and run</h4>
                <p>
                  Select the sequence rows you want to analyze. Anchor precursors are used for RT-iRT mapping.
                  SpectraLens automatically fills many settings from the raw file metadata, but you can adjust
                  tolerances, instrument, NCE, RT window, and fragment limits from Settings when needed.
                  Click <strong>Analyze All</strong> to extract and inspect the target peaks.
                </p>
              </div>
              <figure>
                <img
                  src="{{ '/assets/images/spectralens/select_seqs_settings.png' | relative_url }}"
                  alt="SpectraLens precursor table and settings area with selectable sequence rows highlighted"
                  loading="lazy"
                >
                <figcaption>Select target sequences, review settings, and run Analyze All.</figcaption>
              </figure>
            </article>
          </div>
        </section>

        <section id="precursor-input">
          <h3>Precursor input</h3>
          <p>
            Paste one sequence per line or separate multiple entries with commas. Add a charge suffix with
            <code>.2</code> or <code>.3</code> when you want a specific charge state. If the charge is omitted,
            SpectraLens predicts likely charge states and iRT values.
          </p>
          <pre><code>PEPTIDESEQ.2
PEPC(UniMod:4)TIDESEQ.3
AA[Hex(1)HexNAc(2)]DD
PEPTIDES(UniMod:21)EQ,PEPTIDEM(UniMod:35)SEQ</code></pre>
        </section>

        <section id="settings">
          <h3>Settings reference</h3>
          <div class="spectralens-settings-list">
            {% for setting in product.settings %}
            <div>
              <strong>{{ setting.name }}</strong>
              <span>{{ setting.value }}</span>
            </div>
            {% endfor %}
          </div>
        </section>

        <section id="outputs">
          <h3>Outputs</h3>
          <p>
            SpectraLens keeps precursor rows, local file status, analysis settings, and extracted result tables
            inside the selected workspace. Use Export CSV from the visualization panel to save a reviewable result
            table for downstream notes or manual curation.
          </p>
        </section>
      </div>
    </div>
  </div>
</section>
