<template>
  <div :class="formClass" ref="formRef">
    <!-- 虚拟滚动容器 -->
    <div
      v-if="virtualScrollEnabled"
      class="l-form__virtual-container"
      :style="{ height: typeof virtualHeight === 'number' ? `${virtualHeight}px` : virtualHeight }"
      @scroll="handleScroll"
    >
      <div
        class="l-form__virtual-wrapper"
        :style="{ height: `${totalHeight}px`, position: 'relative' }"
      >
        <div
          v-for="item in visibleItems"
          :key="item._virtualIndex"
          class="l-form__virtual-item"
          :style="{
            position: 'absolute',
            top: `${item._virtualTop}px`,
            left: 0,
            right: 0,
            height: `${virtualItemHeight}px`
          }"
        >
          <FormField
            :option="item"
            :form-data="formData"
            :errors="errors"
            :touched="touched"
            :layout="layoutConfig"
            @change="onFieldChange"
            @blur="onFieldBlur"
            @focus="onFieldFocus"
          />
        </div>
      </div>
    </div>

    <!-- 普通渲染 -->
    <template v-else>
      <FormField
        v-for="option in visibleOptions"
        :key="option.name"
        :option="option"
        :form-data="formData"
        :errors="errors"
        :touched="touched"
        :layout="layoutConfig"
        @change="onFieldChange"
        @blur="onFieldBlur"
        @focus="onFieldFocus"
      />
    </template>

    <!-- 表单操作按钮 -->
    <div v-if="showActions" class="l-form__actions" :class="actionsClass">
      <slot name="actions" :submit="submit" :reset="reset" :isSubmitting="isSubmitting" :isValid="isValid">
        <button
          type="button"
          class="l-btn l-btn--primary"
          :disabled="isSubmitting || !isValid"
          @click="handleSubmit"
        >
          <span v-if="isSubmitting" class="l-loading"></span>
          {{ submitText }}
        </button>
        <button
          v-if="showReset"
          type="button"
          class="l-btn l-btn--default"
          :disabled="isSubmitting"
          @click="handleReset"
        >
          {{ resetText }}
        </button>
      </slot>
    </div>

    <!-- 性能监控面板 (开发模式) -->
    <div v-if="showPerformancePanel && isDev" class="l-form__performance">
      <div class="l-form__performance-header">
        <span>性能监控</span>
        <button @click="togglePerformancePanel">{{ performancePanelVisible ? '隐藏' : '显示' }}</button>
      </div>
      <div v-if="performancePanelVisible" class="l-form__performance-content">
        <div>渲染次数: {{ metrics.renderCount }}</div>
        <div>验证次数: {{ metrics.validationCount }}</div>
        <div>更新次数: {{ metrics.updateCount }}</div>
        <div>平均渲染时间: {{ metrics.averageRenderTime.toFixed(2) }}ms</div>
        <div>内存使用: {{ metrics.memoryUsage.toFixed(2) }}MB</div>
        <div class="l-form__performance-suggestions">
          <div v-for="suggestion in optimizationSuggestions" :key="suggestion" class="suggestion">
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useForm, provideFormContext, type FormOptions } from './hooks/useForm'
import { type LDesignFormOption } from './types'
import FormField from './components/FormField.vue'

// Props 定义
interface Props {
  // 表单配置
  options: LDesignFormOption[]
  modelValue?: Record<string, any>
  
  // 验证相关
  rules?: Record<string, any>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  
  // 布局相关
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelCol?: number | Record<string, number>
  wrapperCol?: number | Record<string, number>
  size?: 'small' | 'medium' | 'large'
  colon?: boolean
  requiredMark?: boolean
  
  // 虚拟滚动
  virtualScroll?: boolean
  virtualHeight?: number | string
  virtualItemHeight?: number
  virtualThreshold?: number
  
  // 性能优化
  debounce?: boolean
  debounceDelay?: number
  throttle?: boolean
  throttleDelay?: number
  batchUpdate?: boolean
  memoization?: boolean
  
  // 表单行为
  resetOnSubmit?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  
  // UI 相关
  showActions?: boolean
  showReset?: boolean
  submitText?: string
  resetText?: string
  
  // 开发相关
  showPerformancePanel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  validateOnChange: true,
  validateOnBlur: true,
  layout: 'horizontal',
  size: 'medium',
  colon: true,
  requiredMark: true,
  virtualScroll: false,
  virtualHeight: 400,
  virtualItemHeight: 60,
  virtualThreshold: 100,
  debounce: true,
  debounceDelay: 300,
  throttle: true,
  throttleDelay: 100,
  batchUpdate: true,
  memoization: true,
  resetOnSubmit: false,
  autoSave: false,
  autoSaveDelay: 2000,
  showActions: true,
  showReset: true,
  submitText: '提交',
  resetText: '重置',
  showPerformancePanel: false
})

// Emits 定义
interface Emits {
  'update:modelValue': [value: Record<string, any>]
  'submit': [data: { valid: boolean; data: Record<string, any>; errors: Record<string, string> }]
  'reset': []
  'change': [name: string, value: any, formData: Record<string, any>]
  'blur': [name: string, value: any]
  'focus': [name: string, value: any]
  'auto-save': [data: Record<string, any>]
}

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<HTMLElement>()
const performancePanelVisible = ref(false)
const isDev = ref(process.env.NODE_ENV === 'development')

