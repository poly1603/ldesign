<!--
  LDesignQueryForm 查询表单组件
  
  @description
  专门用于查询场景的表单组件，支持展开/收起、智能按钮布局等功能
-->

<template>
  <div :class="queryFormClasses">
    <!-- 顶部标题（titlePosition = 'top'） -->
    <div
      v-if="title && titlePosition === 'top'"
      class="ldesign-query-form__title ldesign-query-form__title--top"
    >
      {{ title }}
    </div>

    <form
      :class="formClasses"
      @submit.prevent="handleSubmit"
      @reset.prevent="handleReset"
    >
      <FormProvider :form="form">
        <!-- 布局容器：用于支持左侧标题布局 -->
        <div class="ldesign-query-form__body" :class="{ 'ldesign-query-form__body--title-left': title && titlePosition === 'left' }">
          <!-- 左侧标题（titlePosition = 'left'） -->
          <div
            v-if="title && titlePosition === 'left'"
            class="ldesign-query-form__title ldesign-query-form__title--left"
          >
            {{ title }}
          </div>

          <!-- 表单字段网格容器 -->
          <div
            ref="gridContainer"
            :class="gridClasses"
            :style="gridStyles"
          >
            <!-- 表单字段插槽 -->
            <template v-for="(item, index) in visibleFields" :key="item.key || index">
              <div
                :class="getFieldItemClasses(item, index)"
                :style="getFieldItemStyles(item)"
              >
                <slot
                  :name="item.slot || 'field'"
                  :item="item"
                  :index="index"
                  :field="getField(item.name)"
                >
                  <LDesignFormItem
                    :name="item.name"
                    :label="item.label"
                    :required="item.required"
                    :rules="item.rules"
                    :help="item.help"
                    :disabled="item.disabled || disabled"
                    :readonly="item.readonly || readonly"
                    :size="item.size || size"
                    :label-position="labelPosition"
                    :label-align="labelAlign"
                    :label-width="computedLabelWidth"
                  >
                    <template #default="{ field, value, setValue }">
                      <slot
                        :name="`field-${item.name}`"
                        :item="item"
                        :field="field"
                        :value="value"
                        :setValue="setValue"
                      >
                        <!-- 默认渲染逻辑 -->
                        <component
                          v-if="item.component"
                          :is="item.component"
                          v-bind="item.props"
                          :value="value"
                          @update:value="setValue"
                        />
                        <!-- 根据类型渲染输入控件 -->
                        <input
                          v-else-if="item.type === 'text' || item.type === 'email'"
                          :type="item.type"
                          :placeholder="item.placeholder"
                          :value="value"
                          @input="setValue($event.target.value)"
                          class="ldesign-input"
                        />
                        <select
                          v-else-if="item.type === 'select'"
                          :value="value"
                          @change="setValue($event.target.value)"
                          class="ldesign-select"
                        >
                          <option value="">{{ item.placeholder || '请选择' }}</option>
                          <option
                            v-for="option in item.options"
                            :key="option.value"
                            :value="option.value"
                          >
                            {{ option.label }}
                          </option>
                        </select>
                      </slot>
                    </template>
                  </LDesignFormItem>
                </slot>
              </div>
            </template>

            <!-- 按钮组 -->
            <div
              :class="actionClasses"
              :style="actionStyles"
            >
              <div class="ldesign-query-form__actions-content">
                <!-- 主要操作按钮 -->
                <div class="ldesign-query-form__primary-actions">
                  <slot name="actions" :form="form" :collapsed="collapsed">
                    <button
                      type="submit"
                      :class="['ldesign-btn', 'ldesign-btn--primary']"
                      :disabled="isPending"
                    >
                      {{ submitText }}
                    </button>
                    <button
                      type="button"
                      :class="['ldesign-btn', 'ldesign-btn--default']"
                      @click="handleReset"
                    >
                      {{ resetText }}
                    </button>
                  </slot>
                </div>

                <!-- 展开/收起按钮 -->
                <div
                  v-if="showCollapseButton"
                  class="ldesign-query-form__collapse-actions"
                >
                  <button
                    type="button"
                    :class="['ldesign-btn', 'ldesign-btn--text']"
                    @click="toggleCollapse"
                  >
                    <span>{{ collapsed ? expandText : collapseText }}</span>
                    <svg
                      :class="['ldesign-query-form__collapse-icon', { 'is-expanded': !collapsed }]"
                      viewBox="0 0 16 16"
                      width="16"
                      height="16"
                    >
                      <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormProvider>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick, markRaw, type PropType } from 'vue'
