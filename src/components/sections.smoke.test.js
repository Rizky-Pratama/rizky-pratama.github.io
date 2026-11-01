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
  const props = { icon: site.icons.menu, name: site.name, nav: site.nav, ctaLabel: site.cta.label, ctaHref: site.cta.href }

  it('mounts and renders the primary nav with every anchor', () => {
    const w = mountOk(SiteNav, props)
    const nav = w.find('nav[aria-label="Primary"]')
    expect(nav.exists()).toBe(true)

    for (const item of site.nav) {
      expect(w.html(), `renders ${item.label}`).toContain(item.label)
      expect(w.find(`a[href="${item.href}"]`).exists(), `href ${item.href}`).toBe(true)
    }
  })

  it('renders the personalized wordmark', () => {
    const w = mountOk(SiteNav, props)
    expect(site.name).toBe('Muhammad Rizky Pratama')
    expect(w.find('a[href="#top"]').text()).toBe(site.name)
  })
})

describe('HeroSection', () => {
  const props = {
    icon: site.icons.arrowDown,
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
    const img = w.find('[data-hero-portrait] img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('alt')).toBe(s.hero.portrait.alt)
    expect(img.attributes('src')).toBe(s.hero.portrait.src)
  })
})

describe('SkillsSection', () => {
  const props = { groups: s.skills.groups }

  it('mounts and renders all group titles', () => {
    const w = mountOk(SkillsSection, props)
    const articles = w.findAll('article')
    expect(articles).toHaveLength(s.skills.groups.length)
    // Rendered text is entity-decoded ("Data & Infra"), unlike w.html().
    const text = w.text()
    for (const group of s.skills.groups) {
      expect(text, `title ${group.title}`).toContain(group.title)
    }
  })

  it('renders every skill, with local icons where available', () => {
    const w = mountOk(SkillsSection, props)
    const chips = w.findAll('[data-ui-chip]')
    expect(chips).toHaveLength(s.skills.groups.flatMap((g) => g.stack).length)

    const svgs = w.findAll('[data-ui-chip] svg')
    expect(svgs).toHaveLength(s.skills.groups.flatMap((g) => g.stack).length)
    for (const svg of svgs) {
      expect(svg.attributes('data-icon')).toBeTruthy()
      expect(svg.attributes('aria-hidden')).toBe('true')
      expect(svg.attributes('width')).toBe('14')
    }
  })
})

describe('ProjectsSection', () => {
  it('renders public source links only where supplied', () => {
    const w = mountOk(ProjectsSection, { projects: s.projects, viewerLabels: s.work.viewer })
    expect(w.findAll('a')).toHaveLength(4)
    for (const project of s.projects) for (const link of project.links || []) {
      expect(w.find('a[href="' + link.href + '"]').attributes('rel')).toBe('noopener noreferrer')
    }
  })
  const props = { projects: s.projects, heading: s.work.heading, intro: s.work.intro, viewerLabels: s.work.viewer }

  it('mounts and renders 4 case-study rows with outcome copy', () => {
    const w = mountOk(ProjectsSection, props)
    const rows = w.findAll('ol > li')
    expect(rows).toHaveLength(4)

    for (const project of s.projects) {
      expect(w.html(), `title ${project.title}`).toContain(project.title)
      // Outcome text is rendered in full.
      expect(w.html(), `outcome ${project.id}`).toContain(project.outcome)
      expect(w.find('img[alt="' + project.imageAlt + '"]').exists()).toBe(true)
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
  it('shows a CV download only when a URL is supplied', () => {
    const w = mountOk(ContactSection, { cvHref: '/resume.pdf', cvLabel: 'Download CV' })
    expect(w.find('a[href="/resume.pdf"]').text()).toContain('Download CV')
  })
  const props = {
    heading: s.contact.heading,
    body: s.contact.body,
    email: site.email,
    cvHref: s.contact.secondary.href,
    links: s.contact.links,
    availability: site.availability,
    ctaLabel: site.cta.label,
    cvLabel: s.contact.secondary.label,
    icons: site.icons,
  }

  it('mounts and renders heading, availability pill and CTA buttons', () => {
    const w = mountOk(ContactSection, props)
    expect(w.find('#contact-heading').text()).toBe(s.contact.heading)
    expect(w.html()).toContain(site.availability)
    expect(w.html()).toContain(site.cta.label)

    const buttons = w.findAll('[data-ui-btn]')
    expect(buttons).toHaveLength(1)
    // Primary CTA is a mailto link to the configured email.
    expect(w.find(`a[href="mailto:${site.email}"]`).exists()).toBe(true)
  })

  it('renders every contact link with its icon glyph', () => {
    const w = mountOk(ContactSection, props)
    for (const link of s.contact.links) {
      expect(w.find(`a[href="${link.href}"]`).exists(), `link ${link.href}`).toBe(true)
    }
    // One inline svg path per link.
    const paths = w.findAll('ul a svg[data-icon]')
    expect(paths).toHaveLength(s.contact.links.length)
  })
})

describe('SiteFooter', () => {
  const props = {
    icon: site.icons.arrowUp,
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
