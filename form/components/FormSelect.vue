<template>
  <div class="ldesign-form-select" :class="wrapperClasses">
    <div 
      ref="triggerRef"
      class="ldesign-form-select__trigger"
      :class="triggerClasses"
      @click="handleToggle"
      @keydown="handleKeydown"
      tabindex="0"
    >
      <div class="ldesign-form-select__content">
        <span v-if="displayText" class="ldesign-form-select__text">{{ displayText }}</span>
        <span v-else class="ldesign-form-select__placeholder">{{ placeholder }}</span>
      </div>
      <div class="ldesign-form-select__suffix">
        <svg 
          class="ldesign-form-select__arrow" 
          :class="{ 'is-reverse': visible }"
          viewBox="0 0 16 16" 
          width="16" 
          height="16"
        >
          <path d="M3.5 5.5L8 10l4.5-4.5L13 6l-5 5-5-5z"/>
        </svg>
      </div>
    </div>
    
    <Teleport to="body">
      <Transition name="ldesign-select-dropdown">
        <div 
          v-if="visible"
          ref="dropdownRef"
          class="ldesign-form-select__dropdown"
          :style="dropdownStyle"
        >
          <div class="ldesign-form-select__options">
            <div 
              v-for="(option, index) in normalizedOptions"
              :key="option.value"
              class="ldesign-form-select__option"
              :class="{
                'is-selected': isSelected(option.value),
                'is-disabled': option.disabled,
                'is-focused': focusedIndex === index
              }"
              @click="handleSelect(option)"
              @mouseenter="focusedIndex = index"
            >
              <span class="ldesign-form-select__option-text">{{ option.label }}</span>
              <svg 
                v-if="isSelected(option.value)"
                class="ldesign-form-select__check"
                viewBox="0 0 16 16" 
                width="16" 
                height="16"
              >
                <path d="M6.5 10.5L3 7l1.5-1.5L6.5 7.5 11.5 2.5 13 4z"/>
              </svg>
            </div>
            <div v-if="normalizedOptions.length === 0" class="ldesign-form-select__empty">
              {{ emptyText }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <div v-if="error" class="ldesign-form-select__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

interface Option {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  modelValue?: any
  options?: Option[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  multiple?: boolean
  error?: string
  size?: 'small' | 'medium' | 'large'
  emptyText?: string
}

interface Emits {
  'update:modelValue': [value: any]
  'change': [value: any, option: Option | Option[]]
  'blur': []
  'focus': []
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  emptyText: '暂无数据',
  placeholder: '请选择'
})

const emit = defineEmits<Emits>()

const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const visible = ref(false)
const focusedIndex = ref(-1)
const dropdownStyle = ref({})

// 标准化选项
const normalizedOptions = computed(() => {
  return props.options?.map(option => {
    if (typeof option === 'string') {
      return { label: option, value: option }
    }
    return option
  }) || []
})

// 显示文本
const displayText = computed(() => {
  if (props.multiple) {
    if (Array.isArray(props.modelValue) && props.modelValue.length > 0) {
      const selectedOptions = normalizedOptions.value.filter(option => 
        props.modelValue.includes(option.value)
      )
      return selectedOptions.map(option => option.label).join(', ')
    }
    return ''
  } else {
    const selectedOption = normalizedOptions.value.find(option => 
      option.value === props.modelValue
    )
    return selectedOption?.label || ''
  }
})

// 样式类
const wrapperClasses = computed(() => ({
  [`ldesign-form-select--${props.size}`]: true,
  'is-disabled': props.disabled,
  'is-error': !!props.error,
  'is-focused': visible.value
}))

const triggerClasses = computed(() => ({
  'is-active': visible.value
}))

// 判断是否选中
const isSelected = (value: any) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value)
  }
  return props.modelValue === value
}

// 计算下拉框位置
const updateDropdownPosition = async () => {
  await nextTick()
  if (!triggerRef.value || !dropdownRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const dropdownRect = dropdownRef.value.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  
  let top = triggerRect.bottom + 4
  let left = triggerRect.left
  
  // 检查是否超出视口底部
  if (top + dropdownRect.height > viewportHeight) {
    top = triggerRect.top - dropdownRect.height - 4
  }
  
  // 检查是否超出视口右侧
  if (left + dropdownRect.width > window.innerWidth) {
    left = window.innerWidth - dropdownRect.width - 4
  }
  
  dropdownStyle.value = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    minWidth: `${triggerRect.width}px`,
    zIndex: 1000
  }
}

// 事件处理
const handleToggle = () => {
  if (props.disabled) return
  
  visible.value = !visible.value
  if (visible.value) {
    emit('focus')
    updateDropdownPosition()
    focusedIndex.value = -1
  } else {
    emit('blur')
  }
}

const handleSelect = (option: Option) => {
  if (option.disabled) return
  
  if (props.multiple) {
    const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValue.indexOf(option.value)
    
    if (index > -1) {
      currentValue.splice(index, 1)
    } else {
      currentValue.push(option.value)
    }
    
    emit('update:modelValue', currentValue)
    emit('change', currentValue, normalizedOptions.value.filter(opt => 
      currentValue.includes(opt.value)
    ))
  } else {
    emit('update:modelValue', option.value)
    emit('change', option.value, option)
    visible.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!visible.value) {
        handleToggle()
      } else if (focusedIndex.value >= 0) {
        const option = normalizedOptions.value[focusedIndex.value]
        if (option && !option.disabled) {
          handleSelect(option)
        }
      }
      break
    case 'Escape':
      visible.value = false
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!visible.value) {
        handleToggle()
      } else {
        focusedIndex.value = Math.min(
          focusedIndex.value + 1, 
          normalizedOptions.value.length - 1
        )
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (visible.value) {
        focusedIndex.value = Math.max(focusedIndex.value - 1, 0)
      }
      break
  }
}

