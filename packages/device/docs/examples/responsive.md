# 响应式设计示例

本文档展示如何使用 @ldesign/device 库构建响应式设计，包括根据设备类型动态调整布局、创建响应式导航和自适应组件等。

## 场景描述

响应式设计是现代 Web 开发的核心需求之一。使用 @ldesign/device，您可以：

- **动态布局切换**：根据设备类型自动调整页面布局
- **响应式导航**：为不同设备提供最合适的导航方式
- **自适应组件**：创建能够智能适配各种设备的组件
- **断点管理**：灵活配置断点，精确控制布局切换时机

## 效果预览说明

实现本示例后，您的应用将能够：

1. 在移动设备上显示汉堡菜单和单栏布局
2. 在平板设备上显示折叠菜单和双栏布局
3. 在桌面设备上显示完整菜单和多栏布局
4. 平滑过渡各种布局变化
5. 自动适应屏幕方向变化

---

## Vue 3 实现方式

### 1. 响应式布局容器

创建一个智能响应式布局容器组件：

```vue
<script setup lang="ts">
import { useDevice } from '@ldesign/device/vue'
import { computed } from 'vue'

const props = defineProps<{
  mobileColumns?: number
  tabletColumns?: number
  desktopColumns?: number
}>()

// 获取设备信息
const { deviceType, orientation, isMobile, isTablet, isDesktop } = useDevice({
  enableResize: true,
  enableOrientation: true,
})

// 根据设备类型计算列数
const columns = computed(() => {
  if (isMobile.value) {
    return props.mobileColumns ?? 1
  } else if (isTablet.value) {
    return props.tabletColumns ?? 2
  } else {
    return props.desktopColumns ?? 3
  }
})

// 计算布局类名
const layoutClass = computed(() => {
  const classes = [
    `layout-${deviceType.value}`,
    `orientation-${orientation.value}`,
    `columns-${columns.value}`,
  ]
  return classes.join(' ')
})

// 计算容器样式
const containerStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gap: isMobile.value ? '12px' : isTablet.value ? '16px' : '24px',
  padding: isMobile.value ? '12px' : '24px',
}))
</script>

<template>
  <div :class="['responsive-container', layoutClass]" :style="containerStyle">
    <slot />
  </div>
</template>

<style scoped>
.responsive-container {
  width: 100%;
  transition: all 0.3s ease;
}

/* 移动端特殊样式 */
.layout-mobile {
  max-width: 100%;
}

/* 平板端特殊样式 */
.layout-tablet {
  max-width: 1024px;
  margin: 0 auto;
}

/* 桌面端特殊样式 */
.layout-desktop {
  max-width: 1200px;
  margin: 0 auto;
}

/* 横屏模式优化 */
.orientation-landscape.layout-mobile {
  max-width: 100vw;
}
</style>
```

### 2. 响应式导航组件

构建一个能够根据设备自动调整的导航组件：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDevice } from '@ldesign/device/vue'

interface NavItem {
  label: string
  path: string
  icon?: string
}

const props = defineProps<{
  items: NavItem[]
}>()

const { isMobile, isTablet, isDesktop } = useDevice()

// 移动端菜单展开状态
const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const handleNavClick = (item: NavItem) => {
  console.log('导航到:', item.path)
  // 移动端点击后关闭菜单
  if (isMobile.value) {
    mobileMenuOpen.value = false
  }
}
</script>

<template>
  <nav class="responsive-nav">
    <!-- 移动端导航 -->
    <div v-if="isMobile" class="mobile-nav">
      <!-- 顶部栏 -->
      <div class="mobile-header">
        <h1 class="logo">My App</h1>
        <button
          class="hamburger-btn"
          :class="{ active: mobileMenuOpen }"
          @click="toggleMobileMenu"
          aria-label="切换菜单"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <!-- 下拉菜单 -->
      <Transition name="slide-down">
        <div v-show="mobileMenuOpen" class="mobile-menu">
          <div
            v-for="item in items"
            :key="item.path"
            class="mobile-menu-item"
            @click="handleNavClick(item)"
          >
            <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 平板端导航 -->
    <div v-else-if="isTablet" class="tablet-nav">
      <div class="tablet-header">
        <h1 class="logo">My App</h1>
        <div class="tablet-menu">
          <div
            v-for="item in items"
            :key="item.path"
            class="tablet-menu-item"
            @click="handleNavClick(item)"
          >
            <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 桌面端导航 -->
    <div v-else class="desktop-nav">
      <div class="desktop-header">
        <h1 class="logo">My App</h1>
        <div class="desktop-menu">
          <div
            v-for="item in items"
            :key="item.path"
            class="desktop-menu-item"
            @click="handleNavClick(item)"
          >
            <span v-if="item.icon" class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
        <div class="desktop-actions">
          <button class="action-btn">登录</button>
          <button class="action-btn primary">注册</button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* 基础样式 */