import { useForm } from '../hooks/useForm'
import { useField } from '../hooks/useField'
import FormProvider from './FormProvider.vue'
import LDesignFormItem from './LDesignFormItem.vue'
import type {
  LDesignQueryFormProps,
  LDesignQueryFormEmits,
  LDesignQueryFormExpose,
  QueryFormField,
  QueryFormBreakpoints,
  LabelPosition
} from './types'

// === 默认断点配置（使用 markRaw 优化，避免不必要的响应式） ===
const DEFAULT_BREAKPOINTS: QueryFormBreakpoints = markRaw({
  xs: 1,   // < 576px
  sm: 2,   // >= 576px
  md: 3,   // >= 768px
  lg: 4,   // >= 992px
  xl: 5,   // >= 1200px
  xxl: 6   // >= 1400px
})

// === Props 定义 ===
const props = withDefaults(defineProps<LDesignQueryFormProps>(), {
  layout: 'horizontal',
  labelPosition: 'left',
  labelAlign: 'right',
  labelWidth: '100px',
  size: 'medium',
  collapsed: true,
  defaultRowCount: 1,
  colCount: 4,
  gutter: 16,
  submitText: '查询',
  resetText: '重置',
  expandText: '展开',
  collapseText: '收起',
  showCollapseButton: true,
  actionPosition: 'auto',
  actionAlign: 'left',
  responsive: true,
  breakpoints: () => ({}),
  titlePosition: 'top'
})

// === Emits 定义 ===
const emit = defineEmits<LDesignQueryFormEmits>()

// === 响应式数据 ===
const gridContainer = ref<HTMLElement>()
const collapsed = ref(props.collapsed)
const isPending = ref(false)
const containerWidth = ref(0)
const currentColCount = ref(props.colCount)
const labelWidthMap = ref<Map<number, string>>(new Map()) // 存储每列的最大标题宽度

// === 响应式断点配置 ===
const mergedBreakpoints = computed(() => ({
  ...DEFAULT_BREAKPOINTS,
  ...props.breakpoints
}))

// === 响应式列数计算 ===
const computedColCount = computed(() => {
  if (!props.responsive) {
    return props.colCount
  }

  const breakpoints = mergedBreakpoints.value
  const width = containerWidth.value

  // 智能列数计算：基于断点和容器宽度
  let targetColCount: number

  if (width >= 1400) {
    targetColCount = breakpoints.xxl
  } else if (width >= 1200) {
    targetColCount = breakpoints.xl
  } else if (width >= 992) {
    targetColCount = breakpoints.lg
  } else if (width >= 768) {
    targetColCount = breakpoints.md
  } else if (width >= 576) {
    targetColCount = breakpoints.sm
  } else {
    targetColCount = breakpoints.xs
  }

  // 确保列数不超过字段数量（避免空列）
  if (props.fields && props.fields.length > 0) {
    targetColCount = Math.min(targetColCount, props.fields.length)
  }

  // 确保列数至少为1
  return Math.max(1, targetColCount)
})

// === 标题宽度计算 ===
const computedLabelWidth = computed(() => {
  if (props.labelPosition === 'top') {
    return 'auto' // 顶部标题不需要固定宽度
  }

  // 左侧标题模式：计算每列的最大标题宽度
  if (props.labelWidth && typeof props.labelWidth === 'string') {
    return props.labelWidth
  }

  if (props.labelWidth && typeof props.labelWidth === 'number') {
    return `${props.labelWidth}px`
  }

  return '100px' // 默认宽度
})

// === 字段项样式计算 ===
const getFieldItemStyles = (item: QueryFormField, index?: number) => {
  const styles: Record<string, any> = {}

  // 处理字段跨列
  const span = item.span || 1
  if (span > 1) {
    styles.gridColumn = `span ${span}`
  }

  // 如果是左侧标题模式，需要设置标题宽度
  if (props.labelPosition === 'left') {
    const colIndex = index !== undefined ? index % computedColCount.value : 0
    const labelWidth = labelWidthMap.value.get(colIndex) || computedLabelWidth.value

    styles['--label-width'] = labelWidth
  }

  return styles
}

// === ResizeObserver 监听容器宽度变化 ===
let resizeObserver: ResizeObserver | null = null
let resizeTimer: number | null = null

