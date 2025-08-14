# @ldesign/size 使用指南

## 🚀 快速上手

### 1. 基础使用流程

**第一步：安装**
```bash
pnpm add @ldesign/size
```

**第二步：导入和初始化**
```javascript
import { globalSizeManager } from '@ldesign/size'

// 设置初始模式
globalSizeManager.setMode('medium')
```

**第三步：在CSS中使用变量**
```css
.my-component {
  font-size: var(--ls-font-size-base);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
}
```

**第四步：添加尺寸切换功能**
```javascript
// 切换到大尺寸
globalSizeManager.setMode('large')

// 监听尺寸变化
globalSizeManager.onSizeChange((event) => {
  console.log(`尺寸从 ${event.previousMode} 变为 ${event.currentMode}`)
})
```

### 2. 完整示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>尺寸缩放示例</title>
  <style>
    .container {
      padding: var(--ls-spacing-lg);
      font-size: var(--ls-font-size-base);
      border-radius: var(--ls-border-radius-base);
      background: #f5f5f5;
      transition: all 0.3s ease;
    }
    
    .button {
      height: var(--ls-button-height-medium);
      padding: 0 var(--ls-spacing-base);
      font-size: var(--ls-font-size-sm);
      border: none;
      border-radius: var(--ls-border-radius-base);
      background: #1890ff;
      color: white;
      cursor: pointer;
      margin-right: var(--ls-spacing-sm);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>页面尺寸缩放演示</h1>
    <p>点击按钮切换不同的尺寸模式，观察页面元素的变化。</p>
    
    <button class="button" onclick="setSize('small')">小尺寸</button>
    <button class="button" onclick="setSize('medium')">中尺寸</button>
    <button class="button" onclick="setSize('large')">大尺寸</button>
    <button class="button" onclick="setSize('extra-large')">超大尺寸</button>
    
    <p>当前模式: <span id="current-mode">medium</span></p>
  </div>

  <script type="module">
    import { globalSizeManager } from '@ldesign/size'
    
    // 全局函数
    window.setSize = (mode) => {
      globalSizeManager.setMode(mode)
    }
    
    // 更新显示
    const updateDisplay = () => {
      document.getElementById('current-mode').textContent = globalSizeManager.getCurrentMode()
    }
    
    // 监听变化
    globalSizeManager.onSizeChange(updateDisplay)
    
    // 初始化显示
    updateDisplay()
  </script>
</body>
</html>
```

## 🎨 Vue项目集成

### 1. 插件方式使用

**安装插件**：
```javascript
// main.js
import { createApp } from 'vue'
import { VueSizePlugin } from '@ldesign/size/vue'
import App from './App.vue'

const app = createApp(App)

// 使用插件
app.use(VueSizePlugin, {
  defaultMode: 'medium',
  prefix: '--ls',
  autoInject: true
})

app.mount('#app')
```

**在组件中使用全局属性**：
```vue
<template>
  <div>
    <p>当前模式: {{ $getSizeMode() }}</p>
    <button @click="$setSize('large')">切换到大尺寸</button>
  </div>
</template>

<script>
export default {
  mounted() {
    console.log('当前配置:', this.$getSizeConfig())
  }
}
</script>
```

### 2. Composition API使用

**基础Hook使用**：
```vue
<template>
  <div>
    <h2>当前模式: {{ currentModeDisplayName }}</h2>
    <p>基础字体: {{ currentConfig.fontSize.base }}</p>
    <p>基础间距: {{ currentConfig.spacing.base }}</p>
    
    <div class="controls">
      <button @click="previousMode">上一个</button>
      <button @click="nextMode">下一个</button>
      <button @click="setMode('small')">小尺寸</button>
      <button @click="setMode('large')">大尺寸</button>
    </div>
  </div>
</template>

<script setup>
import { useSize } from '@ldesign/size/vue'

const {
  currentMode,
  currentConfig,
  currentModeDisplayName,
  setMode,
  nextMode,
  previousMode
} = useSize({ global: true })

// 监听模式变化
watch(currentMode, (newMode, oldMode) => {
  console.log(`尺寸从 ${oldMode} 变为 ${newMode}`)
})
</script>
```

**响应式Hook使用**：
```vue
<template>
  <div>
    <div v-if="isSmall" class="mobile-layout">
      <h3>移动端布局</h3>
      <p>紧凑的单列布局</p>
    </div>
    
    <div v-else-if="isMedium" class="tablet-layout">
      <h3>平板布局</h3>
      <p>双列布局</p>
    </div>
    
    <div v-else class="desktop-layout">
      <h3>桌面布局</h3>
      <p>多列布局</p>
    </div>
    
    <div class="info">
      <p>至少中等尺寸: {{ isAtLeast('medium') ? '是' : '否' }}</p>
      <p>最多大尺寸: {{ isAtMost('large') ? '是' : '否' }}</p>
    </div>
  </div>
</template>

<script setup>
import { useSizeResponsive } from '@ldesign/size/vue'

const {
  isSmall,
  isMedium,
  isLarge,
  isExtraLarge,
  isAtLeast,
  isAtMost
} = useSizeResponsive()
</script>
```

### 3. 组件使用

**尺寸切换器组件**：
```vue
<template>
  <div class="demo-page">
    <!-- 页面头部的尺寸控制 -->
    <header class="header">
      <h1>我的应用</h1>
      <SizeControlPanel 
        :show-switcher="true"
        :show-indicator="true"
        switcher-style="button"
        @change="handleSizeChange"
      />
    </header>
    
    <!-- 侧边栏的简单切换器 -->
    <aside class="sidebar">
      <SizeSwitcher 
        switcher-style="select"
        @change="handleSizeChange"
      />
    </aside>
    
    <!-- 主内容区 -->
    <main class="main">
      <SizeIndicator :show-scale="true" />
      <p>这里是主要内容...</p>
    </main>
  </div>
</template>

<script setup>
import { 
  SizeSwitcher, 
  SizeIndicator, 
  SizeControlPanel 
} from '@ldesign/size/vue'

const handleSizeChange = (mode) => {
  console.log('尺寸变化:', mode)
  // 可以在这里执行额外的逻辑
}
</script>
```

## 🔧 高级配置

### 1. 自定义管理器

```javascript
import { createSizeManager } from '@ldesign/size'

// 创建自定义管理器
const customManager = createSizeManager({
  prefix: '--my-app',           // 自定义CSS变量前缀
  defaultMode: 'large',         // 默认尺寸模式
  styleId: 'my-size-vars',      // 样式标签ID
  selector: '.app-container',   // CSS选择器
  autoInject: false             // 手动控制CSS注入
})

// 手动注入CSS
customManager.injectCSS()

// 使用自定义管理器
customManager.setMode('extra-large')
```

### 2. 多实例管理

```javascript
// 为不同的模块创建独立的管理器
const headerSizeManager = createSizeManager({
  prefix: '--header',
  selector: '.header',
  defaultMode: 'medium'
})

const sidebarSizeManager = createSizeManager({
  prefix: '--sidebar',
  selector: '.sidebar',
  defaultMode: 'small'
})

const mainSizeManager = createSizeManager({
  prefix: '--main',
  selector: '.main-content',
  defaultMode: 'large'
})

// 独立控制各个区域的尺寸
headerSizeManager.setMode('large')
sidebarSizeManager.setMode('medium')
mainSizeManager.setMode('extra-large')
```

### 3. 事件监听和处理

```javascript
import { globalSizeManager } from '@ldesign/size'

// 基础事件监听
const unsubscribe = globalSizeManager.onSizeChange((event) => {
  console.log('尺寸变化事件:', event)
  
  // 根据尺寸变化执行不同逻辑
  switch (event.currentMode) {
    case 'small':
      // 移动端优化
      enableMobileOptimizations()
      break
    case 'large':
    case 'extra-large':
      // 大屏优化
      enableLargeScreenFeatures()
      break
  }
})

// 条件监听
const conditionalUnsubscribe = globalSizeManager.onSizeChange((event) => {
  // 只在特定条件下处理
  if (event.currentMode === 'extra-large' && event.previousMode !== 'extra-large') {
    // 进入演示模式
    enterPresentationMode()
  }
})

// 清理监听器
// unsubscribe()
// conditionalUnsubscribe()
```

## 🎯 实际应用场景

### 1. 管理后台系统

```vue
<template>
  <div class="admin-layout">
    <!-- 顶部导航 -->
    <header class="admin-header">
      <div class="logo">管理系统</div>
      <div class="header-controls">
        <SizeSwitcher switcher-style="select" />
        <UserMenu />
      </div>
    </header>
    
    <!-- 侧边栏 -->
    <aside class="admin-sidebar" :class="sidebarClass">
      <Navigation :collapsed="isSmall" />
    </aside>
    
    <!-- 主内容 -->
    <main class="admin-main">
      <div class="content-header">
        <Breadcrumb />
        <SizeIndicator />
      </div>
      
      <div class="content-body" :class="contentClass">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSizeResponsive } from '@ldesign/size/vue'

