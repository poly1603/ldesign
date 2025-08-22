<script setup lang="ts">
console.log('🎨 LDesign Template System App 启动')
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style lang="less">
html,
body {
  margin: 0;
  height: 100%;
}

#app {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>
