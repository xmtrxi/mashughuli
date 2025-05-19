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
