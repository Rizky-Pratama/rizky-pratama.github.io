import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

/**
 * Flat ESLint config for the portfolio template.
 *
 * Style shipped in `src/`:
 *   - single quotes, no semicolons, 2-space indent, trailing commas
 *   - Vue 3.5 `<script setup>` SFCs + a plain-ESM `ui.js` module
 *
 * Two complementary tools, two jobs:
 *   - ESLint  -> correctness. `prettier/prettier` is NOT enabled here.
 *   - Prettier -> formatting, enforced by `npm run format:check`.
 * That split is why `eslint-config-prettier` (which only TURNS OFF rules that
 * conflict with Prettier) sits last, instead of `eslint-plugin-prettier`
 * (which would re-report every formatting nit as 300+ lint warnings).
 *
 * `npm run lint` (eslint .) MUST pass on the current `src/`.
 */
export default [
  // Never lint build output, deps, generated assets, QA scratch, config files.
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'audit/**',
      'public/**',
      'scripts/**',
      '*.config.js',
      'eslint.config.js',
      'prettier.config.js',
    ],
  },

  js.configs.recommended,

  // Vue 3 recommended rules for SFCs (incl. `<script setup>`).
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,mjs,cjs,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        getComputedStyle: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        matchMedia: 'readonly',
        HTMLElement: 'readonly',
        Node: 'readonly',
        URL: 'readonly',
      },
    },
    rules: {
      // --- Formatting-shaped Vue rules: Prettier owns reflow. Keep quiet. ---
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/html-indent': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-closing-bracket-spacing': 'off',
      'vue/first-attribute-linebreak': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/v-on-event-hyphenation': 'off',

      // Informational only (multi-line attribute ordering is a taste call and
      // would flag a lot of the existing templates). Warning, never error.
      'vue/attributes-order': 'warn',
      'vue/no-v-html': 'warn',

      // Single-word section components (HeroSection is fine, but keep off to
      // avoid flagging e.g. `Ui` / short SFC names) - off by design.
      'vue/multi-word-component-names': 'off',

      // --- Genuine-correctness rules, tuned to the existing code. ---
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'vue/no-unused-components': 'warn',
      'vue/no-unused-vars': 'warn',

      // `const links = buildLinks()` intentionally shadows the `links` prop in
      // ContactSection.vue; benign, so downgrade from error to warning.
      'vue/no-dupe-keys': 'warn',

      // `registered = true` inside `if (!registered)` is a deliberate
      // "register once" idiom in useGsap.js; harmless, so warn not error.
      'no-useless-assignment': 'warn',
    },
  },

  // `src/components/ui.js` is deliberately a plain-ESM module exporting several
  // presentational components; the per-file rule only makes sense for SFCs.
  {
    files: ['**/*.js'],
    rules: {
      'vue/one-component-per-file': 'off',
    },
  },

  // Last: switch OFF every rule that clashes with Prettier's output.
  eslintConfigPrettier,
]
