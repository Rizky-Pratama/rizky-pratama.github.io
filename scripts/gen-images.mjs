#!/usr/bin/env node
/**
 * scripts/gen-images.mjs
 *
 * Generates the site's local raster artwork with `sharp` only — no network, no
 * image models. Output goes to `public/images/` so Vite serves the files
 * verbatim and the build never fetches anything.
 *
 * These are intentional design artifacts, not placeholder boxes. A seeded RNG
 * and fixed parameters make the run fully DETERMINISTIC, so re-running
 * reproduces byte-identical pixels. Compositions share the site's locked dark
 * technical palette (a desaturated navy base with a single green accent) and
 * read as abstract technical artwork: gradient meshes, engineering grids,
 * line/structure motifs and one restrained accent mark.
 *
 * HOW IT RENDERS
 *   Each shape is rasterised as its own RGBA layer and stacked with
 *   `sharp().composite()`, rather than relying on one SVG document. That keeps
 *   opacity, colour and blend behaviour explicit and pixel-predictable across
 *   librsvg builds. Layers are drawn at a 2x supersample and downscaled once,
 *   so lines are antialiased and crisp at the final size.
 *
 *   node scripts/gen-images.mjs
 */

import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ---- Locked palette (mirrors src/style.css @theme) ------------------------
const C = {
  bg: '#0f172a', //  base
  surface: '#151e33', //  panel
  surface2: '#1e293b', //  raised
  border: '#243049', //  structure lines
  accent: '#22c55e', //  single accent, always used sparingly
  fg: '#f1f5f9', //  peak linework
  fgMuted: '#94a3b8', //  secondary linework
}
const ACCENT_SOFT = '#4ade80'
const ACCENT_DEEP = '#0d3b23'

// ---- Deterministic RNG (mulberry32) ---------------------------------------
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const pick = (r, arr) => arr[Math.min(arr.length - 1, Math.floor(r() * arr.length))]
const ri = (r, min, max) => Math.round(min + r() * (max - min))
const rf = (r, min, max) => min + r() * (max - min)
const n2 = (v) => Number(v.toFixed(2))
const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

const SS = 2 // supersample factor for antialiasing
const px = (w, h) => ({ w: Math.round(w * SS), h: Math.round(h * SS) })

/** Rasterise a single alpha layer at 2x supersample. Returns {input, ...}. */
async function layer(body, w, h) {
  const { w: W, h: H } = px(w, h)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`
  const input = await sharp(Buffer.from(svg))
    .resize(W, H, { fit: 'fill' })
    .png()
    .toBuffer()
  return { input, left: 0, top: 0, blend: 'over' }
}

/**
 * A soft, dark mesh-gradient base painted fully opaque.
 *
 * Deliberately built from large, very low-opacity radial washes over a
 * vertical ramp — no hard-edged tiles — so the result reads as a smooth
 * atmospheric gradient rather than compression blocking.
 */
async function baseLayer(w, h, r, { stops, angle }) {
  const { w: W, h: H } = px(w, h)
  const washes = Array.from({ length: 14 }, () => ({
    cx: rf(r, -0.1, 1.1) * W,
    cy: rf(r, -0.1, 1.1) * H,
    rr: rf(r, 0.45, 0.95) * Math.max(W, H),
    o: n2(rf(r, 0.04, 0.11)),
    c: pick(r, [C.surface, C.surface2, C.border, '#0b1120']),
  }))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="${angle === 'v' ? 0 : 1}" y2="${
        angle === 'v' ? 1 : 0
      }">
        ${stops
          .map((c, i) => `<stop offset="${n2(i / (stops.length - 1))}" stop-color="${c}"/>`)
          .join('')}
      </linearGradient>
      <radialGradient id="v" cx="0.5" cy="0.4" r="0.8">
        <stop offset="0.45" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.62"/>
      </radialGradient>
      ${washes
        .map(
          (b, i) =>
            `<radialGradient id="b${i}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${b.c}" stop-opacity="${b.o}"/><stop offset="1" stop-color="${b.c}" stop-opacity="0"/></radialGradient>`,
        )
        .join('')}
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    ${washes
      .map(
        (b, i) =>
          `<circle cx="${n2(b.cx)}" cy="${n2(b.cy)}" r="${n2(b.rr)}" fill="url(#b${i})"/>`,
      )
      .join('')}
    <rect width="${W}" height="${H}" fill="url(#v)"/>
  </svg>`
  const input = await sharp(Buffer.from(svg))
    .resize(W, H, { fit: 'fill' })
    .png()
    .toBuffer()
  return { input, left: 0, top: 0, blend: 'over' }
}

