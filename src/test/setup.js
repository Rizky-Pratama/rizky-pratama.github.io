/**
 * Vitest global setup for jsdom.
 *
 * jsdom implements none of: IntersectionObserver, matchMedia, ResizeObserver,
 * requestAnimationFrame. The section components use all of them on mount
 * (SiteNav builds IntersectionObserver sentinels; useReducedMotion and
 * useReveal call matchMedia; SiteNav calls requestAnimationFrame). These
 * shims let the components MOUNT under jsdom so the smoke tests can assert on
 * the rendered DOM without touching production code.
 */

// --- matchMedia ---------------------------------------------------------
// useReducedMotion()/useReveal() only ever match the two motion queries.
// Return matches:false so the "no-preference" branch is taken and the
// animations are attempted through the real (mocked) gsap, never blowing up.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// --- IntersectionObserver ----------------------------------------------
// A no-op observer: construction and observe() must not throw. Callbacks are
// never fired, which is fine: we assert render, not intersection state.
if (typeof globalThis.IntersectionObserver !== 'function') {
  class IntersectionObserverStub {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  }
  globalThis.IntersectionObserver = IntersectionObserverStub
  if (typeof window !== 'undefined') window.IntersectionObserver = IntersectionObserverStub
}

// --- ResizeObserver -----------------------------------------------------
if (typeof globalThis.ResizeObserver !== 'function') {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserverStub
  if (typeof window !== 'undefined') window.ResizeObserver = ResizeObserverStub
}

// --- requestAnimationFrame ---------------------------------------------
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
  if (typeof window !== 'undefined') {
    window.requestAnimationFrame = globalThis.requestAnimationFrame
    window.cancelAnimationFrame = globalThis.cancelAnimationFrame
  }
}
