/**
 * Contract tests for `src/data/site.js`.
 *
 * `site.js` is the content source of truth: App.vue and every section
 * component destructure it assuming these keys/shapes exist. These tests pin
 * the SHAPE (a contract), not the placeholder VALUES, plus two real hygiene
 * guards the project enforces:
 *   1. every configured Iconify name has committed offline data
 *   2. no em-dash or en-dash anywhere in the serialized site object
 */
import { describe, it, expect } from 'vitest'
import { icons } from './icons.js'

import { site, UNRESOLVED } from './site.js'


describe('site identity + cta', () => {
  it('name is a string (may be empty: identity is intentionally neutral)', () => {
    expect(typeof site.name).toBe('string')
  })

  it('cta.label is a non-empty string and cta.href is set', () => {
    expect(typeof site.cta.label).toBe('string')
    expect(site.cta.label.trim().length).toBeGreaterThan(0)
    expect(typeof site.cta.href).toBe('string')
    expect(site.cta.href.trim().length).toBeGreaterThan(0)
  })
})

describe('site.nav', () => {
  it('is an array of {label, href} with #-anchor hrefs', () => {
    expect(Array.isArray(site.nav)).toBe(true)
    expect(site.nav.length).toBeGreaterThan(0)

    for (const item of site.nav) {
      expect(item, 'nav item is an object').toBeTypeOf('object')
      expect(typeof item.label).toBe('string')
      expect(item.label.trim().length).toBeGreaterThan(0)
      expect(typeof item.href).toBe('string')
      // Anchors only, so SiteNav's IntersectionObserver can querySelector them.
      expect(item.href.startsWith('#')).toBe(true)
      expect(item.href.length).toBeGreaterThan(1)
    }
  })
})

describe('site.sections', () => {
  it('exposes every section key the page renders', () => {
    const required = ['hero', 'skills', 'projects', 'experience', 'about', 'contact', 'footer']
    for (const key of required) {
      expect(site.sections, `sections.${key} exists`).toHaveProperty(key)
    }
  })

  it('hero carries eyebrow/heading/subheading and a portrait with src', () => {
    const hero = site.sections.hero
    expect(typeof hero.eyebrow).toBe('string')
    expect(typeof hero.heading).toBe('string')
    expect(hero.heading.trim().length).toBeGreaterThan(0)
    expect(typeof hero.subheading).toBe('string')
    expect(hero.portrait).toBeTypeOf('object')
    expect(hero.portrait.src).toMatch(/^\/images\//)
    expect(typeof hero.portrait.alt).toBe('string')
    // secondary CTA anchor used by the hero template
    expect(hero.secondary.href.startsWith('#')).toBe(true)
  })

  it('contact carries heading, body, links[] and a note', () => {
    const contact = site.sections.contact
    expect(typeof contact.heading).toBe('string')
    expect(typeof contact.body).toBe('string')
    expect(Array.isArray(contact.links)).toBe(true)
    expect(contact.links.length).toBeGreaterThan(0)
    for (const link of contact.links) {
      expect(typeof link.label).toBe('string')
      expect(typeof link.href).toBe('string')
      expect(typeof link.icon).toBe('string')
    }
  })
})

describe('projects', () => {
  it('is a 4-item array, each with the full case-study shape', () => {
    const projects = site.sections.projects
    expect(Array.isArray(projects)).toBe(true)
    expect(projects).toHaveLength(4)

    for (const p of projects) {
      expect(typeof p.id).toBe('string')
      expect(p.id.trim().length).toBeGreaterThan(0)
      expect(typeof p.title).toBe('string')
      expect(Array.isArray(p.stack)).toBe(true)
      expect(p.stack.length).toBeGreaterThan(0)
      expect(p.stack.every((s) => typeof s === 'string')).toBe(true)
      // outcome is the one-line result ProjectsSection renders in full fg
      expect(typeof p.outcome).toBe('string')
      expect(p.outcome.trim().length).toBeGreaterThan(0)
      // imageSeed selects a committed local asset in ProjectsSection
      expect(typeof p.imageSeed).toBe('string')
      expect(p.imageSeed.trim().length).toBeGreaterThan(0)
    }

    // ids are unique (used as :key)
    const ids = projects.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('skills groups', () => {
  it('has nonempty skill groups with Iconify names', () => {
    const groups = site.sections.skills.groups
    expect(Array.isArray(groups)).toBe(true)
    expect(groups.length).toBeGreaterThan(0)

    for (const group of groups) {
      expect(typeof group.id).toBe('string')
      expect(typeof group.title).toBe('string')
      expect(typeof group.blurb).toBe('string')
      expect(Array.isArray(group.stack)).toBe(true)
      expect(group.stack.length).toBeGreaterThan(0)

      for (const tech of group.stack) {
        expect(typeof tech.name).toBe('string')
        expect(tech.name.trim().length).toBeGreaterThan(0)
        expect(typeof tech.icon).toBe('string')
        // A skill without an available local logo renders as text.
      }
    }
  })

  it('resolves every configured UI, technology, and contact icon locally', () => {
    const names = [...Object.values(site.icons), ...site.sections.skills.groups.flatMap((g) => g.stack.map((t) => t.icon)), ...site.sections.contact.links.map((link) => link.icon)]
    for (const name of names) {
      expect(icons[name], name).toBeDefined()
      expect(icons[name].body.length).toBeGreaterThan(0)
    }
    expect(new Set(names)).toEqual(new Set(Object.keys(icons)))
  })
})

describe('about readouts', () => {
  it('has readouts as {value, label} pairs', () => {
    const readouts = site.sections.about.readouts
    expect(Array.isArray(readouts)).toBe(true)
    expect(readouts.length).toBeGreaterThan(0)
    for (const r of readouts) {
      expect(typeof r.value).toBe('string')
      expect(typeof r.label).toBe('string')
      expect(r.label.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('UNRESOLVED convention', () => {
  it('is the "--" string the UI renders for {TOKEN} values', () => {
    expect(typeof UNRESOLVED).toBe('string')
    expect(UNRESOLVED).toBe('--')
  })
})

describe('copy hygiene', () => {
  it('contains no em-dash (U+2014) or en-dash (U+2013) anywhere', () => {
    const serialized = JSON.stringify(site)
    expect(serialized.includes('\u2014')).toBe(false)
    expect(serialized.includes('\u2013')).toBe(false)
  })
})
