import { defineConfig, loadEnv } from 'vite'
import { seoPlugin } from './scripts/seo.mjs'
import vue from '@vitejs/plugin-vue'
// @tailwindcss/vite v4.x exports the plugin as its default export.
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    tailwindcss(),
    seoPlugin({ ...loadEnv(mode, process.cwd(), 'SITE_'), ...process.env }),
  ],
}))
