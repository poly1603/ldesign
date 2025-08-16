<script setup lang="ts">
import { useTemplate } from '@ldesign/template/vue'
import { computed, onMounted, ref } from 'vue'

// useTemplate Hook 演示页面加载

// 使用 useTemplate Hook
const { currentTemplateId, availableTemplates, deviceType, TemplateComponent, templateConfig, currentTemplate } =
  useTemplate({
    category: 'login',
    autoSwitch: true, // 启用自动设备切换以响应窗口大小变化
  })

// 事件处理函数
function handleLogin(data: any) {
  alert(`登录成功！\n模板: ${currentTemplate.value?.name}\n设备: ${deviceType.value}\n用户名: ${data.username}`)
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

// 性能监控
const performanceMetrics = ref({
  loadTime: 0,
  renderTime: 0,
  cacheHits: 0,
  cacheMisses: 0,
})

const loadStartTime = ref(0)

// 性能监控函数
function startPerformanceMonitoring() {
  loadStartTime.value = performance.now()
}

function endPerformanceMonitoring() {
  const loadTime = performance.now() - loadStartTime.value
  performanceMetrics.value.loadTime = loadTime
  console.log(`模板加载耗时: ${loadTime.toFixed(2)}ms`)
}

// 模拟缓存统计
function updateCacheStats() {
  // 这里应该从模板管理器获取真实的缓存统计
  performanceMetrics.value.cacheHits = Math.floor(Math.random() * 50) + 20
  performanceMetrics.value.cacheMisses = Math.floor(Math.random() * 10) + 5
}

onMounted(() => {
  startPerformanceMonitoring()
  updateCacheStats()

  // 模拟加载完成
  setTimeout(() => {
    endPerformanceMonitoring()
  }, 100)
})

// 代码示例
const codeExample = computed(
  () => `import { useTemplate } from '@ldesign/template'

// 使用 useTemplate Hook
const {
  currentTemplateId,
  availableTemplates,
  deviceType,
  TemplateComponent,
  templateConfig
} = useTemplate({
  category: 'login',
  autoSwitch: true
})

// 在模板中使用
<component
  v-if="TemplateComponent"
  :is="TemplateComponent"
  v-bind="templateConfig"
  @login="handleLogin"
  @register="handleRegister"
/>`
)
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
            <select v-model="currentTemplateId" class="hook-demo__select">
              <option v-for="template in availableTemplates" :key="template.id" :value="template.id">
                {{ template.name }} - {{ template.description }}
              </option>
            </select>
          </div>

          <div class="hook-demo__control-group">
            <label class="hook-demo__label">设备类型:</label>
            <select v-model="deviceType" class="hook-demo__select">
              <option value="desktop">🖥️ 桌面</option>
              <option value="tablet">📱 平板</option>
              <option value="mobile">📱 手机</option>
            </select>
          </div>

          <div class="hook-demo__info">
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">当前模板:</span>
              <span class="hook-demo__info-value">{{ currentTemplate?.name || '无' }}</span>
            </div>
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">设备类型:</span>
              <span class="hook-demo__info-value">{{ deviceType }}</span>
            </div>
            <div class="hook-demo__info-item">
              <span class="hook-demo__info-label">可用模板数:</span>
              <span class="hook-demo__info-value">{{ availableTemplates.length }}</span>
            </div>
          </div>

          <!-- 性能监控面板 -->
          <div class="hook-demo__performance">
            <h3 class="hook-demo__performance-title">📊 性能监控</h3>
            <div class="hook-demo__performance-grid">
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">加载时间:</span>
                <span class="hook-demo__performance-value">{{ performanceMetrics.loadTime.toFixed(2) }}ms</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">缓存命中:</span>
                <span class="hook-demo__performance-value">{{ performanceMetrics.cacheHits }}</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">缓存未命中:</span>
                <span class="hook-demo__performance-value">{{ performanceMetrics.cacheMisses }}</span>
              </div>
              <div class="hook-demo__performance-item">
                <span class="hook-demo__performance-label">命中率:</span>
                <span class="hook-demo__performance-value">
                  {{
                    (
                      (performanceMetrics.cacheHits / (performanceMetrics.cacheHits + performanceMetrics.cacheMisses)) *
                      100
                    ).toFixed(1)
                  }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="hook-demo__preview">
          <div class="hook-demo__preview-header">
            <h3>模板预览</h3>
            <div class="hook-demo__device-indicator">
              {{ deviceType === 'desktop' ? '🖥️' : deviceType === 'tablet' ? '📱' : '📱' }}
              {{ deviceType }}
            </div>
          </div>

          <div class="hook-demo__template-container">
            <component
              :is="TemplateComponent"
              v-if="TemplateComponent"
              v-bind="templateConfig"
              @login="handleLogin"
              @register="handleRegister"
              @forgot-password="handleForgotPassword"
              @third-party-login="handleThirdPartyLogin"
            />
            <div v-else class="hook-demo__no-template">
              <div class="hook-demo__no-template-icon">🚫</div>
              <h4>当前设备类型暂无可用模板</h4>
              <p>请尝试切换到其他设备类型或选择其他模板</p>
            </div>
          </div>
        </div>

        <div class="hook-demo__code">
          <h3>代码示例</h3>
          <pre class="hook-demo__code-block"><code>{{ codeExample }}</code></pre>
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
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 0;
  }

  &__container {
    max-width: 1200px;
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
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    align-items: start;
  }

  &__control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  &__select {
    padding: 12px;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 6px;
    font-size: 14px;
  }

  &__info-label {
    color: #666;
    font-weight: 500;
  }

  &__info-value {
    color: #333;
    font-weight: 600;
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
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 2px solid #f0f0f0;

    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }
  }

  &__device-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #f8f9fa;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
  }

  &__template-container {
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    background: #f8f9fa;
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
      font-size: 20px;
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
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

  &__code-block {
    background: #2d3748;
    color: #e2e8f0;
    padding: 20px;
    border-radius: 8px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow-x: auto;
    margin: 0;

    code {
      background: none;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
  }

  &__performance {
    background: white;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
  }

  &__performance-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
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
    padding: 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  &__performance-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    text-align: center;
  }

  &__performance-value {
    font-size: 16px;
    font-weight: 600;
    color: #667eea;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hook-demo {
    &__controls {
      grid-template-columns: 1fr;
      padding: 20px;
    }

    &__preview,
    &__code {
      padding: 20px;
    }

    &__preview-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    &__template-container {
      min-height: 300px;
    }

    &__code-block {
      font-size: 12px;
      padding: 16px;
    }
  }
}
</style>
