<template>
  <div class="cropper-toolbar">
    <!-- Transform Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('rotate', -90)"
        :disabled="disabled"
        title="Rotate Left (90°)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2a6 6 0 1 0 4.95 2.6L11.5 3.2a.5.5 0 0 1 .85-.36l2 2a.5.5 0 0 1 0 .71l-2 2a.5.5 0 0 1-.85-.36l1.3-1.3A5 5 0 1 1 8 3a.5.5 0 0 1 0-1z"/>
        </svg>
        ⟲
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('rotate', 90)"
        :disabled="disabled"
        title="Rotate Right (90°)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2a6 6 0 1 1-4.95 2.6L4.5 3.2a.5.5 0 0 0-.85-.36l-2 2a.5.5 0 0 0 0 .71l2 2a.5.5 0 0 0 .85-.36L3.2 5.9A5 5 0 1 0 8 3a.5.5 0 0 0 0-1z"/>
        </svg>
        ⟳
      </button>
    </div>

    <!-- Flip Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('flip', 'horizontal')"
        :disabled="disabled"
        title="Flip Horizontal"
      >
        ⇄
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('flip', 'vertical')"
        :disabled="disabled"
        title="Flip Vertical"
      >
        ⇅
      </button>
    </div>

    <!-- Scale Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('zoom', 'in')"
        :disabled="disabled"
        title="Zoom In"
      >
        +
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('zoom', 'out')"
        :disabled="disabled"
        title="Zoom Out"
      >
        −
      </button>
    </div>

    <!-- Move Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('move', 'left')"
        :disabled="disabled"
        title="Move Left"
      >
        ←
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('move', 'up')"
        :disabled="disabled"
        title="Move Up"
      >
        ↑
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('move', 'down')"
        :disabled="disabled"
        title="Move Down"
      >
        ↓
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('move', 'right')"
        :disabled="disabled"
        title="Move Right"
      >
        →
      </button>
    </div>

    <!-- Skew Group (Advanced) -->
    <div v-if="showAdvanced" class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('skew', 'x', -5)"
        :disabled="disabled"
        title="Skew X Left"
      >
        ⧸
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('skew', 'x', 5)"
        :disabled="disabled"
        title="Skew X Right"
      >
        ⧹
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('skew', 'y', -5)"
        :disabled="disabled"
        title="Skew Y Up"
      >
        ⧷
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('skew', 'y', 5)"
        :disabled="disabled"
        title="Skew Y Down"
      >
        ⧶
      </button>
    </div>

    <!-- Control Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button"
        @click="$emit('reset')"
        :disabled="disabled"
        title="Reset"
      >
        ⟲ Reset
      </button>
      <button
        class="cropper-toolbar-button"
        @click="$emit('crop')"
        :disabled="disabled"
        title="Get Cropped Image"
      >
        ✂ Crop
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  disabled?: boolean
  showAdvanced?: boolean
}>()

defineEmits<{
  rotate: [degrees: number]
  flip: [direction: 'horizontal' | 'vertical']
  zoom: [direction: 'in' | 'out']
  move: [direction: 'left' | 'right' | 'up' | 'down']
  skew: [axis: 'x' | 'y', value: number]
  reset: []
  crop: []
}>()
</script>

<style scoped>
/* Inherit styles from main cropper.css */
</style>
