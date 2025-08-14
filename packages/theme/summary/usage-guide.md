# LDesign Theme 使用指南

## 概述

LDesign Theme 是一个功能强大的主题系统，专为现代 Web 应用设计。本指南将详细介绍如何在项目中使用
LDesign Theme，包括安装、配置、使用和自定义等各个方面。

## 快速开始

### 1. 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/theme

# 使用 npm
npm install @ldesign/theme

# 使用 yarn
yarn add @ldesign/theme
```

### 2. 基础配置

#### Vue 应用集成

```typescript
// main.ts
import { createApp } from 'vue'
import { VueThemePlugin } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme, halloweenTheme } from '@ldesign/theme/themes'
import App from './App.vue'

const app = createApp(App)

// 安装主题插件
app.use(VueThemePlugin, {
  themes: [christmasTheme, springFestivalTheme, halloweenTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
  debug: process.env.NODE_ENV === 'development',
})

app.mount('#app')
```

#### 纯 JavaScript 使用

```typescript
import { createThemeManager } from '@ldesign/theme'
import { christmasTheme, springFestivalTheme } from '@ldesign/theme/themes'

// 创建主题管理器
const themeManager = createThemeManager({
  themes: [christmasTheme, springFestivalTheme],
  defaultTheme: 'christmas',
  autoActivate: true,
})

// 初始化
await themeManager.init()
```

## 核心功能使用

### 主题管理

#### 切换主题

```typescript
// 使用主题管理器
await themeManager.setTheme('spring-festival')

// 使用 Vue 组合式函数
const { setTheme } = useTheme()
await setTheme('spring-festival')
```

#### 监听主题变化

```typescript
// 监听主题变化事件
themeManager.on('theme-changed', event => {
  console.log(`主题已切换到: ${event.theme}`)
  // 执行主题切换后的逻辑
})

// 监听主题加载
themeManager.on('theme-loading', event => {
  console.log(`正在加载主题: ${event.theme}`)
  // 显示加载状态
})

// 监听错误
themeManager.on('theme-error', event => {
  console.error(`主题错误: ${event.error.message}`)
  // 处理错误情况
})
```

#### 获取主题信息

```typescript
// 获取当前主题
const currentTheme = themeManager.getCurrentTheme()

// 获取所有可用主题
const availableThemes = themeManager.getAvailableThemes()

// 获取主题配置
const themeConfig = themeManager.getTheme('christmas')
console.log(themeConfig.displayName) // '圣诞节'
console.log(themeConfig.colors.light.primary) // '#dc2626'
```

### 装饰元素使用

#### 添加装饰元素

```typescript
// 使用主题管理器
themeManager.addDecoration({
  id: 'custom-snowflake',
  name: '自定义雪花',
  type: 'svg',
  src: '/snowflake.svg',
  position: {
    type: 'fixed',
    position: { x: '50%', y: '10%' },
    anchor: 'top-center',
  },
  style: {
    size: { width: '30px', height: '30px' },
    opacity: 0.8,
    zIndex: 1000,
  },
  animation: 'snowfall',
  interactive: true,
  responsive: true,
})

// 使用 Vue 组合式函数
const { addDecoration } = useThemeDecorations()
addDecoration({
  // 装饰配置
})
```

#### 管理装饰元素

```typescript
// 移除装饰元素
themeManager.removeDecoration('custom-snowflake')

// 更新装饰元素
themeManager.updateDecoration('custom-snowflake', {
  style: {
    opacity: 0.5,
  },
})

// 获取所有装饰元素
const decorations = themeManager.getDecorations()

// 清空所有装饰元素
themeManager.clearDecorations()
```

#### 批量创建装饰效果

```typescript
import { createSnowfallEffect, createSpringFestivalLanterns } from '@ldesign/theme/decorations'

// 创建雪花效果
const snowflakes = createSnowfallEffect(document.body, {
  count: 20,
  intensity: 'medium',
  duration: 8000,
})

// 创建春节灯笼
const lanterns = createSpringFestivalLanterns(document.body, {
  type: 'pair',
  size: 'large',
  interactive: true,
})

// 创建庆祝烟花
const fireworks = createCelebrationFireworks(document.body, {
  intensity: 'heavy',
  duration: 10000,
})
```

### 动画效果使用

#### 控制动画

```typescript
// 开始动画
themeManager.startAnimation('snowfall')

// 停止动画
themeManager.stopAnimation('snowfall')

// 暂停动画
themeManager.pauseAnimation('snowfall')

// 恢复动画
themeManager.resumeAnimation('snowfall')
```

#### 创建自定义动画

```typescript
import { FallingAnimation, FloatingAnimation, SparklingAnimation } from '@ldesign/theme/animations'

// 创建雪花下落动画
const snowfall = FallingAnimation.createSnowfall(elements, {
  duration: 8000,
  intensity: 'heavy',
  wind: 10,
})

// 创建幽灵漂浮动画
const ghostFloat = FloatingAnimation.createGhostFloat(elements, {
  amplitude: 15,
  opacity: true,
})

// 创建星光闪烁动画
const starSparkle = SparklingAnimation.createStarSparkle(elements, {
  intensity: 'intense',
  color: '#FFD700',
})

// 开始动画
snowfall.start()
ghostFloat.start()
starSparkle.start()
```

## Vue 组件使用

### ThemeProvider 组件

```vue
<template>
  <ThemeProvider :themes="themes" :theme="currentTheme" :auto-activate="true" :debug="isDev">
    <div id="app">
      <!-- 应用内容 -->
      <router-view />
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeProvider } from '@ldesign/theme/vue'
import { christmasTheme, springFestivalTheme, halloweenTheme } from '@ldesign/theme/themes'

