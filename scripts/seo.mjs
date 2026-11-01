import { site } from '../src/data/site.js'

const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c])

export function createSeo(env = {}) {
  const indexable = env.SITE_INDEXABLE === 'true'
  let url
  if (env.SITE_URL) {
    url = new URL(env.SITE_URL)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      throw new Error('SITE_URL must be an absolute HTTPS URL without credentials, query, or fragment')
    }
    url.pathname = url.pathname.replace(/\/?$/, '/')
  }
  if (indexable && !url) throw new Error('SITE_INDEXABLE=true requires SITE_URL')
  const absolute = (path) => new URL(path.replace(/^\//, ''), url).href
  const meta = (key, value, property = false) => ({
    tag: 'meta', attrs: { [property ? 'property' : 'name']: key, content: String(value) }, injectTo: 'head',
  })
  const tags = [
    { tag: 'title', children: escape(site.seo.title), injectTo: 'head' },
    meta('description', site.seo.description), meta('author', site.name),
    meta('robots', indexable ? 'index, follow' : 'noindex, nofollow'),
    meta('og:type', 'website', true), meta('og:title', site.seo.title, true),
    meta('og:description', site.seo.description, true), meta('og:site_name', site.name, true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', site.seo.title),
    meta('twitter:description', site.seo.description),
  ]
  if (url) tags.push(
    { tag: 'link', attrs: { rel: 'canonical', href: url.href }, injectTo: 'head' },
    meta('og:url', url.href, true), meta('og:image', absolute(site.seo.image), true),
    meta('og:image:type', 'image/png', true), meta('og:image:width', 1200, true),
    meta('og:image:height', 630, true), meta('og:image:alt', site.seo.imageAlt, true),
    meta('twitter:image', absolute(site.seo.image)), meta('twitter:image:alt', site.seo.imageAlt),
  )
  tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, injectTo: 'head',
    children: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Person',
      name: site.name, jobTitle: site.role, sameAs: Object.values(site.social).filter(Boolean),
      ...(url ? { url: url.href, image: absolute(site.sections.hero.portrait.src) } : {}),
    }).replace(/</g, '\\u003c'),
  })
  return { tags, robots: indexable ? `User-agent: *\nAllow: /\n\nSitemap: ${absolute('sitemap.xml')}\n` : 'User-agent: *\nDisallow: /\n',
    sitemap: url ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(url.href)}</loc></url></urlset>\n` : null,
  }
}

export function seoPlugin(env) {
  const seo = createSeo(env)
  return {
    name: 'portfolio-seo',
    transformIndexHtml: () => seo.tags,
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: seo.robots })
      if (seo.sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: seo.sitemap })
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split('?')[0]
        const body = path === '/robots.txt' ? seo.robots : path === '/sitemap.xml' ? seo.sitemap : null
        if (body === null) return next()
        res.setHeader('Content-Type', path.endsWith('.xml') ? 'application/xml' : 'text/plain')
        res.end(body)
      })
    },
  }
}
