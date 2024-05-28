// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss', '@nuxtjs/color-mode'],
  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classPrefix: '',
    classSuffix: ''
  },
  nitro: {
    experimental: {
      websocket: true
    }
  },
  app: {
    head: {
      bodyAttrs: {
        class: 'w-screen h-screen'
      },
      htmlAttrs: {
        class: 'w-screen h-screen'
      }
    }
  }
});
