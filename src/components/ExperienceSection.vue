<script setup>
import { ref } from 'vue'
import { useContextGsap, EASE, STAGGER } from '../composables/useGsap'

defineProps({
  heading: { type: String, default: 'Experience' },
  entries: { type: Array, default: () => [] },
})

const root = ref(null)

// Spine: Line drawing via scaleY from 0 with transform-origin top, driven by
// scroll (linear, because the spine length IS scroll position). Entries reveal
// x:-16 with a 0.1 stagger; dates lead their bodies slightly.
useContextGsap(
  ({ gsap, el, ScrollTrigger }) => {
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el.querySelector('[data-spine]'),
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top 75%',
            end: 'bottom 65%',
            scrub: 0.6,
          },
        },
      )

      const rows = gsap.utils.toArray(el.querySelectorAll('[data-entry]'))
      ScrollTrigger.batch(rows, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, {
            opacity: 0,
            x: -16,
            duration: 0.5,
            ease: EASE.expo,
            stagger: STAGGER.loose,
          }),
      })

      gsap.from(el.querySelectorAll('[data-entry-date]'), {
        opacity: 0,
        duration: 0.35,
        ease: EASE.out,
        stagger: STAGGER.loose,
        scrollTrigger: {
          trigger: el,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      })
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(el.querySelector('[data-spine]'), {
        scaleY: 1,
        transformOrigin: 'top center',
      })
      gsap.set(el.querySelectorAll('[data-entry], [data-entry-date]'), {
        opacity: 1,
        x: 0,
      })
    })
  },
  { scope: root },
)
</script>

<template>
  <section id="experience" ref="root" class="mx-auto max-w-7xl px-6 py-24 md:py-32">
    <h2
      class="font-display text-3xl font-semibold tracking-[-0.02em] text-fg md:text-4xl"
    >
      {{ heading }}
    </h2>

    <div class="relative mt-14 lg:pl-[7rem]">
      <!-- The single left hairline spine -->
      <span
        data-spine
        aria-hidden="true"
        class="absolute bottom-0 left-0 top-0 hidden w-px bg-border lg:block"
      ></span>
      <span
        aria-hidden="true"
        class="absolute bottom-0 left-[3px] top-0 w-px bg-border lg:hidden"
      ></span>

      <ol class="flex flex-col gap-12">
        <li
          v-for="entry in entries"
          :key="entry.period + entry.title"
          data-entry
          class="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:gap-8"
        >
          <p
            data-entry-date
            class="font-mono text-sm text-fg-muted lg:col-span-3 lg:-ml-[7rem] lg:pl-0"
          >
            {{ entry.period }}
          </p>

          <div class="lg:col-span-9">
            <h3 class="font-display text-lg font-medium tracking-[-0.01em] text-fg">
              {{ entry.title }}
              <span v-if="entry.org" class="text-fg-muted">, {{ entry.org }}</span>
            </h3>
            <p
              class="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-fg-muted"
            >
              {{ entry.body }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
