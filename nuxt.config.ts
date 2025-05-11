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
  eslint: {
    config: {},
  },
  icon: {
    mode: "css",
    cssLayer: "base",
  },
  shadcn: {
    componentDir: "./components/ui",
    prefix: "",
  },
});
