<script setup>
/**
 * ContactSection - centered colophon (PLAN 3.7)
 *
 * The page's ONE centered moment: max-w-2xl mx-auto text-center.
 * ONE availability pill (rounded-full, accent-tinted, single accent dot that
 * pulses opacity only, 2.4s). Primary CTA is a mailto; secondary is a ghost
 * "Download CV". No contact form.
 *
 * Links come from site.social + site.email with inline Phosphor-style SVG
 * icons. The links array from site.js carries an `icon` key; unknown keys fall
 * back to a plain envelope glyph so nothing renders iconless.
 */
import { ref } from 'vue'
import { useReveal } from '../composables/useGsap.js'
import { AppButton } from './ui.js'

const props = defineProps({
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  email: { type: String, default: '' },
  cvHref: { type: String, default: '/cv.pdf' },
  social: { type: Object, default: () => ({}) },
  availability: { type: String, default: '' },
  links: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: 'Start a conversation' },
  cvLabel: { type: String, default: 'Download CV' },
})

const root = ref(null)

useReveal({
  root: () => root.value,
  selector: '[data-reveal]',
  from: { y: 16 },
  stagger: 0.06,
  duration: 0.55,
  ease: 'expo.out',
  start: 'top 88%',
})

/** Inline Phosphor-style icon paths, keyed to match site.js `icon` values. */
const ICONS = {
  'envelope-simple':
    'M224 48H32a16 16 0 0 0-16 16v128a16 16 0 0 0 16 16h192a16 16 0 0 0 16-16V64a16 16 0 0 0-16-16Zm-96 88L40 72h176Zm-72 56V85l72 60 72-60v107Z',
  'github-logo':
    'M208 88a80 80 0 0 0-79.8 75.4 40 40 0 0 0-16.2 16.2 8 8 0 0 0 6.6 12.4h.6a8 8 0 0 0 6.5-3.3 24 24 0 0 1 18-11.6 8 8 0 0 0 6.9-6.7 64 64 0 1 1 84 27.3 8 8 0 0 0-4.7 7.3v27.2a8 8 0 0 0 32 0V88a80 80 0 0 0-80-80Z',
  'linkedin-logo':
    'M216 24H40a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V40a16 16 0 0 0-16-16ZM80 184a8 8 0 0 1-16 0v-72a8 8 0 0 1 16 0Zm-8-88a12 12 0 1 1 12-12 12 12 0 0 1-12 12Zm120 88a8 8 0 0 1-16 0v-40a24 24 0 0 0-48 0v40a8 8 0 0 1-16 0v-72a8 8 0 0 1 14.3-5.1 40 40 0 0 1 65.7 31.3Z',
}

const pathFor = (key) => ICONS[key] ?? ICONS['envelope-simple']

/** Build the link list: prefer explicit `links`, else derive from social/email. */
function buildLinks() {
  if (props.links && props.links.length) return props.links

  const out = []
  if (props.email) {
    out.push({
      label: props.email,
      href: `mailto:${props.email}`,
      icon: 'envelope-simple',
    })
  }
  const social = props.social || {}
  if (social.github) {
    out.push({ label: social.github, href: social.github, icon: 'github-logo' })
  }
  if (social.linkedin) {
    out.push({
      label: social.linkedin,
      href: social.linkedin,
      icon: 'linkedin-logo',
    })
  }
  return out
}

const links = buildLinks()

const isExternal = (href) => /^https?:\/\//.test(href)

/** Show a compact label for URLs; leave mailto/plain text untouched. */
function displayLabel(link) {
  if (!link) return ''
  if (link.label) return link.label
  return link.href
}
</script>

<template>
  <section
    id="contact"
    ref="root"
    class="mx-auto w-full max-w-2xl px-6 py-24 text-center lg:py-32"
    aria-labelledby="contact-heading"
  >
    <!-- ONE availability pill on the page. -->
    <p
      v-if="props.availability"
      class="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-xs text-accent"
      data-reveal
    >
      <span
        class="size-1.5 shrink-0 rounded-full bg-accent motion-safe:animate-pulse"
        aria-hidden="true"
        style="animation-duration: 2.4s; animation-timing-function: ease-in-out"
      />
      {{ props.availability }}
    </p>

    <h2
      id="contact-heading"
      class="mx-auto max-w-[22ch] font-display text-3xl font-medium leading-tight tracking-tight text-fg lg:text-4xl"
      data-reveal
    >
      {{ props.heading }}
    </h2>

    <p
      class="mx-auto mt-4 max-w-[46ch] text-base leading-relaxed text-fg-muted"
      data-reveal
    >
      {{ props.body }}
    </p>

    <div
      class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
      data-reveal
    >
      <AppButton
        :label="props.ctaLabel"
        :href="`mailto:${props.email}`"
        variant="primary"
      />
      <AppButton
        :label="props.cvLabel"
        :href="props.cvHref"
        variant="ghost"
        icon="download"
      />
    </div>

    <ul
      class="mt-12 flex flex-col items-center justify-center gap-x-8 gap-y-3 sm:flex-row"
      data-reveal
    >
      <li v-for="link in links" :key="link.href ?? link.label">
        <a
          :href="link.href"
          :target="isExternal(link.href) ? '_blank' : undefined"
          :rel="isExternal(link.href) ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-2 font-mono text-sm text-fg-muted transition-colors duration-200 ease-out-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <svg
            class="size-4 shrink-0"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path :d="pathFor(link.icon)" />
          </svg>
          <span>{{ displayLabel(link) }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
