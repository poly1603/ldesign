<template>
  <div class="example-section">
    <h2 class="example-title">Interactive QR Code</h2>
    
    <div class="controls">
      <div class="control-group">
        <label>Live Input (with debouncing):</label>
        <textarea 
          v-model="value"
          placeholder="Type something..."
          rows="3"
        />
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="isDarkMode"
            @change="toggleDarkMode"
          />
          Dark Mode
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="animated"
          />
          Animated
        </label>
      </div>
      
      <div class="control-group">
        <label>Render Type:</label>
        <select v-model="renderType">
          <option value="canvas">Canvas</option>
          <option value="svg">SVG</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="validateEnabled"
          />
          Enable Validation
        </label>
      </div>
    </div>

    <div v-if="validateEnabled && hasErrors" class="error-message">
      <ul>
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>
    </div>

    <div v-if="validateEnabled && hasWarnings" class="warning-message">
      <ul>
        <li v-for="warning in warnings" :key="warning">{{ warning }}</li>
      </ul>
    </div>

    <div 
      class="qr-display" 
      :style="{ background: isDarkMode ? '#1a1a1a' : '#ffffff' }"
    >
      <QRCode
        v-if="debouncedValue && (!validateEnabled || !hasErrors)"
        :content="debouncedValue"
        :render-type="renderType"
        :size="250"
        :fg-color="currentTheme.fgColor"
        :bg-color="currentTheme.bgColor"
        :animated="animated"
        animation-type="fade"
        :animation-duration="500"
      />
      <div v-else-if="!debouncedValue" style="color: #666;">
        Start typing to generate QR code...
      </div>
    </div>

    <div class="info">
      <p>Input value: {{ value }}</p>
      <p>Debounced value: {{ debouncedValue }}</p>
      <p>Theme: {{ isDarkMode ? 'Dark' : 'Light' }}</p>
      <p>Render Type: {{ renderType }}</p>
      <p v-if="validateEnabled">Valid: {{ !hasErrors }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { 
  useQRCodeInput, 
  useQRCodeTheme,
  useQRCodeValidation 
} from '@qrcode-lib/adapters/vue'

// Input with debouncing
const { value, debouncedValue } = useQRCodeInput('Type to generate QR code...')

// Theme management
const { currentTheme, toggleDarkMode, isDarkMode } = useQRCodeTheme()

// Validation
const { 
  errors, 
  warnings, 
  hasErrors, 
  hasWarnings, 
  validateContent 
} = useQRCodeValidation()

const renderType = ref<'canvas' | 'svg'>('canvas')
const animated = ref(true)
const validateEnabled = ref(false)

// Validate on debounced value change
watch(debouncedValue, (newValue) => {
  if (validateEnabled.value && newValue) {
    validateContent(newValue)
  }
})
</script>

<style scoped>
@import '../styles/examples.css';

.warning-message {
  color: #ff9800;
  padding: 1rem;
  background: rgba(255, 152, 0, 0.1);
  border-radius: 4px;
  margin: 1rem 0;
}
</style>