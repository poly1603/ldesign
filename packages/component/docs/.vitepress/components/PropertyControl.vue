<template>
  <div class="property-control">
    <label class="control-label">
      {{ label }}
      <span v-if="description" class="control-description">{{ description }}</span>
    </label>
    
    <!-- 布尔值控制 -->
    <div v-if="type === 'boolean'" class="control-input">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="modelValue"
          @change="handleBooleanChange"
        />
        <span class="checkbox-text">{{ modelValue ? '启用' : '禁用' }}</span>
      </label>
    </div>
    
    <!-- 选择器控制 -->
    <div v-else-if="type === 'select'" class="control-input">
      <select 
        :value="modelValue"
        @change="handleSelectChange"
        class="control-select"
      >
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    
    <!-- 数字输入控制 -->
    <div v-else-if="type === 'number'" class="control-input">
      <input 
        type="number"
        :value="modelValue"
        @input="handleNumberChange"
        :min="min"
        :max="max"
        :step="step"
        class="control-number"
      />
    </div>
    
    <!-- 文本输入控制 -->
    <div v-else-if="type === 'text'" class="control-input">
      <input 
        type="text"
        :value="modelValue"
        @input="handleTextChange"
        :placeholder="placeholder"
        class="control-text"
      />
    </div>
    
    <!-- 颜色选择器控制 -->
    <div v-else-if="type === 'color'" class="control-input">
      <input 
        type="color"
        :value="modelValue"
        @change="handleColorChange"
        class="control-color"
      />
      <input 
        type="text"
        :value="modelValue"
        @input="handleTextChange"
        class="control-text"
        placeholder="#000000"
      />
    </div>
    
    <!-- 滑块控制 -->
    <div v-else-if="type === 'range'" class="control-input">
      <input 
        type="range"
        :value="modelValue"
        @input="handleNumberChange"
        :min="min"
        :max="max"
        :step="step"
        class="control-range"
      />
      <span class="range-value">{{ modelValue }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  label: string
  value: any
}

interface Props {
  label: string
  description?: string
  type: 'boolean' | 'select' | 'number' | 'text' | 'color' | 'range'
  modelValue: any
  options?: Option[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const handleBooleanChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

const handleSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  let value = target.value
  
  // 尝试转换为合适的类型
  if (value === 'true') value = true as any
  else if (value === 'false') value = false as any
  else if (!isNaN(Number(value)) && value !== '') value = Number(value) as any
  
  emit('update:modelValue', value)
}

const handleNumberChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  emit('update:modelValue', isNaN(value) ? undefined : value)
}

const handleTextChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.property-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.control-description {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: var(--vp-c-text-2);
  margin-top: 2px;
}

.control-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--vp-c-brand);
}

.checkbox-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.control-select,
.control-number,
.control-text {
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  width: 100%;
  transition: border-color 0.2s;
}

.control-select:focus,
.control-number:focus,
.control-text:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.control-color {
  width: 32px;
  height: 32px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
  background: transparent;
}

.control-range {
  flex: 1;
  accent-color: var(--vp-c-brand);
}

.range-value {
  font-size: 12px;
  color: var(--vp-c-text-2);
  min-width: 30px;
  text-align: right;
}
</style>
