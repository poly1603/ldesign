<template>
  <div
    class="ldesign-form-item"
    :class="formItemClasses"
    :style="formItemStyles"
  >
    <!-- 标签 -->
    <div
      v-if="label || $slots.label"
      class="ldesign-form-item__label"
      :class="labelClasses"
      :style="labelStyles"
    >
      <span v-if="required || computedRequired" class="ldesign-form-item__required">*</span>
      <slot name="label">
        <label :for="name">{{ label }}</label>
      </slot>
      <span v-if="tooltip" class="ldesign-form-item__tooltip">
        <slot name="tooltip">?</slot>
      </span>
    </div>

    <!-- 内容 -->
    <div class="ldesign-form-item__content">
      <div class="ldesign-form-item__control">
        <slot :value="fieldValue" :onChange="handleChange" :onBlur="handleBlur" :onFocus="handleFocus" />
      </div>

      <!-- 错误信息 -->
      <div
        v-if="showError && (error || $slots.error)"
        class="ldesign-form-item__error"
      >
        <slot name="error">
          {{ error }}
        </slot>
      </div>

      <!-- 帮助文本 -->
      <div
        v-if="help || $slots.help"
        class="ldesign-form-item__help"
      >
        <slot name="help">
          {{ help }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, watch, onMounted, type PropType } from 'vue'
import { FORM_INJECTION_KEY } from '../composables/useField'
import type { FormCore } from '../../../core'
import type { ValidationRule, FieldSpan } from '../../../utils/types'

const props = defineProps({
  /** 字段名 */
  name: {
    type: String,
    required: true
  },

  /** 标签 */
  label: {
    type: String,
    default: ''
  },

  /** 是否必填 */
  required: {
    type: Boolean,
    default: false
  },

  /** 验证规则 */
  rules: {
    type: Array as PropType<ValidationRule[]>,
    default: () => []
  },

  /** 占用列数 */
  span: {
    type: [Number, String] as PropType<FieldSpan>,
    default: 1
  },

  /** 提示信息 */
  tooltip: {
    type: String,
    default: ''
  },

  /** 帮助文本 */
  help: {
    type: String,
    default: ''
  },

  /** 是否显示错误 */
  showError: {
    type: Boolean,
    default: true
  },

  /** 标签宽度 */
  labelWidth: {
    type: [Number, String],
    default: undefined
  },

  /** 标签对齐 */
  labelAlign: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: undefined
  },

  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  },

  /** 是否只读 */
  readonly: {
    type: Boolean,
    default: false
  }
})

// 注入表单实例
const form = inject<FormCore>(FORM_INJECTION_KEY)

// 字段状态
const fieldValue = ref<any>()
const error = ref<string>()
const touched = ref(false)
const validating = ref(false)

// 更新字段状态
const updateFieldState = () => {
  if (!form) return

  const state = form.getFieldState(props.name)
  if (state) {
    fieldValue.value = state.value
    error.value = state.errors[0]
    touched.value = state.touched
    validating.value = state.validating
  }
}

// 监听字段变更
if (form) {
  const unsubscribeChange = form.on('field:change', event => {
    if (event.field === props.name) {
      updateFieldState()
    }
  })

  const unsubscribeState = form.on('state:change', event => {
    if (event.type === 'field' && event.field === props.name) {
      updateFieldState()
    }
  })
}

// 计算属性
const computedRequired = computed(() => {
  return props.rules.some(rule => rule.type === 'required')
})

const formItemClasses = computed(() => ({
  'ldesign-form-item--error': !!error.value && touched.value,
  'ldesign-form-item--validating': validating.value,
  'ldesign-form-item--disabled': props.disabled,
  'ldesign-form-item--readonly': props.readonly,
  [`ldesign-form-item--label-${props.labelAlign || 'right'}`]: true
}))

const formItemStyles = computed(() => {
  const styles: Record<string, any> = {}

  if (typeof props.span === 'number') {
    styles.gridColumn = `span ${props.span}`
  } else if (typeof props.span === 'string') {
    if (props.span === '-1' || props.span === '100%') {
      styles.gridColumn = '1 / -1'
    } else if (props.span.endsWith('%')) {
      // 百分比需要根据父容器列数计算
      styles.gridColumn = `span 1`
    }
  }

  return styles
})

const labelClasses = computed(() => ({
  [`ldesign-form-item__label--${props.labelAlign || 'right'}`]: true
}))

const labelStyles = computed(() => {
  if (props.labelWidth) {
    const width = typeof props.labelWidth === 'number' 
      ? `${props.labelWidth}px` 
      : props.labelWidth

    return { width }
  }
  return {}
})

// 方法
const handleChange = (value: any) => {
  if (form) {
    form.setFieldValue(props.name, value)
  }
}

const handleBlur = () => {
  if (form) {
    form.handleFieldBlur(props.name)
  }
}

const handleFocus = () => {
  if (form) {
    form.handleFieldFocus(props.name)
  }
}

// 生命周期
onMounted(() => {
  if (form) {
    // 初始化字段状态
    updateFieldState()

    // 如果提供了rules，添加到验证引擎
    // 注意：这里假设FormCore已经在创建时处理了字段的rules
    // 如果需要动态添加，可以调用相应的API
  }
})

// 暴露方法
defineExpose({
  validate: () => form?.validateField(props.name)
})
</script>

<style lang="less" scoped>
.ldesign-form-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--form-gap, 8px);
  margin-bottom: var(--form-space, 16px);

  &__label {
    display: flex;
    align-items: center;
    min-height: 32px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.85);

    &--right {
      justify-content: flex-end;
      text-align: right;
    }

    &--left {
      justify-content: flex-start;
      text-align: left;
    }

    &--top {
      align-items: flex-start;
    }
  }

  &--label-top {
    grid-template-columns: 1fr;
  }

  &__required {
    color: #ff4d4f;
    margin-right: 4px;
    font-family: SimSun, sans-serif;
  }

  &__tooltip {
    margin-left: 4px;
    color: rgba(0, 0, 0, 0.45);
    cursor: help;
  }

  &__content {
    min-height: 32px;
  }

  &__control {
    width: 100%;
  }

  &__error {
    margin-top: 4px;
    font-size: 12px;
    color: #ff4d4f;
    line-height: 1.5;
  }

  &__help {
    margin-top: 4px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.45);
    line-height: 1.5;
  }

  &--error {
    .ldesign-form-item__label {
      color: #ff4d4f;
    }
  }

  &--validating {
    .ldesign-form-item__control {
      opacity: 0.8;
    }
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--readonly {
    .ldesign-form-item__control {
      pointer-events: none;
    }
  }
}
</style>




