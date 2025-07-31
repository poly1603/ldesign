<template>
  <div id="app" :class="deviceClass">
    <!-- 模板选择器 -->
    <div class="template-selector">
      <div class="device-info">
        <span class="device-type">{{ deviceEmoji }} {{ deviceType.toUpperCase() }}</span>
        <span class="device-size">{{ screenWidth }} × {{ screenHeight }}</span>
      </div>

      <div class="template-controls">
        <div class="control-group">
          <label>选择模板:</label>
          <select v-model="selectedTemplate" @change="onTemplateChange">
            <option
              v-for="template in availableTemplates"
              :key="template.id"
              :value="template.id"
            >
              {{ template.name }}
            </option>
          </select>
        </div>

        <div class="control-group">
          <label class="switch-label">
            <input
              type="checkbox"
              v-model="autoSwitchEnabled"
              @change="toggleAutoSwitch"
              class="switch-input"
            />
            <span class="switch-slider"></span>
            自动切换
          </label>
        </div>
      </div>
    </div>

    <!-- 模板渲染区域 -->
    <div class="template-container">
      <component
        :is="currentTemplateComponent"
        :template-info="currentTemplate"
        @login="handleLogin"
      />
    </div>

    <!-- 调试信息 -->
    <div class="debug-panel">
      <h4>调试信息</h4>
      <div class="debug-item">
        <strong>设备类型:</strong> {{ deviceType }}
      </div>
      <div class="debug-item">
        <strong>屏幕尺寸:</strong> {{ screenWidth }} × {{ screenHeight }}
      </div>
      <div class="debug-item">
        <strong>当前模板:</strong> {{ currentTemplate?.name }}
      </div>
      <div class="debug-item">
        <strong>可用模板:</strong> {{ availableTemplates.length }} 个
      </div>
      <div class="debug-item">
        <strong>自动切换:</strong> {{ autoSwitchEnabled ? '开启' : '关闭' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, markRaw, defineComponent, h } from 'vue'
import { LoginForm } from './components/LoginForm'

// 设备类型定义
type DeviceType = 'desktop' | 'tablet' | 'mobile'

// 模板配置接口
interface TemplateConfig {
  id: string
  name: string
  deviceType: DeviceType
  isDefault: boolean
}

// 常量定义
const STORAGE_KEYS = {
  SELECTED_TEMPLATE: 'ldesign-template-selected',
  AUTO_SWITCH_ENABLED: 'ldesign-template-auto-switch'
} as const

// 持久化工具函数
const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to save to localStorage:', error)
  }
}

const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch (error) {
    console.warn('Failed to load from localStorage:', error)
    return defaultValue
  }
}

// 响应式数据
const screenWidth = ref(1024)
const screenHeight = ref(768)
const selectedTemplate = ref('')
const autoSwitchEnabled = ref(loadFromStorage(STORAGE_KEYS.AUTO_SWITCH_ENABLED, true))

// 计算属性
const deviceType = computed<DeviceType>(() => {
  if (screenWidth.value <= 767) return 'mobile'
  if (screenWidth.value <= 1023) return 'tablet'
  return 'desktop'
})

const deviceEmoji = computed(() => {
  switch (deviceType.value) {
    case 'mobile': return '📱'
    case 'tablet': return '📱'
    case 'desktop': return '🖥️'
    default: return '🖥️'
  }
})

const deviceClass = computed(() => `device-${deviceType.value}`)

// 模板配置数据
const templateConfigs: TemplateConfig[] = [
  // 桌面端模板
  { id: 'desktop-classic', name: '经典桌面登录', deviceType: 'desktop', isDefault: true },
  { id: 'desktop-modern', name: '现代桌面登录', deviceType: 'desktop', isDefault: false },

  // 平板端模板
  { id: 'tablet-adaptive', name: '自适应平板登录', deviceType: 'tablet', isDefault: true },
  { id: 'tablet-split', name: '分屏平板登录', deviceType: 'tablet', isDefault: false },

  // 移动端模板
  { id: 'mobile-simple', name: '简洁移动登录', deviceType: 'mobile', isDefault: true },
  { id: 'mobile-card', name: '卡片移动登录', deviceType: 'mobile', isDefault: false }
]

