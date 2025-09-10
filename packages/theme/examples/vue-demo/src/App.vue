<!--
  LDesign 节日主题包 Vue 3 演示应用
  展示主题切换、颜色变化和挂件系统的完整功能
-->

<template>
  <div class="app" :class="`theme-${currentTheme}`">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">🎨</div>
          <div class="title-group">
            <h1>LDesign 节日主题包</h1>
            <p>Vue 3 演示项目</p>
          </div>
        </div>
        
        <!-- 主题状态显示 -->
        <div class="theme-status">
          <span class="status-label">当前主题:</span>
          <span class="status-value">{{ themeDisplayName }}</span>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <!-- 主题选择器区域 -->
      <section class="theme-section">
        <h2>🎭 选择节日主题</h2>
        <p class="section-desc">点击下方按钮切换主题，观察颜色和挂件的变化</p>
        
        <div class="theme-selector">
          <button
            v-for="theme in availableThemes"
            :key="theme.id"
            :class="['theme-btn', { active: currentTheme === theme.id }]"
            @click="switchTheme(theme.id)"
          >
            <span class="theme-icon">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </section>

      <!-- 功能演示区域 -->
      <section class="demo-section">
        <div class="demo-grid">
          <!-- 按钮挂件演示 -->
          <div class="demo-card" ref="buttonDemoRef">
            <h3>🎯 按钮挂件</h3>
            <p>按钮会根据主题显示不同的装饰效果</p>
            <div class="button-group">
              <div class="widget-container" ref="primaryBtnRef">
                <button class="demo-button primary">
                  主要按钮
                </button>
                <div v-if="primaryButtonWidget" class="widget-decoration" :class="primaryButtonWidget.decoration">
                  {{ getWidgetIcon(primaryButtonWidget.decoration) }}
                </div>
              </div>
              <div class="widget-container" ref="secondaryBtnRef">
                <button class="demo-button secondary">
                  次要按钮
                </button>
                <div v-if="secondaryButtonWidget" class="widget-decoration" :class="secondaryButtonWidget.decoration">
                  {{ getWidgetIcon(secondaryButtonWidget.decoration) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 卡片挂件演示 -->
          <div class="demo-card card-demo widget-container" ref="cardDemoRef">
            <h3>🎪 卡片装饰</h3>
            <p>卡片边框和背景会显示主题相关的装饰元素</p>
            <div class="card-content">
              <div class="feature-item">
                <span class="feature-icon">🎄</span>
                <span>节日氛围</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">✨</span>
                <span>动画效果</span>
              </div>
            </div>
            <div v-if="cardWidget" class="widget-decoration card-widget" :class="cardWidget.decoration">
              {{ getWidgetIcon(cardWidget.decoration) }}
            </div>
          </div>

          <!-- 文本挂件演示 -->
          <div class="demo-card" ref="textDemoRef">
            <h3>📝 文本装饰</h3>
            <p>文本周围会出现主题相关的装饰元素</p>
            <div class="text-content">
              <div class="widget-container" ref="decoratedTextRef">
                <p class="decorated-text">
                  这是一段装饰文本，会根据不同主题显示相应的挂件效果
                </p>
                <div v-if="textWidget" class="widget-decoration text-widget" :class="textWidget.decoration">
                  {{ getWidgetIcon(textWidget.decoration) }}
                </div>
              </div>
            </div>
          </div>

          <!-- 背景挂件演示 -->
          <div class="demo-card background-demo widget-container" ref="backgroundDemoRef">
            <h3>🌟 背景装饰</h3>
            <p>背景会显示主题相关的装饰图案和动画</p>
            <div class="background-content">
              <div class="content-overlay">
                <span>背景装饰区域</span>
              </div>
            </div>
            <div v-if="backgroundWidget" class="widget-decoration background-widget" :class="backgroundWidget.decoration">
              {{ getWidgetIcon(backgroundWidget.decoration) }}
            </div>
          </div>
        </div>
      </section>

      <!-- 挂件状态显示 -->
      <section class="widget-status-section">
        <h2>📊 挂件状态</h2>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">活跃挂件数量:</span>
            <span class="status-value">{{ activeWidgets.length }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">主题颜色:</span>
            <span class="status-value color-preview" :style="{ backgroundColor: themeColor }">
              {{ themeColor }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">动画状态:</span>
            <span class="status-value">{{ animationStatus }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 LDesign. 节日主题包演示项目</p>
        <p>版本: 1.0.0 | 构建时间: {{ buildTime }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, nextTick, watch } from 'vue'
import type { FestivalThemeManager } from '../../../src/core/theme-manager'
import type { FestivalType, WidgetConfig } from '../../../src/core/types'
import { WidgetManager } from '../../../src/core/widget-manager'

// 注入主题管理器
const themeManager = inject<FestivalThemeManager>('themeManager')

// 响应式数据
const currentTheme = ref<FestivalType>('default')
const activeWidgets = ref<WidgetConfig[]>([])
const animationStatus = ref('就绪')
const buildTime = ref(new Date().toLocaleString())

// 挂件数据
const primaryButtonWidget = ref<WidgetConfig | null>(null)
const secondaryButtonWidget = ref<WidgetConfig | null>(null)
const cardWidget = ref<WidgetConfig | null>(null)
const textWidget = ref<WidgetConfig | null>(null)
const backgroundWidget = ref<WidgetConfig | null>(null)

// 元素引用
const buttonDemoRef = ref<HTMLElement>()
const cardDemoRef = ref<HTMLElement>()
const textDemoRef = ref<HTMLElement>()
const backgroundDemoRef = ref<HTMLElement>()
const primaryBtnRef = ref<HTMLElement>()
const secondaryBtnRef = ref<HTMLElement>()
const decoratedTextRef = ref<HTMLElement>()

// 挂件管理器
let widgetManager: WidgetManager | null = null

// 可用主题列表
const availableThemes = computed(() => [
  { id: 'default', name: '默认主题', icon: '🎨' },
  { id: 'spring-festival', name: '春节主题', icon: '🧧' },
  { id: 'christmas', name: '圣诞节主题', icon: '🎄' },
  { id: 'halloween', name: '万圣节主题', icon: '🎃' },
  { id: 'valentines-day', name: '情人节主题', icon: '💝' },
  { id: 'mid-autumn', name: '中秋节主题', icon: '🌕' }
])

// 主题显示名称
const themeDisplayName = computed(() => {
  const theme = availableThemes.value.find(t => t.id === currentTheme.value)
  return theme ? theme.name : '未知主题'
})

// 主题颜色
const themeColor = computed(() => {
  if (!themeManager) return '#722ED1'
  
  const themeConfig = themeManager.getThemeConfig(currentTheme.value)
  return themeConfig?.colors?.primary || '#722ED1'
})

/**
 * 获取挂件图标
 */
const getWidgetIcon = (decoration: string): string => {
  const iconMap: Record<string, string> = {
    'lantern': '🏮',
    'firework': '🎆',
    'snowflake': '❄️',
    'christmas-tree': '🎄',
    'pumpkin': '🎃',
    'ghost': '👻',
    'heart': '💖',
    'rose': '🌹',
    'moon': '🌙',
    'jade-rabbit': '🐰',
    'default': '✨'
  }
  return iconMap[decoration] || iconMap['default']
}

/**
 * 切换主题
 */
const switchTheme = async (themeId: FestivalType) => {
  if (!themeManager) return
  
  try {
    animationStatus.value = '切换中...'
    await themeManager.setTheme(themeId)
    currentTheme.value = themeId
    
    // 等待 DOM 更新后添加挂件
    await nextTick()
    await addThemeWidgets()
    
    animationStatus.value = '已激活'
    
    console.log(`🎨 主题已切换到: ${themeDisplayName.value}`)
  } catch (error) {
    console.error('主题切换失败:', error)
    animationStatus.value = '错误'
  }
}

/**
 * 添加主题相关的挂件
 */
const addThemeWidgets = async () => {
  // 清除现有挂件
  primaryButtonWidget.value = null
  secondaryButtonWidget.value = null
  cardWidget.value = null
  textWidget.value = null
  backgroundWidget.value = null

  // 根据当前主题设置相应的挂件
  const widgets = getThemeWidgets(currentTheme.value)

  // 将挂件分配给对应的元素
  widgets.forEach(widget => {
    switch (widget.id) {
      case 'primary-btn-widget':
        primaryButtonWidget.value = widget
        break
      case 'secondary-btn-widget':
        secondaryButtonWidget.value = widget
        break
      case 'card-widget':
        cardWidget.value = widget
        break
      case 'text-widget':
        textWidget.value = widget
        break
      case 'background-widget':
        backgroundWidget.value = widget
        break
    }
  })

  activeWidgets.value = widgets
}

/**
 * 获取主题相关的挂件配置
 */
const getThemeWidgets = (theme: FestivalType): WidgetConfig[] => {
  const baseWidgets: WidgetConfig[] = []

  switch (theme) {
    case 'spring-festival':
      baseWidgets.push(
        {
          id: 'primary-btn-widget',
          type: 'button',
          decoration: 'lantern',
          position: { x: 0, y: 0 },
          style: { width: 20, height: 20 },
          animation: { name: 'swing', duration: 3000, loop: true }
        },
        {
          id: 'secondary-btn-widget',
          type: 'button',
          decoration: 'firework',
          position: { x: 0, y: 0 },
          style: { width: 18, height: 18 },
          animation: { name: 'sparkle', duration: 2000, loop: true }
        },
        {
          id: 'card-widget',
          type: 'panel',
          decoration: 'firework',
          position: { x: 0, y: 0 },
          style: { width: 25, height: 25 },
          animation: { name: 'sparkle', duration: 2500, loop: true }
        }
      )
      break
      
    case 'christmas':
      baseWidgets.push(
        {
          id: 'primary-btn-widget',
          type: 'button',
          decoration: 'snowflake',
          position: { x: 0, y: 0 },
          style: { width: 16, height: 16 },
          animation: { name: 'float', duration: 4000, loop: true }
        },
        {
          id: 'card-widget',
          type: 'panel',
          decoration: 'christmas-tree',
          position: { x: 0, y: 0 },
          style: { width: 25, height: 25 },
          animation: { name: 'glow', duration: 2500, loop: true }
        },
        {
          id: 'text-widget',
          type: 'floating',
          decoration: 'snowflake',
          position: { x: 0, y: 0 },
          style: { width: 14, height: 14 },
          animation: { name: 'float', duration: 3500, loop: true }
        }
      )
      break
      
    case 'halloween':
      baseWidgets.push(
        {
          id: 'primary-btn-widget',
          type: 'button',
          decoration: 'pumpkin',
          position: { x: 0, y: 0 },
          style: { width: 18, height: 18 },
          animation: { name: 'pulse', duration: 1500, loop: true }
        },
        {
          id: 'secondary-btn-widget',
          type: 'button',
          decoration: 'ghost',
          position: { x: 0, y: 0 },
          style: { width: 16, height: 16 },
          animation: { name: 'float', duration: 2000, loop: true }
        },
        {
          id: 'text-widget',
          type: 'floating',
          decoration: 'ghost',
          position: { x: 0, y: 0 },
          style: { width: 20, height: 20 },
          animation: { name: 'float', duration: 3500, loop: true }
        }
      )
      break
      
    case 'valentines-day':
      baseWidgets.push(
        {
          id: 'primary-btn-widget',
          type: 'button',
          decoration: 'heart',
          position: { x: 0, y: 0 },
          style: { width: 16, height: 16 },
          animation: { name: 'pulse', duration: 1000, loop: true }
        },
        {
          id: 'card-widget',
          type: 'panel',
          decoration: 'rose',
          position: { x: 0, y: 0 },
          style: { width: 22, height: 22 },
          animation: { name: 'glow', duration: 2000, loop: true }
        },
        {
          id: 'text-widget',
          type: 'floating',
          decoration: 'heart',
          position: { x: 0, y: 0 },
          style: { width: 14, height: 14 },
          animation: { name: 'pulse', duration: 1500, loop: true }
        }
      )
      break

    case 'mid-autumn':
      baseWidgets.push(
        {
          id: 'background-widget',
          type: 'background',
          decoration: 'moon',
          position: { x: 0, y: 0 },
          style: { width: 35, height: 35 },
          animation: { name: 'glow', duration: 4000, loop: true }
        },
        {
          id: 'text-widget',
          type: 'floating',
          decoration: 'jade-rabbit',
          position: { x: 0, y: 0 },
          style: { width: 18, height: 18 },
          animation: { name: 'bounce', duration: 2500, loop: true }
        },
        {
          id: 'card-widget',
          type: 'panel',
          decoration: 'moon',
          position: { x: 0, y: 0 },
          style: { width: 28, height: 28 },
          animation: { name: 'glow', duration: 3000, loop: true }
        }
      )
      break
  }
  
  return baseWidgets
}

// 监听主题变化
watch(currentTheme, (newTheme) => {
  console.log(`🎨 主题变更为: ${newTheme}`)
})

// 组件挂载时初始化
onMounted(async () => {
  if (!themeManager) {
    console.error('主题管理器未找到')
    return
  }
  
  try {
    // 初始化主题管理器
    await themeManager.init()
    
    // 创建挂件管理器
    widgetManager = new WidgetManager({
      container: document.body,
      enableCollisionDetection: true,
      enablePerformanceMonitoring: true
    })
    
    await widgetManager.init()
    
    // 设置初始主题
    currentTheme.value = themeManager.currentTheme || 'default'
    
    // 添加初始挂件
    await addThemeWidgets()
    
    console.log('🎨 应用初始化完成')
  } catch (error) {
    console.error('应用初始化失败:', error)
  }
})
</script>

<style lang="less" scoped>
.app {
  min-height: 100vh;
  background: var(--ldesign-bg-color-page, #ffffff);
  color: var(--ldesign-text-color-primary, #000000);
  transition: all 0.3s ease;
}

/* 头部样式 */
.app-header {
  background: var(--ldesign-bg-color-container, #ffffff);
  border-bottom: 1px solid var(--ldesign-border-color, #e5e5e5);
  padding: var(--ls-padding-base, 20px);
  box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm, 12px);

    .logo {
      font-size: 2.5rem;
      animation: rotate 10s linear infinite;
    }

    .title-group {
      h1 {
        font-size: var(--ls-font-size-h2, 36px);
        color: var(--ldesign-brand-color, #722ED1);
        margin: 0;
      }

      p {
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));
        margin: 0;
      }
    }
  }

  .theme-status {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs, 6px);
    padding: var(--ls-padding-sm, 12px) var(--ls-padding-base, 20px);
    background: var(--ldesign-brand-color-focus, #f1ecf9);
    border-radius: var(--ls-border-radius-base, 6px);

    .status-label {
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));
    }

    .status-value {
      font-weight: 600;
      color: var(--ldesign-brand-color, #722ED1);
    }
  }
}

/* 主要内容样式 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-padding-xl, 36px) var(--ls-padding-base, 20px);
}

/* 主题选择器样式 */
.theme-section {
  margin-bottom: var(--ls-margin-xxl, 56px);
  text-align: center;

  h2 {
    font-size: var(--ls-font-size-h3, 32px);
    color: var(--ldesign-text-color-primary, #000000);
    margin-bottom: var(--ls-margin-sm, 12px);
  }

  .section-desc {
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));
    margin-bottom: var(--ls-margin-lg, 28px);
  }

  .theme-selector {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-base, 20px);
    justify-content: center;

    .theme-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ls-spacing-xs, 6px);
      padding: var(--ls-padding-base, 20px);
      border: 2px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-lg, 12px);
      background: var(--ldesign-bg-color-component, #ffffff);
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;

      &:hover {
        border-color: var(--ldesign-brand-color-hover, #8c5ad3);
        background: var(--ldesign-bg-color-component-hover, #f8f8f8);
        transform: translateY(-2px);
        box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      }

      &.active {
        border-color: var(--ldesign-brand-color, #722ED1);
        background: var(--ldesign-brand-color-focus, #f1ecf9);
        color: var(--ldesign-brand-color, #722ED1);
      }

      .theme-icon {
        font-size: 2rem;
      }

      .theme-name {
        font-weight: 500;
      }
    }
  }
}

/* 演示区域样式 */
.demo-section {
  margin-bottom: var(--ls-margin-xxl, 56px);

  .demo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--ls-spacing-lg, 28px);
  }

  .demo-card {
    position: relative;
    padding: var(--ls-padding-lg, 28px);
    border: 1px solid var(--ldesign-border-color, #e5e5e5);
    border-radius: var(--ls-border-radius-lg, 12px);
    background: var(--ldesign-bg-color-container, #ffffff);
    box-shadow: var(--ldesign-shadow-1, 0 1px 10px rgba(0, 0, 0, 5%));
    transition: all 0.3s ease;

    &:hover {
      box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 8%));
      transform: translateY(-2px);
    }

    h3 {
      font-size: var(--ls-font-size-lg, 20px);
      color: var(--ldesign-text-color-primary, #000000);
      margin-bottom: var(--ls-margin-sm, 12px);
    }

    p {
      color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));
      margin-bottom: var(--ls-margin-base, 20px);
    }
  }

  .button-group {
    display: flex;
    gap: var(--ls-spacing-base, 20px);

    .demo-button {
      position: relative;
      padding: var(--ls-padding-sm, 12px) var(--ls-padding-lg, 28px);
      border: none;
      border-radius: var(--ls-border-radius-base, 6px);
      font-size: var(--ls-font-size-sm, 16px);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      &.primary {
        background: var(--ldesign-brand-color, #722ED1);
        color: var(--ldesign-font-white-1, #ffffff);

        &:hover {
          background: var(--ldesign-brand-color-hover, #8c5ad3);
          transform: translateY(-1px);
        }
      }

      &.secondary {
        background: var(--ldesign-bg-color-component, #ffffff);
        color: var(--ldesign-brand-color, #722ED1);
        border: 1px solid var(--ldesign-brand-color, #722ED1);

        &:hover {
          background: var(--ldesign-brand-color-focus, #f1ecf9);
          transform: translateY(-1px);
        }
      }
    }
  }

  .card-content {
    .feature-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm, 12px);
      margin-bottom: var(--ls-margin-sm, 12px);

      .feature-icon {
        font-size: 1.2rem;
      }
    }
  }

  .text-content {
    .decorated-text {
      position: relative;
      padding: var(--ls-padding-base, 20px);
      background: var(--ldesign-bg-color-component, #ffffff);
      border-radius: var(--ls-border-radius-base, 6px);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      line-height: 1.6;
    }
  }

  .background-demo {
    .background-content {
      position: relative;
      height: 120px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-focus, #f1ecf9), var(--ldesign-brand-color-2, #d8c8ee));
      border-radius: var(--ls-border-radius-base, 6px);
      overflow: hidden;

      .content-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--ldesign-brand-color, #722ED1);
        font-weight: 600;
        text-align: center;
      }
    }
  }
}

/* 挂件容器样式 */
.widget-container {
  position: relative;
  display: inline-block;
}

/* 挂件装饰样式 */
.widget-decoration {
  position: absolute;
  font-size: 1.2rem;
  pointer-events: none;
  z-index: 10;
  animation: widget-float 3s ease-in-out infinite;

  &.lantern {
    top: -8px;
    right: -8px;
    color: #ff4d4f;
    animation: widget-swing 2s ease-in-out infinite;
  }

  &.firework {
    top: -6px;
    right: -6px;
    color: #faad14;
    animation: widget-sparkle 1.5s ease-in-out infinite;
  }

  &.snowflake {
    top: -10px;
    right: -10px;
    color: #1890ff;
    animation: widget-float 4s ease-in-out infinite;
  }

  &.christmas-tree {
    top: -8px;
    right: -8px;
    color: #52c41a;
    animation: widget-glow 2.5s ease-in-out infinite;
  }

  &.pumpkin {
    top: -8px;
    right: -8px;
    color: #fa8c16;
    animation: widget-pulse 1.5s ease-in-out infinite;
  }

  &.ghost {
    top: -10px;
    right: -10px;
    color: #f0f0f0;
    animation: widget-float 3s ease-in-out infinite;
  }

  &.heart {
    top: -6px;
    right: -6px;
    color: #eb2f96;
    animation: widget-pulse 1s ease-in-out infinite;
  }

  &.rose {
    top: -8px;
    right: -8px;
    color: #f759ab;
    animation: widget-glow 2s ease-in-out infinite;
  }

  &.moon {
    top: -10px;
    right: -10px;
    color: #fadb14;
    animation: widget-glow 4s ease-in-out infinite;
  }

  &.jade-rabbit {
    top: -8px;
    right: -8px;
    color: #d3adf7;
    animation: widget-bounce 2.5s ease-in-out infinite;
  }
}

/* 卡片挂件特殊定位 */
.card-widget {
  top: 10px;
  right: 10px;
  font-size: 1.5rem;
}

/* 文本挂件特殊定位 */
.text-widget {
  top: -5px;
  left: -15px;
  font-size: 1rem;
}

/* 背景挂件特殊定位 */
.background-widget {
  top: 15px;
  right: 15px;
  font-size: 2rem;
}

/* 挂件状态样式 */
.widget-status-section {
  margin-bottom: var(--ls-margin-xxl, 56px);

  h2 {
    font-size: var(--ls-font-size-h3, 32px);
    color: var(--ldesign-text-color-primary, #000000);
    margin-bottom: var(--ls-margin-lg, 28px);
    text-align: center;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--ls-spacing-base, 20px);

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--ls-padding-base, 20px);
      background: var(--ldesign-bg-color-container, #ffffff);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);

      .status-label {
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));
      }

      .status-value {
        font-weight: 600;
        color: var(--ldesign-brand-color, #722ED1);

        &.color-preview {
          padding: 4px 12px;
          border-radius: var(--ls-border-radius-sm, 3px);
          color: white;
          font-size: 12px;
        }
      }
    }
  }
}

/* 底部样式 */
.app-footer {
  background: var(--ldesign-bg-color-container, #ffffff);
  border-top: 1px solid var(--ldesign-border-color, #e5e5e5);
  padding: var(--ls-padding-lg, 28px) var(--ls-padding-base, 20px);
  text-align: center;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 70%));

    p {
      margin: 4px 0;
    }
  }
}

/* 动画效果 */
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 挂件动画 */
@keyframes widget-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

@keyframes widget-swing {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes widget-sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

@keyframes widget-glow {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

@keyframes widget-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes widget-bounce {
  0%, 100% { transform: translateY(0px); }
  25% { transform: translateY(-3px); }
  75% { transform: translateY(-1px); }
}

/* 主题特定样式 */
.theme-spring-festival {
  .app-header {
    background: linear-gradient(135deg, #fff1f0, #ffebe6);
  }

  .demo-card {
    border-color: #ff7875;
  }
}

.theme-christmas {
  .app-header {
    background: linear-gradient(135deg, #f6ffed, #f0f9ff);
  }

  .demo-card {
    border-color: #52c41a;
  }
}

.theme-halloween {
  .app-header {
    background: linear-gradient(135deg, #fff7e6, #fff2e8);
  }

  .demo-card {
    border-color: #fa8c16;
  }
}

.theme-valentines-day {
  .app-header {
    background: linear-gradient(135deg, #fff0f6, #fff1f0);
  }

  .demo-card {
    border-color: #eb2f96;
  }
}

.theme-mid-autumn {
  .app-header {
    background: linear-gradient(135deg, #feffe6, #fcffe6);
  }

  .demo-card {
    border-color: #fadb14;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: var(--ls-spacing-base, 20px);
  }

  .theme-selector {
    grid-template-columns: repeat(2, 1fr);
  }

  .demo-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
