<script setup lang="ts">
import type { LoadingIndicatorProps } from '../types'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// Props
const props = withDefaults(defineProps<LoadingIndicatorProps>(), {
  progress: 0,
  message: '正在加载...',
  stage: 'parsing',
  showProgress: true,
  showDetails: false,
  showActions: false,
  theme: 'auto',
})

// Emits
const emit = defineEmits<{
  cancel: []
  retry: []
}>()

// 本地状态
const startTime = ref(Date.now())
const elapsedTime = ref(0)
const animationProgress = ref(0)

// 计算属性
const themeClasses = computed(() => ({
  'loading-indicator--dark': props.theme === 'dark',
  'loading-indicator--light': props.theme === 'light',
}))

const displayProgress = computed(() => {
  if (props.stage === 'complete')
    return 100
  return Math.max(0, Math.min(100, props.progress))
})

const displayMessage = computed(() => {
  if (props.message)
    return props.message
  return getDefaultMessage(props.stage)
})

const stageTitle = computed(() => {
  return getStageTitle(props.stage)
})

const circumference = computed(() => 2 * Math.PI * 20)

const dashOffset = computed(() => {
  const progress = displayProgress.value / 100
  return circumference.value * (1 - progress)
})

// 阶段配置
const stages = [
  { key: 'parsing', label: '解析文档' },
  { key: 'initializing', label: '初始化引擎' },
  { key: 'rendering', label: '渲染页面' },
  { key: 'complete', label: '加载完成' },
]

// 方法
function getDefaultMessage(stage: string): string {
  const messages: Record<string, string> = {
    parsing: '正在解析PDF文档结构...',
    initializing: '正在初始化渲染引擎...',
    rendering: '正在渲染PDF页面...',
    complete: 'PDF文档加载完成！',
    error: '加载过程中出现错误',
  }
  return messages[stage] || '正在处理...'
}

function getStageTitle(stage: string): string {
  const titles: Record<string, string> = {
    parsing: '解析文档',
    initializing: '初始化',
    rendering: '渲染页面',
    complete: '加载完成',
    error: '加载失败',
  }
  return titles[stage] || '加载中'
}

