<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer, useTemplate } from '@ldesign/template/vue'
import { computed, ref, watch } from 'vue'
import LoginPanel from '../components/LoginPanel.vue'

// 使用模板系统
const {
  currentDevice,
  currentTemplate,
  availableTemplates,
  switchTemplate,
  loading,
  error,
  scanTemplates,
} = useTemplate({
  category: 'login',
  autoScan: true,
  autoDetectDevice: true,
  debug: true, // 启用调试模式
})

// 测试状态
const forceTemplate = ref('')
const testLogs = ref<Array<{ time: string, message: string, type: 'info' | 'success' | 'warning' | 'error' }>>([])

// 计算属性
const availableTemplatesForDevice = computed(() => {
  return availableTemplates.value.filter(t => t.device === currentDevice.value)
})

// 模板属性
const templateProps = {
  loginPanel: LoginPanel,
  title: '智能回退测试',
  subtitle: '测试设备切换时的模板回退机制',
  showRememberMe: true,
  showForgotPassword: true,
  showThirdPartyLogin: true,
}

// 添加日志
function addLog(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
  const time = new Date().toLocaleTimeString()
  testLogs.value.unshift({ time, message, type })

  // 限制日志数量
  if (testLogs.value.length > 50) {
    testLogs.value = testLogs.value.slice(0, 50)
  }
}

// 设备切换处理
async function handleDeviceChange() {
  addLog(`切换到设备类型: ${currentDevice.value}`, 'info')

  try {
    // 如果有强制指定的模板，尝试使用它
    if (forceTemplate.value) {
      const hasTemplate = availableTemplatesForDevice.value.some(t => t.template === forceTemplate.value)

      if (hasTemplate) {
        await switchTemplate('login', currentDevice.value, forceTemplate.value)
        addLog(`成功使用指定模板: ${forceTemplate.value}`, 'success')
      }
      else {
        addLog(`指定模板 ${forceTemplate.value} 在 ${currentDevice.value} 设备上不存在，将使用智能回退`, 'warning')
        // 清空强制模板，让系统自动选择
        forceTemplate.value = ''
      }
    }
  }
  catch (err) {
    addLog(`设备切换失败: ${err}`, 'error')
  }
}

// 模板切换处理
async function handleTemplateChange() {
  if (!forceTemplate.value)
    return

  try {
    await switchTemplate('login', currentDevice.value, forceTemplate.value)
    addLog(`手动切换到模板: ${forceTemplate.value}`, 'success')
  }
  catch (err) {
    addLog(`模板切换失败: ${err}`, 'error')
  }
}

