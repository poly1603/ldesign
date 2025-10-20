<script setup lang="ts">
import type { ABTestConfig } from '../composables/useTemplateCondition'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useTemplateABTest } from '../composables/useTemplateCondition'
import TemplateRenderer from './TemplateRenderer.vue'
import TemplateSkeleton from './TemplateSkeleton.vue'

/**
 * 组件属性
 */
interface Props {
  /** A/B测试配置 */
  config: ABTestConfig
  /** 用户ID（用于持久化分配） */
  userId?: string
  /** 备用模板（测试未激活时使用） */
  fallbackTemplate?: string
  /** 模板数据 */
  data?: any
  /** 自定义组件 */
  customComponents?: Record<string, any>
  /** 显示骨架屏 */
  showSkeleton?: boolean
  /** 显示调试信息 */
  showDebug?: boolean
  /** 启用骨架屏 */
  enableSkeleton?: boolean
  /** 启用缓存 */
  enableCache?: boolean
  /** 启用重试 */
  enableRetry?: boolean
  /** 启用自动保存 */
  enableAutoSave?: boolean
  /** 启用v-model */
  enableVModel?: boolean
  /** 自动追踪点击 */
  autoTrackClicks?: boolean
  /** 自动追踪渲染 */
  autoTrackRender?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSkeleton: true,
  showDebug: false,
  enableSkeleton: true,
  enableCache: true,
  enableRetry: true,
  enableAutoSave: false,
  enableVModel: false,
  autoTrackClicks: true,
  autoTrackRender: true
})

const emit = defineEmits<{
  (e: 'variant-assigned', variant: any): void
  (e: 'metric', data: { metric: string; value?: any }): void
  (e: 'rendered', data: any): void
  (e: 'error', error: Error): void
  (e: 'save', data: any): void
}>()

// 使用A/B测试
const {
  variant,
  template,
  isActive,
  result,
  runTest,
  trackMetric
} = useTemplateABTest(props.config, props.userId)

// 模板键（用于强制刷新）
const templateKey = ref(0)

// 已追踪的指标 - 限制数组大小防止内存无限增长
const MAX_TRACKED_METRICS = 100
const trackedMetrics = ref<Array<{
  name: string
  value: any
  timestamp: number
}>>([])

/**
 * 追踪指标
 */
const track = (metric: string, value?: any) => {
  trackMetric(metric, value)
  
  // 添加新指标
  trackedMetrics.value.push({
    name: metric,
    value,
    timestamp: Date.now()
  })
  
  // 限制数组大小，移除最旧的指标
  if (trackedMetrics.value.length > MAX_TRACKED_METRICS) {
    trackedMetrics.value.shift()
  }
  
  emit('metric', { metric, value })
}

/**
 * 处理渲染完成
 */
const handleRendered = (data: any) => {
  if (props.autoTrackRender) {
    track('render', { variant: variant.value?.id })
  }
  emit('rendered', data)
}

/**
 * 处理错误
 */
const handleError = (error: Error) => {
  track('error', { 
    variant: variant.value?.id, 
    error: error.message 
  })
  emit('error', error)
}

/**
 * 处理保存
 */
const handleSave = (data: any) => {
  track('save', { variant: variant.value?.id })
  emit('save', data)
}

/**
 * 处理点击
 */
const handleClick = (event: MouseEvent) => {
  if (props.autoTrackClicks) {
    const target = event.target as HTMLElement
    const clickData = {
      variant: variant.value?.id,
      element: target.tagName,
      text: target.textContent?.slice(0, 50)
    }
    track('click', clickData)
  }
}

/**
 * 重新运行测试
 */
const handleRerun = () => {
  const newResult = runTest()
  if (newResult) {
    templateKey.value++
    emit('variant-assigned', newResult.variant)
  }
}

/**
 * 清除缓存
 */
const handleClearCache = () => {
  if (props.userId) {
    const key = `ab-test-${props.config.id}-${props.userId}`
    localStorage.removeItem(key)
  }
  trackedMetrics.value = []
  handleRerun()
}

// 监听配置变化
const configWatcher = watch(() => props.config, () => {
  handleRerun()
}, { deep: true })

// 监听变体分配
const variantWatcher = watch(variant, (newVariant) => {
  if (newVariant) {
    emit('variant-assigned', newVariant)
  }
})

// 初始化
onMounted(() => {
  if (variant.value && props.autoTrackRender) {
    track('initial-render', { variant: variant.value.id })
  }
})

// 清理
onUnmounted(() => {
  // 停止watchers
  configWatcher?.()
  variantWatcher?.()
  
  // 清理追踪的指标
  trackedMetrics.value = []
})
</script>

