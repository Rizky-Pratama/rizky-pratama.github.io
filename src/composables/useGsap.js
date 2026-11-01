import { onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { SplitText } from 'gsap/SplitText'

/**
 * Register plugins exactly once for the lifetime of the app.
 * GSAP's registerPlugin is idempotent, and a module body only evaluates once,
 * so this is the SINGLE registration point for the project. Do not register
 * plugins anywhere else.
 *
 * NOTE: Flip and SplitText are both bundled in the free gsap package as of
 * the installed version (3.15). No Club membership is required.
 */
let registered = false
if (!registered) {
  gsap.registerPlugin(ScrollTrigger, Flip, SplitText)
  registered = true
}

/**
 * Named easing presets. These deliberately mirror the CSS custom properties
 * in style.css (--ease-out-strong etc.) so JS and CSS motion share one feel.
 * GSAP power/expo easings are the closest built-in equivalents.
 */
export const EASE = {
  out: 'power3.out', // ~ cubic-bezier(0.23, 1, 0.32, 1)
  expo: 'expo.out', // ~ cubic-bezier(0.16, 1, 0.3, 1)
  inOut: 'power2.inOut', // ~ cubic-bezier(0.77, 0, 0.175, 1)
  none: 'none', // scroll-scrub only
}

/** Duration presets (seconds, GSAP units). UI motion stays well under 300ms. */
export const DUR = {
  press: 0.16,
  pop: 0.2,
  modal: 0.25,
  reveal: 0.6,
  hero: 0.8,
}

/** Stagger presets (seconds). Kept in the 30-80ms band. */
export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  list: 0.08,
  loose: 0.1,
}

/**
 * Primary GSAP accessor for components.
 *
 * @returns {{ gsap: typeof gsap, ScrollTrigger: typeof ScrollTrigger, Flip: typeof Flip, SplitText: typeof SplitText }}
 *
 * @example
 * const { gsap } = useGsap()
 */
export function useGsap() {
  return { gsap, ScrollTrigger, Flip, SplitText }
}

/**
 * Reactive `prefers-reduced-motion: reduce` flag.
 *
 * SSR-safe: the media query is only touched on mount, and the listener
 * is torn down on unmount. `matches` is `false` until mounted on the client.
 *
 * @returns {{ matches: import('vue').Ref<boolean>, prefersReducedMotion: import('vue').Ref<boolean> }}
 *
 * @example
 * const { prefersReducedMotion } = useReducedMotion()
 * if (!prefersReducedMotion.value) { gsap.from(el, { y: 40, opacity: 0 }) }
 */
export function useReducedMotion() {
  const matches = ref(false)

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const update = (event) => {
      matches.value = event.matches
    }

    onMounted(() => {
      matches.value = mediaQuery.matches
      mediaQuery.addEventListener('change', update)
    })

    onBeforeUnmount(() => {
      mediaQuery.removeEventListener('change', update)
    })
  }

  return { matches, prefersReducedMotion: matches }
}

/**
 * Scoped gsap.context wrapper for bespoke (multi-step) section timelines.
 *
 * Every animation created inside `setupFn` is scoped to `scope` and reverted
 * automatically on unmount, so no selector leaks across components.
 *
 * IMPORTANT: this composable owns reduced-motion gating for the animations it
 * creates. Use `setupFn` to build two animations via `gsap.matchMedia()`, or
 * gate manually. Section components must NOT register their own matchMedia.
 *
 * @param {(ctx: { gsap: typeof gsap, ScrollTrigger: typeof ScrollTrigger, el: HTMLElement }) => void} setupFn
 * @param {{ scope?: import('vue').Ref<HTMLElement | null> }} [options]
 * @returns {{ refresh: () => void }}
 *
 * @example
 * const root = ref(null)
 * useContextGsap(({ gsap, el }) => {
 *   const mm = gsap.matchMedia()
 *   mm.add('(prefers-reduced-motion: no-preference)', () => {
 *     gsap.from(el.querySelectorAll('[data-reveal]'), {
 *       opacity: 0, y: 16, duration: DUR.reveal, ease: EASE.expo, stagger: STAGGER.list,
 *     })
 *   })
 * }, { scope: root })
 */
export function useContextGsap(setupFn, options = {}) {
  let ctx

  onMounted(() => {
    const el = options.scope?.value ?? document.body
    ctx = gsap.context(() => {
      setupFn({ gsap, ScrollTrigger, el })
    }, el)
  })

  onBeforeUnmount(() => {
    ctx?.revert()
  })

  return {
    refresh: () => ctx?.refresh(),
  }
}

/**
 * Scroll-reveal helper. Batches elements as they enter the viewport and
 * animates them in with a stagger. This is the SINGLE matchMedia owner for
 * reveal motion: it registers its own reduced-motion branch, so sections
 * only pass config and never touch matchMedia themselves.
 *
 * No-JS / SEO safe: elements are only hidden after mount, so with JS disabled
 * the content renders visible.
 *
 * @param {object} config
 * @param {() => (HTMLElement | null)} config.root      - container accessor
 * @param {string} [config.selector="[data-reveal]"]    - items to reveal
 * @param {{ x?: number, y?: number }} [config.from]    - start offset
 * @param {number} [config.stagger=STAGGER.list]        - per-item delay (s)
 * @param {number} [config.duration=DUR.reveal]         - seconds
 * @param {string} [config.ease=EASE.expo]              - easing preset
 * @param {string} [config.start="top 85%"]             - ScrollTrigger start
 * @returns {{ kill: () => void }}
 *
 * @example
 * useReveal({ root: () => root.value, selector: '[data-reveal]' })
 */
export function useReveal(config) {
  const {
    root,
    selector = '[data-reveal]',
    from: offset = { y: 20 },
    stagger = STAGGER.list,
    duration = DUR.reveal,
    ease = EASE.expo,
    start = 'top 85%',
  } = config

  let mm
  let triggers = []

  onMounted(() => {
    const container = root?.()
    if (!container) return

    const items = gsap.utils.toArray(container.querySelectorAll(selector))
    if (!items.length) return

    mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(items, { opacity: 0, ...offset })

      triggers = ScrollTrigger.batch(items, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            x: 0,
            y: 0,
            duration,
            ease,
            stagger,
            overwrite: true,
          }),
      })
    })

    // Reduced motion: jump straight to the final, readable state.
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(items, { opacity: 1, x: 0, y: 0, clearProps: 'transform' })
    })
  })

  onBeforeUnmount(() => {
    triggers.forEach((t) => t.kill())
    triggers = []
    mm?.revert()
  })

  return {
    kill: () => {
      triggers.forEach((t) => t.kill())
      triggers = []
      mm?.revert()
    },
  }
}

export default useGsap
