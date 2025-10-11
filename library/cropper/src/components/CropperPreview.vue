<template>
  <div class="cropper-preview-container">
    <h3 v-if="title">{{ title }}</h3>
    <div
      class="cropper-preview"
      :style="{
        width: width + 'px',
        height: height + 'px'
      }"
    >
      <img
        v-if="src"
        :src="src"
        alt="Preview"
        :style="imageStyle"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

const props = defineProps<{
  src?: string
  width?: number
  height?: number
  title?: string
  imageData?: {
    rotate?: number
    scaleX?: number
    scaleY?: number
    skewX?: number
    skewY?: number
    translateX?: number
    translateY?: number
  }
}>()

const imageStyle = computed(() => {
  if (!props.imageData) return {}

  const {
    rotate = 0,
    scaleX = 1,
    scaleY = 1,
    skewX = 0,
    skewY = 0,
    translateX = 0,
    translateY = 0
  } = props.imageData

  const transforms = [
    `translate(${translateX}px, ${translateY}px)`,
    `rotate(${rotate}deg)`,
    `scale(${scaleX}, ${scaleY})`,
    `skew(${skewX}deg, ${skewY}deg)`
  ]

  return {
    transform: transforms.join(' ')
  }
})
</script>

<style scoped>
.cropper-preview-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cropper-preview-container h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}
</style>
