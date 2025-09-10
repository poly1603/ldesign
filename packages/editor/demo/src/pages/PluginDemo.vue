<template>
  <div class="plugin-demo-page">
    <div class="demo-section">
      <h2>🔌 插件系统测试</h2>
      <p>测试编辑器的插件系统，包括插件加载、注册、使用等功能。</p>
    </div>

    <div class="demo-grid">
      <div class="demo-card">
        <h3>插件管理</h3>
        <div class="plugin-list">
          <div 
            v-for="plugin in plugins" 
            :key="plugin.name"
            class="plugin-item"
            :class="{ active: plugin.enabled }"
          >
            <div class="plugin-info">
              <span class="plugin-icon">{{ plugin.icon }}</span>
              <div class="plugin-details">
                <div class="plugin-name">{{ plugin.displayName }}</div>
                <div class="plugin-description">{{ plugin.description }}</div>
              </div>
            </div>
            <button 
              class="plugin-toggle"
              @click="togglePlugin(plugin.name)"
            >
              {{ plugin.enabled ? '禁用' : '启用' }}
            </button>
          </div>
        </div>
      </div>

      <div class="demo-card">
        <h3>插件API测试</h3>
        <div class="api-status">
          <div class="status-item">
            <strong>PluginRegistry:</strong>
            <span :class="{ success: apiStatus.registry, error: !apiStatus.registry }">
              {{ apiStatus.registry ? '✅ 已加载' : '❌ 未加载' }}
            </span>
          </div>
          <div class="status-item">
            <strong>已注册插件:</strong> {{ registeredPlugins.length }}
          </div>
          <div class="status-item">
            <strong>活跃插件:</strong> {{ activePlugins.length }}
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn primary" @click="testPluginAPI">🧪 测试插件API</button>
          <button class="btn" @click="loadAllPlugins">📦 加载所有插件</button>
          <button class="btn" @click="clearPlugins">🗑️清空插件</button>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>📝 插件功能演示</h2>
      <div class="demo-card">
        <h3>编辑器 + 插件</h3>
        <div class="plugin-toolbar">
          <div class="toolbar-group">
            <button 
              v-for="plugin in enabledPlugins" 
              :key="plugin.name"
              class="toolbar-btn"
              @click="executePlugin(plugin.name)"
              :title="plugin.description"
            >
              {{ plugin.icon }} {{ plugin.displayName }}
            </button>
          </div>
        </div>
        
        <div 
          ref="editorRef" 
          class="editor-container"
          contenteditable="true"
          @input="handleInput"
        >
          <h2>插件功能测试</h2>
          <p>这里可以测试各种插件功能。</p>
          <ul>
            <li>文本格式化插件</li>
            <li>内容插入插件</li>
            <li>工具类插件</li>
          </ul>
          <p>选择上方的插件按钮来测试功能！</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

const editorRef = ref<HTMLElement>()

const apiStatus = reactive({
  registry: false,
  manager: false
})

const registeredPlugins = ref<string[]>([])
const activePlugins = ref<string[]>([])

const plugins = reactive([
  {
    name: 'bold',
    displayName: '加粗',
    icon: '𝐁',
    description: '将选中文本设置为粗体',
    enabled: true
  },
  {
    name: 'italic',
    displayName: '斜体',
    icon: '𝐼',
    description: '将选中文本设置为斜体',
    enabled: true
  },
  {
    name: 'underline',
    displayName: '下划线',
    icon: '𝐔',
    description: '为选中文本添加下划线',
    enabled: false
  },
  {
    name: 'heading',
    displayName: '标题',
    icon: '𝐇',
    description: '将选中文本转换为标题',
    enabled: true
  },
  {
    name: 'link',
    displayName: '链接',
    icon: '🔗',
    description: '插入或编辑链接',
    enabled: false
  },
  {
    name: 'image',
    displayName: '图片',
    icon: '🖼️',
    description: '插入图片',
    enabled: false
  },
  {
    name: 'table',
    displayName: '表格',
    icon: '📊',
    description: '插入表格',
    enabled: false
  },
  {
    name: 'code',
    displayName: '代码',
    icon: '💻',
    description: '插入代码块',
    enabled: true
  }
])

const enabledPlugins = computed(() => {
  return plugins.filter(plugin => plugin.enabled)
})

