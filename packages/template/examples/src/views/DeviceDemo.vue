<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer, useTemplate } from '@ldesign/template/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 当前设备类型
const currentDevice = ref<DeviceType>('desktop')

// 模拟的设备信息
const deviceInfo = ref({
  width: window.innerWidth,
  height: window.innerHeight,
  userAgent: navigator.userAgent,
  platform: navigator.platform,
})

// 使用 useTemplate Hook - 不指定deviceType，让它自动检测
const {
  availableTemplates,
  switchTemplate,
  currentTemplate,
  currentDevice: detectedDevice,
} = useTemplate({
  category: 'login',
  autoScan: true,
})

// 设备类型配置
const deviceTypes: Array<{
  type: DeviceType
  name: string
  icon: string
  description: string
  breakpoint: string
  color: string
}> = [
  {
    type: 'desktop',
    name: '桌面设备',
    icon: '🖥️',
    description: '大屏幕设备，通常宽度 > 1024px',
    breakpoint: '> 1024px',
    color: '#667eea',
  },
  {
    type: 'tablet',
    name: '平板设备',
    icon: '📱',
    description: '中等屏幕设备，宽度 768px - 1024px',
    breakpoint: '768px - 1024px',
    color: '#f093fb',
  },
  {
    type: 'mobile',
    name: '移动设备',
    icon: '📱',
    description: '小屏幕设备，宽度 < 768px',
    breakpoint: '< 768px',
    color: '#43e97b',
  },
]

// 当前设备配置
const currentDeviceConfig = computed(() => {
  return deviceTypes.find(d => d.type === currentDevice.value) || deviceTypes[0]
})

// 自动检测设备类型
function detectDeviceType(): DeviceType {
  const width = window.innerWidth
  if (width >= 1024) return 'desktop'
  if (width >= 768) return 'tablet'
  return 'mobile'
}

// 切换设备类型
async function switchDevice(deviceType: DeviceType) {
  currentDevice.value = deviceType

  // 切换到该设备类型的默认模板
  const templates = availableTemplates.value.filter((t: any) => t.device === deviceType)
  if (templates.length > 0) {
    await switchTemplate(templates[0].category, deviceType, templates[0].template)
  }
}

// 自动检测设备
function autoDetectDevice() {
  const detectedDevice = detectDeviceType()
  switchDevice(detectedDevice)
}

// 更新设备信息
function updateDeviceInfo() {
  deviceInfo.value = {
    width: window.innerWidth,
    height: window.innerHeight,
    userAgent: navigator.userAgent,
    platform: (navigator as any).userAgentData?.platform || navigator.platform || 'Unknown',
  }
}

// 窗口大小变化监听
function handleResize() {
  updateDeviceInfo()
  // 可选：自动切换设备类型
  // const newDevice = detectDeviceType()
  // if (newDevice !== currentDevice.value) {
  //   switchDevice(newDevice)
  // }
}

// 事件处理函数
function handleLogin(data: any) {
  alert(`登录成功！\n设备: ${currentDevice.value}\n用户名: ${data.username}`)
}

function handleRegister() {
  alert('跳转到注册页面')
}

function handleForgotPassword(data: any) {
  alert(`重置密码链接已发送到: ${data.username}`)
}

function handleThirdPartyLogin(data: any) {
  alert(`使用 ${data.provider} 登录`)
}

// 初始化默认模板
async function initializeDefaultTemplate() {
  // 等待模板扫描完成
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 选择当前设备类型的第一个可用模板
  const templates = availableTemplates.value.filter((t: any) => t.device === currentDevice.value)
  if (templates.length > 0) {
    await switchTemplate(templates[0].category, currentDevice.value, templates[0].template)
  }
}

