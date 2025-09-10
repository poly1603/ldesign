<template>
  <div class="theme-demo-page">
    <div class="demo-section">
      <h2>🎨 主题系统测试</h2>
      <p>测试编辑器的主题系统，包括主题切换、自定义主题等功能。</p>
    </div>

    <div class="demo-card">
      <h3>主题切换</h3>
      <div class="theme-selector">
        <button 
          v-for="theme in themes" 
          :key="theme.name"
          class="theme-btn"
          :class="{ active: currentTheme === theme.name }"
          @click="switchTheme(theme.name)"
        >
          <span class="theme-icon">{{ theme.icon }}</span>
          <span class="theme-name">{{ theme.displayName }}</span>
        </button>
      </div>
      
      <div class="current-theme-info">
        <h4>当前主题: {{ getCurrentThemeInfo().displayName }}</h4>
        <p>{{ getCurrentThemeInfo().description }}</p>
      </div>
    </div>

    <div class="demo-grid">
      <div class="demo-card">
        <h3>编辑器预览</h3>
        <div 
          ref="editorRef" 
          class="editor-container"
          :data-theme="currentTheme"
          contenteditable="true"
          @input="handleInput"
        >
          <h2>主题演示</h2>
          <p>这是一个<strong>富文本编辑器</strong>的主题演示。</p>
          <ul>
            <li>支持多种主题切换</li>
            <li>基于CSS变量的主题系统</li>
            <li>响应式设计</li>
          </ul>
          <blockquote>
            尝试切换不同的主题，体验视觉效果的变化！
          </blockquote>
        </div>
      </div>

      <div class="demo-card">
        <h3>主题信息</h3>
        <div class="theme-info">
          <div class="info-item">
            <strong>主题名称:</strong> {{ getCurrentThemeInfo().displayName }}
          </div>
          <div class="info-item">
            <strong>主题类型:</strong> {{ getCurrentThemeInfo().type }}
          </div>
          <div class="info-item">
            <strong>主色调:</strong> 
            <span class="color-preview" :style="{ backgroundColor: getCurrentThemeInfo().primaryColor }"></span>
            {{ getCurrentThemeInfo().primaryColor }}
          </div>
          <div class="info-item">
            <strong>背景色:</strong>
            <span class="color-preview" :style="{ backgroundColor: getCurrentThemeInfo().backgroundColor }"></span>
            {{ getCurrentThemeInfo().backgroundColor }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>🎯 主题API测试</h2>
      <div class="demo-card">
        <h3>ThemeManager 测试</h3>
        <div class="api-test">
          <div class="test-item">
            <strong>导入状态:</strong> 
            <span :class="{ success: themeManagerLoaded, error: !themeManagerLoaded }">
              {{ themeManagerLoaded ? '✅ 成功' : '❌ 失败' }}
            </span>
          </div>
          <div class="test-item">
            <strong>可用主题:</strong> {{ availableThemes.join(', ') }}
          </div>
          <div class="test-item">
            <strong>当前主题:</strong> {{ currentTheme }}
          </div>
        </div>
        
        <div class="btn-group">
          <button class="btn" @click="testThemeAPI">🧪 测试主题API</button>
          <button class="btn" @click="exportTheme">📤 导出主题</button>
          <button class="btn" @click="resetTheme">🔄 重置主题</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

const editorRef = ref<HTMLElement>()
const currentTheme = ref('default')
const themeManagerLoaded = ref(false)
const availableThemes = ref<string[]>([])

const themes = [
  {
    name: 'default',
    displayName: '默认主题',
    icon: '🎨',
    description: '经典的紫色主题，适合大多数使用场景',
    type: '明亮',
    primaryColor: '#722ED1',
    backgroundColor: '#ffffff'
  },
  {
    name: 'dark',
    displayName: '暗色主题',
    icon: '🌙',
    description: '深色背景主题，减少眼部疲劳',
    type: '暗色',
    primaryColor: '#8c5ad3',
    backgroundColor: '#1a1a1a'
  },
  {
    name: 'minimal',
    displayName: '简洁主题',
    icon: '✨',
    description: '简约设计风格，注重内容本身',
    type: '简洁',
    primaryColor: '#666666',
    backgroundColor: '#fafafa'
  },
  {
    name: 'rainbow',
    displayName: '彩虹主题',
    icon: '🌈',
    description: '充满活力的彩色主题',
    type: '彩色',
    primaryColor: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    backgroundColor: '#ffffff'
  }
]

const getCurrentThemeInfo = () => {
  return themes.find(theme => theme.name === currentTheme.value) || themes[0]
}

const switchTheme = (themeName: string) => {
  currentTheme.value = themeName
  applyTheme(themeName)
  console.log(`主题已切换到: ${themeName}`)
}

const applyTheme = (themeName: string) => {
  const root = document.documentElement
  
  // 移除之前的主题类
  themes.forEach(theme => {
    root.classList.remove(`theme-${theme.name}`)
  })
  
  // 添加新主题类
  root.classList.add(`theme-${themeName}`)
  
  // 更新CSS变量
  switch (themeName) {
    case 'dark':
      root.style.setProperty('--ldesign-bg-color-container', '#1a1a1a')
      root.style.setProperty('--ldesign-bg-color-page', '#0d1117')
      root.style.setProperty('--ldesign-text-color-primary', 'rgba(255, 255, 255, 90%)')
      root.style.setProperty('--ldesign-text-color-secondary', 'rgba(255, 255, 255, 70%)')
      root.style.setProperty('--ldesign-border-level-1-color', '#333')
      break
    case 'minimal':
      root.style.setProperty('--ldesign-brand-color', '#666')
      root.style.setProperty('--ldesign-bg-color-container', '#fafafa')
      root.style.setProperty('--ldesign-bg-color-page', '#ffffff')
      root.style.setProperty('--ldesign-text-color-primary', '#333')
      root.style.setProperty('--ldesign-text-color-secondary', '#666')
      break
    case 'rainbow':
      root.style.setProperty('--ldesign-brand-color', '#ff6b6b')
      root.style.setProperty('--ldesign-bg-color-container', '#ffffff')
      root.style.setProperty('--ldesign-bg-color-page', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
      break
    default:
      // 恢复默认主题
      root.style.setProperty('--ldesign-bg-color-container', '#ffffff')
      root.style.setProperty('--ldesign-bg-color-page', '#ffffff')
      root.style.setProperty('--ldesign-text-color-primary', 'rgba(0, 0, 0, 90%)')
      root.style.setProperty('--ldesign-text-color-secondary', 'rgba(0, 0, 0, 70%)')
      root.style.setProperty('--ldesign-border-level-1-color', '#e5e5e5')
      root.style.setProperty('--ldesign-brand-color', '#722ED1')
  }
}

const testThemeAPI = async () => {
  try {
    // 测试主题管理器导入
    const themeModule = await import('@ldesign/editor/themes')
    console.log('✅ 主题模块导入成功:', themeModule)
    themeManagerLoaded.value = true
    
    // 模拟获取可用主题
    availableThemes.value = themes.map(theme => theme.name)
    
    alert('主题API测试成功！')
  } catch (error) {
    console.error('❌ 主题API测试失败:', error)
    alert('主题API测试失败，请检查控制台')
  }
}

const exportTheme = () => {
  const themeConfig = {
    name: currentTheme.value,
    ...getCurrentThemeInfo(),
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(themeConfig, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `theme-${currentTheme.value}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  console.log('主题配置已导出:', themeConfig)
}

const resetTheme = () => {
  switchTheme('default')
}

const handleInput = () => {
  console.log('编辑器内容已更新')
}

onMounted(() => {
  // 初始化主题
  applyTheme(currentTheme.value)
  
  // 测试主题API
  testThemeAPI()
  
  console.log('🎨 主题演示页面已加载')
})
</script>

<style scoped lang="less">
.theme-demo-page {
  max-width: 1200px;
  margin: 0 auto;
}

.theme-selector {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.theme-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border: 2px solid var(--ldesign-border-level-1-color);
  border-radius: 8px;
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--ldesign-shadow-2);
    border-color: var(--ldesign-brand-color);
  }

  &.active {
    border-color: var(--ldesign-brand-color);
    background: var(--ldesign-brand-color);
    color: white;
  }

  .theme-icon {
    font-size: 2rem;
  }

  .theme-name {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.current-theme-info {
  padding: 1rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 6px;
  border: 1px solid var(--ldesign-border-level-1-color);

  h4 {
    margin: 0 0 0.5rem 0;
    color: var(--ldesign-brand-color);
  }

  p {
    margin: 0;
    color: var(--ldesign-text-color-secondary);
  }
}

.theme-info {
  display: grid;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  font-size: 0.9rem;
}

.color-preview {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  vertical-align: middle;
}

.api-test {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.test-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

// 主题特定样式
:global(.theme-dark) {
  .editor-container {
    background: #2d2d2d !important;
    color: rgba(255, 255, 255, 90%) !important;
  }
}

:global(.theme-minimal) {
  .editor-container {
    background: #fafafa !important;
    border: 1px solid #ddd !important;
  }
}

:global(.theme-rainbow) {
  .theme-btn.active {
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4) !important;
  }
}

@media (max-width: 768px) {
  .theme-selector {
    gap: 0.5rem;
  }

  .theme-btn {
    min-width: 100px;
    padding: 0.75rem;

    .theme-icon {
      font-size: 1.5rem;
    }

    .theme-name {
      font-size: 0.8rem;
    }
  }

  .info-item,
  .test-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
