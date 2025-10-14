<template>
  <div class="demo-card">
    <h2>🎨 Styled QR Code</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="https://example.com"
        :size="200"
        fg-color="#FF6B6B"
        bg-color="#FFF5F5"
        :margin="4"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="https://example.com"
  fg-color="#FF6B6B"
  bg-color="#FFF5F5"
  :margin="4"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>