const themes = [christmasTheme, springFestivalTheme, halloweenTheme]
const currentTheme = ref('christmas')
const isDev = process.env.NODE_ENV === 'development'
</script>
```

### ThemeSelector 组件

```vue
<template>
  <div class="theme-controls">
    <ThemeSelector
      v-model:value="selectedTheme"
      :themes="availableThemes"
      placeholder="选择主题"
      size="medium"
      :filterable="true"
      :clearable="true"
      @change="onThemeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeSelector } from '@ldesign/theme/vue'

const availableThemes = ['christmas', 'spring-festival', 'halloween']
const selectedTheme = ref('christmas')

const onThemeChange = (theme: string) => {
  console.log(`主题已切换到: ${theme}`)
}
</script>
```

### ThemeButton 组件

```vue
<template>
  <div class="button-group">
    <!-- 基础按钮 -->
    <ThemeButton type="primary" size="large"> 基础按钮 </ThemeButton>

    <!-- 带装饰的按钮 -->
    <ThemeButton type="success" decoration="snowflake" @click="handleClick"> 雪花按钮 </ThemeButton>

    <!-- 带动画的按钮 -->
    <ThemeButton type="warning" animation="sparkle" :loading="isLoading"> 闪烁按钮 </ThemeButton>

    <!-- 圆形按钮 -->
    <ThemeButton type="danger" :circle="true" icon="🎄" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ThemeButton } from '@ldesign/theme/vue'

const isLoading = ref(false)

const handleClick = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
}
</script>
```

## Vue 指令使用

### v-theme-decoration 指令

```vue
<template>
  <div class="page">
    <!-- 基础装饰 -->
    <div v-theme-decoration="{ decoration: 'snowflake', visible: true }">内容区域</div>

    <!-- 悬停显示装饰 -->
    <div v-theme-decoration.hover="{ decoration: 'lantern' }">悬停显示灯笼</div>

    <!-- 点击切换装饰 -->
    <div v-theme-decoration.click="{ decoration: 'firework' }">点击显示烟花</div>

    <!-- 延迟显示装饰 -->
    <div v-theme-decoration.delay:2000="{ decoration: 'star' }">2秒后显示星星</div>

    <!-- 只显示一次 -->
    <div v-theme-decoration.once.hover="{ decoration: 'gift' }">首次悬停显示礼物</div>
  </div>
