<template>
  <div class="demo-card">
    <h2>🌈 Gradient QR Code</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Gradient Example"
        :size="200"
        :gradient="{
          type: 'linear',
          colors: ['#FF6B6B', '#4ECDC4']
        }"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Gradient Example"
  :gradient="{
    type: 'linear',
    colors: ['#FF6B6B', '#4ECDC4']
  }"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>