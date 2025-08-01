<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, onMounted, ref } from 'vue'

const engine = inject<Engine>('engine')!

const plugins = ref<any[]>([])
const pluginCounter = ref(0)

const pluginCount = computed(() => plugins.value.length)
const hasPlugins = computed(() => plugins.value.length > 0)

async function loadPlugin() {
  pluginCounter.value++
  const plugin = {
    name: `demo-plugin-${pluginCounter.value}`,
    version: '1.0.0',
    dependencies: pluginCounter.value > 1 ? [`demo-plugin-${pluginCounter.value - 1}`] : [],
    install: (engine: Engine) => {
      engine.logger.info(`插件 ${plugin.name} 已安装`)
      engine.events.emit('plugin:demo-loaded', { name: plugin.name })

      // 模拟插件功能
      engine.state.set(`plugins.${plugin.name}`, {
        loadTime: Date.now(),
        status: 'active',
      })
    },
    uninstall: (engine: Engine) => {
      engine.logger.info(`插件 ${plugin.name} 已卸载`)
      engine.state.remove(`plugins.${plugin.name}`)
    },
  }

  try {
    await engine.use(plugin)
    updatePluginList()
    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: `插件 ${plugin.name} 加载成功`,
      duration: 3000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `插件加载失败: ${error}`,
      duration: 3000,
    })
  }
}

function showPlugins() {
  const pluginNames = plugins.value.map(p => p.name).join(', ')
  engine.logger.info(`已注册插件: ${pluginNames || '无'}`)
  engine.notifications.show({
    type: 'info',
    title: '信息',
    message: '查看控制台了解插件详情',
    duration: 3000,
  })
}

async function unloadPlugin() {
  if (plugins.value.length === 0)
    return

  const lastPlugin = plugins.value[plugins.value.length - 1]
  await unloadSpecificPlugin(lastPlugin.name)
}

async function unloadSpecificPlugin(pluginName: string) {
  try {
    await engine.plugins.unregister(pluginName)
    updatePluginList()
    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: `插件 ${pluginName} 卸载成功`,
      duration: 3000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `插件卸载失败: ${error}`,
      duration: 3000,
    })
  }
}

function updatePluginList() {
  plugins.value = engine.plugins.getAll()
}

onMounted(() => {
  updatePluginList()

  // 监听插件事件
  engine.events.on('plugin:demo-loaded', (data) => {
    engine.logger.info('收到插件加载事件:', data)
  })
})
</script>

<template>
  <div class="demo-page">
    <header class="page-header">
      <h1>🔌 插件系统演示</h1>
      <p>灵活的插件架构，支持依赖管理和生命周期控制</p>
    </header>

    <section class="demo-section">
      <h2>插件管理</h2>
      <div class="demo-controls">
        <button class="btn btn-primary" @click="loadPlugin">
          加载演示插件
        </button>
        <button class="btn btn-secondary" @click="showPlugins">
          查看已注册插件 ({{ pluginCount }})
        </button>
        <button class="btn btn-danger" :disabled="!hasPlugins" @click="unloadPlugin">
          卸载最后一个插件
        </button>
      </div>
    </section>

    <section class="demo-section">
      <h2>插件列表</h2>
      <div class="plugin-list">
        <div
          v-for="plugin in plugins"
          :key="plugin.name"
          class="plugin-card"
        >
          <div class="plugin-info">
            <h3>{{ plugin.name }}</h3>
            <p>版本: {{ plugin.version || '1.0.0' }}</p>
            <p v-if="plugin.dependencies?.length">
              依赖: {{ plugin.dependencies.join(', ') }}
            </p>
          </div>
          <div class="plugin-actions">
            <button class="btn btn-sm btn-danger" @click="unloadSpecificPlugin(plugin.name)">
              卸载
            </button>
          </div>
        </div>
        <div v-if="plugins.length === 0" class="empty-state">
          暂无已注册的插件
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>插件开发示例</h2>
      <div class="code-example">
        <pre><code>const myPlugin = {
  name: 'my-awesome-plugin',
  version: '1.0.0',
  dependencies: ['core-plugin'],
  install: (engine) => {
    // 插件安装逻辑
    engine.logger.info('Plugin installed!')

    // 注册事件监听器
    engine.events.on('app:ready', () => {
      console.log('App is ready!')
    })

    // 添加全局方法
    engine.addGlobalMethod('myMethod', () => {
      return 'Hello from plugin!'
    })
  },
  uninstall: (engine) => {
    // 插件卸载逻辑
    engine.logger.info('Plugin uninstalled!')
  }
}

// 使用插件
await engine.use(myPlugin)</code></pre>
      </div>
    </section>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.page-header p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.demo-section {
  margin-bottom: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.demo-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.plugin-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.plugin-card {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plugin-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.plugin-info p {
  margin: 0.25rem 0;
  color: #7f8c8d;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  grid-column: 1 / -1;
  padding: 2rem;
}

.code-example {
  background: #2c3e50;
  border-radius: 8px;
  padding: 1.5rem;
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
  color: #ecf0f1;
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}

.code-example code {
  color: #ecf0f1;
}
</style>
