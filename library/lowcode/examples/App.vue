<template>
  <div id="app">
    <LowcodeEditor />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import LowcodeEditor from '../src/components/LowcodeEditor.vue';
import { useTheme } from '../src/composables/useTheme';

// 初始化主题
const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<style>
@import '../src/styles/index.less';

#app {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>