/** Fine engineering grid + a thinner rule-of-thirds pass and edge ticks. */
function gridBody(w, h, { step, op = 0.5, opMajor = 0.28 }) {
  const { w: W, h: H } = px(w, h)
  let out = ''
  for (let x = step; x < W; x += step)
    out += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`
  for (let y = step; y < H; y += step)
    out += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`
  let major = ''
  for (let i = 1; i < 4; i++) major += `<line x1="${n2((W * i) / 4)}" y1="0" x2="${n2((W * i) / 4)}" y2="${H}"/>`
  for (let i = 1; i < 4; i++) major += `<line x1="0" y1="${n2((H * i) / 4)}" x2="${W}" y2="${n2((H * i) / 4)}"/>`
  const tickLen = Math.round(18 * SS)
  let ticks = ''
  for (let i = 1; i < 8; i++)
    ticks += `<line x1="${n2((W * i) / 8)}" y1="0" x2="${n2((W * i) / 8)}" y2="${tickLen}"/>`
  return `<g stroke="${C.border}" stroke-width="${n2(0.9 * SS)}" opacity="${op}">${out}</g>
    <g stroke="${C.border}" stroke-width="${n2(1.4 * SS)}" opacity="${opMajor}">${major}</g>
    <g stroke="${C.fgMuted}" stroke-width="${n2(0.9 * SS)}" opacity="0.5">${ticks}</g>`
}

/** Thin dashed technical frame, inset from the edge. */
function frameBody(w, h, inset) {
  const { w: W, h: H } = px(w, h)
  const i = Math.round(inset * SS)
  return `<rect x="${i}" y="${i}" width="${W - 2 * i}" height="${H - 2 * i}" fill="none"
    stroke="${C.border}" stroke-width="${n2(1.1 * SS)}" stroke-dasharray="${n2(2 * SS)} ${n2(7 * SS)}" opacity="0.75"/>`
}

// ---- Motifs (each returns an SVG body fragment, supersampled coords) -------

/** Contour / topographic drift lines. */
function contours(w, h, r) {
  const { w: W, h: H } = px(w, h)
  const midY = H * rf(r, 0.46, 0.56)
  const amp = H * rf(r, 0.05, 0.1)
  const waves = ri(r, 3, 5)
  const phase = r() * Math.PI * 2
  const lines = ri(r, 20, 26)
  const gap = H * rf(r, 0.022, 0.03)
  const accent = Math.round((lines - 1) * rf(r, 0.35, 0.65))
  let out = ''
  for (let i = 0; i < lines; i++) {
    const y0 = midY + (i - (lines - 1) / 2) * gap
    const pts = []
    for (let k = 0; k <= 72; k++) {
      const x = (k / 72) * W
      const t = k / 72
      const y =
        y0 +
        amp * Math.sin(t * waves * Math.PI + phase + i * 0.13) * (0.55 + 0.45 * t) +
        amp * 0.3 * Math.sin(t * 9 * Math.PI + i * 0.8)
      pts.push(`${n2(x)},${n2(y)}`)
    }
    const isA = i === accent
    out += `<polyline points="${pts.join(' ')}" fill="none" stroke="${
      isA ? C.accent : '#3d5080'
    }" stroke-width="${n2((isA ? 2 : 1.25) * SS)}" opacity="${
      isA ? 0.95 : n2(0.6 + (i / lines) * 0.35)
    }"/>`
  }
  return out
}

