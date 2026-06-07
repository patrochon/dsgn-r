import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/game/',
  build: {
    outDir: '../public/game',
    emptyOutDir: true,
  },
  server: {
    host: true,
  },
})
