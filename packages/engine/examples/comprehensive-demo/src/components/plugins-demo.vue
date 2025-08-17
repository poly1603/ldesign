<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

const props = defineProps<{
  engine: any
}>()

const emit = defineEmits<{
  log: [level: string, message: string, data?: any]
}>()

// 响应式数据
const pluginName = ref('demo-plugin')
const pluginVersion = ref('1.0.0')
const pluginDescription = ref('演示插件功能')
const pluginDependencies = ref('')
const pluginStats = ref<any>(null)
const registeredPlugins = reactive<any[]>([])
const pluginLogs = reactive<any[]>([])

// 预设插件
const presetPlugins = [
  {
    name: 'logger-plugin',
    version: '1.0.0',
    description: '日志增强插件，提供更丰富的日志功能',
    install: (context: any) => {
      context.engine.enhancedLog = (level: string, message: string) => {
        console.log(`[${level.toUpperCase()}] ${new Date().toISOString()} - ${message}`)
      }
    },
    uninstall: (context: any) => {
      delete context.engine.enhancedLog
    },
  },
  {
    name: 'theme-plugin',
    version: '2.0.0',
    description: '主题管理插件，支持动态主题切换',
    install: (context: any) => {
      context.engine.themeManager = {
        setTheme: (theme: string) => {
          document.documentElement.setAttribute('data-theme', theme)
        },
        getTheme: () => {
          return document.documentElement.getAttribute('data-theme') || 'light'
        },
      }
    },
    uninstall: (context: any) => {
      delete context.engine.themeManager
    },
  },
  {
    name: 'analytics-plugin',
    version: '1.5.0',
    description: '分析统计插件，收集用户行为数据',
    dependencies: ['logger-plugin'],
    install: (context: any) => {
      context.engine.analytics = {
        track: (event: string, data: any) => {
          if (context.engine.enhancedLog) {
            context.engine.enhancedLog('analytics', `Track: ${event}`)
          }
          console.log('Analytics:', event, data)
        },
      }
    },
    uninstall: (context: any) => {
      delete context.engine.analytics
    },
  },
]

// 方法
function registerPlugin() {
  try {
    const plugin = {
      name: pluginName.value,
      version: pluginVersion.value,
      description: pluginDescription.value,
      install: (context: any) => {
        context.engine[`${pluginName.value}Feature`] = () => {
          return `${pluginName.value} 功能已激活`
        }

        addPluginLog('install', pluginName.value, '插件安装成功')
      },
      uninstall: (context: any) => {
        delete context.engine[`${pluginName.value}Feature`]
        addPluginLog('uninstall', pluginName.value, '插件卸载成功')
      },
    }

    props.engine.plugins.register(plugin)
    emit('log', 'success', `注册插件: ${pluginName.value}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '注册插件失败', error)
  }
}

function unregisterPlugin() {
  try {
    props.engine.plugins.unregister(pluginName.value)
    emit('log', 'warning', `卸载插件: ${pluginName.value}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '卸载插件失败', error)
  }
}

function registerPresetPlugin(preset: any) {
  try {
    props.engine.plugins.register(preset)
    emit('log', 'success', `注册预设插件: ${preset.name}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '注册预设插件失败', error)
  }
}

function unregisterPresetPlugin(name: string) {
  try {
    props.engine.plugins.unregister(name)
    emit('log', 'warning', `卸载预设插件: ${name}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '卸载预设插件失败', error)
  }
}

function isPluginRegistered(name: string) {
  return registeredPlugins.some(p => p.name === name)
}

