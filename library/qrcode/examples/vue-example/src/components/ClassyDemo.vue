<template>
  <div class="demo-card">
    <h2>🎩 Classy Style</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Classy Style"
        :size="200"
        dot-style="classy"
        fg-color="#1F2937"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Classy Style"
  dot-style="classy"
  fg-color="#1F2937"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>