// 生命周期
onMounted(() => {
  window.addEventListener('resize', handleResize)
  updateDeviceInfo()
  initializeDefaultTemplate()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="device-demo">
    <div class="device-demo__header">
      <div class="device-demo__container">
        <router-link to="/" class="device-demo__back"> ← 返回首页 </router-link>
        <h1 class="device-demo__title">📱 响应式切换演示</h1>
        <p class="device-demo__subtitle">演示不同设备类型的自动切换功能</p>
      </div>
    </div>

    <div class="device-demo__content">
      <div class="device-demo__container">
        <div class="device-demo__controls">
          <div class="device-demo__device-selector">
            <h3>设备类型选择</h3>
            <div class="device-demo__device-grid">
              <button
                v-for="device in deviceTypes"
                :key="device.type"
                class="device-demo__device-card"
                :class="{ 'device-demo__device-card--active': currentDevice === device.type }"
                :style="{ '--device-color': device.color }"
                @click="switchDevice(device.type)"
              >
                <div class="device-demo__device-icon">
                  {{ device.icon }}
                </div>
                <div class="device-demo__device-name">
                  {{ device.name }}
                </div>
                <div class="device-demo__device-description">
                  {{ device.description }}
                </div>
                <div class="device-demo__device-breakpoint">
                  {{ device.breakpoint }}
                </div>
              </button>
            </div>
          </div>

          <div class="device-demo__auto-detect">
            <button class="device-demo__auto-btn" @click="autoDetectDevice">🔍 自动检测当前设备</button>
          </div>

          <div class="device-demo__device-info">
            <h3>当前设备信息</h3>
            <div class="device-demo__info-grid">
              <div class="device-demo__info-item">
                <span class="device-demo__info-label">屏幕宽度:</span>
                <span class="device-demo__info-value">{{ deviceInfo.width }}px</span>
              </div>
              <div class="device-demo__info-item">
                <span class="device-demo__info-label">屏幕高度:</span>
                <span class="device-demo__info-value">{{ deviceInfo.height }}px</span>
              </div>
              <div class="device-demo__info-item">
                <span class="device-demo__info-label">检测设备:</span>
                <span class="device-demo__info-value">{{ detectDeviceType() }}</span>
              </div>
              <div class="device-demo__info-item">
                <span class="device-demo__info-label">当前设备:</span>
                <span class="device-demo__info-value">{{ currentDevice }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="device-demo__preview">
          <div class="device-demo__preview-header">
            <h3>模板预览</h3>
            <div class="device-demo__preview-info">
              <span class="device-demo__preview-device" :style="{ color: currentDeviceConfig.color }">
                {{ currentDeviceConfig.icon }} {{ currentDeviceConfig.name }}
              </span>
            </div>
          </div>

          <div class="device-demo__preview-container" :class="`device-demo__preview-container--${currentDevice}`">
            <div class="device-demo__device-frame">
              <div class="device-demo__device-screen">
                <TemplateRenderer
                  v-if="currentTemplate"
                  :category="currentTemplate.category"
                  :device="currentTemplate.device"
                  :template="currentTemplate.template"
                  @login="handleLogin"
                  @register="handleRegister"
                  @forgot-password="handleForgotPassword"
                  @third-party-login="handleThirdPartyLogin"
                />
                <div v-else class="device-demo__no-template">
                  <div class="device-demo__no-template-icon">🚫</div>
                  <h4>暂无可用模板</h4>
                  <p>当前设备类型没有可用的模板</p>
                </div>
              </div>
            </div>
          </div>

          <div class="device-demo__template-info">
            <h3>模板信息</h3>
            <div v-if="currentTemplate" class="device-demo__template-details">
              <div class="device-demo__detail-item">
                <span class="device-demo__detail-label">模板名称:</span>
                <span class="device-demo__detail-value">{{
                  currentTemplate.config.name || currentTemplate.template
                }}</span>
              </div>
              <div class="device-demo__detail-item">
                <span class="device-demo__detail-label">设备类型:</span>
                <span class="device-demo__detail-value">{{ currentTemplate.device }}</span>
              </div>
              <div class="device-demo__detail-item">
                <span class="device-demo__detail-label">分类:</span>
                <span class="device-demo__detail-value">{{ currentTemplate.category }}</span>
              </div>
            </div>
            <div v-else class="device-demo__no-info">
              <p>暂无模板信息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.device-demo {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
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
    display: grid;
    grid-template-columns: 1fr;
    gap: 30px;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  &__device-selector {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  &__device-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__device-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;

    &:hover {
      border-color: var(--device-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    &--active {
      border-color: var(--device-color);
      background: var(--device-color);
      color: white;

      .device-demo__device-description,
      .device-demo__device-breakpoint {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  &__device-icon {
    font-size: 32px;
    margin-bottom: 12px;
  }

  &__device-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__device-description {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
    line-height: 1.4;
  }

  &__device-breakpoint {
    font-size: 11px;
    color: #999;
    font-weight: 500;
  }

  &__auto-detect {
    background: white;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  &__auto-btn {
    padding: 12px 24px;
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  &__device-info {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  &__info-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  &__info-label {
    font-size: 14px;
    color: #666;
    font-weight: 500;
  }

  &__info-value {
    font-size: 14px;
    color: #333;
    font-weight: 600;
  }

  &__preview {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  &__preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;

    h3 {
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
  }

  &__preview-device {
    background: #f8f9fa;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
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
      .device-demo__device-frame {
        width: 100%;
        max-width: 800px;
      }
    }

    &--tablet {
      .device-demo__device-frame {
        width: 100%;
        max-width: 600px;
      }
    }

    &--mobile {
      .device-demo__device-frame {
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

  &__no-template {
    text-align: center;
    color: #666;
    padding: 40px;

    &-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #333;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  &__template-info {
    h3 {
      margin: 0 0 20px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  &__template-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
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

  &__no-info {
    text-align: center;
    color: #666;
    padding: 20px;

    p {
      margin: 0;
    }
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .device-demo {
    &__content {
      grid-template-columns: 1fr;
    }

    &__controls {
      order: 2;
    }

    &__preview {
      order: 1;
    }
  }
}

@media (max-width: 768px) {
  .device-demo {
    &__device-grid {
      gap: 12px;
    }

    &__device-card {
      padding: 16px;
    }

    &__device-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__preview-container {
      min-height: 400px;

      &--desktop,
      &--tablet,
      &--mobile {
        .device-demo__device-frame {
          max-width: 100%;
        }
      }
    }
  }
}
</style>
