<template>
  <div class="demo-card">
    <h2>📱 Basic QR Code</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="https://github.com"
        :size="200"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="https://github.com"
  :size="200"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>