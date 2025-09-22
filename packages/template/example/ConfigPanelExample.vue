<template>
  <div class="config-panel-example">
    <!-- 示例页面头部 -->
    <header class="example-header">
      <h1 class="example-title">🎨 模板配置面板示例</h1>
      <p class="example-description">
        这个示例展示了如何在模板中集成配置面板，实现模板选择、主题切换、语言切换等功能。
      </p>
    </header>

    <!-- 当前配置状态显示 -->
    <div class="config-status">
      <div class="status-card">
        <h3>当前配置状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">当前模板:</span>
            <span class="status-value">{{ currentTemplate }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">主题色:</span>
            <span class="status-value" :style="{ color: currentThemeColor }">
              {{ selectedThemeColor }}
            </span>
          </div>
          <div class="status-item">
            <span class="status-label">显示模式:</span>
            <span class="status-value">{{ selectedThemeMode }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">当前语言:</span>
            <span class="status-value">{{ currentLanguage }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板预览区域 -->
    <div class="template-preview">
      <div class="preview-header">
        <h3>模板预览</h3>
        <button 
          class="toggle-config-btn" 
          @click="toggleConfigPanel"
          :class="{ active: showConfigPanel }"
        >
          {{ showConfigPanel ? '隐藏配置面板' : '显示配置面板' }}
        </button>
      </div>
      
      <div class="preview-content" :class="{ 'dark-mode': isDarkMode }">
        <!-- 这里可以放置实际的模板内容 -->
        <div class="mock-template-content">
          <div class="mock-header">
            <div class="mock-logo">📋</div>
            <div class="mock-nav">
              <span class="nav-item">首页</span>
              <span class="nav-item">产品</span>
              <span class="nav-item">关于</span>
            </div>
            <div class="mock-user">用户</div>
          </div>
          
          <div class="mock-body">
            <div class="mock-sidebar">
              <div class="sidebar-item">菜单1</div>
              <div class="sidebar-item">菜单2</div>
              <div class="sidebar-item">菜单3</div>
            </div>
            
            <div class="mock-main">
              <h2>欢迎使用模板配置面板</h2>
              <p>点击右上角的设置按钮来打开配置面板，体验各种配置选项。</p>
              
              <div class="feature-cards">
                <div class="feature-card">
                  <div class="feature-icon">🎨</div>
                  <h4>主题定制</h4>
                  <p>选择你喜欢的主题色彩</p>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">🌙</div>
                  <h4>暗黑模式</h4>
                  <p>切换浅色和深色主题</p>
                </div>
                
                <div class="feature-card">
                  <div class="feature-icon">🌍</div>
                  <h4>多语言</h4>
                  <p>支持多种语言切换</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 配置面板 -->
    <TemplateConfigPanel
      v-model:visible="showConfigPanel"
      :current-template="currentTemplate"
      :template-category="templateCategory"
      :device-type="deviceType"
      @template-select="handleTemplateSelect"
      @theme-change="handleThemeChange"
      @language-change="handleLanguageChange"
      @dark-mode-change="handleDarkModeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { DeviceType } from '../src/types/template'
import { TemplateConfigPanel } from '../src/components'

// 响应式状态
const showConfigPanel = ref(false)
const currentTemplate = ref('dashboard-desktop-default')
const templateCategory = ref('dashboard')
const deviceType = ref<DeviceType>('desktop')
const selectedThemeColor = ref('purple')
const selectedThemeMode = ref<'light' | 'dark' | 'auto'>('light')
const currentLanguage = ref('zh-CN')
const isDarkMode = ref(false)

// 计算属性
const currentThemeColor = computed(() => {
  const colorMap: Record<string, string> = {
    purple: '#722ED1',
    blue: '#1890ff',
    green: '#52c41a',
    red: '#f5222d',
    orange: '#fa8c16',
    cyan: '#13c2c2',
  }
  return colorMap[selectedThemeColor.value] || '#722ED1'
})

// 方法
const toggleConfigPanel = () => {
  showConfigPanel.value = !showConfigPanel.value
}

const handleTemplateSelect = (templateName: string) => {
  currentTemplate.value = templateName
  console.log('模板已切换:', templateName)
  
  // 这里可以添加实际的模板切换逻辑
  // 例如：动态加载新模板组件
}

const handleThemeChange = (theme: string) => {
  selectedThemeColor.value = theme
  console.log('主题色已更改:', theme)
  
  // 应用主题色到页面
  document.documentElement.style.setProperty('--current-theme-color', currentThemeColor.value)
}

const handleLanguageChange = (language: string) => {
  currentLanguage.value = language
  console.log('语言已切换:', language)
  
  // 这里可以添加实际的语言切换逻辑
  // 例如：更新 i18n 实例的 locale
}

const handleDarkModeChange = (darkMode: boolean) => {
  isDarkMode.value = darkMode
  selectedThemeMode.value = darkMode ? 'dark' : 'light'
  console.log('暗黑模式已切换:', darkMode)
  
  // 应用暗黑模式
  document.documentElement.classList.toggle('dark-theme', darkMode)
}

// 生命周期
onMounted(() => {
  // 初始化主题色
  document.documentElement.style.setProperty('--current-theme-color', currentThemeColor.value)
  
  // 检测设备类型
  const updateDeviceType = () => {
    const width = window.innerWidth
    if (width < 768) {
      deviceType.value = 'mobile'
    } else if (width < 1024) {
      deviceType.value = 'tablet'
    } else {
      deviceType.value = 'desktop'
    }
  }
  
  updateDeviceType()
  window.addEventListener('resize', updateDeviceType)
  
  // 清理事件监听器
  return () => {
    window.removeEventListener('resize', updateDeviceType)
  }
})
</script>

<style lang="less" scoped>
.config-panel-example {
  min-height: 100vh;
  background: var(--ldesign-bg-color-page);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.example-header {
  padding: var(--ls-padding-xl);
  text-align: center;
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);

  .example-title {
    font-size: var(--ls-font-size-h2);
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-base);
  }

  .example-description {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.config-status {
  padding: var(--ls-padding-lg);

  .status-card {
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-lg);
    padding: var(--ls-padding-lg);
    box-shadow: var(--ldesign-shadow-1);

    h3 {
      margin-bottom: var(--ls-margin-base);
      color: var(--ldesign-text-color-primary);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--ls-spacing-base);

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--ls-padding-sm);
        background: var(--ldesign-bg-color-component);
        border-radius: var(--ls-border-radius-base);

        .status-label {
          font-weight: 500;
          color: var(--ldesign-text-color-secondary);
        }

        .status-value {
          font-weight: 600;
          color: var(--ldesign-text-color-primary);
        }
      }
    }
  }
}