/** Signal / waveform trace: aperiodic, damped, with a soft underglow. */
function signal(w, h, r) {
  const { w: W, h: H } = px(w, h)
  const midY = H * 0.54
  const amp = H * rf(r, 0.12, 0.18)
  const f1 = rf(r, 1.1, 2.0) // primary cycles across the frame
  const f2 = rf(r, 4.0, 7.0) // harmonic that breaks the symmetry
  const f3 = rf(r, 0.6, 1.4)
  const ph1 = r() * Math.PI * 2
  const ph2 = r() * Math.PI * 2
  const decay = rf(r, 0.6, 1.4)
  let d = ''
  for (let x = 0; x <= W; x += 2) {
    const t = x / W
    const env = Math.exp(-t * decay) * (0.7 + 0.3 * Math.sin(t * Math.PI))
    const y =
      midY -
      env *
        amp *
        (0.72 * Math.sin(t * Math.PI * 2 * f1 + ph1) +
          0.34 * Math.sin(t * Math.PI * 2 * f2 + ph2) +
          0.2 * Math.sin(t * Math.PI * 2 * f3 + ph1 * 0.5)) +
      (r() - 0.5) * H * 0.008
    d += `${x === 0 ? 'M' : 'L'}${n2(x)} ${n2(y)}`
  }
  const c = pick(r, [C.accent, ACCENT_SOFT, C.fgMuted])
  return `<path d="${d}" fill="none" stroke="${C.accent}" stroke-width="${n2(
    3.6 * SS,
  )}" opacity="0.16"/>
    <path d="${d}" fill="none" stroke="${c}" stroke-width="${n2(1.4 * SS)}" opacity="0.95"/>
    <line x1="0" y1="${n2(midY)}" x2="${W}" y2="${n2(midY)}" stroke="${C.border}" stroke-width="${n2(
      1 * SS,
    )}" opacity="0.45"/>`
}

/** Deterministic scatter with one linked, accent-highlighted cluster. */
function scatter(w, h, r) {
  const cx = W01(r) * w
  const cy = W02(r) * h
  let out = ''
  const nodes = Array.from({ length: ri(r, 46, 64) }, () => ({
    x: rf(r, 0.06, 0.94) * w,
    y: rf(r, 0.06, 0.94) * h,
  }))
  nodes.sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))
  const near = nodes.slice(0, 6)
  for (let i = 0; i < near.length; i++) {
    const a = near[i]
    const b = near[(i + 1) % near.length]
    out += `<line x1="${n2(a.x * SS)}" y1="${n2(a.y * SS)}" x2="${n2(b.x * SS)}" y2="${n2(
      b.y * SS,
    )}" stroke="${C.accent}" stroke-width="${n2(1 * SS)}" opacity="0.35"/>`
    out += `<line x1="${n2(cx * SS)}" y1="${n2(cy * SS)}" x2="${n2(a.x * SS)}" y2="${n2(
      a.y * SS,
    )}" stroke="${C.accent}" stroke-width="${n2(1 * SS)}" opacity="0.28"/>`
  }
  nodes.forEach((p, i) => {
    const d = Math.hypot(p.x - cx, p.y - cy)
    const rad = i < 6 ? ri(r, 2.6, 3.6) : ri(r, 0.9, 1.6)
    out += `<circle cx="${n2(p.x * SS)}" cy="${n2(p.y * SS)}" r="${n2(rad * SS)}" fill="${
      C.fgMuted
    }" opacity="${n2(0.25 + 0.5 * (1 - d / Math.hypot(w, h)))}"/>`
  })
  out += `<circle cx="${n2(cx * SS)}" cy="${n2(cy * SS)}" r="${n2(rf(r, 7, 10) * SS)}" fill="${
    C.accent
  }" opacity="0.95"/>`
  return out
}

