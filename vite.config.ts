import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Split stable vendor libraries into their own cached chunks so app
        // code changes don't invalidate them and browsers download in parallel.
        manualChunks(id: string): string | undefined {
          if (id.includes('framer-motion')) return 'vendor-motion';
          if (id.includes('@supabase')) return 'vendor-supabase';
          if (
            id.includes('scheduler') ||
            id.includes('react-router') ||
            /[\\]react-dom[\\]/.test(id) ||
            /[\\]react[\\]jsx-runtime/.test(id) ||
            /[\\]react[\\]/.test(id)
          ) {
            return 'vendor-react';
          }
          return undefined;
        },
      },
    },
  },
})
