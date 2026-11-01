import { describe, expect, it } from 'vitest'
import { createSeo } from '../../scripts/seo.mjs'
import { site } from './site.js'

const getTag = (seo, key) => seo.tags.find((t) => t.attrs?.name === key || t.attrs?.property === key)?.attrs.content

describe('build-time SEO', () => {
  it('keeps an unconfigured preview nonindexable without fabricated URLs', () => {
    const seo = createSeo()
    expect(getTag(seo, 'robots')).toBe('noindex, nofollow')
    expect(getTag(seo, 'og:image')).toBeUndefined()
    expect(seo.sitemap).toBeNull()
    expect(seo.robots).toContain('Disallow: /')
    const person = JSON.parse(seo.tags.find((t) => t.tag === 'script').children)
    expect(person['@type']).toBe('Person')
    expect(person.name).toBe(site.name)
  })

  it('generates consistent canonical, social images, sitemap and crawling rules', () => {
    const seo = createSeo({ SITE_URL: 'https://portfolio.test', SITE_INDEXABLE: 'true' })
    expect(getTag(seo, 'robots')).toBe('index, follow')
    expect(getTag(seo, 'og:url')).toBe('https://portfolio.test/')
    expect(getTag(seo, 'og:image')).toBe('https://portfolio.test/og-banner.png')
    expect(getTag(seo, 'twitter:image')).toBe(getTag(seo, 'og:image'))
    expect(getTag(seo, 'og:image:width')).toBe('1200')
    expect(seo.sitemap).toContain('<loc>https://portfolio.test/</loc>')
    expect(seo.robots).toContain('Allow: /')
    expect(seo.robots).toContain('https://portfolio.test/sitemap.xml')
    expect(seo.tags.filter((t) => t.tag === 'title')).toHaveLength(1)
  })

  it('permits shareable metadata while a configured preview remains nonindexable', () => {
    const seo = createSeo({ SITE_URL: 'https://portfolio.test/preview' })
    expect(getTag(seo, 'robots')).toBe('noindex, nofollow')
    expect(getTag(seo, 'og:image')).toBe('https://portfolio.test/preview/og-banner.png')
    expect(seo.robots).toContain('Disallow: /')
  })

  it('rejects indexing without a valid HTTPS site URL', () => {
    expect(() => createSeo({ SITE_INDEXABLE: 'true' })).toThrow()
    for (const SITE_URL of ['http://portfolio.test', '/relative', 'https://user:pass@portfolio.test', 'https://portfolio.test/?x=1']) {
      expect(() => createSeo({ SITE_URL, SITE_INDEXABLE: 'true' })).toThrow()
    }
  })
})
