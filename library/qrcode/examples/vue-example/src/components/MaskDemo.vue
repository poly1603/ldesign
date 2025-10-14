<template>
  <div class="demo-card">
    <h2>🎭 Mask Pattern</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Mask Pattern"
        :size="200"
        :mask-pattern="2"
        fg-color="#059669"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Mask Pattern"
  :mask-pattern="2"
  fg-color="#059669"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>