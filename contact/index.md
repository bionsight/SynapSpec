---
layout: default
title: "Contact Us"
description: "Get in touch with Proteomics Solutions for collaborations and inquiries"
---

<div class="container">
  <div class="section-header">
    <h1>Contact Us</h1>
    <p class="section-subtitle">
      Ready to advance your research? Let's discuss how we can help.
    </p>
  </div>

  <section class="py-lg">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4rem;" class="contact-grid">
      <div>
        <h2>Get in Touch</h2>
        <p>
          We're here to support your research goals. Whether you're interested in our services,
          have questions about our platform, or want to explore collaboration opportunities,
          we'd love to hear from you.
        </p>

        <div class="contact-info" style="margin: 2rem 0;">
          <div style="margin-bottom: 1.5rem;">
            <h3><i class="fas fa-envelope" style="color: #57b9caff; margin-right: 1rem;"></i>Email</h3>
            <p><a href="mailto:{{ site.company.email }}">{{ site.company.email }}</a></p>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <h3><i class="fab fa-github" style="color: #57b9caff; margin-right: 1rem;"></i>GitHub</h3>
            <p>
              For technical discussions, feature requests, and community support:
            </p>
            <div style="margin-top: 1rem;">
              <a href="{{ site.github.discussions }}" class="btn" target="_blank" rel="noopener">
                <i class="fab fa-github"></i> Join Discussions
              </a>
              <a href="{{ site.github.issues }}" class="btn btn-outline" target="_blank" rel="noopener" style="margin-left: 1rem;">
                <i class="fas fa-bug"></i> Report Issues
              </a>
            </div>
          </div>

          <div>
            <h3><i class="fas fa-users" style="color: #57b9caff; margin-right: 1rem;"></i>Collaborations</h3>
            <p>
              Interested in research collaborations or partnerships? We work with academic
              institutions, pharmaceutical companies, and biotechnology organizations worldwide.
            </p>
          </div>
        </div>
      </div>

      <div class="contact-form">
        <h3>Send us a Message</h3>
        <p>Use this form to get started, or reach out directly via email or GitHub.</p>

        <div style="background: rgba(26, 122, 141, 0.4); border: 1px solid rgba(140, 198, 63, 0.15); padding: 2rem; border-radius: 16px; text-align: center; backdrop-filter: blur(20px);">
          <i class="fab fa-github" style="font-size: 3rem; color: #57b9caff; margin-bottom: 1rem;"></i>
          <h4>Prefer GitHub?</h4>
          <p>
            For faster responses and to engage with our community, we recommend using GitHub:
          </p>
          <div style="margin-top: 1.5rem;">
            <a href="{{ site.github.new_discussion }}" class="btn btn" target="_blank" rel="noopener">
              Start a Discussion
            </a>
          </div>
          <p style="font-size: 0.9rem; margin-top: 1rem; opacity: 0.8;">
            Questions, ideas, and collaboration proposals are welcome!
          </p>
        </div>
      </div>
</div>
