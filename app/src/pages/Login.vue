<template>
  <div class="login-page">
    <!-- 使用 TemplateRenderer 组件渲染内置的 login 模板 -->
    <TemplateRenderer
      category="login"
      :responsive="true"
      :show-selector="false"
      fallback-template="default"
      :props="templateProps"
      @template-change="onTemplateChange"
      @load-error="onLoadError"
      @load-success="onLoadSuccess"
    >
      <!-- 自定义插槽内容 -->
      <template #footer>
        <div class="custom-footer">
          <router-link to="/" class="back-link">
            ← 返回首页
          </router-link>
          <p class="footer-text">
            &copy; 2024 LDesign Demo App - 模板渲染系统演示
          </p>
        </div>
      </template>

      <!-- 额外的自定义内容 -->
      <template #extra>
        <div class="template-demo-info">
          <p class="demo-note">
            🎨 此页面使用 <strong>@ldesign/template</strong> 的内置 login 模板渲染
          </p>
        </div>
      </template>
    </TemplateRenderer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'

/**
 * 登录页面组件
 * 使用 @ldesign/template 的 TemplateRenderer 组件渲染内置 login 模板
 */

// 获取路由器实例
const router = useRouter()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 加载状态
const isLoading = ref(false)

// 模板属性 - 传递给内置login模板的props
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎使用 LDesign Demo 系统',
  showRemember: true,
  showRegister: false,
  showForgot: false,
  primaryColor: '#667eea',
  // 传递表单数据和处理函数给模板
  formData: loginForm,
  loading: isLoading.value,
  onSubmit: handleLogin,
  onForgot: handleForgot,
  onRegister: handleRegister,
  // 调试信息
  debugInfo: {
    deviceType: 'desktop',
    templateName: 'login-default',
    isResponsive: true,
    screenWidth: window.innerWidth,
    renderMode: 'template-renderer'
  }
}))

// 模板事件处理
const onTemplateChange = (templateName: string) => {
  console.log('🎨 模板切换:', templateName)
}

const onLoadError = (error: Error) => {
  console.error('❌ 模板加载失败:', error)
}

const onLoadSuccess = () => {
  console.log('✅ 模板加载成功')
}

/**
 * 处理登录提交
 */
const handleLogin = async () => {
  isLoading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('登录信息:', loginForm)

    // 模拟登录成功
    alert(`登录成功！欢迎 ${loginForm.username}`)

    // 登录成功后跳转到首页
    console.log('🎉 登录成功，跳转到首页')
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理忘记密码
 */
const handleForgot = () => {
  console.log('🔑 忘记密码功能')
  alert('忘记密码功能')
}

/**
 * 处理注册
 */
const handleRegister = () => {
  console.log('📝 注册功能')
  alert('注册功能')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  /* 移除原有的背景样式，让模板自己处理 */
}

/* 自定义footer样式 - 使用主题色变量 */
.custom-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--ls-spacing-lg);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-component, rgba(255, 255, 255, 0.05));
  border-top: var(--ls-border-width) solid var(--ldesign-border-color, rgba(255, 255, 255, 0.1));
}

.back-link {
  color: var(--ldesign-brand-color, #1677ff);
  text-decoration: none;
  font-size: var(--ls-font-size-sm);
  transition: all 0.3s ease;
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  border-radius: var(--ls-border-radius);
  background: var(--ldesign-brand-color-1, rgba(255, 255, 255, 0.1));
  border: var(--ls-border-width) solid var(--ldesign-brand-color-3, transparent);
}

.back-link:hover {
  color: var(--ldesign-brand-color-9, #b8d5ff);
  background: var(--ldesign-brand-color-2, rgba(255, 255, 255, 0.2));
  transform: translateY(var(--ls-transform-hover-y));
  box-shadow: var(--ls-shadow-sm);
}

.footer-text {
  margin: 0;
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-secondary, rgba(255, 255, 255, 0.7));
  text-align: center;
}

/* 模板演示信息样式 - 使用主题色变量 */
.template-demo-info {
  margin-top: var(--ls-spacing-lg);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-brand-color-1, rgba(102, 126, 234, 0.1));
  border-radius: var(--ls-border-radius);
  border-left: var(--ls-border-accent-width) solid var(--ldesign-brand-color, #1677ff);
  backdrop-filter: blur(var(--ls-blur-sm));
}

.demo-note {
  margin: 0;
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color, #1f2937);
  text-align: center;
}

.demo-note strong {
  color: var(--ldesign-brand-color, #1677ff);
  font-weight: var(--ls-font-weight-semibold);
}

/* 响应式设计 */
@media (max-width: var(--ls-breakpoint-md)) {
  .custom-footer {
    padding: var(--ls-spacing-md);
  }

  .template-demo-info {
    margin-top: var(--ls-spacing-md);
    padding: var(--ls-spacing-md);
  }

  .demo-note {
    font-size: var(--ls-font-size-xs);
  }
}

/* 确保TemplateRenderer组件占满整个页面 */
:deep(.template-renderer) {
  min-height: 100vh;
}

/* 模板加载状态样式 - 使用主题色变量 */
:deep(.template-loading) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--ldesign-brand-color, #1677ff) 0%, var(--ldesign-brand-color-8, #004099) 100%);
}

:deep(.template-loading__spinner) {
  width: var(--ls-spinner-size);
  height: var(--ls-spinner-size);
  border: var(--ls-border-width-thick) solid var(--ldesign-brand-color-3, rgba(255, 255, 255, 0.3));
  border-top: var(--ls-border-width-thick) solid var(--ldesign-bg-color-page, white);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--ls-spacing-lg);
}

:deep(.template-loading__text) {
  color: var(--ldesign-bg-color-page, white);
  font-size: var(--ls-font-size-base);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模板错误状态样式 - 使用主题色变量 */
:deep(.template-error) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--ldesign-danger-color, #ff4d4f) 0%, var(--ldesign-brand-color-9, #b8d5ff) 100%);
  color: var(--ldesign-bg-color-page, white);
  text-align: center;
  padding: 2rem;
}

:deep(.template-error__icon) {
  font-size: var(--ls-font-size-3xl);
  margin-bottom: var(--ls-spacing-lg);
  color: var(--ldesign-bg-color-page, white);
}

:deep(.template-error__message) {
  font-size: var(--ls-font-size-lg);
  margin-bottom: var(--ls-spacing-xl);
  color: var(--ldesign-bg-color-page, white);
}

:deep(.template-error__retry) {
  padding: var(--ls-spacing-md) var(--ls-spacing-xl);
  background: var(--ldesign-surface-variant, rgba(255, 255, 255, 0.2));
  color: var(--ldesign-bg, white);
  border: var(--ls-border-width) solid var(--ldesign-border, rgba(255, 255, 255, 0.3));
  border-radius: var(--ls-border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: var(--ls-font-weight-medium);
}

:deep(.template-error__retry:hover) {
  background: var(--ldesign-surface, rgba(255, 255, 255, 0.3));
  transform: translateY(var(--ls-transform-hover-y));
  box-shadow: var(--ls-shadow-sm);
}
</style>
