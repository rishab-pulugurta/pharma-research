import type { IncomingMessage, ServerResponse } from 'node:http'
import { askHandler } from '../server/ask.js'

// Vercel serverless function for the chat. GEMINI_API_KEY is set in the Vercel project's environment variables.
const handle = askHandler(process.env.GEMINI_API_KEY, process.env.GEMINI_MODEL || undefined)

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handle(req, res)
}
