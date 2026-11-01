<script setup>
import AppIcon from './AppIcon.vue'
/**
 * ContactSection - centered colophon (PLAN 3.7)
 *
 * The page's ONE centered moment: max-w-2xl mx-auto text-center.
 * ONE availability pill (rounded-full, accent-tinted, single accent dot that
 * pulses opacity only, 2.4s). Primary CTA is a mailto; secondary is a ghost
 * "Download CV". No contact form.
 *
 * Links carry full Iconify names backed by the committed offline registry.
 */
import { ref } from 'vue'
import { useReveal } from '../composables/useGsap.js'
import { AppButton } from './ui.js'

const props = defineProps({
  icons: { type: Object, default: () => ({}) },
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  email: { type: String, default: '' },
  cvHref: { type: String, default: '' },
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

/** Build the link list: prefer explicit `links`, else derive from social/email. */
function buildLinks() {
  if (props.links && props.links.length) return props.links

  const out = []
  if (props.email) {
    out.push({
      label: props.email,
      href: `mailto:${props.email}`,
      icon: props.icons.email,
    })
  }
  const social = props.social || {}
  if (social.github) {
    out.push({ label: social.github, href: social.github, icon: props.icons.github })
  }
  if (social.linkedin) {
    out.push({
      label: social.linkedin,
      href: social.linkedin,
      icon: props.icons.linkedin,
    })
  }
  for (const key of ['instagram', 'threads']) {
    if (social[key])
      out.push({ label: social[key], href: social[key], icon: props.icons[key] })
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
        v-if="props.cvHref"
        :label="props.cvLabel"
        :href="props.cvHref"
        variant="ghost"
        :icon="props.icons.download"
      />
    </div>

    <ul
      class="mt-12 flex flex-wrap flex-col items-center justify-center gap-x-8 gap-y-3 sm:flex-row"
      data-reveal
    >
      <li v-for="link in links" :key="link.href ?? link.label">
        <a
          :href="link.href"
          :target="isExternal(link.href) ? '_blank' : undefined"
          :rel="isExternal(link.href) ? 'noopener noreferrer' : undefined"
          class="inline-flex items-center gap-2 font-mono text-sm text-fg-muted transition-colors duration-200 ease-out-strong hover:text-fg focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        >
          <AppIcon :name="link.icon" />
          <span class="min-w-0 break-all">{{ displayLabel(link) }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
