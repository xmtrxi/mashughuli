import tailwindcss from "@tailwindcss/vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  css: ["~/assets/css/tailwind.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxt/scripts",
    "shadcn-nuxt",
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    componentDir: "./components/ui",
    prefix: "",
  },
  icon: {
    mode: "css",
    cssLayer: "base",
  },
});
