<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { ref } from 'vue'
import ErrorBoundary from '../components/ErrorBoundary.vue'
import ErrorPage from './ErrorPage.vue'

// 创建一个会出错的组件
const BuggyComponent = {
  props: ['shouldError'],
  setup(props: { shouldError: boolean }) {
    if (props.shouldError) {
      throw new Error('这是一个演示错误！组件故意抛出了这个错误来演示错误边界的功能。')
    }
    return () => '✅ 组件正常运行'
  },
}

const router = useRouter()
const errorBoundary = ref()
const showBuggyComponent = ref(false)
const shouldTriggerError = ref(false)
const showErrorPreview = ref(false)
const selectedErrorType = ref<'not-found' | 'server-error' | 'network-error' | 'permission-denied' | 'timeout' | 'unknown'>('not-found')

function triggerNotFound() {
  router.push('/this-page-does-not-exist')
}

function triggerComponentError() {
  shouldTriggerError.value = true
  showBuggyComponent.value = true
}

async function triggerNetworkError() {
  try {
    await fetch('/api/nonexistent-endpoint')
  }
  catch {
    console.error('网络请求失败！在实际应用中，这会被错误处理机制捕获。')
  }
}

function triggerPermissionError() {
  // 模拟权限错误
  router.push('/admin-only-page')
}

async function triggerServerError() {
  try {
    // 模拟服务器错误
    const response = await fetch('/api/server-error', {
      method: 'POST',
      body: JSON.stringify({ trigger: 'server-error' }),
    })
    if (!response.ok) {
      throw new Error(`服务器错误: ${response.status}`)
    }
  }
  catch {
    console.error('服务器错误！在实际应用中，这会显示专门的错误页面。')
  }
}

function triggerTimeoutError() {
  // 模拟超时错误
  const controller = new AbortController()
  setTimeout(() => controller.abort(), 100) // 100ms后超时

  fetch('/api/slow-endpoint', {
    signal: controller.signal,
  }).catch(() => {
    console.error('请求超时！在实际应用中，这会显示超时错误页面。')
  })
}

function handleErrorRetry() {
  // 用户点击了重试按钮
  if (errorBoundary.value) {
    errorBoundary.value.resetError()
  }
  shouldTriggerError.value = false
  showBuggyComponent.value = false
}

function handleErrorReport(errorInfo: any) {
  console.error('错误报告:', errorInfo)
  // 错误报告已发送
}
</script>

<template>
  <div>
    <h2>🚨 错误处理演示</h2>
    <p>这个页面演示了各种错误处理机制和错误页面的效果。</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px;">
      <!-- 404错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #dc3545;">
        <h3>🔍 404 错误</h3>
        <p>演示访问不存在的页面时的错误处理。</p>
        <button
          style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerNotFound"
        >
          触发 404 错误
        </button>
      </div>

      <!-- 组件错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #fd7e14;">
        <h3>⚠️ 组件错误</h3>
        <p>演示组件渲染错误时的错误边界处理。</p>
        <button
          style="padding: 10px 20px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerComponentError"
        >
          触发组件错误
        </button>
      </div>

      <!-- 网络错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #ffc107;">
        <h3>🌐 网络错误</h3>
        <p>演示网络请求失败时的错误处理。</p>
        <button
          style="padding: 10px 20px; background: #ffc107; color: #212529; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerNetworkError"
        >
          触发网络错误
        </button>
      </div>

      <!-- 权限错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6f42c1;">
        <h3>🔒 权限错误</h3>
        <p>演示访问权限不足时的错误处理。</p>
        <button
          style="padding: 10px 20px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerPermissionError"
        >
          触发权限错误
        </button>
      </div>

      <!-- 服务器错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #e83e8c;">
        <h3>🚨 服务器错误</h3>
        <p>演示服务器内部错误时的错误处理。</p>
        <button
          style="padding: 10px 20px; background: #e83e8c; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerServerError"
        >
          触发服务器错误
        </button>
      </div>

      <!-- 超时错误演示 -->
      <div style="padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #20c997;">
        <h3>⏰ 超时错误</h3>
        <p>演示请求超时时的错误处理。</p>
        <button
          style="padding: 10px 20px; background: #20c997; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
          @click="triggerTimeoutError"
        >
          触发超时错误
        </button>
      </div>
    </div>

    <!-- 错误边界演示区域 -->
    <div style="margin-top: 40px; padding: 20px; background: #e3f2fd; border-radius: 8px;">
      <h3>🛡️ 错误边界演示</h3>
      <p>下面的组件被错误边界包裹，如果发生错误会被优雅地处理：</p>

      <ErrorBoundary ref="errorBoundary">
        <BuggyComponent v-if="showBuggyComponent" :should-error="shouldTriggerError" />
        <div v-else style="padding: 20px; background: #d4edda; border-radius: 4px; margin-top: 10px;">
          <p>✅ 组件正常运行中...</p>
          <button
            style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;"
            @click="showBuggyComponent = true"
          >
            显示可能出错的组件
          </button>
        </div>
      </ErrorBoundary>
    </div>

    <!-- 错误页面预览 -->
    <div style="margin-top: 40px;">
      <h3>📄 错误页面预览</h3>
      <p>选择一个错误类型来预览对应的错误页面：</p>

      <div style="margin: 20px 0;">
        <select
          v-model="selectedErrorType"
          style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; margin-right: 10px;"
        >
          <option value="not-found">
            404 - 页面未找到
          </option>
          <option value="server-error">
            500 - 服务器错误
          </option>
          <option value="network-error">
            网络连接错误
          </option>
          <option value="permission-denied">
            403 - 访问被拒绝
          </option>
          <option value="timeout">
            请求超时
          </option>
          <option value="unknown">
            未知错误
          </option>
        </select>
        <button
          style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;"
          @click="showErrorPreview = !showErrorPreview"
        >
          {{ showErrorPreview ? '隐藏预览' : '显示预览' }}
        </button>
      </div>

      <div v-if="showErrorPreview" style="border: 2px solid #dee2e6; border-radius: 8px; margin-top: 20px;">
        <ErrorPage
          :type="selectedErrorType"
          :show-details="true"
          :can-retry="true"
          details="这是一个演示错误的详细信息。\n\n错误堆栈:\nError: 演示错误\n    at demo.js:123:45\n    at Component.render (component.js:67:89)"
          @retry="handleErrorRetry"
          @report="handleErrorReport"
        />
      </div>
    </div>
  </div>
</template>
