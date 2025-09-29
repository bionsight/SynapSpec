# SynapSpec Website

A professional Jekyll-based website for SynapSpec, featuring mass spectrometry software and chemical proteomics solutions. Built with modern design principles and easy content management.

## Features

- **Modern Design**: Clean, minimalist design with blue color theme
- **Responsive**: Optimized for desktop and mobile devices
- **Easy Content Management**: Uses Jekyll data files and Markdown for easy updates
- **SEO Optimized**: Built-in SEO optimization with Jekyll SEO Tag
- **Software Focus**: Dedicated pages for software releases and documentation

## Quick Start

### Prerequisites

- Ruby (version 2.7 or higher)
- Bundler

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd page
   ```

2. Install dependencies:

   ```bash
   bundle install
   ```

3. Run the development server:

   ```bash
   bundle exec jekyll serve
   ```

4. Open your browser to `http://localhost:4000`

## Content Management

### Services & Features

Edit `_data/services.yml` to update the features displayed on the homepage and software page. Each service includes:
- Name and description
- FontAwesome icon
- Feature highlights

### Software Releases

Update software release information in `_data/releases.yml`. Currently includes:
- Version information for SynapSpec
- Release notes and changelogs
- Download links for different platforms

### Navigation

Update the main navigation menu in `_config.yml` under the `navigation` section. Current pages:
- Home
- About
- Software
- Documentation (external link)
- Contact

## Customization

### Colors

All colors are defined in `_scss/_variables.scss`. Current color theme:
- Primary: #2563eb (blue)
- Secondary: #64748b (gray)
- Accent: #0ea5e9 (sky blue)
- Text: #1e293b (dark slate)
- Background: #ffffff (white)
- Secondary background: #f8fafc (light slate)

### Typography

Font families and sizes are defined in `_scss/_variables.scss`:
- Headings: Montserrat
- Body: Noto Sans KR

### Content

- Edit Markdown files for page content
- Update `_config.yml` for site-wide settings
- Modify data files in `_data/` for structured content

## Deployment

### GitHub Pages

1. Push to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Set source to main branch

### Other Platforms

The site generates static HTML/CSS/JS files that can be deployed to any web server.

## Structure

```text
├── _data/              # Data files (YAML)
│   ├── services.yml    # Software features/services
│   └── releases.yml    # Software release information
├── _includes/          # Reusable components
├── _layouts/           # Page layouts
├── _products/          # Product collection
│   └── synapspec.md    # SynapSpec product page
├── _scss/              # Sass stylesheets
│   ├── _variables.scss # Color and typography variables
│   ├── _layout.scss    # Layout styles
│   └── _components.scss# Component styles
├── assets/             # Static assets
├── about/              # About page
├── contact/            # Contact page
├── software/           # Software page
├── _config.yml         # Site configuration
└── index.md            # Homepage
```

## Pages

- **Homepage** (`index.md`): Hero section with software features
- **About** (`about/index.md`): Company information and mission
- **Software** (`software/index.md`): Software downloads and features
- **Contact** (`contact/index.md`): Contact form and information
- **Documentation**: External link to docs.synapspec.ai

## Data Files

- `services.yml`: Software features with icons and descriptions
- `releases.yml`: Software version information and download links
