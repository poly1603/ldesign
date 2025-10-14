<template>
  <div class="demo-card">
    <h2>🖼️ QR Code with Logo</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Logo Example"
        :size="200"
        :logo="{
          url: 'https://via.placeholder.com/50',
          size: 50,
          margin: 5
        }"
        error-correction-level="H"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Logo Example"
  :logo="{
    url: 'logo.png',
    size: 50,
    margin: 5
  }"
  error-correction-level="H"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>