</template>
```

### v-theme-animation 指令

```vue
<template>
  <div class="animated-elements">
    <!-- 基础动画 -->
    <div v-theme-animation="{ animation: 'glow', autoplay: true }">自动发光</div>

    <!-- 悬停触发动画 -->
    <div v-theme-animation="{ animation: 'sparkle', trigger: 'hover' }">悬停闪烁</div>

    <!-- 点击触发动画 -->
    <div v-theme-animation="{ animation: 'bounce', trigger: 'click' }">点击弹跳</div>

    <!-- 进入视口触发动画 -->
    <div v-theme-animation="{ animation: 'fadeIn', trigger: 'visible' }">滚动到此处时淡入</div>

    <!-- 循环动画 -->
    <div v-theme-animation.loop="{ animation: 'rotate' }">循环旋转</div>

    <!-- 慢速动画 -->
    <div v-theme-animation.slow="{ animation: 'pulse' }">慢速脉冲</div>

    <!-- 反向动画 -->
    <div v-theme-animation.reverse="{ animation: 'slide' }">反向滑动</div>

    <!-- 延迟动画 -->
    <div v-theme-animation.delay:1000="{ animation: 'zoom' }">1秒后缩放</div>
  </div>
</template>
```

## 组合式函数使用

### useTheme

```vue
<script setup lang="ts">
import { useTheme } from '@ldesign/theme/vue'

const {
  currentTheme, // 当前主题
  availableThemes, // 可用主题列表
  isLoading, // 加载状态
  error, // 错误信息
  setTheme, // 设置主题
  getTheme, // 获取主题配置
  addTheme, // 添加主题
  removeTheme, // 移除主题
  on, // 监听事件
  off, // 移除监听
} = useTheme()

// 切换主题
const switchTheme = async (themeName: string) => {
  try {
    await setTheme(themeName)
    console.log('主题切换成功')
  } catch (err) {
    console.error('主题切换失败:', err)
  }
}

// 监听主题变化
on('theme-changed', event => {
  console.log('主题已变化:', event.theme)
})
</script>
```

### useThemeDecorations

```vue
<script setup lang="ts">
import { useThemeDecorations } from '@ldesign/theme/vue'

const {
  decorations, // 装饰列表
  addDecoration, // 添加装饰
  removeDecoration, // 移除装饰
  updateDecoration, // 更新装饰
  clearDecorations, // 清空装饰
  isDecorationVisible, // 检查装饰是否可见
  getDecoration, // 获取装饰
} = useThemeDecorations()

// 添加雪花装饰
const addSnowflake = () => {
  addDecoration({
    id: 'my-snowflake',
    name: '我的雪花',
    type: 'svg',
    src: '/snowflake.svg',
    position: {
      type: 'fixed',
      position: { x: '50%', y: '20%' },
      anchor: 'top-center',
    },
    style: {
      size: { width: '40px', height: '40px' },
      opacity: 0.9,
      zIndex: 1000,
    },
    animation: 'snowfall',
    interactive: true,
    responsive: true,
  })
}

// 移除装饰
const removeSnowflake = () => {
  removeDecoration('my-snowflake')
}
</script>
```

### useThemeAnimations

```vue
<script setup lang="ts">
import { useThemeAnimations } from '@ldesign/theme/vue'

const {
  animations, // 动画列表
  startAnimation, // 开始动画
  stopAnimation, // 停止动画
  pauseAnimation, // 暂停动画
  resumeAnimation, // 恢复动画
  isAnimationRunning, // 检查动画是否运行
  getAnimation, // 获取动画
} = useThemeAnimations()

// 控制雪花动画
const controlSnowfall = () => {
  if (isAnimationRunning('snowfall').value) {
    stopAnimation('snowfall')
  } else {
    startAnimation('snowfall')
  }
}
</script>
```

## 自定义主题

### 创建自定义主题

```typescript
import { createCustomTheme } from '@ldesign/theme'

