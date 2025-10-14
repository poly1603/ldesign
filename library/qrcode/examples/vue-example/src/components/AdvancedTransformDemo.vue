<template>
  <div class="demo-card">
    <h2>🔄 Transform Effects</h2>
    <div class="controls-row">
      <label>
        Rotation: {{ rotation }}°
        <input
          type="range"
          min="0"
          max="360"
          v-model="rotation"
        />
      </label>
      <label>
        Scale: {{ scale.toFixed(1) }}x
        <input
          type="range"
          min="0.5"
          max="1.5"
          step="0.1"
          v-model="scale"
        />
      </label>
    </div>
    <div class="qr-wrapper">
      <div :style="transformStyle">
        <q-r-code
          content="Transform Demo"
          :size="200"
          fg-color="#7C3AED"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const rotation = ref(0)
const scale = ref(1)

const transformStyle = computed(() => ({
  transform: `rotate(${rotation.value}deg) scale(${scale.value})`,
  transition: 'transform 0.3s ease'
}))
</script>

<style scoped>
@import '../styles/demo.css';
</style>