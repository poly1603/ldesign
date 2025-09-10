<template>
  <Teleport to="body">
    <div class="loading-overlay" v-if="visible">
      <div class="loading-container">
        <!-- 加载动画 -->
        <div class="loading-spinner" :class="spinnerType">
          <div v-if="spinnerType === 'dots'" class="dots-spinner">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          
          <div v-else-if="spinnerType === 'circle'" class="circle-spinner">
            <svg viewBox="0 0 50 50">
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="4"
                stroke-linecap="round"
                stroke-dasharray="31.416"
                stroke-dashoffset="31.416"
              />
            </svg>
          </div>
          
          <div v-else-if="spinnerType === 'pulse'" class="pulse-spinner">
            <div class="pulse-circle"></div>
          </div>
          
          <div v-else class="default-spinner">
            <div class="spinner-ring"></div>
          </div>
        </div>
        
        <!-- 加载文本 -->
        <div class="loading-text" v-if="message">
          {{ message }}
        </div>
        
        <!-- 进度条 -->
        <div class="loading-progress" v-if="showProgress && progress >= 0">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
            ></div>
          </div>
          <div class="progress-text">{{ Math.round(progress) }}%</div>
        </div>
        
        <!-- 取消按钮 -->
        <button 
          v-if="showCancel && onCancel"
          class="loading-cancel"
          @click="handleCancel"
        >
          取消
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 全局加载指示器组件
 * 
 * 功能特性：
 * 1. 多种加载动画样式
 * 2. 自定义加载文本
 * 3. 进度条显示
 * 4. 可取消操作
 * 5. 全屏遮罩
 */

interface Props {
  visible?: boolean
  message?: string
  spinnerType?: 'default' | 'dots' | 'circle' | 'pulse'
  showProgress?: boolean
  progress?: number
  showCancel?: boolean
  onCancel?: () => void
  overlay?: boolean
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  message: '加载中...',
  spinnerType: 'default',
  showProgress: false,
  progress: -1,
  showCancel: false,
  overlay: true,
  zIndex: 9999
})

// 响应式状态
const isVisible = ref(props.visible)

// 计算属性
const overlayStyle = computed(() => ({
  zIndex: props.zIndex
}))

// 方法
const handleCancel = () => {
  if (props.onCancel) {
    props.onCancel()
  }
}

// 监听全局加载事件
const handleGlobalLoading = (event: CustomEvent) => {
  isVisible.value = event.detail.loading
}

// 生命周期
onMounted(() => {
  // 监听全局加载事件
  window.addEventListener('router:loading', handleGlobalLoading as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('router:loading', handleGlobalLoading as EventListener)
})

// 暴露方法给父组件
defineExpose({
  show: () => { isVisible.value = true },
  hide: () => { isVisible.value = false }
})
</script>

<style lang="less" scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  .flex-center();
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-container {
  .flex-column();
  align-items: center;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-xxl);
  background-color: #fff;
  .border-radius();
  .box-shadow(var(--ls-shadow-xl));
  max-width: 300px;
  text-align: center;
}

// 加载动画样式
.loading-spinner {
  color: var(--ldesign-brand-color);
}

// 默认旋转环
.default-spinner {
  .spinner-ring {
    width: 40px;
    height: 40px;
    border: 4px solid var(--ldesign-gray-color-2);
    border-top: 4px solid var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

// 点状加载器
.dots-spinner {
  .flex-center();
  gap: 4px;
  
  .dot {
    width: 8px;
    height: 8px;
    background-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: dots-bounce 1.4s ease-in-out infinite both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
}

// 圆形进度
.circle-spinner {
  width: 40px;
  height: 40px;
  
  svg {
    width: 100%;
    height: 100%;
    animation: rotate 2s linear infinite;
    
    circle {
      animation: dash 1.5s ease-in-out infinite;
    }
  }
}

// 脉冲动画
.pulse-spinner {
  .pulse-circle {
    width: 40px;
    height: 40px;
    background-color: var(--ldesign-brand-color);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
  }
}

// 加载文本
.loading-text {
  font-size: var(--ls-font-size-base);
  color: var(--ldesign-text-color-primary);
  font-weight: 500;
}

// 进度条
.loading-progress {
  width: 100%;
  
  .progress-bar {
    width: 100%;
    height: 4px;
    background-color: var(--ldesign-gray-color-2);
    .border-radius(2px);
    overflow: hidden;
    margin-bottom: var(--ls-margin-xs);
    
    .progress-fill {
      height: 100%;
      background-color: var(--ldesign-brand-color);
      .transition(width);
    }
  }
  
  .progress-text {
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);
  }
}

// 取消按钮
.loading-cancel {
  .button-secondary();
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  font-size: var(--ls-font-size-sm);
}

// 动画定义
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes dots-bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes pulse {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

// 响应式设计
.mobile({
  .loading-container {
    padding: var(--ls-padding-lg);
    max-width: 280px;
  }
  
  .loading-text {
    font-size: var(--ls-font-size-sm);
  }
});
</style>