const { isSmall, isMedium, currentMode } = useSizeResponsive()

// 根据尺寸调整布局
const sidebarClass = computed(() => ({
  'sidebar--collapsed': isSmall.value,
  'sidebar--expanded': !isSmall.value
}))

const contentClass = computed(() => ({
  'content--compact': isSmall.value || isMedium.value,
  'content--spacious': !isSmall.value && !isMedium.value
}))
</script>

<style>
.admin-layout {
  display: grid;
  grid-template-areas: 
    "header header"
    "sidebar main";
  grid-template-rows: var(--ls-button-height-large) 1fr;
  grid-template-columns: var(--sidebar-width, 250px) 1fr;
  height: 100vh;
}

.admin-header {
  grid-area: header;
  padding: 0 var(--ls-spacing-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ls-bg-primary);
  border-bottom: 1px solid var(--ls-border-light);
}

.admin-sidebar {
  grid-area: sidebar;
  background: var(--ls-bg-secondary);
  transition: all 0.3s ease;
}

.sidebar--collapsed {
  --sidebar-width: 60px;
}

.admin-main {
  grid-area: main;
  overflow: auto;
}

.content-body {
  padding: var(--ls-spacing-lg);
}

.content--compact {
  padding: var(--ls-spacing-base);
}

.content--spacious {
  padding: var(--ls-spacing-xl);
}
</style>
```

### 2. 电商产品页面

```vue
<template>
  <div class="product-page">
    <!-- 产品图片区域 -->
    <div class="product-images" :class="imageLayoutClass">
      <ProductGallery :size="imageSize" />
    </div>
    
    <!-- 产品信息区域 -->
    <div class="product-info" :class="infoLayoutClass">
      <h1 class="product-title">{{ product.title }}</h1>
      <div class="product-price">¥{{ product.price }}</div>
      
      <!-- 根据尺寸显示不同详细程度的信息 -->
      <div v-if="showDetailedInfo" class="product-details">
        <ProductSpecs :specs="product.specs" />
        <ProductReviews :reviews="product.reviews" />
      </div>
      
      <div v-else class="product-summary">
        <p>{{ product.summary }}</p>
      </div>
      
      <!-- 购买按钮 -->
      <div class="purchase-actions">
        <button class="btn-primary" :class="buttonSizeClass">
          立即购买
        </button>
        <button class="btn-secondary" :class="buttonSizeClass">
          加入购物车
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSizeResponsive } from '@ldesign/size/vue'

