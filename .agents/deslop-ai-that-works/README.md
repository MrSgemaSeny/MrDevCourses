# deslop

A CLI tool to rewrite documents so they sound less like AI slop.

## Installation

```bash
pip install deslop
```

Or with uv:

```bash
uv pip install deslop
```

## Usage

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

Then run deslop on a file:

```bash
# Read from file, write to stdout
deslop path/to/document.md

# Read from stdin
cat draft.md | deslop -

# Write to a file
deslop draft.md -o cleaned.md
```

## How it works

Deslop uses Claude to:

1. **Identify slop patterns** - Generic phrasing, repetitive structure, vague claims, unnatural transitions, empty intensifiers, etc.
2. **Rewrite the document** - Fix all identified patterns while preserving meaning and structure

## Requirements

- Python 3.10+
- Anthropic API key (uses Claude Opus 4.5)

## License

MIT
