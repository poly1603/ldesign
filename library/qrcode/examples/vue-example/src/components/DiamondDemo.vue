<template>
  <div class="demo-card">
    <h2>💎 Diamond Style</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Diamond Style"
        :size="200"
        dot-style="diamond"
        fg-color="#8B5CF6"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Diamond Style"
  dot-style="diamond"
  fg-color="#8B5CF6"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>