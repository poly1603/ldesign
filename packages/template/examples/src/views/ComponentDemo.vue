<script setup lang="ts">
import type { DeviceType } from '@ldesign/template'
import { TemplateRenderer } from '@ldesign/template/vue'
import { computed, ref } from 'vue'

// 当前选择的模板
const selectedCategory = ref('login')
const selectedDevice = ref<DeviceType>('desktop')
const selectedTemplate = ref('classic')

// 模板选项
const templateOptions = {
  login: {
    desktop: ['classic', 'modern', 'default'],
    tablet: ['adaptive', 'split', 'default'],
    mobile: ['card', 'simple', 'default'],
  },
}

// 当前设备的模板选项
const currentTemplateOptions = computed(() => {
  return templateOptions[selectedCategory.value as keyof typeof templateOptions]?.[selectedDevice.value] || []
})

// 性能统计
const performanceStats = ref({
  renderTime: 0,
  componentSize: '15MB (95%)',
  memoryUsage: '103.1ms',
  loadTime: '1.2ms',
  cacheSize: '54.9%',
})

// 模拟性能数据更新
function updatePerformanceStats() {
  performanceStats.value = {
    renderTime: Math.random() * 10 + 1,
    componentSize: `${(Math.random() * 20 + 10).toFixed(1)}MB (${(Math.random() * 10 + 90).toFixed(0)}%)`,
    memoryUsage: `${(Math.random() * 50 + 100).toFixed(1)}ms`,
    loadTime: `${(Math.random() * 2 + 1).toFixed(1)}ms`,
    cacheSize: `${(Math.random() * 20 + 50).toFixed(1)}%`,
  }
}

// 监听模板变化
function handleTemplateChange() {
  updatePerformanceStats()
  console.log('模板切换:', {
    category: selectedCategory.value,
    device: selectedDevice.value,
    template: selectedTemplate.value,
  })
}

