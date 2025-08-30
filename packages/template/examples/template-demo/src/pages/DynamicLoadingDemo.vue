<template>
  <div class="dynamic-loading-demo">
    <div class="demo-header">
      <h1 class="demo-title">🚀 动态加载演示</h1>
      <p class="demo-subtitle">体验模板的动态加载和响应式切换功能</p>
    </div>

    <div class="demo-content">
      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="panel-section">
          <h3 class="section-title">模板选择</h3>
          <div class="control-group">
            <label class="control-label">分类:</label>
            <select v-model="selectedCategory" @change="handleCategoryChange" class="control-select">
              <option v-for="category in categories" :key="category" :value="category">
                {{ getCategoryDisplayName(category) }}
              </option>
            </select>
          </div>
          
          <div class="control-group">
            <label class="control-label">设备:</label>
            <div class="device-tabs" data-testid="device-tabs">
              <button
                v-for="device in deviceTypes"
                :key="device"
                class="device-tab"
                :class="{ active: currentDevice === device }"
                @click="handleDeviceChange(device)"
                :disabled="isSwitching"
              >
                {{ getDeviceDisplayName(device) }}
              </button>
            </div>
          </div>
          
          <div class="control-group">
            <label class="control-label">模板:</label>
            <div class="template-selector" data-testid="template-selector">
              <button
                v-for="template in availableTemplates"
                :key="template.name"
                class="template-option"
                :class="{ active: currentTemplate === template.name }"
                @click="handleTemplateChange(template.name)"
                :disabled="isSwitching"
                data-testid="template-option"
              >
                {{ template.displayName }}
              </button>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">状态监控</h3>
          <div class="status-grid">
            <div class="status-item">
              <div class="status-label">加载状态</div>
              <div class="status-value" :class="{ loading: isLoading }">
                {{ isLoading ? '加载中...' : '已完成' }}
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">切换状态</div>
              <div class="status-value" :class="{ switching: isSwitching }">
                {{ isSwitching ? '切换中...' : '就绪' }}
              </div>
            </div>
            <div class="status-item">
              <div class="status-label">当前设备</div>
              <div class="status-value">{{ getDeviceDisplayName(currentDevice) }}</div>
            </div>
            <div class="status-item">
              <div class="status-label">当前模板</div>
              <div class="status-value">{{ currentTemplate }}</div>
            </div>
          </div>
          
          <div v-if="switchError" class="error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text">{{ switchError }}</div>
            <button class="error-retry" @click="handleRetry">重试</button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">属性配置</h3>
          <div class="config-panel" data-testid="config-panel">
            <div class="config-group">
              <label class="config-label">标题</label>
              <input
                v-model="templateProps.title"
                type="text"
                class="config-input"
                placeholder="请输入标题"
              />
            </div>
            
            <div class="config-group">
              <label class="config-label">副标题</label>
              <input
                v-model="templateProps.subtitle"
                type="text"
                class="config-input"
                placeholder="请输入副标题"
              />
            </div>
            
            <div class="config-group">
              <label class="config-label">主题色</label>
              <input
                v-model="templateProps.primaryColor"
                type="color"
                class="config-color"
              />
            </div>
            
            <div class="config-group">
              <label class="config-checkbox">
                <input
                  v-model="templateProps.showRemember"
                  type="checkbox"
                />
                <span class="checkbox-text">显示记住我</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板渲染区域 -->
      <div class="render-area">
        <div class="render-header">
          <h3 class="render-title">模板预览</h3>
          <div class="render-info">
            <span class="info-item">{{ selectedCategory }}/{{ currentDevice }}/{{ currentTemplate }}</span>
            <span v-if="currentTemplateMetadata" class="info-item">
              v{{ currentTemplateMetadata.version }}
            </span>
          </div>
        </div>
        
        <div class="render-container">
          <div v-if="isLoading" class="render-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">正在加载模板...</div>
          </div>
          
          <div v-else-if="switchError" class="render-error">
            <div class="error-icon">❌</div>
            <div class="error-title">加载失败</div>
            <div class="error-message">{{ switchError }}</div>
            <button class="error-retry" @click="handleRetry">重试</button>
          </div>
          
          <div v-else class="render-content" data-testid="template-renderer">
            <TemplateRenderer
              :category="selectedCategory"
              :device="currentDevice"
              :template="currentTemplate"
              :props="templateProps"
              @template-loaded="handleTemplateLoaded"
              @template-error="handleTemplateError"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 性能监控 -->
    <div class="performance-panel">
      <h3 class="panel-title">性能监控</h3>
      <div class="performance-grid">
        <div class="performance-item">
          <div class="performance-label">加载时间</div>
          <div class="performance-value">{{ loadTime }}ms</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">切换时间</div>
          <div class="performance-value">{{ switchTime }}ms</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">缓存命中</div>
          <div class="performance-value">{{ cacheHitRate }}%</div>
        </div>
        <div class="performance-item">
          <div class="performance-label">内存使用</div>
          <div class="performance-value">{{ memoryUsage }}MB</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { TemplateRenderer, useTemplate, useResponsiveTemplate, useDeviceDetection } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'

// 状态管理
const selectedCategory = ref('login')
const templateProps = reactive({
  title: '动态加载演示',
  subtitle: '体验模板的动态加载功能',
  primaryColor: '#667eea',
  showRemember: true
})

// 性能监控
const loadTime = ref(0)
const switchTime = ref(0)
const cacheHitRate = ref(85)
const memoryUsage = ref(12.5)

// 设备类型
const deviceTypes: DeviceType[] = ['desktop', 'tablet', 'mobile']

// 使用模板管理
const {
  templates,
  loading: templatesLoading,
  error: templatesError
} = useTemplate()

