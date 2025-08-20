<!--
  Vue I18n 增强功能演示应用
  
  展示所有新增的功能：
  - 增强的组合式API
  - 响应式翻译系统
  - 性能监控
  - 调试工具
  - 高级组件
-->

<template>
  <div class="app">
    <!-- 头部导航 -->
    <header class="header">
      <h1>{{ t('app.title') }}</h1>
      <div class="header-controls">
        <!-- 语言切换器 -->
        <LanguageSwitcher />
        
        <!-- 开发工具切换 -->
        <button 
          v-if="isDev" 
          @click="devTools.isDevMode.value ? devTools.disableAll() : devTools.enableAll()"
          class="dev-toggle"
        >
          {{ devTools.isDevMode.value ? '关闭' : '开启' }} 开发工具
        </button>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="main">
      <!-- 基础翻译演示 -->
      <section class="section">
        <h2>{{ t('demo.basic.title') }}</h2>
        <p>{{ t('demo.basic.description') }}</p>
        
        <!-- 参数化翻译 -->
        <p>{{ t('demo.basic.welcome', { name: userName }) }}</p>
        <input 
          v-model="userName" 
          :placeholder="t('demo.basic.namePlaceholder')"
          class="input"
        />
      </section>

      <!-- 响应式翻译演示 -->
      <section class="section">
        <h2>{{ t('demo.reactive.title') }}</h2>
        
        <!-- 深度响应式翻译 -->
        <div class="demo-item">
          <h3>{{ t('demo.reactive.deepTitle') }}</h3>
          <p>{{ deepTranslation.value }}</p>
          <button @click="changeDeepKey" class="button">
            {{ t('demo.reactive.changeKey') }}
          </button>
        </div>

        <!-- 批量翻译 -->
        <div class="demo-item">
          <h3>{{ t('demo.reactive.batchTitle') }}</h3>
          <ul>
            <li v-for="(text, key) in batchTranslations.translations" :key="key">
              <strong>{{ key }}:</strong> {{ text }}
            </li>
          </ul>
        </div>

        <!-- 计算属性翻译 -->
        <div class="demo-item">
          <h3>{{ t('demo.reactive.computedTitle') }}</h3>
          <p>{{ computedTranslation }}</p>
          <input 
            v-model="dynamicValue" 
            :placeholder="t('demo.reactive.valuePlaceholder')"
            class="input"
          />
        </div>
      </section>

      <!-- 异步翻译演示 -->
      <section class="section">
        <h2>{{ t('demo.async.title') }}</h2>
        
        <div class="demo-item">
          <button @click="loadAsyncTranslation" class="button" :disabled="asyncTranslation.isLoading">
            {{ asyncTranslation.isLoading ? t('demo.async.loading') : t('demo.async.load') }}
          </button>
          
          <div v-if="asyncTranslation.error" class="error">
            {{ t('demo.async.error') }}: {{ asyncTranslation.error }}
          </div>
          
          <div v-else-if="asyncTranslation.value" class="success">
            {{ asyncTranslation.value }}
          </div>
        </div>
      </section>

      <!-- 表单翻译演示 -->
      <section class="section">
        <h2>{{ t('demo.form.title') }}</h2>
        
        <form @submit.prevent="handleFormSubmit" class="form">
          <div class="form-field">
            <label>{{ t('demo.form.email') }}</label>
            <input 
              v-model="formData.email"
              type="email"
              :placeholder="t('demo.form.emailPlaceholder')"
              class="input"
              required
            />
          </div>
          
          <div class="form-field">
            <label>{{ t('demo.form.message') }}</label>
            <textarea 
              v-model="formData.message"
              :placeholder="t('demo.form.messagePlaceholder')"
              class="textarea"
              rows="4"
              required
            />
          </div>
          
          <button type="submit" class="button button--primary">
            {{ t('demo.form.submit') }}
          </button>
        </form>
      </section>
    </main>

    <!-- 开发工具面板 -->
    <div v-if="devTools.isDevMode.value" class="dev-panel">
      <div class="dev-tabs">
        <button 
          v-for="tab in devTabs" 
          :key="tab.id"
          @click="activeDevTab = tab.id"
          :class="['dev-tab', { 'active': activeDevTab === tab.id }]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 性能监控面板 -->
      <div v-if="activeDevTab === 'performance'" class="dev-content">
        <h3>性能监控</h3>
        <div class="metrics">
          <div class="metric">
            <label>翻译次数:</label>
            <span>{{ devTools.performance.metrics.value.translationCount }}</span>
          </div>
          <div class="metric">
            <label>平均时间:</label>
            <span>{{ devTools.performance.metrics.value.averageTranslationTime.toFixed(2) }}ms</span>
          </div>
          <div class="metric">
            <label>慢翻译:</label>
            <span>{{ devTools.performance.metrics.value.slowTranslations.length }}</span>
          </div>
        </div>
        
        <div class="dev-actions">
          <button @click="devTools.performance.clear()" class="button">清除数据</button>
          <button @click="exportPerformanceReport" class="button">导出报告</button>
        </div>
      </div>

      <!-- 调试面板 -->
      <div v-if="activeDevTab === 'debug'" class="dev-content">
        <h3>调试信息</h3>
        <div class="debug-stats">
          <span class="stat error">错误: {{ devTools.debug.errorCount.value }}</span>
          <span class="stat warning">警告: {{ devTools.debug.warningCount.value }}</span>
        </div>
        
        <div class="debug-messages">
          <div 
            v-for="message in devTools.debug.messages.value.slice(0, 10)" 
            :key="message.id"
            :class="['debug-message', `debug-message--${message.level}`]"
          >
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
            <span class="message-level">{{ message.level.toUpperCase() }}</span>
            <span class="message-text">{{ message.message }}</span>
          </div>
        </div>
        
        <div class="dev-actions">
          <button @click="devTools.debug.clearMessages()" class="button">清除消息</button>
          <button @click="exportDebugReport" class="button">导出报告</button>
        </div>
      </div>

      <!-- 覆盖率面板 -->
      <div v-if="activeDevTab === 'coverage'" class="dev-content">
        <h3>翻译覆盖率</h3>
        <div class="coverage-stats">
          <div class="coverage-rate">
            <label>覆盖率:</label>
            <span>{{ (devTools.debug.coverage.value.coverageRate * 100).toFixed(1) }}%</span>
          </div>
          <div class="coverage-details">
            <div>总键数: {{ devTools.debug.coverage.value.totalKeys }}</div>
            <div>已使用: {{ devTools.debug.coverage.value.usedKeys.size }}</div>
            <div>未使用: {{ devTools.debug.coverage.value.unusedKeys.size }}</div>
            <div>缺失: {{ devTools.debug.coverage.value.missingKeys.size }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  useI18n,
  useDeepReactiveTranslation,
  useBatchReactiveTranslation,
  useComputedTranslation,
  useAsyncTranslation,
  useI18nDevTools,
  LanguageSwitcher,
} from '@ldesign/i18n/vue'

