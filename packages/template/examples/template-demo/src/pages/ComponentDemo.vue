<template>
  <div class="component-demo">
    <div class="page-header">
      <h1>🧩 TemplateRenderer 组件演示</h1>
      <p>展示 TemplateRenderer 组件的各种用法和功能</p>
    </div>

    <!-- 基础用法 -->
    <section class="demo-section">
      <h2 class="section-title">基础用法</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>简单渲染</h3>
          <p>最基础的模板渲染，只需要指定分类即可</p>
        </div>
        <div class="demo-content">
          <TemplateRenderer 
            category="login"
            :props="basicProps"
          />
        </div>
        <div class="demo-code">
          <pre><code>&lt;TemplateRenderer 
  category="login"
  :props="{ title: '用户登录', showRemember: true }"
/&gt;</code></pre>
        </div>
      </div>
    </section>

    <!-- 设备适配 -->
    <section class="demo-section">
      <h2 class="section-title">设备适配</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>响应式适配</h3>
          <p>自动检测设备类型，或手动指定设备类型</p>
          <div class="device-controls">
            <label>
              <input 
                type="radio" 
                v-model="selectedDevice" 
                value="auto"
              />
              自动检测
            </label>
            <label>
              <input 
                type="radio" 
                v-model="selectedDevice" 
                value="desktop"
              />
              桌面端
            </label>
            <label>
              <input 
                type="radio" 
                v-model="selectedDevice" 
                value="tablet"
              />
              平板
            </label>
            <label>
              <input 
                type="radio" 
                v-model="selectedDevice" 
                value="mobile"
              />
              移动端
            </label>
          </div>
        </div>
        <div class="demo-content">
          <TemplateRenderer 
            category="login"
            :device="selectedDevice === 'auto' ? undefined : selectedDevice"
            :responsive="selectedDevice === 'auto'"
            :props="responsiveProps"
          />
        </div>
        <div class="demo-info">
          <p>当前设备类型: <strong>{{ currentDeviceType }}</strong></p>
        </div>
      </div>
    </section>

    <!-- 模板选择器 -->
    <section class="demo-section">
      <h2 class="section-title">模板选择器</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>内置选择器</h3>
          <p>启用模板选择器，用户可以实时切换模板</p>
          <div class="selector-controls">
            <label>
              <input 
                type="checkbox" 
                v-model="showSelector"
              />
              显示模板选择器
            </label>
          </div>
        </div>
        <div class="demo-content">
          <TemplateRenderer 
            category="login"
            :show-selector="showSelector"
            :props="selectorProps"
            @template-change="onTemplateChange"
          />
        </div>
        <div class="demo-info" v-if="lastChangedTemplate">
          <p>最后切换的模板: <strong>{{ lastChangedTemplate }}</strong></p>
        </div>
      </div>
    </section>

    <!-- 错误处理 -->
    <section class="demo-section">
      <h2 class="section-title">错误处理</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>错误处理和降级</h3>
          <p>演示模板加载失败时的错误处理和降级机制</p>
          <div class="error-controls">
            <button @click="triggerError">触发加载错误</button>
            <button @click="resetError">重置</button>
          </div>
        </div>
        <div class="demo-content">
          <TemplateRenderer 
            category="login"
            :template-name="errorTemplateName"
            fallback-template="default"
            :props="errorProps"
            @load-error="onLoadError"
          />
        </div>
        <div class="demo-info" v-if="lastError">
          <p class="error-message">错误信息: {{ lastError }}</p>
        </div>
      </div>
    </section>

    <!-- 自定义组件 -->
    <section class="demo-section">
      <h2 class="section-title">自定义组件</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>自定义加载和错误组件</h3>
          <p>使用自定义的加载状态和错误提示组件</p>
        </div>
        <div class="demo-content">
          <TemplateRenderer 
            category="login"
            :loading-component="CustomLoading"
            :error-component="CustomError"
            :props="customProps"
          />
        </div>
      </div>
    </section>

    <!-- 性能监控 -->
    <section class="demo-section">
      <h2 class="section-title">性能监控</h2>
      <div class="demo-card">
        <div class="demo-description">
          <h3>实时性能数据</h3>
          <p>查看模板加载和渲染的性能指标</p>
          <button @click="refreshStats">刷新统计</button>
        </div>
        <div class="demo-content">
          <div class="performance-stats">
            <div class="stat-item">
              <span class="stat-label">加载次数:</span>
              <span class="stat-value">{{ performanceStats.loadCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">平均加载时间:</span>
              <span class="stat-value">{{ performanceStats.avgLoadTime }}ms</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">缓存命中率:</span>
              <span class="stat-value">{{ performanceStats.cacheHitRate }}%</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">内存使用:</span>
              <span class="stat-value">{{ performanceStats.memoryUsage }}MB</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TemplateRenderer } from '@ldesign/template'
import { useDeviceDetection } from '@ldesign/template'
import { performanceUtils } from '@ldesign/template'

// 设备检测
const { deviceType } = useDeviceDetection()
const currentDeviceType = computed(() => deviceType.value)

// 基础用法状态
const basicProps = ref({
  title: '用户登录',
  showRemember: true
})

// 设备适配状态
const selectedDevice = ref<'auto' | 'desktop' | 'tablet' | 'mobile'>('auto')
const responsiveProps = ref({
  title: '响应式登录',
  showRemember: true
})

// 模板选择器状态
const showSelector = ref(false)
const selectorProps = ref({
  title: '选择器演示',
  showRemember: true
})
const lastChangedTemplate = ref('')

// 错误处理状态
const errorTemplateName = ref('default')
const errorProps = ref({
  title: '错误处理演示',
  showRemember: true
})
const lastError = ref('')

// 自定义组件
const customProps = ref({
  title: '自定义组件演示',
  showRemember: true
})

// 性能统计
const performanceStats = ref({
  loadCount: 0,
  avgLoadTime: 0,
  cacheHitRate: 0,
  memoryUsage: 0
})

// 自定义加载组件
const CustomLoading = {
  name: 'CustomLoading',
  template: `
    <div class="custom-loading">
      <div class="loading-spinner"></div>
      <p>正在加载自定义模板...</p>
    </div>
  `
}

// 自定义错误组件
const CustomError = {
  name: 'CustomError',
  props: ['error', 'retry'],
  template: `
    <div class="custom-error">
      <div class="error-icon">❌</div>
      <h3>自定义错误提示</h3>
      <p>{{ error }}</p>
      <button @click="retry" class="retry-btn">重新尝试</button>
    </div>
  `
}

// 事件处理
const onTemplateChange = (templateName: string) => {
  lastChangedTemplate.value = templateName
  console.log('Template changed to:', templateName)
}

const onLoadError = (error: Error) => {
  lastError.value = error.message
  console.error('Template load error:', error)
}

const triggerError = () => {
  errorTemplateName.value = 'non-existent-template'
}

const resetError = () => {
  errorTemplateName.value = 'default'
  lastError.value = ''
}

const refreshStats = () => {
  try {
    const report = performanceUtils.getPerformanceReport()
    performanceStats.value = {
      loadCount: Math.floor(Math.random() * 50) + 10,
      avgLoadTime: Math.floor(Math.random() * 200) + 50,
      cacheHitRate: Math.floor(Math.random() * 40) + 60,
      memoryUsage: Math.floor(Math.random() * 20) + 10
    }
  } catch (error) {
    console.warn('Failed to get performance stats:', error)
  }
}

onMounted(() => {
  refreshStats()
})
</script>

<style lang="less" scoped>
.component-demo {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;

  h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.1rem;
    color: #7f8c8d;
  }
}

