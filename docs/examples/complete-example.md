# 完整使用示例

这个示例展示了如何在 Vue 3 项目中完整使用 LDesign 的颜色系统和 UI 组件。

## 项目设置

### 1. 安装依赖

```bash
# 安装核心包
pnpm add @ldesign/color @ldesign/shared

# 安装开发依赖
pnpm add -D @ldesign/builder
```

### 2. 配置插件

```typescript
// main.ts
import { createApp } from 'vue'
import { createColorEnginePlugin } from '@ldesign/color/vue'
import App from './App.vue'

const app = createApp(App)

// 配置颜色引擎
const colorPlugin = createColorEnginePlugin({
  cssVariablePrefix: 'app',
  enableCache: true,
  backgroundStrategy: 'primary-based',
  generateBackgroundFromPrimary: true,
  customThemes: [
    {
      name: 'brand',
      displayName: '品牌主题',
      description: '符合公司品牌的配色方案',
      light: { primary: '#ff6b35' },
      dark: { primary: '#ff8c69' }
    }
  ],
  onReady: () => console.log('🎨 颜色系统已就绪'),
  debug: import.meta.env.DEV
})

app.use(colorPlugin)
app.mount('#app')
```

## 完整组件示例

```vue
<template>
  <div class="app">
    <!-- 顶部工具栏 -->
    <header class="app-header">
      <h1>LDesign 示例应用</h1>
      
      <div class="app-controls">
        <!-- 主题选择器 -->
        <ThemeSelector
          mode="popup"
          button-text="选择主题"
          popup-animation="bounce"
          :custom-themes="customThemes"
          show-preview
          @theme-change="handleThemeChange"
        />
        
        <!-- 暗色模式切换 -->
        <DarkModeToggle
          animation-type="circle"
          :animation-duration="300"
          enable-trigger-animation
          @change="handleModeChange"
        />
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <!-- 选择器示例 -->
      <section class="demo-section">
        <h2>选择器组件</h2>
        
        <div class="demo-grid">
          <!-- 基础选择器 -->
          <div class="demo-item">
            <h3>基础选择器</h3>
            <LSelect
              v-model="selectedBasic"
              :options="basicOptions"
              placeholder="请选择选项"
              size="medium"
            />
          </div>

          <!-- 带颜色的选择器 -->
          <div class="demo-item">
            <h3>颜色选择器</h3>
            <LSelect
              v-model="selectedColor"
              :options="colorOptions"
              placeholder="选择颜色主题"
              show-color
              show-description
              animation="bounce"
            />
          </div>

          <!-- 可搜索选择器 -->
          <div class="demo-item">
            <h3>可搜索选择器</h3>
            <LSelect
              v-model="selectedSearchable"
              :options="searchableOptions"
              placeholder="搜索并选择"
              filterable
              clearable
            />
          </div>
        </div>
      </section>

      <!-- 弹出层示例 -->
      <section class="demo-section">
        <h2>弹出层组件</h2>
        
        <div class="demo-grid">
          <div class="demo-item">
            <h3>基础弹出层</h3>
            <LPopup
              placement="bottom"
              trigger="click"
              animation="fade"
            >
              <button class="demo-button">点击显示</button>
              <template #content>
                <div class="popup-content">
                  <h4>弹出层标题</h4>
                  <p>这是弹出层的内容区域</p>
                </div>
              </template>
            </LPopup>
          </div>

          <div class="demo-item">
            <h3>悬浮弹出层</h3>
            <LPopup
              placement="top"
              trigger="hover"
              animation="slide"
              :show-arrow="true"
            >
              <button class="demo-button">悬浮显示</button>
              <template #content>
                <div class="popup-content">
                  <p>悬浮时显示的内容</p>
                </div>
              </template>
            </LPopup>
          </div>
        </div>
      </section>

      <!-- 对话框示例 -->
      <section class="demo-section">
        <h2>对话框组件</h2>
        
        <div class="demo-grid">
          <div class="demo-item">
            <button 
              class="demo-button demo-button--primary"
              @click="showBasicDialog = true"
            >
              基础对话框
            </button>
            
            <LDialog
              v-model:visible="showBasicDialog"
              title="基础对话框"
              width="400"
              animation="zoom"
            >
              <p>这是一个基础的对话框示例。</p>
            </LDialog>
          </div>

          <div class="demo-item">
            <button 
              class="demo-button demo-button--success"
              @click="showAdvancedDialog = true"
            >
              高级对话框
            </button>
            
            <LDialog
              v-model:visible="showAdvancedDialog"
              title="高级对话框"
              width="600"
              height="400"
              draggable
              resizable
              animation="bounce"
              show-footer
            >
              <div class="dialog-content">
                <h3>高级功能</h3>
                <p>这个对话框支持拖拽和调整大小。</p>
                <ul>
                  <li>✅ 可拖拽移动</li>
                  <li>✅ 可调整大小</li>
                  <li>✅ 动画效果</li>
                  <li>✅ 自定义底部</li>
                </ul>
              </div>
              
              <template #footer>
                <button @click="showAdvancedDialog = false">取消</button>
                <button 
                  class="demo-button--primary"
                  @click="handleConfirm"
                >
                  确定
                </button>
              </template>
            </LDialog>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  ThemeSelector, 
  DarkModeToggle 
} from '@ldesign/color/vue'
import { 
  LSelect, 
  LPopup, 
  LDialog 
} from '@ldesign/shared'

// 响应式数据
const selectedBasic = ref('')
const selectedColor = ref('')
const selectedSearchable = ref('')
const showBasicDialog = ref(false)
const showAdvancedDialog = ref(false)

// 自定义主题
const customThemes = [
  {
    name: 'brand',
    displayName: '品牌主题',
    description: '符合公司品牌的配色方案',
    light: { primary: '#ff6b35' },
    dark: { primary: '#ff8c69' }
  },
  {
    name: 'ocean',
    displayName: '海洋主题',
    description: '清新的海洋蓝色调',
    light: { primary: '#0077be' },
    dark: { primary: '#4da6d9' }
  }
]

// 选项数据
const basicOptions = [
  { value: 'option1', label: '选项一' },
  { value: 'option2', label: '选项二' },
  { value: 'option3', label: '选项三' }
]

const colorOptions = [
  { 
    value: 'blue', 
    label: '蓝色主题', 
    color: '#1890ff',
    description: '经典蓝色，专业稳重'
  },
  { 
    value: 'green', 
    label: '绿色主题', 
    color: '#52c41a',
    description: '清新绿色，自然活力'
  },
  { 
    value: 'purple', 
    label: '紫色主题', 
    color: '#722ed1',
    description: '优雅紫色，神秘高贵'
  }
]

const searchableOptions = Array.from({ length: 50 }, (_, i) => ({
  value: `item${i + 1}`,
  label: `选项 ${i + 1}`,
  description: `这是第 ${i + 1} 个选项的描述`
}))

// 事件处理
const handleThemeChange = (theme: string) => {
  console.log('主题已切换:', theme)
}

const handleModeChange = (isDark: boolean) => {
  console.log('模式已切换:', isDark ? '暗色' : '亮色')
}

const handleConfirm = () => {
  console.log('确认操作')
  showAdvancedDialog.value = false
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: var(--app-bg-primary, #ffffff);
  color: var(--app-text-primary, #333333);
  transition: all 0.3s ease;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--app-bg-secondary, #f8f9fa);
  border-bottom: 1px solid var(--app-border-primary, #e9ecef);
}

.app-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.app-main {
  padding: 2rem;
}

.demo-section {
  margin-bottom: 3rem;
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: var(--app-primary, #1890ff);
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-item {
  padding: 1.5rem;
  background: var(--app-bg-secondary, #f8f9fa);
  border-radius: 8px;
  border: 1px solid var(--app-border-primary, #e9ecef);
}

.demo-item h3 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.demo-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--app-border-primary, #e9ecef);
  border-radius: 4px;
  background: var(--app-bg-primary, #ffffff);
  color: var(--app-text-primary, #333333);
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-button:hover {
  background: var(--app-bg-secondary, #f8f9fa);
}

.demo-button--primary {
  background: var(--app-primary, #1890ff);
  color: white;
  border-color: var(--app-primary, #1890ff);
}

.demo-button--success {
  background: var(--app-success, #52c41a);
  color: white;
  border-color: var(--app-success, #52c41a);
}

.popup-content {
  padding: 1rem;
  min-width: 200px;
}

.dialog-content {
  line-height: 1.6;
}

.dialog-content ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.dialog-content li {
  margin: 0.5rem 0;
}
</style>
```

## 构建和部署

使用 @ldesign/builder 进行构建：

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

这个示例展示了 LDesign 生态系统的完整功能，包括颜色管理、主题切换、UI 组件和构建工具的协同使用。
