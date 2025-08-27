<!--
标签输入组件
-->

<template>
  <div class="tag-input-field">
    <div class="tag-container">
      <div class="tag-list">
        <span
          v-for="(tag, index) in modelValue"
          :key="index"
          class="tag-item"
        >
          {{ tag }}
          <button
            type="button"
            class="tag-remove"
            @click="removeTag(index)"
          >
            ×
          </button>
        </span>
      </div>
      
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled || (maxTags && modelValue.length >= maxTags)"
        class="tag-input"
        @keydown="handleKeydown"
        @blur="handleBlur"
      />
    </div>
    
    <div v-if="maxTags" class="tag-counter">
      {{ modelValue.length }} / {{ maxTags }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface Props {
  modelValue?: string[]
  placeholder?: string
  maxTags?: number
  allowDuplicates?: boolean
  disabled?: boolean
  separator?: string
}

interface Emits {
  (e: 'update:modelValue', value: string[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  placeholder: '输入标签后按回车',
  maxTags: undefined,
  allowDuplicates: false,
  disabled: false,
  separator: ','
})

const emit = defineEmits<Emits>()

// 响应式数据
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

// 添加标签
const addTag = (tag: string) => {
  const trimmedTag = tag.trim()
  
  if (!trimmedTag) return
  
  // 检查是否超过最大数量
  if (props.maxTags && props.modelValue.length >= props.maxTags) {
    return
  }
  
  // 检查是否允许重复
  if (!props.allowDuplicates && props.modelValue.includes(trimmedTag)) {
    return
  }
  
  const newTags = [...props.modelValue, trimmedTag]
  emit('update:modelValue', newTags)
  inputValue.value = ''
}

// 移除标签
const removeTag = (index: number) => {
  if (props.disabled) return
  
  const newTags = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newTags)
  
  // 重新聚焦输入框
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  const { key } = event
  
  if (key === 'Enter' || key === props.separator) {
    event.preventDefault()
    addTag(inputValue.value)
  } else if (key === 'Backspace' && !inputValue.value && props.modelValue.length > 0) {
    // 如果输入框为空且按下退格键，删除最后一个标签
    removeTag(props.modelValue.length - 1)
  }
}

// 处理失焦事件
const handleBlur = () => {
  if (inputValue.value.trim()) {
    addTag(inputValue.value)
  }
}
</script>

<style scoped>
.tag-input-field {
  width: 100%;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  min-height: 40px;
  transition: border-color 0.2s;
}

.tag-container:focus-within {
  border-color: #f39c12;
  outline: none;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f39c12;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  padding: 0;
  margin: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  min-width: 120px;
  padding: 4px 0;
}

.tag-input::placeholder {
  color: #999;
}

.tag-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.tag-counter {
  margin-top: 4px;
  font-size: 12px;
  color: #666;
  text-align: right;
}

.tag-input-field[data-disabled="true"] .tag-container {
  background: #f5f5f5;
  cursor: not-allowed;
}

.tag-input-field[data-disabled="true"] .tag-remove {
  cursor: not-allowed;
  opacity: 0.6;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .tag-input {
    min-width: 80px;
  }
  
  .tag-item {
    font-size: 11px;
    padding: 3px 6px;
  }
}
</style>
