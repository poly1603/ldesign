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

/* 自定义footer样式 */
.custom-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
}

.back-link:hover {
  color: #764ba2;
  background: rgba(255, 255, 255, 0.2);
}

.footer-text {
  margin: 0;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
}

/* 模板演示信息样式 */
.template-demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.demo-note {
  margin: 0;
  font-size: 0.9rem;
  color: #2c3e50;
  text-align: center;
}

.demo-note strong {
  color: #667eea;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .custom-footer {
    padding: 0.75rem;
  }

  .template-demo-info {
    margin-top: 0.75rem;
    padding: 0.75rem;
  }

  .demo-note {
    font-size: 0.8rem;
  }
}

/* 确保TemplateRenderer组件占满整个页面 */
:deep(.template-renderer) {
  min-height: 100vh;
}

/* 模板加载状态样式 */
:deep(.template-loading) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

:deep(.template-loading__spinner) {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

:deep(.template-loading__text) {
  color: white;
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 模板错误状态样式 */
:deep(.template-error) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  text-align: center;
  padding: 2rem;
}

:deep(.template-error__icon) {
  font-size: 3rem;
  margin-bottom: 1rem;
}

:deep(.template-error__message) {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
}

:deep(.template-error__retry) {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

:deep(.template-error__retry:hover) {
  background: rgba(255, 255, 255, 0.3);
}
</style>
