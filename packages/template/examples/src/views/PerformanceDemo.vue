<script setup lang="ts">
import { LazyTemplate, PerformanceMonitor, TemplateRenderer } from '@ldesign/template/vue'
import { onMounted, ref } from 'vue'

// 性能数据
const performanceData = ref<any>({})
const isMonitorVisible = ref(true)

// 模拟大量模板数据
const templateList = ref(
  Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    category: 'login',
    device: 'desktop' as const,
    template: i % 2 === 0 ? 'modern' : 'default',
    name: `模板 ${i + 1}`,
  })),
)

// 性能指标
const metrics = ref({
  loadTime: 0,
  renderTime: 0,
  memoryUsage: 0,
  cacheHitRate: 0,
})

// 处理性能更新
function handlePerformanceUpdate(data: any) {
  performanceData.value = data

  if (data.templates) {
    const total = data.templates.cacheHits + data.templates.cacheMisses
    metrics.value.cacheHitRate = total > 0 ? Math.round((data.templates.cacheHits / total) * 100) : 0
  }

  if (data.memory) {
    metrics.value.memoryUsage = data.memory.percentage
  }
}

// 处理加载事件
function handleLoadStart() {
  metrics.value.loadTime = performance.now()
}

function handleLoadEnd(event: any) {
  metrics.value.renderTime = event.renderTime
  metrics.value.loadTime = performance.now() - metrics.value.loadTime
}

// 预加载演示
async function preloadTemplates() {
  console.log('开始预加载模板...')
  // 这里应该调用模板管理器的预加载方法
  // await manager.preloadCommonTemplates()
}

onMounted(() => {
  console.log('🚀 性能演示页面加载完成')
})
</script>