// 获取当前设备类型的可用模板
const availableTemplates = computed(() => {
  return templateConfigs.filter(config => config.deviceType === deviceType.value)
})

// 获取当前模板配置
const currentTemplate = computed(() => {
  return templateConfigs.find(config => config.id === selectedTemplate.value) || null
})

// 初始化模板选择
const initializeTemplate = () => {
  const storedTemplate = loadFromStorage(STORAGE_KEYS.SELECTED_TEMPLATE, '')

  // 如果有存储的模板且该模板存在，使用存储的模板
  if (storedTemplate && templateConfigs.find(t => t.id === storedTemplate)) {
    selectedTemplate.value = storedTemplate
  } else {
    // 否则使用当前设备类型的默认模板
    const defaultTemplate = availableTemplates.value.find(t => t.isDefault)
    if (defaultTemplate) {
      selectedTemplate.value = defaultTemplate.id
    }
  }
}

// 设备检测和更新
const updateScreenSize = () => {
  screenWidth.value = window.innerWidth
  screenHeight.value = window.innerHeight

  // 如果启用自动切换，切换到对应设备的默认模板
  if (autoSwitchEnabled.value) {
    const defaultTemplate = availableTemplates.value.find(t => t.isDefault)
    if (defaultTemplate && selectedTemplate.value !== defaultTemplate.id) {
      selectedTemplate.value = defaultTemplate.id
      saveToStorage(STORAGE_KEYS.SELECTED_TEMPLATE, selectedTemplate.value)
    }
  }
}

// 模板切换处理
const onTemplateChange = () => {
  console.log('模板切换到:', selectedTemplate.value)
  saveToStorage(STORAGE_KEYS.SELECTED_TEMPLATE, selectedTemplate.value)
}

// 自动切换开关处理
const toggleAutoSwitch = () => {
  autoSwitchEnabled.value = !autoSwitchEnabled.value
  saveToStorage(STORAGE_KEYS.AUTO_SWITCH_ENABLED, autoSwitchEnabled.value)

  // 如果开启自动切换，立即切换到当前设备的默认模板
  if (autoSwitchEnabled.value) {
    const defaultTemplate = availableTemplates.value.find(t => t.isDefault)
    if (defaultTemplate) {
      selectedTemplate.value = defaultTemplate.id
      saveToStorage(STORAGE_KEYS.SELECTED_TEMPLATE, selectedTemplate.value)
    }
  }
}

// 登录处理
const handleLogin = (data: any) => {
  console.log('登录数据:', data)
  alert(`登录成功！\n模板: ${currentTemplate.value?.name}\n用户: ${data.username}`)
}

// 模板组件映射
const templateComponents = markRaw({
  'desktop-classic': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'desktop-classic-template' }, [
        h('div', { class: 'login-container' }, [
          h('div', { class: 'login-header' }, [
            h('h1', '🖥️ 经典桌面登录'),
            h('p', '传统的桌面端登录界面，简洁大方')
          ]),
          h(LoginForm, {
            variant: 'classic',
            onLogin: (data: any) => emit('login', data)
          })
        ])
      ])
    }
  }),

  'desktop-modern': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'desktop-modern-template' }, [
        h('div', { class: 'login-container' }, [
          h('div', { class: 'login-header' }, [
            h('h1', '🎨 现代桌面登录'),
            h('p', '现代化设计，渐变背景和动画效果')
          ]),
          h(LoginForm, {
            variant: 'modern',
            onLogin: (data: any) => emit('login', data)
          })
        ])
      ])
    }
  }),

  'tablet-adaptive': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'tablet-adaptive-template' }, [
        h('div', { class: 'login-container' }, [
          h('div', { class: 'login-header' }, [
            h('h1', '📱 自适应平板登录'),
            h('p', '兼顾横屏和竖屏使用场景')
          ]),
          h(LoginForm, {
            variant: 'tablet',
            onLogin: (data: any) => emit('login', data)
          })
        ])
      ])
    }
  }),

  'tablet-split': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'tablet-split-template' }, [
        h('div', { class: 'login-container split' }, [
          h('div', { class: 'login-left' }, [
            h('h1', '📱 分屏平板登录'),
            h('p', '左右分栏设计，专业感强')
          ]),
          h('div', { class: 'login-right' }, [
            h(LoginForm, {
              variant: 'tablet',
              onLogin: (data: any) => emit('login', data)
            })
          ])
        ])
      ])
    }
  }),

  'mobile-simple': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'mobile-simple-template' }, [
        h('div', { class: 'login-container' }, [
          h('div', { class: 'login-header' }, [
            h('h1', '📱 简洁移动登录'),
            h('p', '全屏设计，大按钮操作，触摸友好')
          ]),
          h(LoginForm, {
            variant: 'mobile',
            onLogin: (data: any) => emit('login', data)
          })
        ])
      ])
    }
  }),

  'mobile-card': defineComponent({
    emits: ['login'],
    setup(_props: any, { emit }: any) {
      return () => h('div', { class: 'mobile-card-template' }, [
        h('div', { class: 'login-container card' }, [
          h('div', { class: 'login-header' }, [
            h('h1', '🎴 卡片移动登录'),
            h('p', '分层卡片式设计，视觉效果佳')
          ]),
          h(LoginForm, {
            variant: 'card',
            onLogin: (data: any) => emit('login', data)
          })
        ])
      ])
    }
  })
})

