// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-12-11',
  modules: ['@nuxtjs/ionic'],
  css: ['@/theme/variables.css'],
  ssr: false,        // <-- Required for Capacitor
  nitro: {
    preset: 'static' // <-- Forces .output/public + index.html
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:4000',
      user: process.env.USER,
      password: process.env.PASSWORD,
      humeKey: process.env.HUME_KEY
    }
  }
})
