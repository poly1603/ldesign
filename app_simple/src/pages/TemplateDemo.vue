<template>
  <div class="template-demo">
    <h1>模板系统演示</h1>
    
    <!-- 设备模拟控制 -->
    <div class="device-simulator">
      <h2>设备模拟器</h2>
      <div class="device-buttons">
        <button 
          v-for="device in devices" 
          :key="device.name"
          :class="{ active: currentDevice === device.name }"
          @click="setDevice(device.name)"
        >
          {{ device.label }}
          <span class="device-size">({{ device.width }}x{{ device.height }})</span>
        </button>
      </div>
      <div class="current-device-info">
        当前设备: {{ currentDevice }} | 
        窗口大小: {{ windowWidth }}x{{ windowHeight }}
      </div>
    </div>

    <!-- 模板切换演示 -->
    <div class="template-container">
      <TemplateRenderer 
        category="login"
        :template-name="selectedTemplate"
        :responsive="isResponsive"
        :props="loginProps"
        @template-loaded="onTemplateLoaded"
      >
        <template #switcher>
          <EnhancedTemplateSwitcher
            category="login"
            :current-template="selectedTemplate"
            :config="switcherConfig"
            @change="onTemplateChange"
            @device-change="onDeviceChange"
          />
        </template>
      </TemplateRenderer>
    </div>

    <!-- 调试信息 -->
    <div class="debug-panel" v-if="showDebug">
      <h3>调试信息</h3>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { TemplateRenderer, EnhancedTemplateSwitcher, useTemplateManager } from '@ldesign/template'
import type { SwitcherConfig } from '@ldesign/template'

// 导入所有模板样式
import '@ldesign/template/es/index.css'
import '@ldesign/template/es/templates/login/desktop/default/index.vue.css'
import '@ldesign/template/es/templates/login/desktop/split/index.vue.css'
import '@ldesign/template/es/templates/login/mobile/default/index.vue.css'
import '@ldesign/template/es/templates/login/mobile/card/index.vue.css'
import '@ldesign/template/es/templates/login/tablet/simple/index.vue.css'
import '@ldesign/template/es/templates/login/tablet/landscape/index.vue.css'

// 设备配置
const devices = [
  { name: 'desktop', label: '桌面端', width: 1920, height: 1080 },
  { name: 'tablet', label: '平板端', width: 768, height: 1024 },
  { name: 'mobile', label: '移动端', width: 375, height: 667 },
]

// 状态
const currentDevice = ref('desktop')
const selectedTemplate = ref('')
const isResponsive = ref(true)
const showDebug = ref(true)
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 获取模板管理器
const { manager } = useTemplateManager()

// 切换器配置
const switcherConfig = computed<SwitcherConfig>(() => ({
  position: 'top-right',
  style: 'card',
  selectorType: 'cards', // 使用卡片式选择器
  collapsible: false,
  showDevice: true,
  showLabel: true,
  showInfo: true,
  showTitle: true,
  title: '选择模板',
  animation: 'slide',
  animationDuration: 300,
  sortBy: 'default',
  sortOrder: 'asc',
}))

// 登录模板属性
const loginProps = computed(() => ({
  title: '欢迎使用 LDesign',
  subtitle: '多模板登录系统演示',
  logo: '/logo.svg',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  onLogin: async (data: any) => {
    console.log('登录数据:', data)
    alert(`登录演示\n用户名: ${data.username}\n密码: ${data.password}\n记住我: ${data.remember}`)
  },
  onRegister: () => {
    alert('注册功能演示')
  },
  onForgotPassword: () => {
    alert('忘记密码功能演示')
  },
}))

// 调试信息
const debugInfo = computed(() => {
  const templates = manager?.query({ category: 'login' }) || []
  return {
    当前设备: currentDevice.value,
    当前模板: selectedTemplate.value || '自动选择',
    响应式: isResponsive.value,
    窗口大小: `${windowWidth.value}x${windowHeight.value}`,
    已注册模板: templates.length,
    模板列表: templates.map(t => ({
      id: t.id,
      name: t.metadata.name,
      device: t.metadata.device,
      displayName: t.metadata.displayName,
      isDefault: t.metadata.isDefault,
    }))
  }
})

// 设置设备
function setDevice(device: string) {
  console.log('手动设置设备:', device)
  currentDevice.value = device
  
  // 模拟不同设备的窗口大小
  const deviceConfig = devices.find(d => d.name === device)
  if (deviceConfig) {
    windowWidth.value = deviceConfig.width
    windowHeight.value = deviceConfig.height
  }
  
  // 清空选择的模板，让系统自动选择
  selectedTemplate.value = ''
}

// 模板变化处理
function onTemplateChange(templateName: string) {
  console.log('用户选择模板:', templateName)
  selectedTemplate.value = templateName
}

// 设备变化处理
function onDeviceChange(device: string) {
  console.log('系统检测到设备变化:', device)
  currentDevice.value = device
}

// 模板加载完成
function onTemplateLoaded(info: any) {
  console.log('模板加载完成:', info)
}

// 监听窗口大小变化
function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  console.log('模板演示页面已加载')
  
  // 显示已注册的模板
  if (manager) {
    const allTemplates = manager.query({})
    console.log('所有已注册模板:', allTemplates)
    
    const loginTemplates = manager.query({ category: 'login' })
    console.log('登录类别模板:', loginTemplates)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.template-demo {
  min-height: 100vh;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 30px;
}

.device-simulator {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-simulator h2 {
  margin-top: 0;
  color: #666;
  font-size: 18px;
}

.device-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.device-buttons button {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.device-buttons button:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.device-buttons button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.device-size {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.current-device-info {
  padding: 10px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 14px;
  color: #666;
}

.template-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-height: 600px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.debug-panel {
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.debug-panel h3 {
  margin-top: 0;
  color: #58a6ff;
}

.debug-panel pre {
  margin: 0;
  font-family: 'Cascadia Code', 'Fira Code', monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
}
</style>