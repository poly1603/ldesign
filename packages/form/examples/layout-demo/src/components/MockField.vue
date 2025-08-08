<template>
  <div class="mock-field" :class="fieldClasses" :style="fieldContainerStyles">
    <!-- 标签在左侧时 -->
    <label
      v-if="config.label && labelPosition === 'left'"
      class="field-label label-left"
      :style="labelStyles"
    >
      {{ config.label }}
      <span v-if="config.required" class="required">*</span>
    </label>

    <div class="field-content">
      <!-- 标签在顶部时 -->
      <label
        v-if="config.label && labelPosition === 'top'"
        class="field-label label-top"
        :style="labelStyles"
      >
        {{ config.label }}
        <span v-if="config.required" class="required">*</span>
      </label>

      <div class="field-input">
        <!-- 文本输入 -->
        <input
          v-if="config.component === 'FormInput'"
          :type="config.props?.type || 'text'"
          :value="modelValue"
          :placeholder="config.placeholder"
          :disabled="disabled"
          :readonly="readonly"
          class="input"
          @input="handleInput"
          @blur="handleBlur"
        />

        <!-- 下拉选择 -->
        <select
          v-else-if="config.component === 'FormSelect'"
          :value="modelValue"
          :disabled="disabled"
          class="select"
          @change="handleChange"
        >
          <option value="">{{ config.placeholder || '请选择' }}</option>
          <option
            v-for="option in config.props?.options || []"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>

        <!-- 单选框 -->
        <div v-else-if="config.component === 'FormRadio'" class="radio-group">
          <label
            v-for="option in config.props?.options || []"
            :key="option.value"
            class="radio-item"
          >
            <input
              type="radio"
              :name="config.name"
              :value="option.value"
              :checked="modelValue === option.value"
              :disabled="disabled"
              @change="handleRadioChange"
            />
            <span class="radio-label">{{ option.label }}</span>
          </label>
        </div>

        <!-- 多选框 -->
        <div
          v-else-if="config.component === 'FormCheckbox'"
          class="checkbox-group"
        >
          <label
            v-for="option in config.props?.options || []"
            :key="option.value"
            class="checkbox-item"
          >
            <input
              type="checkbox"
              :value="option.value"
              :checked="(modelValue || []).includes(option.value)"
              :disabled="disabled"
              @change="handleCheckboxChange"
            />
            <span class="checkbox-label">{{ option.label }}</span>
          </label>
        </div>

        <!-- 开关 -->
        <label v-else-if="config.component === 'FormSwitch'" class="switch">
          <input
            type="checkbox"
            :checked="modelValue"
            :disabled="disabled"
            @change="handleSwitchChange"
          />
          <span class="switch-slider"></span>
        </label>

        <!-- 日期选择 -->
        <input
          v-else-if="config.component === 'FormDatePicker'"
          type="date"
          :value="modelValue"
          :disabled="disabled"
          class="input"
          @change="handleChange"
        />

        <!-- 文本域 -->
        <textarea
          v-else-if="config.component === 'FormTextarea'"
          :value="modelValue"
          :placeholder="config.placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :rows="config.props?.rows || 3"
          :maxlength="config.props?.maxlength"
          class="textarea"
          @input="handleInput"
          @blur="handleBlur"
        ></textarea>

        <!-- 操作按钮 -->
        <FormActions
          v-else-if="config.component === 'FormActions'"
          v-bind="config.props"
        />

        <!-- 默认输入 -->
        <input
          v-else
          type="text"
          :value="modelValue"
          :placeholder="config.placeholder"
          :disabled="disabled"
          :readonly="readonly"
          class="input"
          @input="handleInput"
          @blur="handleBlur"
        />
      </div>

      <div v-if="error" class="field-error">
        {{ error }}
      </div>
    </div>

    <!-- 标签在右侧时 -->
    <label
      v-if="config.label && labelPosition === 'right'"
      class="field-label label-right"
      :style="labelStyles"
    >
      {{ config.label }}
      <span v-if="config.required" class="required">*</span>
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FormActions from './FormActions.vue'
import type { FieldConfig } from '@/types/form'

interface Props {
  config: FieldConfig
  modelValue?: any
  disabled?: boolean
  readonly?: boolean
  error?: string
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: number | string
  labelAlign?: 'left' | 'center' | 'right'
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'blur'): void
  (e: 'focus'): void
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'top',
  labelWidth: 'auto',
  labelAlign: 'left',
})
const emit = defineEmits<Emits>()

const error = ref('')

// 字段样式类
const fieldClasses = computed(() => {
  const classes = ['mock-field']
  if (props.config.className) {
    classes.push(props.config.className)
  }
  if (error.value) {
    classes.push('has-error')
  }
  classes.push(`label-${props.labelPosition}`)
  return classes
})

