<template>
  <div class="config-view">
    <div class="page-header">
      <h1>⚙️ 系统配置</h1>
      <p>查看和管理 LDesign 应用的配置信息</p>

      <!-- 实时刷新控制面板 -->
      <div class="refresh-control">
        <div class="refresh-status">
          <span class="status-indicator" :class="{ active: isAutoRefresh }"></span>
          <span class="status-text">
            {{ isAutoRefresh ? '自动刷新已启用' : '自动刷新已禁用' }}
          </span>
          <span class="last-update" v-if="lastUpdateTime">
            最后更新: {{ lastUpdateTime }}
          </span>
        </div>
        <div class="refresh-buttons">
          <button
            class="refresh-btn"
            :class="{ active: isAutoRefresh }"
            @click="toggleAutoRefresh"
          >
            {{ isAutoRefresh ? '🔄 停止自动刷新' : '▶️ 启动自动刷新' }}
          </button>
          <button class="refresh-btn manual" @click="manualRefresh">
            🔄 手动刷新
          </button>
        </div>
      </div>
    </div>

    <div class="config-sections">
      <!-- Launcher 配置 -->
      <div class="config-section">
        <LauncherConfigViewer :auto-refresh="isAutoRefresh" />
      </div>

      <!-- App 配置 -->
      <div class="config-section">
        <div class="app-config-viewer">
          <div class="config-header">
            <h3>📱 应用配置 (app.config.ts)</h3>
          </div>

          <div class="config-content">
            <div class="info-grid">
              <div class="info-item">
                <label>应用名称</label>
                <span class="value">{{ appConfig.appName }}</span>
              </div>
              <div class="info-item">
                <label>版本</label>
                <span class="value">{{ appConfig.version }}</span>
              </div>
              <div class="info-item">
                <label>描述</label>
                <span class="value">{{ appConfig.description }}</span>
              </div>
              <div class="info-item">
                <label>API 地址</label>
                <span class="value">{{ appConfig.api?.baseUrl }}</span>
              </div>
              <div class="info-item">
                <label>主题色</label>
                <span class="value">{{ appConfig.theme?.primaryColor }}</span>
              </div>
              <div class="info-item">
                <label>默认语言</label>
                <span class="value">{{ appConfig.i18n?.defaultLocale }}</span>
              </div>
            </div>

            <div class="features-section">
              <h4>功能特性</h4>
              <div class="features-grid">
                <div 
                  v-for="(enabled, feature) in appConfig.features" 
                  :key="feature"
                  class="feature-item"
                  :class="{ enabled }"
                >
                  <span class="feature-name">{{ getFeatureName(feature) }}</span>
                  <span class="feature-status">{{ enabled ? '✅' : '❌' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 环境变量 -->
      <div class="config-section">
        <div class="env-config-viewer">
          <div class="config-header">
            <h3>🌍 环境变量</h3>
          </div>

          <div class="config-content">
            <div class="env-grid">
              <div v-for="(value, key) in envVars" :key="key" class="env-item">
                <label>{{ key }}</label>
                <span class="value">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LauncherConfigViewer from '../components/LauncherConfigViewer.vue'

// 响应式数据
const appConfig = ref<any>({})
const envVars = ref<Record<string, string>>({})
const isAutoRefresh = ref(true)
const refreshInterval = ref<number | null>(null)
const lastUpdateTime = ref('')

// 计算属性
const getFeatureName = (feature: string) => {
  const names: Record<string, string> = {
    devTools: '开发工具',
    mock: 'Mock 数据',
    hotReload: '热更新',
    errorBoundary: '错误边界',
    performance: '性能监控',
    analytics: '数据分析',
    pwa: 'PWA 支持',
    offline: '离线模式'
  }
  return names[feature] || feature
}

// 方法
const loadAppConfig = async () => {
  try {
    // 尝试从 import.meta.env 获取 app 配置
    if (import.meta.env.VITE_APP_CONFIG) {
      try {
        appConfig.value = JSON.parse(import.meta.env.VITE_APP_CONFIG)
      } catch {
        // 如果解析失败，尝试从全局获取
        if (window.__APP_CONFIG__) {
          appConfig.value = window.__APP_CONFIG__
        }
      }
    } else if (window.__APP_CONFIG__) {
      appConfig.value = window.__APP_CONFIG__
    } else {
      // 如果没有全局配置，使用默认值
      appConfig.value = {
        appName: 'LDesign App',
        version: '1.0.0',
        description: 'LDesign 设计系统演示应用',
        api: {
          baseUrl: 'http://localhost:8080'
        },
        theme: {
          primaryColor: '#722ED1'
        },
        i18n: {
          defaultLocale: 'zh-CN'
        },
        features: {
          devTools: true,
          mock: true,
          hotReload: true,
          errorBoundary: false,
          performance: false,
          analytics: false,
          pwa: false,
          offline: false
        }
      }
    }

    lastUpdateTime.value = new Date().toLocaleString()
  } catch (error) {
    console.error('加载应用配置失败:', error)
  }
}

const loadEnvVars = () => {
  // 获取相关的环境变量
  const relevantEnvVars = {
    'NODE_ENV': import.meta.env.NODE_ENV,
    'MODE': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD,
    'SSR': import.meta.env.SSR,
    'BASE_URL': import.meta.env.BASE_URL,
    'VITE_LAUNCHER_ENVIRONMENT': import.meta.env.VITE_LAUNCHER_ENVIRONMENT,
    'VITE_LAUNCHER_COMMAND': import.meta.env.VITE_LAUNCHER_COMMAND,
    'VITE_LAUNCHER_TIMESTAMP': import.meta.env.VITE_LAUNCHER_TIMESTAMP
  }

  // 过滤掉 undefined 值
  envVars.value = Object.fromEntries(
    Object.entries(relevantEnvVars).filter(([_, value]) => value !== undefined)
  )
}

// 自动刷新功能
const startAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }

  refreshInterval.value = setInterval(() => {
    if (isAutoRefresh.value) {
      loadAppConfig()
      loadEnvVars()
      console.log('🔄 配置已自动刷新')
    }
  }, 3000) // 每3秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

const manualRefresh = () => {
  loadAppConfig()
  loadEnvVars()
  console.log('🔄 配置已手动刷新')
}

// 生命周期
onMounted(() => {
  loadAppConfig()
  loadEnvVars()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped lang="less">
.config-view {
  padding: var(--ls-padding-base);
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: var(--ls-margin-xl);

  h1 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-base);
    margin-bottom: var(--ls-spacing-lg);
  }
}

.refresh-control {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-base);
  margin-bottom: var(--ls-spacing-lg);

  .refresh-status {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-sm);

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--ldesign-gray-color-4);
      transition: all 0.3s ease;

      &.active {
        background: var(--ldesign-success-color);
        box-shadow: 0 0 8px rgba(66, 189, 66, 0.4);
        animation: pulse 2s infinite;
      }
    }

    .status-text {
      font-weight: 500;
      color: var(--ldesign-text-color-primary);
    }

    .last-update {
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);
      margin-left: auto;
    }
  }

  .refresh-buttons {
    display: flex;
    gap: var(--ls-spacing-sm);

    .refresh-btn {
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      border: 1px solid var(--ldesign-border-level-2-color);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-container);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: var(--ls-font-size-sm);

      &:hover {
        background: var(--ldesign-bg-color-container-hover);
        border-color: var(--ldesign-border-level-3-color);
      }

      &.active {
        background: var(--ldesign-brand-color);
        color: var(--ldesign-font-white-1);
        border-color: var(--ldesign-brand-color);
      }

      &.manual {
        background: var(--ldesign-success-color-1);
        border-color: var(--ldesign-success-color-3);
        color: var(--ldesign-success-color-7);

        &:hover {
          background: var(--ldesign-success-color-2);
          border-color: var(--ldesign-success-color-4);
        }
      }
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 8px rgba(66, 189, 66, 0.4);
  }
  50% {
    box-shadow: 0 0 16px rgba(66, 189, 66, 0.8);
  }
  100% {
    box-shadow: 0 0 8px rgba(66, 189, 66, 0.4);
  }
}

