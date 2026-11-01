<script setup>
/** Full project screenshots with scroll reveals and a shared accessible image viewer. */
import { ref } from 'vue'
import { useReveal } from '../composables/useGsap.js'
import ImageViewer from './ImageViewer.vue'

const props = defineProps({
  viewerLabels: { type: Object, required: true },
  projects: { type: Array, default: () => [] },
  heading: { type: String, default: 'Selected work' },
  intro: { type: String, default: '' },
})

const root = ref(null)
const viewer = ref(null)

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
          <ul v-if="project.links?.length" class="flex flex-wrap gap-4">
            <li v-for="link in project.links" :key="link.href">
              <a
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-11 items-center text-sm text-fg underline underline-offset-4 hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
                >{{ link.label }}</a
              >
            </li>
          </ul>
        </div>

        <!-- Right: image, offset down at lg for rhythm (not alternation). -->
        <div class="lg:col-span-4 lg:mt-8">
          <button
            type="button"
            :aria-label="project.imageLabel"
            class="block w-full cursor-zoom-in overflow-hidden rounded-md border border-border bg-surface hover:border-accent"
            @click="viewer.open(project, $event.currentTarget)"
          >
            <img
              :src="project.image"
              :alt="project.imageAlt"
              :width="project.imageWidth"
              :height="project.imageHeight"
              loading="lazy"
              decoding="async"
              class="project-screenshot h-auto w-full"
            />
          </button>
        </div>
      </li>
    </ol>
    <ImageViewer ref="viewer" :labels="props.viewerLabels" />
  </section>
</template>
