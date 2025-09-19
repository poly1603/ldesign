<!--
  主应用组件
  
  提供应用的整体布局和导航
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div id="app" class="config-editor-app">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <h1>LDesign 配置编辑器</h1>
        </div>
        <nav class="nav-menu">
          <router-link v-for="route in navRoutes" :key="route.path" :to="route.path" class="nav-item"
            :class="{ active: $route.path === route.path }">
            {{ route.name }}
          </router-link>
        </nav>
        <div class="header-actions">
          <button class="btn btn-primary" @click="saveAllConfigs" :disabled="!hasChanges">
            保存所有
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="app-main">
      <div class="main-content">
        <!-- 侧边栏 -->
        <aside class="sidebar">
          <div class="sidebar-content">
            <div class="config-files">
              <h3>配置文件</h3>
              <div class="file-list">
                <div v-for="file in configFiles" :key="file.type" class="file-item" :class="{
                  active: currentFileType === file.type,
                  modified: file.modified,
                  error: file.hasError
                }" @click="selectFile(file.type)">
                  <div class="file-icon">
                    <span :class="file.icon"></span>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-status">
                      <span v-if="file.modified" class="status-modified">已修改</span>
                      <span v-if="file.hasError" class="status-error">有错误</span>
                      <span v-if="!file.exists" class="status-missing">不存在</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 编辑器区域 -->
        <section class="editor-area">
          <div class="editor-header">
            <h2>{{ currentFileName }}</h2>
            <div class="editor-actions">
              <button class="btn btn-secondary" @click="resetConfig" :disabled="!hasChanges">
                重置
              </button>
              <button class="btn btn-primary" @click="saveCurrentConfig" :disabled="!hasChanges">
                保存
              </button>
            </div>
          </div>

          <div class="editor-content">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </section>
      </div>
    </main>

    <!-- 状态栏 -->
    <footer class="app-footer">
      <div class="footer-content">
        <div class="status-info">
          <span class="status-item">
            工作目录: {{ workingDirectory }}
          </span>
          <span class="status-item" v-if="lastSaved">
            最后保存: {{ formatTime(lastSaved) }}
          </span>
        </div>
        <div class="footer-actions">
          <span class="version">v{{ version }}</span>
        </div>
      </div>
    </footer>

    <!-- 全局加载指示器 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <div class="loading-text">{{ loadingText }}</div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay" @click="clearError">
      <div class="error-message">
        <h3>错误</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="clearError">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useConfigStore } from './stores/config'

const VERSION = '1.0.0'

// 路由相关
const router = useRouter()
const route = useRoute()

// 状态管理
const configStore = useConfigStore()

// 响应式数据
const loading = ref(false)
const loadingText = ref('加载中...')
const error = ref('')
const lastSaved = ref<Date | null>(null)

// 导航路由配置
const navRoutes = [
  { path: '/launcher', name: 'Launcher 配置' },
  { path: '/app', name: 'App 配置' },
  { path: '/package', name: 'Package.json' }
]

// 配置文件信息
const configFiles = computed(() => [
  {
    type: 'launcher',
    name: 'launcher.config.ts',
    icon: 'icon-launcher',
    exists: configStore.launcherConfig !== null,
    modified: configStore.isLauncherModified,
    hasError: configStore.launcherError !== null
  },
  {
    type: 'app',
    name: 'app.config.ts',
    icon: 'icon-app',
    exists: configStore.appConfig !== null,
    modified: configStore.isAppModified,
    hasError: configStore.appError !== null
  },
  {
    type: 'package',
    name: 'package.json',
    icon: 'icon-package',
    exists: configStore.packageConfig !== null,
    modified: configStore.isPackageModified,
    hasError: configStore.packageError !== null
  }
])

// 计算属性
const currentFileType = computed(() => {
  const path = route.path
  if (path.includes('launcher')) return 'launcher'
  if (path.includes('app')) return 'app'
  if (path.includes('package')) return 'package'
  return 'launcher'
})

const currentFileName = computed(() => {
  const file = configFiles.value.find(f => f.type === currentFileType.value)
  return file?.name || ''
})

const hasChanges = computed(() => {
  return configStore.isLauncherModified ||
    configStore.isAppModified ||
    configStore.isPackageModified
})

const workingDirectory = computed(() => configStore.workingDirectory)
const version = VERSION

// 方法
const selectFile = (fileType: string) => {
  router.push(`/${fileType}`)
}

const saveCurrentConfig = async () => {
  loading.value = true
  loadingText.value = '保存配置中...'

  try {
    await configStore.saveConfig(currentFileType.value as any)
    lastSaved.value = new Date()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    loading.value = false
  }
}