.config-sections {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xl);
}

.config-section {
  width: 100%;
}

.app-config-viewer,
.env-config-viewer {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  box-shadow: var(--ldesign-shadow-1);
  padding: var(--ls-padding-base);
}

.config-header {
  margin-bottom: var(--ls-margin-base);
  
  h3 {
    margin: 0;
    color: var(--ldesign-text-color-primary);
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-margin-base);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
  }
  
  .value {
    color: var(--ldesign-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}

.features-section {
  border-top: 1px solid var(--ldesign-border-level-1-color);
  padding-top: var(--ls-padding-base);
  
  h4 {
    margin: 0 0 var(--ls-margin-sm) 0;
    color: var(--ldesign-text-color-primary);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-sm);
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-padding-sm);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-sm);
  
  &.enabled {
    background: var(--ldesign-success-color-1);
    border-color: var(--ldesign-success-color-3);
  }
  
  .feature-name {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-primary);
  }
  
  .feature-status {
    font-size: var(--ls-font-size-sm);
  }
}

.env-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--ls-spacing-base);
}

.env-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  
  label {
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    font-weight: 500;
  }
  
  .value {
    color: var(--ldesign-text-color-primary);
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    word-break: break-all;
  }
}

@media (max-width: 768px) {
  .info-grid,
  .features-grid,
  .env-grid {
    grid-template-columns: 1fr;
  }
}
</style>
