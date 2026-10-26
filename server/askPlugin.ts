import type { Plugin } from 'vite'
import { askHandler } from './ask.js'

/** Serves POST /api/ask from the Vite dev and preview servers. On Vercel, api/ask.ts serves it instead. */
export function askPlugin(apiKey?: string, model?: string): Plugin {
  const handle = askHandler(apiKey, model)
  return {
    name: 'pharmatlas-ask',
    configureServer(server) {
      server.middlewares.use('/api/ask', (req, res) => void handle(req, res))
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/ask', (req, res) => void handle(req, res))
    },
  }
}
