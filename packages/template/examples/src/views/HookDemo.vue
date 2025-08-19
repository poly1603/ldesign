<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer, TemplateSelector, useTemplate } from '@ldesign/template/vue'
import { computed, ref } from 'vue'

// 使用 useTemplate Hook
const {
  currentDevice,
  currentTemplate,
  availableTemplates,
  availableCategories,
  availableDevices,
  switchTemplate,
  loading,
  error,
  scanTemplates,
} = useTemplate({
  category: 'login',
  autoScan: true,
})

// 选择的模板ID
const selectedTemplateId = ref<string>('')

// 选择的设备类型
const selectedDevice = ref<DeviceType>('desktop')

// 模板选择选项
const templateOptions = computed(() => {
  return availableTemplates.value.map((template: any) => ({
    value: `${template.category}/${template.device}/${template.template}`,
    label: `${template.config.name || template.template} - ${template.device} (${
      template.config.description || '暂无描述'
    })`,
  }))
})

// 当前模板信息
const currentTemplateInfo = computed(() => {
  if (!currentTemplate.value) return null
  return {
    name: currentTemplate.value.config.name || currentTemplate.value.template,
    description: currentTemplate.value.config.description || '暂无描述',
    device: currentTemplate.value.device,
    category: currentTemplate.value.category,
  }
})

// 性能统计
const performanceStats = ref({
  loadTime: 0,
  cacheHits: 50, // 模拟数据
  cacheMisses: 14, // 模拟数据
  hitRate: ((50 / (50 + 14)) * 100).toFixed(1),
})

// 更新性能统计
async function updatePerformanceStats() {
  try {
    const startTime = Date.now()
    await scanTemplates()
    const endTime = Date.now()
    performanceStats.value.loadTime = endTime - startTime
  } catch (error) {
    console.error('扫描模板失败:', error)
  }
}

// 切换模板
async function handleTemplateChange() {
  if (!selectedTemplateId.value) return

  const [category, device, template] = selectedTemplateId.value.split('/')
  await switchTemplate(category, device as DeviceType, template)
}

// 切换设备类型
function handleDeviceChange() {
  // 这里可以添加设备切换逻辑
  console.log('设备类型切换到:', selectedDevice.value)
}

