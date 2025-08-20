<script setup lang="ts">
import { useRouter, useQuery } from '@ldesign/router'
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/app'
import {
  TemplateRenderer,
  TemplateSelector,
  useTemplate,
} from '@ldesign/template/vue'
import LoginPanel from '../components/LoginPanel.vue'

const router = useRouter()
const query = useQuery()
const appStore = useAppStore()

// 使用模板系统，启用自动设备检测和模板切换
const {
  currentDevice,
  currentTemplate,
  availableTemplates,
  switchTemplate,
  loading,
  error,
} = useTemplate({
  category: 'login',
  autoScan: true,
  autoDetectDevice: true, // 启用自动设备检测
  debug: true, // 启用调试模式以便观察设备变化
})

// 登录处理
async function handleLogin(loginData: any) {
  const success = appStore.login(loginData.username, loginData.password)
  if (success) {
    const redirect = (query.value.redirect as string) || '/home'
    await router.push(redirect)
  }
}

// 注册处理
function handleRegister() {
  router.push('/register')
}

// 忘记密码处理
function handleForgotPassword() {
  alert('忘记密码功能待实现')
}

// 第三方登录处理
function handleThirdPartyLogin(data: any) {
  alert(`使用 ${data.provider} 登录`)
}

// 动画类型选择状态
const selectedTransition = ref<'fade' | 'slide' | 'scale' | 'flip'>('fade')

// 传递给模板的属性
const templateProps = computed(() => ({
  // 传递 LoginPanel 组件
  loginPanel: LoginPanel,
}))

// 模板选择器事件处理
function handleTemplateChange(template: string) {
  console.log('用户选择了模板:', template)
  switchTemplate('login', currentDevice.value, template)
}

// 切换动画类型
function switchTransition(type: 'fade' | 'slide' | 'scale' | 'flip') {
  selectedTransition.value = type
}
</script>

<template>
  <div class="login-container">
    <!-- 内置模板选择器 -->
    <div class="template-selector-panel">
      <TemplateSelector
        category="login"
        :device="currentDevice"
        :current-template="currentTemplate?.template"
        :templates="availableTemplates"
        :show-preview="false"
        :show-search="true"
        layout="list"
        :show-info="false"
        @template-change="handleTemplateChange"
      />
    </div>

    <!-- 模板渲染器 -->
    <TemplateRenderer
      category="login"
      :device="currentDevice"
      :template="currentTemplate?.template"
      :template-props="templateProps"
      :transition="true"
      :transition-type="selectedTransition"
      :transition-duration="400"
      @login="handleLogin"
      @register="handleRegister"
      @forgot-password="handleForgotPassword"
      @third-party-login="handleThirdPartyLogin"
    />
  </div>
</template>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.template-selector {
  position: fixed;
  top: 0;
  right: auto;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;

  h3 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
  }

  hr {
    margin: 15px 0;
    border: none;
    border-top: 1px solid #eee;
  }

  button {
    display: block;
    width: 100%;
    margin: 5px 0;
    padding: 8px 12px;
    border: 1px solid #ddd;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      border-color: #ccc;
    }

    &.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }
  }
}

@media (max-width: 768px) {
  .template-selector {
    position: relative;
    top: auto;
    right: auto;
    margin: 10px;
    order: -1;
  }
}
</style>