/** Isometric stacked slabs receding into depth, one accent edge. */
function strata(w, h, r) {
  const { w: W, h: H } = px(w, h)
  const rows = ri(r, 7, 9)
  const y0 = H * 0.3
  const rowH = (H * 0.42) / rows
  const skew = W * rf(r, 0.08, 0.12)
  const startX = W * 0.22
  const slabW = W * 0.5
  const accentRow = Math.round(rows * rf(r, 0.4, 0.66))
  let out = ''
  for (let i = 0; i < rows; i++) {
    const y = y0 + i * rowH
    const xo = startX - i * (skew / rows) * 0.6
    const pts = [
      [xo, y],
      [xo + slabW, y],
      [xo + slabW - skew, y + rowH * 0.74],
      [xo - skew, y + rowH * 0.74],
    ]
      .map((p) => p.map(n2).join(','))
      .join(' ')
    const isA = i === accentRow
    if (isA) {
      // accent: a slim bright edge on the top face only, plus a faint wash
      const thin = [
        [xo, y],
        [xo + slabW, y],
        [xo + slabW - skew * 0.34, y + rowH * 0.2],
        [xo - skew * 0.34, y + rowH * 0.2],
      ]
        .map((p) => p.map(n2).join(','))
        .join(' ')
      out += `<polygon points="${pts}" fill="${C.surface2}" opacity="0.6" stroke="${C.border}" stroke-width="${n2(
        1 * SS,
      )}"/>`
      out += `<polygon points="${thin}" fill="${C.accent}" opacity="0.85"/>`
    } else {
      out += `<polygon points="${pts}" fill="${pick(r, [
        '#33436a',
        '#2a3a5e',
        C.surface2,
      ])}" opacity="${n2(0.72 + i * 0.045)}" stroke="${'#3b4d78'}" stroke-width="${n2(
        1 * SS,
      )}"/>`
    }
  }
  return out
}

/**
 * Dot-matrix field: a dense lattice whose dot size and brightness are
 * modulated by two low-frequency waves, producing a diagonal interference
 * pattern. A few dots crossing the crest are tinted with the accent.
 */
function matrix(w, h, r) {
  const { w: W, h: H } = px(w, h)
  const step = ri(r, 15, 19) * SS
  const ph = r() * Math.PI * 2
  const ax = rf(r, 0.006, 0.011)
  const ay = rf(r, 0.018, 0.03)
  let out = ''
  for (let y = step; y < H; y += step) {
    for (let x = step; x < W; x += step) {
      const nx = x / W
      const ny = y / H
      const wave =
        (Math.sin(nx * Math.PI * 2 * 1.4 + ph) + Math.cos(ny * Math.PI * 2 * 2.2 + ph * 0.7)) *
        0.5
      const t = Math.max(0, Math.min(1, (wave + 1) / 2))
      const rad = n2((0.5 + t * 1.7) * SS)
      const isA = t > 0.94
      out += `<circle cx="${x}" cy="${y}" r="${rad}" fill="${
        isA ? C.accent : t > 0.7 ? C.fgMuted : C.fg
      }" opacity="${isA ? 0.9 : n2(0.06 + Math.pow(t, 1.6) * 0.75)}"/>`
    }
  }
  // one reading line across the field
  out += `<line x1="${n2(W * 0.06)}" y1="${n2(H * 0.84)}" x2="${n2(W * 0.94)}" y2="${n2(
    H * 0.16,
  )}" stroke="${C.accent}" stroke-width="${n2(1.3 * SS)}" opacity="0.4" stroke-dasharray="${n2(
    1 * SS,
  )} ${n2(7 * SS)}"/>`
  return out
}

const MOTIFS = { contours, signal, scatter, strata, matrix }
// small helper so scatter's cluster anchor stays inside the frame
const W01 = (r) => 0.34 + r() * 0.32
const W02 = (r) => 0.36 + r() * 0.28

// ---- Full-frame composition -----------------------------------------------

async function buildAbstract(motifName, w, h, seed) {
  const r = rng(seed)
  // Abstracts sit on a slightly raised base (surface-led) so the artwork is
  // legible against the page's near-black bg rather than sinking into it.
  const stops =
    r() < 0.5 ? ['#1b2740', C.surface, C.border] : [C.surface, '#141d31', C.surface2]
  const parts = [
    await baseLayer(w, h, r, { stops, angle: r() < 0.5 ? 'v' : 'd' }),
    await layer(gridBody(w, h, { step: Math.round(w / 18), op: 0.55, opMajor: 0.4 }), w, h),
    await layer(frameBody(w, h, w * 0.05), w, h),
    await layer(`<g>${MOTIFS[motifName](w, h, r)}</g>`, w, h),
  ]
  return compose(parts, w, h)
}

