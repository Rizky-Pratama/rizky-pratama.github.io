<script setup>
import AppIcon from './AppIcon.vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useContextGsap, EASE } from '../composables/useGsap'

const props = defineProps({
  icon: { type: String, default: '' },
  name: { type: String, default: '' },
  nav: { type: Array, default: () => [] },
  ctaLabel: { type: String, default: 'Start a conversation' },
  ctaHref: { type: String, default: '#' },
})

const root = ref(null)
const scrolled = ref(false)
const menuOpen = ref(false)
const activeHref = ref('')
const linkEls = ref({})
const indicator = ref({ x: 0, width: 0, ready: false })

const setLinkEl = (href) => (el) => {
  if (el) linkEls.value[href] = el
}

const moveIndicator = () => {
  const el = linkEls.value[activeHref.value]
  const bar = root.value
  if (!el || !bar) {
    indicator.value = { ...indicator.value, ready: false }
    return
  }
  const elRect = el.getBoundingClientRect()
  const barRect = bar.getBoundingClientRect()
  indicator.value = {
    x: elRect.left - barRect.left,
    width: elRect.width,
    ready: true,
  }
}

const onResize = () => moveIndicator()

const closeMenu = () => {
  menuOpen.value = false
}

const onKeydown = (event) => {
  if (event.key === 'Escape' && menuOpen.value) closeMenu()
}

let sectionObserver
let sentinelObserver

const observeSections = () => {
  const targets = props.nav
    .map((item) => document.querySelector(item.href))
    .filter(Boolean)
  if (!targets.length) return

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeHref.value = `#${entry.target.id}`
        }
      })
      moveIndicator()
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  targets.forEach((target) => sectionObserver.observe(target))
}

// The scrim is driven by an IntersectionObserver sentinel at the very top of
// the document rather than a scroll listener, which is a hard ban here.
const observeSentinel = () => {
  const sentinel = document.createElement('div')
  sentinel.setAttribute('aria-hidden', 'true')
  sentinel.style.cssText =
    'position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none;'
  document.body.prepend(sentinel)

  sentinelObserver = new IntersectionObserver(
    ([entry]) => {
      scrolled.value = !entry.isIntersecting
    },
    { threshold: 0 },
  )
  sentinelObserver.observe(sentinel)
}

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('keydown', onKeydown)
  observeSentinel()
  observeSections()
  requestAnimationFrame(moveIndicator)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('keydown', onKeydown)
  sectionObserver?.disconnect()
  sentinelObserver?.disconnect()
})

// Entrance slide (once) + the active-link underline travels with a single
// transform. No GSAP matchMedia here: this is one-shot load motion and the
// travelling underline, neither of which scrubs or repeats.
useContextGsap(
  ({ gsap, el }) => {
    const bar = el.querySelector('[data-nav-bar]')
    if (!bar) return
    gsap.from(bar, {
      y: -8,
      opacity: 0,
      duration: 0.4,
      ease: EASE.out,
      delay: 0.1,
    })
  },
  { scope: root },
)

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicator.value.x}px)`,
  width: `${indicator.value.width}px`,
  opacity: indicator.value.ready && activeHref.value ? 1 : 0,
  transition: `transform var(--dur-modal) var(--ease-out-strong), width var(--dur-modal) var(--ease-out-strong), opacity var(--dur-pop) var(--ease-out-strong)`,
}))

const wordmark = computed(() =>
  props.name && props.name.trim() ? props.name : 'Portfolio',
)
</script>

<template>
  <header
    ref="root"
    class="fixed inset-x-0 top-0 z-40"
    :class="
      scrolled || menuOpen
        ? 'nav-scrim border-b border-border'
        : 'border-b border-transparent'
    "
    style="box-sizing: border-box; height: 68px"
  >
    <nav
      data-nav-bar
      aria-label="Primary"
      class="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-6 lg:pl-[4vw]"
    >
      <a
        href="#top"
        class="max-w-[65%] font-display text-sm font-semibold tracking-tight text-fg transition-colors duration-200 ease-out-strong hover:text-accent"
      >
        {{ wordmark }}
      </a>

      <div class="hidden items-center gap-4 lg:flex">
        <div class="relative flex items-center gap-4">
          <a
            v-for="item in nav"
            :key="item.href"
            :ref="setLinkEl(item.href)"
            :href="item.href"
            class="relative font-mono text-sm text-fg-muted transition-colors duration-150 ease-out-strong hover:text-fg focus-visible:text-fg"
            :class="activeHref === item.href ? 'text-fg' : ''"
            :aria-current="activeHref === item.href ? 'true' : undefined"
          >
            {{ item.label }}
          </a>

          <span
            aria-hidden="true"
            class="pointer-events-none absolute bottom-[-6px] left-0 h-px bg-accent"
            :style="indicatorStyle"
          />
        </div>

        <a
          :href="ctaHref"
          class="rounded-sm bg-accent px-4 py-2 font-body text-sm font-medium text-on-accent transition-colors duration-160 ease-out-strong hover:bg-accent-press active:scale-[0.97]"
        >
          {{ ctaLabel }}
        </a>
      </div>

      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-sm text-fg transition-colors duration-150 ease-out-strong hover:bg-surface-2 lg:hidden"
        :aria-expanded="menuOpen ? 'true' : 'false'"
        aria-controls="mobile-menu"
        aria-label="Menu"
        @click="menuOpen = !menuOpen"
      >
        <AppIcon :name="props.icon" />
      </button>
    </nav>

    <div
      id="mobile-menu"
      class="absolute inset-x-0 top-[68px] border-y border-border bg-surface lg:hidden"
      :class="menuOpen ? 'visible' : 'invisible pointer-events-none'"
      :style="{
        transition: menuOpen
          ? `transform var(--dur-modal) var(--ease-drawer), opacity var(--dur-pop) var(--ease-out-strong), visibility 0s`
          : `transform var(--dur-modal) var(--ease-drawer), opacity var(--dur-pop) var(--ease-out-strong), visibility 0s var(--dur-modal)`,
        transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
        opacity: menuOpen ? 1 : 0,
      }"
      :aria-hidden="menuOpen ? 'false' : 'true'"
    >
      <ul class="flex flex-col gap-1 px-6 py-4">
        <li
          v-for="(item, i) in nav"
          :key="item.href"
          :style="{
            transition: `transform var(--dur-pop) var(--ease-out-strong), opacity var(--dur-pop) var(--ease-out-strong)`,
            transitionDelay: menuOpen ? `${i * 40}ms` : '0ms',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
            opacity: menuOpen ? 1 : 0,
          }"
        >
          <a
            :href="item.href"
            class="block py-2 font-mono text-base text-fg-muted transition-colors duration-150 ease-out-strong hover:text-fg"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
        </li>
        <li class="pt-2">
          <a
            :href="ctaHref"
            class="block rounded-sm bg-accent px-4 py-2 text-center font-body text-sm font-medium text-on-accent active:scale-[0.97]"
            @click="closeMenu"
          >
            {{ ctaLabel }}
          </a>
        </li>
      </ul>
    </div>
  </header>
</template>
