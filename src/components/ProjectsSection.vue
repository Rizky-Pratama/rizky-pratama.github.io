<script setup>
/**
 * ProjectsSection - vertical case-study list (PLAN 3.4)
 *
 * A single-column list of 4 entries separated by `divide-y` hairlines, not
 * cards. Each row is a 2-col grid at lg: left col-span-7 (text), right
 * col-span-4 (image), consistently left-text/right-image. Never alternating.
 *
 * Motion: headline + rows scroll-reveal via `useReveal` (composable owns
 * matchMedia). Images get a small yPercent -4..4 scroll-scrub parallax through
 * `useContextGsap`, gated by the composable's `useReducedMotion` flag. No pins.
 */
import { ref } from 'vue'
import { useReveal, useContextGsap, useReducedMotion } from '../composables/useGsap.js'

const props = defineProps({
  projects: { type: Array, default: () => [] },
  heading: { type: String, default: 'Selected work' },
  intro: { type: String, default: '' },
})

const root = ref(null)

// The composable owns matchMedia for reveal motion; sections pass config only.
useReveal({
  root: () => root.value,
  selector: '[data-reveal]',
  from: { y: 24 },
  stagger: 0.08,
  duration: 0.5,
  ease: 'expo.out',
  start: 'top 82%',
})

// `useReducedMotion` is the composable's reactive flag and the single
// matchMedia owner. We branch in plain JS from it rather than registering a
// second matchMedia in this section.
const { prefersReducedMotion } = useReducedMotion()

// Parallax on the images ONLY, scrub 1, no pin. Skipped entirely when the
// user prefers reduced motion.
useContextGsap(
  ({ gsap, el }) => {
    if (prefersReducedMotion.value) return

    const images = gsap.utils.toArray(el.querySelectorAll('[data-parallax]'))
    if (!images.length) return

    images.forEach((img) => {
      gsap.fromTo(
        img,
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        },
      )
    })
  },
  { scope: root },
)

// Project artwork is committed to `public/images/` by scripts/gen-images.mjs.
// Each project's `imageSeed` selects a local asset; the caller may also set
// `image` to an explicit path (e.g. a real photo) to override the seed.
const IMAGE_BY_SEED = {
  'ledgerline-pipeline': '/images/project-ledgerline.webp',
  'atlas-auth-flow': '/images/project-atlas-auth.webp',
  'fjord-dashboard': '/images/project-fjord-dashboard.webp',
  'undertow-field': '/images/project-undertow.webp',
}

const FALLBACK_IMAGE = '/images/project-ledgerline.webp'

const imageSrc = (project) =>
  project.image || IMAGE_BY_SEED[project.imageSeed] || FALLBACK_IMAGE
</script>

<template>
  <section
    id="work"
    ref="root"
    class="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32"
    aria-labelledby="work-heading"
  >
    <header class="mb-12 lg:mb-16">
      <h2
        id="work-heading"
        class="max-w-[20ch] font-display text-3xl font-medium tracking-tight text-fg lg:text-4xl"
        data-reveal
      >
        {{ props.heading }}
      </h2>
      <p
        v-if="props.intro"
        class="mt-3 max-w-[52ch] text-base leading-relaxed text-fg-muted"
        data-reveal
      >
        {{ props.intro }}
      </p>
    </header>

    <!-- Hairline-separated list: one family, no per-item cards. -->
    <ol class="divide-y divide-border border-y border-border">
      <li
        v-for="project in props.projects"
        :key="project.id"
        class="grid grid-cols-1 gap-6 py-10 lg:grid-cols-12 lg:gap-8 lg:py-14"
        data-reveal
      >
        <!-- Left: text -->
        <div class="flex flex-col gap-4 lg:col-span-7">
          <div class="flex flex-col gap-1">
            <h3
              class="font-display text-2xl font-medium tracking-tight text-fg lg:text-3xl"
            >
              {{ project.title }}
            </h3>
            <p class="font-mono text-xs uppercase tracking-[0.14em] text-fg-muted">
              {{ project.role }}
            </p>
          </div>

          <p class="max-w-[58ch] text-base leading-relaxed text-fg-muted">
            {{ project.summary }}
          </p>

          <p class="max-w-[58ch] text-base leading-relaxed text-fg">
            {{ project.outcome }}
          </p>

          <ul class="mt-1 flex flex-wrap gap-2" aria-label="Stack">
            <li
              v-for="tech in project.stack"
              :key="tech"
              class="rounded-xs border border-border px-2 py-1 font-mono text-xs text-fg-muted"
            >
              {{ tech }}
            </li>
          </ul>
        </div>

        <!-- Right: image, offset down at lg for rhythm (not alternation). -->
        <div class="lg:col-span-4 lg:mt-8">
          <div class="overflow-hidden rounded-md border border-border bg-surface">
            <img
              :src="imageSrc(project)"
              :alt="`${project.title} case study`"
              width="800"
              height="600"
              loading="lazy"
              decoding="async"
              class="aspect-[4/3] w-full object-cover"
              data-parallax
            />
          </div>
        </div>
      </li>
    </ol>
  </section>
</template>