async function buildPortrait(w, h, seed) {
  const r = rng(seed)
  const { w: W, h: H } = px(w, h)
  const axisX = W * 0.5
  const headY = H * rf(r, 0.32, 0.35)
  const headR = W * 0.15
  const shoulderY = headY + headR * rf(r, 2.05, 2.25)
  const shoulderW = W * 0.88
  const haloR = headR * rf(r, 2.1, 2.35)

  // concentric halo behind the head: fine, low-contrast rings, one accent
  let rings = ''
  const ringCount = 6
  for (let i = 1; i <= ringCount; i++) {
    const isA = i === 3
    rings += `<circle cx="${n2(axisX)}" cy="${n2(headY)}" r="${n2(
      haloR * (i / ringCount),
    )}" fill="none" stroke="${isA ? ACCENT_SOFT : C.border}" stroke-width="${n2(
      (isA ? 1.3 : 1) * SS,
    )}" opacity="${isA ? 0.33 : 0.22}"/>`
  }
  // radial spokes on the halo, evenly spaced
  let spokes = ''
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2
    const r0 = haloR * 0.62
    const r1 = haloR
    spokes += `<line x1="${n2(axisX + Math.cos(a) * r0)}" y1="${n2(
      headY + Math.sin(a) * r0,
    )}" x2="${n2(axisX + Math.cos(a) * r1)}" y2="${n2(
      headY + Math.sin(a) * r1,
    )}"/>`
  }

  const shoulders = `<path d="M${n2(axisX - shoulderW / 2)} ${H}
      C ${n2(axisX - shoulderW / 2)} ${n2(shoulderY + H * 0.04)},
        ${n2(axisX - shoulderW * 0.2)} ${n2(shoulderY - H * 0.005)},
        ${n2(axisX)} ${n2(shoulderY - H * 0.005)}
      C ${n2(axisX + shoulderW * 0.2)} ${n2(shoulderY - H * 0.005)},
        ${n2(axisX + shoulderW / 2)} ${n2(shoulderY + H * 0.04)},
        ${n2(axisX + shoulderW / 2)} ${H} Z"
      fill="#2b3a5e" stroke="#3b4d78" stroke-width="${n2(1.4 * SS)}" opacity="0.98"/>`

  const collar = `<path d="M${n2(axisX - shoulderW * 0.3)} ${H}
      C ${n2(axisX - shoulderW * 0.3)} ${n2(shoulderY + H * 0.05)},
        ${n2(axisX - shoulderW * 0.14)} ${n2(shoulderY + H * 0.012)},
        ${n2(axisX)} ${n2(shoulderY + H * 0.012)}
      C ${n2(axisX + shoulderW * 0.14)} ${n2(shoulderY + H * 0.012)},
        ${n2(axisX + shoulderW * 0.3)} ${n2(shoulderY + H * 0.05)},
        ${n2(axisX + shoulderW * 0.3)} ${H} Z"
      fill="#22314f" stroke="#3b4d78" stroke-width="${n2(1 * SS)}" opacity="0.95"/>`

  const neckY = headY + headR * 0.78
  const neck = `<rect x="${n2(axisX - headR * 0.24)}" y="${n2(neckY)}" width="${n2(
    headR * 0.48,
  )}" height="${n2(shoulderY - neckY + 6)}" fill="#2b3a5e" stroke="#3b4d78" stroke-width="${n2(
    1 * SS,
  )}" opacity="0.98"/>`

  const head = `<circle cx="${n2(axisX)}" cy="${n2(headY)}" r="${n2(
    headR,
  )}" fill="#2f3f66" stroke="#42558a" stroke-width="${n2(1.6 * SS)}"/>`
  const headInner = `<circle cx="${n2(axisX)}" cy="${n2(headY)}" r="${n2(
    headR * 0.86,
  )}" fill="none" stroke="#42558a" stroke-width="${n2(1 * SS)}" opacity="0.7"/>`
  const accentArc = `<path d="M${n2(axisX + headR * 0.26)} ${n2(headY - headR * 0.7)}
      A ${n2(headR)} ${n2(headR)} 0 0 1 ${n2(axisX + headR * 0.7)} ${n2(headY + headR * 0.1)}"
      fill="none" stroke="${C.accent}" stroke-width="${n2(2.2 * SS)}" opacity="0.95" stroke-linecap="round"/>`

  let ticks = ''
  for (let i = 1; i < 14; i++) {
    const y = (H / 14) * i
    ticks += `<line x1="${n2(W * 0.075)}" y1="${n2(y)}" x2="${n2(
      W * 0.075 + (i % 3 === 0 ? 16 : 8) * SS,
    )}" y2="${n2(y)}"/>`
  }

  const parts = [
    await baseLayer(w, h, r, { stops: [C.surface, C.bg, '#0b1120'], angle: 'v' }),
    await layer(gridBody(w, h, { step: Math.round(w / 12), op: 0.28 }), w, h),
    await layer(frameBody(w, h, w * 0.06), w, h),
    await layer(`<g>${rings}</g>`, w, h),
    await layer(
      `<g stroke="${C.border}" stroke-width="${n2(0.9 * SS)}" opacity="0.3">${spokes}</g>`,
      w, h,
    ),
    await layer(
      `<g stroke="${C.fgMuted}" stroke-width="${n2(0.9 * SS)}" opacity="0.4">${ticks}</g>`,
      w, h,
    ),
    await layer(shoulders, w, h),
    await layer(collar, w, h),
    await layer(neck, w, h),
    await layer(head, w, h),
    await layer(headInner, w, h),
    await layer(accentArc, w, h),
  ]
  return compose(parts, w, h)
}

