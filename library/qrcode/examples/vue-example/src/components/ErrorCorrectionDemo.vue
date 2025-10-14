<template>
  <div class="demo-card">
    <h2>🛡️ Error Correction Levels</h2>
    <div class="controls-row">
      <button
        v-for="l in levels"
        :key="l.value"
        :class="{ active: level === l.value }"
        @click="level = l.value"
      >
        {{ l.value }} ({{ l.percentage }})
      </button>
    </div>
    <div class="qr-wrapper">
      <q-r-code
        content="Error Correction Demo"
        :size="200"
        :error-correction-level="level"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const levels = [
  { value: 'L', percentage: '7%' },
  { value: 'M', percentage: '15%' },
  { value: 'Q', percentage: '25%' },
  { value: 'H', percentage: '30%' }
] as const

const level = ref<'L' | 'M' | 'Q' | 'H'>('M')
</script>

<style scoped>
@import '../styles/demo.css';
</style>