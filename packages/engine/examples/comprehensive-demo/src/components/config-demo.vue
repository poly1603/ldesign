<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine?: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const configKey = ref('app.theme')
const configValue = ref('dark')
const configResult = ref('')
const batchConfig = ref(`{
  "app": {
    "theme": "dark",
    "language": "zh-CN",
    "debug": true
  },
  "ui": {
    "density": "comfortable",
    "animations": true
  }
}`)
const watchKey = ref('app.theme')
const isWatching = ref(false)
const currentConfig = reactive({})

let unwatchConfig: (() => void) | null = null

// 预设配置
const presets = [
  {
    name: '开发环境',
    config: {
      app: { theme: 'dark', debug: true, logLevel: 'debug' },
      ui: { density: 'comfortable', animations: true },
      performance: { enableMonitoring: true },
    },
  },
  {
    name: '生产环境',
    config: {
      app: { theme: 'light', debug: false, logLevel: 'error' },
      ui: { density: 'compact', animations: false },
      performance: { enableMonitoring: false },
    },
  },
  {
    name: '移动端',
    config: {
      app: { theme: 'light', debug: false },
      ui: { density: 'compact', animations: false },
      performance: { enableLazyLoading: true },
    },
  },
]

// 方法
function setConfig() {
  try {
    props.engine.config.set(configKey.value, configValue.value)
    configResult.value = `设置成功: ${configKey.value} = ${configValue.value}`
    emit('log', 'success', `设置配置: ${configKey.value} = ${configValue.value}`)
    refreshConfig()
  }
  catch (error: any) {
    configResult.value = `设置失败: ${error.message}`
    emit('log', 'error', '设置配置失败', error)
  }
}

function getConfig() {
  try {
    const value = props.engine.config.get(configKey.value)
    configResult.value = `获取结果: ${configKey.value} = ${JSON.stringify(value)}`
    emit('log', 'info', `获取配置: ${configKey.value} = ${JSON.stringify(value)}`)
  }
  catch (error: any) {
    configResult.value = `获取失败: ${error.message}`
    emit('log', 'error', '获取配置失败', error)
  }
}

function deleteConfig() {
  try {
    props.engine.config.delete(configKey.value)
    configResult.value = `删除成功: ${configKey.value}`
    emit('log', 'warning', `删除配置: ${configKey.value}`)
    refreshConfig()
  }
  catch (error: any) {
    configResult.value = `删除失败: ${error.message}`
    emit('log', 'error', '删除配置失败', error)
  }
}

function setBatchConfig() {
  try {
    const config = JSON.parse(batchConfig.value)
    props.engine.config.merge(config)
    emit('log', 'success', '批量设置配置成功', config)
    refreshConfig()
  }
  catch (error: any) {
    emit('log', 'error', '批量设置配置失败', error)
  }
}

function getAllConfig() {
  try {
    const allConfig = props.engine.config.getAll()
    emit('log', 'info', '获取所有配置', allConfig)
    refreshConfig()
  }
  catch (error: any) {
    emit('log', 'error', '获取所有配置失败', error)
  }
}

function clearAllConfig() {
  try {
    props.engine.config.clear()
    emit('log', 'warning', '清空所有配置')
    refreshConfig()
  }
  catch (error: any) {
    emit('log', 'error', '清空配置失败', error)
  }
}

function startWatching() {
  try {
    unwatchConfig = props.engine.config.watch(watchKey.value, (newValue: any, oldValue: any) => {
      emit('log', 'info', `配置变化: ${watchKey.value}`, { newValue, oldValue })
    })
    isWatching.value = true
    emit('log', 'info', `开始监听配置: ${watchKey.value}`)
  }
  catch (error: any) {
    emit('log', 'error', '开始监听失败', error)
  }
}

function stopWatching() {
  if (unwatchConfig) {
    unwatchConfig()
    unwatchConfig = null
    isWatching.value = false
    emit('log', 'info', `停止监听配置: ${watchKey.value}`)
  }
}

function refreshConfig() {
  try {
    const allConfig = props.engine.config.getAll()
    Object.assign(currentConfig, allConfig)
  }
  catch (error: any) {
    emit('log', 'error', '刷新配置失败', error)
  }
}

