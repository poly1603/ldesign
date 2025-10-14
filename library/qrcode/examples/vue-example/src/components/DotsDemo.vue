<template>
  <div class="demo-card">
    <h2>⚫ Dots Style</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Dots Style"
        :size="200"
        dot-style="dots"
        fg-color="#6366F1"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Dots Style"
  dot-style="dots"
  fg-color="#6366F1"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>