/**
 * Composite all layers at the 2x supersample, then encode.
 *
 * Note: `composite(...).resize(...)` in ONE pipeline trips a sharp/libvips
 * "must have same dimensions or smaller" error when downscaling a composited
 * page, so the composite is materialised to a buffer first and a fresh sharp
 * instance performs the downscale + encode.
 */
async function compose(parts, w, h, quality = 80) {
  const { w: W, h: H } = px(w, h)
  const stacked = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { ...hexToRgb(C.bg), alpha: 1 },
    },
  })
    .composite(parts)
    .png()
    .toBuffer()

  return sharp(stacked)
    .resize(w, h, { fit: 'fill', kernel: 'lanczos3' })
    .flatten({ background: C.bg })
    .webp({ quality, compressionLevel: 9, effort: 6 })
    .toBuffer()
}

// ---- Asset manifest (fixed seeds => deterministic output) -----------------
const PORTRAIT_SEED = 20240517

const ASSETS = [
  { out: 'portrait-900', kind: 'portrait', w: 900, h: 1125, seed: PORTRAIT_SEED, q: 78 },
  { out: 'portrait-640', kind: 'portrait', w: 640, h: 800, seed: PORTRAIT_SEED, q: 80 },
  { out: 'portrait-180', kind: 'portrait', w: 180, h: 225, seed: PORTRAIT_SEED, q: 82 },
  // project art: seed is the FNV-1a hash of each project's imageSeed string,
  // so the motif stays stable while remaining unique per project.
  { out: 'project-ledgerline', motif: 'strata', w: 800, h: 600, seedSrc: 'ledgerline-pipeline' },
  { out: 'project-atlas-auth', motif: 'signal', w: 800, h: 600, seedSrc: 'atlas-auth-flow' },
  { out: 'project-fjord-dashboard', motif: 'contours', w: 800, h: 600, seedSrc: 'fjord-dashboard' },
  { out: 'project-undertow', motif: 'matrix', w: 800, h: 600, seedSrc: 'undertow-field' },
]

function fnv1a(str) {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

async function main() {
  const dir = join(__dirname, '..', 'public', 'images')
  await mkdir(dir, { recursive: true })

  const rows = []
  for (const a of ASSETS) {
    const seed = a.seed != null ? a.seed : fnv1a(a.seedSrc)
    const buf =
      a.kind === 'portrait'
        ? await buildPortrait(a.w, a.h, seed)
        : await buildAbstract(a.motif, a.w, a.h, seed)
    const rel = `public/images/${a.out}.webp`
    await sharp(buf).toFile(join(dir, `${a.out}.webp`))
    rows.push({ rel, dims: `${a.w}x${a.h}`, bytes: buf.length })
  }

  const widest = Math.max(...rows.map((x) => x.rel.length))
  for (const x of rows)
    console.log(
      `${x.rel.padEnd(widest)}  ${x.dims.padStart(9)}  ${(x.bytes / 1024)
        .toFixed(1)
        .padStart(6)} KB`,
    )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
