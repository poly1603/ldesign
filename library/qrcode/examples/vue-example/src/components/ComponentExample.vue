<template>
  <div class="example-section">
    <h2 class="example-title">Advanced Component Features</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Content:</label>
        <input 
          v-model="config.content"
          type="text" 
          placeholder="Enter content"
        />
      </div>
      
      <div class="control-group">
        <label>Dot Style:</label>
        <select v-model="config.dotStyle">
          <option value="square">Square</option>
          <option value="rounded">Rounded</option>
          <option value="dots">Dots</option>
          <option value="classy">Classy</option>
          <option value="diamond">Diamond</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>Error Correction:</label>
        <select v-model="config.errorCorrectionLevel">
          <option value="L">L (Low)</option>
          <option value="M">M (Medium)</option>
          <option value="Q">Q (Quartile)</option>
          <option value="H">H (High)</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>Foreground:</label>
        <input 
          v-model="config.fgColor"
          type="color"
        />
      </div>
      
      <div class="control-group">
        <label>Background:</label>
        <input 
          v-model="config.bgColor"
          type="color"
        />
      </div>
      
      <div class="control-group">
        <label>
          <input 
            v-model="config.animated"
            type="checkbox"
          />
          Animated
        </label>
      </div>
    </div>

    <div class="qr-display">
      <QRCode
        :content="config.content"
        :size="250"
        :errorCorrectionLevel="config.errorCorrectionLevel"
        :dotStyle="config.dotStyle"
        :corner-radius="10"
        :fg-color="config.fgColor"
        :bg-color="config.bgColor"
        :animated="config.animated"
        animation-type="scale"
        :logo="{
          url: 'https://via.placeholder.com/50',
          size: 50,
          margin: 5,
        }"
      >
        <template #loading>
          <div style="color: #42b883;">Loading QR Code...</div>
        </template>
      </QRCode>
    </div>

    <div class="info">
      <p>Current Configuration:</p>
      <pre>{{ JSON.stringify(config, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const config = reactive({
  content: 'Advanced Vue QR Code',
  errorCorrectionLevel: 'H' as const,
  dotStyle: 'rounded' as const,
  fgColor: '#42b883',
  bgColor: '#35495e',
  animated: true,
})
</script>

<style scoped>
@import '../styles/examples.css';
</style>