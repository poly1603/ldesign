<template>
  <div class="hook-demo">
    <div class="demo-header">
      <h1 class="demo-title">🎣 Hook 演示</h1>
      <p class="demo-subtitle">体验模板管理相关的 Composable API</p>
    </div>

    <div class="demo-content">
      <!-- useTemplate Hook 演示 -->
      <div class="demo-section">
        <h2 class="section-title">useTemplate Hook</h2>
        <p class="section-description">模板管理的核心 Hook，提供模板加载、切换、缓存等功能</p>

        <div class="hook-demo-card">
          <div class="demo-controls">
            <div class="control-group">
              <label class="control-label">分类:</label>
              <select v-model="selectedCategory" class="control-select">
                <option value="login">登录页面</option>
                <option value="dashboard">仪表板</option>
              </select>
            </div>

            <div class="control-group">
              <label class="control-label">设备:</label>
              <select v-model="selectedDevice" class="control-select">
                <option value="desktop">桌面端</option>
                <option value="tablet">平板端</option>
                <option value="mobile">移动端</option>
              </select>
            </div>
          </div>

          <div class="demo-output">
            <h4>Hook 状态:</h4>
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">模板数量:</span>
                <span class="status-value">{{ templates.length }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">加载状态:</span>
                <span class="status-value" :class="{ loading: loading }">
                  {{ loading ? '加载中...' : '已完成' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">错误信息:</span>
                <span class="status-value error">{{ error || '无' }}</span>
              </div>
            </div>

            <div class="templates-list">
              <h5>可用模板:</h5>
              <div class="template-items">
                <div v-for="template in filteredTemplates" :key="template.name" class="template-item">
                  <div class="template-info">
                    <span class="template-name">{{ template.displayName }}</span>
                    <span class="template-device">{{ template.device }}</span>
                  </div>
                  <button @click="loadTemplate(template)" class="load-btn">加载</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- useDeviceDetection Hook 演示 -->
      <div class="demo-section">
        <h2 class="section-title">useDeviceDetection Hook</h2>
        <p class="section-description">设备检测 Hook，自动检测用户设备类型</p>

        <div class="hook-demo-card">
          <div class="demo-output">
            <div class="device-info">
              <div class="device-display">
                <div class="device-icon">{{ getDeviceIcon(deviceType) }}</div>
                <div class="device-details">
                  <div class="device-name">{{ getDeviceDisplayName(deviceType) }}</div>
                  <div class="device-size">{{ screenSize.width }} × {{ screenSize.height }}</div>
                </div>
              </div>

              <div class="device-flags">
                <div class="flag-item" :class="{ active: isMobile }">
                  <span class="flag-label">移动设备</span>
                  <span class="flag-value">{{ isMobile ? '是' : '否' }}</span>
                </div>
                <div class="flag-item" :class="{ active: isTablet }">
                  <span class="flag-label">平板设备</span>
                  <span class="flag-value">{{ isTablet ? '是' : '否' }}</span>
                </div>
                <div class="flag-item" :class="{ active: isDesktop }">
                  <span class="flag-label">桌面设备</span>
                  <span class="flag-value">{{ isDesktop ? '是' : '否' }}</span>
                </div>
              </div>

              <div class="orientation-info">
                <span class="orientation-label">屏幕方向:</span>
                <span class="orientation-value">{{ orientation }}</span>
              </div>
            </div>

            <div class="manual-controls">
              <h5>手动设置设备类型:</h5>
              <div class="device-buttons">
                <button v-for="device in ['desktop', 'tablet', 'mobile']" :key="device" @click="setDeviceType(device)"
                  class="device-btn" :class="{ active: deviceType === device }">
                  {{ getDeviceDisplayName(device) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- useResponsiveTemplate Hook 演示 -->
      <div class="demo-section">
        <h2 class="section-title">useResponsiveTemplate Hook</h2>
        <p class="section-description">响应式模板切换 Hook，实现设备切换时的自动模板切换</p>

        <div class="hook-demo-card">
          <div class="demo-controls">
            <div class="control-group">
              <label class="control-checkbox">
                <input v-model="enableAutoSwitch" type="checkbox" />
                <span class="checkbox-text">启用自动设备切换</span>
              </label>
            </div>

            <div class="control-group">
              <label class="control-checkbox">
                <input v-model="enableTransition" type="checkbox" />
                <span class="checkbox-text">启用过渡动画</span>
              </label>
            </div>
          </div>

          <div class="demo-output">
            <div class="responsive-status">
              <div class="status-item">
                <span class="status-label">当前设备:</span>
                <span class="status-value">{{ currentDevice }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">当前模板:</span>
                <span class="status-value">{{ currentTemplate }}</span>
              </div>
              <div class="status-item">
                <span class="status-label">切换状态:</span>
                <span class="status-value" :class="{ switching: isSwitching }">
                  {{ isSwitching ? '切换中...' : '就绪' }}
                </span>
              </div>
            </div>

            <div class="switch-controls">
              <h5>手动切换:</h5>
              <div class="switch-buttons">
                <button @click="switchDevice('desktop')" :disabled="isSwitching" class="switch-btn">
                  切换到桌面端
                </button>
                <button @click="switchDevice('mobile')" :disabled="isSwitching" class="switch-btn">
                  切换到移动端
                </button>
                <button @click="switchTemplate('modern')" :disabled="isSwitching" class="switch-btn">
                  切换到现代模板
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useTemplate, useDeviceDetection, useResponsiveTemplate } from '@ldesign/template'
import type { DeviceType } from '@ldesign/template'

// 状态管理
const selectedCategory = ref('login')
const selectedDevice = ref<DeviceType>('desktop')
const enableAutoSwitch = ref(true)
const enableTransition = ref(true)

// useTemplate Hook
const {
  templates,
  loading,
  error,
  loadTemplate: loadTemplateHook
} = useTemplate({
  category: selectedCategory.value,
  autoDetectDevice: true,
  enableCache: true
})

// useDeviceDetection Hook
const {
  deviceType,
  isMobile,
  isTablet,
  isDesktop,
  orientation,
  screenSize,
  setDeviceType
} = useDeviceDetection()

// useResponsiveTemplate Hook
const {
  currentDevice,
  currentTemplate,
  isSwitching,
  switchDevice,
  switchTemplate
} = useResponsiveTemplate({
  category: selectedCategory.value,
  enableAutoDeviceSwitch: enableAutoSwitch.value,
  enableTransition: enableTransition.value
})

// 计算属性
const filteredTemplates = computed(() => {
  return templates.value.filter(template =>
    template.category === selectedCategory.value &&
    template.device === selectedDevice.value
  )
})

// 工具函数
const getDeviceIcon = (device: DeviceType) => {
  const icons = {
    desktop: '🖥️',
    tablet: '📱',
    mobile: '📱'
  }
  return icons[device] || '❓'
}

const getDeviceDisplayName = (device: DeviceType) => {
  const names = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return names[device] || device
}

// 事件处理
const loadTemplate = async (template: any) => {
  try {
    await loadTemplateHook(template.category, template.device, template.name)
  } catch (error) {
    console.error('Failed to load template:', error)
  }
}
</script>

<style lang="less" scoped>
.hook-demo {
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-section {
  margin-bottom: 3rem;

  .section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .section-description {
    color: #7f8c8d;
    margin-bottom: 1.5rem;
  }
}

.hook-demo-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.demo-controls {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #eee;

  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    .control-label {
      font-weight: 500;
      color: #34495e;
      font-size: 0.9rem;
    }

    .control-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 0.9rem;

      &:focus {
        outline: none;
        border-color: #667eea;
      }
    }

    .control-checkbox {
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

.demo-output {

  h4,
  h5 {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;

    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;

      .status-label {
        font-weight: 500;
        color: #7f8c8d;
      }

      .status-value {
        font-weight: 600;
        color: #2c3e50;

        &.loading {
          color: #f39c12;
        }

        &.error {
          color: #e74c3c;
        }

        &.switching {
          color: #e67e22;
        }
      }
    }
  }

  .templates-list {
    .template-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .template-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
        border: 1px solid #e9ecef;

        .template-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .template-name {
            font-weight: 500;
            color: #2c3e50;
          }

          .template-device {
            font-size: 0.8rem;
            color: #7f8c8d;
          }
        }

        .load-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;

          &:hover {
            background: #5a6fd8;
          }
        }
      }
    }
  }

  .device-info {
    .device-display {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;

      .device-icon {
        font-size: 3rem;
      }

      .device-details {
        .device-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .device-size {
          color: #7f8c8d;
          font-size: 0.9rem;
        }
      }
    }

    .device-flags {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .flag-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
        border: 2px solid transparent;

        &.active {
          border-color: #52c41a;
          background: #f6ffed;
        }

        .flag-label {
          font-size: 0.8rem;
          color: #7f8c8d;
          margin-bottom: 0.25rem;
        }

        .flag-value {
          font-weight: 600;
          color: #2c3e50;
        }
      }
    }

    .orientation-info {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;

      .orientation-label {
        font-weight: 500;
        color: #7f8c8d;
      }

      .orientation-value {
        font-weight: 600;
        color: #2c3e50;
      }
    }
  }

  .manual-controls,
  .switch-controls {
    margin-top: 1.5rem;

    .device-buttons,
    .switch-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .device-btn,
      .switch-btn {
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        background: white;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        &.active {
          background: #667eea;
          border-color: #667eea;
          color: white;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
  }

  .responsive-status {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;

    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 6px;

      .status-label {
        font-weight: 500;
        color: #7f8c8d;
      }

      .status-value {
        font-weight: 600;
        color: #2c3e50;

        &.switching {
          color: #e67e22;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .demo-content {
    padding: 1rem;
  }

  .demo-controls {
    flex-direction: column;
    gap: 1rem;
  }

  .device-flags {
    flex-direction: column;
  }

  .device-buttons,
  .switch-buttons {
    flex-direction: column;
  }
}
</style>