<template>
  <div class="ab-test-template">
    <!-- 加载状态 -->
    <div v-if="!variant && isActive" class="loading-state">
      <slot name="loading">
        <TemplateSkeleton v-if="showSkeleton" />
        <div v-else class="loading-message">
          正在分配测试变体...
        </div>
      </slot>
    </div>

    <!-- 渲染测试变体模板 -->
    <TemplateRenderer
      v-else-if="template"
      :key="templateKey"
      :template-name="template"
      category="dashboard"
      :data="data"
      :custom-components="customComponents"
      :enable-skeleton="enableSkeleton"
      :enable-cache="enableCache"
      :enable-retry="enableRetry"
      :enable-auto-save="enableAutoSave"
      :enable-v-model="enableVModel"
      @rendered="handleRendered"
      @error="(...args: unknown[]) => handleError(args[0] as Error)"
      @save="handleSave"
      @click="(...args: unknown[]) => handleClick(args[0] as MouseEvent)"
    />

    <!-- 测试未激活或无变体 -->
    <div v-else class="inactive-test">
      <slot name="inactive">
        <TemplateRenderer
          v-if="fallbackTemplate"
          :template-name="fallbackTemplate"
          category="dashboard"
          :data="data"
          :custom-components="customComponents"
          :enable-skeleton="enableSkeleton"
          :enable-cache="enableCache"
          :enable-retry="enableRetry"
          :enable-auto-save="enableAutoSave"
          :enable-v-model="enableVModel"
          @rendered="handleRendered"
          @error="(...args: unknown[]) => handleError(args[0] as Error)"
          @save="handleSave"
        />
        <div v-else class="no-test">
          <slot name="no-test">
            <p>A/B测试未激活</p>
          </slot>
        </div>
      </slot>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebug && result" class="debug-info">
      <h4>A/B测试调试信息</h4>
      <div class="debug-content">
        <div class="test-info">
          <span class="label">测试ID:</span>
          <span class="value">{{ config.id }}</span>
        </div>
        <div class="test-info">
          <span class="label">测试名称:</span>
          <span class="value">{{ config.name || '未命名' }}</span>
        </div>
        <div class="test-info">
          <span class="label">测试状态:</span>
          <span class="value" :class="{ active: isActive }">
            {{ isActive ? '激活' : '未激活' }}
          </span>
        </div>
        <div class="test-info">
          <span class="label">分配策略:</span>
          <span class="value">{{ config.strategy || 'random' }}</span>
        </div>
        <div class="test-info">
          <span class="label">当前变体:</span>
          <span class="value variant">{{ variant?.id || '无' }}</span>
        </div>
        <div class="test-info">
          <span class="label">变体模板:</span>
          <span class="value">{{ variant?.template || '无' }}</span>
        </div>
        <div class="test-info">
          <span class="label">变体权重:</span>
          <span class="value">{{ variant?.weight || 0 }}</span>
        </div>
        <div class="test-info">
          <span class="label">分配时间:</span>
          <span class="value">
            {{ result ? new Date(result.timestamp).toLocaleString() : '未分配' }}
          </span>
        </div>
        <div class="test-info">
          <span class="label">分配原因:</span>
          <span class="value">{{ result?.reason || '无' }}</span>
        </div>
        
        <!-- 变体列表 -->
        <div class="variants-list">
          <h5>所有变体</h5>
          <div v-for="v in config.variants" :key="v.id" class="variant-item" :class="{ current: v.id === variant?.id }">
            <span class="variant-id">{{ v.id }}</span>
            <span class="variant-template">{{ v.template }}</span>
            <span class="variant-weight">权重: {{ v.weight }}</span>
          </div>
        </div>

        <!-- 指标追踪 -->
        <div v-if="trackedMetrics.length > 0" class="metrics-list">
          <h5>已追踪指标</h5>
          <div v-for="(metric, index) in trackedMetrics" :key="index" class="metric-item">
            <span class="metric-name">{{ metric.name }}</span>
            <span class="metric-value">{{ metric.value }}</span>
            <span class="metric-time">{{ new Date(metric.timestamp).toLocaleTimeString() }}</span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="debug-actions">
          <button class="debug-btn" @click="handleRerun">
            重新运行测试
          </button>
          <button class="debug-btn" @click="handleClearCache">
            清除缓存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ab-test-template {
  position: relative;
}

.loading-state {
  padding: 20px;
  text-align: center;
}

.loading-message {
  color: #666;
  font-size: 14px;
  padding: 20px;
}

.inactive-test {
  min-height: 100px;
}

.no-test {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px dashed #ddd;
}

.no-test p {
  margin: 0;
  font-size: 14px;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
}

.debug-info h4 {
  margin: 0 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dee2e6;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.debug-info h5 {
  margin: 15px 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

.debug-content {
  font-family: 'Consolas', 'Monaco', monospace;
}

.test-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 5px 8px;
  background: white;
  border-radius: 3px;
}

.test-info .label {
  flex: 0 0 100px;
  font-weight: 600;
  color: #666;
}

.test-info .value {
  flex: 1;
  color: #333;
}

.test-info .value.active {
  color: #28a745;
  font-weight: 600;
}

.test-info .value.variant {
  color: #007bff;
  font-weight: 600;
}

.variants-list {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.variant-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding: 8px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 3px;
  transition: all 0.2s;
}

.variant-item.current {
  background: #e3f2fd;
  border-color: #2196f3;
}

.variant-id {
  flex: 0 0 100px;
  font-weight: 600;
  color: #555;
}

.variant-template {
  flex: 1;
  color: #333;
}

.variant-weight {
  flex: 0 0 80px;
  text-align: right;
  color: #666;
  font-size: 11px;
}

.metrics-list {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.metric-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  padding: 6px 8px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 3px;
  font-size: 11px;
}

.metric-name {
  flex: 0 0 80px;
  font-weight: 600;
  color: #856404;
}

.metric-value {
  flex: 1;
  color: #333;
  word-break: break-all;
}

.metric-time {
  flex: 0 0 80px;
  text-align: right;
  color: #666;
}

.debug-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.debug-btn {
  flex: 1;
  padding: 8px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-btn:hover {
  background: #0056b3;
}

.debug-btn:active {
  transform: scale(0.95);
}
</style>