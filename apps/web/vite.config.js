import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      },
      manifest: {
        name: 'HAi Wallet',
        short_name: 'HAi Wallet',
        description: 'HAi Wallet - Execute transactions with natural language prompts',
        theme_color: '#1a1a1a',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
            },
            {
                src: '/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml',
                purpose: 'any maskable'
            }
        ],
        categories: ['finance', 'productivity'],
        lang: 'en',
        dir: 'ltr'
      }
    })
  ],
  server: {
    port: 8080,
    host: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vite']
        }
      }
    }
  }
}) 