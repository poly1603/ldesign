# 设备模板

设备模板是 LDesign Router 模板系统的核心特性，允许您为不同设备类型创建专门优化的页面模板。这确保了在各种设备上都能提供最佳的用户体验。

## 概述

设备模板系统提供：

- 📱 **设备特定优化** - 为移动端、平板和桌面端创建专门的模板
- 🔄 **智能回退机制** - 自动处理模板缺失的情况
- 🎨 **响应式设计** - 支持响应式和适应式设计模式
- ⚡ **性能优化** - 只加载当前设备需要的模板
- 🛠️ **开发友好** - 完整的开发工具和调试支持

## 设备类型

### 支持的设备类型

```typescript
type DeviceType = 'mobile' | 'tablet' | 'desktop'
```

- **mobile** - 手机设备（通常 < 768px）
- **tablet** - 平板设备（768px - 992px）
- **desktop** - 桌面设备（> 992px）

### 设备检测

```typescript
import { useDeviceDetection } from '@ldesign/router'

export default defineComponent({
  setup() {
    const { currentDevice, deviceInfo } = useDeviceDetection()
    
    console.log('当前设备:', currentDevice.value) // 'mobile' | 'tablet' | 'desktop'
    console.log('设备信息:', deviceInfo.value)
    
    return {
      currentDevice,
      deviceInfo,
    }
  },
})
```

## 模板组织结构

### 推荐的目录结构

```
src/templates/
├── pages/
│   ├── mobile/
│   │   ├── home.vue           # 移动端首页
│   │   ├── product-list.vue   # 移动端产品列表
│   │   └── user-profile.vue   # 移动端用户资料
│   ├── tablet/
│   │   ├── home.vue           # 平板端首页
│   │   └── product-list.vue   # 平板端产品列表
│   └── desktop/
│       ├── home.vue           # 桌面端首页
│       ├── product-list.vue   # 桌面端产品列表
│       └── user-profile.vue   # 桌面端用户资料
├── components/
│   ├── mobile/
│   │   ├── navigation.vue     # 移动端导航
│   │   └── sidebar.vue        # 移动端侧边栏
│   └── desktop/
│       ├── navigation.vue     # 桌面端导航
│       └── sidebar.vue        # 桌面端侧边栏
└── layouts/
    ├── mobile/
    │   └── main.vue           # 移动端主布局
    └── desktop/
        └── main.vue           # 桌面端主布局
```

### 命名约定

1. **目录命名** - 使用设备类型作为目录名
2. **文件命名** - 使用 kebab-case 命名模板文件
3. **一致性** - 保持跨设备的文件名一致性

## 创建设备模板

### 移动端模板示例

```vue
<!-- src/templates/pages/mobile/home.vue -->
<template>
  <div class="mobile-home">
    <header class="mobile-header">
      <h1>移动端首页</h1>
      <button class="menu-toggle" @click="toggleMenu">☰</button>
    </header>
    
    <main class="mobile-content">
      <section class="hero-section">
        <h2>欢迎使用移动端</h2>
        <p>专为移动设备优化的界面</p>
      </section>
      
      <section class="features">
        <div class="feature-card" v-for="feature in features" :key="feature.id">
          <h3>{{ feature.title }}</h3>
          <p>{{ feature.description }}</p>
        </div>
      </section>
    </main>
    
    <nav class="mobile-nav" :class="{ active: showMenu }">
      <router-link to="/" @click="closeMenu">首页</router-link>
      <router-link to="/products" @click="closeMenu">产品</router-link>
      <router-link to="/about" @click="closeMenu">关于</router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showMenu = ref(false)
const features = ref([
  { id: 1, title: '触摸优化', description: '专为触摸操作设计' },
  { id: 2, title: '快速加载', description: '优化的资源加载' },
  { id: 3, title: '离线支持', description: '支持离线浏览' },
])

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const closeMenu = () => {
  showMenu.value = false
}
</script>

<style scoped>
.mobile-home {
  min-height: 100vh;
  background: #f5f5f5;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-content {
  padding: 1rem;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.feature-card {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mobile-nav {
  position: fixed;
  top: 0;
  left: -100%;
  width: 80%;
  height: 100vh;
  background: #fff;
  transition: left 0.3s ease;
  padding: 2rem 1rem;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}

.mobile-nav.active {
  left: 0;
}

.mobile-nav a {
  display: block;
  padding: 1rem 0;
  text-decoration: none;
  color: #333;
  border-bottom: 1px solid #eee;
}
</style>
```

### 桌面端模板示例

