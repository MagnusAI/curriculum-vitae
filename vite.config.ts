import react from "@vitejs/plugin-react"
// `defineConfig` from 'vitest/config' wraps Vite's own and additionally
// types the `test` block below, so build config and test config stay in
// one file instead of drifting apart in two.
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  base: '/curriculum-vitae/', // Base path for GitHub Pages
  test: {
    environment: 'jsdom',
  },
})