// 使用响应式模板切换
const {
  currentDevice,
  currentTemplate,
  currentTemplateMetadata,
  isSwitching,
  isLoading,
  switchError,
  switchDevice,
  switchTemplate,
  getAvailableTemplates,
  reset
} = useResponsiveTemplate({
  category: selectedCategory.value,
  enableAutoDeviceSwitch: true,
  enableTransition: true,
  transitionDuration: 300
})

// 计算属性
const categories = computed(() => {
  const cats = [...new Set(templates.value.map(t => t.category))]
  return cats
})

const availableTemplates = computed(() => {
  return getAvailableTemplates(currentDevice.value)
})

// 工具函数
const getCategoryDisplayName = (category: string) => {
  const names: Record<string, string> = {
    login: '登录页面',
    dashboard: '仪表板',
    form: '表单页面'
  }
  return names[category] || category
}

const getDeviceDisplayName = (device: DeviceType) => {
  const names: Record<DeviceType, string> = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return names[device]
}

// 事件处理
const handleCategoryChange = async () => {
  const availableTemplates = getAvailableTemplates(currentDevice.value)
  if (availableTemplates.length > 0) {
    await switchTemplate(availableTemplates[0].name, currentDevice.value)
  }
}

const handleDeviceChange = async (device: DeviceType) => {
  const startTime = Date.now()
  
  try {
    await switchDevice(device)
    switchTime.value = Date.now() - startTime
  } catch (error) {
    console.error('Device switch failed:', error)
  }
}

const handleTemplateChange = async (templateName: string) => {
  const startTime = Date.now()
  
  try {
    await switchTemplate(templateName)
    switchTime.value = Date.now() - startTime
  } catch (error) {
    console.error('Template switch failed:', error)
  }
}

const handleTemplateLoaded = () => {
  loadTime.value = Date.now() - loadStartTime.value
}

const handleTemplateError = (error: any) => {
  console.error('Template loading error:', error)
}

const handleRetry = () => {
  reset()
  handleTemplateChange(currentTemplate.value)
}

let loadStartTime = ref(Date.now())

// 监听模板切换
watch([currentDevice, currentTemplate], () => {
  loadStartTime.value = Date.now()
})

// 模拟性能数据更新
onMounted(() => {
  setInterval(() => {
    cacheHitRate.value = Math.floor(Math.random() * 20) + 80
    memoryUsage.value = Math.floor(Math.random() * 5) + 10
  }, 2000)
})
</script>

<style lang="less" scoped>
.dynamic-loading-demo {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;

  .demo-title {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .demo-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.demo-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.control-panel {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  height: fit-content;

  .panel-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 1rem;
    }
  }

  .control-group {
    margin-bottom: 1rem;

    .control-label {
      display: block;
      font-weight: 500;
      color: #34495e;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .control-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: #667eea;
      }
    }
  }

  .device-tabs {
    display: flex;
    gap: 0.5rem;

    .device-tab {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        border-color: #667eea;
      }

      &.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .template-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .template-option {
      padding: 0.75rem;
      border: 1px solid #ddd;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.9rem;
      text-align: left;
      transition: all 0.3s ease;

      &:hover:not(:disabled) {
        border-color: #667eea;
      }

      &.active {
        background: #667eea;
        color: white;
        border-color: #667eea;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1rem;

    .status-item {
      .status-label {
        font-size: 0.8rem;
        color: #7f8c8d;
        margin-bottom: 0.25rem;
      }

      .status-value {
        font-weight: 600;
        color: #2c3e50;

        &.loading {
          color: #f39c12;
        }

        &.switching {
          color: #e74c3c;
        }
      }
    }
  }

  .error-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    font-size: 0.9rem;

    .error-icon {
      font-size: 1rem;
    }

    .error-text {
      flex: 1;
      color: #c0392b;
    }

    .error-retry {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        background: #c0392b;
      }
    }
  }

  .config-panel {
    .config-group {
      margin-bottom: 1rem;

      .config-label {
        display: block;
        font-weight: 500;
        color: #34495e;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
      }

      .config-input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: #667eea;
        }
      }

      .config-color {
        width: 60px;
        height: 40px;
        border: 1px solid #ddd;
        border-radius: 8px;
        cursor: pointer;
      }

      .config-checkbox {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;

        .checkbox-text {
          font-size: 0.9rem;
          color: #34495e;
        }
      }
    }
  }
}

.render-area {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  .render-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;

    .render-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2c3e50;
      margin: 0;
    }

    .render-info {
      display: flex;
      gap: 1rem;

      .info-item {
        font-size: 0.9rem;
        color: #7f8c8d;
        background: #f8f9fa;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
      }
    }
  }

  .render-container {
    min-height: 500px;
    position: relative;

    .render-loading,
    .render-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 500px;
      gap: 1rem;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .loading-text,
      .error-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #2c3e50;
      }

      .error-icon {
        font-size: 3rem;
      }

      .error-message {
        color: #7f8c8d;
        text-align: center;
      }

      .error-retry {
        background: #667eea;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 500;

        &:hover {
          background: #5a6fd8;
        }
      }
    }

    .render-content {
      padding: 1.5rem;
    }
  }
}

.performance-panel {
  grid-column: 1 / -1;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .panel-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .performance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;

    .performance-item {
      text-align: center;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;

      .performance-label {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin-bottom: 0.5rem;
      }

      .performance-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #2c3e50;
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 1200px) {
  .demo-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .demo-content {
    padding: 1rem;
  }

  .control-panel {
    padding: 1rem;
  }

  .device-tabs {
    flex-direction: column;
  }

  .performance-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