// 点击外部关闭
const handleClickOutside = (event: Event) => {
  if (!triggerRef.value || !dropdownRef.value) return
  
  const target = event.target as Node
  if (!triggerRef.value.contains(target) && !dropdownRef.value.contains(target)) {
    visible.value = false
  }
}

// 监听下拉框显示状态
watch(visible, (newVisible) => {
  if (newVisible) {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateDropdownPosition)
  } else {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateDropdownPosition)
  }
})

onMounted(() => {
  // 初始化
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', updateDropdownPosition)
})

// 暴露方法
defineExpose({
  focus: () => triggerRef.value?.focus(),
  blur: () => {
    visible.value = false
    triggerRef.value?.blur()
  }
})
</script>

<style lang="less" scoped>
.ldesign-form-select {
  position: relative;
  display: inline-block;
  width: 100%;
  
  &__trigger {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--td-border-level-1-color, #dcdcdc);
    border-radius: var(--td-radius-default, 3px);
    background-color: var(--td-bg-color-container, #ffffff);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.38, 0, 0.24, 1);
    
    &:hover {
      border-color: var(--td-border-level-2-color, #b5b5b5);
    }
    
    &:focus {
      outline: none;
      border-color: var(--td-brand-color, #0052d9);
      box-shadow: 0 0 0 2px var(--td-brand-color-focus, rgba(0, 82, 217, 0.1));
    }
    
    &.is-active {
      border-color: var(--td-brand-color, #0052d9);
    }
  }
  
  &__content {
    flex: 1;
    overflow: hidden;
  }
  
  &__text {
    color: var(--td-text-color-primary, #000000);
    font-size: var(--td-font-size-body-medium, 14px);
    line-height: 1.5;
  }
  
  &__placeholder {
    color: var(--td-text-color-placeholder, #bbbbbb);
    font-size: var(--td-font-size-body-medium, 14px);
    line-height: 1.5;
  }
  
  &__suffix {
    margin-left: 8px;
  }
  
  &__arrow {
    color: var(--td-text-color-placeholder, #bbbbbb);
    transition: transform 0.2s;
    
    &.is-reverse {
      transform: rotate(180deg);
    }
  }
  
  &__dropdown {
    background: var(--td-bg-color-container, #ffffff);
    border: 1px solid var(--td-border-level-1-color, #dcdcdc);
    border-radius: var(--td-radius-default, 3px);
    box-shadow: var(--td-shadow-2, 0 3px 14px 2px rgba(0, 0, 0, 0.05), 0 8px 10px 1px rgba(0, 0, 0, 0.06), 0 5px 5px -3px rgba(0, 0, 0, 0.1));
    max-height: 200px;
    overflow-y: auto;
  }
  
  &__options {
    padding: 4px 0;
  }
  
  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &:hover,
    &.is-focused {
      background-color: var(--td-bg-color-component, #f3f3f3);
    }
    
    &.is-selected {
      color: var(--td-brand-color, #0052d9);
      background-color: var(--td-brand-color-light, #f2f3ff);
    }
    
    &.is-disabled {
      color: var(--td-text-color-disabled, #bbbbbb);
      cursor: not-allowed;
      
      &:hover {
        background-color: transparent;
      }
    }
  }
  
  &__option-text {
    flex: 1;
    font-size: var(--td-font-size-body-medium, 14px);
    line-height: 1.5;
  }
  
  &__check {
    width: 16px;
    height: 16px;
    color: var(--td-brand-color, #0052d9);
  }
  
  &__empty {
    padding: 16px 12px;
    text-align: center;
    color: var(--td-text-color-placeholder, #bbbbbb);
    font-size: var(--td-font-size-body-medium, 14px);
  }
  
  &__error {
    margin-top: 4px;
    font-size: var(--td-font-size-body-small, 12px);
    color: var(--td-error-color, #e34d59);
    line-height: 1.4;
  }
  
  // 尺寸变体
  &--small {
    .ldesign-form-select__trigger {
      padding: 4px 8px;
    }
    
    .ldesign-form-select__text,
    .ldesign-form-select__placeholder {
      font-size: var(--td-font-size-body-small, 12px);
    }
  }
  
  &--large {
    .ldesign-form-select__trigger {
      padding: 12px 16px;
    }
    
    .ldesign-form-select__text,
    .ldesign-form-select__placeholder {
      font-size: var(--td-font-size-body-large, 16px);
    }
  }
  
  // 状态变体
  &.is-disabled {
    .ldesign-form-select__trigger {
      background-color: var(--td-bg-color-component-disabled, #f3f3f3);
      color: var(--td-text-color-disabled, #bbbbbb);
      cursor: not-allowed;
      
      &:hover {
        border-color: var(--td-border-level-1-color, #dcdcdc);
      }
    }
  }
  
  &.is-error {
    .ldesign-form-select__trigger {
      border-color: var(--td-error-color, #e34d59);
      
      &:hover,
      &:focus,
      &.is-active {
        border-color: var(--td-error-color, #e34d59);
      }
      
      &:focus {
        box-shadow: 0 0 0 2px var(--td-error-color-focus, rgba(227, 77, 89, 0.1));
      }
    }
  }
}

// 下拉框动画
.ldesign-select-dropdown-enter-active,
.ldesign-select-dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.38, 0, 0.24, 1);
}

.ldesign-select-dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.ldesign-select-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>