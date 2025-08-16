<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { useTemplate } from '@ldesign/template/vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 响应式设备切换演示页面加载

// 设备信息
const devices = [
  { type: 'desktop' as DeviceType, name: '桌面', icon: '🖥️', size: '1200px+' },
  { type: 'tablet' as DeviceType, name: '平板', icon: '📱', size: '768-1024px' },
  { type: 'mobile' as DeviceType, name: '手机', icon: '📱', size: '<768px' },
]

// 窗口尺寸
const windowSize = ref({ width: 0, height: 0 })

// 自动检测开关
const autoDetect = ref(true)

// 使用 useTemplate Hook
const {
  currentTemplateId,
  availableTemplates,
  deviceType,
  TemplateComponent,
  templateConfig,
  currentTemplate,
  switchTemplate: switchTemplateHook,
  switchDevice: switchDeviceHook,
} = useTemplate({
  category: 'login',
  autoSwitch: autoDetect,
})

// 当前设备
const currentDevice = computed(() => deviceType.value)

// 更新窗口尺寸（防抖优化）
function updateWindowSize() {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

// 防抖处理窗口大小变化
let resizeTimer: number | null = null
function debouncedUpdateWindowSize() {
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
  resizeTimer = setTimeout(updateWindowSize, 100) // 100ms防抖
}

// 切换设备
function switchDevice(device: DeviceType) {
  if (!autoDetect.value) {
    switchDeviceHook(device)
  }
}

// 切换模板
function switchTemplate(templateId: string) {
  switchTemplateHook(templateId)
}

// 切换自动检测
function toggleAutoDetect() {
  // autoDetect 是响应式的，会自动更新 useTemplate Hook 的 autoSwitch 参数
}

// 获取设备图标
function getDeviceIcon(deviceType: DeviceType) {
  const device = devices.find(d => d.type === deviceType)
  return device?.icon || '🖥️'
}

// 事件处理函数
function handleLogin(data: any) {
  alert(`登录成功！\n设备: ${currentDevice.value}\n模板: ${currentTemplate.value?.name}\n用户名: ${data.username}`)
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

// 生命周期
onMounted(() => {
  updateWindowSize()
  window.addEventListener('resize', debouncedUpdateWindowSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', debouncedUpdateWindowSize)
  if (resizeTimer) {
    clearTimeout(resizeTimer)
  }
})
</script>

<template>
  <div class="device-demo">
    <div class="device-demo__header">
      <div class="device-demo__container">
        <router-link to="/" class="device-demo__back"> ← 返回首页 </router-link>
        <h1 class="device-demo__title">📱 响应式设备切换演示</h1>
        <p class="device-demo__subtitle">体验自动设备检测和模板切换功能</p>
      </div>
    </div>

    <div class="device-demo__content">
      <div class="device-demo__container">
        <div class="device-demo__controls">
          <h2>设备模拟器</h2>
          <p>点击下方按钮模拟不同设备，或调整浏览器窗口大小体验自动检测：</p>

          <div class="device-demo__device-buttons">
            <button
              v-for="device in devices"
              :key="device.type"
              class="device-demo__device-btn"
              :class="[{ 'device-demo__device-btn--active': currentDevice === device.type }]"
              @click="switchDevice(device.type)"
            >
              <span class="device-demo__device-icon">{{ device.icon }}</span>
              <span class="device-demo__device-name">{{ device.name }}</span>
              <span class="device-demo__device-size">{{ device.size }}</span>
            </button>
          </div>

          <div class="device-demo__info-grid">
            <div class="device-demo__info-card">
              <h4>当前设备</h4>
              <div class="device-demo__info-value">
                {{ devices.find(d => d.type === currentDevice)?.icon }} {{ currentDevice }}
              </div>
            </div>

            <div class="device-demo__info-card">
              <h4>窗口尺寸</h4>
              <div class="device-demo__info-value">{{ windowSize.width }} × {{ windowSize.height }}</div>
            </div>

            <div class="device-demo__info-card">
              <h4>当前模板</h4>
              <div class="device-demo__info-value">
                {{ currentTemplate?.name || '无可用模板' }}
              </div>
            </div>

            <div class="device-demo__info-card">
              <h4>可用模板数</h4>
              <div class="device-demo__info-value">
                {{ availableTemplates.length }}
              </div>
            </div>
          </div>
        </div>

        <div class="device-demo__preview-section">
          <div class="device-demo__preview-header">
            <h3>模板预览</h3>
            <div class="device-demo__auto-detect">
              <label class="device-demo__checkbox">
                <input v-model="autoDetect" type="checkbox" @change="toggleAutoDetect" />
                <span class="device-demo__checkbox-mark" />
                自动检测设备
              </label>
            </div>
          </div>

          <div class="device-demo__preview-container" :class="`device-demo__preview-container--${currentDevice}`">
            <div class="device-demo__device-frame">
              <div class="device-demo__device-screen">
                <component
                  :is="TemplateComponent"
                  v-if="TemplateComponent"
                  v-bind="templateConfig"
                  @login="handleLogin"
                  @register="handleRegister"
                  @forgot-password="handleForgotPassword"
                  @third-party-login="handleThirdPartyLogin"
                />
                <div v-else class="device-demo__no-template">
                  <div class="device-demo__no-template-icon">🚫</div>
                  <h4>当前设备类型暂无可用模板</h4>
                  <p>系统将自动使用桌面版本作为备选</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="device-demo__template-list">
          <h3>可用模板列表</h3>
          <div class="device-demo__template-grid">
            <div
              v-for="template in availableTemplates"
              :key="template.id"
              class="device-demo__template-card"
              :class="[{ 'device-demo__template-card--active': template.id === currentTemplateId }]"
              @click="switchTemplate(template.id)"
            >
              <div class="device-demo__template-info">
                <h4>{{ template.name }}</h4>
                <p>{{ template.description }}</p>
                <div class="device-demo__template-device">
                  {{ getDeviceIcon(template.deviceType) }} {{ template.deviceType }}
                </div>
              </div>
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

  &__controls {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }
  }

  &__device-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 30px;
  }

  &__device-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 20px;
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;

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

  &__device-icon {
    font-size: 32px;
  }

  &__device-name {
    font-size: 16px;
    font-weight: 600;
  }

  &__device-size {
    font-size: 12px;
    opacity: 0.7;
  }

  &__info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }

  &__info-card {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    text-align: center;

    h4 {
      font-size: 14px;
      color: #666;
      margin: 0 0 8px 0;
      font-weight: 500;
    }
  }

  &__info-value {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  &__preview-section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
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
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  &__checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;

    input[type='checkbox'] {
      display: none;
    }
  }

  &__checkbox-mark {
    width: 18px;
    height: 18px;
    border: 2px solid #ddd;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;

    &::after {
      content: '✓';
      color: white;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  &__checkbox input:checked + &__checkbox-mark {
    background: #667eea;
    border-color: #667eea;

    &::after {
      opacity: 1;
    }
  }

  &__preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;

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
    padding: 60px 20px;
    color: #666;

    &-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }

    h4 {
      font-size: 18px;
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }
  }

  &__template-list {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #333;
    }
  }

  &__template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  &__template-card {
    border: 2px solid #e1e5e9;
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #667eea;
      background: #f8f9ff;
    }

    &--active {
      border-color: #667eea;
      background: #667eea;
      color: white;
    }

    h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 14px;
      margin: 0 0 12px 0;
      opacity: 0.8;
      line-height: 1.4;
    }
  }

  &__template-device {
    font-size: 12px;
    opacity: 0.7;
    font-weight: 500;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-demo {
    &__device-buttons {
      grid-template-columns: 1fr;
    }

    &__info-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__template-grid {
      grid-template-columns: 1fr;
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
