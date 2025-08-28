<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer } from '@ldesign/template/vue'

// 当前选中的模板
const currentTemplate = ref('login-default')
const currentCategory = ref('login')
const currentDeviceType = ref<DeviceType>('desktop')
const isAutoDetecting = ref(true)

// 模板属性
const templateProps = ref({
  title: '用户登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true,
})

// 设备类型检测
function detectDeviceType(): DeviceType {
  const width = window.innerWidth
  if (width >= 1024) {
    return 'desktop'
  } else if (width >= 768) {
    return 'tablet'
  } else {
    return 'mobile'
  }
}

// 设备类型对应的默认模板映射
const deviceTemplateMap = {
  desktop: 'login-default',
  tablet: 'login-tablet-default',
  mobile: 'login-mobile-default',
}

// 更新设备类型
function updateDeviceType() {
  if (!isAutoDetecting.value) return

  const newDeviceType = detectDeviceType()
  if (newDeviceType !== currentDeviceType.value) {
    currentDeviceType.value = newDeviceType
    currentTemplate.value = deviceTemplateMap[newDeviceType]
    console.log('设备类型已更新:', { deviceType: newDeviceType, template: currentTemplate.value })
  }
}

// 事件处理器
function handleTemplateChanged(oldTemplate: string, newTemplate: string) {
  console.log('模板已切换:', { from: oldTemplate, to: newTemplate })
  currentTemplate.value = newTemplate
}

function handleTemplateSelected(templateName: string) {
  console.log('用户选择模板:', templateName)
  currentTemplate.value = templateName
  isAutoDetecting.value = false

  // 5秒后重新启用自动检测
  setTimeout(() => {
    isAutoDetecting.value = true
    updateDeviceType()
  }, 5000)
}

// 登录处理
function handleLogin(formData?: any) {
  const data = formData || { username: 'admin', password: 'admin' }
  console.log('登录提交:', data)

  if (data.username === 'admin' && data.password === 'admin') {
    alert('登录成功！这是演示功能')
  } else {
    alert('用户名或密码错误，请使用 admin/admin')
  }
}

// 忘记密码处理
function handleForgotPassword() {
  alert('忘记密码功能演示')
}

// 窗口大小变化监听
let resizeTimeout: number | null = null
function handleResize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  resizeTimeout = window.setTimeout(() => {
    updateDeviceType()
  }, 150)
}

onMounted(() => {
  console.log('登录页面已加载，使用TemplateRenderer渲染登录模板')

  // 初始化设备类型检测
  updateDeviceType()

  // 添加窗口大小变化监听器
  window.addEventListener('resize', handleResize)

  console.log('模板配置:', {
    category: currentCategory.value,
    template: currentTemplate.value,
    deviceType: currentDeviceType.value,
    props: templateProps.value
  })
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
})
</script>

<template>
  <div class="login-page">
    <!-- 页面头部 -->
    <div class="login-header">
      <h1>{{ $t('login.title') }}</h1>
      <p>{{ $t('login.subtitle') }}</p>
    </div>

    <!-- 设备类型显示 -->
    <div class="device-info">
      <span>{{ $t('login.currentDevice') }}: {{ currentDeviceType }}</span>
      <span>{{ $t('login.currentTemplate') }}: {{ currentTemplate }}</span>
      <span class="auto-detect" :class="{ active: isAutoDetecting }">
        {{ isAutoDetecting ? $t('login.autoDetecting') : $t('login.manualMode') }}
      </span>
    </div>

    <!-- 模板渲染区域 -->
    <div class="template-container">
      <TemplateRenderer
        :key="`${currentTemplate}-${currentDeviceType}`"
        :template="currentTemplate"
        :category="currentCategory"
        :device-type="currentDeviceType"
        :template-props="templateProps"
        :show-selector="true"
        :selector-config="{ layout: 'header' }"
        @template-changed="handleTemplateChanged"
        @template-selected="handleTemplateSelected"
      />
    </div>

    <!-- 返回首页链接 -->
    <div class="back-link">
      <router-link to="/">
        ← {{ $t('common.backToHome') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-background, #f8fafc);
  padding: var(--size-4xl, 2rem);
  position: relative;
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: var(--size-2xl, 2rem);
  background: var(--color-surface, white);
  padding: var(--size-2xl, 2rem);
  border-radius: var(--size-lg, 12px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
}

.login-header h1 {
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-sm, 0.5rem);
  font-size: var(--size-3xl, 2.5rem);
  font-weight: 700;
}

.login-header p {
  color: var(--color-text-secondary, #718096);
  font-size: var(--size-lg, 1.1rem);
  margin: 0;
}

.device-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--size-lg, 1rem);
  margin-bottom: var(--size-2xl, 2rem);
  background: var(--color-surface, white);
  padding: var(--size-lg, 1rem) var(--size-2xl, 2rem);
  border-radius: var(--size-md, 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  font-size: var(--size-sm, 0.875rem);
  flex-wrap: wrap;
}

.device-info span {
  color: var(--color-text-secondary, #4a5568);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.auto-detect {
  padding: var(--size-xs, 0.25rem) var(--size-sm, 0.75rem);
  border-radius: var(--size-full, 20px);
  background: var(--color-muted, #f7fafc);
  color: var(--color-text-secondary, #4a5568);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s;
}

.auto-detect.active {
  background: var(--color-success-light, #e6fffa);
  color: var(--color-success-dark, #065f46);
  border-color: var(--color-success, #10b981);
}

.template-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 1200px;
  background: var(--color-surface, white);
  border-radius: var(--size-lg, 12px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  overflow: hidden;
}

.back-link {
  position: fixed;
  bottom: var(--size-2xl, 2rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
}

.back-link a {
  color: var(--color-text, #1a202c);
  text-decoration: none;
  font-size: var(--size-lg, 1.1rem);
  padding: var(--size-sm, 0.5rem) var(--size-lg, 1rem);
  border-radius: var(--size-md, 6px);
  background: var(--color-surface, white);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-link a:hover {
  background: var(--color-muted, #f7fafc);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


/* 响应式设计 */
@media (max-width: 768px) {
  .login-page {
    padding: var(--size-lg, 1rem);
  }

  .device-info {
    flex-direction: column;
    gap: var(--size-sm, 0.5rem);
    align-items: stretch;
  }

  .device-info span {
    text-align: center;
    font-size: var(--size-xs, 0.75rem);
  }

  .login-header h1 {
    font-size: var(--size-2xl, 2rem);
  }

  .login-header p {
    font-size: var(--size-base, 1rem);
  }

  .template-container {
    max-width: 100%;
  }
}
</style>
