<template>
  <form
    class="ldesign-form"
    :class="formClasses"
    @submit.prevent="handleSubmit"
    @reset.prevent="handleReset"
  >
    <div
      ref="containerRef"
      class="ldesign-form__container"
      :style="containerStyles"
    >
      <slot />

      <!-- 按钮组 -->
      <div
        v-if="showButtons"
        class="ldesign-form__buttons"
        :class="buttonClasses"
        :style="buttonStyles"
      >
        <slot name="buttons">
          <button
            v-if="showSubmitButton"
            type="submit"
            class="ldesign-form__button ldesign-form__button--submit"
            :disabled="formInstance?.getFormState().submitting"
          >
            {{ submitText }}
          </button>

          <button
            v-if="showResetButton"
            type="reset"
            class="ldesign-form__button ldesign-form__button--reset"
          >
            {{ resetText }}
          </button>

          <button
            v-if="showExpandButton && collapsible"
            type="button"
            class="ldesign-form__button ldesign-form__button--expand"
            @click="handleToggleExpand"
          >
            {{ expanded ? collapseText : expandText }}
          </button>
        </slot>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  provide,
  watch,
  onMounted,
  onUnmounted,
  type PropType
} from 'vue'
import { createForm, type FormCore } from '../../../core'
import type { FormOptions, FormValues } from '../../../utils/types'
import { FORM_INJECTION_KEY } from '../composables/useField'

