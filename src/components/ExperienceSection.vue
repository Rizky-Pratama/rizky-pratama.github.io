<script setup>
import { ref } from 'vue'
import { useContextGsap, EASE, STAGGER } from '../composables/useGsap'

defineProps({
  heading: { type: String, default: 'Experience' },
  entries: { type: Array, default: () => [] },
})

const root = ref(null)

// The composable owns media queries and cleanup for the timeline sequence.
useContextGsap(
  ({ gsap, el, reducedMotion }) => {
    if (reducedMotion) return

    gsap.from(el.querySelector('[data-spine]'), {
      scaleY: 0,
      transformOrigin: 'top center',
      ease: 'none',
      scrollTrigger: {
        trigger: el.querySelector('[data-timeline]'),
        start: 'top 80%',
        end: 'bottom 65%',
        scrub: 0.6,
      },
    })

    el.querySelectorAll('[data-entry]').forEach((row) => {
      gsap
        .timeline({
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        })
        .from(row.querySelector('[data-entry-dot]'), {
          opacity: 0.3,
          scale: 0.65,
          duration: 0.2,
          ease: EASE.out,
        })
        .from(
          row.querySelectorAll('[data-entry-date], [data-entry-body]'),
          {
            opacity: 0,
            x: -12,
            duration: 0.5,
            ease: EASE.expo,
            stagger: STAGGER.base,
          },
          0.08,
        )
    })
  },
  { scope: root, respectReducedMotion: true },
)
</script>

<template>
  <section id="experience" ref="root" class="mx-auto max-w-7xl px-6 py-24 md:py-32">
    <h2
      class="font-display text-3xl font-semibold tracking-[-0.02em] text-fg md:text-4xl"
    >
      {{ heading }}
    </h2>

    <div data-timeline class="relative mt-14 lg:pl-[7rem]">
      <!-- Static rail remains visible beneath its scroll-drawn accent. -->
      <span
        aria-hidden="true"
        class="absolute bottom-0 left-1 top-0 w-px bg-border"
      ></span>
      <span
        data-spine
        aria-hidden="true"
        class="absolute bottom-0 left-1 top-0 w-px bg-accent"
      ></span>

      <ol class="flex flex-col gap-12">
        <li
          v-for="entry in entries"
          :key="entry.period + entry.title"
          data-entry
          class="relative grid grid-cols-1 gap-2 pl-7 lg:grid-cols-12 lg:gap-8 lg:pl-0"
        >
          <span
            data-entry-dot
            aria-hidden="true"
            class="absolute left-0 top-1.5 size-2.5 rounded-xs border border-accent bg-accent lg:-left-28"
          ></span>
          <p
            data-entry-date
            class="font-mono text-sm text-fg-muted lg:col-span-3 lg:-ml-[7rem] lg:pl-7"
          >
            {{ entry.period }}
          </p>

          <div data-entry-body class="lg:col-span-9">
            <h3 class="font-display text-lg font-medium tracking-[-0.01em] text-fg">
              {{ entry.title }}
              <span v-if="entry.org" class="text-fg-muted">, {{ entry.org }}</span>
            </h3>
            <p
              class="mt-3 max-w-[62ch] font-body text-base leading-relaxed text-fg-muted"
            >
              {{ entry.body }}
            </p>
            <ul
              v-if="entry.engagements?.length"
              class="mt-6 flex list-disc flex-col gap-6 pl-5 marker:text-fg-muted"
            >
              <li v-for="engagement in entry.engagements" :key="engagement.org">
                <h4 class="font-display text-base font-medium text-fg">
                  {{ engagement.org }}
                </h4>
                <p class="mt-1 font-mono text-xs text-fg-muted">
                  {{ engagement.period }}
                </p>
                <p class="mt-2 max-w-[62ch] text-base leading-relaxed text-fg-muted">
                  {{ engagement.body }}
                </p>
              </li>
            </ul>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>
