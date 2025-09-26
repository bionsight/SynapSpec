require "jekyll"
require "html-proofer"

# Default task
task default: [:test]

desc "Clean Jekyll build"
task :clean do
  sh "bundle exec jekyll clean"
end

desc "Build Jekyll site"
task :build => [:clean] do
  sh "bundle exec jekyll build"
end

desc "Serve Jekyll site locally"
task :serve do
  sh "bundle exec jekyll serve --incremental --open-url"
end

desc "Run all linters and tests"
task test: [:build, :lint]

desc "Run all linters"
task :lint do
  puts "🔍 Running linters..."

  # Jekyll build check (for Sass deprecation warnings)
  puts "📄 Checking Jekyll build..."
  result = system("bundle exec jekyll build 2>&1 | grep -i 'deprecation.*warning'")
  if $?.exitstatus == 0
    puts "❌ Sass deprecation warnings found!"
    exit 1
  else
    puts "✅ No Sass deprecation warnings"
  end

  # Markdown linting
  if system("which mdl > /dev/null 2>&1")
    puts "📝 Linting Markdown files..."
    sh "bundle exec mdl *.md **/*.md --ignore-front-matter"
  end

  # Ruby linting (if any Ruby files exist)
  ruby_files = Dir.glob("**/*.rb").reject { |f| f.start_with?("vendor/") }
  if !ruby_files.empty? && system("which rubocop > /dev/null 2>&1")
    puts "💎 Linting Ruby files..."
    sh "bundle exec rubocop #{ruby_files.join(' ')}"
  end

  puts "✅ All linting checks passed!"
end

desc "Check HTML output with HTMLProofer"
task :htmlproofer => [:build] do
  puts "🔗 Checking HTML with HTMLProofer..."
  HTMLProofer.check_directory(
    "./_site",
    {
      assume_extension: true,
      check_html: true,
      check_img_http: false,
      disable_external: true, # Skip external links for faster testing
      empty_alt_ignore: true,
    }
  ).run
end

desc "Full test including HTMLProofer"
task :test_full => [:lint, :htmlproofer]
