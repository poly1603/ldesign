<!--
  FormItem 组件
  
  表单项组件，提供标签显示、验证状态、布局控制等功能
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <div
    :class="formItemClasses"
    :style="formItemStyles"
  >
    <!-- 标签容器 -->
    <div
      v-if="showLabel"
      :class="labelContainerClasses"
      :style="labelContainerStyles"
    >
      <!-- 必填标记 -->
      <span
        v-if="showRequired"
        class="ldesign-form-item__label-required"
      />
      
      <!-- 标签文本 -->
      <label
        :for="fieldId"
        class="ldesign-form-item__label"
      >
        <slot name="label">
          {{ label }}
        </slot>
      </label>
      
      <!-- 冒号 -->
      <span
        v-if="showColon"
        class="ldesign-form-item__label-colon"
      />
    </div>
    
    <!-- 控件容器 -->
    <div class="ldesign-form-item__control">
      <slot />
      
      <!-- 错误信息 -->
      <div
        v-if="showError"
        class="ldesign-form-item__error"
      >
        <slot name="error">
          {{ firstError }}
        </slot>
      </div>
      
      <!-- 帮助信息 -->
      <div
        v-if="help"
        class="ldesign-form-item__help"
      >
        <slot name="help">
          {{ help }}
        </slot>
      </div>
      
      <!-- 额外信息 -->
      <div
        v-if="extra"
        class="ldesign-form-item__extra"
      >
        <slot name="extra">
          {{ extra }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, type CSSProperties } from 'vue'
import type { FormItemProps } from '../../types'
import { injectFormContext } from '../../core/form/manager'
import { generateId, calculateFieldStyles, normalizeLabelWidth } from '../../utils'

/**
 * 组件名称
 */
defineOptions({
  name: 'LDesignFormItem',
})

/**
 * 组件属性
 */
const props = withDefaults(defineProps<FormItemProps>(), {
  layout: 'horizontal',
  labelAlign: 'right',
  colon: true,
  requiredMark: true,
  showError: true,
  validateTrigger: ['change', 'blur'],
})

/**
 * 注入表单上下文
 */
const formContext = injectFormContext()

/**
 * 字段ID
 */
const fieldId = computed(() => props.id || generateId('field'))

/**
 * 字段名称
 */
const fieldName = computed(() => props.name || fieldId.value)

/**
 * 字段错误信息
 */
const fieldErrors = computed(() => {
  if (!formContext || !fieldName.value) {
    return []
  }
  return formContext.errors.value[fieldName.value] || []
})

/**
 * 第一个错误信息
 */
const firstError = computed(() => fieldErrors.value[0] || '')

/**
 * 字段是否有错误
 */
const hasError = computed(() => fieldErrors.value.length > 0)

/**
 * 字段是否正在验证
 */
const isValidating = computed(() => {
  // TODO: 实现字段级别的验证状态
  return false
})

/**
 * 字段是否验证成功
 */
const isSuccess = computed(() => {
  if (!formContext || !fieldName.value) {
    return false
  }
  
  // 如果有错误，则不是成功状态
  if (hasError.value) {
    return false
  }
  
  // 如果字段被触摸过且没有错误，则是成功状态
  const touched = formContext.state.value.touched[fieldName.value]
  return touched && !hasError.value
})

/**
 * 是否显示标签
 */
const showLabel = computed(() => {
  return !!(props.label || $slots.label)
})

/**
 * 是否显示必填标记
 */
const showRequired = computed(() => {
  if (!props.requiredMark) {
    return false
  }
  
  // 如果明确设置了required属性
  if (props.required !== undefined) {
    return props.required
  }
  
  // TODO: 从验证规则中推断是否必填
  return false
})

/**
 * 是否显示冒号
 */
const showColon = computed(() => {
  if (!props.colon) {
    return false
  }
  
  // 只有在有标签时才显示冒号
  return showLabel.value
})

/**
 * 是否显示错误信息
 */
const showError = computed(() => {
  return props.showError && hasError.value
})

/**
 * 表单项样式类
 */
const formItemClasses = computed(() => [
  'ldesign-form-item',
  `ldesign-form-item--${props.layout}`,
  {
    'ldesign-form-item--error': hasError.value,
    'ldesign-form-item--validating': isValidating.value,
    'ldesign-form-item--success': isSuccess.value,
    'ldesign-form-item--disabled': props.disabled,
    'ldesign-form-item--readonly': props.readonly,
  },
])

/**
 * 表单项样式
 */
const formItemStyles = computed((): CSSProperties => {
  if (!formContext) {
    return {}
  }
  
  const layoutConfig = {
    columns: 1, // FormItem 不直接处理多列布局
    gutter: 0,
    labelWidth: props.labelWidth || 120,
    labelAlign: props.labelAlign || 'right',
    responsive: false,
  }
  
  // TODO: 获取容器宽度进行响应式计算
  const containerWidth = 1200
  
  return calculateFieldStyles(
    {
      name: fieldName.value,
      layout: {
        span: props.span,
        offset: props.offset,
        order: props.order,
      },
    },
    layoutConfig,
    containerWidth
  )
})

/**
 * 标签容器样式类
 */
const labelContainerClasses = computed(() => [
  'ldesign-form-item__label-container',
  `ldesign-form-item__label-container--${props.labelAlign}`,
  {
    'ldesign-form-item__label-container--top': props.layout === 'vertical',
  },
])

/**
 * 标签容器样式
 */
const labelContainerStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  if (props.labelWidth !== undefined) {
    const width = normalizeLabelWidth(props.labelWidth, 1200)
    styles.width = `${width}px`
  }
  
  return styles
})

/**
 * 注册字段到表单
 */
function registerField(): void {
  if (!formContext || !fieldName.value) {
    return
  }
  
  formContext.registerField(fieldName.value, {
    name: fieldName.value,
    label: props.label,
    required: props.required,
    rules: props.rules || [],
    initialValue: props.initialValue,
    layout: {
      span: props.span,
      offset: props.offset,
      order: props.order,
    },
    disabled: props.disabled,
    readonly: props.readonly,
    visible: true,
  })
}

/**
 * 注销字段
 */
function unregisterField(): void {
  if (!formContext || !fieldName.value) {
    return
  }
  
  formContext.unregisterField(fieldName.value)
}

/**
 * 监听字段名称变化
 */
watch(
  () => fieldName.value,
  (newName, oldName) => {
    if (oldName) {
      unregisterField()
    }
    if (newName) {
      registerField()
    }
  }
)

/**
 * 监听字段配置变化
 */
watch(
  () => ({
    label: props.label,
    required: props.required,
    rules: props.rules,
    disabled: props.disabled,
    readonly: props.readonly,
    span: props.span,
    offset: props.offset,
    order: props.order,
  }),
  () => {
    registerField()
  },
  { deep: true }
)

/**
 * 组件挂载时注册字段
 */
onMounted(() => {
  registerField()
})

/**
 * 组件卸载时注销字段
 */
onUnmounted(() => {
  unregisterField()
})

/**
 * 暴露组件方法
 */
defineExpose({
  /** 字段ID */
  fieldId,
  /** 字段名称 */
  fieldName,
  /** 字段错误 */
  fieldErrors,
  /** 是否有错误 */
  hasError,
  /** 是否正在验证 */
  isValidating,
  /** 是否验证成功 */
  isSuccess,
})
</script>

<style lang="less">
@import '../../styles/components/form-item.less';
</style>