const { currentMode, isSmall, isAtLeast } = useSizeResponsive()

// 根据尺寸调整图片大小
const imageSize = computed(() => {
  switch (currentMode.value) {
    case 'small': return 'small'
    case 'medium': return 'medium'
    case 'large': return 'large'
    case 'extra-large': return 'extra-large'
    default: return 'medium'
  }
})

// 是否显示详细信息
const showDetailedInfo = computed(() => isAtLeast('medium'))

// 布局类名
const imageLayoutClass = computed(() => ({
  'images--mobile': isSmall.value,
  'images--desktop': !isSmall.value
}))

const infoLayoutClass = computed(() => ({
  'info--compact': isSmall.value,
  'info--expanded': !isSmall.value
}))

const buttonSizeClass = computed(() => ({
  'btn--small': isSmall.value,
  'btn--large': isAtLeast('large')
}))
</script>
```

### 3. 在线阅读应用

```vue
<template>
  <div class="reader-app">
    <!-- 阅读设置面板 -->
    <div class="reader-controls" v-show="showControls">
      <div class="control-group">
        <label>字体大小:</label>
        <SizeSwitcher 
          switcher-style="button"
          @change="handleFontSizeChange"
        />
      </div>
      
      <div class="control-group">
        <label>行间距:</label>
        <select v-model="lineHeight">
          <option value="1.4">紧凑</option>
          <option value="1.6">标准</option>
          <option value="1.8">宽松</option>
        </select>
      </div>
    </div>
    
    <!-- 阅读内容 -->
    <article class="reader-content" :style="contentStyle">
      <h1>{{ article.title }}</h1>
      <div class="article-meta">
        <span>作者: {{ article.author }}</span>
        <span>发布时间: {{ article.publishTime }}</span>
      </div>
      
      <div class="article-body" v-html="article.content"></div>
    </article>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSize } from '@ldesign/size/vue'

