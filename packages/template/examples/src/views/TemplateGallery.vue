<script setup lang="ts">
import type { DeviceType, TemplateInfo } from '../../../src/vue'
import { computed, markRaw, ref } from 'vue'
import { templateConfigs, useTemplate } from '../../../src/vue'

// 模板画廊页面加载

// 设备类型
const deviceTypes = [
  { type: 'all' as const, name: '全部', icon: '🌐' },
  { type: 'desktop' as DeviceType, name: '桌面', icon: '🖥️' },
  { type: 'tablet' as DeviceType, name: '平板', icon: '📱' },
  { type: 'mobile' as DeviceType, name: '手机', icon: '📱' },
]

// 选中的设备类型
const selectedDevice = ref<'all' | DeviceType>('all')

// 选中的模板
const selectedTemplate = ref<TemplateInfo | null>(null)

// 获取各设备类型的模板（优化：避免在computed中重复调用useTemplate）
const { availableTemplates: desktopTemplates } = useTemplate({
  category: 'login',
  deviceType: 'desktop',
})

const { availableTemplates: tabletTemplates } = useTemplate({
  category: 'login',
  deviceType: 'tablet',
})

const { availableTemplates: mobileTemplates } = useTemplate({
  category: 'login',
  deviceType: 'mobile',
})

// 所有模板（使用markRaw优化性能）
const allAvailableTemplates = computed(() => {
  const allTemplates = [
    ...desktopTemplates.value,
    ...tabletTemplates.value,
    ...mobileTemplates.value,
  ]

  // 使用markRaw标记组件为非响应式
  return allTemplates.map(template => ({
    ...template,
    component: markRaw(template.component),
  }))
})

// 过滤后的模板
const filteredTemplates = computed(() => {
  if (selectedDevice.value === 'all') {
    return allAvailableTemplates.value
  }
  return allAvailableTemplates.value.filter(template => template.deviceType === selectedDevice.value)
})

// 获取设备图标
function getDeviceIcon(deviceType: DeviceType) {
  const device = deviceTypes.find(d => d.type === deviceType)
  return device?.icon || '🖥️'
}

// 选择模板
function selectTemplate(template: TemplateInfo) {
  // 使用 markRaw 标记组件为非响应式，避免性能开销
  selectedTemplate.value = {
    ...template,
    component: markRaw(template.component),
  }
}

// 获取模板配置
function getTemplateConfig(template: TemplateInfo) {
  if (template.deviceType === 'desktop') {
    return templateConfigs.login[template.id as keyof typeof templateConfigs.login] || templateConfigs.login.default
  }
  else if (template.deviceType === 'tablet') {
    return templateConfigs.login.tablet
  }
  else {
    return templateConfigs.login.mobile
  }
}

// 事件处理函数
function handleLogin(data: any) {
  alert(`登录成功！\n模板: ${selectedTemplate.value?.name}\n设备: ${selectedTemplate.value?.deviceType}\n用户名: ${data.username}`)
}

function handleRegister() {
  alert('跳转到注册页面')
}

function handleForgotPassword(data: any) {
  alert(`重置密码链接已发送到与用户名 "${data.username}" 关联的邮箱`)
}

function handleThirdPartyLogin(data: any) {
  alert(`使用 ${data.provider} 登录`)
}

// 初始化默认选中模板
watch(allAvailableTemplates, (templates) => {
  if (templates.length > 0 && !selectedTemplate.value) {
    // 选择第一个模板作为默认模板，并确保组件使用markRaw
    const firstTemplate = templates[0]
    selectedTemplate.value = {
      ...firstTemplate,
      component: markRaw(firstTemplate.component),
    }
  }
}, { immediate: true })
</script>

