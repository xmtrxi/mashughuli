import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  compatibilityDate: "2024-11-01",
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    jwtSecret: process.env.NUXT_JWT_SECRET,
  },
  icon: {
    mode: "css",
    cssLayer: "base",
  },
  shadcn: {
    componentDir: "./components/ui",
    prefix: "",
  },
  routeRules: {
    "/": { prerender: true },
    "/about": { prerender: true },
    "/contact": { prerender: true },
    "/how-it-works": { prerender: true },
    "/auth/login": { prerender: true },
    "/auth/register": { prerender: true },
  },
  app: {
    pageTransition: {
      name: "page",
      mode: "out-in",
      duration: 350,
    },
    layoutTransition: {
      name: "layout",
      mode: "out-in",
      duration: 350,
    },
    head: {
      title: "Errands | Mashughuli",
      link: [
        { rel: "icon", type: "image/png", href: "/favicon.ico" },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/images/icons/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/images/icons/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/images/icons/favicon-16x16.png",
        },

        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },
  nitro: {
    experimental: {
      openAPI: true,
    },
    openAPI: {
      route: "/_docs/openapi.json",
      ui: {
        scalar: {
          route: "/_docs/scalar",
        },
        swagger: {
          route: "/_docs/swagger",
        },
      },
    },
  },
  imports: {
    dirs: ["./server/services", "./server/utils"],
  },
});