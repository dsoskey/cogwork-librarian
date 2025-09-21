import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.md?raw'],
  server: {
    port: 8080
  },
})