<script setup>
/**
 * AboutSection - editorial prose + portrait (PLAN 3.6)
 *
 * Layout: stacked headline (max-w-[20ch]), then at lg a 2-col grid:
 * left col-span-7 prose (max-w-[65ch]), right col-span-4 aside holding the
 * portrait, readouts (mono, tabular-nums) and a "Now" list.
 *
 * Motion: headline/body scroll-reveal, "Now" list staggers, portrait fades in
 * (NO clip-path - the curtain belongs to the hero). The readouts get a number
 * ticker on their numeric value only, driven by `useContextGsap`.
 */
import { computed, ref } from 'vue'
import { useReveal, useContextGsap, useReducedMotion } from '../composables/useGsap.js'

const props = defineProps({
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  now: { type: Array, default: () => [] },
  readouts: { type: Array, default: () => [] },
  portrait: {
    type: Object,
    default: () => ({ src: '/images/portrait-640.webp', srcset: '', alt: '' }),
  },
})

const root = ref(null)

useReveal({
  root: () => root.value,
  selector: '[data-reveal]',
  from: { y: 20 },
  stagger: 0.08,
  duration: 0.5,
  ease: 'expo.out',
  start: 'top 85%',
})

/**
 * Number ticker: only for readouts whose value is a plain integer with an
 * optional trailing "+" (e.g. "40+", "3"). Tokens like "{YEARS}" and the
 * unresolved "--" are left alone. Runs once when the aside enters view.
 *
 * Reduced motion is read from the composable's reactive flag, so this section
 * never registers a matchMedia of its own.
 */
const { prefersReducedMotion } = useReducedMotion()

useContextGsap(
  ({ gsap, el }) => {
    const nodes = gsap.utils.toArray(el.querySelectorAll('[data-ticker]'))
    if (!nodes.length) return

    nodes.forEach((node) => {
      const target = Number(node.dataset.ticker)
      if (!Number.isFinite(target)) return

      const suffix = node.dataset.tickerSuffix || ''

      // Reduced motion: leave the correct value already in the DOM, no tween.
      if (prefersReducedMotion.value) {
        node.textContent = `${target}${suffix}`
        return
      }

      const state = { value: 0 }

      gsap.to(state, {
        value: target,
        duration: 0.9,
        ease: 'power3.out',
        snap: { value: 1 },
        scrollTrigger: { trigger: node, start: 'top 90%', once: true },
        onUpdate: () => {
          node.textContent = `${Math.round(state.value)}${suffix}`
        },
        onComplete: () => {
          node.textContent = `${target}${suffix}`
        },
      })
    })
  },
  { scope: root },
)

/**
 * Split a readout value into a ticker target + suffix. Returns null when the
 * value is not a plain integer (e.g. "{YEARS}" or "--"), so those render as
 * static text.
 */
function tickerFor(value) {
  const match = String(value).match(/^(\d+)(\+?)$/)
  if (!match) return null
  return { target: match[1], suffix: match[2] || '' }
}

// Portrait is a committed local asset (public/images); `props.portrait.src`
// points at the 640x800 file and `srcset` may add an optional higher-DPI file.
const portraitSrc = computed(() => props.portrait.src)
const portraitSrcset = computed(() => props.portrait.srcset || undefined)
</script>

<template>
  <section
    id="about"
    ref="root"
    class="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32"
    aria-labelledby="about-heading"
  >
    <h2
      id="about-heading"
      class="max-w-[20ch] font-display text-3xl font-medium leading-tight tracking-tight text-fg lg:text-4xl"
      data-reveal
    >
      {{ props.heading }}
    </h2>

    <div class="mt-12 grid grid-cols-1 gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
      <!-- Left: prose -->
      <div class="lg:col-span-7">
        <p class="max-w-[65ch] text-lg leading-relaxed text-fg-muted" data-reveal>
          {{ props.body }}
        </p>
      </div>

      <!-- Right: portrait + readouts + Now -->
      <aside class="flex flex-col gap-8 lg:col-span-4">
        <img
          :src="portraitSrc"
          :srcset="portraitSrcset"
          sizes="(min-width: 1024px) 33vw, 100vw"
          :alt="props.portrait.alt || 'Portrait'"
          width="640"
          height="800"
          loading="lazy"
          decoding="async"
          class="aspect-[4/5] w-full rounded-md border border-border object-cover"
          data-reveal
        />

        <dl class="grid grid-cols-2 gap-6">
          <div
            v-for="readout in props.readouts"
            :key="readout.label"
            class="flex flex-col gap-1"
            data-reveal
          >
            <dt class="font-mono text-xs text-fg-muted">
              {{ readout.label }}
            </dt>
            <dd
              v-if="tickerFor(readout.value)"
              class="font-mono text-2xl tabular text-fg"
              :data-ticker="tickerFor(readout.value).target"
              :data-ticker-suffix="tickerFor(readout.value).suffix"
            >
              {{ readout.value }}
            </dd>
            <dd v-else class="font-mono text-2xl tabular text-fg">
              {{ readout.value }}
            </dd>
          </div>
        </dl>

        <div class="flex flex-col gap-3" data-reveal>
          <h3 class="font-mono text-xs uppercase tracking-[0.16em] text-fg-muted">Now</h3>
          <ul class="flex flex-col gap-2">
            <li
              v-for="item in props.now"
              :key="item"
              class="border-l border-border pl-3 text-sm leading-relaxed text-fg-muted"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>
