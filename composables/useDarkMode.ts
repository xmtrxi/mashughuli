import { useColorMode } from '@vueuse/core'

export const useDarkMode = () => {
  const colorMode = useColorMode({
    selector: 'html',
    attribute: 'class',
    modes: {
      // Custom colors for each theme
      light: 'light',
      dark: 'dark',
    },
  })

  const isDark = computed(() => colorMode.value === 'dark')
  const isLight = computed(() => colorMode.value === 'light')

  const toggleDarkMode = () => {
    colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
  }

  const setDarkMode = (dark: boolean) => {
    colorMode.value = dark ? 'dark' : 'light'
  }

  const setLightMode = () => {
    colorMode.value = 'light'
  }

  const setSystemMode = () => {
    colorMode.value = 'auto'
  }

  return {
    colorMode: readonly(colorMode),
    isDark: readonly(isDark),
    isLight: readonly(isLight),
    toggleDarkMode,
    setDarkMode,
    setLightMode,
    setSystemMode,
  }
}
