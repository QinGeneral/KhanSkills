---
name: movie-finder
description: Search rrdynb/RR movie resources from a movie or TV keyword and return structured Markdown or JSON results with title, synopsis, Douban score, IMDB score, IMDb ID, poster, detail page, cloud-drive links, extraction codes, cache state, and stale-cache warnings. Use when Codex needs to find movie resource lists, inspect MovieFinder cache status, produce Markdown search output, or call the local MovieFinder CLI/API for Agent workflows.
---

# Movie Finder

## Overview

Use this skill to search the local MovieFinder CLI for public rrdynb movie/TV resource metadata and cloud-drive links. Prefer the bundled wrapper script so the Agent does not need to remember the MovieFinder project path, `PYTHONPATH`, or the installed console-script location.

The MovieFinder implementation lives at:

```text
/Users/hanzhang/Documents/MovieFinder
```

## Quick Start

Search and return Markdown:

```bash
python3 /Users/hanzhang/.codex/skills/movie-finder/scripts/search_movie.py "一一" --limit 3
```

Return JSON for programmatic use:

```bash
python3 /Users/hanzhang/.codex/skills/movie-finder/scripts/search_movie.py "一一" --limit 3 --format json
```

Show cache stats:

```bash
python3 /Users/hanzhang/.codex/skills/movie-finder/scripts/search_movie.py --cache-stats
```

## Workflow

1. Use `scripts/search_movie.py` for all searches unless the user explicitly asks to work inside the MovieFinder repo.
2. Return Markdown by default. Use `--format json` only when the caller needs structured data.
3. Pass `--limit N` to cap results; the wrapper bounds this through the underlying CLI.
4. Pass `--refresh` only when the user asks for live refresh or stale cache is unacceptable. The target site may return Cloudflare `403`; cached results are often more reliable.
5. If output contains `缓存：过期缓存兜底` or a `warning`, tell the user the result came from cache because the live search page failed.
6. Do not automate downloads, login bypasses, CAPTCHA solving, or Cloudflare challenge bypass. This skill returns metadata and publicly displayed resource links only.

## Output

Markdown output includes:

- search source URL, result count, cache state, and warning when present
- one section per result
- title, category, published date, Douban score, IMDB score, IMDb ID, detail URL, poster URL
- synopsis
- cloud-drive resources table with platform, URL, extraction code, and URL password

For exact field names and examples, read `references/output-format.md`.

## Maintenance

If the wrapper fails because the project moved, edit `scripts/search_movie.py` and update `MOVIEFINDER_PROJECT` to the new repo path. If package imports fail, reinstall the project from that path with `python3 -m pip install -e .`, then re-run the wrapper.
