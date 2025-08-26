<script setup lang="ts">
import { nextTick, onErrorCaptured, ref } from 'vue'
import ErrorPage from '../views/ErrorPage.vue'

const hasError = ref(false)
const errorType = ref<'server-error' | 'network-error' | 'unknown'>('unknown')
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref('')
const showErrorDetails = ref(false)
const retryCount = ref(0)
const maxRetries = 3

// 捕获子组件中的错误
onErrorCaptured((error: Error, _instance, info) => {
  console.error('ErrorBoundary caught error:', error, info)

  hasError.value = true

  // 根据错误类型设置不同的错误信息
  if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
    errorType.value = 'network-error'
    errorTitle.value = '资源加载失败'
    errorMessage.value = '页面资源加载失败，可能是网络问题或服务器更新。'
  }
  else if (error.message.includes('fetch') || error.message.includes('network')) {
    errorType.value = 'network-error'
    errorTitle.value = '网络请求失败'
    errorMessage.value = '网络请求失败，请检查您的网络连接。'
  }
  else if (error.message.includes('timeout')) {
    errorType.value = 'server-error'
    errorTitle.value = '请求超时'
    errorMessage.value = '服务器响应超时，请稍后再试。'
  }
  else {
    errorType.value = 'unknown'
    errorTitle.value = '组件渲染错误'
    errorMessage.value = '页面组件渲染时发生错误，请尝试刷新页面。'
  }

  errorDetails.value = `${error.name}: ${error.message}\n\n堆栈信息:\n${error.stack}\n\n组件信息:\n${info}`
  showErrorDetails.value = (import.meta as any).env?.DEV === true // 只在开发环境显示详细错误信息

  // 阻止错误继续向上传播
  return false
})

async function handleRetry() {
  if (retryCount.value >= maxRetries) {
    errorMessage.value = `已重试 ${maxRetries} 次，仍然失败。请刷新页面或联系技术支持。`
    return
  }

  retryCount.value++
  hasError.value = false

  // 等待下一个tick，让组件重新渲染
  await nextTick()

  // 如果重试后仍然有错误，错误会被重新捕获
}

function handleReport(errorInfo: any) {
  // 在实际应用中，这里应该发送错误报告到服务器
  console.error('Error reported:', errorInfo)

  // 可以集成错误监控服务，如 Sentry、Bugsnag 等
  // Sentry.captureException(new Error(errorInfo.message), {
  //   tags: {
  //     type: errorInfo.type,
  //     url: errorInfo.url
  //   },
  //   extra: errorInfo
  // })
}

// 重置错误状态的方法（可以从父组件调用）
function resetError() {
  hasError.value = false
  retryCount.value = 0
}

// 暴露方法给父组件
defineExpose({
  resetError,
})
</script>

<template>
  <div>
    <ErrorPage
      v-if="hasError"
      :type="errorType"
      :title="errorTitle"
      :message="errorMessage"
      :details="errorDetails"
      :show-details="showErrorDetails"
      :can-retry="true"
      @retry="handleRetry"
      @report="handleReport"
    />
    <slot v-else />
  </div>
</template>
