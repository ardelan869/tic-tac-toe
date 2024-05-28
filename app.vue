<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.v-enter-active,
.v-leave-active {
  opacity: 1;
  filter: blur(0);
  transition:
    300ms opacity,
    300ms filter;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  filter: blur(25px);
}
</style>
