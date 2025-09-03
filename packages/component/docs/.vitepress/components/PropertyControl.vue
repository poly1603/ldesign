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

.checkbox-label input[type=\"checkbox\"] {
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
  padding: 6px 8px;\n  font-size: 13px;\n  border: 1px solid var(--vp-c-border);\n  border-radius: 4px;\n  background: var(--vp-c-bg);\n  color: var(--vp-c-text-1);\n  width: 100%;\n  transition: border-color 0.2s;\n}\n\n.control-select:focus,\n.control-number:focus,\n.control-text:focus {\n  outline: none;\n  border-color: var(--vp-c-brand);\n}\n\n.control-color {\n  width: 32px;\n  height: 32px;\n  border: 1px solid var(--vp-c-border);\n  border-radius: 4px;\n  cursor: pointer;\n  padding: 0;\n  background: transparent;\n}\n\n.control-range {\n  flex: 1;\n  accent-color: var(--vp-c-brand);\n}\n\n.range-value {\n  font-size: 12px;\n  color: var(--vp-c-text-2);\n  min-width: 30px;\n  text-align: right;\n}\n</style>"}
