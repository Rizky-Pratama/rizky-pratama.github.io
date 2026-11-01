#!/usr/bin/env node
/**
 * Pre-publish guard: fail if any of the template's demo placeholders survive in the
 * committed, publishable source.
 *
 * Scans (gitignore-aware):
 *   - index.html
 *   - src/**\/*.{js,vue,css}
 *   - LICENSE
 * plus a direct read of src/data/site.js for the empty `site.name`. Documentation
 * (*.md), build output (dist/), QA scratch (audit/) and tests (*.test.js) are
 * deliberately out of scope: prose may legitimately cite `example.com`.
 *
 * Placeholders detected:
 *   - example.com      placeholder domain (canonical/OG/twitter, robots, sitemap)
 *   - your-handle      placeholder GitHub/LinkedIn handle
 *   - <your name>      placeholder LICENSE copyright holder
 *   - {AVAILABILITY}   unresolved availability token
 *   - {YEARS}          unresolved years token
 *   - empty site.name  the nav/footer wordmark falls back to "Portfolio"
 *
 * Exit codes:
 *   0  no placeholders (or ALLOW_PLACEHOLDERS=1, which downgrades findings to warnings)
 *   1  placeholders remain
 *
 * Usage:
 *   npm run check:placeholders
 *   ALLOW_PLACEHOLDERS=1 npm run check:placeholders
 */
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const SELF = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(SELF), '..')

const SKIP_DIRS = new Set(['node_modules', 'dist', 'audit', '.git', '.vite'])
const CODE_EXTENSIONS = new Set(['.js', '.vue', '.css'])
const SKIP_FILE_SUFFIXES = ['.test.js', '.spec.js']

const SITE_MODULE = 'src/data/site.js'
const NAME_PATTERN = /^[ \t]*name:[ \t]*(?:''|"")/m
const NAME_PATTERN_TEXT = "empty site.name (nav wordmark falls back to 'Portfolio')"

const PATTERNS = [
  { label: 'example.com', regex: /example\.com/g },
  { label: 'your-handle', regex: /your-handle/g },
  { label: '<your name>', regex: /<your name>/g },
  { label: '{AVAILABILITY}', regex: /\{AVAILABILITY\}/g },
  { label: '{YEARS}', regex: /\{YEARS\}/g },
]

const toPosix = (p) => p.split(sep).join('/')

/** Every file the guard inspects, as repo-relative POSIX paths. */
function collectTargets() {
  const targets = new Set(['index.html', 'LICENSE'])

  const walk = (absDir) => {
    for (const entry of readdirSync(absDir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(join(absDir, entry.name))
        continue
      }
      if (!entry.isFile()) continue
      if (SKIP_FILE_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) continue
      const dot = entry.name.lastIndexOf('.')
      const ext = dot === -1 ? '' : entry.name.slice(dot)
      if (CODE_EXTENSIONS.has(ext)) targets.add(toPosix(relative(ROOT, join(absDir, entry.name))))
    }
  }

  walk(join(ROOT, 'src'))
  return [...targets].sort()
}

/** Occurrences of `regex` in `text`, as ascending line numbers (one per line). */
function lineNumbers(text, regex) {
  const global = regex.flags.includes('g') ? regex : new RegExp(regex.source, `${regex.flags}g`)
  const lines = new Set()
  for (const match of text.matchAll(global)) {
    lines.add(text.slice(0, match.index).split('\n').length)
  }
  return [...lines].sort((a, b) => a - b)
}

/** Run every check and return `[{ file, line, pattern }]`, deduped and sorted. */
function findPlaceholders() {
  const findings = []

  for (const target of collectTargets()) {
    if (resolve(ROOT, target) === SELF) continue
    const text = readFileSync(join(ROOT, target), 'utf8')

    for (const { label, regex } of PATTERNS) {
      for (const line of lineNumbers(text, regex)) findings.push({ file: target, line, pattern: label })
    }

    if (target === SITE_MODULE && NAME_PATTERN.test(text)) {
      findings.push({
        file: target,
        line: lineNumbers(text, NAME_PATTERN)[0],
        pattern: NAME_PATTERN_TEXT,
      })
    }
  }

  findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.pattern.localeCompare(b.pattern))
  return findings
}

function main() {
  const allow = process.env.ALLOW_PLACEHOLDERS === '1'
  const findings = findPlaceholders()
  const noun = findings.length === 1 ? 'finding' : 'findings'

  if (findings.length === 0) {
    console.log('PASS — no placeholders found. Domain and indexing readiness must be checked separately.')
    return 0
  }

  const level = allow ? 'WARNING' : 'FAIL'
  console.log(`${allow ? 'Placeholder guard' : 'FAIL'} — ${findings.length} ${noun}:\n`)
  for (const { file, line, pattern } of findings) console.log(`  ${file}:${line}: ${pattern}`)

  if (allow) {
    console.log(
      `\nALLOW_PLACEHOLDERS=1 — shipping with the demo placeholders above. ` +
        `This is your call; the guard exits 0.`,
    )
    return 0
  }

  console.log(
    `\nReplace each placeholder above before publishing, then re-run ` +
      `\`npm run check:placeholders\`. To ship the demo as-is on purpose, run ` +
      `\`ALLOW_PLACEHOLDERS=1 npm run check:placeholders\`.`,
  )
  return 1
}

process.exitCode = main()
