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
 * - No em-dashes, no fabricated wordmarks, local Iconify data for every icon.
 */
import { defineComponent, h } from 'vue'
import AppIcon from './AppIcon.vue'

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

      if (props.icon) children.push(h(AppIcon, { name: props.icon }))

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

/** Skill logos use the shared offline Iconify renderer. */

/**
 * TechChip
 *
 * An offline Iconify SVG plus a text label.
 * When `href` is set the whole chip is an anchor; otherwise a static span.
 *
 * Props: { name, icon, href }
 */
export const TechChip = defineComponent({
  name: 'TechChip',
  props: {
    name: { type: String, default: '' },
    icon: { type: String, default: '' },
    href: { type: String, default: '' },
  },
  setup(props) {
    return () => {
      ensureStyles()

      const logo = props.icon
        ? h(AppIcon, { name: props.icon, size: 14, class: 'opacity-90' })
        : null

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
