<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { computed } from 'vue'

interface Props {
  type?: 'not-found' | 'server-error' | 'network-error' | 'permission-denied' | 'timeout' | 'unknown'
  title?: string
  message?: string
  details?: string
  showDetails?: boolean
  canRetry?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'unknown',
  showDetails: false,
  canRetry: false,
})

const emit = defineEmits<{
  retry: []
  report: [error: any]
}>()

const router = useRouter()

const errorConfig = {
  'not-found': {
    icon: '🔍',
    color: '#dc3545',
    title: '404 - 页面未找到',
    message: '抱歉，您访问的页面不存在或已被移动。',
    suggestions: [
      '检查URL地址是否正确',
      '尝试从首页重新导航',
      '使用搜索功能查找内容',
      '联系管理员确认页面状态',
    ],
  },
  'server-error': {
    icon: '🚨',
    color: '#dc3545',
    title: '500 - 服务器错误',
    message: '服务器遇到了一个错误，无法完成您的请求。',
    suggestions: [
      '稍后再试',
      '刷新页面',
      '检查网络连接',
      '联系技术支持',
    ],
  },
  'network-error': {
    icon: '🌐',
    color: '#fd7e14',
    title: '网络连接错误',
    message: '无法连接到服务器，请检查您的网络连接。',
    suggestions: [
      '检查网络连接',
      '尝试刷新页面',
      '检查防火墙设置',
      '联系网络管理员',
    ],
  },
  'permission-denied': {
    icon: '🔒',
    color: '#dc3545',
    title: '403 - 访问被拒绝',
    message: '您没有权限访问此页面或资源。',
    suggestions: [
      '确认您已登录',
      '检查账户权限',
      '联系管理员申请权限',
      '尝试重新登录',
    ],
  },
  'timeout': {
    icon: '⏰',
    color: '#ffc107',
    title: '请求超时',
    message: '请求处理时间过长，已超时。',
    suggestions: [
      '检查网络连接速度',
      '稍后再试',
      '刷新页面重试',
      '联系技术支持',
    ],
  },
  'unknown': {
    icon: '❓',
    color: '#6c757d',
    title: '未知错误',
    message: '发生了一个未知错误，请稍后再试。',
    suggestions: [
      '刷新页面',
      '清除浏览器缓存',
      '尝试使用其他浏览器',
      '联系技术支持',
    ],
  },
}

const currentConfig = computed(() => errorConfig[props.type])

const errorIcon = computed(() => props.title ? '❌' : currentConfig.value.icon)
const errorColor = computed(() => currentConfig.value.color)
const errorTitle = computed(() => props.title || currentConfig.value.title)
const errorMessage = computed(() => props.message || currentConfig.value.message)
const errorDetails = computed(() => props.details || '')
const suggestions = computed(() => currentConfig.value.suggestions)

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}

function refresh() {
  window.location.reload()
}

function retry() {
  emit('retry')
}

function reportError() {
  const errorInfo = {
    type: props.type,
    title: errorTitle.value,
    message: errorMessage.value,
    details: errorDetails.value,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }

  emit('report', errorInfo)

  // 简单的错误报告演示
  console.error('错误报告已发送！我们会尽快处理。')
}
</script>

<template>
  <div style="text-align: center; padding: 40px 20px; min-height: 60vh; display: flex; flex-direction: column; justify-content: center;">
    <div style="font-size: 120px; margin-bottom: 20px;">
      {{ errorIcon }}
    </div>
    <h2 :style="{ color: errorColor, marginBottom: '15px' }">
      {{ errorTitle }}
    </h2>
    <p style="color: #666; margin-bottom: 30px; font-size: 18px; max-width: 600px; margin-left: auto; margin-right: auto;">
      {{ errorMessage }}
    </p>

    <!-- 错误详情 -->
    <div v-if="showDetails" style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 20px; margin: 20px auto; text-align: left; max-width: 800px;">
      <h4 style="color: #495057; margin-bottom: 10px;">
        🔍 错误详情：
      </h4>
      <div style="font-family: monospace; background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #e9ecef; overflow-x: auto;">
        <pre style="margin: 0; white-space: pre-wrap; word-break: break-word;">{{ errorDetails }}</pre>
      </div>
    </div>

    <!-- 建议操作 -->
    <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 6px; padding: 20px; margin: 20px auto; text-align: left; max-width: 600px;">
      <h4 style="color: #1976d2; margin-bottom: 10px;">
        💡 建议操作：
      </h4>
      <ul style="color: #1976d2; margin-left: 20px;">
        <li v-for="suggestion in suggestions" :key="suggestion">
          {{ suggestion }}
        </li>
      </ul>
    </div>

    <!-- 操作按钮 -->
    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
      <button
        style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="goHome"
      >
        🏠 返回首页
      </button>
      <button
        style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="goBack"
      >
        ⬅️ 返回上页
      </button>
      <button
        style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="refresh"
      >
        🔄 刷新页面
      </button>
      <button
        v-if="canRetry"
        style="padding: 12px 24px; background: #ffc107; color: #212529; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="retry"
      >
        🔁 重试
      </button>
    </div>

    <!-- 联系支持 -->
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 14px;">
        如果问题持续存在，请联系技术支持
      </p>
      <div style="margin-top: 10px;">
        <button
          style="padding: 8px 16px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
          @click="reportError"
        >
          📧 报告错误
        </button>
      </div>
    </div>
  </div>
</template>
