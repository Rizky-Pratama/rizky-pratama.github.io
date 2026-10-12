/**
 * Smoke tests: every section component mounts under jsdom and renders its
 * key element. Props are derived from the real `site.js` where easy, so this
 * doubles as an integration check between the content contract and the
 * components that consume it.
 *
 * --- On GSAP under jsdom ---------------------------------------------------
 * Every section runs GSAP onMounted (via useContextGsap / useReveal). Rather
 * than mock gsap, we let the REAL gsap run and shim only the browser globals
 * jsdom lacks (IntersectionObserver / matchMedia / ResizeObserver /
 * requestAnimationFrame) in src/test/setup.js. Verified: the real timeline
 * construction, ScrollTrigger.batch, and gsap.matchMedia all no-op cleanly in
 * jsdom with zero scroll/layout, so nothing throws and no production code is
 * touched. The tests assert RENDER (DOM structure), never animation state.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import { site } from '../data/site.js'

import SiteNav from './SiteNav.vue'
import HeroSection from './HeroSection.vue'
import SkillsSection from './SkillsSection.vue'
import ProjectsSection from './ProjectsSection.vue'
import ExperienceSection from './ExperienceSection.vue'
import AboutSection from './AboutSection.vue'
import ContactSection from './ContactSection.vue'
import SiteFooter from './SiteFooter.vue'

const s = site.sections

/** Mount, assert it did not throw, return the wrapper. */
function mountOk(component, props) {
  let wrapper
  expect(() => {
    wrapper = mount(component, { props })
  }).not.toThrow()
  return wrapper
}

describe('SiteNav', () => {
  const props = { name: site.name, nav: site.nav, ctaLabel: site.cta.label, ctaHref: site.cta.href }

  it('mounts and renders the primary nav with every anchor', () => {
    const w = mountOk(SiteNav, props)
    const nav = w.find('nav[aria-label="Primary"]')
    expect(nav.exists()).toBe(true)

    for (const item of site.nav) {
      expect(w.html(), `renders ${item.label}`).toContain(item.label)
      expect(w.find(`a[href="${item.href}"]`).exists(), `href ${item.href}`).toBe(true)
    }
  })

  it('falls back to the "Portfolio" wordmark when name is empty', () => {
    const w = mountOk(SiteNav, props)
    expect(site.name).toBe('')
    expect(w.find('a[href="#top"]').text()).toBe('Portfolio')
  })
})

describe('HeroSection', () => {
  const props = {
    eyebrow: s.hero.eyebrow,
    heading: s.hero.heading,
    subtext: s.hero.subheading,
    portrait: s.hero.portrait,
    ctaLabel: site.cta.label,
    ctaHref: site.cta.href,
    secondaryLabel: s.hero.secondary.label,
    secondaryHref: s.hero.secondary.href,
  }

  it('mounts, renders the H1 and the two CTAs', () => {
    const w = mountOk(HeroSection, props)
    expect(w.find('[data-hero-heading]').exists()).toBe(true)
    expect(w.find('h1').text()).toBe(s.hero.heading)
    expect(w.find('h1').text().trim().length).toBeGreaterThan(0)

    const ctas = w.findAll('[data-hero-cta]')
    expect(ctas).toHaveLength(2)
    expect(ctas[0].attributes('href')).toBe(site.cta.href)
  })

  it('renders the committed portrait asset', () => {
    const w = mountOk(HeroSection, props)
    const img = w.find('[data-hero-portrait]')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe(s.hero.portrait.alt)
    expect(img.attributes('src')).toBe(s.hero.portrait.src)
  })
})

describe('SkillsSection', () => {
  const props = { groups: s.skills.groups }

  it('mounts and renders all 4 group titles', () => {
    const w = mountOk(SkillsSection, props)
    const articles = w.findAll('article')
    expect(articles).toHaveLength(4)
    // Rendered text is entity-decoded ("Data & Infra"), unlike w.html().
    const text = w.text()
    for (const group of s.skills.groups) {
      expect(text, `title ${group.title}`).toContain(group.title)
    }
  })

  it('renders one TechChip per stack item (20 total), each with a local icon', () => {
    const w = mountOk(SkillsSection, props)
    const chips = w.findAll('[data-ui-chip]')
    expect(chips).toHaveLength(20)

    // Every chip resolves its icon to the committed local path.
    const imgs = w.findAll('[data-ui-chip] img')
    expect(imgs).toHaveLength(20)
    for (const img of imgs) {
      const src = img.attributes('src')
      expect(src).toMatch(/^\/icons\/[a-z0-9]+\.svg$/)
    }
  })
})