// 测试所有设备切换
async function testAllDevices() {
  const devices: DeviceType[] = ['desktop', 'mobile', 'tablet']
  const testTemplates = ['modern', 'classic', 'simple', 'card', 'split']

  addLog('开始自动测试所有设备切换...', 'info')

  for (const device of devices) {
    addLog(`测试设备: ${device}`, 'info')
    currentDevice.value = device

    // 等待设备切换完成
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 测试不存在的模板
    for (const template of testTemplates) {
      const hasTemplate = availableTemplatesForDevice.value.some(t => t.template === template)

      if (!hasTemplate) {
        addLog(`测试不存在的模板: ${template} (在 ${device} 设备上)`, 'warning')

        try {
          forceTemplate.value = template
          await handleTemplateChange()
        }
        catch (err) {
          addLog(`预期的错误: ${err}`, 'info')
        }

        // 重置
        forceTemplate.value = ''
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
  }

  addLog('自动测试完成', 'success')
}

// 事件处理
function handleLogin(data: any) {
  addLog(`登录事件: ${JSON.stringify(data)}`, 'info')
}

function handleRegister() {
  addLog('注册事件', 'info')
}

function handleForgotPassword() {
  addLog('忘记密码事件', 'info')
}

function handleThirdPartyLogin(data: any) {
  addLog(`第三方登录事件: ${JSON.stringify(data)}`, 'info')
}

// 监听模板变化
watch(currentTemplate, (newTemplate, oldTemplate) => {
  if (newTemplate && oldTemplate && newTemplate.template !== oldTemplate.template) {
    addLog(`模板自动切换: ${oldTemplate.template} → ${newTemplate.template}`, 'success')
  }
})

// 监听错误
watch(error, (newError) => {
  if (newError) {
    addLog(`系统错误: ${newError.message}`, 'error')
  }
})

// 初始化日志
addLog('设备切换测试页面已加载', 'info')
</script>

<template>
  <div class="device-switch-test">
    <div class="test-header">
      <h1>设备切换智能回退测试</h1>
      <p>测试当设备类型变化时，模板系统的智能回退机制</p>
    </div>

    <div class="test-controls">
      <div class="control-group">
        <label>当前设备类型:</label>
        <select v-model="currentDevice" @change="handleDeviceChange">
          <option value="desktop">
            Desktop (桌面端)
          </option>
          <option value="mobile">
            Mobile (移动端)
          </option>
          <option value="tablet">
            Tablet (平板端)
          </option>
        </select>
      </div>

      <div class="control-group">
        <label>强制指定模板:</label>
        <select v-model="forceTemplate" @change="handleTemplateChange">
          <option value="">
            自动选择
          </option>
          <option value="adaptive">
            Adaptive (自适应)
          </option>
          <option value="classic">
            Classic (经典)
          </option>
          <option value="default">
            Default (默认)
          </option>
          <option value="modern">
            Modern (现代)
          </option>
          <option value="card">
            Card (卡片)
          </option>
          <option value="simple">
            Simple (简洁)
          </option>
          <option value="split">
            Split (分屏)
          </option>
        </select>
      </div>

      <button class="test-button" @click="testAllDevices">
        测试所有设备切换
      </button>
    </div>

    <div class="test-info">
      <div class="info-section">
        <h3>当前状态</h3>
        <ul>
          <li><strong>设备类型:</strong> {{ currentDevice }}</li>
          <li><strong>当前模板:</strong> {{ currentTemplate?.template || '无' }}</li>
          <li><strong>模板名称:</strong> {{ currentTemplate?.name || '无' }}</li>
          <li><strong>是否加载中:</strong> {{ loading ? '是' : '否' }}</li>
          <li><strong>错误信息:</strong> {{ error?.message || '无' }}</li>
        </ul>
      </div>

      <div class="info-section">
        <h3>可用模板 ({{ currentDevice }})</h3>
        <ul>
          <li v-for="template in availableTemplatesForDevice" :key="template.id">
            <strong>{{ template.template }}</strong> - {{ template.name }}
            <span v-if="template.template === currentTemplate?.template" class="current-badge">当前</span>
          </li>
        </ul>
      </div>

      <div class="info-section">
        <h3>测试日志</h3>
        <div class="log-container">
          <div v-for="(log, index) in testLogs" :key="index" class="log-entry" :class="[log.type]">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="template-preview">
      <h3>模板预览</h3>
      <div class="preview-container">
        <TemplateRenderer
          category="login"
          :device="currentDevice"
          :template="forceTemplate || currentTemplate?.template"
          :template-props="templateProps"
          @login="handleLogin"
          @register="handleRegister"
          @forgot-password="handleForgotPassword"
          @third-party-login="handleThirdPartyLogin"
          @template-change="handleTemplateChange"
        />
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.device-switch-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-header {
  text-align: center;
  margin-bottom: 30px;

  h1 {
    color: #333;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 14px;
  }
}

.test-controls {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  flex-wrap: wrap;

  .control-group {
    display: flex;
    align-items: center;
    gap: 10px;

    label {
      font-weight: 500;
      color: #333;
    }

    select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }
  }

  .test-button {
    padding: 10px 20px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;

    &:hover {
      background: #0056b3;
    }
  }
}

.test-info {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  .info-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 5px;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        padding: 5px 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .current-badge {
      background: #28a745;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 12px;
      margin-left: 10px;
    }
  }
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 4px;

  .log-entry {
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #999;
      margin-right: 10px;
      font-family: monospace;
    }

    &.info {
      background: #f8f9fa;
    }

    &.success {
      background: #d4edda;
      color: #155724;
    }

    &.warning {
      background: #fff3cd;
      color: #856404;
    }

    &.error {
      background: #f8d7da;
      color: #721c24;
    }
  }
}

.template-preview {
  h3 {
    margin-bottom: 15px;
    color: #333;
  }

  .preview-container {
    border: 2px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    min-height: 500px;
  }
}

@media (max-width: 768px) {
  .test-info {
    grid-template-columns: 1fr;
  }

  .test-controls {
    flex-direction: column;
    align-items: stretch;

    .control-group {
      justify-content: space-between;
    }
  }
}
</style>
