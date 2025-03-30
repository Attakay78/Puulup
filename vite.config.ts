import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'PuulUp - Fitness Tracker',
        short_name: 'PuulUp',
        description: 'Track your workouts and achieve your fitness goals',
        theme_color: '#E1306C',
        background_color: '#121212',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '64x64',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  }
});