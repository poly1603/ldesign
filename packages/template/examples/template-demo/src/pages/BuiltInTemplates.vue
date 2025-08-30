<template>
  <div class="built-in-templates-page">
    <div class="page-header">
      <h1 class="page-title">🎨 内置模板展示</h1>
      <p class="page-subtitle">探索丰富的内置模板库，开箱即用的设计方案</p>

      <div class="template-stats">
        <div class="stat-card">
          <div class="stat-number">{{ totalTemplates }}</div>
          <div class="stat-label">内置模板</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">模板分类</div>
        </div>
        <div class="stat-card">
          <div class="stat-number">3</div>
          <div class="stat-label">设备适配</div>
        </div>
      </div>
    </div>

    <div class="page-content">
      <!-- 分类导航 -->
      <div class="category-nav">
        <button v-for="category in categories" :key="category" class="category-btn"
          :class="{ active: selectedCategory === category }" @click="handleCategoryChange(category)">
          <div class="category-icon">{{ getCategoryIcon(category) }}</div>
          <div class="category-name">{{ getCategoryDisplayName(category) }}</div>
          <div class="category-count">{{ getCategoryCount(category) }}</div>
        </button>
      </div>

      <!-- 模板网格 -->
      <div class="templates-grid">
        <div v-for="template in filteredTemplates" :key="`${template.category}-${template.device}-${template.name}`"
          class="template-card" @click="selectTemplate(template)">
          <div class="template-preview">
            <div class="preview-container" :class="`device-${template.device}`">
              <TemplateRenderer :category="template.category" :device="template.device" :template="template.name"
                :props="getDefaultProps(template)" class="preview-renderer" />
            </div>
            <div class="template-overlay">
              <button class="preview-btn">预览</button>
            </div>
          </div>

          <div class="template-info">
            <div class="template-header">
              <h3 class="template-name">{{ template.config?.displayName || template.name }}</h3>
              <div class="template-badges">
                <span class="device-badge" :class="`device-${template.device}`">
                  {{ getDeviceDisplayName(template.device) }}
                </span>
                <span v-if="template.config?.isDefault" class="default-badge">默认</span>
              </div>
            </div>

            <p class="template-description">{{ template.config?.description || '暂无描述' }}</p>

            <div class="template-tags" v-if="template.config?.tags?.length">
              <span v-for="tag in template.config.tags" :key="tag" class="template-tag">
                {{ tag }}
              </span>
            </div>

            <div class="template-meta">
              <div class="meta-item">
                <span class="meta-label">版本:</span>
                <span class="meta-value">{{ template.config?.version || '1.0.0' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">作者:</span>
                <span class="meta-value">{{ template.config?.author || '未知' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模板详情弹窗 -->
      <div v-if="selectedTemplate" class="template-modal" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title">{{ selectedTemplate.config?.displayName || selectedTemplate.name }}</h2>
            <button class="modal-close" @click="closeModal">×</button>
          </div>

          <div class="modal-body">
            <div class="modal-preview">
              <TemplateRenderer :category="selectedTemplate.category" :device="selectedTemplate.device"
                :template="selectedTemplate.name" :props="modalProps" class="modal-renderer" />
            </div>

            <div class="modal-info">
              <div class="info-section">
                <h4 class="info-title">模板信息</h4>
                <div class="info-grid">
                  <div class="info-item">
                    <span class="info-label">名称:</span>
                    <span class="info-value">{{ selectedTemplate.config?.displayName || selectedTemplate.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">版本:</span>
                    <span class="info-value">{{ selectedTemplate.config?.version || '1.0.0' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">作者:</span>
                    <span class="info-value">{{ selectedTemplate.config?.author || '未知' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">设备:</span>
                    <span class="info-value">{{ getDeviceDisplayName(selectedTemplate.device) }}</span>
                  </div>
                </div>

                <div class="info-description">
                  <p>{{ selectedTemplate.config?.description || '暂无描述' }}</p>
                </div>

                <div class="info-features" v-if="selectedTemplate.config.features">
                  <h5 class="features-title">特性</h5>
                  <ul class="features-list">
                    <li v-for="feature in selectedTemplate.config.features" :key="feature">
                      {{ feature }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="info-section">
                <h4 class="info-title">属性配置</h4>
                <div class="props-config">
                  <div class="config-group">
                    <label class="config-label">标题</label>
                    <input v-model="modalProps.title" type="text" class="config-input" />
                  </div>

                  <div class="config-group">
                    <label class="config-label">副标题</label>
                    <input v-model="modalProps.subtitle" type="text" class="config-input" />
                  </div>

                  <div class="config-group">
                    <label class="config-label">主题色</label>
                    <input v-model="modalProps.primaryColor" type="color" class="config-color" />
                  </div>
                </div>
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
import { TemplateRenderer } from '@ldesign/template'
import { useTemplate } from '@ldesign/template'
import { useResponsiveTemplate } from '@ldesign/template'

// 状态管理
const selectedCategory = ref('login')
const selectedTemplate = ref<any>(null)

// 使用模板管理 Hook
const {
  availableTemplates: allTemplates,
  loading: templatesLoading,
  error: templatesError
} = useTemplate({
  category: selectedCategory.value,
  autoDetectDevice: true,
  enableCache: true
})

// 使用响应式模板切换 Hook
const {
  currentDevice,
  currentTemplate,
  currentTemplateMetadata,
  isSwitching,
  isLoading,
  switchError,
  switchDevice,
  switchTemplate,
  getAvailableTemplates
} = useResponsiveTemplate({
  category: selectedCategory.value,
  enableAutoDeviceSwitch: true,
  enableTransition: true
})

// 计算属性
const categories = computed(() => {
  if (!allTemplates.value || !Array.isArray(allTemplates.value)) {
    return []
  }
  const cats = [...new Set(allTemplates.value.map(t => t.category))]
  return cats
})

const totalTemplates = computed(() => {
  if (!allTemplates.value || !Array.isArray(allTemplates.value)) {
    return 0
  }
  return allTemplates.value.length
})

const filteredTemplates = computed(() => {
  if (!allTemplates.value || !Array.isArray(allTemplates.value)) {
    return []
  }
  return allTemplates.value.filter(t => t.category === selectedCategory.value)
})

// 模态框属性
const modalProps = reactive({
  title: '示例标题',
  subtitle: '示例副标题',
  primaryColor: '#667eea',
  showRemember: true,
  showRegister: true
})

// 工具函数
const getCategoryIcon = (category: string) => {
  const icons: Record<string, string> = {
    login: '🔐',
    dashboard: '📊',
    form: '📝',
    profile: '👤'
  }
  return icons[category] || '📄'
}

const getCategoryDisplayName = (category: string) => {
  const names: Record<string, string> = {
    login: '登录页面',
    dashboard: '仪表板',
    form: '表单页面',
    profile: '个人资料'
  }
  return names[category] || category
}

const getCategoryCount = (category: string) => {
  if (!allTemplates.value || !Array.isArray(allTemplates.value)) {
    return 0
  }
  return allTemplates.value.filter(t => t.category === category).length
}

const getDeviceDisplayName = (device: string) => {
  const names: Record<string, string> = {
    desktop: '桌面端',
    tablet: '平板端',
    mobile: '移动端'
  }
  return names[device] || device
}

const getDefaultProps = (template: any) => {
  return {
    title: template.props?.title?.default || '示例标题',
    subtitle: template.props?.subtitle?.default || '示例副标题',
    primaryColor: template.props?.primaryColor?.default || '#667eea'
  }
}

// 事件处理
const selectTemplate = async (template: any) => {
  selectedTemplate.value = template

  // 使用响应式模板切换
  try {
    await switchTemplate(template.name, template.device)

    // 重置模态框属性
    Object.assign(modalProps, getDefaultProps(template))
  } catch (error) {
    console.error('Failed to switch template:', error)
  }
}

const closeModal = () => {
  selectedTemplate.value = null
}

// 处理分类切换
const handleCategoryChange = async (category: string) => {
  selectedCategory.value = category

  // 获取该分类下的可用模板
  const availableTemplates = getAvailableTemplates(currentDevice.value)
  if (availableTemplates.length > 0) {
    await switchTemplate(availableTemplates[0].name, currentDevice.value)
  }
}
</script>

<style lang="less" scoped>
.built-in-templates-page {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 页面头部
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 2rem;
  text-align: center;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .page-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .template-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.2);

      .stat-number {
        font-size: 2rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .stat-label {
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }
  }
}

// 页面内容
.page-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

// 分类导航
.category-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  justify-content: center;

  .category-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem;
    background: white;
    border: 2px solid #e8e8e8;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    min-width: 120px;

    &:hover {
      border-color: #667eea;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
    }

    &.active {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }

    .category-icon {
      font-size: 2rem;
    }

    .category-name {
      font-weight: 600;
      font-size: 0.9rem;
    }

    .category-count {
      font-size: 0.8rem;
      opacity: 0.7;
      background: rgba(0, 0, 0, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
    }
  }
}

// 模板网格
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;

  .template-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #e8e8e8;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

      .template-overlay {
        opacity: 1;
      }
    }

    .template-preview {
      position: relative;
      height: 200px;
      overflow: hidden;
      background: #f8f9fa;

      .preview-container {
        width: 100%;
        height: 100%;
        transform-origin: top left;

        &.device-desktop {
          transform: scale(0.3);
        }

        &.device-tablet {
          transform: scale(0.4);
        }

        &.device-mobile {
          transform: scale(0.6);
        }

        .preview-renderer {
          width: 100%;
          height: 100%;
        }
      }

      .template-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;

        .preview-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;

          &:hover {
            background: #5a6fd8;
          }
        }
      }
    }

    .template-info {
      padding: 1.5rem;

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;

        .template-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: #262626;
          margin: 0;
        }

        .template-badges {
          display: flex;
          gap: 0.5rem;

          .device-badge {
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;

            &.device-desktop {
              background: #e6f7ff;
              color: #1890ff;
            }

            &.device-tablet {
              background: #f6ffed;
              color: #52c41a;
            }

            &.device-mobile {
              background: #fff7e6;
              color: #fa8c16;
            }
          }

          .default-badge {
            background: #f0f0f0;
            color: #666;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;
          }
        }
      }

      .template-description {
        color: #595959;
        font-size: 0.9rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }

      .template-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;

        .template-tag {
          background: #f5f5f5;
          color: #666;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
        }
      }

      .template-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.8rem;
        color: #8c8c8c;

        .meta-item {
          .meta-label {
            font-weight: 500;
          }
        }
      }
    }
  }
}

