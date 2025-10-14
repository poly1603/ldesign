<template>
  <div class="example-section">
    <h2 class="example-title">Basic QR Code Component</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Content:</label>
        <input 
          v-model="content"
          type="text" 
          placeholder="Enter content"
        />
      </div>
      
      <div class="control-group">
        <label>Size:</label>
        <input 
          v-model.number="size"
          type="range" 
          min="100" 
          max="400"
        />
        <span>{{ size }}px</span>
      </div>
      
      <div class="control-group">
        <button @click="handleDownload">Download QR Code</button>
      </div>
    </div>

    <div class="qr-display">
      <QRCode
        ref="qrRef"
        :content="content"
        :size="size"
        fgColor="#000000"
        bgColor="#ffffff"
        @ready="onReady"
      />
    </div>

    <div class="code-block">
      <pre>{{ codeExample }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// Since we registered globally via plugin, we can use QRCode directly
// But we can also import it explicitly if needed
// import { QRCode } from '@qrcode-lib/adapters/vue'

const content = ref('https://vuejs.org')
const size = ref(200)
const qrRef = ref()

const handleDownload = () => {
  qrRef.value?.download('my-qrcode', 'png')
}

const onReady = (instance: any) => {
  console.log('QR Code is ready!', instance)
}

const codeExample = computed(() => `<QRCode
  ref="qrRef"
  :content="${content.value}"
  :size="${size.value}"
  fgColor="#000000"
  bgColor="#ffffff"
  @ready="onReady"
/>`)
</script>

<style scoped>
@import '../styles/examples.css';
</style>