// 表单配置
const formOptions: FormOptions = {
  options: ref(props.options),
  initialData: props.modelValue || {},
  rules: computed(() => props.rules || {}),
  layout: computed(() => ({
    labelCol: props.labelCol,
    wrapperCol: props.wrapperCol,
    layout: props.layout,
    size: props.size,
    colon: props.colon,
    requiredMark: props.requiredMark
  })),
  performance: computed(() => ({
    debounce: {
      enabled: props.debounce,
      delay: props.debounceDelay
    },
    throttle: {
      enabled: props.throttle,
      delay: props.throttleDelay
    },
    rendering: {
      batchUpdate: props.batchUpdate,
      lazyValidation: true,
      virtualScroll: props.virtualScroll,
      memoization: props.memoization
    },
    data: {
      shallowWatch: true,
      immutable: false
    }
  })),
  validateOnChange: props.validateOnChange,
  validateOnBlur: props.validateOnBlur,
  resetOnSubmit: props.resetOnSubmit,
  autoSave: props.autoSave,
  autoSaveDelay: props.autoSaveDelay
}

// 使用表单 Hook
const form = useForm(formOptions)

// 提供表单上下文
provideFormContext(form)

// 计算属性
const visibleOptions = computed(() => {
  return props.options.filter(option => !option.hidden)
})

const layoutConfig = computed(() => ({
  labelCol: props.labelCol,
  wrapperCol: props.wrapperCol,
  layout: props.layout,
  size: props.size,
  colon: props.colon,
  requiredMark: props.requiredMark
}))

const actionsClass = computed(() => {
  const classes = []
  if (props.layout === 'inline') {
    classes.push('l-form__actions--inline')
  }
  return classes.join(' ')
})

const optimizationSuggestions = computed(() => {
  return form.getOptimizationSuggestions()
})

// 解构表单返回值
const {
  formData,
  errors,
  touched,
  isSubmitting,
  isValid,
  isDirty,
  formClass,
  virtualScrollEnabled,
  visibleItems,
  totalHeight,
  metrics,
  submit,
  reset,
  onFieldChange: _onFieldChange,
  onFieldBlur: _onFieldBlur,
  onFieldFocus: _onFieldFocus
} = form

// 事件处理
const onFieldChange = (name: string, value: any) => {
  _onFieldChange(name, value)
  emit('change', name, value, formData.value)
}

const onFieldBlur = (name: string) => {
  const value = form.getFieldValue(name)
  _onFieldBlur(name)
  emit('blur', name, value)
}

const onFieldFocus = (name: string) => {
  const value = form.getFieldValue(name)
  _onFieldFocus(name)
  emit('focus', name, value)
}

const handleSubmit = async () => {
  const result = await submit()
  emit('submit', result)
}

const handleReset = () => {
  reset()
  emit('reset')
}

const handleScroll = (event: Event) => {
  // 虚拟滚动处理已在 useFormLayout 中实现
}

const togglePerformancePanel = () => {
  performancePanelVisible.value = !performancePanelVisible.value
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && typeof newValue === 'object') {
      Object.keys(newValue).forEach(key => {
        form.setFieldValue(key, newValue[key])
      })
    }
  },
  { deep: true, immediate: true }
)

// 监听表单数据变化，同步到 modelValue
watch(
  formData,
  (newData) => {
    emit('update:modelValue', { ...newData })
  },
  { deep: true }
)

// 监听自动保存
watch(
  () => form.isDirty.value,
  (dirty) => {
    if (dirty && props.autoSave) {
      // 触发自动保存事件
      setTimeout(() => {
        if (form.isDirty.value) {
          emit('auto-save', { ...formData.value })
        }
      }, props.autoSaveDelay)
    }
  }
)

// 暴露方法给父组件
defineExpose({
  submit: handleSubmit,
  reset: handleReset,
  validate: form.validateAll,
  validateField: form.validateField,
  clearValidation: form.clearValidation,
  getFieldValue: form.getFieldValue,
  setFieldValue: form.setFieldValue,
  scrollToField: form.scrollToField,
  getFormData: () => formData.value,
  getErrors: () => errors.value,
  isValid: () => isValid.value,
  isDirty: () => isDirty.value,
  getMetrics: () => metrics.value
})
</script>

<style scoped>
.l-form {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #333;
}

.l-form--horizontal .l-form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
}

.l-form--vertical .l-form-item {
  display: block;
  margin-bottom: 16px;
}

.l-form--inline {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.l-form--inline .l-form-item {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0;
}

.l-form--small {
  font-size: 12px;
}

.l-form--large {
  font-size: 16px;
}

.l-form__virtual-container {
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.l-form__virtual-wrapper {
  position: relative;
}

.l-form__virtual-item {
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.l-form__actions {
  margin-top: 24px;
  text-align: left;
}

.l-form__actions--inline {
  display: inline-flex;
  gap: 8px;
  margin-top: 0;
  margin-left: 16px;
}

.l-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 8px;
}

.l-btn:hover {
  border-color: #4096ff;
  color: #4096ff;
}

.l-btn--primary {
  background: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.l-btn--primary:hover {
  background: #40a9ff;
  border-color: #40a9ff;
}

.l-btn:disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
}

.l-loading {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.l-form__performance {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.l-form__performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
}

.l-form__performance-content {
  padding: 12px;
  font-size: 12px;
}

.l-form__performance-content > div {
  margin-bottom: 4px;
}

.l-form__performance-suggestions {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e0e0e0;
}

.suggestion {
  padding: 4px 8px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 2px;
  margin-bottom: 4px;
  font-size: 11px;
}
</style>