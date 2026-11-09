/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Configuração do Vite: o "motor" que junta o código e gera o site final em /dist.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Transforma o site em um app instalável que funciona sem internet (PWA).
    VitePWA({
      // "prompt": quando sair uma versão nova, o app pergunta antes de atualizar.
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Evolui',
        short_name: 'Evolui',
        description: 'Seu crescimento, um dia de cada vez.',
        lang: 'pt-BR',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0A1020',
        background_color: '#0A1020',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Guarda no celular tudo o que o app precisa para abrir offline.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Letras de outros alfabetos (cirílico, vietnamita...) não são usadas em português: não precisam ir para o cache.
        globIgnores: ['**/*-cyrillic*', '**/*-vietnamese*', '**/*-latin-ext-*'],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