<template>
  <div class="template-gallery">
    <div class="template-gallery__header">
      <div class="template-gallery__container">
        <router-link to="/" class="template-gallery__back">
          ← 返回首页
        </router-link>
        <h1 class="template-gallery__title">
          🎨 模板画廊
        </h1>
        <p class="template-gallery__subtitle">
          浏览所有可用的精美模板
        </p>
      </div>
    </div>

    <div class="template-gallery__content">
      <div class="template-gallery__container">
        <div class="template-gallery__filters">
          <div class="template-gallery__filter-group">
            <label class="template-gallery__filter-label">设备类型:</label>
            <div class="template-gallery__filter-buttons">
              <button
                v-for="device in deviceTypes"
                :key="device.type"
                class="template-gallery__filter-btn" :class="[
                  { 'template-gallery__filter-btn--active': selectedDevice === device.type },
                ]"
                @click="selectedDevice = device.type"
              >
                {{ device.icon }} {{ device.name }}
              </button>
            </div>
          </div>

          <div class="template-gallery__stats">
            <div class="template-gallery__stat">
              <span class="template-gallery__stat-number">{{ filteredTemplates.length }}</span>
              <span class="template-gallery__stat-label">个模板</span>
            </div>
            <div class="template-gallery__stat">
              <span class="template-gallery__stat-number">{{ deviceTypes.length }}</span>
              <span class="template-gallery__stat-label">种设备</span>
            </div>
          </div>
        </div>

        <div class="template-gallery__grid">
          <div
            v-for="template in filteredTemplates"
            :key="`${template.deviceType}-${template.id}`"
            class="template-gallery__card"
            @click="selectTemplate(template)"
          >
            <div class="template-gallery__card-header">
              <div class="template-gallery__card-device">
                {{ getDeviceIcon(template.deviceType) }} {{ template.deviceType }}
              </div>
              <div
                v-if="selectedTemplate?.id === template.id && selectedTemplate?.deviceType === template.deviceType"
                class="template-gallery__card-selected"
              >
                ✓
              </div>
            </div>

            <div class="template-gallery__card-preview">
              <div class="template-gallery__preview-placeholder">
                <div class="template-gallery__preview-icon">
                  🎨
                </div>
                <div class="template-gallery__preview-text">
                  {{ template.name }}
                </div>
              </div>
            </div>

            <div class="template-gallery__card-info">
              <h3 class="template-gallery__card-title">
                {{ template.name }}
              </h3>
              <p class="template-gallery__card-description">
                {{ template.description }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="selectedTemplate" class="template-gallery__preview-section">
          <div class="template-gallery__preview-header">
            <h2>模板预览</h2>
            <div class="template-gallery__preview-info">
              <span class="template-gallery__preview-device">
                {{ getDeviceIcon(selectedTemplate.deviceType) }} {{ selectedTemplate.deviceType }}
              </span>
              <span class="template-gallery__preview-name">{{ selectedTemplate.name }}</span>
            </div>
          </div>

          <div
            class="template-gallery__preview-container"
            :class="`template-gallery__preview-container--${selectedTemplate.deviceType}`"
          >
            <div class="template-gallery__device-frame">
              <div class="template-gallery__device-screen">
                <component
                  :is="selectedTemplate.component"
                  v-bind="getTemplateConfig(selectedTemplate)"
                  @login="handleLogin"
                  @register="handleRegister"
                  @forgot-password="handleForgotPassword"
                  @third-party-login="handleThirdPartyLogin"
                />
              </div>
            </div>
          </div>

          <div class="template-gallery__template-details">
            <h3>模板详情</h3>
            <div class="template-gallery__details-grid">
              <div class="template-gallery__detail-item">
                <span class="template-gallery__detail-label">名称:</span>
                <span class="template-gallery__detail-value">{{ selectedTemplate.name }}</span>
              </div>
              <div class="template-gallery__detail-item">
                <span class="template-gallery__detail-label">描述:</span>
                <span class="template-gallery__detail-value">{{ selectedTemplate.description }}</span>
              </div>
              <div class="template-gallery__detail-item">
                <span class="template-gallery__detail-label">设备类型:</span>
                <span class="template-gallery__detail-value">{{ selectedTemplate.deviceType }}</span>
              </div>
              <div class="template-gallery__detail-item">
                <span class="template-gallery__detail-label">类别:</span>
                <span class="template-gallery__detail-value">{{ selectedTemplate.category }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="template-gallery__no-selection">
          <div class="template-gallery__no-selection-icon">
            👆
          </div>
          <h3>选择一个模板</h3>
          <p>点击上方的模板卡片来预览模板效果</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.template-gallery {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 0;
  }

  &__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 20px;
  }

  &__back {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 20px;
    display: inline-block;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }

  &__title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  &__subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin: 0;
  }

  &__content {
    padding: 40px 0;
  }

  &__filters {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  &__filter-group {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  &__filter-label {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
  }

  &__filter-buttons {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  &__filter-btn {
    padding: 8px 16px;
    border: 2px solid #e1e5e9;
    border-radius: 20px;
    background: white;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;

    &:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    &--active {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }
  }

  &__stats {
    display: flex;
    gap: 24px;
  }

  &__stat {
    text-align: center;

    &-number {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #667eea;
    }

    &-label {
      font-size: 12px;
      color: #666;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 40px;
  }

  &__card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      border-color: #667eea;
    }
  }

  &__card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e1e5e9;
  }

  &__card-device {
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  &__card-selected {
    width: 20px;
    height: 20px;
    background: #28a745;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: bold;
  }

  &__card-preview {
    height: 200px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__preview-placeholder {
    text-align: center;
    color: #666;
  }

  &__preview-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  &__preview-text {
    font-size: 14px;
    font-weight: 500;
  }

  &__card-info {
    padding: 20px;
  }

  &__card-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: #333;
  }

  &__card-description {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.5;
  }

  &__preview-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
  }

  &__preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  &__preview-info {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    color: #666;
  }

  &__preview-device {
    background: #f8f9fa;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 500;
  }

  &__preview-name {
    font-weight: 600;
    color: #333;
  }

  &__preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 30px;

    &--desktop {
      .template-gallery__device-frame {
        width: 100%;
        max-width: 800px;
      }
    }

    &--tablet {
      .template-gallery__device-frame {
        width: 100%;
        max-width: 600px;
      }
    }

    &--mobile {
      .template-gallery__device-frame {
        width: 100%;
        max-width: 400px;
      }
    }
  }

  &__device-frame {
    background: #333;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }

  &__device-screen {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__template-details {
    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #333;
    }
  }

  &__details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  &__detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  &__detail-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  &__detail-value {
    font-size: 14px;
    color: #333;
    font-weight: 600;
  }

  &__no-selection {
    background: white;
    border-radius: 16px;
    padding: 60px 30px;
    text-align: center;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    &-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    h3 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-gallery {
    &__filters {
      flex-direction: column;
      align-items: flex-start;
    }

    &__filter-group {
      width: 100%;
      justify-content: space-between;
    }

    &__stats {
      width: 100%;
      justify-content: center;
    }

    &__grid {
      grid-template-columns: 1fr;
    }

    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__details-grid {
      grid-template-columns: 1fr;
    }

    &__preview-container {
      min-height: 400px;

      &--desktop,
      &--tablet,
      &--mobile {
        .template-gallery__device-frame {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