// 事件处理函数
function handleLogin(data: any) {
  alert(
    `登录成功！\n模板: ${currentTemplateInfo.value?.name}\n设备: ${currentTemplateInfo.value?.device}\n用户名: ${data.username}`
  )
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

// 模板选择器事件处理
function handleTemplateSelectorChange(template: string) {
  console.log('模板选择器选择了模板:', template)
  // 切换到选中的模板
  switchTemplate('login', selectedDevice.value, template)
}

function handleTemplatePreview(template: string) {
  console.log('预览模板:', template)
  // 这里可以添加预览逻辑，比如显示模板详情
}
</script>

<template>
  <div class="hook-demo">
    <div class="hook-demo__header">
      <div class="hook-demo__container">
        <router-link to="/" class="hook-demo__back"> ← 返回首页 </router-link>
        <h1 class="hook-demo__title">🪝 useTemplate Hook 演示</h1>
        <p class="hook-demo__subtitle">使用 Composition API 风格的 Hook 进行模板管理</p>
      </div>
    </div>

    <div class="hook-demo__content">
      <div class="hook-demo__container">
        <div class="hook-demo__controls">
          <div class="hook-demo__control-group">
            <label class="hook-demo__label">选择模板:</label>
            <select v-model="selectedTemplateId" class="hook-demo__select" @change="handleTemplateChange">
              <option value="">请选择模板</option>
              <option v-for="option in templateOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <div class="hook-demo__control-group">
            <label class="hook-demo__label">设备类型:</label>
            <select v-model="selectedDevice" class="hook-demo__select" @change="handleDeviceChange">
              <option value="desktop">🖥️ 桌面</option>
              <option value="tablet">📱 平板</option>
              <option value="mobile">📱 手机</option>
            </select>
          </div>

          <div class="hook-demo__info">
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">当前模板:</span>
              <span class="hook-demo__info-value">{{ currentTemplateInfo?.name || '无' }}</span>
            </div>
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">设备类型:</span>
              <span class="hook-demo__info-value">{{ currentDevice }}</span>
            </div>
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">可用模板数:</span>
              <span class="hook-demo__info-value">{{ availableTemplates.length }}</span>
            </div>
          </div>

          <div class="hook-demo__performance">
            <h3>📊 性能监控</h3>
            <div class="hook-demo__performance-grid">
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">加载时间:</span>
                <span class="hook-demo__performance-value">{{ performanceStats.loadTime.toFixed(2) }}ms</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">缓存命中:</span>
                <span class="hook-demo__performance-value">{{ performanceStats.cacheHits }}</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">缓存未命中:</span>
                <span class="hook-demo__performance-value">{{ performanceStats.cacheMisses }}</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">命中率:</span>
                <span class="hook-demo__performance-value">{{ performanceStats.hitRate }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 模板选择器区域 -->
        <div class="hook-demo__selector">
          <h3>🎨 模板选择器</h3>
          <TemplateSelector
            category="login"
            :device="selectedDevice"
            :current-template="currentTemplate?.template"
            :templates="availableTemplates"
            :show-preview="true"
            :show-search="true"
            layout="grid"
            :columns="3"
            @template-change="handleTemplateSelectorChange"
            @template-preview="handleTemplatePreview"
          />
        </div>

        <div class="hook-demo__preview">
          <div class="hook-demo__preview-header">
            <h3>模板预览</h3>
            <div class="hook-demo__preview-device">
              {{ currentDevice === 'desktop' ? '🖥️' : currentDevice === 'tablet' ? '📱' : '📱' }} {{ currentDevice }}
            </div>
          </div>

          <div class="hook-demo__preview-container">
            <div v-if="loading" class="hook-demo__loading">
              <div class="hook-demo__loading-spinner" />
              <p>加载中...</p>
            </div>

            <div v-else-if="error" class="hook-demo__error">
              <div class="hook-demo__error-icon">❌</div>
              <h4>加载失败</h4>
              <p>{{ error }}</p>
            </div>

            <div v-else-if="currentTemplate" class="hook-demo__template-container">
              <TemplateRenderer
                :category="currentTemplate.category"
                :device="currentTemplate.device"
                :template="currentTemplate.template"
                @login="handleLogin"
                @register="handleRegister"
                @forgot-password="handleForgotPassword"
                @third-party-login="handleThirdPartyLogin"
              />
            </div>

            <div v-else class="hook-demo__no-template">
              <div class="hook-demo__no-template-icon">🚫</div>
              <h4>当前设备类型暂无可用模板</h4>
              <p>请尝试切换到其他设备类型或选择其他模板</p>
            </div>
          </div>
        </div>

        <div class="hook-demo__code">
          <h3>代码示例</h3>
          <pre class="hook-demo__code-block"><code>import { useTemplate, TemplateRenderer } from '@ldesign/template/vue'

// 使用 useTemplate Hook
const {
  currentDevice,
  currentTemplate,
  availableTemplates,
  switchTemplate,
  loading,
  error
} = useTemplate({
  category: 'login',
  autoScan: true
})

// 在模板中使用
&lt;TemplateRenderer
  v-if="currentTemplate"
  :category="currentTemplate.category"
  :device="currentTemplate.device"
  :template="currentTemplate.template"
  @login="handleLogin"
  @register="handleRegister"
/&gt;</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.hook-demo {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
  }

  &__control-group {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  &__label {
    font-size: 16px;
    font-weight: 500;
    color: #333;
    white-space: nowrap;
    min-width: 80px;
  }

  &__select {
    flex: 1;
    min-width: 200px;
    padding: 8px 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #f093fb;
    }
  }

  &__info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin: 20px 0;
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

  &__performance {
    margin-top: 30px;

    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #333;
    }
  }

  &__performance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  &__performance-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }

  &__performance-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }

  &__performance-value {
    font-size: 18px;
    font-weight: 700;
    color: #f093fb;
  }

  &__preview {
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
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }
  }

  &__preview-device {
    background: #f8f9fa;
    padding: 8px 16px;
    border-radius: 12px;
    font-weight: 500;
    color: #666;
  }

  &__preview-container {
    min-height: 400px;
    background: #f8f9fa;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  &__loading {
    text-align: center;
    color: #666;

    &-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e1e5e9;
      border-top: 4px solid #f093fb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
  }

  &__error {
    text-align: center;
    color: #dc3545;

    &-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
    }

    p {
      margin: 0;
      color: #666;
    }
  }

  &__template-container {
    width: 100%;
    max-width: 600px;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  &__no-template {
    text-align: center;
    color: #666;

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

  &__code {
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

  &__selector {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #e9ecef;

    h3 {
      margin: 0 0 20px 0;
      color: #333;
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__code-block {
    background: #2d3748;
    color: #e2e8f0;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;

    code {
      background: none;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hook-demo {
    &__control-group {
      flex-direction: column;
      align-items: flex-start;
    }

    &__label {
      min-width: auto;
    }

    &__select {
      width: 100%;
      min-width: auto;
    }

    &__info {
      grid-template-columns: 1fr;
    }

    &__performance-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__preview-container {
      min-height: 300px;
    }

    &__template-container {
      max-width: 100%;
    }

    &__code-block {
      font-size: 12px;
    }
  }
}
</style>
