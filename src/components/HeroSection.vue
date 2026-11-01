<script setup>
import AppIcon from './AppIcon.vue'
import { computed, ref } from 'vue'
import { useContextGsap, EASE, DUR } from '../composables/useGsap'

const props = defineProps({
  icon: { type: String, default: '' },
  eyebrow: { type: String, default: '$ whoami' },
  heading: { type: String, default: '' },
  subtext: { type: String, default: '' },
  portrait: {
    type: Object,
    default: () => ({ src: '/images/my-foto.webp', srcset: '', alt: 'Portrait' }),
  },
  ctaLabel: { type: String, default: 'Start a conversation' },
  ctaHref: { type: String, default: '#' },
  secondaryLabel: { type: String, default: 'See selected work' },
  secondaryHref: { type: String, default: '#work' },
})

const root = ref(null)

// Portrait is a committed local asset (public/images), resolved by Vite as-is.
// `portrait.src` is the 1x file; `portrait.srcset` adds an optional 2x variant.
const portraitSrc = computed(() => props.portrait.src)
const portraitSrcset = computed(() => props.portrait.srcset || undefined)

// The hero is one orchestrated timeline. The headline curtain is the page's
// SINGLE clip-path Reveal; everything else is a staggered Slide in. Reduced
// motion collapses to the final state via the matchMedia branch below.
useContextGsap(
  ({ gsap, el }) => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: EASE.expo } })

      // Reveal: clip-path curtain on the headline block, opened top to bottom.
      tl.fromTo(
        el.querySelector('[data-hero-heading]'),
        { clipPath: 'inset(0 0 100% 0)', y: 12 },
        { clipPath: 'inset(0 0 0% 0)', y: 0, duration: DUR.hero, ease: 'power2.inOut' },
      )
        .from(
          el.querySelector('[data-hero-eyebrow]'),
          { opacity: 0, y: 16, duration: 0.5 },
          0.1,
        )
        .from(
          el.querySelector('[data-hero-sub]'),
          { opacity: 0, y: 16, duration: 0.5 },
          0.35,
        )
        .from(
          el.querySelectorAll('[data-hero-cta]'),
          { opacity: 0, y: 16, duration: 0.5, stagger: 0.07 },
          0.55,
        )
        .from(
          el.querySelector('[data-hero-portrait]'),
          { opacity: 0, y: 12, duration: 0.5, ease: EASE.out },
          0.2,
        )
        .from(
          el.querySelector('[data-hero-rule]'),
          { scaleY: 0, transformOrigin: 'top center', duration: 0.6, ease: EASE.out },
          0.3,
        )
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(el.querySelector('[data-hero-heading]'), { clipPath: 'inset(0 0 0% 0)' })
    })
  },
  { scope: root },
)
</script>

<template>
  <section
    id="top"
    ref="root"
    class="relative mx-auto grid min-h-[100dvh] max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-24 lg:grid-cols-12 lg:gap-8"
  >
    <!-- Text: cols 1-7 -->
    <div class="lg:col-span-7">
      <p data-hero-eyebrow class="mb-6 font-mono text-sm text-accent">
        {{ eyebrow
        }}<span
          aria-hidden="true"
          class="ml-1 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] bg-accent align-baseline"
        ></span>
      </p>

      <h1
        data-hero-heading
        class="font-display text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-fg md:text-4xl lg:text-5xl"
      >
        {{ heading }}
      </h1>

      <p
        data-hero-sub
        class="mt-6 max-w-[46ch] font-body text-base leading-relaxed text-fg-muted md:text-lg"
      >
        {{ subtext }}
      </p>

      <div class="mt-10 flex flex-wrap items-center gap-4">
        <a
          data-hero-cta
          :href="ctaHref"
          class="rounded-sm bg-accent px-6 py-3 font-body text-sm font-medium text-on-accent transition-colors duration-160 ease-out-strong hover:bg-accent-press active:scale-[0.97]"
        >
          {{ ctaLabel }}
        </a>

        <a
          data-hero-cta
          :href="secondaryHref"
          class="group inline-flex items-center gap-2 font-body text-sm font-medium text-fg transition-colors duration-160 ease-out-strong hover:text-accent"
        >
          {{ secondaryLabel }}
          <AppIcon
            data-cta-arrow
            :name="icon"
            class="transition-transform duration-200 ease-out-strong"
          />
        </a>
      </div>
    </div>

    <!-- Portrait: cols 8-12, offset down -->
    <div class="lg:col-span-5 lg:mt-16">
      <div class="relative flex items-stretch gap-4">
        <span data-hero-rule aria-hidden="true" class="w-px shrink-0 bg-accent"></span>
        <div class="portrait-frame" data-hero-portrait>
          <div class="portrait-hover">
            <img
              :src="portraitSrc"
              :srcset="portraitSrcset"
              sizes="(min-width: 1024px) 40vw, 100vw"
              :alt="portrait.alt"
              width="900"
              height="1125"
              fetchpriority="high"
              decoding="async"
              class="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
