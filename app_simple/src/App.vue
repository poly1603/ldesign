<script setup lang="ts">
import { RouterView } from '@ldesign/router';
</script>

<template>
  <RouterView transition="fade"></RouterView>
</template>
<style lang="less">
html,
body {
  margin: 0;
  height: 100%;
}

body {
  -webkit-font-smoothing: antialiased;
  font-family: var(--size-font-family, -apple-system, BlinkMacSystemFont, sans-serif);
  font-size: var(--size-font-medium, 14px);
  line-height: var(--size-line-normal, 1.5);
}
</style>