const props = defineProps({
  /** 表单实例（外部传入） */
  form: {
    type: Object as PropType<FormCore>,
    default: undefined
  },

  /** 表单选项 */
  options: {
    type: Object as PropType<FormOptions>,
    default: () => ({})
  },

  /** 列宽 */
  spanWidth: {
    type: Number,
    default: 200
  },

  /** 最大列数 */
  maxSpan: {
    type: Number,
    default: 4
  },

  /** 垂直间距 */
  space: {
    type: Number,
    default: 16
  },

  /** 标题间距 */
  gap: {
    type: Number,
    default: 8
  },

  /** 标题对齐 */
  labelAlign: {
    type: String as PropType<'left' | 'right' | 'top'>,
    default: 'right'
  },

  /** 按钮位置 */
  buttonPosition: {
    type: String as PropType<'inline' | 'block'>,
    default: 'inline'
  },

  /** 按钮对齐 */
  buttonAlign: {
    type: String as PropType<'left' | 'center' | 'right'>,
    default: 'right'
  },

  /** 按钮占列数 */
  buttonSpan: {
    type: Number,
    default: 1
  },

  /** 是否显示提交按钮 */
  showSubmit: {
    type: Boolean,
    default: true
  },

  /** 提交按钮文本 */
  submitText: {
    type: String,
    default: '查询'
  },

  /** 是否显示重置按钮 */
  showReset: {
    type: Boolean,
    default: true
  },

  /** 重置按钮文本 */
  resetText: {
    type: String,
    default: '重置'
  },

  /** 是否显示展开按钮 */
  showExpand: {
    type: Boolean,
    default: true
  },

  /** 展开按钮文本 */
  expandText: {
    type: String,
    default: '展开'
  },

  /** 收起按钮文本 */
  collapseText: {
    type: String,
    default: '收起'
  },

  /** 是否可折叠 */
  collapsible: {
    type: Boolean,
    default: false
  },

  /** 预览行数 */
  previewRows: {
    type: Number,
    default: 1
  },

  /** 是否禁用 */
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits<{
  submit: [values: FormValues]
  reset: []
  change: [field: string, value: any, values: FormValues]
  'expand-change': [expanded: boolean]
}>()

// Refs
const containerRef = ref<HTMLElement>()
const formInstance = ref<FormCore>()
const expanded = ref(true)

// 创建或使用外部表单实例
if (props.form) {
  formInstance.value = props.form
} else {
  formInstance.value = createForm({
    ...props.options,
    layout: {
      spanWidth: props.spanWidth,
      maxSpan: props.maxSpan,
      space: props.space,
      gap: props.gap,
      labelAlign: props.labelAlign,
      ...props.options.layout
    },
    button: {
      buttonPosition: props.buttonPosition,
      buttonAlign: props.buttonAlign,
      buttonSpan: props.buttonSpan,
      showSubmit: props.showSubmit,
      showReset: props.showReset,
      showExpand: props.showExpand,
      submitText: props.submitText,
      resetText: props.resetText,
      ...props.options.button
    },
    expand: {
      previewRows: props.previewRows,
      defaultExpanded: !props.collapsible,
      expandText: props.expandText,
      collapseText: props.collapseText,
      ...props.options.expand
    },
    onSubmit: (values) => {
      emit('submit', values)
      props.options.onSubmit?.(values)
    },
    onReset: () => {
      emit('reset')
      props.options.onReset?.()
    },
    onChange: (field, value, values) => {
      emit('change', field, value, values)
      props.options.onChange?.(field, value, values)
    },
    onExpandChange: (exp) => {
      expanded.value = exp
      emit('expand-change', exp)
      props.options.onExpandChange?.(exp)
    }
  })
}

// 提供表单实例给子组件
provide(FORM_INJECTION_KEY, formInstance.value)

// 计算属性
const formClasses = computed(() => ({
  'ldesign-form--disabled': props.disabled,
  [`ldesign-form--label-${props.labelAlign}`]: true
}))

const containerStyles = computed(() => ({
  '--form-space': `${props.space}px`,
  '--form-gap': `${props.gap}px`
}))

const showButtons = computed(() => {
  return props.showSubmit || props.showReset || (props.showExpand && props.collapsible)
})

const showSubmitButton = computed(() => props.showSubmit)
const showResetButton = computed(() => props.showReset)
const showExpandButton = computed(() => props.showExpand)

const buttonClasses = computed(() => ({
  [`ldesign-form__buttons--${props.buttonPosition}`]: true,
  [`ldesign-form__buttons--${props.buttonAlign}`]: true
}))

const buttonStyles = computed(() => {
  const layout = formInstance.value?.getLayoutEngine()
  if (!layout) return {}

  const position = layout.getButtonPosition(props.buttonSpan, props.buttonPosition)
  const columns = layout.getColumns()

  return {
    gridColumn: props.buttonPosition === 'block' 
      ? `span ${columns}` 
      : `span ${props.buttonSpan}`
  }
})

// 方法
const handleSubmit = async () => {
  await formInstance.value?.submit()
}

const handleReset = () => {
  formInstance.value?.reset()
}

const handleToggleExpand = () => {
  formInstance.value?.toggleExpand()
}

// 生命周期
onMounted(() => {
  if (containerRef.value && formInstance.value) {
    formInstance.value.getLayoutEngine().init(containerRef.value)
  }
})

onUnmounted(() => {
  // 如果是内部创建的实例，销毁它
  if (!props.form) {
    formInstance.value?.destroy()
  }
})

// 暴露方法给父组件
defineExpose({
  form: formInstance,
  submit: handleSubmit,
  reset: handleReset,
  toggleExpand: handleToggleExpand
})
</script>

<style lang="less" scoped>
.ldesign-form {
  &__container {
    display: grid;
    gap: var(--form-space, 16px);
  }

  &__buttons {
    display: flex;
    gap: 8px;

    &--inline {
      align-self: flex-end;
    }

    &--block {
      width: 100%;
    }

    &--left {
      justify-content: flex-start;
    }

    &--center {
      justify-content: center;
    }

    &--right {
      justify-content: flex-end;
    }
  }

  &__button {
    padding: 8px 16px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #722ED1;
      color: #722ED1;
    }

    &--submit {
      background: #722ED1;
      border-color: #722ED1;
      color: #fff;

      &:hover {
        background: #5c24a8;
        border-color: #5c24a8;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &--disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}
</style>




