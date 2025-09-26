# Markdown linter style rules for Jekyll
all

# Exclude some rules for Jekyll compatibility
exclude_rule 'MD002' # First header doesn't need to be H1 (Jekyll front matter renders title)
exclude_rule 'MD013' # Line length (Jekyll content can be long)
exclude_rule 'MD033' # Allow inline HTML (common in Jekyll)
exclude_rule 'MD041' # First line doesn't need to be H1 (Jekyll front matter)

# Configure specific rules
rule 'MD007', :indent => 2 # Unordered list indentation
rule 'MD029', :style => :ordered # Allow ordered list numbering