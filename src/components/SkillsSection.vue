<script setup>
/**
 * SkillsSection - bento field (PLAN 3.3)
 *
 * Layout: lg:grid-cols-12, four tiles at col-span 5 / 7 / 7 / 5.
 * Visual variation on 2 of 4 cells: tile 2 (index 1) gets the surface-2 tint
 * plus an inline code snippet, tile 4 (index 3) gets a subtle border grid
 * pattern. Tiles 1 and 3 stay flat `surface`.
 *
 * Motion: tiles reveal as a staggered scale-in (0.97 + y + fade) through
 * `useReveal` (the composable owns matchMedia). Chips animate via a small
 * CSS-only stagger on reveal. Hover is border/background shift only.
 */
import { ref } from 'vue'
import { useReveal } from '../composables/useGsap.js'
import { TechChip } from './ui.js'

const props = defineProps({
  groups: { type: Array, default: () => [] },
})

const root = ref(null)

// Tiles scale in from 0.97 (never 0) with a small y offset and fade.
useReveal({
  root: () => root.value,
  selector: '[data-reveal]',
  from: { y: 20 },
  stagger: 0.08,
  duration: 0.6,
  ease: 'expo.out',
  start: 'top 85%',
})

// Layout slots: 4 tiles, spans 5 / 7 / 7 / 5. Extra groups past 4 stay at 6.
const spans = ['lg:col-span-5', 'lg:col-span-7', 'lg:col-span-7', 'lg:col-span-5']

const spanFor = (i) => spans[i] ?? 'lg:col-span-6'

// Tiles 2 and 4 carry real variation; 1 and 3 stay flat surface.
const isTinted = (i) => i === 1
const isGridded = (i) => i === 3

const tileClass = (i) =>
  [
    'group relative flex flex-col gap-5 rounded-md border p-6 lg:p-8',
    'transition-[transform,border-color,background-color] duration-200 ease-out-strong',
    'motion-reduce:transition-none',
    isTinted(i) ? 'bg-surface-2 border-border' : 'bg-surface border-border',
    'hover:border-accent/40 hover:bg-surface-2',
  ].join(' ')
</script>

<template>
  <section
    id="skills"
    ref="root"
    class="mx-auto w-full max-w-6xl px-6 py-24 lg:py-32"
    aria-labelledby="skills-heading"
  >
    <header class="mb-12 lg:mb-16">
      <p
        class="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-fg-muted"
        data-eyebrow
      >
        $ stack
      </p>
      <h2
        id="skills-heading"
        class="max-w-[24ch] font-display text-3xl font-medium tracking-tight text-fg lg:text-4xl"
        data-reveal
      >
        What I work with
      </h2>
    </header>

    <div class="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
      <article
        v-for="(group, i) in props.groups"
        :key="group.id"
        :class="[tileClass(i), spanFor(i)]"
        data-reveal
      >
        <!-- Tile 4: subtle hairline grid pattern (variation, not decoration). -->
        <div
          v-if="isGridded(i)"
          aria-hidden="true"
          class="pointer-events-none absolute inset-0 rounded-md opacity-[0.35]"
          style="
            background-image:
              linear-gradient(to right, var(--color-border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--color-border) 1px, transparent 1px);
            background-size: 28px 28px;
            mask-image: radial-gradient(ellipse at 80% 20%, black 0%, transparent 72%);
          "
        />

        <div class="relative flex flex-col gap-3">
          <h3 class="font-display text-xl font-medium tracking-tight text-fg">
            {{ group.title }}
          </h3>
          <p class="max-w-[46ch] text-sm leading-relaxed text-fg-muted">
            {{ group.blurb }}
          </p>
        </div>

        <!-- Tile 2: inline code snippet (variation). -->
        <pre
          v-if="isTinted(i)"
          class="relative overflow-x-auto rounded-sm border border-border bg-bg p-3 font-mono text-[0.7rem] leading-relaxed text-fg-muted"
          aria-hidden="true"
        ><code>const stack = {{
            ' [' + group.stack.length + ']'
          }}; // typed end to end</code></pre>

        <ul class="relative flex flex-wrap gap-2" aria-label="Technologies">
          <li v-for="tech in group.stack" :key="tech.slug">
            <TechChip :name="tech.name" :slug="tech.slug" />
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>