const saveAllConfigs = async () => {
  loading.value = true
  loadingText.value = '保存所有配置中...'

  try {
    await configStore.saveAllConfigs()
    lastSaved.value = new Date()
  } catch (err) {
    error.value = err instanceof Error ? err.message : '保存失败'
  } finally {
    loading.value = false
  }
}

const resetConfig = () => {
  if (confirm('确定要重置当前配置吗？未保存的更改将丢失。')) {
    configStore.resetConfig(currentFileType.value as any)
  }
}

const clearError = () => {
  error.value = ''
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString()
}

// 生命周期
onMounted(async () => {
  loading.value = true
  loadingText.value = '初始化配置编辑器...'

  try {
    await configStore.initialize()

    // 如果当前路径是根路径，重定向到 launcher 配置
    if (route.path === '/') {
      router.push('/launcher')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '初始化失败'
  } finally {
    loading.value = false
  }
})
</script>

<style lang="less" scoped>
.config-editor-app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--ldesign-bg-color-page);
  color: var(--ldesign-text-color-primary);
}

.app-header {
  height: 60px;
  background-color: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);

  .header-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;

    .logo h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--ldesign-brand-color);
    }

    .nav-menu {
      display: flex;
      gap: 24px;

      .nav-item {
        padding: 8px 16px;
        border-radius: var(--ls-border-radius-base);
        text-decoration: none;
        color: var(--ldesign-text-color-secondary);
        transition: all 0.2s ease;

        &:hover {
          background-color: var(--ldesign-bg-color-component-hover);
          color: var(--ldesign-text-color-primary);
        }

        &.active {
          background-color: var(--ldesign-brand-color-focus);
          color: var(--ldesign-brand-color);
        }
      }
    }
  }
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;

  .main-content {
    width: 100%;
    display: flex;
  }
}

.sidebar {
  width: 280px;
  background-color: var(--ldesign-bg-color-container);
  border-right: 1px solid var(--ldesign-border-color);

  .sidebar-content {
    padding: 24px;

    .config-files h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 8px;

      &:hover {
        background-color: var(--ldesign-bg-color-component-hover);
      }

      &.active {
        background-color: var(--ldesign-brand-color-focus);
        border: 1px solid var(--ldesign-brand-color);
      }

      &.modified {
        border-left: 3px solid var(--ldesign-warning-color);
      }

      &.error {
        border-left: 3px solid var(--ldesign-error-color);
      }

      .file-icon {
        margin-right: 12px;
        font-size: 20px;
      }

      .file-info {
        flex: 1;

        .file-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .file-status {
          font-size: 12px;

          .status-modified {
            color: var(--ldesign-warning-color);
          }

          .status-error {
            color: var(--ldesign-error-color);
          }

          .status-missing {
            color: var(--ldesign-text-color-placeholder);
          }
        }
      }
    }
  }
}

.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;

  .editor-header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    background-color: var(--ldesign-bg-color-container);
    border-bottom: 1px solid var(--ldesign-border-color);

    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .editor-actions {
      display: flex;
      gap: 12px;
    }
  }

  .editor-content {
    flex: 1;
    overflow: auto;
    padding: 24px;
  }
}

.app-footer {
  height: 40px;
  background-color: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);

  .footer-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    font-size: 12px;
    color: var(--ldesign-text-color-secondary);

    .status-info {
      display: flex;
      gap: 24px;
    }

    .version {
      font-weight: 500;
    }
  }
}

// 按钮样式
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: var(--ls-border-radius-base);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.btn-primary {
    background-color: var(--ldesign-brand-color);
    color: white;

    &:hover:not(:disabled) {
      background-color: var(--ldesign-brand-color-hover);
    }
  }

  &.btn-secondary {
    background-color: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    border: 1px solid var(--ldesign-border-color);

    &:hover:not(:disabled) {
      background-color: var(--ldesign-bg-color-component-hover);
    }
  }
}

// 加载和错误覆盖层
.loading-overlay,
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  background-color: var(--ldesign-bg-color-container);
  padding: 32px;
  border-radius: var(--ls-border-radius-lg);
  text-align: center;

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--ldesign-border-color);
    border-top: 3px solid var(--ldesign-brand-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
  }
}

.error-message {
  background-color: var(--ldesign-bg-color-container);
  padding: 32px;
  border-radius: var(--ls-border-radius-lg);
  max-width: 400px;
  text-align: center;

  h3 {
    margin: 0 0 16px 0;
    color: var(--ldesign-error-color);
  }

  p {
    margin: 0 0 24px 0;
    color: var(--ldesign-text-color-secondary);
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
