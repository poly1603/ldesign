<!--
  Form 组件
  
  表单容器组件，提供表单状态管理、验证、布局等功能
  
  @author LDesign Team
  @since 1.0.0
-->

<template>
  <form
    :class="formClasses"
    :style="formStyles"
    @submit.prevent="handleSubmit"
    @reset.prevent="handleReset"
  >
    <div class="ldesign-form__container">
      <slot />
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, onMounted, watch, type CSSProperties } from 'vue'
import type { FormProps } from '../../types'
import { FormManager, provideFormContext } from '../../core/form/manager'
import { calculateFormStyles } from '../../utils'

/**
 * 组件名称
 */
defineOptions({
  name: 'LDesignForm',
})

/**
 * 组件属性
 */
const props = withDefaults(defineProps<FormProps>(), {
  layout: 'horizontal',
  size: 'medium',
  variant: 'outlined',
  labelAlign: 'right',
  labelWidth: 120,
  columns: 1,
  gutter: 16,
  validateOnChange: true,
  validateOnBlur: true,
  validateOnSubmit: true,
  validateOnMount: false,
  disabled: false,
  readonly: false,
  colon: true,
  requiredMark: true,
  responsive: true,
})

/**
 * 组件事件
 */
const emit = defineEmits<{
  /** 表单提交事件 */
  submit: [values: Record<string, any>]
  /** 表单重置事件 */
  reset: []
  /** 表单值变化事件 */
  change: [values: Record<string, any>]
  /** 表单验证事件 */
  validate: [valid: boolean, errors: Record<string, string[]>]
  /** 字段值变化事件 */
  fieldChange: [name: string, value: any, oldValue: any]
  /** 字段验证事件 */
  fieldValidate: [name: string, valid: boolean]
}>()

/**
 * 创建表单管理器
 */
const formManager = new FormManager({
  id: props.id,
  initialValues: props.initialValues,
  validationSchema: props.validationSchema,
  validateOnChange: props.validateOnChange,
  validateOnBlur: props.validateOnBlur,
  validateOnSubmit: props.validateOnSubmit,
  validateOnMount: props.validateOnMount,
  debug: props.debug,
  eventHandlers: {
    // 表单提交前事件
    onBeforeSubmit: async (values) => {
      // 如果有自定义的提交前处理，执行它
      if (props.onBeforeSubmit) {
        return await props.onBeforeSubmit(values)
      }
      return true
    },
    
    // 表单提交成功事件
    onSubmitSuccess: (values) => {
      emit('submit', values)
      props.onSubmitSuccess?.(values)
    },
    
    // 表单提交错误事件
    onSubmitError: (error) => {
      props.onSubmitError?.(error)
    },
    
    // 表单重置事件
    onFormReset: () => {
      emit('reset')
      props.onReset?.()
    },
    
    // 表单验证事件
    onFormValidate: (valid) => {
      emit('validate', valid, formManager.errors.value)
      props.onValidate?.(valid, formManager.errors.value)
    },
    
    // 字段值变化事件
    onFieldChange: (name, value, oldValue) => {
      emit('fieldChange', name, value, oldValue)
      emit('change', formManager.values.value)
      props.onFieldChange?.(name, value, oldValue)
      props.onChange?.(formManager.values.value)
    },
    
    // 字段验证事件
    onFieldValidate: (name, valid) => {
      emit('fieldValidate', name, valid)
      props.onFieldValidate?.(name, valid)
    },
  },
})

/**
 * 提供表单上下文
 */
provideFormContext(formManager)

/**
 * 表单样式类
 */
const formClasses = computed(() => [
  'ldesign-form',
  `ldesign-form--${props.layout}`,
  `ldesign-form--${props.size}`,
  `ldesign-form--${props.variant}`,
  {
    'ldesign-form--disabled': props.disabled,
    'ldesign-form--readonly': props.readonly,
    'ldesign-form--responsive': props.responsive,
  },
])

/**
 * 表单样式
 */
const formStyles = computed((): CSSProperties => {
  const layoutConfig = {
    columns: props.columns,
    gutter: props.gutter,
    labelWidth: props.labelWidth,
    labelAlign: props.labelAlign,
    responsive: props.responsive,
    breakpoints: props.breakpoints,
  }
  
  return {
    ...calculateFormStyles(layoutConfig),
    '--ldesign-form-label-width': typeof props.labelWidth === 'number' 
      ? `${props.labelWidth}px` 
      : props.labelWidth,
    '--ldesign-form-columns': props.columns.toString(),
    '--ldesign-form-gutter': `${props.gutter}px`,
  }
})

/**
 * 处理表单提交
 */
async function handleSubmit(): Promise<void> {
  if (props.disabled) {
    return
  }
  
  try {
    await formManager.submitForm()
  } catch (error) {
    console.error('Form submission failed:', error)
  }
}

/**
 * 处理表单重置
 */
function handleReset(): void {
  if (props.disabled) {
    return
  }
  
  formManager.resetForm()
}

/**
 * 监听初始值变化
 */
watch(
  () => props.initialValues,
  (newValues) => {
    if (newValues) {
      formManager.store.config.value.initialValues = newValues
    }
  },
  { deep: true }
)

/**
 * 监听验证模式变化
 */
watch(
  () => ({
    validateOnChange: props.validateOnChange,
    validateOnBlur: props.validateOnBlur,
    validateOnSubmit: props.validateOnSubmit,
  }),
  (newConfig) => {
    Object.assign(formManager.store.config.value, newConfig)
  }
)

/**
 * 组件挂载时的处理
 */
onMounted(() => {
  // 如果启用了挂载时验证，执行验证
  if (props.validateOnMount) {
    formManager.validateForm()
  }
})

/**
 * 暴露表单实例方法
 */
defineExpose({
  /** 表单管理器实例 */
  formManager,
  /** 获取表单值 */
  getFieldsValue: () => formManager.getFieldsValue(),
  /** 设置表单值 */
  setFieldsValue: (values: Record<string, any>) => formManager.setFieldsValue(values),
  /** 获取字段值 */
  getFieldValue: (name: string) => formManager.getFieldValue(name),
  /** 设置字段值 */
  setFieldValue: (name: string, value: any) => formManager.setFieldValue(name, value),
  /** 验证表单 */
  validateForm: () => formManager.validateForm(),
  /** 验证字段 */
  validateField: (name: string) => formManager.validateField(name),
  /** 验证多个字段 */
  validateFields: (names?: string[]) => formManager.validateFields(names),
  /** 重置表单 */
  resetForm: () => formManager.resetForm(),
  /** 重置字段 */
  resetField: (name: string) => formManager.resetField(name),
  /** 重置多个字段 */
  resetFields: (names?: string[]) => formManager.resetFields(names),
  /** 清除错误 */
  clearErrors: () => formManager.clearErrors(),
  /** 清除字段错误 */
  clearFieldError: (name: string) => formManager.clearFieldError(name),
  /** 设置字段错误 */
  setFieldError: (name: string, error: string) => formManager.setFieldError(name, error),
  /** 设置多个字段错误 */
  setFieldsError: (errors: Record<string, string>) => formManager.setFieldsError(errors),
  /** 提交表单 */
  submitForm: () => formManager.submitForm(),
})
</script>

<style lang="less">
@import '../../styles/components/form.less';
</style>
