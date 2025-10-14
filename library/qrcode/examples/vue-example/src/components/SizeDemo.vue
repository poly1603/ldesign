<template>
  <div class="demo-card">
    <h2>📏 Dynamic Size</h2>
    <div class="controls-row">
      <input
        type="range"
        min="100"
        max="300"
        v-model="size"
      />
      <span>{{ size }}px</span>
    </div>
    <div class="qr-wrapper">
      <q-r-code
        content="Size Demo"
        :size="Number(size)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const size = ref(200)
</script>

<style scoped>
@import '../styles/demo.css';
</style>