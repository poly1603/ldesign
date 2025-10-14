<template>
  <div class="demo-card">
    <h2>⭐ Star Style</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Star Style"
        :size="200"
        dot-style="star"
        fg-color="#F59E0B"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Star Style"
  dot-style="star"
  fg-color="#F59E0B"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>