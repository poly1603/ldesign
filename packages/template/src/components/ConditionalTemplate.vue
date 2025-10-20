<script setup lang="ts">
import type { TemplateCondition, TemplateContext } from '../composables/useTemplateCondition'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useTemplateCondition } from '../composables/useTemplateCondition'
import TemplateRenderer from './TemplateRenderer.vue'
import TemplateSkeleton from './TemplateSkeleton.vue'

/**
 * 组件属性
 */
interface Props {
  /** 条件列表 */
  conditions?: TemplateCondition[]
  /** 上下文 */
  context?: TemplateContext
  /** 默认模板 */
  defaultTemplate?: string
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
  /** 强制刷新键 */
  forceRefreshKey?: number
}

const props = withDefaults(defineProps<Props>(), {
  conditions: () => [],
  context: () => ({}),
  showSkeleton: true,
  showDebug: false,
  enableSkeleton: true,
  enableCache: true,
  enableRetry: true,
  enableAutoSave: false,
  enableVModel: false,
  forceRefreshKey: 0
})

const emit = defineEmits<{
  (e: 'templateSelected', template: string | null): void
  (e: 'rendered', data: any): void
  (e: 'error', ...args: unknown[]): void
  (e: 'save', data: any): void
  (e: 'evaluationComplete', template: string | null): void
}>()

// 使用条件渲染
const {
  selectedTemplate,
  evaluating,
  lastEvaluation,
  context,
  // selectTemplate, // Removing unused variable
  reevaluate
} = useTemplateCondition(props.conditions, props.context)

// 模板键（用于强制刷新）
const templateKey = ref(0)

/**
 * 处理重新评估
 */
const handleReevaluate = async () => {
  const template = await reevaluate()
  templateKey.value++
  emit('evaluationComplete', template)
}

/**
 * 处理渲染完成
 */
const handleRendered = (data: any) => {
  emit('rendered', data)
}

/**
 * 处理错误
 */
const handleError = (error: Error) => {
  emit('error', error)
}

/**
 * 处理保存
 */
const handleSave = (data: any) => {
  emit('save', data)
}

// 存储watchers以便清理
const watchers: Array<() => void> = []

// 监听条件变化
watchers.push(
  watch(() => props.conditions, async (_newConditions) => {
    // 重新设置条件并评估
    await handleReevaluate()
  }, { deep: true })
)

// 监听上下文变化
watchers.push(
  watch(() => props.context, (newContext) => {
    context.value = newContext
  }, { deep: true })
)

// 监听强制刷新键
watchers.push(
  watch(() => props.forceRefreshKey, () => {
    templateKey.value++
  })
)

// 监听选中模板变化
watchers.push(
  watch(selectedTemplate, (template) => {
    emit('templateSelected', template)
  })
)

// 初始化
onMounted(() => {
  // 如果初始上下文不同，更新它
  if (props.context && Object.keys(props.context).length > 0) {
    context.value = props.context
  }
})

// 清理
onUnmounted(() => {
  // 停止所有watchers
  watchers.forEach(unwatch => unwatch())
  watchers.length = 0
})
</script>

<template>
  <div class="conditional-template">
    <!-- 加载状态 -->
    <div v-if="evaluating && !selectedTemplate" class="loading-state">
      <slot name="loading">
        <TemplateSkeleton v-if="showSkeleton" />
        <div v-else class="evaluating-message">
          正在选择最佳模板...
        </div>
      </slot>
    </div>

    <!-- 渲染选中的模板 -->
    <TemplateRenderer
      v-else-if="selectedTemplate"
      :key="templateKey"
      :template-name="selectedTemplate"
      category="dashboard"
      :data="data"
      :custom-components="customComponents"
      :enable-skeleton="enableSkeleton"
      :enable-cache="enableCache"
      :enable-retry="enableRetry"
      :enable-auto-save="enableAutoSave"
      :enable-v-model="enableVModel"
      @rendered="handleRendered"
      @error="handleError"
      @save="handleSave"
    />

    <!-- 默认内容（无匹配模板） -->
    <div v-else class="default-content">
      <slot name="default">
        <TemplateRenderer
          v-if="defaultTemplate"
          :template-name="defaultTemplate"
          category="dashboard"
          :data="data"
          :custom-components="customComponents"
          :enable-skeleton="enableSkeleton"
          :enable-cache="enableCache"
          :enable-retry="enableRetry"
          :enable-auto-save="enableAutoSave"
          :enable-v-model="enableVModel"
          @rendered="handleRendered"
          @error="handleError"
          @save="handleSave"
        />
        <div v-else class="no-template">
          <slot name="no-template">
            <p>没有匹配的模板</p>
          </slot>
        </div>
      </slot>
    </div>

    <!-- 调试信息 -->
    <div v-if="showDebug" class="debug-info">
      <h4>条件渲染调试信息</h4>
      <div class="debug-content">
        <div>选中模板: {{ selectedTemplate || '无' }}</div>
        <div>评估时间: {{ lastEvaluation?.toLocaleString() || '未评估' }}</div>
        <div>当前上下文:</div>
        <pre>{{ JSON.stringify(context, null, 2) }}</pre>
        <div>条件列表:</div>
        <ul>
          <li v-for="(condition, index) in conditions" :key="index">
            {{ condition.description || condition.id || `条件 ${index + 1}` }}
            - 模板: {{ condition.template }}
            - 优先级: {{ condition.priority || 0 }}
            - 状态: {{ condition.enabled !== false ? '启用' : '禁用' }}
          </li>
        </ul>
      </div>
      <button class="reevaluate-btn" @click="handleReevaluate">
        重新评估条件
      </button>
    </div>
  </div>
</template>

<style scoped>
.conditional-template {
  position: relative;
}

.loading-state {
  padding: 20px;
  text-align: center;
}

.evaluating-message {
  color: #666;
  font-size: 14px;
  padding: 20px;
}

.default-content {
  min-height: 100px;
}

.no-template {
  padding: 40px;
  text-align: center;
  color: #999;
  background: #f5f5f5;
  border-radius: 4px;
  border: 1px dashed #ddd;
}

.no-template p {
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
}

.debug-content {
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.6;
}

.debug-content > div {
  margin-bottom: 10px;
}

.debug-content pre {
  margin: 5px 0;
  padding: 10px;
  background: white;
  border: 1px solid #e1e4e8;
  border-radius: 3px;
  overflow-x: auto;
  font-size: 11px;
}

.debug-content ul {
  margin: 5px 0;
  padding-left: 20px;
  list-style: none;
}

.debug-content li {
  margin-bottom: 5px;
  padding: 5px 8px;
  background: white;
  border-left: 3px solid #007bff;
  border-radius: 2px;
}

.reevaluate-btn {
  margin-top: 10px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.reevaluate-btn:hover {
  background: #0056b3;
}

.reevaluate-btn:active {
  transform: scale(0.95);
}
</style>