const myTheme = createCustomTheme('my-theme', '我的主题', {
  description: '自定义主题描述',
  category: 'custom',
  version: '1.0.0',
  author: '我的名字',

  colors: {
    name: 'my-colors',
    displayName: '我的配色',
    light: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      accent: '#45b7d1',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#2c3e50',
      textSecondary: '#7f8c8d',
      border: '#bdc3c7',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c',
      info: '#3498db',
    },
    dark: {
      primary: '#ff8e8e',
      secondary: '#6ee7dd',
      accent: '#6bb6ff',
      background: '#2c3e50',
      surface: '#34495e',
      text: '#ecf0f1',
      textSecondary: '#bdc3c7',
      border: '#7f8c8d',
      success: '#58d68d',
      warning: '#f7dc6f',
      error: '#ec7063',
      info: '#5dade2',
    },
  },

  decorations: [
    {
      id: 'my-decoration',
      name: '我的装饰',
      type: 'icon',
      src: '/my-icon.svg',
      position: {
        type: 'fixed',
        position: { x: '10px', y: '10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '30px', height: '30px' },
        opacity: 1,
        zIndex: 1000,
      },
      interactive: false,
      responsive: true,
    },
  ],

  animations: [
    {
      name: 'my-animation',
      type: 'css',
      duration: 2000,
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: { transform: 'scale(1)', opacity: 1 },
        },
        {
          offset: 0.5,
          properties: { transform: 'scale(1.2)', opacity: 0.8 },
        },
        {
          offset: 1,
          properties: { transform: 'scale(1)', opacity: 1 },
        },
      ],
    },
  ],

  resources: {
    images: {
      'my-image': '/my-image.png',
    },
    icons: {
      'my-icon': '/my-icon.svg',
    },
  },

  tags: ['custom', 'colorful'],
})

// 添加到主题管理器
themeManager.addTheme(myTheme)
```

### 自定义装饰元素

```typescript
import { BaseDecoration } from '@ldesign/theme/decorations'
import type { DecorationConfig } from '@ldesign/theme'

class MyCustomDecoration extends BaseDecoration {
  constructor(config: DecorationConfig, container: HTMLElement) {
    super(config, container)
  }

  protected async updateContent(): Promise<void> {
    // 自定义内容更新逻辑
    this.element.innerHTML = `
      <div class="my-decoration">
        <span>自定义装饰</span>
      </div>
    `

    // 添加自定义样式
    this.element.style.cssText += `
      background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    `
  }

  protected onInteract(type: string, event: Event): void {
    super.onInteract(type, event)

    if (type === 'click') {
      // 自定义点击处理
      this.element.style.transform += ' scale(1.2)'
      setTimeout(() => {
        this.element.style.transform = this.element.style.transform.replace(' scale(1.2)', '')
      }, 200)
    }
  }
}

// 注册自定义装饰类型
import { DecorationFactory } from '@ldesign/theme/decorations'
DecorationFactory.register('my-custom', MyCustomDecoration)
```

### 自定义动画

```typescript
import { BaseAnimation } from '@ldesign/theme/animations'
import type { AnimationConfig } from '@ldesign/theme'

class MyCustomAnimation extends BaseAnimation {
  constructor(config: AnimationConfig) {
    super(config)
  }

  protected createAnimation(): void {
    // 自定义动画创建逻辑
    this.elements.forEach(element => {
      const keyframes = [
        { transform: 'rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'rotate(180deg) scale(1.5)', opacity: 0.5 },
        { transform: 'rotate(360deg) scale(1)', opacity: 1 },
      ]

      const options = {
        duration: this.config.duration || 2000,
        iterations: this.config.iterations || 1,
        easing: 'ease-in-out',
      }

      const animation = element.animate(keyframes, options)

      animation.addEventListener('finish', () => {
        if (this.config.iterations === 'infinite') {
          // 无限循环时重新开始
          this.createAnimation()
        }
      })
    })
  }
}

// 注册自定义动画类型
import { AnimationFactory } from '@ldesign/theme/animations'
AnimationFactory.register('my-custom', MyCustomAnimation)
```

## 性能优化

### 1. 资源预加载

```typescript
// 预加载主题资源
const { preloadTheme, preloadAllThemes } = useThemePreload()

// 预加载单个主题
await preloadTheme('christmas')

// 预加载所有主题
await preloadAllThemes()

// 在应用启动时预加载
onMounted(async () => {
  await preloadAllThemes()
})
```

### 2. 性能监控

```typescript
import { useAnimationPerformance } from '@ldesign/theme/vue'

const {
  fps, // 当前 FPS
  frameTime, // 帧时间
  isPerformanceGood, // 性能是否良好
  startMonitoring, // 开始监控
  stopMonitoring, // 停止监控
} = useAnimationPerformance()

// 开始性能监控
onMounted(() => {
  startMonitoring()
})

// 根据性能调整
watch(isPerformanceGood, good => {
  if (!good) {
    // 性能不佳时减少装饰数量
    const decorations = themeManager.getDecorations()
    decorations.slice(10).forEach(decoration => {
      themeManager.removeDecoration(decoration.id)
    })
  }
})
```

### 3. 响应式优化

```typescript
// 根据屏幕尺寸调整装饰数量
const getDecorationCount = () => {
  const width = window.innerWidth
  if (width < 768) return 5 // 移动设备
  if (width < 1024) return 10 // 平板设备
  return 20 // 桌面设备
}

// 创建响应式雪花效果
const createResponsiveSnowfall = () => {
  const count = getDecorationCount()
  return createSnowfallEffect(document.body, {
    count,
    intensity: width < 768 ? 'light' : 'medium',
  })
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
  // 重新创建装饰效果
  themeManager.clearDecorations()
  createResponsiveSnowfall()
})
```

## 最佳实践

### 1. 主题命名规范

```typescript
// ✅ 好的命名
'christmas' // 节日主题
'spring-festival' // 节日主题
'corporate-blue' // 企业主题
'dark-mode' // 模式主题

