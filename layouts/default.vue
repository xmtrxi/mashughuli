<template>
  <div class="flex flex-col min-h-screen">
    <LayoutAppHeader />
    <main class="flex-grow">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>
