// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-19",
  devtools: { enabled: true },
  modules: ["nitro-cloudflare-dev", "@nuxtjs/tailwindcss", "@pinia/nuxt"],

  nitro: {
    preset: "cloudflare_module",
    
    rollupConfig: {
      external: ["@prisma/client", "cloudflare:email"],
    },

    cloudflare: {
      deployConfig: false,  // GitHub Actionsで独自のwrangler.tomlを使用するため
      nodeCompat: true
    }
  },

  css: [
    '~/assets/css/main.css',
    '~/assets/css/animations.css',
    '~/assets/css/transitions.css'
  ],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' },
    head: {
      title: 'zxcv - Coding Rules Platform',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Share and manage coding rules with your team' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=M+PLUS+1:wght@100;200;300;400;500;600;700;800;900&display=swap' }
      ]
    }
  }
})