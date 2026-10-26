import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { askPlugin } from './server/askPlugin.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Server-only secret: read without the VITE_ prefix so it never reaches the browser bundle.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), askPlugin(env.GEMINI_API_KEY || process.env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined)],
  }
})
