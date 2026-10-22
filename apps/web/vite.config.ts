import adapter from '@sveltejs/adapter-static'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

// Linked from the site frame but not built yet. Remove each path as its route lands.
const pendingPaths = new Set([
  '/about/',
  '/labs/',
  '/tags/',
  '/feed.xml',
  '/feed.json',
])

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ strict: true }),
      prerender: {
        handleHttpError: ({ path, status, message }) => {
          if (status === 404 && pendingPaths.has(path)) return
          throw new Error(message)
        },
      },
    }),
  ],
})
