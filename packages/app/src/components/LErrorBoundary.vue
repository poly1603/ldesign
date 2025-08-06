<template>
  <div class="l-error-boundary">
    <slot v-if="!hasError" />
    <div v-else class="error-fallback">
      <slot name="fallback" :error="error" :retry="retry">
        <div class="default-error-fallback">
          <div class="error-icon">⚠️</div>
          <h2 class="error-title">出现了一些问题</h2>
          <p class="error-message">
            {{ error?.message || '应用遇到了意外错误' }}
          </p>
          <div class="error-actions">
            <button class="btn btn-primary" @click="retry">
              重试
            </button>
            <button class="btn btn-outline-primary" @click="reportError">
              报告问题
            </button>
          </div>
          <details v-if="showDetails" class="error-details">
            <summary>错误详情</summary>
            <pre>{{ errorDetails }}</pre>
          </details>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, computed } from 'vue'
import { useEngine } from '../composables/useEngine'

interface Props {
  showDetails?: boolean
  onError?: (error: Error, instance: any, info: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false
})

const emit = defineEmits<{
  error: [error: Error, instance: any, info: string]
}>()

const engine = useEngine()
const hasError = ref(false)
const error = ref<Error | null>(null)
const errorInfo = ref<string>('')

const errorDetails = computed(() => {
  if (!error.value) return ''
  
  return {
    message: error.value.message,
    stack: error.value.stack,
    info: errorInfo.value,
    timestamp: new Date().toISOString()
  }
})

const retry = () => {
  hasError.value = false
  error.value = null
  errorInfo.value = ''
  
  // 发送重试事件
  engine.events?.emit('error-boundary:retry')
}

const reportError = () => {
  if (!error.value) return
  
  // 发送错误报告事件
  engine.events?.emit('error-boundary:report', {
    error: error.value,
    info: errorInfo.value,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
  
  // 显示通知
  engine.notifications?.show({
    type: 'info',
    title: '错误已报告',
    message: '感谢您的反馈，我们会尽快处理这个问题'
  })
}

// 捕获子组件错误
onErrorCaptured((err: Error, instance: any, info: string) => {
  hasError.value = true
  error.value = err
  errorInfo.value = info
  
  // 记录错误日志
  engine.logger?.error('Error boundary caught error:', {
    error: err,
    instance,
    info
  })
  
  // 调用自定义错误处理函数
  props.onError?.(err, instance, info)
  
  // 发送错误事件
  emit('error', err, instance, info)
  
  // 阻止错误继续向上传播
  return false
})
</script>

<style lang="less" scoped>
.l-error-boundary {
  width: 100%;
  height: 100%;
}

.error-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.default-error-fallback {
  max-width: 500px;
  text-align: center;
  
  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  .error-title {
    font-size: @font-size-2xl;
    font-weight: @font-weight-semibold;
    color: @danger-color;
    margin-bottom: 12px;
  }
  
  .error-message {
    font-size: @font-size-base;
    color: @text-secondary;
    margin-bottom: 24px;
    line-height: @line-height-base;
  }
  
  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-bottom: 24px;
  }
  
  .error-details {
    text-align: left;
    margin-top: 20px;
    
    summary {
      cursor: pointer;
      font-weight: @font-weight-medium;
      margin-bottom: 8px;
      
      &:hover {
        color: @primary-color;
      }
    }
    
    pre {
      background: @bg-secondary;
      padding: 12px;
      border-radius: @border-radius;
      font-size: @font-size-xs;
      overflow: auto;
      max-height: 200px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>