// 事件处理函数
function handleLogin(data: any) {
  alert(`登录成功！\n用户名: ${data.username}\n模板: ${selectedTemplate.value}`)
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

// 初始化性能数据
updatePerformanceStats()
</script>

<template>
  <div class="component-demo">
    <div class="component-demo__header">
      <div class="component-demo__container">
        <router-link to="/" class="component-demo__back"> ← 返回首页 </router-link>
        <h1 class="component-demo__title">🧩 TemplateRenderer 组件演示</h1>
        <p class="component-demo__subtitle">使用声明式组件快速渲染模板</p>
      </div>
    </div>

    <div class="component-demo__content">
      <div class="component-demo__container">
        <div class="component-demo__sidebar">
          <div class="component-demo__controls">
            <h3>基础用法</h3>
            <p>最简单的使用方式，只需要指定模板类型:</p>

            <div class="component-demo__code-example">
              <pre><code>&lt;TemplateRenderer
  category="{{ selectedCategory }}"
  device="{{ selectedDevice }}"
  template="{{ selectedTemplate }}"
  @login="handleLogin"
  @register="handleRegister"
/&gt;</code></pre>
            </div>

            <div class="component-demo__control-group">
              <label>分类:</label>
              <select v-model="selectedCategory" @change="handleTemplateChange">
                <option value="login">登录</option>
              </select>
            </div>

            <div class="component-demo__control-group">
              <label>设备:</label>
              <select v-model="selectedDevice" @change="handleTemplateChange">
                <option value="desktop">🖥️ 桌面</option>
                <option value="tablet">📱 平板</option>
                <option value="mobile">📱 手机</option>
              </select>
            </div>

            <div class="component-demo__control-group">
              <label>模板:</label>
              <select v-model="selectedTemplate" @change="handleTemplateChange">
                <option v-for="template in currentTemplateOptions" :key="template" :value="template">
                  {{ template }}
                </option>
              </select>
            </div>
          </div>

          <div class="component-demo__stats">
            <h3>📊 性能监控</h3>
            <div class="component-demo__stat-item">
              <span class="component-demo__stat-label">渲染时间:</span>
              <span class="component-demo__stat-value">{{ performanceStats.renderTime.toFixed(2) }}ms</span>
            </div>
            <div class="component-demo__stat-item">
              <span class="component-demo__stat-label">组件大小:</span>
              <span class="component-demo__stat-value">{{ performanceStats.componentSize }}</span>
            </div>
            <div class="component-demo__stat-item">
              <span class="component-demo__stat-label">内存使用:</span>
              <span class="component-demo__stat-value">{{ performanceStats.memoryUsage }}</span>
            </div>
            <div class="component-demo__stat-item">
              <span class="component-demo__stat-label">加载时间:</span>
              <span class="component-demo__stat-value">{{ performanceStats.loadTime }}</span>
            </div>
            <div class="component-demo__stat-item">
              <span class="component-demo__stat-label">缓存大小:</span>
              <span class="component-demo__stat-value">{{ performanceStats.cacheSize }}</span>
            </div>
          </div>
        </div>

        <div class="component-demo__main">
          <div class="component-demo__preview">
            <div class="component-demo__preview-header">
              <h3>实时预览</h3>
              <div class="component-demo__preview-info">
                <span class="component-demo__preview-device">
                  {{ selectedDevice === 'desktop' ? '🖥️' : selectedDevice === 'tablet' ? '📱' : '📱' }}
                  {{ selectedDevice }}
                </span>
                <span class="component-demo__preview-template">{{ selectedTemplate }}</span>
              </div>
            </div>

            <div class="component-demo__preview-container">
              <div class="component-demo__device-frame">
                <div class="component-demo__device-screen">
                  <TemplateRenderer
                    :category="selectedCategory"
                    :device="selectedDevice"
                    :template="selectedTemplate"
                    @login="handleLogin"
                    @register="handleRegister"
                    @forgot-password="handleForgotPassword"
                    @third-party-login="handleThirdPartyLogin"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="component-demo__details">
            <h3>模板信息</h3>
            <div class="component-demo__detail-grid">
              <div class="component-demo__detail-item">
                <span class="component-demo__detail-label">模板未找到:</span>
                <span class="component-demo__detail-value">{{
                  `${selectedCategory}/${selectedDevice}/${selectedTemplate}`
                }}</span>
              </div>
              <div class="component-demo__detail-item">
                <span class="component-demo__detail-label">错误:</span>
                <span class="component-demo__detail-value">Template not found</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.component-demo {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

    .component-demo__container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 30px;
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  &__controls {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  &__code-example {
    background: #2d3748;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    overflow-x: auto;

    pre {
      margin: 0;
      color: #e2e8f0;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.4;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }
  }

  &__control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    select {
      padding: 8px 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: #4facfe;
      }
    }
  }

  &__stats {
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

  &__stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  &__stat-label {
    font-size: 14px;
    color: #666;
  }

  &__stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #4facfe;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 30px;
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
    font-size: 14px;
  }

  &__preview-device {
    background: #f8f9fa;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 500;
    color: #666;
  }

  &__preview-template {
    font-weight: 600;
    color: #4facfe;
  }

  &__preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
  }

  &__device-frame {
    background: #333;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
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

  &__details {
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

  &__detail-grid {
    display: grid;
    grid-template-columns: 1fr;
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
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .component-demo {
    &__content .component-demo__container {
      grid-template-columns: 1fr;
    }

    &__sidebar {
      order: 2;
    }

    &__main {
      order: 1;
    }
  }
}

@media (max-width: 768px) {
  .component-demo {
    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__preview-container {
      min-height: 400px;
    }

    &__device-frame {
      max-width: 100%;
    }

    &__code-example pre {
      font-size: 11px;
    }
  }
}
</style>

<style scoped lang="less">
.component-demo {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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

    .component-demo__container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 30px;
    }
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: 30px;
  }

  &__controls {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h3 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    p {
      margin: 0 0 20px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.5;
    }
  }

  &__code-example {
    background: #2d3748;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    overflow-x: auto;

    pre {
      margin: 0;
      color: #e2e8f0;
      font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
      font-size: 12px;
      line-height: 1.4;

      code {
        background: none;
        color: inherit;
        padding: 0;
      }
    }
  }

  &__control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    select {
      padding: 8px 12px;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-color: #4facfe;
      }
    }
  }

  &__stats {
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

  &__stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  &__stat-label {
    font-size: 14px;
    color: #666;
  }

  &__stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #4facfe;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 30px;
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
    font-size: 14px;
  }

  &__preview-device {
    background: #f8f9fa;
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 500;
    color: #666;
  }

  &__preview-template {
    font-weight: 600;
    color: #4facfe;
  }

  &__preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 500px;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
  }

  &__device-frame {
    background: #333;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 600px;
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

  &__details {
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

  &__detail-grid {
    display: grid;
    grid-template-columns: 1fr;
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
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .component-demo {
    &__content .component-demo__container {
      grid-template-columns: 1fr;
    }

    &__sidebar {
      order: 2;
    }

    &__main {
      order: 1;
    }
  }
}

@media (max-width: 768px) {
  .component-demo {
    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    &__preview-container {
      min-height: 400px;
    }

    &__device-frame {
      max-width: 100%;
    }

    &__code-example pre {
      font-size: 11px;
    }
  }
}
</style>
