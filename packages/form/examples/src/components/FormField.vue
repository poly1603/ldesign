<!--
表单字段组件 - 支持各种字段类型
-->

<template>
  <div :class="['form-field', `field-${field.type}`, { 'field-required': field.required }]">
    <label v-if="field.label" :class="['field-label', { required: field.required }]">
      {{ field.label }}
    </label>

    <!-- 文本输入 -->
    <template v-if="field.type === 'input'">
      <input
        :value="value"
        :type="field.props?.type || 'text'"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="field.disabled"
        :readonly="field.readonly"
        class="field-input"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
      />
    </template>

    <!-- 文本域 -->
    <template v-else-if="field.type === 'textarea'">
      <textarea
        :value="value"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :rows="field.props?.rows || 3"
        :maxlength="field.props?.maxlength"
        class="field-textarea"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
      ></textarea>
    </template>

    <!-- 选择框 -->
    <template v-else-if="field.type === 'select'">
      <select
        :value="value"
        :required="field.required"
        :disabled="field.disabled"
        class="field-select"
        @change="handleSelectChange"
      >
        <option value="" disabled>{{ field.placeholder || '请选择' }}</option>
        <option
          v-for="option in field.props?.options || []"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </template>

    <!-- 单选框组 -->
    <template v-else-if="field.type === 'radio'">
      <div class="field-radio-group">
        <label
          v-for="option in field.props?.options || []"
          :key="option.value"
          class="radio-option"
        >
          <input
            :value="option.value"
            :checked="value === option.value"
            :name="field.name"
            :required="field.required"
            :disabled="field.disabled"
            type="radio"
            @change="handleRadioChange"
          />
          <span class="radio-label">{{ option.label }}</span>
        </label>
      </div>
    </template>

    <!-- 复选框组 -->
    <template v-else-if="field.type === 'checkbox'">
      <div class="field-checkbox-group">
        <label
          v-for="option in field.props?.options || []"
          :key="option.value"
          class="checkbox-option"
        >
          <input
            :value="option.value"
            :checked="Array.isArray(value) && value.includes(option.value)"
            :disabled="field.disabled"
            type="checkbox"
            @change="handleCheckboxChange"
          />
          <span class="checkbox-label">{{ option.label }}</span>
        </label>
      </div>
    </template>

    <!-- 开关 -->
    <template v-else-if="field.type === 'switch'">
      <div class="field-switch">
        <label class="switch-container">
          <input
            :checked="!!value"
            :disabled="field.disabled"
            type="checkbox"
            class="switch-input"
            @change="handleSwitchChange"
          />
          <span class="switch-slider"></span>
        </label>
      </div>
    </template>

    <!-- 日期选择器 -->
    <template v-else-if="field.type === 'date-picker'">
      <input
        :value="value"
        :required="field.required"
        :disabled="field.disabled"
        type="date"
        class="field-date"
        @change="handleDateChange"
      />
    </template>

    <!-- 数字输入 -->
    <template v-else-if="field.type === 'number'">
      <input
        :value="value"
        :placeholder="field.placeholder"
        :required="field.required"
        :disabled="field.disabled"
        :min="field.props?.min"
        :max="field.props?.max"
        :step="field.props?.step"
        type="number"
        class="field-number"
        @input="handleNumberInput"
        @change="handleChange"
      />
    </template>

    <!-- 滑块 -->
    <template v-else-if="field.type === 'slider'">
      <div class="field-slider">
        <input
          :value="value || field.props?.min || 0"
          :min="field.props?.min || 0"
          :max="field.props?.max || 100"
          :step="field.props?.step || 1"
          :disabled="field.disabled"
          type="range"
          class="slider-input"
          @input="handleSliderInput"
        />
        <span class="slider-value">{{ value || field.props?.min || 0 }}</span>
      </div>
    </template>

    <!-- 帮助文本 -->
    <div v-if="field.help" class="field-help">
      {{ field.help }}
    </div>

    <!-- 错误信息 -->
    <div v-if="errors.length > 0" class="field-errors">
      <div v-for="error in errors" :key="error" class="field-error">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
interface Props {
  field: any
  value?: any
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:value': [value: any]
  'change': [value: any]
  'blur': [event: Event]
}>()

// 错误信息
const errors = ref<string[]>([])

// 处理输入
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:value', target.value)
}

// 处理变化
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('change', target.value)
}

// 处理失焦
const handleBlur = (event: Event) => {
  emit('blur', event)
}

// 处理选择框变化
const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:value', target.value)
  emit('change', target.value)
}

// 处理单选框变化
const handleRadioChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  emit('change', target.value)
}

// 处理复选框变化
const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const currentValue = Array.isArray(props.value) ? [...props.value] : []
  
  if (target.checked) {
    if (!currentValue.includes(target.value)) {
      currentValue.push(target.value)
    }
  } else {
    const index = currentValue.indexOf(target.value)
    if (index > -1) {
      currentValue.splice(index, 1)
    }
  }
  
  emit('update:value', currentValue)
  emit('change', currentValue)
}

// 处理开关变化
const handleSwitchChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.checked)
  emit('change', target.checked)
}

// 处理日期变化
const handleDateChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:value', target.value)
  emit('change', target.value)
}

// 处理数字输入
const handleNumberInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value === '' ? null : Number(target.value)
  emit('update:value', value)
}

// 处理滑块输入
const handleSliderInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  emit('update:value', value)
  emit('change', value)
}
</script>

<style scoped>
.form-field {
  margin-bottom: 16px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.field-label.required::after {
  content: ' *';
  color: #ff4d4f;
}

.field-input,
.field-textarea,
.field-select,
.field-date,
.field-number {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.field-input:focus,
.field-textarea:focus,
.field-select:focus,
.field-date:focus,
.field-number:focus {
  outline: none;
  border-color: #f39c12;
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.2);
}

.field-textarea {
  resize: vertical;
  min-height: 80px;
}

.field-radio-group,
.field-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.radio-option input,
.checkbox-option input {
  margin: 0;
}

.field-switch {
  display: flex;
  align-items: center;
}

.switch-container {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;
}

.switch-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 24px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

.switch-input:checked + .switch-slider {
  background-color: #f39c12;
}

.switch-input:checked + .switch-slider:before {
  transform: translateX(20px);
}

.field-slider {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-input {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.slider-input:hover {
  opacity: 1;
}

.slider-input::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f39c12;
  cursor: pointer;
}

.slider-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #f39c12;
  cursor: pointer;
  border: none;
}

.slider-value {
  min-width: 40px;
  text-align: center;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.field-help {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.field-errors {
  margin-top: 4px;
}

.field-error {
  font-size: 12px;
  color: #ff4d4f;
  line-height: 1.4;
}

.field-required {
  position: relative;
}
</style>
