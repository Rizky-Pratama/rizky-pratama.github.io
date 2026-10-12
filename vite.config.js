import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// @tailwindcss/vite v4.x exports the plugin as its default export.
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
})