const initResizeObserver = () => {
  if (!props.responsive || !gridContainer.value) return

  resizeObserver = new ResizeObserver((entries) => {
    // 防抖处理，避免频繁触发重新计算
    if (resizeTimer) {
      clearTimeout(resizeTimer)
    }

    resizeTimer = window.setTimeout(() => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width
        // 只有宽度变化超过阈值时才更新，避免微小变化导致的重新计算
        if (Math.abs(newWidth - containerWidth.value) > 10) {
          containerWidth.value = newWidth
        }
      }
      resizeTimer = null
    }, 100) // 100ms 防抖延迟
  })

  resizeObserver.observe(gridContainer.value)

  // 初始化时立即获取容器宽度
  const rect = gridContainer.value.getBoundingClientRect()
  containerWidth.value = rect.width
}

const destroyResizeObserver = () => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }

  if (resizeTimer) {
    clearTimeout(resizeTimer)
    resizeTimer = null
  }
}

// === 表单实例 ===
const form = useForm({
  initialValues: props.initialValues,
  defaultValues: props.defaultValues
})

// === 计算属性 ===
const queryFormClasses = computed(() => [
  'ldesign-query-form',
  `ldesign-query-form--${props.layout}`,
  `ldesign-query-form--${props.size}`,
  {
    'ldesign-query-form--collapsed': collapsed.value,
    'ldesign-query-form--expanded': !collapsed.value,
    'ldesign-query-form--disabled': props.disabled,
    'ldesign-query-form--readonly': props.readonly
  }
])

const formClasses = computed(() => [
  'ldesign-form',
  'ldesign-query-form__form'
])

const gridClasses = computed(() => [
  'ldesign-query-form__grid',
  `ldesign-query-form__grid--cols-${computedColCount.value}`,
  {
    'ldesign-query-form__grid--responsive': props.responsive
  }
])

const gridStyles = computed(() => ({
  gap: `${props.gutter}px`,
  gridTemplateColumns: `repeat(${computedColCount.value}, 1fr)`
}))

// 布局计算结果（合并相关计算，避免重复计算）
const layoutComputed = computed(() => {
  const fields = props.fields
  if (!fields?.length) {
    return {
      visibleFields: [],
      shouldActionInline: false,
      totalFields: 0,
      maxVisibleFields: 0
    }
  }

  const colCount = computedColCount.value
  const isCollapsed = collapsed.value
  const actionPos = props.actionPosition

  // 计算最大可见字段数量
  let maxVisibleFields: number
  if (isCollapsed) {
    maxVisibleFields = props.defaultRowCount * colCount
    // 收起状态下，如果按钮位置是内联模式，需要为按钮组预留最后一列的位置
    if (actionPos === 'inline') {
      maxVisibleFields = maxVisibleFields - 1
    }
  } else {
    maxVisibleFields = fields.length
  }

  // 计算实际显示的字段数量
  const totalFields = isCollapsed
    ? Math.min(fields.length, Math.max(0, maxVisibleFields))
    : fields.length

  // 计算可见字段列表
  const visibleFields = isCollapsed
    ? fields.slice(0, totalFields)
    : fields

  // 计算按钮组是否应该内联显示
  let shouldActionInline: boolean
  if (actionPos === 'block') {
    shouldActionInline = false
  } else if (actionPos === 'inline') {
    // inline 模式：优先内联，但如果最后一行没有剩余空间则独占一行
    const lastRowFieldCount = totalFields % colCount

    if (isCollapsed) {
      // 收起状态：如果可见字段数量小于列数，说明最后一行有剩余位置可以放置按钮组
      shouldActionInline = totalFields < colCount
    } else {
      // 展开状态：如果最后一行有剩余位置，内联显示；否则独占一行
      shouldActionInline = lastRowFieldCount > 0 && lastRowFieldCount < colCount
    }
  } else {
    // auto 模式：根据字段数量和布局自动决定
    const lastRowFieldCount = totalFields % colCount

    if (isCollapsed) {
      // 收起状态：如果可见字段数量小于列数，说明最后一行有剩余位置可以放置按钮组
      shouldActionInline = totalFields < colCount
    } else {
      // 展开状态：如果最后一行有剩余位置，内联显示；否则独占一行
      shouldActionInline = lastRowFieldCount > 0 && lastRowFieldCount < colCount
    }
  }

  return {
    visibleFields,
    shouldActionInline,
    totalFields,
    maxVisibleFields
  }
})

// 从布局计算结果中提取各个值（使用 shallowRef 避免深度响应式）
const visibleFields = computed(() => layoutComputed.value.visibleFields)
const shouldActionInline = computed(() => layoutComputed.value.shouldActionInline)