// ❌ 避免的命名
'theme1' // 无意义
'red-theme' // 过于简单
'style-a' // 不清晰
```

### 2. 错误处理

```typescript
try {
  await themeManager.setTheme('new-theme')
} catch (error) {
  console.error('主题切换失败:', error)

  // 回退到默认主题
  try {
    await themeManager.setTheme('default')
  } catch (fallbackError) {
    console.error('回退主题也失败了:', fallbackError)
  }
}
```

### 3. 内存管理

```typescript
// 组件销毁时清理资源
onUnmounted(() => {
  // 清理装饰元素
  themeManager.clearDecorations()

  // 停止所有动画
  themeManager.stopAllAnimations()

  // 移除事件监听器
  themeManager.off('theme-changed', handleThemeChange)
})
```

### 4. 用户体验优化

```typescript
// 检测用户偏好
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (prefersReducedMotion) {
  // 禁用动画
  themeManager.disableAnimations()
}

// 检测设备性能
const isLowEndDevice = navigator.hardwareConcurrency <= 2

if (isLowEndDevice) {
  // 减少装饰数量
  const reducedConfig = {
    ...themeConfig,
    decorations: themeConfig.decorations.slice(0, 5),
  }
}
```

## 故障排除

### 常见问题

1. **主题切换失败**

   - 检查主题是否已正确注册
   - 确认主题资源文件是否存在
   - 查看控制台错误信息

2. **装饰元素不显示**

   - 检查容器元素是否存在
   - 确认装饰配置是否正确
   - 检查 CSS 样式是否被覆盖

3. **动画性能问题**

   - 减少同时运行的动画数量
   - 启用 GPU 加速
   - 使用性能监控工具

4. **内存泄漏**
   - 确保在组件销毁时清理资源
   - 移除事件监听器
   - 停止不需要的动画

### 调试技巧

```typescript
// 启用调试模式
const themeManager = createThemeManager({
  themes: [christmasTheme],
  debug: true, // 启用调试日志
})

// 监听所有事件
themeManager.on('*', event => {
  console.log('主题事件:', event)
})

// 检查当前状态
console.log('当前主题:', themeManager.getCurrentTheme())
console.log('装饰列表:', themeManager.getDecorations())
console.log('性能指标:', themeManager.getPerformanceMetrics())
```

## 总结

LDesign Theme 提供了完整的主题系统解决方案，通过合理使用其提供的 API 和组件，可以轻松为应用添加丰富
的视觉效果和节日氛围。记住以下要点：

1. **合理使用资源** - 根据设备性能调整装饰数量和动画复杂度
2. **注意内存管理** - 及时清理不需要的资源和事件监听器
3. **优化用户体验** - 考虑用户偏好和设备限制
4. **遵循最佳实践** - 使用规范的命名和错误处理

希望这份指南能帮助你更好地使用 LDesign Theme！如有问题，请查看文档或提交 issue。
