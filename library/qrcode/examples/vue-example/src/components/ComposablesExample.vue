<template>
  <div class="example-section">
    <h2 class="example-title">Composables (useQRCode)</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Content:</label>
        <textarea 
          v-model="content"
          placeholder="Enter content to generate QR code"
          rows="3"
        />
      </div>
      
      <div class="control-group">
        <button @click="handleGenerate" :disabled="isGenerating">
          {{ isGenerating ? 'Generating...' : 'Generate QR Code' }}
        </button>
        <button @click="() => download('composable-qr')">
          Download
        </button>
        <button @click="refresh">
          Refresh
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">
      Error: {{ error.message }}
    </div>

    <div class="qr-display">
      <div ref="container" />
    </div>

    <div class="code-block">
      <pre>{{ codeExample }}</pre>
    </div>

    <div class="info">
      <p>Status:</p>
      <ul>
        <li>Ready: {{ isReady }}</li>
        <li>Generating: {{ isGenerating }}</li>
        <li>Has Error: {{ !!error }}</li>
        <li>Config: {{ JSON.stringify(config, null, 2) }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQRCode } from '@qrcode-lib/adapters/vue'

const content = ref('')

const { 
  container,
  generate,
  download,
  refresh,
  isReady,
  isGenerating,
  error,
  config
} = useQRCode({
  content: '',
  style: {
    size: 256,
    fgColor: '#42b883',
    bgColor: '#ffffff',
  }
}, {
  immediate: false,
  animated: true,
  animationType: 'fade'
})

const handleGenerate = () => {
  if (content.value) {
    generate({
      content: content.value,
      errorCorrectionLevel: 'M',
      renderType: 'canvas',
      style: {
        size: 256,
        fgColor: '#42b883',
        bgColor: '#ffffff',
      }
    })
  }
}

const codeExample = `import { useQRCode } from '@qrcode-lib/adapters/vue'

const { 
  container,
  generate,
  download,
  isReady,
  isGenerating,
  error 
} = useQRCode()

// Generate QR code
generate({
  content: 'Your content',
  style: { size: 256 }
})

// Download
download('filename')`
</script>

<style scoped>
@import '../styles/examples.css';
</style>