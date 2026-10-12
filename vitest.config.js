import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// Test-only config. Deliberately separate from vite.config.js so the Tailwind
// v4 plugin (which needs the full build pipeline) is NOT pulled into jsdom
// unit tests. The Vue plugin is required so `.vue` SFCs load in tests.
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.js'],
    globals: false,
    setupFiles: ['src/test/setup.js'],
  },
})