```vue
<!-- src/templates/pages/desktop/home.vue -->
<template>
  <div class="desktop-home">
    <header class="desktop-header">
      <div class="container">
        <h1>桌面端首页</h1>
        <nav class="desktop-nav">
          <router-link to="/">首页</router-link>
          <router-link to="/products">产品</router-link>
          <router-link to="/about">关于</router-link>
        </nav>
      </div>
    </header>
    
    <main class="desktop-content">
      <div class="container">
        <section class="hero-section">
          <div class="hero-text">
            <h2>欢迎使用桌面端</h2>
            <p>专为大屏幕设备优化的界面</p>
            <button class="cta-button">开始使用</button>
          </div>
          <div class="hero-image">
            <img src="/images/hero-desktop.jpg" alt="桌面端展示">
          </div>
        </section>
        
        <section class="features">
          <div class="features-grid">
            <div class="feature-card" v-for="feature in features" :key="feature.id">
              <div class="feature-icon">{{ feature.icon }}</div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const features = ref([
  { id: 1, icon: '🖥️', title: '大屏优化', description: '充分利用大屏幕空间' },
  { id: 2, icon: '⚡', title: '高性能', description: '桌面级性能体验' },
  { id: 3, icon: '🎯', title: '精确操作', description: '支持鼠标和键盘操作' },
  { id: 4, icon: '📊', title: '数据可视化', description: '丰富的图表和数据展示' },
])
</script>

<style scoped>
.desktop-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.desktop-header {
  padding: 1rem 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.desktop-header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.desktop-nav {
  display: flex;
  gap: 2rem;
}

.desktop-nav a {
  color: #fff;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.desktop-nav a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.hero-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  padding: 4rem 0;
}

.hero-text h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.hero-text p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  background: #fff;
  color: #667eea;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
}

.hero-image img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.features {
  padding: 4rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
}
</style>
```

## 回退机制

### 自动回退策略

当请求的设备模板不存在时，系统会按以下顺序尝试：

1. **当前设备模板** - 首先尝试加载指定设备的模板
2. **桌面端模板** - 如果当前设备模板不存在，回退到桌面端
3. **错误组件** - 如果桌面端模板也不存在，显示错误组件

```typescript
// 回退示例
// 请求: mobile/special-page.vue (不存在)
// 回退: desktop/special-page.vue
// 如果仍不存在: 显示错误组件

const component = await resolver.resolveTemplate('pages', 'special-page', 'mobile')
// 自动处理回退逻辑，无需手动干预
```

### 自定义回退逻辑

```typescript
const resolver = new TemplateRouteResolver({
  onTemplateFallback: (category, name, requestedDevice, fallbackDevice) => {
    console.log(`模板回退: ${requestedDevice} -> ${fallbackDevice}`)
    // 可以在这里记录分析数据或执行其他逻辑
  },
})
```

## 最佳实践

### 1. 设计一致性

```typescript
// 保持跨设备的功能一致性
// 所有设备都应该提供相同的核心功能
const coreFeatures = [
  'navigation',
  'search',
  'user-profile',
  'settings',
]

// 但可以有不同的交互方式和布局
```

### 2. 性能优化

```typescript
// 只加载当前设备需要的资源
// 移动端模板
const mobileAssets = [
  'mobile-icons.svg',
  'mobile-styles.css',
  'touch-gestures.js',
]

// 桌面端模板
const desktopAssets = [
  'desktop-icons.svg',
  'desktop-styles.css',
  'keyboard-shortcuts.js',
]
```

### 3. 测试策略

```typescript
// 为每个设备类型编写测试
describe('设备模板测试', () => {
  test('移动端模板加载', async () => {
    const component = await resolver.resolveTemplate('pages', 'home', 'mobile')
    expect(component).toBeDefined()
  })
  
  test('桌面端模板加载', async () => {
    const component = await resolver.resolveTemplate('pages', 'home', 'desktop')
    expect(component).toBeDefined()
  })
  
  test('回退机制', async () => {
    // 测试不存在的移动端模板是否正确回退到桌面端
    const component = await resolver.resolveTemplate('pages', 'desktop-only', 'mobile')
    expect(component).toBeDefined()
  })
})
```

### 4. 开发工具

```typescript
// 开发环境的设备切换工具
if (process.env.NODE_ENV === 'development') {
  window.__DEVICE_SWITCHER__ = {
    switchTo: (device: DeviceType) => {
      // 强制切换设备类型进行测试
      window.dispatchEvent(new CustomEvent('device-change', { detail: device }))
    },
  }
}
```

## 调试和监控

### 模板加载监控

```typescript
const resolver = new TemplateRouteResolver({
  debug: true,
  onTemplateLoad: (category, name, device, loadTime) => {
    console.log(`模板加载: ${category}/${name}@${device} - ${loadTime}ms`)
  },
  onTemplateFallback: (category, name, from, to) => {
    console.warn(`模板回退: ${category}/${name} ${from} -> ${to}`)
  },
})
```

### 性能分析

```typescript
// 获取设备模板的性能统计
const stats = resolver.getDeviceStats()
console.log('设备模板统计:', {
  mobile: stats.mobile,
  tablet: stats.tablet,
  desktop: stats.desktop,
  fallbackRate: stats.fallbackRate,
})
```

## 下一步

- [模板路由](./template-routing.md) - 了解模板路由的基础配置
- [模板解析器](./template-resolver.md) - 深入了解模板解析器的高级功能