.responsive-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #2196f3;
  margin: 0;
}

.nav-icon {
  margin-right: 8px;
  font-size: 18px;
}

.nav-label {
  font-size: 14px;
}

/* 移动端样式 */
.mobile-nav {
  width: 100%;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.hamburger-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hamburger-btn span {
  display: block;
  width: 24px;
  height: 2px;
  background: #333;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-menu {
  background: white;
  border-top: 1px solid #e0e0e0;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.mobile-menu-item:hover {
  background: #f5f5f5;
}

.mobile-menu-item:active {
  background: #e0e0e0;
}

/* 平板端样式 */
.tablet-nav {
  width: 100%;
}

.tablet-header {
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.tablet-menu {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.tablet-menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.tablet-menu-item:hover {
  background: #e0e0e0;
  transform: translateY(-2px);
}

/* 桌面端样式 */
.desktop-nav {
  width: 100%;
}

.desktop-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.desktop-menu {
  display: flex;
  gap: 24px;
  flex: 1;
  justify-content: center;
}

.desktop-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
}

.desktop-menu-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 80%;
  height: 2px;
  background: #2196f3;
  transition: transform 0.3s ease;
}

.desktop-menu-item:hover {
  color: #2196f3;
}

.desktop-menu-item:hover::after {
  transform: translateX(-50%) scaleX(1);
}

.desktop-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 20px;
  border: 1px solid #2196f3;
  background: white;
  color: #2196f3;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
}

.action-btn.primary {
  background: #2196f3;
  color: white;
}

.action-btn.primary:hover {
  background: #1976d2;
}

/* 过渡动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
```

### 3. 自适应卡片组件

创建一个能够根据设备自动调整大小和布局的卡片组件：

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useDevice } from '@ldesign/device/vue'

interface CardProps {
  title: string
  description: string
  image?: string
  compact?: boolean
}

const props = defineProps<CardProps>()

const { isMobile, isTablet, deviceInfo } = useDevice()

// 根据设备计算卡片布局
const cardLayout = computed(() => {
  if (props.compact) {
    return 'compact'
  }
  if (isMobile.value) {
    return 'vertical'
  }
  if (isTablet.value) {
    return 'horizontal'
  }
  return 'full'
})

// 计算图片尺寸
const imageSize = computed(() => {
  if (isMobile.value) {
    return { width: '100%', height: '200px' }
  }
  if (isTablet.value) {
    return { width: '150px', height: '150px' }
  }
  return { width: '200px', height: '200px' }
})

// 计算字体大小
const fontSize = computed(() => {
  const baseSize = isMobile.value ? 14 : isTablet.value ? 15 : 16
  return {
    title: `${baseSize + 4}px`,
    description: `${baseSize}px`,
  }
})
</script>

<template>
  <div :class="['adaptive-card', `layout-${cardLayout}`]">
    <div v-if="image" class="card-image" :style="imageSize">
      <img :src="image" :alt="title" />
    </div>
    <div class="card-content">
      <h3 class="card-title" :style="{ fontSize: fontSize.title }">
        {{ title }}
      </h3>
      <p class="card-description" :style="{ fontSize: fontSize.description }">
        {{ description }}
      </p>
      <div class="card-actions">
        <button class="card-btn">
          {{ isMobile ? '查看' : '了解更多' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.adaptive-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.adaptive-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 紧凑布局 */
.layout-compact {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 12px;
}

.layout-compact .card-image {
  width: 80px !important;
  height: 80px !important;
  flex-shrink: 0;
  margin-right: 12px;
}

.layout-compact .card-content {
  flex: 1;
}

.layout-compact .card-title {
  font-size: 14px !important;
  margin-bottom: 4px;
}