const togglePlugin = (pluginName: string) => {
  const plugin = plugins.find(p => p.name === pluginName)
  if (plugin) {
    plugin.enabled = !plugin.enabled
    
    if (plugin.enabled) {
      activePlugins.value.push(pluginName)
    } else {
      const index = activePlugins.value.indexOf(pluginName)
      if (index > -1) {
        activePlugins.value.splice(index, 1)
      }
    }
    
    console.log(`插件 ${pluginName} ${plugin.enabled ? '已启用' : '已禁用'}`)
  }
}

const executePlugin = (pluginName: string) => {
  if (!editorRef.value) return
  
  editorRef.value.focus()
  
  switch (pluginName) {
    case 'bold':
      document.execCommand('bold')
      break
    case 'italic':
      document.execCommand('italic')
      break
    case 'underline':
      document.execCommand('underline')
      break
    case 'heading':
      document.execCommand('formatBlock', false, 'h2')
      break
    case 'link':
      const url = prompt('请输入链接地址:')
      if (url) {
        document.execCommand('createLink', false, url)
      }
      break
    case 'image':
      const imgUrl = prompt('请输入图片地址:')
      if (imgUrl) {
        document.execCommand('insertImage', false, imgUrl)
      }
      break
    case 'table':
      const tableHtml = `
        <table border="1" style="border-collapse: collapse; margin: 1rem 0;">
          <tr><td>单元格1</td><td>单元格2</td></tr>
          <tr><td>单元格3</td><td>单元格4</td></tr>
        </table>
      `
      document.execCommand('insertHTML', false, tableHtml)
      break
    case 'code':
      const codeHtml = '<pre><code>// 代码示例\nconsole.log("Hello World!");</code></pre>'
      document.execCommand('insertHTML', false, codeHtml)
      break
    default:
      console.log(`执行插件: ${pluginName}`)
  }
}

const testPluginAPI = async () => {
  try {
    // 测试插件注册表导入
    const pluginModule = await import('@ldesign/editor/plugins')
    console.log('✅ 插件模块导入成功:', pluginModule)
    apiStatus.registry = true
    
    // 模拟注册插件
    registeredPlugins.value = plugins.map(plugin => plugin.name)
    activePlugins.value = plugins.filter(plugin => plugin.enabled).map(plugin => plugin.name)
    
    alert('插件API测试成功！')
  } catch (error) {
    console.error('❌ 插件API测试失败:', error)
    alert('插件API测试失败，请检查控制台')
  }
}

const loadAllPlugins = () => {
  plugins.forEach(plugin => {
    plugin.enabled = true
  })
  activePlugins.value = plugins.map(plugin => plugin.name)
  console.log('所有插件已加载')
}

const clearPlugins = () => {
  plugins.forEach(plugin => {
    plugin.enabled = false
  })
  activePlugins.value = []
  console.log('所有插件已清空')
}

const handleInput = () => {
  console.log('编辑器内容已更新')
}

onMounted(() => {
  // 初始化活跃插件列表
  activePlugins.value = plugins.filter(plugin => plugin.enabled).map(plugin => plugin.name)
  
  // 测试插件API
  testPluginAPI()
  
  console.log('🔌 插件演示页面已加载')
})
</script>

<style scoped lang="less">
.plugin-demo-page {
  max-width: 1200px;
  margin: 0 auto;
}

.plugin-list {
  display: grid;
  gap: 0.75rem;
}

.plugin-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  transition: all 0.2s ease;

  &.active {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-color-1);
  }

  &:hover {
    box-shadow: var(--ldesign-shadow-1);
  }
}

.plugin-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.plugin-icon {
  font-size: 1.5rem;
  width: 40px;
  text-align: center;
}

.plugin-details {
  flex: 1;
}

.plugin-name {
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: 0.25rem;
}

.plugin-description {
  font-size: 0.85rem;
  color: var(--ldesign-text-color-secondary);
}

.plugin-toggle {
  padding: 0.5rem 1rem;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 4px;
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;

  &:hover {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);
  }
}

.api-status {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  font-size: 0.9rem;

  .success {
    color: var(--ldesign-success-color);
    font-weight: 600;
  }

  .error {
    color: var(--ldesign-error-color);
    font-weight: 600;
  }
}

.plugin-toolbar {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 0.75rem;
}

.toolbar-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 4px;
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  white-space: nowrap;

  &:hover {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);
  }
}

@media (max-width: 768px) {
  .plugin-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .plugin-info {
    width: 100%;
  }

  .plugin-toggle {
    align-self: flex-end;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .toolbar-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