function registerPluginWithDeps() {
  try {
    const dependencies = pluginDependencies.value
      .split(',')
      .map(dep => dep.trim())
      .filter(dep => dep)

    const plugin = {
      name: `${pluginName.value}-with-deps`,
      version: pluginVersion.value,
      description: `${pluginDescription.value} (带依赖)`,
      dependencies,
      install: (context: any) => {
        context.engine[`${pluginName.value}WithDepsFeature`] = () => {
          return `${pluginName.value} 带依赖功能已激活`
        }
        addPluginLog('install', `${pluginName.value}-with-deps`, '带依赖插件安装成功')
      },
      uninstall: (context: any) => {
        delete context.engine[`${pluginName.value}WithDepsFeature`]
        addPluginLog('uninstall', `${pluginName.value}-with-deps`, '带依赖插件卸载成功')
      },
    }

    props.engine.plugins.register(plugin)
    emit('log', 'success', `注册带依赖插件: ${plugin.name}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '注册带依赖插件失败', error)
  }
}

function checkDependencies() {
  try {
    const dependencies = pluginDependencies.value
      .split(',')
      .map(dep => dep.trim())
      .filter(dep => dep)

    const result = props.engine.plugins.checkDependencies(dependencies)
    emit('log', 'info', '依赖检查结果', result)
  }
  catch (error: any) {
    emit('log', 'error', '依赖检查失败', error)
  }
}

function getPluginStats() {
  try {
    const stats = props.engine.plugins.getStats()
    pluginStats.value = stats
    emit('log', 'info', '获取插件统计信息', stats)
  }
  catch (error: any) {
    emit('log', 'error', '获取插件统计失败', error)
  }
}

function disableAllPlugins() {
  try {
    registeredPlugins.forEach((plugin) => {
      if (plugin.enabled) {
        props.engine.plugins.disable(plugin.name)
      }
    })
    emit('log', 'warning', '禁用所有插件')
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '禁用插件失败', error)
  }
}

function enableAllPlugins() {
  try {
    registeredPlugins.forEach((plugin) => {
      if (!plugin.enabled) {
        props.engine.plugins.enable(plugin.name)
      }
    })
    emit('log', 'success', '启用所有插件')
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '启用插件失败', error)
  }
}

function togglePlugin(name: string) {
  try {
    const plugin = registeredPlugins.find(p => p.name === name)
    if (plugin) {
      if (plugin.enabled) {
        props.engine.plugins.disable(name)
        emit('log', 'warning', `禁用插件: ${name}`)
      }
      else {
        props.engine.plugins.enable(name)
        emit('log', 'success', `启用插件: ${name}`)
      }
      refreshPluginList()
    }
  }
  catch (error: any) {
    emit('log', 'error', '切换插件状态失败', error)
  }
}

function unregisterSpecificPlugin(name: string) {
  try {
    props.engine.plugins.unregister(name)
    emit('log', 'warning', `卸载插件: ${name}`)
    refreshPluginList()
  }
  catch (error: any) {
    emit('log', 'error', '卸载插件失败', error)
  }
}

function refreshPluginList() {
  try {
    const plugins = props.engine.plugins.getAll()
    registeredPlugins.splice(0, registeredPlugins.length, ...plugins)
  }
  catch (error: any) {
    emit('log', 'error', '刷新插件列表失败', error)
  }
}

function addPluginLog(type: string, plugin: string, message: string) {
  pluginLogs.push({
    timestamp: Date.now(),
    type,
    plugin,
    message,
  })

  // 限制日志数量
  if (pluginLogs.length > 50) {
    pluginLogs.splice(0, pluginLogs.length - 50)
  }
}

function clearPluginLogs() {
  pluginLogs.splice(0, pluginLogs.length)
  emit('log', 'info', '清空插件日志')
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString()
}

// 生命周期
onMounted(() => {
  refreshPluginList()
  getPluginStats()
  emit('log', 'info', '插件管理器演示已加载')
})
</script>

<template>
  <div class="plugins-demo">
    <div class="demo-header">
      <h2>🔌 插件管理器演示</h2>
      <p>PluginManager 提供了完整的插件系统，支持插件注册、依赖管理、生命周期控制等功能。</p>
    </div>

    <div class="demo-grid">
      <!-- 插件注册 -->
      <div class="card">
        <div class="card-header">
          <h3>插件注册</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>插件名称</label>
            <input
              v-model="pluginName"
              type="text"
              placeholder="例如: my-plugin"
            >
          </div>

          <div class="form-group">
            <label>插件版本</label>
            <input
              v-model="pluginVersion"
              type="text"
              placeholder="例如: 1.0.0"
            >
          </div>

          <div class="form-group">
            <label>插件描述</label>
            <input
              v-model="pluginDescription"
              type="text"
              placeholder="插件功能描述"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="registerPlugin">
                注册插件
              </button>
              <button class="btn btn-secondary" @click="unregisterPlugin">
                卸载插件
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 预设插件 -->
      <div class="card">
        <div class="card-header">
          <h3>预设插件</h3>
        </div>
        <div class="card-body">
          <div class="preset-plugins">
            <div
              v-for="preset in presetPlugins"
              :key="preset.name"
              class="preset-plugin-item"
            >
              <div class="plugin-info">
                <h4>{{ preset.name }}</h4>
                <p>{{ preset.description }}</p>
                <span class="plugin-version">v{{ preset.version }}</span>
              </div>
              <div class="plugin-actions">
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="isPluginRegistered(preset.name)"
                  @click="registerPresetPlugin(preset)"
                >
                  {{ isPluginRegistered(preset.name) ? '已注册' : '注册' }}
                </button>
                <button
                  v-if="isPluginRegistered(preset.name)"
                  class="btn btn-warning btn-sm"
                  @click="unregisterPresetPlugin(preset.name)"
                >
                  卸载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 插件状态 -->
      <div class="card">
        <div class="card-header">
          <h3>插件状态</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-secondary" @click="getPluginStats">
                获取统计信息
              </button>
              <button class="btn btn-warning" @click="disableAllPlugins">
                禁用所有插件
              </button>
              <button class="btn btn-success" @click="enableAllPlugins">
                启用所有插件
              </button>
            </div>
          </div>

          <div v-if="pluginStats" class="stats-info">
            <h4>统计信息</h4>
            <p>已注册插件: {{ pluginStats.registered }}</p>
            <p>已启用插件: {{ pluginStats.enabled }}</p>
            <p>已禁用插件: {{ pluginStats.disabled }}</p>
          </div>
        </div>
      </div>

      <!-- 插件依赖 -->
      <div class="card">
        <div class="card-header">
          <h3>插件依赖</h3>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>依赖插件 (逗号分隔)</label>
            <input
              v-model="pluginDependencies"
              type="text"
              placeholder="例如: plugin-a, plugin-b"
            >
          </div>

          <div class="form-group">
            <div class="button-group">
              <button class="btn btn-primary" @click="registerPluginWithDeps">
                注册带依赖的插件
              </button>
              <button class="btn btn-secondary" @click="checkDependencies">
                检查依赖
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 已注册插件列表 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>已注册插件</h3>
          <button class="btn btn-secondary btn-sm" @click="refreshPluginList">
            刷新
          </button>
        </div>
        <div class="card-body">
          <div class="plugin-list">
            <div
              v-for="plugin in registeredPlugins"
              :key="plugin.name"
              class="plugin-item"
              :class="{ disabled: !plugin.enabled }"
            >
              <div class="plugin-header">
                <h4>{{ plugin.name }}</h4>
                <span class="plugin-version">v{{ plugin.version }}</span>
                <span class="plugin-status" :class="{ enabled: plugin.enabled }">
                  {{ plugin.enabled ? '已启用' : '已禁用' }}
                </span>
              </div>

              <p class="plugin-description">
                {{ plugin.description }}
              </p>

              <div v-if="plugin.dependencies && plugin.dependencies.length" class="plugin-dependencies">
                <strong>依赖:</strong> {{ plugin.dependencies.join(', ') }}
              </div>

              <div class="plugin-actions">
                <button
                  class="btn btn-sm"
                  :class="plugin.enabled ? 'btn-warning' : 'btn-success'"
                  @click="togglePlugin(plugin.name)"
                >
                  {{ plugin.enabled ? '禁用' : '启用' }}
                </button>
                <button
                  class="btn btn-error btn-sm"
                  @click="unregisterSpecificPlugin(plugin.name)"
                >
                  卸载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 插件事件日志 -->
      <div class="card full-width">
        <div class="card-header">
          <h3>插件事件日志</h3>
          <button class="btn btn-secondary btn-sm" @click="clearPluginLogs">
            清空
          </button>
        </div>
        <div class="card-body">
          <div class="plugin-logs">
            <div
              v-for="(log, index) in pluginLogs"
              :key="index"
              class="plugin-log-item"
              :class="log.type"
            >
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-type">{{ log.type.toUpperCase() }}</span>
              <span class="log-plugin">{{ log.plugin }}</span>
              <span class="log-message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.plugins-demo {
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

  .preset-plugins {
    .preset-plugin-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-sm);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);

      .plugin-info {
        flex: 1;

        h4 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 16px;
        }

        p {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .plugin-version {
          font-size: 12px;
          color: var(--text-muted);
        }
      }

      .plugin-actions {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }

  .stats-info {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--border-radius);

    h4 {
      margin-bottom: var(--spacing-sm);
      font-size: 16px;
    }

    p {
      margin: var(--spacing-xs) 0;
      font-size: 14px;
    }
  }

  .plugin-list {
    .plugin-item {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      background: var(--bg-secondary);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);

      &.disabled {
        opacity: 0.6;
      }

      .plugin-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-sm);

        h4 {
          margin: 0;
          font-size: 16px;
        }

        .plugin-version {
          font-size: 12px;
          color: var(--text-muted);
          background: var(--bg-primary);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .plugin-status {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--error-color);
          color: white;

          &.enabled {
            background: var(--success-color);
          }
        }
      }

      .plugin-description {
        margin: 0 0 var(--spacing-sm) 0;
        font-size: 14px;
        color: var(--text-secondary);
      }

      .plugin-dependencies {
        margin-bottom: var(--spacing-sm);
        font-size: 12px;
        color: var(--text-muted);
      }

      .plugin-actions {
        display: flex;
        gap: var(--spacing-xs);
      }
    }
  }

  .plugin-logs {
    max-height: 300px;
    overflow-y: auto;

    .plugin-log-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-bottom: 1px solid var(--border-color);
      font-family: monospace;
      font-size: 12px;

      &.install {
        .log-type {
          color: var(--success-color);
        }
      }

      &.uninstall {
        .log-type {
          color: var(--warning-color);
        }
      }

      &.enable {
        .log-type {
          color: var(--info-color);
        }
      }

      &.disable {
        .log-type {
          color: var(--error-color);
        }
      }

      .log-time {
        color: var(--text-muted);
        min-width: 80px;
      }

      .log-type {
        font-weight: bold;
        min-width: 80px;
      }

      .log-plugin {
        color: var(--primary-color);
        min-width: 120px;
      }

      .log-message {
        flex: 1;
        color: var(--text-primary);
      }
    }
  }
}

@media (max-width: 768px) {
  .plugins-demo .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .preset-plugin-item {
    flex-direction: column;
    align-items: flex-start !important;

    .plugin-actions {
      margin-top: var(--spacing-sm);
    }
  }
}
</style>
