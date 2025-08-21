<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <h1>@ldesign/i18n</h1>
      <p>Vue Engine Example</p>
    </header>

    <!-- 控制面板 -->
    <div class="controls">
      <div class="control-group">
        <label>Language:</label>
        <LanguageSwitcher
          :show-flag="true"
          :show-code="false"
          mode="dropdown"
          @language-changed="onLanguageChanged">
        </LanguageSwitcher>
      </div>
      
      <div class="control-group">
        <label>Engine Status:</label>
        <div class="status-indicator" :class="{ active: engineStatus.isActive }">
          {{ engineStatus.isActive ? 'Active' : 'Inactive' }}
        </div>
      </div>
      
      <div class="control-group">
        <button @click="showEngineInfo = !showEngineInfo" class="btn btn-secondary">
          {{ showEngineInfo ? 'Hide' : 'Show' }} Engine Info
        </button>
      </div>
    </div>

    <!-- Engine 信息面板 -->
    <div v-if="showEngineInfo" class="engine-info">
      <h3>Engine Information</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>Services ({{ engineStatus.services.length }})</h4>
          <ul>
            <li v-for="service in engineStatus.services" :key="service">
              {{ service }}
            </li>
          </ul>
        </div>
        
        <div class="info-card">
          <h4>Plugins ({{ engineStatus.plugins.length }})</h4>
          <ul>
            <li v-for="plugin in engineStatus.plugins" :key="plugin">
              {{ plugin }}
            </li>
          </ul>
        </div>
        
        <div class="info-card">
          <h4>Events ({{ engineStatus.events.length }})</h4>
          <ul>
            <li v-for="event in engineStatus.events" :key="event">
              {{ event }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 主要内容 -->
    <main class="content">
      <!-- 基础翻译功能 -->
      <section class="section">
        <h2>{{ t('common.ok') }}</h2>
        
        <div class="example-grid">
          <!-- 基础翻译 -->
          <div class="example-card">
            <h3>Basic Translation</h3>
            <div class="demo">
              <p><strong>{{ t('common.ok') }}</strong></p>
              <p><strong>{{ t('common.cancel') }}</strong></p>
              <p><strong>{{ t('common.save') }}</strong></p>
              <p><strong>{{ t('common.delete') }}</strong></p>
              <p><strong>{{ t('common.loading') }}</strong></p>
            </div>
            <div class="code">
              t('common.ok')<br>
              t('common.cancel')<br>
              t('common.save')
            </div>
          </div>

          <!-- 参数插值 -->
          <div class="example-card">
            <h3>Parameter Interpolation</h3>
            <div class="demo">
              <p>{{ t('common.pageOf', { current: 1, total: 10 }) }}</p>
              <p>{{ t('common.showingItems', { start: 1, end: 20, total: 100 }) }}</p>
              <p>{{ t('date.duration.minutes', { count: 5 }) }}</p>
            </div>
            <div class="code">
              t('common.pageOf', { current: 1, total: 10 })<br>
              t('common.showingItems', { start: 1, end: 20, total: 100 })
            </div>
          </div>

          <!-- 复数处理 -->
          <div class="example-card">
            <h3>Pluralization</h3>
            <div class="demo">
              <p>{{ t('date.duration.minutes', { count: 0 }) }}</p>
              <p>{{ t('date.duration.minutes', { count: 1 }) }}</p>
              <p>{{ t('date.duration.minutes', { count: 5 }) }}</p>
            </div>
            <div class="code">
              t('date.duration.minutes', { count: 0 })<br>
              t('date.duration.minutes', { count: 1 })<br>
              t('date.duration.minutes', { count: 5 })
            </div>
          </div>
        </div>
      </section>

      <!-- 组合式API示例 -->
      <section class="section">
        <h2>Composition API Examples</h2>
        
        <div class="example-grid">
          <!-- 批量翻译 -->
          <div class="example-card">
            <h3>Batch Translation</h3>
            <div class="demo">
              <div v-for="(text, key) in batchTranslations" :key="key" class="translation-item">
                <strong>{{ key }}:</strong> {{ text }}
              </div>
            </div>
            <div class="code">
              const batchTranslations = useBatchTranslation([<br>
              &nbsp;&nbsp;'common.save',<br>
              &nbsp;&nbsp;'common.delete',<br>
              &nbsp;&nbsp;'common.edit'<br>
              ])
            </div>
          </div>

          <!-- 条件翻译 -->
          <div class="example-card">
            <h3>Conditional Translation</h3>
            <div class="demo">
              <p>
                <button @click="isOnline = !isOnline" class="btn btn-secondary">
                  Toggle Status
                </button>
              </p>
              <p><strong>Status:</strong> {{ statusText }}</p>
            </div>
            <div class="code">
              const statusText = useConditionalTranslation(<br>
              &nbsp;&nbsp;isOnline,<br>
              &nbsp;&nbsp;'common.online',<br>
              &nbsp;&nbsp;'common.offline'<br>
              )
            </div>
          </div>

          <!-- 响应式语言信息 -->
          <div class="example-card">
            <h3>Reactive Language Info</h3>
            <div class="demo">
              <p><strong>Current:</strong> {{ locale }}</p>
              <p><strong>Available:</strong></p>
              <ul>
                <li v-for="lang in availableLanguages" :key="lang.code">
                  {{ lang.nativeName }} ({{ lang.code }})
                </li>
              </ul>
            </div>
            <div class="code">
              const { locale, availableLanguages } = useI18n()
            </div>
          </div>
        </div>
      </section>

      <!-- Engine 特有功能 -->
      <section class="section">
        <h2>Engine-Specific Features</h2>
        
        <div class="example-grid">
          <!-- 插件生命周期 -->
          <div class="example-card">
            <h3>Plugin Lifecycle</h3>
            <div class="demo">
              <div class="button-group">
                <button @click="restartI18nPlugin" class="btn btn-primary">
                  Restart I18n Plugin
                </button>
                <button @click="showPluginLogs" class="btn btn-secondary">
                  Show Plugin Logs
                </button>
              </div>
              <div v-if="pluginLogs.length > 0" class="logs">
                <div v-for="(log, index) in pluginLogs" :key="index" class="log-entry">
                  {{ log }}
                </div>
              </div>
            </div>
            <div class="code">
              await engine.unuse('i18n')<br>
              await engine.use(i18nEnginePlugin)
            </div>
          </div>

          <!-- 事件系统 -->
          <div class="example-card">
            <h3>Event System</h3>
            <div class="demo">
              <div class="button-group">
                <button @click="emitCustomEvent" class="btn btn-primary">
                  Emit Custom Event
                </button>
                <button @click="clearEventLogs" class="btn btn-secondary">
                  Clear Logs
                </button>
              </div>
              <div v-if="eventLogs.length > 0" class="logs">
                <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
                  {{ log }}
                </div>
              </div>
            </div>
            <div class="code">
              engine.events.on('custom:event', handler)<br>
              engine.events.emit('custom:event', data)
            </div>
          </div>

          <!-- 服务注册 -->
          <div class="example-card">
            <h3>Service Registry</h3>
            <div class="demo">
              <div class="button-group">
                <button @click="registerCustomService" class="btn btn-primary">
                  Register Service
                </button>
                <button @click="unregisterCustomService" class="btn btn-danger">
                  Unregister Service
                </button>
              </div>
              <p v-if="customServiceRegistered">
                <strong>Custom service is registered!</strong>
              </p>
            </div>
            <div class="code">
              engine.state.set('customService', service)<br>
              const service = engine.state.get('customService')
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { i18nEnginePlugin } from '@ldesign/i18n'
import { LanguageSwitcher } from '@ldesign/i18n/vue'
import type { Engine } from '@ldesign/engine'

// 注入 Engine 实例
const engine = inject<Engine>('engine')!

// 获取当前组件实例来访问全局属性
const instance = getCurrentInstance()
const $t = instance?.appContext.config.globalProperties.$t
const $i18n = instance?.appContext.config.globalProperties.$i18n

// 简单的响应式状态
const locale = ref($i18n?.getCurrentLanguage() || 'en')
const isOnline = ref(true)

// 简单的翻译函数
function t(key: string, params?: any) {
  return $t ? $t(key, params) : key
}

// 模拟批量翻译
const batchTranslations = computed(() => ({
  'common.save': t('common.save'),
  'common.delete': t('common.delete'),
  'common.edit': t('common.edit'),
}))

// 模拟条件翻译
const statusText = computed(() => {
  return isOnline.value ? t('common.online') : t('common.offline')
})

// 模拟可用语言
const availableLanguages = computed(() => {
  return $i18n?.getAvailableLanguages() || []
})

// 语言切换方法
function changeLanguage(newLocale: string) {
  if ($i18n?.changeLanguage) {
    $i18n.changeLanguage(newLocale)
    locale.value = newLocale
  }
}

// 处理语言选择器的语言变更事件
function onLanguageChanged(newLocale: string) {
  changeLanguage(newLocale)
}

// Engine 状态
const showEngineInfo = ref(false)
const engineStatus = computed(() => {
  if (!engine) {
    return {
      isActive: false,
      services: [],
      plugins: [],
      events: [],
    }
  }

  return {
    isActive: true,
    services: ['config', 'logger', 'events', 'state', 'plugins'],
    plugins: Array.from(engine.plugins.getAll().keys()),
    events: ['engine:mounted', 'engine:unmounted', 'plugin:registered', 'i18n:languageChanged'],
  }
})

// 插件日志
const pluginLogs = ref<string[]>([])

// 事件日志
const eventLogs = ref<string[]>([])

// 自定义服务状态
const customServiceRegistered = ref(false)

// 重启 i18n 插件
async function restartI18nPlugin() {
  try {
    pluginLogs.value.push('Uninstalling i18n plugin...')
    await engine.unuse('i18n')

    pluginLogs.value.push('Reinstalling i18n plugin...')
    await engine.use(i18nEnginePlugin, {
      defaultLocale: 'en',
      fallbackLocale: 'en',
      autoDetect: true,
      storage: 'localStorage',
      storageKey: 'i18n-vue-engine-locale',
      preload: ['en', 'zh-CN', 'ja'],
    })

    pluginLogs.value.push('I18n plugin restarted successfully!')
  } catch (error) {
    pluginLogs.value.push(`Error: ${error}`)
  }
}

// 显示插件日志
function showPluginLogs() {
  if (pluginLogs.value.length === 0) {
    pluginLogs.value.push('No plugin operations yet. Try restarting the i18n plugin.')
  }
}

// 发出自定义事件
function emitCustomEvent() {
  const timestamp = new Date().toLocaleTimeString()
  const data = { message: 'Hello from Vue!', timestamp }

  engine.events.emit('custom:event', data)
  eventLogs.value.push(`Emitted custom:event at ${timestamp}`)
}

// 清除事件日志
function clearEventLogs() {
  eventLogs.value = []
}

// 注册自定义服务
function registerCustomService() {
  const customService = {
    name: 'CustomService',
    version: '1.0.0',
    greet: () => 'Hello from custom service!',
  }

  engine.state.set('customService', customService)
  customServiceRegistered.value = true
}

// 注销自定义服务
function unregisterCustomService() {
  engine.state.delete('customService')
  customServiceRegistered.value = false
}

// 事件监听器
const eventListeners: Array<() => void> = []

onMounted(() => {
  // 监听自定义事件
  const customEventHandler = (data: any) => {
    eventLogs.value.push(`Received custom:event: ${JSON.stringify(data)}`)
  }
  engine.events.on('custom:event', customEventHandler)
  eventListeners.push(() => engine.events.off('custom:event', customEventHandler))

  // 监听 i18n 事件
  const i18nEventHandler = (data: any) => {
    eventLogs.value.push(`I18n event: ${JSON.stringify(data)}`)
  }
  engine.events.on('i18n:languageChanged', i18nEventHandler)
  eventListeners.push(() => engine.events.off('i18n:languageChanged', i18nEventHandler))

  // 检查自定义服务状态
  customServiceRegistered.value = engine.state.has('customService')
})

onUnmounted(() => {
  // 清理事件监听器
  eventListeners.forEach(cleanup => cleanup())
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 300;
}

.header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.controls {
  padding: 1.5rem;
  background: white;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  font-weight: 500;
  color: #495057;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: #dc3545;
  color: white;
}

.status-indicator.active {
  background-color: #28a745;
}

.engine-info {
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.engine-info h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-card {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #e9ecef;
}

.info-card h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.info-card li {
  padding: 0.25rem 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.content {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  color: #343a40;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.example-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.example-card h3 {
  margin: 0 0 1rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.demo {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  border: 1px solid #e9ecef;
}

.code {
  background: #f1f3f4;
  padding: 0.75rem;
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875rem;
  color: #495057;
  white-space: pre-line;
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
  border-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
  border-color: #c82333;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.translation-item {
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
}

.translation-item:last-child {
  border-bottom: none;
}

.logs {
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.log-entry {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.75rem;
  color: #495057;
  padding: 0.25rem 0;
  border-bottom: 1px solid #e9ecef;
}

.log-entry:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-group {
    justify-content: space-between;
  }

  .example-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