<template>
  <div class="performance-demo">
    <div class="demo-header">
      <h1>🚀 性能优化演示</h1>
      <p>体验模板系统的性能优化功能，包括懒加载、预加载、虚拟滚动和实时监控。</p>
    </div>

    <!-- 性能监控面板 -->
    <div class="demo-section">
      <h2>📊 实时性能监控</h2>
      <div class="monitor-controls">
        <button class="btn" @click="isMonitorVisible = !isMonitorVisible">
          {{ isMonitorVisible ? '隐藏' : '显示' }}监控面板
        </button>
        <button class="btn btn-primary" @click="preloadTemplates">
          预加载模板
        </button>
      </div>

      <div v-if="isMonitorVisible" class="monitor-panel">
        <PerformanceMonitor :detailed="true" :update-interval="1000" @update="handlePerformanceUpdate" />
      </div>

      <!-- 性能指标卡片 -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon">
            ⚡
          </div>
          <div class="metric-value">
            {{ metrics.renderTime.toFixed(1) }}ms
          </div>
          <div class="metric-label">
            渲染时间
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">
            🎯
          </div>
          <div class="metric-value">
            {{ metrics.cacheHitRate }}%
          </div>
          <div class="metric-label">
            缓存命中率
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">
            💾
          </div>
          <div class="metric-value">
            {{ metrics.memoryUsage }}%
          </div>
          <div class="metric-label">
            内存使用率
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon">
            ⏱️
          </div>
          <div class="metric-value">
            {{ metrics.loadTime.toFixed(1) }}ms
          </div>
          <div class="metric-label">
            加载时间
          </div>
        </div>
      </div>
    </div>

    <!-- 懒加载演示 -->
    <div class="demo-section">
      <h2>🔄 懒加载演示</h2>
      <p>滚动查看懒加载效果，模板只在进入可视区域时才会加载。</p>

      <div class="lazy-demo-container">
        <div v-for="item in templateList.slice(0, 10)" :key="item.id" class="lazy-item">
          <h3>{{ item.name }}</h3>
          <LazyTemplate
            :category="item.category"
            :device="item.device"
            :template="item.template"
            :lazy="true"
            :placeholder-height="200"
            root-margin="50px"
            @load="() => console.log(`模板 ${item.id} 加载完成`)"
            @visible="() => console.log(`模板 ${item.id} 进入可视区域`)"
          >
            <template #loading>
              <div class="loading-placeholder">
                <div class="loading-spinner" />
                <p>正在加载模板...</p>
              </div>
            </template>

            <template #error="{ error, retry }">
              <div class="error-placeholder">
                <p>❌ 加载失败: {{ error.message }}</p>
                <button class="btn btn-small" @click="retry">
                  重试
                </button>
              </div>
            </template>

            <template #placeholder>
              <div class="skeleton-placeholder">
                <div class="skeleton-line" />
                <div class="skeleton-line" />
                <div class="skeleton-line short" />
              </div>
            </template>
          </LazyTemplate>
        </div>
      </div>
    </div>

    <!-- 性能对比演示 -->
    <div class="demo-section">
      <h2>⚖️ 性能对比</h2>
      <div class="comparison-grid">
        <div class="comparison-item">
          <h3>普通渲染</h3>
          <TemplateRenderer
            category="login"
            template-id="default"
            device-type="desktop"
            @load-start="handleLoadStart"
            @load-end="handleLoadEnd"
          />
        </div>

        <div class="comparison-item">
          <h3>性能优化渲染</h3>
          <TemplateRenderer
            category="login"
            template-id="modern"
            device-type="desktop"
            :lazy="true"
            :preload="true"
            :enable-performance-monitor="true"
            @load-start="handleLoadStart"
            @load-end="handleLoadEnd"
            @performance-update="handlePerformanceUpdate"
          />
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="demo-section">
      <h2>📖 使用说明</h2>
      <div class="usage-tips">
        <div class="tip">
          <h4>💡 懒加载</h4>
          <p>使用 <code>LazyTemplate</code> 组件实现按需加载，减少初始加载时间。</p>
        </div>
        <div class="tip">
          <h4>🚀 预加载</h4>
          <p>通过预加载常用模板，提升用户体验和响应速度。</p>
        </div>
        <div class="tip">
          <h4>📊 性能监控</h4>
          <p>实时监控 FPS、内存使用、缓存命中率等关键指标。</p>
        </div>
        <div class="tip">
          <h4>🎯 智能缓存</h4>
          <p>自动缓存已加载的模板，避免重复加载。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.performance-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.demo-header {
  text-align: center;
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    color: #333;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #666;
    line-height: 1.6;
  }
}

.demo-section {
  margin-bottom: 60px;

  h2 {
    font-size: 24px;
    color: #333;
    margin-bottom: 20px;
    border-bottom: 2px solid #667eea;
    padding-bottom: 8px;
  }
}

.monitor-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f5f5f5;
  }

  &.btn-primary {
    background: #667eea;
    color: white;
    border-color: #667eea;

    &:hover {
      background: #5a6fd8;
    }
  }

  &.btn-small {
    padding: 4px 8px;
    font-size: 12px;
  }
}

.monitor-panel {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.metric-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .metric-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .metric-value {
    font-size: 24px;
    font-weight: bold;
    color: #667eea;
    margin-bottom: 4px;
  }

  .metric-label {
    font-size: 14px;
    color: #666;
  }
}

.lazy-demo-container {
  max-height: 600px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.lazy-item {
  margin-bottom: 30px;

  h3 {
    margin-bottom: 10px;
    color: #333;
  }
}

.loading-placeholder,
.error-placeholder,
.skeleton-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #ddd;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.skeleton-line {
  height: 16px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-bottom: 8px;
  width: 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;

  &.short {
    width: 60%;
  }
}

@keyframes skeleton-loading {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 30px;
}

.comparison-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;

  h3 {
    margin-bottom: 16px;
    color: #333;
    text-align: center;
  }
}

.usage-tips {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.tip {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  h4 {
    margin-bottom: 8px;
    color: #333;
  }

  p {
    font-size: 14px;
    color: #666;
    line-height: 1.5;
    margin: 0;
  }

  code {
    background: #f1f3f4;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 12px;
  }
}
</style>