.template-preview {
  padding: var(--ls-padding-lg);

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ls-margin-base);

    h3 {
      color: var(--ldesign-text-color-primary);
    }

    .toggle-config-btn {
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      border: 1px solid var(--ldesign-border-level-2-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--ldesign-brand-color);
        background: var(--ldesign-bg-color-component-hover);
      }

      &.active {
        background: var(--ldesign-brand-color);
        border-color: var(--ldesign-brand-color);
        color: var(--ldesign-font-white-1);
      }
    }
  }

  .preview-content {
    background: var(--ldesign-bg-color-container);
    border-radius: var(--ls-border-radius-lg);
    overflow: hidden;
    box-shadow: var(--ldesign-shadow-2);
    transition: all 0.3s ease;

    &.dark-mode {
      background: var(--ldesign-gray-color-9);
      color: var(--ldesign-font-white-1);

      .mock-header,
      .mock-sidebar {
        background: var(--ldesign-gray-color-8);
        border-color: var(--ldesign-gray-color-7);
      }

      .mock-main {
        background: var(--ldesign-gray-color-9);
      }

      .feature-card {
        background: var(--ldesign-gray-color-8);
        border-color: var(--ldesign-gray-color-7);
      }
    }
  }
}

.mock-template-content {
  .mock-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-level-1-color);

    .mock-logo {
      font-size: 24px;
    }

    .mock-nav {
      display: flex;
      gap: var(--ls-spacing-lg);

      .nav-item {
        color: var(--ldesign-text-color-secondary);
        cursor: pointer;
        transition: color 0.2s ease;

        &:hover {
          color: var(--current-theme-color, var(--ldesign-brand-color));
        }
      }
    }

    .mock-user {
      color: var(--ldesign-text-color-primary);
    }
  }

  .mock-body {
    display: flex;
    min-height: 400px;

    .mock-sidebar {
      width: 200px;
      background: var(--ldesign-bg-color-component);
      border-right: 1px solid var(--ldesign-border-level-1-color);
      padding: var(--ls-padding-base);

      .sidebar-item {
        padding: var(--ls-padding-sm);
        margin-bottom: var(--ls-margin-xs);
        border-radius: var(--ls-border-radius-sm);
        cursor: pointer;
        transition: background-color 0.2s ease;

        &:hover {
          background: var(--ldesign-bg-color-component-hover);
        }
      }
    }

    .mock-main {
      flex: 1;
      padding: var(--ls-padding-lg);

      h2 {
        color: var(--current-theme-color, var(--ldesign-brand-color));
        margin-bottom: var(--ls-margin-base);
      }

      p {
        color: var(--ldesign-text-color-secondary);
        margin-bottom: var(--ls-margin-lg);
        line-height: 1.6;
      }

      .feature-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--ls-spacing-base);

        .feature-card {
          padding: var(--ls-padding-base);
          background: var(--ldesign-bg-color-component);
          border: 1px solid var(--ldesign-border-level-1-color);
          border-radius: var(--ls-border-radius-base);
          text-align: center;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--current-theme-color, var(--ldesign-brand-color));
            box-shadow: var(--ldesign-shadow-1);
          }

          .feature-icon {
            font-size: 32px;
            margin-bottom: var(--ls-margin-sm);
          }

          h4 {
            color: var(--ldesign-text-color-primary);
            margin-bottom: var(--ls-margin-xs);
          }

          p {
            color: var(--ldesign-text-color-secondary);
            font-size: var(--ls-font-size-sm);
            margin: 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .config-status .status-grid {
    grid-template-columns: 1fr;
  }

  .mock-body {
    flex-direction: column;

    .mock-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
    }
  }

  .feature-cards {
    grid-template-columns: 1fr !important;
  }
}
</style>