// 获取当前模板组件
const currentTemplateComponent = computed(() => {
  const templateId = selectedTemplate.value
  return templateComponents[templateId as keyof typeof templateComponents] || null
})

// 生命周期钩子
onMounted(() => {
  // 初始化屏幕尺寸
  updateScreenSize()

  // 初始化模板选择（使用持久化数据）
  initializeTemplate()

  // 监听窗口大小变化
  window.addEventListener('resize', updateScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
})
</script>

<style scoped>
@import './styles/captcha.less';
/* 全局样式 */
#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* 模板选择器样式 */
.template-selector {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  min-width: 280px;
}

.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.device-type {
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.device-size {
  font-size: 12px;
  color: #94a3b8;
}

.template-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.template-controls label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.template-controls select {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.template-controls select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* 开关样式 */
.switch-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.switch-input {
  display: none;
}

.switch-slider {
  position: relative;
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.switch-slider::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.switch-input:checked + .switch-slider {
  background: #3b82f6;
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(20px);
}

/* 模板容器样式 */
.template-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

/* 调试面板样式 */
.debug-panel {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  z-index: 1000;
  max-width: 280px;
}

.debug-panel h4 {
  margin: 0 0 12px 0;
  color: #1e293b;
  font-size: 16px;
}

.debug-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #64748b;
}

.debug-item strong {
  color: #475569;
}

/* 通用登录容器样式 */
.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.login-header {
  padding: 32px 24px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.login-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.login-form {
  padding: 32px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.login-btn:hover {
  opacity: 0.9;
}

/* 桌面端特定样式 */
.device-desktop .desktop-classic-template .login-container {
  max-width: 400px;
}

.device-desktop .desktop-modern-template .login-container {
  max-width: 450px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.device-desktop .desktop-modern-template .login-header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.device-desktop .form-input.modern {
  border-radius: 12px;
  border: 2px solid #e0e7ff;
  background: #f8faff;
}

.device-desktop .login-btn.modern {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 12px;
  padding: 14px;
}

/* 平板端特定样式 */
.device-tablet .login-container {
  max-width: 500px;
}

.device-tablet .tablet-split-template .login-container.split {
  display: flex;
  max-width: 600px;
  min-height: 400px;
}

.device-tablet .login-left {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.device-tablet .login-right {
  flex: 1;
  padding: 40px 32px;
}

.device-tablet .form-input.tablet {
  padding: 14px 16px;
  font-size: 16px;
}

.device-tablet .login-btn.tablet {
  padding: 14px;
  font-size: 16px;
}

/* 移动端特定样式 */
.device-mobile .template-container {
  padding: 10px;
}

.device-mobile .login-container {
  max-width: 100%;
  margin: 0;
  border-radius: 12px;
}

.device-mobile .mobile-card-template .login-container.card {
  background: #f8fafc;
  padding: 20px;
}

.device-mobile .mobile-card-template .login-form {
  background: white;
  border-radius: 12px;
  margin-top: 20px;
}

.device-mobile .form-input.mobile {
  padding: 16px;
  font-size: 16px;
  border-radius: 12px;
}

.device-mobile .login-btn.mobile {
  padding: 16px;
  font-size: 18px;
  border-radius: 12px;
  margin-top: 8px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .template-selector {
    position: static;
    margin: 10px;
    margin-bottom: 0;
  }

  .debug-panel {
    position: static;
    margin: 10px;
    margin-top: 0;
  }

  .template-container {
    min-height: auto;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .template-selector,
  .debug-panel {
    margin: 5px;
  }

  .login-header {
    padding: 24px 16px;
  }

  .login-form {
    padding: 24px 16px;
  }
}

/* 模板切换动画 */
.template-container {
  transition: all 0.3s ease;
}

.login-container {
  transition: all 0.3s ease;
}

/* 设备类型指示器 */
.device-desktop .login-header::before {
  content: "🖥️ ";
}

.device-tablet .login-header::before {
  content: "📱 ";
}

.device-mobile .login-header::before {
  content: "📱 ";
}

/* 登录方式切换样式 */
.login-type-switch {
  display: flex;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
}

.type-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn.active {
  background: white;
  color: #1e293b;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.type-btn:hover:not(.active) {
  color: #475569;
}

/* 表单验证样式 */
.form-input.invalid {
  border-color: #ef4444;
  background: #fef2f2;
}

.form-input.invalid:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* 验证码组件样式 */
.form-captcha {
  margin-top: 4px;
}

/* 第三方登录样式 */
.third-party-login {
  margin-top: 32px;
  padding-top: 24px;
}

.divider {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #64748b;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.third-party-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.third-party-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
  font-size: 12px;
  color: #475569;
}

.third-party-btn:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.third-party-btn .icon {
  font-size: 24px;
}

.third-party-btn.wechat:hover {
  border-color: #10b981;
  color: #10b981;
}

.third-party-btn.qq:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.third-party-btn.alipay:hover {
  border-color: #f59e0b;
  color: #f59e0b;
}

/* 模板特定样式增强 */

/* 现代桌面模板样式 */
.desktop-modern-template {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.desktop-modern-template .login-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.desktop-modern-template .form-input.modern {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.desktop-modern-template .form-input.modern:focus {
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.desktop-modern-template .login-btn.modern {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.desktop-modern-template .login-btn.modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.desktop-modern-template .login-btn.modern:hover::before {
  left: 100%;
}

.desktop-modern-template .login-btn.modern:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

/* 平板端样式增强 */
.tablet-adaptive-template,
.tablet-split-template {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
}

.device-tablet .form-input.tablet {
  border-radius: 12px;
  font-size: 16px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
}

.device-tablet .form-input.tablet:focus {
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
  transform: scale(1.02);
}

.device-tablet .login-btn.tablet {
  background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.device-tablet .login-btn.tablet:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(245, 87, 108, 0.3);
}

/* 移动端样式增强 */
.mobile-simple-template,
.mobile-card-template {
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
}

.device-mobile .form-input.mobile {
  border-radius: 16px;
  font-size: 16px;
  padding: 18px;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  -webkit-appearance: none;
}

.device-mobile .form-input.mobile:focus {
  border-color: #fed6e3;
  box-shadow: 0 0 0 3px rgba(254, 214, 227, 0.3);
  transform: scale(1.02);
}

.device-mobile .login-btn.mobile,
.device-mobile .login-btn.card {
  background: linear-gradient(180deg, #a8edea 0%, #fed6e3 100%);
  border: none;
  color: #2d3748;
  font-weight: 700;
  border-radius: 16px;
  padding: 18px;
  font-size: 18px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(168, 237, 234, 0.3);
}

.device-mobile .login-btn.mobile:hover,
.device-mobile .login-btn.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 35px rgba(168, 237, 234, 0.4);
}

/* 卡片模板特殊样式 */
.mobile-card-template .login-container.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
}

.mobile-card-template .login-form {
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 24px;
  margin-top: 20px;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

/* 动画增强 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-container {
  animation: fadeInUp 0.6s ease-out;
}

.login-form {
  animation: slideInRight 0.8s ease-out 0.2s both;
}

.third-party-login {
  animation: fadeInUp 1s ease-out 0.4s both;
}

/* 响应式动画 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

