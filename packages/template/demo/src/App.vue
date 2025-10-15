<script setup lang="ts">
import type { SwitcherConfig } from '../../src/vue/components/EnhancedTemplateSwitcher.vue'
import { ref } from 'vue'
import { EnhancedTemplateSwitcher, TemplateRenderer } from '../../src/vue/components'

// 当前模板和设备
const currentTemplate = ref('')
const currentDevice = ref('desktop')
const templateKey = ref(0)

// 切换器配置
const switcherConfig: SwitcherConfig = {
  position: 'top-right',
  style: 'floating',
  selectorType: 'dropdown', // 可以改为 'buttons' 或 'cards'
  collapsible: true,
  showDevice: true,
  showLabel: true,
  showInfo: false, // 设为 true 显示作者和版本
  animation: 'slide',
  animationDuration: 300,
  sortBy: 'default',
  sortOrder: 'asc',
}

// 动画配置
const transitionName = ref('template-fade')
const isTransitioning = ref(false)

// 处理模板切换
function handleTemplateChange(templateName: string) {
  console.log('切换模板:', templateName)

  // 触发动画
  isTransitioning.value = true
  transitionName.value = currentDevice.value === 'mobile' ? 'template-slide' : 'template-fade'

  // 更新模板
  currentTemplate.value = templateName
  templateKey.value++ // 强制重新渲染
}

// 处理设备变化
function handleDeviceChange(device: string) {
  console.log('设备变化:', device)
  
  // 只在设备真的变化时处理
  if (currentDevice.value === device) {
    return
  }
  
  currentDevice.value = device
  
  // 设备变化时清空当前模板，让系统自动选择新设备的默认模板
  currentTemplate.value = ''

  // 设备变化时使用不同的动画
  transitionName.value = 'template-scale'
  // 不要在设备变化时更新 templateKey，这会导致组件重新挂载
  // templateKey.value++
}

// 处理模板加载完成
function handleTemplateLoaded(templateName: string) {
  console.log('模板已加载:', templateName)
  if (!currentTemplate.value) {
    currentTemplate.value = templateName
  }
}

// 动画钩子
function handleBeforeLeave() {
  console.log('Template leaving...')
}

function handleEnter() {
  console.log('Template entering...')
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

// 模板属性
const templateProps = {
  title: '欢迎登录',
  subtitle: '请输入您的账号和密码',
  onLogin: async (data: any) => {
    console.log('登录数据:', data)
    alert(`登录成功！\n用户名: ${data.username}`)
  },
  onRegister: () => {
    alert('注册功能')
  },
  onForgotPassword: () => {
    alert('忘记密码功能')
  },
}
</script>

<template>
  <div class="app">
    <!-- 模板切换动画 -->
    <transition
      :name="transitionName"
      mode="out-in"
      @before-leave="handleBeforeLeave"
      @enter="handleEnter"
    >
      <div :key="currentTemplate + '_' + currentDevice.value" class="template-container">
        <TemplateRenderer
          category="login"
          :template-name="currentTemplate || undefined"
          :responsive="true"
          :props="templateProps"
          @template-change="handleTemplateLoaded"
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
      </div>
    </transition>
  </div>
</template>

<style scoped>
.app {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.template-container {
  width: 100%;
  min-height: 100vh;
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

/* 旋转动画 (可选) */
.template-rotate-enter-active,
.template-rotate-leave-active {
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.template-rotate-enter-from {
  transform: rotate(180deg) scale(0.8);
  opacity: 0;
}

.template-rotate-leave-to {
  transform: rotate(-180deg) scale(0.8);
  opacity: 0;
}
</style>
