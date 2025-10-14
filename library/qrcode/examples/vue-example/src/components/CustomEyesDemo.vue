<template>
  <div class="demo-card">
    <h2>👁️ Custom Eyes</h2>
    <div class="qr-wrapper">
      <q-r-code
        content="Custom Eyes"
        :size="200"
        eye-style="circle"
        eye-color="#DC2626"
      />
    </div>
    <div class="demo-code">
      <code>{{ codeExample }}</code>
    </div>
  </div>
</template>

<script setup lang="ts">
const codeExample = `<q-r-code
  content="Custom Eyes"
  eye-style="circle"
  eye-color="#DC2626"
/>`
</script>

<style scoped>
@import '../styles/demo.css';
</style>