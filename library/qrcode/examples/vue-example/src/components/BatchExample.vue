<template>
  <div class="example-section">
    <h2 class="example-title">Batch QR Code Generation</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Add Content:</label>
        <input 
          v-model="newContent"
          type="text" 
          placeholder="Enter content"
          @keypress.enter="handleAdd"
        />
      </div>
      
      <div class="control-group">
        <button @click="handleAdd">Add to Batch</button>
        <button @click="generateAll()" :disabled="items.length === 0">
          Generate All ({{ items.length }})
        </button>
        <button @click="downloadAll()" :disabled="items.length === 0">
          Download All
        </button>
        <button @click="clear()">Clear All</button>
      </div>
    </div>

    <div v-if="isGenerating" class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
      <span>{{ Math.round(progress) }}%</span>
    </div>

    <div class="batch-grid">
      <div v-for="item in items" :key="item.id" class="batch-item">
        <div class="batch-item-header">
          <span>{{ item.content.substring(0, 20) }}...</span>
          <button @click="removeItem(item.id)">×</button>
        </div>
        <img v-if="item.dataURL" :src="item.dataURL" alt="QR Code" />
        <span :class="`status status-${item.status}`">
          {{ item.status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBatchQRCode } from '@qrcode-lib/adapters/vue'

const newContent = ref('')

const { 
  items, 
  addItem, 
  removeItem, 
  generateAll, 
  downloadAll,
  clear,
  isGenerating,
  progress 
} = useBatchQRCode()

const handleAdd = () => {
  if (newContent.value) {
    addItem(newContent.value, {
      style: {
        size: 150,
        margin: 2,
      }
    })
    newContent.value = ''
  }
}
</script>

<style scoped>
@import '../styles/examples.css';
</style>