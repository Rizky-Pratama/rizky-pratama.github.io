<script setup>
import AppIcon from './AppIcon.vue'
/**
 * SiteFooter - mono meta band (see PLAN.md)
 *
 * lg:grid-cols-4: (1) name + role, (2) sitemap anchors, (3) elsewhere links,
 * (4) colophon. The single permitted location mention lives here on the
 * contact line. Legal row carries `(c) 2026 {NAME}` and a focusable
 * "Back to top" control. No version footer, no locale strip.
 *
 * Motion: top border scaleX wipe (origin left) + 4-column stagger fade (60ms)
 * through `useContextGsap`. Reduced motion: instant.
 */
import { ref } from 'vue'
import { useContextGsap, useReducedMotion } from '../composables/useGsap.js'

const props = defineProps({
  icon: { type: String, default: '' },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  location: { type: String, default: '' },
  social: { type: Object, default: () => ({}) },
  nav: { type: Array, default: () => [] },
  email: { type: String, default: '' },
  colophon: { type: String, default: '' },
  legal: { type: String, default: '' },
  // Pre-composed, trimmed legal + name string from site.js
  // (site.sections.footer.copyright). Rendered alone so an empty name never
  // leaves a trailing space.
  copyright: { type: String, default: '' },
})

const root = ref(null)

// The composable owns matchMedia; this section branches on its reactive flag.
const { prefersReducedMotion } = useReducedMotion()

useContextGsap(
  ({ gsap, el }) => {
    const rule = el.querySelector('[data-footer-rule]')
    const columns = gsap.utils.toArray(el.querySelectorAll('[data-footer-col]'))

    // Reduced motion: render the revealed end state instantly, no timeline.
    if (prefersReducedMotion.value) {
      if (rule) gsap.set(rule, { scaleX: 1, clearProps: 'transform' })
      if (columns.length) {
        gsap.set(columns, { opacity: 1, y: 0, clearProps: 'transform' })
      }
      return
    }

    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 95%', once: true },
    })

    if (rule) {
      tl.from(rule, {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.6,
        ease: 'expo.out',
      })
    }

    if (columns.length) {
      tl.from(
        columns,
        {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: 'expo.out',
          stagger: 0.06,
        },
        rule ? '-=0.35' : 0,
      )
    }
  },
  { scope: root },
)

/** Flatten social into a stable, non-empty link list. */
function buildElsewhere() {
  const social = props.social || {}
  const out = []
  const order = ['github', 'linkedin', 'instagram', 'threads', 'x', 'dribbble']

  for (const key of order) {
    const href = social[key]
    if (href) out.push({ key, href })
  }
  return out
}

const elsewhere = buildElsewhere()

const labelFor = (key) =>
  ({
    github: 'GitHub',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    threads: 'Threads',
    x: 'X',
    dribbble: 'Dribbble',
  })[key] ?? key

const isExternal = (href) => /^https?:\/\//.test(href)
</script>

<template>
  <footer ref="root" class="mx-auto w-full max-w-6xl px-6 pb-12 pt-16 lg:pt-24">
    <!-- Top hairline: themed via border-color, wiped with scaleX at reveal. -->
    <div
      class="mb-10 h-px w-full origin-left bg-border"
      data-footer-rule
      aria-hidden="true"
    />

    <div class="grid grid-cols-1 gap-10 font-mono text-sm lg:grid-cols-4">
      <!-- 1. Name + role -->
      <div class="flex flex-col gap-2" data-footer-col>
        <p class="text-fg">{{ props.name || 'Portfolio' }}</p>
        <p class="text-fg-muted">{{ props.role }}</p>
        <p v-if="props.location" class="text-fg-muted">
          {{ props.location }}
        </p>
        <a
          v-if="props.email"
          :href="`mailto:${props.email}`"
          class="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {{ props.email }}
        </a>
      </div>

      <!-- 2. Sitemap anchors -->
      <nav class="flex flex-col gap-2" aria-label="Footer">
        <p class="text-xs uppercase tracking-[0.16em] text-fg-muted">Sitemap</p>
        <a
          v-for="item in props.nav"
          :key="item.href"
          :href="item.href"
          class="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {{ item.label }}
        </a>
      </nav>

      <!-- 3. Elsewhere -->
      <div class="flex flex-col gap-2">
        <p class="text-xs uppercase tracking-[0.16em] text-fg-muted">Elsewhere</p>
        <a
          v-for="item in elsewhere"
          :key="item.key"
          :href="item.href"
          :target="isExternal(item.href) ? '_blank' : undefined"
          :rel="isExternal(item.href) ? 'noopener noreferrer' : undefined"
          class="text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {{ labelFor(item.key) }}
        </a>
      </div>

      <!-- 4. Colophon -->
      <div class="flex flex-col gap-2" data-footer-col>
        <p class="text-xs uppercase tracking-[0.16em] text-fg-muted">Colophon</p>
        <p class="text-fg-muted">{{ props.colophon }}</p>
      </div>
    </div>

    <div
      class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 font-mono text-xs text-fg-muted sm:flex-row sm:items-center"
      data-footer-col
    >
      <p>{{ props.copyright || props.legal }}</p>
      <a
        href="#main"
        class="inline-flex items-center gap-1.5 text-fg-muted transition-colors duration-200 ease-out-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <AppIcon :name="props.icon" />
        <span>Back to top</span>
      </a>
    </div>
  </footer>
</template>