.layout-compact .card-description {
  font-size: 12px !important;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.layout-compact .card-actions {
  margin-top: 8px;
}

/* 垂直布局（移动端） */
.layout-vertical {
  display: flex;
  flex-direction: column;
}

.layout-vertical .card-image {
  width: 100%;
}

.layout-vertical .card-content {
  padding: 16px;
}

/* 水平布局（平板） */
.layout-horizontal {
  display: flex;
  flex-direction: row;
}

.layout-horizontal .card-image {
  flex-shrink: 0;
}

.layout-horizontal .card-content {
  flex: 1;
  padding: 16px;
}

/* 完整布局（桌面） */
.layout-full {
  display: flex;
  flex-direction: column;
}

.layout-full .card-image {
  width: 100%;
}

.layout-full .card-content {
  padding: 24px;
}

/* 通用样式 */
.card-image {
  overflow: hidden;
  background: #f5f5f5;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-title {
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.card-description {
  color: #666;
  line-height: 1.6;
  margin: 0 0 16px 0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.card-btn {
  padding: 8px 16px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.card-btn:hover {
  background: #1976d2;
}

.card-btn:active {
  transform: scale(0.98);
}
</style>
```

### 4. 完整的响应式页面示例

将以上组件组合成完整的响应式页面：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDevice } from '@ldesign/device/vue'
import ResponsiveContainer from './components/ResponsiveContainer.vue'
import ResponsiveNav from './components/ResponsiveNav.vue'
import AdaptiveCard from './components/AdaptiveCard.vue'

const { deviceType, orientation } = useDevice({
  enableResize: true,
  enableOrientation: true,
})

// 导航菜单项
const navItems = [
  { label: '首页', path: '/', icon: '🏠' },
  { label: '产品', path: '/products', icon: '📦' },
  { label: '服务', path: '/services', icon: '⚙️' },
  { label: '关于', path: '/about', icon: 'ℹ️' },
  { label: '联系', path: '/contact', icon: '📧' },
]

// 卡片数据
const cards = ref([
  {
    title: '响应式设计',
    description: '自动适配各种设备和屏幕尺寸，提供最佳用户体验',
    image: '/images/responsive.jpg',
  },
  {
    title: '性能优化',
    description: '智能加载和缓存策略，确保应用快速流畅运行',
    image: '/images/performance.jpg',
  },
  {
    title: '现代化工具',
    description: '使用最新的 Web 技术栈，构建高质量应用',
    image: '/images/tools.jpg',
  },
  {
    title: '跨平台支持',
    description: '一次开发，在所有平台和设备上完美运行',
    image: '/images/cross-platform.jpg',
  },
])
</script>

<template>
  <div class="app">
    <!-- 响应式导航 -->
    <ResponsiveNav :items="navItems" />

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 页面标题 -->
      <section class="hero-section">
        <ResponsiveContainer
          :mobile-columns="1"
          :tablet-columns="1"
          :desktop-columns="1"
        >
          <div class="hero-content">
            <h1>欢迎使用响应式设计</h1>
            <p>
              当前设备类型：<strong>{{ deviceType }}</strong><br>
              屏幕方向：<strong>{{ orientation === 'portrait' ? '竖屏' : '横屏' }}</strong>
            </p>
          </div>
        </ResponsiveContainer>
      </section>

      <!-- 卡片网格 -->
      <section class="cards-section">
        <ResponsiveContainer
          :mobile-columns="1"
          :tablet-columns="2"
          :desktop-columns="3"
        >
          <AdaptiveCard
            v-for="card in cards"
            :key="card.title"
            :title="card.title"
            :description="card.description"
            :image="card.image"
          />
        </ResponsiveContainer>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <ResponsiveContainer
        :mobile-columns="1"
        :tablet-columns="2"
        :desktop-columns="3"
      >
        <div class="footer-section">
          <h4>关于我们</h4>
          <p>提供最佳的响应式设计解决方案</p>
        </div>
        <div class="footer-section">
          <h4>联系方式</h4>
          <p>Email: contact@example.com</p>
        </div>
        <div class="footer-section">
          <h4>关注我们</h4>
          <p>GitHub | Twitter | LinkedIn</p>
        </div>
      </ResponsiveContainer>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  background: #f5f5f5;
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.hero-content h1 {
  font-size: clamp(24px, 5vw, 48px);
  margin: 0 0 16px 0;
}

.hero-content p {
  font-size: clamp(14px, 3vw, 18px);
  opacity: 0.9;
}

.cards-section {
  padding: 40px 0;
}

.footer {
  background: #333;
  color: white;
  padding: 40px 20px;
  margin-top: 40px;
}

.footer-section h4 {
  margin-top: 0;
  margin-bottom: 12px;
  font-size: 16px;
}

.footer-section p {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px;
  }

  .cards-section {
    padding: 24px 0;
  }

  .footer {
    padding: 24px 16px;
  }
}
</style>
```

---

## 原生 JavaScript 实现方式

### 响应式布局管理器

```typescript
import { DeviceDetector } from '@ldesign/device'

/**
 * 响应式布局管理器
 */
class ResponsiveLayoutManager {
  private detector: DeviceDetector
  private layouts: Map<string, LayoutConfig> = new Map()

  constructor() {
    this.detector = new DeviceDetector({
      enableResize: true,
      enableOrientation: true,
      debounceDelay: 300,
    })

    this.initEventListeners()
  }

  /**
   * 注册布局配置
   */
  registerLayout(name: string, config: LayoutConfig) {
    this.layouts.set(name, config)
    this.applyLayout(name)
  }

  /**
   * 应用布局
   */
  private applyLayout(name: string) {
    const config = this.layouts.get(name)
    if (!config) return

    const deviceInfo = this.detector.getDeviceInfo()
    const layoutRules = this.getLayoutRules(config, deviceInfo.type)

    // 应用布局规则
    this.applyLayoutRules(layoutRules)
  }

  /**
   * 获取布局规则
   */
  private getLayoutRules(config: LayoutConfig, deviceType: string) {
    switch (deviceType) {
      case 'mobile':
        return config.mobile
      case 'tablet':
        return config.tablet
      case 'desktop':
        return config.desktop
      default:
        return config.desktop
    }
  }

  /**
   * 应用布局规则到 DOM
   */
  private applyLayoutRules(rules: LayoutRules) {
    Object.entries(rules).forEach(([selector, styles]) => {
      const elements = document.querySelectorAll(selector)
      elements.forEach(element => {
        Object.assign((element as HTMLElement).style, styles)
      })
    })
  }

  /**
   * 初始化事件监听
   */
  private initEventListeners() {
    this.detector.on('deviceChange', () => {
      // 重新应用所有布局
      this.layouts.forEach((_, name) => {
        this.applyLayout(name)
      })
    })
  }

  /**
   * 销毁管理器
   */
  destroy() {
    this.detector.destroy()
    this.layouts.clear()
  }
}

interface LayoutConfig {
  mobile: LayoutRules
  tablet: LayoutRules
  desktop: LayoutRules
}

interface LayoutRules {
  [selector: string]: Partial<CSSStyleDeclaration>
}

// 使用示例
const layoutManager = new ResponsiveLayoutManager()

// 注册主容器布局
layoutManager.registerLayout('main-container', {
  mobile: {
    '.container': {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '12px',
      padding: '12px',
    },
    '.card': {
      fontSize: '14px',
    },
  },
  tablet: {
    '.container': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '16px',
      padding: '16px',
    },
    '.card': {
      fontSize: '15px',
    },
  },
  desktop: {
    '.container': {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '24px',
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    '.card': {
      fontSize: '16px',
    },
  },
})
```

### 响应式导航实现

```typescript
import { DeviceDetector } from '@ldesign/device'

/**
 * 响应式导航组件
 */
class ResponsiveNavigation {
  private detector: DeviceDetector
  private container: HTMLElement
  private menuOpen = false

  constructor(containerId: string) {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error(`Container ${containerId} not found`)
    }
    this.container = container

    this.detector = new DeviceDetector({
      enableResize: true,
    })

    this.init()
  }

  private init() {
    this.render()
    this.bindEvents()

    // 监听设备变化
    this.detector.on('deviceChange', () => {
      this.render()
    })
  }

  private render() {
    const isMobile = this.detector.isMobile()
    const isTablet = this.detector.isTablet()

    if (isMobile) {
      this.renderMobileNav()
    } else if (isTablet) {
      this.renderTabletNav()
    } else {
      this.renderDesktopNav()
    }
  }

  private renderMobileNav() {
    this.container.innerHTML = `
      <div class="mobile-nav">
        <div class="mobile-header">
          <h1 class="logo">My App</h1>
          <button class="hamburger-btn" aria-label="切换菜单">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <div class="mobile-menu" style="display: none;">
          ${this.renderMenuItems()}
        </div>
      </div>
    `
  }

  private renderTabletNav() {
    this.container.innerHTML = `
      <div class="tablet-nav">
        <div class="tablet-header">
          <h1 class="logo">My App</h1>
          <div class="tablet-menu">
            ${this.renderMenuItems()}
          </div>
        </div>
      </div>
    `
  }

  private renderDesktopNav() {
    this.container.innerHTML = `
      <div class="desktop-nav">
        <div class="desktop-header">
          <h1 class="logo">My App</h1>
          <div class="desktop-menu">
            ${this.renderMenuItems()}
          </div>
          <div class="desktop-actions">
            <button class="action-btn">登录</button>
            <button class="action-btn primary">注册</button>
          </div>
        </div>
      </div>
    `
  }

  private renderMenuItems(): string {
    const items = [
      { label: '首页', path: '/' },
      { label: '产品', path: '/products' },
      { label: '服务', path: '/services' },
      { label: '关于', path: '/about' },
      { label: '联系', path: '/contact' },
    ]

    const isMobile = this.detector.isMobile()
    const className = isMobile ? 'mobile-menu-item' :
                      this.detector.isTablet() ? 'tablet-menu-item' :
                      'desktop-menu-item'

    return items
      .map(item => `
        <div class="${className}" data-path="${item.path}">
          ${item.label}
        </div>
      `)
      .join('')
  }

  private bindEvents() {
    // 使用事件委托处理点击事件
    this.container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement

      // 处理汉堡菜单按钮点击
      if (target.closest('.hamburger-btn')) {
        this.toggleMobileMenu()
      }

      // 处理菜单项点击
      const menuItem = target.closest('[data-path]') as HTMLElement
      if (menuItem) {
        const path = menuItem.dataset.path
        console.log('导航到:', path)

        // 移动端点击后关闭菜单
        if (this.detector.isMobile()) {
          this.closeMobileMenu()
        }
      }
    })
  }

  private toggleMobileMenu() {
    this.menuOpen = !this.menuOpen
    const menu = this.container.querySelector('.mobile-menu') as HTMLElement
    const btn = this.container.querySelector('.hamburger-btn') as HTMLElement

    if (this.menuOpen) {
      menu.style.display = 'block'
      btn.classList.add('active')
    } else {
      menu.style.display = 'none'
      btn.classList.remove('active')
    }
  }

  private closeMobileMenu() {
    this.menuOpen = false
    const menu = this.container.querySelector('.mobile-menu') as HTMLElement
    const btn = this.container.querySelector('.hamburger-btn') as HTMLElement

    if (menu) menu.style.display = 'none'
    if (btn) btn.classList.remove('active')
  }

  destroy() {
    this.detector.destroy()
  }
}

// 使用示例
const navigation = new ResponsiveNavigation('nav-container')
```

---

## 代码解释

### 关键概念

1. **响应式容器**：根据设备类型动态调整布局网格
2. **自适应组件**：组件内部根据设备信息调整渲染方式
3. **布局管理器**：统一管理整个应用的布局规则
4. **事件驱动**：通过监听设备变化事件实现自动更新

### 性能优化

1. **防抖处理**：避免频繁的布局重计算
2. **CSS 过渡**：使用 CSS transition 实现平滑过渡
3. **条件渲染**：只渲染当前设备需要的内容
4. **事件委托**：减少事件监听器数量

---

## 扩展建议

1. **断点自定义**
   ```typescript
   const detector = new DeviceDetector({
     breakpoints: {
       mobile: 480,   // 小屏手机
       tablet: 768,   // 平板
       desktop: 1024, // 桌面
     },
   })
   ```

2. **添加更多断点**
   ```typescript
   // 支持更细粒度的断点
   enum Breakpoint {
     XS = 'xs',   // < 480px
     SM = 'sm',   // 480px - 768px
     MD = 'md',   // 768px - 1024px
     LG = 'lg',   // 1024px - 1440px
     XL = 'xl',   // > 1440px
   }
   ```

3. **响应式图片**
   ```vue
   <picture>
     <source
       v-if="isDesktop"
       :srcset="image.desktop"
       media="(min-width: 1024px)"
     >
     <source
       v-else-if="isTablet"
       :srcset="image.tablet"
       media="(min-width: 768px)"
     >
     <img :src="image.mobile" :alt="alt">
   </picture>
   ```

4. **响应式字体**
   ```css
   .title {
     font-size: clamp(24px, 5vw, 48px);
   }
   ```

---

## 最佳实践

1. **移动优先**：从移动端开始设计，逐步增强
2. **流式布局**：使用百分比和弹性布局
3. **触摸友好**：为移动设备增大可点击区域
4. **性能优先**：避免不必要的重渲染
5. **渐进增强**：确保基础功能在所有设备上可用

---

## 相关链接

- [基础使用示例](./index.md) - 了解基础设备检测
- [网络状态监听示例](./network.md) - 网络自适应加载
- [电池监控示例](./battery.md) - 省电模式优化
- [API 参考文档](../api/) - 查看完整 API
