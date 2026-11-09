import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Gera os ícones do app (PNG em vários tamanhos) a partir de public/logo.svg.
// Rode com: npm run icones
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0A1020' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0A1020' } },
  },
  images: ['public/logo.svg'],
})
