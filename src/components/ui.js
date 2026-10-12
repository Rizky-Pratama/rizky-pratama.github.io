/**
 * Tiny presentational primitives shared across sections.
 * Named exports: AppButton, TechChip.
 *
 * This is a plain ES module (NOT an SFC) so it can live in `ui.js` and be
 * imported by the section components:
 *
 *   import { AppButton, TechChip } from "./ui.js"
 *
 * Rules honoured here:
 * - Plain object props (no TypeScript).
 * - Tailwind v4 theme utilities ONLY (bg-surface, text-fg-muted, border-border,
 *   font-display, font-mono, rounded-xs / rounded-sm).
 * - transform/opacity only. Press uses `:active` scale 0.97, never a zero-scale.
 * - Hover feedback gated to fine pointers via a `@media (hover: hover)` rule
 *   injected once into the document head.
 * - No em-dashes, no fabricated wordmarks, real Simple Icons for TechChip.
 */
import { defineComponent, h } from 'vue'

/* ---------------------------------------------------------------------------
 * Shared CSS. Injected once at module load; covers the fine-pointer hover
 * gate and the button focus/active behaviour that utility classes cannot
 * express (media-query-gated hover). Scoped per-component CSS is unavailable
 * here, so we namespace everything under a data attribute.
 * ------------------------------------------------------------------------- */
const STYLE_ID = 'ui-primitive-styles'

function ensureStyles() {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    /* Buttons: lift on fine-pointer hover only (never latched on touch). */
    @media (hover: hover) and (pointer: fine) {
      [data-ui-btn]:not([aria-disabled="true"]):hover {
        transform: translateY(-1px);
      }
    }
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: reduce) {
      [data-ui-btn]:not([aria-disabled="true"]):hover {
        transform: none;
      }
    }
    /* TechChip: hairline brightens + label lifts to full fg on fine hover. */
    @media (hover: hover) and (pointer: fine) {
      [data-ui-chip]:hover {
        border-color: var(--color-fg-muted);
        transform: translateY(-1px);
      }
      [data-ui-chip]:hover [data-ui-chip-label] {
        color: var(--color-fg);
      }
    }
  `
  document.head.appendChild(style)
}

ensureStyles()

/* ---------------------------------------------------------------------------
 * AppButton
 * ------------------------------------------------------------------------- */

const BUTTON_BASE =
  'ui-btn inline-flex items-center justify-center gap-2 font-body font-medium ' +
  'rounded-sm px-5 py-3 text-sm leading-none ' +
  'transition-[transform,background-color,border-color,color] ' +
  'duration-200 ease-out-strong active:scale-[0.97] ' +
  'focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ' +
  'aria-disabled:pointer-events-none aria-disabled:opacity-50 ' +
  'motion-reduce:transition-none'

const BUTTON_VARIANTS = {
  primary: 'bg-accent text-on-accent hover:bg-accent-press',
  ghost: 'border border-border bg-transparent text-fg hover:bg-surface-2',
  quiet: 'px-0 py-0 text-fg-muted hover:text-fg underline-offset-4 hover:underline',
}

/**
 * AppButton
 *
 * Renders an <a> when `href` is set (and not disabled), otherwise a <button>.
 * Variants: "primary" | "ghost" | "quiet".
 *
 * Props: { label, href, variant, icon, disabled, target }
 */
export const AppButton = defineComponent({
  name: 'AppButton',
  props: {
    label: { type: String, default: '' },
    href: { type: String, default: '' },
    variant: { type: String, default: 'primary' },
    icon: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    target: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      ensureStyles()

      const isLink = !!props.href && !props.disabled
      const isExternal = !!props.href && /^https?:\/\//.test(props.href)
      const resolvedTarget =
        isExternal && !props.target ? '_blank' : props.target || undefined
      const rel = resolvedTarget === '_blank' ? 'noopener noreferrer' : undefined

      const cls = `${BUTTON_BASE} ${BUTTON_VARIANTS[props.variant] ?? BUTTON_VARIANTS.primary}`

      const children = [h('span', null, props.label)]

      if (props.icon === 'download') {
        // Phosphor-style arrow-down. Functional, not decorative.
        children.push(
          h(
            'svg',
            {
              class: 'size-4 shrink-0',
              viewBox: '0 0 256 256',
              fill: 'currentColor',
              'aria-hidden': 'true',
              focusable: 'false',
            },
            [
              h('path', {
                d: 'M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 133.66V32a8 8 0 0 0-16 0v101.66l-26.34-26.35a8 8 0 0 0-11.32 11.32Z',
              }),
            ],
          ),
        )
      }

      const attrs = {
        class: cls,
        'data-ui-btn': '',
        'aria-disabled': props.disabled ? 'true' : undefined,
      }

      if (isLink) {
        return h(
          'a',
          { ...attrs, href: props.href, target: resolvedTarget, rel },
          children,
        )
      }

      return h(
        'button',
        { ...attrs, type: 'button', disabled: props.disabled || undefined },
        children,
      )
    }
  },
})

/* ---------------------------------------------------------------------------
 * TechChip
 * ------------------------------------------------------------------------- */

/**
 * Local, committed Simple Icons SVG (see scripts/gen-icons.mjs). Generated at
 * build time into public/icons/{slug}.svg with the chip's muted tint baked in,
 * so the chip never hotlinks a CDN at runtime. Filenames match the site data's
 * `slug` field exactly. An empty slug yields an empty src, so a broken chip
 * renders no stray box instead of requesting a nonexistent icon.
 */
const TECH_ICON = (slug) => (slug ? `/icons/${slug}.svg` : '')

/**
 * TechChip
 *
 * A local Simple Icons SVG plus a text label.
 * When `href` is set the whole chip is an anchor; otherwise a static span.
 *
 * Props: { name, slug, href }
 */
export const TechChip = defineComponent({
  name: 'TechChip',
  props: {
    name: { type: String, default: '' },
    slug: { type: String, default: '' },
    href: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      ensureStyles()

      const logo = h('img', {
        src: TECH_ICON(props.slug),
        alt: '',
        width: '14',
        height: '14',
        loading: 'lazy',
        decoding: 'async',
        'aria-hidden': 'true',
        class: 'size-3.5 shrink-0 opacity-90',
      })

      const label = h(
        'span',
        {
          'data-ui-chip-label': '',
          class:
            'font-mono text-xs text-fg-muted transition-colors duration-200 ease-out-strong',
        },
        props.name,
      )

      const inner = [logo, label]

      const cls =
        'inline-flex items-center gap-1.5 rounded-xs border border-border ' +
        'bg-transparent px-2 py-1 ' +
        'transition-[transform,border-color] duration-200 ease-out-strong ' +
        'motion-reduce:transition-none'

      if (props.href) {
        const external = /^https?:\/\//.test(props.href)
        return h(
          'a',
          {
            class: cls,
            'data-ui-chip': '',
            href: props.href,
            target: external ? '_blank' : undefined,
            rel: external ? 'noopener noreferrer' : undefined,
          },
          inner,
        )
      }

      return h('span', { class: cls, 'data-ui-chip': '' }, inner)
    }
  },
})

export default { AppButton, TechChip }
