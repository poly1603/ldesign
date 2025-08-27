<!--
颜色选择器组件
-->

<template>
  <div class="color-picker-field">
    <div class="color-display" @click="togglePicker">
      <div 
        class="color-preview" 
        :style="{ backgroundColor: modelValue }"
      ></div>
      <span class="color-value">{{ modelValue }}</span>
      <span class="dropdown-icon">▼</span>
    </div>
    
    <div v-if="showPicker" class="color-picker-panel">
      <div class="preset-colors">
        <div class="preset-title">预设颜色</div>
        <div class="preset-grid">
          <div
            v-for="color in presetColors"
            :key="color"
            :class="['preset-color', { active: modelValue === color }]"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          ></div>
        </div>
      </div>
      
      <div class="custom-color">
        <div class="custom-title">自定义颜色</div>
        <input
          type="color"
          :value="modelValue"
          @input="handleColorInput"
          class="color-input"
        />
      </div>
      
      <div class="color-actions">
        <button @click="confirmColor" class="confirm-btn">确定</button>
        <button @click="cancelColor" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  modelValue?: string
  presetColors?: string[]
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '#000000',
  presetColors: () => [
    '#f39c12', '#e74c3c', '#3498db', '#2ecc71',
    '#9b59b6', '#1abc9c', '#34495e', '#95a5a6',
    '#e67e22', '#c0392b', '#2980b9', '#27ae60',
    '#8e44ad', '#16a085', '#2c3e50', '#7f8c8d'
  ],
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const showPicker = ref(false)
const tempColor = ref(props.modelValue)

// 切换选择器显示
const togglePicker = () => {
  if (props.disabled) return
  showPicker.value = !showPicker.value
  if (showPicker.value) {
    tempColor.value = props.modelValue
  }
}

// 选择预设颜色
const selectColor = (color: string) => {
  tempColor.value = color
}

// 处理颜色输入
const handleColorInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  tempColor.value = target.value
}

// 确认颜色选择
const confirmColor = () => {
  emit('update:modelValue', tempColor.value)
  showPicker.value = false
}

// 取消颜色选择
const cancelColor = () => {
  tempColor.value = props.modelValue
  showPicker.value = false
}

// 点击外部关闭选择器
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const picker = document.querySelector('.color-picker-field')
  
  if (picker && !picker.contains(target)) {
    showPicker.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.color-picker-field {
  position: relative;
  width: 100%;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.color-display:hover {
  border-color: #f39c12;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.color-value {
  flex: 1;
  font-family: monospace;
  font-size: 14px;
  color: #333;
}

.dropdown-icon {
  font-size: 12px;
  color: #666;
  transition: transform 0.2s;
}

.color-picker-field[data-open="true"] .dropdown-icon {
  transform: rotate(180deg);
}

.color-picker-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 16px;
  margin-top: 4px;
}

.preset-colors {
  margin-bottom: 16px;
}

.preset-title,
.custom-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 6px;
}

.preset-color {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-color:hover {
  transform: scale(1.1);
}

.preset-color.active {
  border-color: #f39c12;
  box-shadow: 0 0 0 2px rgba(243, 156, 18, 0.3);
}

.custom-color {
  margin-bottom: 16px;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.confirm-btn,
.cancel-btn {
  padding: 6px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.confirm-btn:hover {
  background: #e67e22;
  border-color: #e67e22;
}

.cancel-btn {
  background: white;
  color: #666;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

.color-picker-field[disabled] .color-display {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
