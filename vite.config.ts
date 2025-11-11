import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.md?raw'],
  server: {
    port: 7777
  },
  test: {
    globals: true,
  }
})
