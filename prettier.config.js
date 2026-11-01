/**
 * Prettier config for the portfolio template.
 *
 * Matches the style already used across `src/`:
 *   - no semicolons, single quotes, 2-space indent, trailing commas
 *   - printWidth 90: the codebase hugs ~90 in JS/templates; the only longer
 *     lines are single unbreakable string literals (Tailwind class lists,
 *     SVG paths) which Prettier cannot wrap anyway.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 90,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  vueIndentScriptAndStyle: false,
  htmlWhitespaceSensitivity: 'css',
}

export default config