function isStageCompleted(stageKey: string): boolean {
  const currentIndex = stages.findIndex(s => s.key === props.stage)
  const stageIndex = stages.findIndex(s => s.key === stageKey)
  return stageIndex < currentIndex || props.stage === 'complete'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0)
    return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}分${remainingSeconds}秒`
}

function updateElapsedTime() {
  elapsedTime.value = Date.now() - startTime.value
}

// 定时器
let timer: number | null = null

// 监听器
watch(() => props.stage, (newStage) => {
  if (newStage === 'parsing') {
    startTime.value = Date.now()
    elapsedTime.value = 0
  }
}, { immediate: true })

// 生命周期
onMounted(() => {
  // 启动计时器
  timer = window.setInterval(updateElapsedTime, 100)

  // 启动动画
  const animateProgress = () => {
    animationProgress.value = (animationProgress.value + 1) % 360
    requestAnimationFrame(animateProgress)
  }
  animateProgress()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div class="loading-indicator" :class="themeClasses">
    <!-- 主要加载动画 -->
    <div class="loading-animation">
      <div class="loading-spinner" :class="{ 'loading-spinner--pulsing': stage === 'complete' }">
        <svg class="spinner-svg" viewBox="0 0 50 50">
          <circle
            class="spinner-circle"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
          />
        </svg>

        <!-- 阶段图标 -->
        <div class="stage-icon">
          <svg v-if="stage === 'parsing'" class="icon" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          <svg v-else-if="stage === 'initializing'" class="icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z" />
          </svg>
          <svg v-else-if="stage === 'rendering'" class="icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
          <svg v-else-if="stage === 'complete'" class="icon icon--success" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
          </svg>
          <svg v-else class="icon" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z" />
          </svg>
        </div>
      </div>
    </div>

    <!-- 进度信息 -->
    <div class="loading-info">
      <h3 class="loading-title">
        {{ stageTitle }}
      </h3>
      <p class="loading-message">
        {{ displayMessage }}
      </p>

      <!-- 进度条 -->
      <div v-if="showProgress" class="progress-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${displayProgress}%` }"
          />
        </div>
        <div class="progress-text">
          {{ Math.round(displayProgress) }}%
        </div>
      </div>

      <!-- 阶段指示器 -->
      <div class="stage-indicators">
        <div
          v-for="(stageInfo, index) in stages"
          :key="stageInfo.key"
          class="stage-indicator"
          :class="{
            'stage-indicator--active': stageInfo.key === stage,
            'stage-indicator--completed': isStageCompleted(stageInfo.key),
          }"
        >
          <div class="stage-dot" />
          <span class="stage-label">{{ stageInfo.label }}</span>
        </div>
      </div>
    </div>

    <!-- 详细信息 -->
    <div v-if="showDetails" class="loading-details">
      <div v-if="fileSize" class="detail-item">
        <span class="detail-label">文件大小:</span>
        <span class="detail-value">{{ formatFileSize(fileSize) }}</span>
      </div>
      <div v-if="pageCount" class="detail-item">
        <span class="detail-label">页数:</span>
        <span class="detail-value">{{ pageCount }}</span>
      </div>
      <div v-if="elapsedTime > 0" class="detail-item">
        <span class="detail-label">已用时间:</span>
        <span class="detail-value">{{ formatTime(elapsedTime) }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="showActions" class="loading-actions">
      <button
        v-if="stage !== 'complete'"
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        取消
      </button>
      <button
        v-if="stage === 'error'"
        class="btn btn-primary"
        @click="$emit('retry')"
      >
        重试
      </button>
    </div>
  </div>
</template>

<style scoped>
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--pdf-spacing-large, 24px);
  text-align: center;
  min-height: 300px;
  background: var(--pdf-color-background, #ffffff);
  color: var(--pdf-color-text, #212121);
  font-family: var(--pdf-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
}

/* 加载动画 */
.loading-animation {
  position: relative;
  margin-bottom: var(--pdf-spacing-large, 24px);
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner--pulsing {
  animation: pulse 1.5s ease-in-out infinite;
}

.spinner-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  color: var(--pdf-color-primary, #1976d2);
}

.spinner-circle {
  transition: stroke-dashoffset 0.3s ease;
  animation: rotate 2s linear infinite;
}

.stage-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
  fill: var(--pdf-color-primary, #1976d2);
  transition: all 0.3s ease;
}

.icon--success {
  fill: #4caf50;
  animation: bounce 0.6s ease;
}

/* 加载信息 */
.loading-info {
  max-width: 400px;
  width: 100%;
}

.loading-title {
  margin: 0 0 var(--pdf-spacing-small, 8px) 0;
  font-size: var(--pdf-font-size-large, 18px);
  font-weight: 600;
  color: var(--pdf-color-text, #212121);
}

.loading-message {
  margin: 0 0 var(--pdf-spacing-medium, 16px) 0;
  font-size: var(--pdf-font-size-medium, 14px);
  color: var(--pdf-color-secondary, #757575);
  line-height: 1.5;
}

/* 进度条 */
.progress-container {
  margin-bottom: var(--pdf-spacing-medium, 16px);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--pdf-color-border, #e0e0e0);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--pdf-spacing-small, 8px);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pdf-color-primary, #1976d2), var(--pdf-color-accent, #2196f3));
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

.progress-text {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  font-weight: 500;
}

/* 阶段指示器 */
.stage-indicators {
  display: flex;
  justify-content: center;
  gap: var(--pdf-spacing-medium, 16px);
  margin-bottom: var(--pdf-spacing-medium, 16px);
}

.stage-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pdf-spacing-small, 8px);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.stage-indicator--active {
  opacity: 1;
  transform: scale(1.1);
}

.stage-indicator--completed {
  opacity: 0.8;
}

.stage-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--pdf-color-border, #e0e0e0);
  transition: all 0.3s ease;
}

.stage-indicator--active .stage-dot {
  background: var(--pdf-color-primary, #1976d2);
  box-shadow: 0 0 0 4px rgba(25, 118, 210, 0.2);
}

.stage-indicator--completed .stage-dot {
  background: var(--pdf-color-primary, #1976d2);
}

.stage-label {
  font-size: var(--pdf-font-size-small, 12px);
  color: var(--pdf-color-secondary, #757575);
  white-space: nowrap;
}

.stage-indicator--active .stage-label {
  color: var(--pdf-color-text, #212121);
  font-weight: 500;
}

/* 详细信息 */
.loading-details {
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-small, 8px);
  margin-bottom: var(--pdf-spacing-medium, 16px);
  padding: var(--pdf-spacing-medium, 16px);
  background: var(--pdf-color-surface, #f5f5f5);
  border-radius: var(--pdf-border-radius, 4px);
  border: 1px solid var(--pdf-color-border, #e0e0e0);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--pdf-font-size-small, 12px);
}

.detail-label {
  color: var(--pdf-color-secondary, #757575);
}

.detail-value {
  color: var(--pdf-color-text, #212121);
  font-weight: 500;
}

/* 操作按钮 */
.loading-actions {
  display: flex;
  gap: var(--pdf-spacing-small, 8px);
  justify-content: center;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--pdf-border-radius, 4px);
  cursor: pointer;
  font-size: var(--pdf-font-size-small, 12px);
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn-primary {
  background: var(--pdf-color-primary, #1976d2);
  color: white;
}

.btn-primary:hover {
  background: var(--pdf-color-accent, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.3);
}

.btn-secondary {
  background: var(--pdf-color-border, #e0e0e0);
  color: var(--pdf-color-text, #212121);
}

.btn-secondary:hover {
  background: var(--pdf-color-secondary, #757575);
  color: white;
  transform: translateY(-1px);
}

/* 动画 */
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

@keyframes bounce {
  0%,
  20%,
  53%,
  80%,
  100% {
    transform: translate(-50%, -50%) scale(1);
  }
  40%,
  43% {
    transform: translate(-50%, -50%) scale(1.1);
  }
  70% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  90% {
    transform: translate(-50%, -50%) scale(1.02);
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 主题样式 */
.loading-indicator--dark {
  --pdf-color-background: #121212;
  --pdf-color-surface: #1e1e1e;
  --pdf-color-text: #ffffff;
  --pdf-color-secondary: #b0bec5;
  --pdf-color-border: #333333;
  --pdf-color-primary: #90caf9;
  --pdf-color-accent: #64b5f6;
}

.loading-indicator--light {
  --pdf-color-background: #ffffff;
  --pdf-color-surface: #f5f5f5;
  --pdf-color-text: #212121;
  --pdf-color-secondary: #757575;
  --pdf-color-border: #e0e0e0;
  --pdf-color-primary: #1976d2;
  --pdf-color-accent: #2196f3;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .loading-indicator {
    padding: var(--pdf-spacing-medium, 16px);
    min-height: 250px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .stage-icon {
    width: 24px;
    height: 24px;
  }

  .loading-title {
    font-size: var(--pdf-font-size-medium, 16px);
  }

  .stage-indicators {
    gap: var(--pdf-spacing-small, 8px);
  }

  .stage-label {
    font-size: 10px;
  }

  .loading-details {
    padding: var(--pdf-spacing-small, 8px);
  }
}

/* 简化版加载指示器 */
.loading-indicator--simple {
  min-height: 150px;
  padding: var(--pdf-spacing-medium, 16px);
}

.loading-indicator--simple .loading-spinner {
  width: 40px;
  height: 40px;
}

.loading-indicator--simple .stage-icon {
  width: 16px;
  height: 16px;
}

.loading-indicator--simple .loading-title {
  font-size: var(--pdf-font-size-medium, 14px);
}

.loading-indicator--simple .stage-indicators {
  display: none;
}

/* 骨架屏样式 */
.loading-indicator--skeleton {
  background: transparent;
}

.loading-indicator--skeleton .loading-animation {
  display: none;
}

.loading-indicator--skeleton .loading-info {
  display: flex;
  flex-direction: column;
  gap: var(--pdf-spacing-medium, 16px);
}

.skeleton-item {
  height: 20px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

.skeleton-item--title {
  height: 24px;
  width: 60%;
}

.skeleton-item--text {
  height: 16px;
  width: 80%;
}

.skeleton-item--progress {
  height: 8px;
  width: 100%;
}

@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
</style>
