import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/DotBattle/',
  server: {
    port: 6416,
    host: true, // Listen on all network interfaces for LAN access
  },
})
