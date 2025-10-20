<template>
  <div class="lottie-sequence">
    <div 
      v-for="(item, index) in items" 
      :key="index"
      class="lottie-sequence__item"
      :class="{ 'active': index === currentIndex }"
    >
      <div :ref="el => setItemRef(el, index)" class="lottie-sequence__container" />
    </div>
    
    <div v-if="showControls" class="lottie-sequence__controls">
      <button @click="play">播放序列</button>
      <button @click="pause">暂停</button>
      <button @click="resume">继续</button>
      <button @click="stop">停止</button>
      
      <div class="lottie-sequence__progress">
        <div class="lottie-sequence__progress-bar" :style="{ width: progress + '%' }" />
      </div>
      
      <div class="lottie-sequence__info">
        {{ currentIndex + 1 }} / {{ items.length }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLottieSequence } from '../composables/useLottieSequence'
import type { UseLottieSequenceOptions } from '../types'

// Props
interface LottieSequenceProps {
  items: UseLottieSequenceOptions['items']
  loop?: boolean
  autoplay?: boolean
  showControls?: boolean
}

const props = withDefaults(defineProps<LottieSequenceProps>(), {
  loop: false,
  autoplay: false,
  showControls: true
})

// Emit
const emit = defineEmits<{
  complete: []
  indexChange: [index: number]
}>()

// Refs
const itemRefs = ref<(HTMLElement | null)[]>([])

const setItemRef = (el: any, index: number) => {
  if (el) {
    itemRefs.value[index] = el as HTMLElement
  }
}

// 使用序列 composable
const {
  currentIndex,
  progress,
  isPlaying,
  isPaused,
  play,
  pause,
  resume,
  stop
} = useLottieSequence({
  items: props.items.map((item, index) => ({
    ...item,
    config: {
      ...item.config,
      container: () => itemRefs.value[index]
    }
  })),
  loop: props.loop,
  autoplay: props.autoplay
})

// 监听索引变化
watch(currentIndex, (newIndex) => {
  emit('indexChange', newIndex)
})

// 导出方法
defineExpose({
  play,
  pause,
  resume,
  stop,
  currentIndex,
  isPlaying,
  isPaused
})
</script>

<style scoped>
.lottie-sequence {
  position: relative;
}

.lottie-sequence__item {
  display: none;
}

.lottie-sequence__item.active {
  display: block;
}

.lottie-sequence__container {
  width: 100%;
  height: 300px;
}

.lottie-sequence__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.lottie-sequence__controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.lottie-sequence__controls button:hover {
  background: #f0f0f0;
}

.lottie-sequence__progress {
  flex: 1;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  overflow: hidden;
}

.lottie-sequence__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.lottie-sequence__info {
  font-size: 14px;
  color: #666;
}
</style>


