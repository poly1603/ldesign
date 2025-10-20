<template>
  <div class="lottie-player">
    <div 
      ref="containerRef" 
      class="lottie-player__animation"
      :style="animationStyle"
    />
    
    <div v-if="showControls" class="lottie-player__controls">
      <button 
        class="lottie-player__btn"
        @click="togglePlay"
        :title="isPlaying ? '暂停' : '播放'"
      >
        {{ isPlaying ? '⏸' : '▶' }}
      </button>
      
      <button 
        class="lottie-player__btn"
        @click="stop"
        title="停止"
      >
        ⏹
      </button>
      
      <button 
        class="lottie-player__btn"
        @click="reset"
        title="重置"
      >
        ⏮
      </button>
      
      <div class="lottie-player__slider">
        <input 
          type="range" 
          v-model.number="currentFrame"
          :min="0"
          :max="totalFrames - 1"
          @input="onFrameChange"
        />
      </div>
      
      <div class="lottie-player__info">
        {{ currentFrame }} / {{ totalFrames }}
      </div>
      
      <div class="lottie-player__speed">
        <label>速度:</label>
        <select v-model.number="currentSpeed" @change="onSpeedChange">
          <option :value="0.5">0.5x</option>
          <option :value="1">1x</option>
          <option :value="1.5">1.5x</option>
          <option :value="2">2x</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { lottieManager } from '../../../core/LottieManager'
import type { ILottieInstance } from '../../../types'
import type { LottieAnimationProps } from '../types'

// Props
interface LottiePlayerProps extends LottieAnimationProps {
  showControls?: boolean
}

const props = withDefaults(defineProps<LottiePlayerProps>(), {
  loop: true,
  autoplay: false,
  renderer: 'svg',
  speed: 1,
  width: '100%',
  height: '400px',
  showControls: true
})

// Emits
const emit = defineEmits<{
  ready: []
  complete: []
  frameChange: [frame: number]
}>()

// Refs
const containerRef = ref<HTMLElement | null>(null)
const instance = ref<ILottieInstance | null>(null)
const isPlaying = ref(false)
const currentFrame = ref(0)
const totalFrames = ref(0)
const currentSpeed = ref(props.speed)

// Computed
const animationStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

// Methods
const init = async () => {
  if (!containerRef.value) return

  try {
    if (instance.value) {
      instance.value.destroy()
    }

    instance.value = lottieManager.create({
      container: containerRef.value,
      path: props.path,
      animationData: props.animationData,
      loop: props.loop,
      autoplay: props.autoplay,
      renderer: props.renderer,
      speed: currentSpeed.value,
      ...props.config,
      events: {
        data_ready: () => {
          if (instance.value?.animation) {
            totalFrames.value = instance.value.animation.totalFrames
          }
          emit('ready')
        },
        complete: () => {
          isPlaying.value = false
          emit('complete')
        },
        enterFrame: (e: any) => {
          currentFrame.value = Math.floor(e.currentTime)
          emit('frameChange', currentFrame.value)
        },
        stateChange: (state: string) => {
          isPlaying.value = state === 'playing'
        },
        ...props.config?.events
      }
    })

    await instance.value.load()
  } catch (error) {
    console.error('[LottiePlayer] Init error:', error)
  }
}

const togglePlay = () => {
  if (!instance.value) return
  
  if (isPlaying.value) {
    instance.value.pause()
  } else {
    instance.value.play()
  }
}

const stop = () => {
  instance.value?.stop()
  currentFrame.value = 0
}

const reset = () => {
  instance.value?.reset()
  currentFrame.value = 0
}

const onFrameChange = () => {
  instance.value?.goToAndStop(currentFrame.value, true)
}

const onSpeedChange = () => {
  instance.value?.setSpeed(currentSpeed.value)
}

// 导出方法
defineExpose({
  instance,
  play: () => instance.value?.play(),
  pause: () => instance.value?.pause(),
  stop,
  reset
})

// 生命周期
onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  instance.value?.destroy()
})

// 监听变化
watch(() => props.path, init)
watch(() => props.animationData, init)
</script>

<style scoped>
.lottie-player {
  display: inline-block;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.lottie-player__animation {
  display: block;
  background: #f9f9f9;
}

.lottie-player__controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-top: 1px solid #eee;
}

.lottie-player__btn {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.lottie-player__btn:hover {
  background: #f0f0f0;
  border-color: #999;
}

.lottie-player__slider {
  flex: 1;
}

.lottie-player__slider input[type="range"] {
  width: 100%;
}

.lottie-player__info {
  font-size: 12px;
  color: #666;
  min-width: 80px;
}

.lottie-player__speed {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.lottie-player__speed select {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}
</style>