// 基础翻译
const { t } = useI18n()

// 用户数据
const userName = ref('Vue开发者')
const dynamicValue = ref('动态值')

// 表单数据
const formData = reactive({
  email: '',
  message: '',
})

// 深度响应式翻译
const deepKey = ref('demo.reactive.deepMessage1')
const deepTranslation = useDeepReactiveTranslation(
  deepKey,
  computed(() => ({ value: dynamicValue.value }))
)

// 批量翻译
const batchKeys = ref(['demo.batch.item1', 'demo.batch.item2', 'demo.batch.item3'])
const batchTranslations = useBatchReactiveTranslation(batchKeys)

// 计算属性翻译
const computedTranslation = useComputedTranslation(
  () => 'demo.reactive.computedMessage',
  () => ({ value: dynamicValue.value, count: dynamicValue.value.length })
)

// 异步翻译
const asyncTranslation = useAsyncTranslation()

// 开发工具
const isDev = process.env.NODE_ENV === 'development'
const devTools = useI18nDevTools({
  performance: { enabled: true, slowThreshold: 5 },
  debug: { enabled: true, trackCoverage: true },
})

// 开发面板状态
const activeDevTab = ref('performance')
const devTabs = [
  { id: 'performance', label: '性能' },
  { id: 'debug', label: '调试' },
  { id: 'coverage', label: '覆盖率' },
]

// 方法
const changeDeepKey = () => {
  const keys = ['demo.reactive.deepMessage1', 'demo.reactive.deepMessage2', 'demo.reactive.deepMessage3']
  const currentIndex = keys.indexOf(deepKey.value)
  deepKey.value = keys[(currentIndex + 1) % keys.length]
}

const loadAsyncTranslation = async () => {
  await asyncTranslation.load('demo.async.result', { timestamp: Date.now() })
}

const handleFormSubmit = () => {
  console.log('表单提交:', formData)
  // 重置表单
  formData.email = ''
  formData.message = ''
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const exportPerformanceReport = () => {
  const report = devTools.performance.exportReport()
  console.log('性能报告:', report)
  // 在实际应用中，可以下载或发送到服务器
}

const exportDebugReport = () => {
  const report = devTools.debug.exportReport()
  console.log('调试报告:', report)
  // 在实际应用中，可以下载或发送到服务器
}
</script>

<style scoped>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.dev-toggle {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.main {
  display: grid;
  gap: 40px;
}

.section {
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.demo-item {
  margin: 20px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
}

.input, .textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.button {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.button:hover {
  background: #e9e9e9;
}

.button--primary {
  background: #007acc;
  color: white;
  border-color: #007acc;
}

.button--primary:hover {
  background: #005a9e;
}

.form {
  display: grid;
  gap: 16px;
  max-width: 400px;
}

.form-field {
  display: grid;
  gap: 4px;
}

.error {
  color: #d32f2f;
  padding: 8px;
  background: #ffebee;
  border-radius: 4px;
}

.success {
  color: #2e7d32;
  padding: 8px;
  background: #e8f5e8;
  border-radius: 4px;
}

/* 开发工具面板样式 */
.dev-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow: hidden;
}

.dev-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
}

.dev-tab {
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.dev-tab.active {
  border-bottom-color: #007acc;
  color: #007acc;
}

.dev-content {
  padding: 16px;
  height: 200px;
  overflow-y: auto;
}

.metrics, .debug-stats, .coverage-details {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.metric {
  display: flex;
  justify-content: space-between;
}

.debug-messages {
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.debug-message {
  display: flex;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
  font-family: monospace;
}

.debug-message--error {
  color: #d32f2f;
}

.debug-message--warn {
  color: #f57c00;
}

.debug-message--info {
  color: #1976d2;
}

.debug-message--debug {
  color: #666;
}

.dev-actions {
  display: flex;
  gap: 8px;
}

.stat {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stat.error {
  background: #ffebee;
  color: #d32f2f;
}

.stat.warning {
  background: #fff3e0;
  color: #f57c00;
}

.coverage-rate {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}
</style>
