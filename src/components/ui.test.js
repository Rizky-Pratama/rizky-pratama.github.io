/**
 * Tests for the shared presentational primitives in `src/components/ui.js`.
 *
 * These are plain `defineComponent` render functions (no SFC loader needed).
 * We assert the real contracts the sections rely on:
 *   - AppButton is an <a> when href is set, else a <button>, with the right
 *     disabled/external-target handling.
 *   - TechChip points its icon at the committed local asset
 *     `/icons/${slug}.svg` (never a CDN), and is an <a> only with an href.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { AppButton, TechChip } from './ui.js'

describe('AppButton', () => {
  it('renders an <a> when href is set', () => {
    const w = mount(AppButton, { props: { label: 'Contact', href: 'mailto:x@y.z' } })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('mailto:x@y.z')
    expect(w.text()).toBe('Contact')
    expect(w.attributes('data-ui-btn')).toBeDefined()
  })

  it('renders a <button> when no href is given', () => {
    const w = mount(AppButton, { props: { label: 'Click' } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('type')).toBe('button')
  })

  it('adds noopener noreferrer + _blank for external http links', () => {
    const w = mount(AppButton, { props: { label: 'GitHub', href: 'https://github.com/x' } })
    expect(w.attributes('target')).toBe('_blank')
    expect(w.attributes('rel')).toBe('noopener noreferrer')
  })

  it('marks aria-disabled and falls back to <button> when disabled with an href', () => {
    const w = mount(AppButton, { props: { label: 'Nope', href: '#x', disabled: true } })
    expect(w.element.tagName).toBe('BUTTON')
    expect(w.attributes('aria-disabled')).toBe('true')
  })

  it('renders the download icon svg only when icon="download"', () => {
    const withIcon = mount(AppButton, {
      props: { label: 'CV', href: '/cv.pdf', icon: 'download' },
    })
    expect(withIcon.find('svg').exists()).toBe(true)

    const without = mount(AppButton, { props: { label: 'CV', href: '/cv.pdf' } })
    expect(without.find('svg').exists()).toBe(false)
  })

  it('applies the requested variant class', () => {
    const ghost = mount(AppButton, { props: { label: 'X', variant: 'ghost' } })
    expect(ghost.classes()).toContain('bg-transparent')
  })
})

describe('TechChip', () => {
  it('renders a <span> and points the icon at the local committed path', () => {
    const w = mount(TechChip, { props: { name: 'Vue 3', slug: 'vuedotjs' } })
    expect(w.element.tagName).toBe('SPAN')
    expect(w.attributes('data-ui-chip')).toBeDefined()
    expect(w.find('img').attributes('src')).toBe('/icons/vuedotjs.svg')
    expect(w.text()).toBe('Vue 3')
    expect(w.find('[data-ui-chip-label]').exists()).toBe(true)
  })

  it('renders an <a> with safe rel for external hrefs', () => {
    const w = mount(TechChip, {
      props: { name: 'Vue 3', slug: 'vuedotjs', href: 'https://vuejs.org' },
    })
    expect(w.element.tagName).toBe('A')
    expect(w.attributes('href')).toBe('https://vuejs.org')
    expect(w.attributes('target')).toBe('_blank')
    expect(w.attributes('rel')).toBe('noopener noreferrer')
  })

  it('renders no broken icon src when slug is empty', () => {
    const w = mount(TechChip, { props: { name: 'Mystery' } })
    // Empty slug -> empty src, so no stray request for /icons/.svg
    expect(w.find('img').attributes('src')).toBe('')
  })
})
