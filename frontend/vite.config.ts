import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    strictPort: false,
    host: true
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return
        }
        warn(warning)
      },
      output: {
        manualChunks: () => 'index.js'
      }
    }
  }
})
