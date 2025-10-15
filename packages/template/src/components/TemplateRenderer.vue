<template>
  <div class="ldesign-template-renderer">
    <!-- 加载中 -->
    <div v-if="loading" class="template-loading">
      <slot name="loading">
        <div class="loading-spinner">加载中...</div>
      </slot>
    </div>

    <!-- 错误 -->
    <div v-else-if="error" class="template-error">
      <slot name="error" :error="error">
        <div class="error-message">
          <p>模板加载失败</p>
          <p class="error-detail">{{ error.message }}</p>
          <button @click="handleReload">重新加载</button>
        </div>
      </slot>
    </div>

    <!-- 模板组件 -->
    <component
      v-else-if="component"
      :is="component"
      v-bind="componentProps"
      @[eventName]="handleEvent"
    />

    <!-- 空状态 -->
    <div v-else class="template-empty">
      <slot name="empty">
        <p>暂无模板</p>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useTemplate } from '../composables/useTemplate'
import type { TemplateLoadOptions } from '../types'

/**
 * 组件属性
 */
const props = withDefaults(
  defineProps<{
    /** 模板分类 */
    category: string
    /** 设备类型 */
    device: string
    /** 模板名称 */
    name: string
    /** 传递给模板组件的属性 */
    componentProps?: Record<string, any>
    /** 加载选项 */
    loadOptions?: TemplateLoadOptions
  }>(),
  {
    componentProps: () => ({}),
    loadOptions: undefined,
  }
)

/**
 * 事件
 */
const emit = defineEmits<{
  load: [component: any]
  error: [error: Error]
  reload: []
}>()

/**
 * 使用模板
 */
const { category, device, name } = toRefs(props)
const { component, loading, error, load, reload } = useTemplate(
  category,
  device,
  name,
  props.loadOptions
)

/**
 * 处理重新加载
 */
const handleReload = async () => {
  emit('reload')
  await reload()
}

/**
 * 处理事件转发
 */
const handleEvent = (eventName: string, ...args: any[]) => {
  emit(eventName as any, ...args)
}

/**
 * 事件名称列表（用于 v-on）
 */
const eventName = computed(() => {
  // Vue 3 会自动处理事件转发
  return ''
})
</script>

<style scoped>
.ldesign-template-renderer {
  width: 100%;
  height: 100%;
}

.template-loading,
.template-error,
.template-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 20px;
}

.loading-spinner {
  font-size: 14px;
  color: #666;
}

.error-message {
  text-align: center;
  color: #f56c6c;
}

.error-detail {
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

.error-message button {
  margin-top: 12px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error-message button:hover {
  background: #66b1ff;
}

.template-empty {
  color: #999;
  font-size: 14px;
}
</style>