function applyPreset(preset: any) {
  try {
    props.engine.config.merge(preset.config)
    emit('log', 'success', `应用预设配置: ${preset.name}`, preset.config)
    refreshConfig()
  }
  catch (error: any) {
    emit('log', 'error', '应用预设配置失败', error)
  }
}

// 生命周期
onMounted(() => {
  refreshConfig()
  emit('log', 'info', '配置管理器演示已加载')
})

onUnmounted(() => {
  if (unwatchConfig) {
    unwatchConfig()
  }
})
</script>

<template>
  <div class="config-demo">
    <div class="demo-header">
      <h2>⚙️ 配置管理器演示</h2>
      <p>ConfigManager 提供了强大的配置管理功能，支持嵌套配置、类型验证、变化监听等特性。</p>
    </div>

    <div class="demo-grid">
      <!-- 基础配置操作 -->
      <div class="card">
        <div class="card-header">
          <h3>基础配置操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>配置键</label>
            <input
              v-model="configKey"
              type="text"
              placeholder="例如: app.theme"
            >
          </div>

          <div class="form-group">
            <label>配置值</label>
            <input
              v-model="configValue"
              type="text"
              placeholder="例如: dark"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="setConfig">
                设置配置
              </button>
              <button class="btn btn-secondary" @click="getConfig">
                获取配置
              </button>
              <button class="btn btn-warning" @click="deleteConfig">
                删除配置
              </button>
            </div>
          </div>

          <div v-if="configResult" class="alert alert-info">
            <strong>结果:</strong> {{ configResult }}
          </div>
        </div>
      </div>

      <!-- 批量配置操作 -->
      <div class="card">
        <div class="card-header">
          <h3>批量配置操作</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>JSON 配置</label>
            <textarea
              v-model="batchConfig"
              placeholder="输入 JSON 格式的配置"
              rows="6"
            />
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="setBatchConfig">
                批量设置
              </button>
              <button class="btn btn-secondary" @click="getAllConfig">
                获取所有配置
              </button>
              <button class="btn btn-warning" @click="clearAllConfig">
                清空配置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 配置监听 -->
      <div class="card">
        <div class="card-header">
          <h3>配置变化监听</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>监听的配置键</label>
            <input
              v-model="watchKey"
              type="text"
              placeholder="例如: app.theme"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button
                class="btn btn-primary"
                :disabled="isWatching"
                @click="startWatching"
              >
                开始监听
              </button>
              <button
                class="btn btn-secondary"
                :disabled="!isWatching"
                @click="stopWatching"
              >
                停止监听
              </button>
            </div>
          </div>

          <div class="watch-status">
            <span class="status-indicator" :class="{ active: isWatching }" />
            <span>{{ isWatching ? '正在监听' : '未监听' }}</span>
          </div>
        </div>
      </div>

      <!-- 当前配置展示 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>当前配置</h3>
          <button class="btn btn-secondary btn-sm" @click="refreshConfig">
            刷新
          </button>
        </div>
        <div class="card-body">
          <div class="config-tree">
            <pre>{{ JSON.stringify(currentConfig, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- 预设配置 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>预设配置模板</h3>
        </div>
        <div class="card-body">
          <div class="preset-buttons">
            <button
              v-for="preset in presets"
              :key="preset.name"
              class="btn btn-secondary"
              @click="applyPreset(preset)"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.config-demo {
  .demo-header {
    margin-bottom: var(--spacing-xl);

    h2 {
      margin-bottom: var(--spacing-sm);
      color: var(--text-primary);
    }

    p {
      color: var(--text-secondary);
      line-height: 1.6;
    }
  }

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--spacing-lg);

    .full-width {
      grid-column: 1 / -1;
    }
  }

  .button-group {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }

  .watch-status {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-top: var(--spacing-md);

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--error-color);

      &.active {
        background: var(--success-color);
      }
    }
  }

  .config-tree {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: var(--spacing-md);
    max-height: 300px;
    overflow: auto;

    pre {
      margin: 0;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.4;
      color: var(--text-primary);
    }
  }

  .preset-buttons {
    display: flex;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .config-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>
