<template>
  <TemplateRenderer 
    category="login" 
    :template-name="currentTemplate || undefined" 
    :responsive="true"
    :props="templateProps" 
    @template-loaded="handleTemplateLoaded"
  >
    <template #switcher>
      <EnhancedTemplateSwitcher 
        category="login" 
        :current-template="currentTemplate" 
        :config="switcherConfig"
        @change="handleTemplateChange" 
        @device-change="handleDeviceChange" 
      />
    </template>
  </TemplateRenderer>
</template>

<script setup lang="ts">
import type { SwitcherConfig } from '@ldesign/template'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import { EnhancedTemplateSwitcher, TemplateRenderer } from '@ldesign/template'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 当前模板名称 - 留空让TemplateRenderer根据设备自动选择
const currentTemplate = ref<string>('')

// 切换器配置
const switcherConfig = computed<SwitcherConfig>(() => ({
  position: 'top-right',
  style: 'floating',
  selectorType: 'dropdown', // 可以改为 'buttons' 或 'cards'
  collapsible: false,
  showDevice: true,
  showLabel: true,
  showInfo: true, // 显示作者和版本信息
  animation: 'fade',
  animationDuration: 300,
  sortBy: 'default',
  sortOrder: 'asc',
}))

// 处理模板切换
function handleTemplateChange(templateName: string) {
  console.log('[Login] 切换模板到:', templateName)
  currentTemplate.value = templateName
}

// 处理设备变化
function handleDeviceChange(device: string) {
  console.log('[Login] 检测到设备变化:', device)
  // 设备变化时重置模板，让TemplateRenderer自动选择新设备的默认模板
  currentTemplate.value = ''
}

// 处理模板加载完成
function handleTemplateLoaded(info: { name: string; device: string }) {
  console.log('[Login] 模板已加载:', info.name, '(设备:', info.device + ')')
  // 更新当前模板名称
  if (currentTemplate.value !== info.name) {
    currentTemplate.value = info.name
  }
}


// 登录处理函数
const error = ref('')
const handleLogin = async (data: { username: string; password: string; remember?: boolean }) => {
  error.value = ''

  // 使用认证模块登录
  const result = await auth.login({
    username: data.username,
    password: data.password
  })

  if (result.success) {
    if (data.remember) {
      localStorage.setItem('rememberMe', 'true')
    }

    console.log('登录成功！')

    // 获取重定向地址
    const redirect = (route.query?.redirect as string) || '/'
    await router.replace(redirect)
  } else {
    error.value = result.error || t('login.errors.invalid')
    throw new Error(error.value)
  }
}

// 模板属性
const templateProps = computed(() => ({
  title: t('login.title'),
  subtitle: t('login.subtitle'),
  onLogin: handleLogin,
  onRegister: () => {
    console.log('跳转到注册页')
    // router.push('/register')
  },
  onForgotPassword: () => {
    console.log('跳转到忘记密码页')
    // router.push('/forgot-password')
  },
}))

// 组件挂载时检查是否已登录
onMounted(() => {
  if (auth.isLoggedIn.value) {
    // 已登录的用户访问登录页，重定向到首页或查询参数中指定的页面
    const redirect = (route.query?.redirect as string) || '/'
    router.replace(redirect)
  }
})
</script>

<style scoped>
.login-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.template-container {
  width: 100%;
  min-height: 100vh;
}

/* 模板切换器容器 */
.template-switcher-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.device-info {
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

/* 模板切换器 */
.template-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: var(--color-bg-container);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 180px;
}

.switcher-header {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.device-label {
  color: var(--color-primary-default);
}

.switcher-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.switcher-controls label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.template-select {
  padding: 6px 10px;
  border: 2px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-bg-container);
  color: var(--color-text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
}

.template-select:hover {
  border-color: var(--color-primary-default);
}

.template-select:focus {
  outline: none;
  border-color: var(--color-primary-default);
  box-shadow: var(--shadow-outline);
}

/* 淡入淡出动画 */
.template-fade-enter-active,
.template-fade-leave-active {
  transition: opacity 0.3s ease;
}

.template-fade-enter-from,
.template-fade-leave-to {
  opacity: 0;
}

/* 滑动动画 */
.template-slide-enter-active,
.template-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.template-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.template-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* 缩放动画 */
.template-scale-enter-active,
.template-scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.template-scale-enter-from,
.template-scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

/* 确保模板能正确渲染 */
:deep(.template-loading),
:deep(.template-error) {
  padding: 20px;
  text-align: center;
  color: var(--color-text-secondary);
}

:deep(.template-error) {
  color: var(--color-danger-default);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-controls {
    top: 10px;
    right: 10px;
    padding: 10px;
    min-width: 150px;
  }

  .device-info,
  .template-selector-wrapper {
    font-size: 12px;
  }

  .debug-panel {
    bottom: 10px;
    left: 10px;
    padding: 12px;
    max-width: 200px;
  }
}
</style>
