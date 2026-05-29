import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
      timeout: 120000
    },
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
})