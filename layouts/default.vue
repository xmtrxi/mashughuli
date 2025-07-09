<template>
  <div class="flex flex-col min-h-screen transition-colors duration-200">
    <LayoutAppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>
