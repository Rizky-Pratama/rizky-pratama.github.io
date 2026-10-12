<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { site } from './data/site'
import { useGsap } from './composables/useGsap'

import SiteNav from './components/SiteNav.vue'
import HeroSection from './components/HeroSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import AboutSection from './components/AboutSection.vue'
import ContactSection from './components/ContactSection.vue'
import SiteFooter from './components/SiteFooter.vue'

const { sections } = site
const { ScrollTrigger } = useGsap()

let refreshTimer
let onLoad

/** Debounced refresh so fonts and images settle before triggers measure. */
const scheduleRefresh = () => {
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120)
}

onMounted(() => {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleRefresh)
  }

  onLoad = () => scheduleRefresh()
  if (document.readyState === 'complete') {
    scheduleRefresh()
  } else {
    window.addEventListener('load', onLoad, { once: true })
  }

  // Any late-decoding image also shifts measurements.
  const images = Array.from(document.images)
  images.forEach((img) => {
    if (!img.complete) img.addEventListener('load', scheduleRefresh, { once: true })
  })
})

onBeforeUnmount(() => {
  clearTimeout(refreshTimer)
  if (onLoad) window.removeEventListener('load', onLoad)
})
</script>

<template>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[1000] focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-on-accent"
  >
    Skip to content
  </a>

  <SiteNav
    :name="site.name"
    :nav="site.nav"
    :cta-label="site.cta.label"
    :cta-href="site.cta.href"
  />

  <main id="main">
    <HeroSection
      :eyebrow="sections.hero.eyebrow"
      :heading="sections.hero.heading"
      :subtext="sections.hero.subheading"
      :portrait="sections.hero.portrait"
      :cta-label="site.cta.label"
      :cta-href="site.cta.href"
      :secondary-label="sections.hero.secondary.label"
      :secondary-href="sections.hero.secondary.href"
    />

    <SkillsSection :groups="sections.skills.groups" />

    <ProjectsSection
      :heading="sections.work.heading"
      :intro="sections.work.intro"
      :projects="sections.projects"
    />

    <ExperienceSection heading="Experience" :entries="sections.experience" />

    <AboutSection
      :heading="sections.about.heading"
      :body="sections.about.body"
      :now="sections.about.now"
      :readouts="sections.about.readouts"
      :portrait="sections.about.portrait"
    />

    <ContactSection
      :heading="sections.contact.heading"
      :body="sections.contact.body"
      :email="site.email"
      :cv-href="sections.contact.secondary.href"
      :links="sections.contact.links"
      :availability="site.availability"
      :cta-label="site.cta.label"
    />
  </main>

  <SiteFooter
    :name="site.name"
    :role="site.role"
    :location="site.location"
    :nav="site.nav"
    :social="site.social"
    :colophon="sections.footer.colophon"
    :legal="sections.footer.legal"
    :copyright="sections.footer.copyright"
  />
</template>
