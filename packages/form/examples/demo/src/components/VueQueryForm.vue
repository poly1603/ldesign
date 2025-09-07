<template>
  <div ref="containerRef" class="vue-query-form">
    <!-- 渲染每一行 -->
    <div
      v-for="row in maxRows"
      :key="row"
      class="query-row"
      :class="{ 'has-buttons': shouldButtonsInRow && row === lastVisibleRow }"
      :style="{
        display: 'grid',
        gridTemplateColumns: generateGridTemplate(dynamicColumns)
      }"
    >
      <!-- 渲染该行的字段 -->
      <div
        v-for="field in getFieldsByRow(row)"
        :key="field.name"
        class="form-field"
      >
        <label class="field-label">{{ field.label }}</label>
        <select
          v-if="field.type === 'select'"
          v-model="formData[field.name]"
          class="form-input"
        >
          <option
            v-for="option in field.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <input
          v-else
          v-model="formData[field.name]"
          type="text"
          class="form-input"
          :placeholder="field.placeholder || `请输入${field.label}`"
        />
      </div>

      <!-- 在最后可见行且满足条件时显示按钮组 -->
      <div
        v-if="shouldButtonsInRow && row === lastVisibleRow"
        class="form-buttons buttons-in-row"
        :class="`buttons-${config.actionAlign}`"
        :style="generateButtonGridStyle(layoutResult.buttonGridColumn)"
      >
        <button class="form-button primary" @click="handleQuery">查询</button>
        <button class="form-button secondary" @click="handleReset">重置</button>
        <button
          v-if="config.collapsible && originalMaxRows > config.defaultRowCount"
          class="form-button outline"
          @click="handleToggle"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </button>
      </div>
    </div>

    <!-- 独立按钮行（当不在行内显示时） -->
    <div
      v-if="!shouldButtonsInRow"
      class="query-row button-row"
      :class="config.actionPosition === 'newline' ? 'buttons-newline' : ''"
      :style="{ gridTemplateColumns: generateGridTemplate(dynamicColumns) }"
    >
      <div
        class="form-buttons"
        :class="`buttons-${config.actionAlign}`"
        :style="generateButtonGridStyle(layoutResult.buttonGridColumn)"
      >
        <button class="form-button primary" @click="handleQuery">查询</button>
        <button class="form-button secondary" @click="handleReset">重置</button>
        <button
          v-if="config.collapsible && originalMaxRows > config.defaultRowCount"
          class="form-button outline"
          @click="handleToggle"
        >
          {{ isExpanded ? '收起' : '展开' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  calculateFormLayout,
  createResizeObserver,
  debounce,
  getAvailableWidth,
  generateGridTemplate,
  generateButtonGridStyle,
  type FormConfig,
  type FieldConfig
} from '../utils/formLayoutUtils'
import { createStateSnapshot } from '../utils/formConsistencyChecker'

// 定义 props
const props = defineProps<{
  config: FormConfig
  fields: FieldConfig[]
}>()

// 定义 emits
const emit = defineEmits<{
  toggle: [expanded: boolean]
  query: [formData: Record<string, any>]
  reset: []
  layoutUpdate: [visibleRows: number, dynamicColumns: number, containerWidth: number]
}>()

// 响应式数据
const isExpanded = ref(false)
const formData = reactive<Record<string, string>>({})
const dynamicColumns = ref(4)
const containerWidth = ref(800)
const containerRef = ref<HTMLElement>()

// ResizeObserver实例
let resizeObserver: ResizeObserver | null = null

// 计算属性
const layoutResult = computed(() => {
  return calculateFormLayout(
    props.config,
    props.fields,
    isExpanded.value,
    containerWidth.value
  )
})

const visibleFields = computed(() => {
  const maxVisible = layoutResult.value.maxVisibleFields
  return props.fields.slice(0, maxVisible)
})

const maxRows = computed(() => {
  const dynamicColumns = layoutResult.value.dynamicColumns
  return Math.ceil(visibleFields.value.length / dynamicColumns)
})

const originalMaxRows = computed(() => {
  return Math.max(...props.fields.map(f => f.row))
})

const visibleRows = computed(() => layoutResult.value.visibleRows)
const fieldVisibleRows = computed(() => layoutResult.value.fieldVisibleRows)
const shouldButtonsInRow = computed(() => layoutResult.value.shouldButtonsInRow)
const lastVisibleRow = computed(() => maxRows.value)

// 方法
const getFieldsByRow = (row: number): FieldConfig[] => {
  const dynamicColumns = layoutResult.value.dynamicColumns
  const startIndex = (row - 1) * dynamicColumns
  const endIndex = startIndex + dynamicColumns
  return visibleFields.value.slice(startIndex, endIndex)
}

const handleQuery = () => {
  console.log('Vue组件查询表单提交:', formData)
  emit('query', { ...formData })
}

const handleReset = () => {
  console.log('Vue组件查询表单重置')
  // 重置表单数据
  Object.keys(formData).forEach(key => {
    formData[key] = ''
  })
  emit('reset')
}

const handleToggle = () => {
  isExpanded.value = !isExpanded.value
  console.log('Vue组件表单展开状态:', isExpanded.value ? '展开' : '收起')
  emit('toggle', isExpanded.value)
}

// 更新容器宽度和布局
const updateContainerWidth = debounce(() => {
  if (!containerRef.value) return

  const availableWidth = getAvailableWidth(containerRef.value)
  containerWidth.value = availableWidth
  dynamicColumns.value = layoutResult.value.dynamicColumns
}, 100)

// 设置ResizeObserver
const setupResizeObserver = () => {
  if (!containerRef.value) return

  resizeObserver = createResizeObserver(containerRef.value, updateContainerWidth)
}

// 监听配置变化，重置展开状态
watch(() => props.config, () => {
  isExpanded.value = false
}, { deep: true })

// 监听布局变化，通知父组件
watch(
  [visibleRows, dynamicColumns, containerWidth],
  ([newVisibleRows, newDynamicColumns, newContainerWidth]) => {
    emit('layoutUpdate', newVisibleRows, newDynamicColumns, newContainerWidth)
  },
  { immediate: true }
)

// 监听布局结果变化，更新动态列数
watch(layoutResult, (newResult) => {
  dynamicColumns.value = newResult.dynamicColumns

  // 调试信息和状态快照
  const stateSnapshot = createStateSnapshot(
    'Vue组件',
    isExpanded.value,
    newResult.visibleRows,
    maxRows.value,
    containerWidth.value,
    newResult.dynamicColumns,
    props.config,
    props.fields,
    newResult
  )

  console.log('Vue组件布局计算结果:', stateSnapshot)

  // 将状态快照存储到全局，供一致性检查使用
  ;(window as any).vueFormState = stateSnapshot
}, { immediate: true })

// 组件挂载后设置ResizeObserver
onMounted(() => {
  nextTick(() => {
    setupResizeObserver()
    updateContainerWidth()
  })
})

// 组件卸载时清理ResizeObserver
onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

// 初始化表单数据
props.fields.forEach(field => {
  if (!(field.name in formData)) {
    formData[field.name] = ''
  }
})
</script>

<style scoped>
.vue-query-form {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
}

.query-row {
  display: grid;
  /* 动态列数通过内联样式设置，移除硬编码 */
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-margin-base);
  align-items: end;
}