const { currentConfig } = useSize({ global: true })
const lineHeight = ref(1.6)
const showControls = ref(false)

// 根据尺寸配置计算内容样式
const contentStyle = computed(() => ({
  fontSize: currentConfig.value.fontSize.base,
  lineHeight: lineHeight.value,
  padding: currentConfig.value.spacing.lg,
  maxWidth: getMaxWidth(),
  margin: '0 auto'
}))

const getMaxWidth = () => {
  switch (currentConfig.value.fontSize.base) {
    case '12px': return '600px'  // 小字体，窄一些
    case '16px': return '800px'  // 标准字体
    case '18px': return '900px'  // 大字体
    case '20px': return '1000px' // 超大字体
    default: return '800px'
  }
}

const handleFontSizeChange = (mode) => {
  // 可以添加阅读进度保存等逻辑
  saveReadingPreferences({ fontSize: mode, lineHeight: lineHeight.value })
}
</script>
```

## 💡 最佳实践

### 1. CSS变量使用规范

```css
/* ✅ 推荐：使用语义化的CSS变量 */
.card {
  padding: var(--ls-spacing-base);
  font-size: var(--ls-font-size-sm);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ls-shadow-sm);
}

/* ❌ 不推荐：硬编码值 */
.card {
  padding: 16px;
  font-size: 14px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* ✅ 推荐：提供回退值 */
.button {
  height: var(--ls-button-height-medium, 36px);
  font-size: var(--ls-font-size-sm, 14px);
}

/* ✅ 推荐：使用CSS变量进行计算 */
.container {
  padding: calc(var(--ls-spacing-base) * 2);
  margin: calc(var(--ls-spacing-lg) + var(--ls-spacing-sm));
}
```

### 2. 响应式设计结合

```css
/* 结合媒体查询和尺寸变量 */
.responsive-grid {
  display: grid;
  gap: var(--ls-spacing-base);
  padding: var(--ls-spacing-lg);
}

/* 小屏幕 */
@media (max-width: 768px) {
  .responsive-grid {
    grid-template-columns: 1fr;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-spacing-base);
  }
}

/* 大屏幕 */
@media (min-width: 1200px) {
  .responsive-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ls-spacing-xl);
    padding: var(--ls-spacing-xxl);
  }
}
```

### 3. 性能优化建议

```javascript
// ✅ 推荐：使用全局管理器
import { globalSizeManager } from '@ldesign/size'

// ❌ 不推荐：创建多个不必要的管理器实例
const manager1 = createSizeManager()
const manager2 = createSizeManager()

// ✅ 推荐：及时清理事件监听器
const unsubscribe = globalSizeManager.onSizeChange(callback)
// 在组件卸载时
onUnmounted(() => {
  unsubscribe()
})

// ✅ 推荐：使用防抖处理频繁的尺寸切换
import { debounce } from '@ldesign/size'

const debouncedHandler = debounce((mode) => {
  // 处理尺寸变化
}, 300)

globalSizeManager.onSizeChange(debouncedHandler)
```

---

*通过这些详细的使用指南和最佳实践，你可以充分发挥@ldesign/size的强大功能，为用户提供优秀的尺寸缩放体验。*
