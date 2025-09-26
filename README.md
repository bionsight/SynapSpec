# SynapSpec Website

A professional Jekyll-based website for a chemical proteomics research company, built with modern design principles and easy content management.

## Features

- **Modern Design**: Clean, minimalist design with professional color palette
- **Responsive**: Optimized for desktop and mobile devices
- **Easy Content Management**: Uses Jekyll data files and Markdown for easy updates
- **SEO Optimized**: Built-in SEO optimization with Jekyll SEO Tag
- **Professional Branding**: Consistent visual identity throughout

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

### Services
Edit `_data/services.yml` to update the services displayed on the homepage and products page.

### Team Members
Update team information in `_data/team.yml`.

### Partners
Manage partner organizations in `_data/partners.yml`.

### Navigation
Update the main navigation menu in `_config.yml` under the `navigation` section.

## Customization

### Colors
All colors are defined in `_sass/_variables.scss`. Update the color variables to match your brand.

### Typography
Font families and sizes are also defined in `_sass/_variables.scss`.

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

```
├── _data/              # Data files (YAML)
├── _includes/          # Reusable components
├── _layouts/           # Page layouts
├── _products/          # Product collection
├── _sass/              # Sass stylesheets
├── assets/             # Static assets
├── _config.yml         # Site configuration
├── index.md            # Homepage
├── about.md            # About page
├── products.md         # Products listing
└── contact.md          # Contact page
```
