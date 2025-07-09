import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "@vite-pwa/nuxt",
    "@nuxtjs/seo",
    "@nuxtjs/color-mode",
    "shadcn-nuxt",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@vueuse/nuxt",
  ],
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  compatibilityDate: "2024-11-01",
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        ".prisma/client/index-browser":
          "./node_modules/@prisma/client/index-browser.js",
      },
    },
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    jwtSecret: process.env.NUXT_JWT_SECRET,
    redisUrl: process.env.NUXT_REDIS_URL,
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
      websocket: true,
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
    // storage: {
    //   cache: {
    //     driver: "redis",
    //   },
    //   redis: {
    //     driver: "redis",
    //     url: process.env.NUXT_REDIS_URL || "redis://localhost:6379",
    //   },
    // },
  },
  imports: {
    dirs: ["./server/services", "./server/utils"],
  },

  // Color Mode Configuration
  colorMode: {
    preference: "system",
    fallback: "light",
    hid: "nuxt-color-mode-script",
    globalName: "__NUXT_COLOR_MODE__",
    componentName: "ColorScheme",
    classPrefix: "",
    classSuffix: "",
    storageKey: "nuxt-color-mode",
  },

  // PWA Configuration
  pwa: {
    registerType: "autoUpdate",
    workbox: {
      navigateFallback: "/",
      navigateFallbackDenylist: [/^\/_nuxt\//, /^\/api\//],
      globPatterns: ["**/*.{js,css,html,png,svg,ico,json,woff2}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "api-cache",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 24 hours
            },
          },
        },
        {
          urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "images-cache",
            expiration: {
              maxEntries: 200,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
            },
          },
        },
        {
          urlPattern: /\.(woff|woff2|eot|ttf|otf)$/,
          handler: "CacheFirst",
          options: {
            cacheName: "fonts-cache",
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
            },
          },
        },
      ],
      skipWaiting: true,
      clientsClaim: true,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: { enabled: true },
    manifest: {
      name: process.env.NUXT_APP_NAME || "Mashughuli - Errand Running Platform",
      short_name: process.env.NUXT_APP_SHORT_NAME || "Mashughuli",
      description:
        process.env.NUXT_APP_DESCRIPTION ||
        "Connect with reliable runners for your errands. Post tasks or earn by completing errands in your area.",
      theme_color: process.env.NUXT_THEME_COLOR || "#5639e5",
      background_color: process.env.NUXT_BACKGROUND_COLOR || "#ffffff",
      display: "standalone",
      orientation: "portrait",
      scope: "/",
      start_url: "/",
      icons: [
        {
          src: "/images/icons/icon-72x72.png",
          sizes: "72x72",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-128x128.png",
          sizes: "128x128",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-152x152.png",
          sizes: "152x152",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "/images/icons/icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
  },

  // SEO Configuration
  site: {
    url: process.env.NUXT_SITE_URL || "https://mashughuli.com",
    name: process.env.NUXT_APP_NAME || "Mashughuli",
    description:
      process.env.NUXT_APP_DESCRIPTION ||
      "Mashughuli connects people who need errands done with reliable runners. Post tasks or earn by completing errands in your area.",
    defaultLocale: "en",
  },

  // Image optimization
  image: {
    quality: 80,
    format: ["webp", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // Font optimization
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ["normal"],
      subsets: ["latin"],
    },
  },
});
