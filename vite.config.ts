import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ServerResponse, IncomingMessage } from 'node:http'
import type { OutgoingHttpHeaders } from 'node:http'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
}) 