.query-row:last-child {
  margin-bottom: 0;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.field-label {
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  color: var(--ldesign-text-color-primary);
  margin: 0;
}

.form-input {
  height: var(--ls-input-height-medium);
  padding: 0 var(--ls-padding-sm);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-primary);
  background-color: var(--ldesign-bg-color-component);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

.form-input::placeholder {
  color: var(--ldesign-text-color-placeholder);
}

/* 按钮组样式 */
.form-buttons {
  display: flex;
  gap: var(--ls-spacing-xs);
  align-items: center;
}

.form-buttons.buttons-left {
  justify-content: flex-start;
}

.form-buttons.buttons-center {
  justify-content: center;
}

.form-buttons.buttons-right {
  justify-content: flex-end;
}

.form-buttons.buttons-in-row {
  grid-column: 4 / -1;
  margin: 0;
}

.button-row .form-buttons {
  grid-column: 1 / -1;
}

.buttons-newline .form-buttons {
  margin-top: var(--ls-margin-lg);
}

.form-button {
  height: var(--ls-button-height-medium);
  padding: 0 var(--ls-padding-base);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.form-button.primary {
  background-color: var(--ldesign-brand-color);
  color: var(--ldesign-font-white-1);
  border-color: var(--ldesign-brand-color);
}

.form-button.primary:hover {
  background-color: var(--ldesign-brand-color-hover);
  border-color: var(--ldesign-brand-color-hover);
}

.form-button.secondary {
  background-color: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);
}

.form-button.secondary:hover {
  border-color: var(--ldesign-brand-color);
  color: var(--ldesign-brand-color);
}

.form-button.outline {
  background-color: transparent;
  color: var(--ldesign-brand-color);
  border-color: var(--ldesign-brand-color);
}

.form-button.outline:hover {
  background-color: var(--ldesign-brand-color-focus);
}
</style>