// 字段容器样式
const fieldContainerStyles = computed(() => {
  const styles: Record<string, any> = {}

  if (props.labelPosition === 'left' || props.labelPosition === 'right') {
    styles.display = 'flex'
    styles.alignItems = 'flex-start'
    styles.gap = '8px'
  }

  return styles
})

// 标签样式
const labelStyles = computed(() => {
  const styles: Record<string, any> = {}

  if (props.config.labelStyle) {
    Object.assign(styles, props.config.labelStyle)
  }

  // 标签宽度设置
  if (props.labelPosition !== 'top' && props.labelWidth !== 'auto') {
    if (typeof props.labelWidth === 'number') {
      styles.width = `${props.labelWidth}px`
      styles.minWidth = `${props.labelWidth}px`
    } else {
      styles.width = props.labelWidth
      styles.minWidth = props.labelWidth
    }
  }

  // 标签对齐 - 对于左侧和右侧标签使用 justify-content，对于顶部标签使用 text-align
  if (props.labelAlign) {
    if (props.labelPosition === 'left' || props.labelPosition === 'right') {
      // 对于flex布局的标签，使用justify-content
      switch (props.labelAlign) {
        case 'left':
          styles.justifyContent = 'flex-start'
          break
        case 'center':
          styles.justifyContent = 'center'
          break
        case 'right':
          styles.justifyContent = 'flex-end'
          break
      }
    } else {
      // 对于顶部标签，使用text-align
      styles.textAlign = props.labelAlign
    }
  }

  return styles
})

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
  validateField(target.value)
}

// 处理变化
const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement | HTMLInputElement
  emit('update:modelValue', target.value)
  validateField(target.value)
}

// 处理单选框变化
const handleRadioChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  validateField(target.value)
}

// 处理多选框变化
const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const currentValue = props.modelValue || []
  let newValue: string[]

  if (target.checked) {
    newValue = [...currentValue, target.value]
  } else {
    newValue = currentValue.filter((v: string) => v !== target.value)
  }

  emit('update:modelValue', newValue)
  validateField(newValue)
}

// 处理开关变化
const handleSwitchChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
  validateField(target.checked)
}

// 处理失焦
const handleBlur = () => {
  emit('blur')
  validateField(props.modelValue)
}

// 简单的字段验证
const validateField = (value: any) => {
  error.value = ''

  if (!props.config.rules) return

  for (const rule of props.config.rules) {
    if (
      rule.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      error.value = rule.message || '此字段为必填项'
      return
    }

    if (rule.min && typeof value === 'string' && value.length < rule.min) {
      error.value = rule.message || `最少输入${rule.min}个字符`
      return
    }

    if (rule.max && typeof value === 'string' && value.length > rule.max) {
      error.value = rule.message || `最多输入${rule.max}个字符`
      return
    }

    if (
      rule.pattern &&
      typeof value === 'string' &&
      !rule.pattern.test(value)
    ) {
      error.value = rule.message || '格式不正确'
      return
    }

    if (
      rule.type === 'email' &&
      value &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      error.value = rule.message || '请输入有效的邮箱地址'
      return
    }
  }
}
</script>

<style scoped>
.mock-field {
  margin-bottom: 1rem;
}

/* 标签位置样式 */
.mock-field.label-top {
  display: block;
}

.mock-field.label-left,
.mock-field.label-right {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.mock-field.label-right {
  flex-direction: row-reverse;
}

.mock-field.label-right .field-content {
  order: 1;
}

.mock-field.label-right .label-right {
  order: 2;
}

.field-content {
  flex: 1;
  min-width: 0;
}

.field-label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
  line-height: 1.4;
}

.label-top {
  display: block;
  margin-bottom: 0.5rem;
}

.label-left,
.label-right {
  display: flex;
  align-items: center;
  margin: 0;
  padding-top: 6px; /* 与输入框对齐 */
  white-space: nowrap;
}

.required {
  color: #ff4d4f;
  margin-left: 2px;
}

.field-input {
  position: relative;
}

.input,
.select,
.textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.input:disabled,
.select:disabled,
.textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.textarea {
  resize: vertical;
  min-height: 80px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.radio-item,
.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-item input,
.checkbox-item input {
  margin: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: 0.2s;
}

.switch-slider:before {
  position: absolute;
  content: '';
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: 0.2s;
}

.switch input:checked + .switch-slider {
  background-color: #667eea;
}

.switch input:checked + .switch-slider:before {
  transform: translateX(20px);
}

.field-error {
  color: #ff4d4f;
  font-size: 0.8rem;
  margin-top: 4px;
}

.has-error .input,
.has-error .select,
.has-error .textarea {
  border-color: #ff4d4f;
}

.has-error .input:focus,
.has-error .select:focus,
.has-error .textarea:focus {
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}
</style>
