#!/usr/bin/env node
/**
 * scripts/gen-icons.mjs
 *
 * Materialises the tech-stack chip logos that the Skills bento renders, so the
 * site ships its icons as static local files instead of hotlinking a CDN at
 * runtime. Output goes to `public/icons/<slug>.svg`, which Vite serves verbatim
 * — the built bundle makes no network request for these SVGs.
 *
 * Source of truth is the official `simple-icons` package (a devDependency).
 * Every icon it ships lives at `node_modules/simple-icons/icons/<slug>.svg` as
 * a `<svg role="img" viewBox="0 0 24 24"><title>…</title><path …/></svg>`. We
 * read those, strip the `<title>` (the chip already labels the tech in text, so
 * the SVG must stay decorative), and bake the chip's muted tint `#94A3B8` into
 * the root `fill` so the rendered chip is pixel-identical to the previous
 * CDN-treated icon (`cdn.simpleicons.org/<slug>/94A3B8`).
 *
 * DETERMINISTIC / OFFLINE: the run reads only local package files and writes
 * byte-identical output on every machine. There is no network access. If a
 * requested slug is ever absent from the installed package the script fails
 * loudly rather than silently emitting a broken chip — see `resolveSource`.
 *
 *   node scripts/gen-icons.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'icons')
const PKG_ICONS = join(ROOT, 'node_modules', 'simple-icons', 'icons')

/** The chip tint. Mirrors the muted slate used for chip logos in the UI. */
const CHIP_TINT = '#94A3B8'

/**
 * The exact slugs the Skills bento consumes, each group in
 * `site.sections.skills.groups[].stack[]` (src/data/site.js). Kept explicit so
 * the output is a fixed, reviewable set — not a glob of the whole icon pack.
 */
const SLUGS = [
  // languages & ui
  'vuedotjs',
  'typescript',
  'tailwindcss',
  'vite',
  'greensock',
  // backend & data
  'nodedotjs',
  'postgresql',
  'redis',
  'fastify',
  'graphql',
  // platform & delivery
  'apacheairflow',
  'clickhouse',
  'docker',
  'flydotio',
  'githubactions',
  // quality & tooling
  'vitest',
  'cypress',
  'eslint',
  'turborepo',
  'storybook',
]

/**
 * Resolve one slug to its raw SVG markup from the installed `simple-icons`
 * package. Throws with an actionable message when the package lacks the slug,
 * so a missing icon is a build-blocking error instead of a silent 404 chip.
 */
async function resolveSource(slug) {
  const file = join(PKG_ICONS, `${slug}.svg`)
  if (!existsSync(file)) {
    throw new Error(
      `simple-icons has no icon for slug "${slug}" (looked for ${file}). ` +
        `Add a fallback source for it in scripts/gen-icons.mjs.`,
    )
  }
  return readFile(file, 'utf8')
}

/**
 * Turn a source icon into the exact markup the chip needs:
 *   - drop the <title> so the SVG is purely decorative (the chip labels it),
 *   - drop role/aria (the host <img alt=""> already conveys nothing to AT),
 *   - force the root fill to the muted chip tint,
 *   - normalise to a single tidy line.
 * The viewBox and the `<path>` data are preserved byte-for-byte.
 */
function transform(slug, raw) {
  const viewBox = raw.match(/viewBox="([^"]+)"/)?.[1]
  if (!viewBox) {
    throw new Error(`simple-icons "${slug}" is missing a viewBox`)
  }

  const paths = [...raw.matchAll(/<path\b[^>]*\bd="([^"]+)"[^>]*\/?>/g)].map(
    (m) => m[1],
  )
  if (paths.length === 0) {
    throw new Error(`simple-icons "${slug}" contains no <path>`)
  }

  const body = paths
    .map((d) => `<path fill="${CHIP_TINT}" d="${d}"/>`)
    .join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ` +
    `fill="${CHIP_TINT}" aria-hidden="true" focusable="false">${body}</svg>\n`
  )
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const written = []
  for (const slug of SLUGS) {
    const raw = await resolveSource(slug)
    const svg = transform(slug, raw)
    await writeFile(join(OUT_DIR, `${slug}.svg`), svg, 'utf8')
    written.push(slug)
  }

  console.log(
    `gen-icons: wrote ${written.length} icon(s) to public/icons/ ` +
      `(fill ${CHIP_TINT}, decorative):`,
  )
  console.log('  ' + written.join(', '))
}

main().catch((err) => {
  console.error('gen-icons failed:', err.message)
  process.exit(1)
})