describe('ProjectsSection', () => {
  const props = { projects: s.projects, heading: s.work.heading, intro: s.work.intro }

  it('mounts and renders 4 case-study rows with outcome copy', () => {
    const w = mountOk(ProjectsSection, props)
    const rows = w.findAll('ol > li')
    expect(rows).toHaveLength(4)

    for (const project of s.projects) {
      expect(w.html(), `title ${project.title}`).toContain(project.title)
      // Outcome text is rendered in full.
      expect(w.html(), `outcome ${project.id}`).toContain(project.outcome)
      expect(w.find(`img[alt="${project.title} case study"]`).exists()).toBe(true)
    }
  })

  it('renders the section heading from props', () => {
    const w = mountOk(ProjectsSection, props)
    expect(w.find('#work-heading').text()).toBe(s.work.heading)
  })
})

describe('ExperienceSection', () => {
  const props = { heading: 'Experience', entries: s.experience }

  it('mounts and renders one dated row per entry', () => {
    const w = mountOk(ExperienceSection, props)
    const rows = w.findAll('[data-entry]')
    expect(rows).toHaveLength(s.experience.length)
    for (const entry of s.experience) {
      expect(w.html(), `period ${entry.period}`).toContain(entry.period)
      expect(w.html(), `title ${entry.title}`).toContain(entry.title)
    }
  })

  it('renders the spine element the scroll-draw animation targets', () => {
    const w = mountOk(ExperienceSection, props)
    expect(w.find('[data-spine]').exists()).toBe(true)
  })
})

describe('AboutSection', () => {
  const props = {
    heading: s.about.heading,
    body: s.about.body,
    now: s.about.now,
    readouts: s.about.readouts,
    portrait: s.about.portrait,
  }

  it('mounts and renders heading, body, Now list and readouts', () => {
    const w = mountOk(AboutSection, props)
    expect(w.find('#about-heading').text()).toBe(s.about.heading)
    expect(w.html()).toContain(s.about.body)
    for (const item of s.about.now) {
      expect(w.html(), `now item`).toContain(item)
    }
    for (const readout of s.about.readouts) {
      expect(w.html(), `readout label ${readout.label}`).toContain(readout.label)
    }
  })
})

describe('ContactSection', () => {
  const props = {
    heading: s.contact.heading,
    body: s.contact.body,
    email: site.email,
    cvHref: s.contact.secondary.href,
    links: s.contact.links,
    availability: site.availability,
    ctaLabel: site.cta.label,
    cvLabel: s.contact.secondary.label,
  }

  it('mounts and renders heading, availability pill and CTA buttons', () => {
    const w = mountOk(ContactSection, props)
    expect(w.find('#contact-heading').text()).toBe(s.contact.heading)
    expect(w.html()).toContain(site.availability)
    expect(w.html()).toContain(site.cta.label)

    const buttons = w.findAll('[data-ui-btn]')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
    // Primary CTA is a mailto link to the configured email.
    expect(w.find(`a[href="mailto:${site.email}"]`).exists()).toBe(true)
  })

  it('renders every contact link with its icon glyph', () => {
    const w = mountOk(ContactSection, props)
    for (const link of s.contact.links) {
      expect(w.find(`a[href="${link.href}"]`).exists(), `link ${link.href}`).toBe(true)
    }
    // One inline svg path per link.
    const paths = w.findAll('ul a svg path')
    expect(paths).toHaveLength(s.contact.links.length)
  })
})

describe('SiteFooter', () => {
  const props = {
    name: site.name,
    role: site.role,
    location: site.location,
    social: site.social,
    nav: site.nav,
    email: site.email,
    colophon: s.footer.colophon,
    legal: s.footer.legal,
    copyright: s.footer.copyright,
  }

  it('mounts and renders the sitemap nav plus the back-to-top control', () => {
    const w = mountOk(SiteFooter, props)
    expect(w.find('nav[aria-label="Footer"]').exists()).toBe(true)
    for (const item of site.nav) {
      expect(w.find(`nav[aria-label="Footer"] a[href="${item.href}"]`).exists()).toBe(true)
    }
    expect(w.find('a[href="#main"]').exists()).toBe(true)
  })

  it('renders the pre-composed copyright string', () => {
    const w = mountOk(SiteFooter, props)
    expect(w.html()).toContain(s.footer.copyright)
  })
})
