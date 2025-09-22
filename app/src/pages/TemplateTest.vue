<template>
  <div class="template-test-page">
    <div class="page-header">
      <h1>模板选择器测试页面</h1>
      <p>测试所有模板都能正确显示模板选择器</p>
    </div>

    <div class="test-sections">
      <!-- 登录模板测试 -->
      <section class="test-section">
        <h2>登录模板测试</h2>
        <div class="device-tabs">
          <button 
            v-for="device in devices" 
            :key="`login-${device}`"
            @click="setLoginDevice(device)"
            :class="['device-tab', { active: loginDevice === device }]"
          >
            {{ deviceNames[device] }}
          </button>
        </div>
        <div class="template-container">
          <TemplateRenderer
            key="login-test"
            category="login"
            :device="loginDevice"
            :show-selector="true"
            :responsive="false"
            :cache-selection="true"
            :props="loginProps"
            @template-change="onLoginTemplateChange"
            @load-error="onLoadError"
            @load-success="onLoadSuccess"
          >
            <template #content>
              <div class="test-content">
                <h3>登录模板内容区域</h3>
                <p>当前设备：{{ loginDevice }}</p>
                <p>当前模板：{{ currentLoginTemplate || '默认' }}</p>
              </div>
            </template>
          </TemplateRenderer>
        </div>
      </section>

      <!-- Dashboard模板测试 -->
      <section class="test-section">
        <h2>Dashboard模板测试</h2>
        <div class="device-tabs">
          <button 
            v-for="device in devices" 
            :key="`dashboard-${device}`"
            @click="setDashboardDevice(device)"
            :class="['device-tab', { active: dashboardDevice === device }]"
          >
            {{ deviceNames[device] }}
          </button>
        </div>
        <div class="template-container">
          <TemplateRenderer
            key="dashboard-test"
            category="dashboard"
            :device="dashboardDevice"
            :show-selector="true"
            :responsive="false"
            :cache-selection="true"
            :props="dashboardProps"
            @template-change="onDashboardTemplateChange"
            @load-error="onLoadError"
            @load-success="onLoadSuccess"
          >
            <template #content>
              <div class="test-content">
                <h3>Dashboard模板内容区域</h3>
                <p>当前设备：{{ dashboardDevice }}</p>
                <p>当前模板：{{ currentDashboardTemplate || '默认' }}</p>
              </div>
            </template>
          </TemplateRenderer>
        </div>
      </section>
    </div>

    <!-- 测试日志 -->
    <section class="test-logs">
      <h2>测试日志</h2>
      <div class="log-container">
        <div v-for="(log, index) in logs" :key="index" :class="['log-item', log.type]">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
      <button @click="clearLogs" class="clear-logs-btn">清除日志</button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TemplateRenderer } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'

// 设备类型
const devices: DeviceType[] = ['desktop', 'tablet', 'mobile']
const deviceNames = {
  desktop: '桌面端',
  tablet: '平板端',
  mobile: '移动端'
}

// 当前设备
const loginDevice = ref<DeviceType>('desktop')
const dashboardDevice = ref<DeviceType>('desktop')

// 当前模板
const currentLoginTemplate = ref<string>()
const currentDashboardTemplate = ref<string>()

// 模板属性
const loginProps = computed(() => ({
  title: '模板测试登录',
  subtitle: '测试模板选择器功能',
  primaryColor: 'var(--ldesign-brand-color)',
}))

const dashboardProps = computed(() => ({
  title: '模板测试Dashboard',
  primaryColor: 'var(--ldesign-brand-color)',
}))

// 测试日志
const logs = ref<Array<{ time: string, message: string, type: string }>>([])

// 设备切换
const setLoginDevice = (device: DeviceType) => {
  loginDevice.value = device
  addLog(`切换登录模板设备为：${deviceNames[device]}`, 'info')
}

const setDashboardDevice = (device: DeviceType) => {
  dashboardDevice.value = device
  addLog(`切换Dashboard模板设备为：${deviceNames[device]}`, 'info')
}

// 事件处理
const onLoginTemplateChange = (templateName: string) => {
  currentLoginTemplate.value = templateName
  addLog(`登录模板切换为：${templateName} (${deviceNames[loginDevice.value]})`, 'success')
}

const onDashboardTemplateChange = (templateName: string) => {
  currentDashboardTemplate.value = templateName
  addLog(`Dashboard模板切换为：${templateName} (${deviceNames[dashboardDevice.value]})`, 'success')
}

const onLoadError = (error: Error) => {
  addLog(`模板加载失败：${error.message}`, 'error')
}

const onLoadSuccess = (template?: any) => {
  addLog(`模板加载成功：${template?.name || '未知'}`, 'success')
}

// 日志管理
const addLog = (message: string, type: string = 'info') => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString(),
    message,
    type
  })
  // 限制日志数量
  if (logs.value.length > 50) {
    logs.value = logs.value.slice(0, 50)
  }
}

const clearLogs = () => {
  logs.value = []
  addLog('日志已清除', 'info')
}

// 组件挂载
onMounted(() => {
  addLog('模板测试页面已加载', 'info')
})
</script>

<style lang="less" scoped>
.template-test-page {
  padding: var(--ls-padding-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    color: var(--ldesign-text-color-secondary);
  }
}

.test-sections {
  display: grid;
  gap: var(--ls-spacing-xl);
  margin-bottom: var(--ls-margin-xl);
}

.test-section {
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-container);

  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-lg);
  }
}

.device-tabs {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-lg);
}

.device-tab {
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
  }

  &.active {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);
  }
}

.template-container {
  min-height: 400px;
  border: 2px dashed var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  position: relative;
}

.test-content {
  padding: var(--ls-padding-lg);
  text-align: center;
  color: var(--ldesign-text-color-secondary);

  h3 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
  }

  p {
    margin-bottom: var(--ls-margin-sm);
  }
}

.test-logs {
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-lg);
  background: var(--ldesign-bg-color-container);

  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-lg);
  }
}

.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-page);
  margin-bottom: var(--ls-margin-base);
}

.log-item {
  display: flex;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-xs) 0;
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  &:last-child {
    border-bottom: none;
  }

  &.info {
    color: var(--ldesign-text-color-primary);
  }

  &.success {
    color: var(--ldesign-success-color);
  }

  &.error {
    color: var(--ldesign-error-color);
  }
}

.log-time {
  font-size: var(--ls-font-size-xs);
  color: var(--ldesign-text-color-placeholder);
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.clear-logs-btn {
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
  }
}
</style>
