import { defineConfig } from 'vitest/config'

export default defineConfig({
  // keep vite from discovering the parent Next.js PostCSS config
  css: { postcss: { plugins: [] } },
  test: {
    include: ['tests/ts/**/*.test.ts'],
    environment: 'node',
  },
})