// 模态框
.template-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 1200px;
    max-height: 90vh;
    width: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e8e8e8;

      .modal-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #262626;
        margin: 0;
      }

      .modal-close {
        background: none;
        border: none;
        font-size: 2rem;
        cursor: pointer;
        color: #999;
        transition: color 0.3s ease;

        &:hover {
          color: #666;
        }
      }
    }

    .modal-body {
      display: flex;
      flex: 1;
      overflow: hidden;

      .modal-preview {
        flex: 2;
        background: #f8f9fa;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;

        .modal-renderer {
          max-width: 100%;
          max-height: 100%;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      }

      .modal-info {
        flex: 1;
        padding: 2rem;
        overflow-y: auto;

        .info-section {
          margin-bottom: 2rem;

          .info-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: #262626;
            margin-bottom: 1rem;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1rem;

            .info-item {
              .info-label {
                font-weight: 500;
                color: #8c8c8c;
                font-size: 0.9rem;
              }

              .info-value {
                color: #262626;
                font-size: 0.9rem;
              }
            }
          }

          .info-description {
            color: #595959;
            line-height: 1.6;
            margin-bottom: 1rem;
          }

          .features-title {
            font-size: 1rem;
            font-weight: 600;
            color: #262626;
            margin-bottom: 0.5rem;
          }

          .features-list {
            list-style: none;
            padding: 0;

            li {
              padding: 0.25rem 0;
              color: #595959;
              font-size: 0.9rem;

              &::before {
                content: '✓';
                color: #52c41a;
                font-weight: bold;
                margin-right: 0.5rem;
              }
            }
          }
        }

        .props-config {
          .config-group {
            margin-bottom: 1rem;

            .config-label {
              display: block;
              font-weight: 500;
              color: #262626;
              margin-bottom: 0.5rem;
              font-size: 0.9rem;
            }

            .config-input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid #d9d9d9;
              border-radius: 6px;
              font-size: 0.9rem;

              &:focus {
                outline: none;
                border-color: #667eea;
              }
            }

            .config-color {
              width: 60px;
              height: 40px;
              border: 1px solid #d9d9d9;
              border-radius: 6px;
              cursor: pointer;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .templates-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }

  .template-stats {
    flex-direction: column;
    align-items: center;
    gap: 1rem;

    .stat-card {
      width: 200px;
    }
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 1rem;

    .page-title {
      font-size: 2rem;
    }
  }

  .page-content {
    padding: 1rem;
  }

  .category-nav {
    flex-wrap: wrap;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .modal-content .modal-body {
    flex-direction: column;

    .modal-preview {
      flex: none;
      height: 300px;
    }
  }
}
</style>
