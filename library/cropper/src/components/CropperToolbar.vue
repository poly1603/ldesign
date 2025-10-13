<template>
  <div class="cropper-toolbar">
    <!-- Transform Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('rotate', -90)"
        :disabled="disabled"
        title="Rotate Left (90°)"
        aria-label="Rotate Left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2.5 12a9.5 9.5 0 1 0 9.5-9.5v3.5L7 1"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('rotate', 90)"
        :disabled="disabled"
        title="Rotate Right (90°)"
        aria-label="Rotate Right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 12a9.5 9.5 0 1 1-9.5-9.5v3.5l5-5"/>
        </svg>
      </button>
    </div>

    <!-- Flip Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('flip', 'horizontal')"
        :disabled="disabled"
        title="Flip Horizontal"
        aria-label="Flip Horizontal"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 12h20M16 16l4-4-4-4M8 8L4 12l4 4"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('flip', 'vertical')"
        :disabled="disabled"
        title="Flip Vertical"
        aria-label="Flip Vertical"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2v20M16 8l-4-4-4 4M8 16l4 4 4-4"/>
        </svg>
      </button>
    </div>

    <!-- Scale Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('zoom', 'in')"
        :disabled="disabled"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35M11 8v6M8 11h6"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('zoom', 'out')"
        :disabled="disabled"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35M8 11h6"/>
        </svg>
      </button>
    </div>

    <!-- Move Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('move', 'left')"
        :disabled="disabled"
        title="Move Left"
        aria-label="Move Left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M5 12l7 7M5 12l7-7"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('move', 'up')"
        :disabled="disabled"
        title="Move Up"
        aria-label="Move Up"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 19V5M12 5l-7 7M12 5l7 7"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('move', 'down')"
        :disabled="disabled"
        title="Move Down"
        aria-label="Move Down"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M12 19l7-7M12 19l-7-7"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('move', 'right')"
        :disabled="disabled"
        title="Move Right"
        aria-label="Move Right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M19 12l-7 7M19 12l-7-7"/>
        </svg>
      </button>
    </div>

    <!-- Skew Group (Advanced) -->
    <div v-if="showAdvanced" class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('skew', 'x', -5)"
        :disabled="disabled"
        title="Skew X Left"
        aria-label="Skew X Left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 3L9 21M15 3v6M9 15v6"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('skew', 'x', 5)"
        :disabled="disabled"
        title="Skew X Right"
        aria-label="Skew X Right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3l12 18M9 3v6M15 15v6"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('skew', 'y', -5)"
        :disabled="disabled"
        title="Skew Y Up"
        aria-label="Skew Y Up"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21l18-12M3 15h6M15 9h6"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('skew', 'y', 5)"
        :disabled="disabled"
        title="Skew Y Down"
        aria-label="Skew Y Down"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 3l18 12M3 9h6M15 15h6"/>
        </svg>
      </button>
    </div>

    <!-- Control Group -->
    <div class="cropper-toolbar-group">
      <button
        class="cropper-toolbar-button cropper-toolbar-icon"
        @click="$emit('reset')"
        :disabled="disabled"
        title="Reset"
        aria-label="Reset"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 1 1 9 9 9 9 0 0 1-9-9z"/>
          <path d="M12 6v6l4 2"/>
          <path d="M3 3l3 3M21 21l-3-3"/>
        </svg>
      </button>
      <button
        class="cropper-toolbar-button cropper-toolbar-icon cropper-toolbar-primary"
        @click="$emit('crop')"
        :disabled="disabled"
        title="Get Cropped Image"
        aria-label="Crop"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2v14a2 2 0 0 0 2 2h14"/>
          <path d="M18 22V8a2 2 0 0 0-2-2H2"/>
        </svg>
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