// 按钮组样式计算（优化版本，复用布局计算结果）
const actionStyles = computed(() => {
  const { shouldActionInline: isInline, totalFields } = layoutComputed.value

  if (!isInline) {
    return { gridColumn: '1 / -1' }
  }

  const colCount = computedColCount.value

  if (collapsed.value && props.actionPosition === 'inline') {
    // 收起状态下的内联模式：按钮组固定占用最后一列
    return { gridColumn: `${colCount} / -1` }
  } else {
    // 展开状态或auto模式：根据字段数量计算按钮组位置
    const lastRowFieldCount = totalFields % colCount

    if (lastRowFieldCount === 0) {
      // 最后一行已满，独占新行
      return { gridColumn: '1 / -1' }
    }

    // 内联模式：按钮组占用最后一行的剩余列数
    const startCol = lastRowFieldCount + 1
    return { gridColumn: `${startCol} / -1` }
  }
})

// 是否显示展开/收起按钮（复用布局计算结果）
const showCollapseButton = computed(() => {
  if (!props.showCollapseButton || !props.fields) return false

  const { maxVisibleFields } = layoutComputed.value
  return props.fields.length > maxVisibleFields
})

// 按钮组样式类
const actionClasses = computed(() => [
  'ldesign-query-form__actions',
  `ldesign-query-form__actions--${props.actionAlign}`,
  {
    'ldesign-query-form__actions--inline': shouldActionInline.value,
    'ldesign-query-form__actions--block': !shouldActionInline.value
  }
])

// === 方法 ===
const getField = (name: string) => {
  return useField(name, { form: form.form })
}

const getFieldItemClasses = (item: QueryFormField, index: number) => [
  'ldesign-query-form__field',
  {
    'ldesign-query-form__field--hidden': collapsed.value && index >= visibleFields.value.length
  }
]

// getFieldItemStyles 函数已在上面定义，这里移除重复定义

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
  emit('collapse', collapsed.value)
}

const handleSubmit = async () => {
  isPending.value = true
  
  try {
    const result = await form.submit()
    emit('submit', result.data, result.valid)
  } catch (error) {
    console.error('Query form submission error:', error)
    const data = form.getValues()
    emit('submit', data, false)
  } finally {
    isPending.value = false
  }
}

const handleReset = () => {
  form.reset()
  const data = form.getValues()
  emit('reset', data)
}

// === 生命周期钩子 ===
onMounted(() => {
  nextTick(() => {
    initResizeObserver()
  })
})

onUnmounted(() => {
  destroyResizeObserver()
})

// === 监听器 ===
watch(
  () => props.collapsed,
  (newValue) => {
    collapsed.value = newValue
  }
)

watch(
  () => form.data.value,
  (newData) => {
    emit('update:modelValue', newData)
  },
  { deep: true }
)

// 监听响应式配置变化，重新初始化 ResizeObserver
watch(
  () => props.responsive,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        initResizeObserver()
      })
    } else {
      destroyResizeObserver()
    }
  }
)

// === 暴露的方法和属性 ===
defineExpose<LDesignQueryFormExpose>({
  form,
  collapsed: computed(() => collapsed.value),
  toggle: toggleCollapse,
  expand: () => { collapsed.value = false },
  collapse: () => { collapsed.value = true },
  submit: handleSubmit,
  reset: handleReset,
  validate: form.validate,
  clearValidation: form.clearValidation
})
</script>

<script lang="ts">
export default {
  name: 'LDesignQueryForm',
  inheritAttrs: false
}
</script>

<style scoped>
.ldesign-query-form {
  width: 100%;
}

.ldesign-query-form__form {
  width: 100%;
}

.ldesign-query-form__grid {
  display: grid;
  gap: var(--ls-spacing-base, 20px);
  align-items: end;
}

.ldesign-query-form__field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.ldesign-query-form__actions {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm, 12px);
}

.ldesign-query-form__actions-content {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm, 12px);
}

.ldesign-query-form__primary-actions {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm, 12px);
}

.ldesign-query-form__collapse-actions {
  display: flex;
  align-items: center;
}

/* 按钮对齐 */
.ldesign-query-form__actions--left .ldesign-query-form__actions-content {
  justify-content: flex-start;
}

.ldesign-query-form__actions--center .ldesign-query-form__actions-content {
  justify-content: center;
}

.ldesign-query-form__actions--right .ldesign-query-form__actions-content {
  justify-content: flex-end;
}

.ldesign-query-form__actions--justify .ldesign-query-form__actions-content {
  justify-content: space-between;
}

/* 按钮位置 */
.ldesign-query-form__actions--block {
  grid-column: 1 / -1;
}
</style>
