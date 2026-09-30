import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: 'plain-text-page',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/ai/' || request.url === '/ai') request.url = '/ai/index.html'
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((request, _response, next) => {
        if (request.url === '/ai/' || request.url === '/ai') request.url = '/ai/index.html'
        next()
      })
    },
  }],
})