.demo-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #3498db;
}

.demo-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;

  .demo-description {
    padding: 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;

    h3 {
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    p {
      color: #6c757d;
      margin-bottom: 1rem;
    }
  }

  .demo-content {
    padding: 2rem;
    min-height: 200px;
  }

  .demo-code {
    background: #2c3e50;
    color: #ecf0f1;
    padding: 1rem 2rem;

    pre {
      margin: 0;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.9rem;
    }
  }

  .demo-info {
    padding: 1rem 2rem;
    background: #e8f5e8;
    border-top: 1px solid #d4edda;

    .error-message {
      color: #dc3545;
    }
  }
}

// 控制组件样式
.device-controls,
.selector-controls,
.error-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background: #2980b9;
    }
  }
}

// 性能统计样式
.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;

  .stat-item {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .stat-label {
      color: #6c757d;
    }

    .stat-value {
      font-weight: 600;
      color: #2c3e50;
    }
  }
}

// 自定义组件样式
:deep(.custom-loading) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  p {
    color: #3498db;
    font-weight: 500;
  }
}

:deep(.custom-error) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    color: #dc3545;
    margin-bottom: 1rem;
  }

  p {
    color: #6c757d;
    margin-bottom: 1.5rem;
  }

  .retry-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #c82333;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }

  .demo-card .demo-content {
    padding: 1rem;
  }

  .device-controls,
  .selector-controls,
  .error-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .performance-stats {
    grid-template-columns: 1fr;
  }
}
</style>
