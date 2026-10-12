/**
 * Tests for `src/composables/useGsap.js`.
 *
 * Covers the three exported preset objects (the motion system's locked
 * vocabulary) and the `useGsap()` plugin accessor. The preset assertions are
 * intentionally exact: EASE mirrors the CSS custom properties in style.css,
 * and the duration/stagger bands are design constraints the project claims
 * ("UI motion stays well under 300ms", stagger kept in the 30-80ms band).
 */
import { describe, it, expect } from 'vitest'

import { EASE, DUR, STAGGER, useGsap } from './useGsap.js'

describe('EASE presets', () => {
  it('locks exactly the four curves the design system names', () => {
    expect(EASE).toEqual({
      out: 'power3.out',
      expo: 'expo.out',
      inOut: 'power2.inOut',
      none: 'none',
    })
  })

  it('every easing is a non-empty string', () => {
    for (const [key, value] of Object.entries(EASE)) {
      expect(typeof value, `EASE.${key}`).toBe('string')
      expect(value.length, `EASE.${key}`).toBeGreaterThan(0)
    }
  })
})

describe('DUR presets', () => {
  it('exposes the five named durations as numbers', () => {
    expect(Object.keys(DUR).sort()).toEqual(
      ['hero', 'modal', 'pop', 'press', 'reveal'].sort(),
    )
    for (const [key, value] of Object.entries(DUR)) {
      expect(typeof value, `DUR.${key}`).toBe('number')
      expect(Number.isFinite(value), `DUR.${key} finite`).toBe(true)
      expect(value, `DUR.${key} positive`).toBeGreaterThan(0)
    }
  })

  it('keeps UI-interaction durations under 300ms', () => {
    // press/pop/modal are the synchronous UI micro-interactions.
    for (const key of ['press', 'pop', 'modal']) {
      expect(DUR[key], `DUR.${key} < 0.3s`).toBeLessThan(0.3)
    }
  })

  it('keeps all durations in a sane range (0 - 1.5s)', () => {
    for (const [key, value] of Object.entries(DUR)) {
      expect(value, `DUR.${key}`).toBeLessThanOrEqual(1.5)
    }
  })
})

describe('STAGGER presets', () => {
  it('exposes the four named staggers as numbers', () => {
    expect(Object.keys(STAGGER).sort()).toEqual(
      ['base', 'list', 'loose', 'tight'].sort(),
    )
    for (const [key, value] of Object.entries(STAGGER)) {
      expect(typeof value, `STAGGER.${key}`).toBe('number')
      expect(value, `STAGGER.${key} >= 0.03`).toBeGreaterThanOrEqual(0.03)
      expect(value, `STAGGER.${key} <= 0.1`).toBeLessThanOrEqual(0.1)
    }
  })

  it('keeps the core 0.03-0.08s band for tight/base/list', () => {
    for (const key of ['tight', 'base', 'list']) {
      expect(STAGGER[key], `STAGGER.${key}`).toBeGreaterThanOrEqual(0.03)
      expect(STAGGER[key], `STAGGER.${key}`).toBeLessThanOrEqual(0.08)
    }
  })
})

describe('useGsap()', () => {
  it('returns gsap plus the three registered plugins, all truthy', () => {
    const api = useGsap()

    expect(api.gsap, 'gsap').toBeTruthy()
    expect(api.ScrollTrigger, 'ScrollTrigger').toBeTruthy()
    expect(api.Flip, 'Flip').toBeTruthy()
    expect(api.SplitText, 'SplitText').toBeTruthy()

    // gsap is the real library object, not an empty stub.
    expect(typeof api.gsap.to).toBe('function')
    expect(typeof api.gsap.timeline).toBe('function')
    expect(typeof api.gsap.registerPlugin).toBe('function')
  })

  it('registers the plugins so they are usable off the gsap instance', () => {
    // registerPlugin happened at module load; re-calling is idempotent and
    // must not throw (this guards the "registered once" contract).
    const { gsap, ScrollTrigger, Flip, SplitText } = useGsap()
    expect(() => gsap.registerPlugin(ScrollTrigger, Flip, SplitText)).not.toThrow()
  })
})
