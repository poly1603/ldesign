<template>
  <div
    ref="selectRef"
    :class="[
      'l-form-select',
      `l-form-select--${size}`,
      {
        'l-form-select--disabled': disabled,
        'l-form-select--readonly': readonly,
        'l-form-select--error': hasError,
        'l-form-select--focused': isFocused,
        'l-form-select--open': isOpen,
        'l-form-select--multiple': multiple,
        'l-form-select--clearable': clearable && hasValue
      }
    ]"
    @click="handleClick"
    @keydown="handleKeydown"
    tabindex="0"
  >
    <!-- 选择器显示区域 -->
    <div class="l-form-select__selector">
      <!-- 单选显示 -->
      <div v-if="!multiple" class="l-form-select__selection">
        <span v-if="selectedOption" class="l-form-select__selection-item">
          {{ selectedOption.label }}
        </span>
        <span v-else class="l-form-select__placeholder">
          {{ placeholder }}
        </span>
      </div>
      
      <!-- 多选显示 -->
      <div v-else class="l-form-select__selection l-form-select__selection--multiple">
        <template v-if="selectedOptions.length > 0">
          <span
            v-for="(option, index) in selectedOptions"
            :key="option.value"
            class="l-form-select__selection-item l-form-select__selection-item--multiple"
          >
            {{ option.label }}
            <button
              v-if="!disabled && !readonly"
              type="button"
              class="l-form-select__selection-item-remove"
              @click.stop="removeOption(option.value)"
            >
              ×
            </button>
          </span>
        </template>
        <span v-else class="l-form-select__placeholder">
          {{ placeholder }}
        </span>
      </div>
      
      <!-- 清除按钮 -->
      <button
        v-if="clearable && hasValue && !disabled && !readonly"
        type="button"
        class="l-form-select__clear"
        @click.stop="handleClear"
      >
        ×
      </button>
      
      <!-- 下拉箭头 -->
      <i
        :class="[
          'l-form-select__arrow',
          {
            'l-form-select__arrow--open': isOpen
          }
        ]"
      ></i>
    </div>
    
    <!-- 下拉面板 -->
    <Transition name="l-select-dropdown">
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="l-form-select__dropdown"
        :style="dropdownStyles"
      >
        <!-- 搜索框 -->
        <div v-if="filterable" class="l-form-select__search">
          <input
            ref="searchInputRef"
            v-model="searchKeyword"
            type="text"
            class="l-form-select__search-input"
            :placeholder="searchPlaceholder"
            @click.stop
            @keydown.stop="handleSearchKeydown"
          />
        </div>
        
        <!-- 选项列表 -->
        <div class="l-form-select__options" :style="optionsStyles">
          <!-- 加载状态 -->
          <div v-if="loading" class="l-form-select__loading">
            <i class="l-form-select__loading-icon"></i>
            <span>{{ loadingText }}</span>
          </div>
          
          <!-- 空状态 -->
          <div v-else-if="filteredOptions.length === 0" class="l-form-select__empty">
            {{ emptyText }}
          </div>
          
          <!-- 选项 -->
          <template v-else>
            <div
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :class="[
                'l-form-select__option',
                {
                  'l-form-select__option--selected': isOptionSelected(option.value),
                  'l-form-select__option--disabled': option.disabled,
                  'l-form-select__option--highlighted': highlightedIndex === index
                }
              ]"
              @click="handleOptionClick(option)"
              @mouseenter="highlightedIndex = index"
            >
              <!-- 多选复选框 -->
              <input
                v-if="multiple"
                type="checkbox"
                class="l-form-select__option-checkbox"
                :checked="isOptionSelected(option.value)"
                @click.stop
              />
              
              <!-- 选项内容 -->
              <span class="l-form-select__option-label">{{ option.label }}</span>
              
              <!-- 选中图标 -->
              <i
                v-if="!multiple && isOptionSelected(option.value)"
                class="l-form-select__option-check"
              ></i>
            </div>
          </template>
        </div>
        
        <!-- 加载更多 -->
        <div
          v-if="hasMore && !loading"
          class="l-form-select__load-more"
          @click="handleLoadMore"
        >
          加载更多
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onUnmounted,
  type CSSProperties
} from 'vue'
import type { SizeType, OptionItem } from '../../../types'

// 组件属性
interface Props {
  id?: string
  value?: any
  options?: OptionItem[]
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  hasError?: boolean
  multiple?: boolean
  clearable?: boolean
  filterable?: boolean
  searchPlaceholder?: string
  loading?: boolean
  loadingText?: string
  emptyText?: string
  maxHeight?: number
  hasMore?: boolean
  // 远程搜索
  remote?: boolean
  remoteMethod?: (keyword: string) => Promise<OptionItem[]>
  // 虚拟滚动
  virtualScroll?: boolean
  itemHeight?: number
}

// 组件事件
interface Emits {
  (e: 'update:value', value: any): void
  (e: 'change', value: any, option: OptionItem | OptionItem[]): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'search', keyword: string): void
  (e: 'load-more'): void
  (e: 'visible-change', visible: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  value: undefined,
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  readonly: false,
  size: 'medium',
  hasError: false,
  multiple: false,
  clearable: false,
  filterable: false,
  searchPlaceholder: '请输入关键词',
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  maxHeight: 200,
  hasMore: false,
  remote: false,
  virtualScroll: false,
  itemHeight: 32
})

const emit = defineEmits<Emits>()

// 响应式引用
const selectRef = ref<HTMLDivElement>()
const dropdownRef = ref<HTMLDivElement>()
const searchInputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const isOpen = ref(false)
const searchKeyword = ref('')
const highlightedIndex = ref(-1)

// 计算属性
const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.value) && props.value.length > 0
  }
  return props.value !== undefined && props.value !== null && props.value !== ''
})

const selectedOption = computed(() => {
  if (props.multiple || !hasValue.value) return null
  return props.options.find(option => option.value === props.value) || null
})

const selectedOptions = computed(() => {
  if (!props.multiple || !hasValue.value) return []
  const values = Array.isArray(props.value) ? props.value : [props.value]
  return props.options.filter(option => values.includes(option.value))
})

const filteredOptions = computed(() => {
  if (!props.filterable || !searchKeyword.value) {
    return props.options
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(keyword)
  )
})

const dropdownStyles = computed((): CSSProperties => {
  return {
    maxHeight: `${props.maxHeight}px`
  }
})

const optionsStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {
    maxHeight: `${props.maxHeight - (props.filterable ? 40 : 0)}px`,
    overflowY: 'auto'
  }
  
  if (props.virtualScroll) {
    styles.height = `${Math.min(filteredOptions.value.length * props.itemHeight, props.maxHeight)}px`
  }
  
  return styles
})

// 方法
const handleClick = () => {
  if (props.disabled || props.readonly) return
  
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled || props.readonly) return
  
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (isOpen.value) {
        selectHighlightedOption()
      } else {
        open()
      }
      break
    case 'Escape':
      close()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (isOpen.value) {
        highlightNext()
      } else {
        open()
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      if (isOpen.value) {
        highlightPrev()
      }
      break
    case 'Tab':
      close()
      break
  }
}

const handleSearchKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightNext()
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightPrev()
      break
    case 'Enter':
      event.preventDefault()
      selectHighlightedOption()
      break
    case 'Escape':
      close()
      break
  }
}

const handleOptionClick = (option: OptionItem) => {
  if (option.disabled) return
  
  if (props.multiple) {
    toggleOption(option.value)
  } else {
    selectOption(option.value)
    close()
  }
}

const handleClear = () => {
  const newValue = props.multiple ? [] : undefined
  emit('update:value', newValue)
  emit('change', newValue, props.multiple ? [] : null)
  emit('clear')
}

const handleLoadMore = () => {
  emit('load-more')
}

const open = () => {
  if (isOpen.value) return
  
  isOpen.value = true
  highlightedIndex.value = -1
  
  nextTick(() => {
    if (props.filterable && searchInputRef.value) {
      searchInputRef.value.focus()
    }
    
    // 滚动到选中项
    scrollToSelected()
  })
  
  emit('visible-change', true)
}

const close = () => {
  if (!isOpen.value) return
  
  isOpen.value = false
  searchKeyword.value = ''
  highlightedIndex.value = -1
  
  emit('visible-change', false)
}

const selectOption = (value: any) => {
  emit('update:value', value)
  const option = props.options.find(opt => opt.value === value)
  emit('change', value, option || null)
}

const toggleOption = (value: any) => {
  const currentValues = Array.isArray(props.value) ? [...props.value] : []
  const index = currentValues.indexOf(value)
  
  if (index > -1) {
    currentValues.splice(index, 1)
  } else {
    currentValues.push(value)
  }
  
  emit('update:value', currentValues)
  const selectedOptions = props.options.filter(opt => currentValues.includes(opt.value))
  emit('change', currentValues, selectedOptions)
}

const removeOption = (value: any) => {
  toggleOption(value)
}

const isOptionSelected = (value: any): boolean => {
  if (props.multiple) {
    return Array.isArray(props.value) && props.value.includes(value)
  }
  return props.value === value
}

const highlightNext = () => {
  const maxIndex = filteredOptions.value.length - 1
  if (highlightedIndex.value < maxIndex) {
    highlightedIndex.value++
  } else {
    highlightedIndex.value = 0
  }
  scrollToHighlighted()
}

const highlightPrev = () => {
  const maxIndex = filteredOptions.value.length - 1
  if (highlightedIndex.value > 0) {
    highlightedIndex.value--
  } else {
    highlightedIndex.value = maxIndex
  }
  scrollToHighlighted()
}

const selectHighlightedOption = () => {
  const option = filteredOptions.value[highlightedIndex.value]
  if (option && !option.disabled) {
    handleOptionClick(option)
  }
}

const scrollToSelected = () => {
  // 滚动到选中项的逻辑
}

const scrollToHighlighted = () => {
  // 滚动到高亮项的逻辑
}

const handleClickOutside = (event: Event) => {
  if (selectRef.value && !selectRef.value.contains(event.target as Node)) {
    close()
  }
}

// 监听搜索关键词变化
watch(searchKeyword, (newKeyword) => {
  if (props.remote && props.remoteMethod) {
    props.remoteMethod(newKeyword)
  }
  emit('search', newKeyword)
  highlightedIndex.value = -1
})

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  open,
  close,
  focus: () => selectRef.value?.focus(),
  blur: () => selectRef.value?.blur()
})
</script>

<style lang="less">
.l-form-select {
  position: relative;
  display: inline-block;
  width: 100%;
  cursor: pointer;
  outline: none;
  
  &__selector {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 32px;
    padding: 4px 24px 4px 8px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    background-color: var(--background-color, #ffffff);
    transition: all 0.2s ease-in-out;
  }
  
  &__selection {
    flex: 1;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    min-height: 24px;
    
    &--multiple {
      min-height: auto;
    }
  }
  
  &__selection-item {
    color: var(--text-color-primary, #262626);
    font-size: 14px;
    line-height: 1.5;
    
    &--multiple {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      background-color: var(--background-color-light, #fafafa);
      border: 1px solid var(--border-color-light, #f0f0f0);
      border-radius: 2px;
      font-size: 12px;
    }
  }
  
  &__selection-item-remove {
    margin-left: 4px;
    border: none;
    background: none;
    color: var(--text-color-secondary, #8c8c8c);
    cursor: pointer;
    font-size: 14px;
    
    &:hover {
      color: var(--text-color-primary, #262626);
    }
  }
  
  &__placeholder {
    color: var(--text-color-placeholder, #bfbfbf);
    font-size: 14px;
  }
  
  &__clear {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background-color: var(--border-color, #d9d9d9);
    color: var(--background-color, #ffffff);
    font-size: 12px;
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      background-color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__arrow {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid var(--text-color-secondary, #8c8c8c);
    transition: transform 0.2s ease-in-out;
    
    &--open {
      transform: translateY(-50%) rotate(180deg);
    }
  }
  
  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    margin-top: 4px;
    background-color: var(--background-color, #ffffff);
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &__search {
    padding: 8px;
    border-bottom: 1px solid var(--border-color-light, #f0f0f0);
  }
  
  &__search-input {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 2px;
    font-size: 14px;
    outline: none;
    
    &:focus {
      border-color: var(--primary-color, #1890ff);
    }
  }
  
  &__options {
    overflow-y: auto;
  }
  
  &__option {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1.5;
    transition: background-color 0.2s ease-in-out;
    
    &:hover,
    &--highlighted {
      background-color: var(--background-color-light, #fafafa);
    }
    
    &--selected {
      background-color: var(--primary-color-light, #e6f7ff);
      color: var(--primary-color, #1890ff);
    }
    
    &--disabled {
      color: var(--text-color-disabled, #bfbfbf);
      cursor: not-allowed;
      
      &:hover {
        background-color: transparent;
      }
    }
  }
  
  &__option-checkbox {
    margin-right: 8px;
  }
  
  &__option-label {
    flex: 1;
  }
  
  &__option-check {
    margin-left: 8px;
    color: var(--primary-color, #1890ff);
    
    &::before {
      content: '✓';
    }
  }
  
  &__loading,
  &__empty {
    padding: 16px;
    text-align: center;
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 14px;
  }
  
  &__loading-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-color, #d9d9d9);
    border-top-color: var(--primary-color, #1890ff);
    border-radius: 50%;
    animation: l-select-spin 1s linear infinite;
    margin-right: 8px;
  }
  
  &__load-more {
    padding: 8px 12px;
    text-align: center;
    color: var(--primary-color, #1890ff);
    cursor: pointer;
    border-top: 1px solid var(--border-color-light, #f0f0f0);
    
    &:hover {
      background-color: var(--background-color-light, #fafafa);
    }
  }
  
  // 状态样式
  &:hover:not(&--disabled):not(&--readonly) {
    .l-form-select__selector {
      border-color: var(--primary-color, #1890ff);
    }
  }
  
  &--focused,
  &--open {
    .l-form-select__selector {
      border-color: var(--primary-color, #1890ff);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  &--disabled {
    cursor: not-allowed;
    
    .l-form-select__selector {
      background-color: var(--background-color-disabled, #f5f5f5);
      color: var(--text-color-disabled, #bfbfbf);
    }
  }
  
  &--readonly {
    cursor: default;
    
    .l-form-select__selector {
      background-color: var(--background-color-readonly, #fafafa);
    }
  }
  
  &--error {
    .l-form-select__selector {
      border-color: var(--error-color, #ff4d4f);
    }
    
    &:focus,
    &--open {
      .l-form-select__selector {
        border-color: var(--error-color, #ff4d4f);
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    }
  }
  
  // 尺寸样式
  &--small {
    .l-form-select__selector {
      min-height: 24px;
      padding: 2px 20px 2px 6px;
    }
    
    .l-form-select__selection-item,
    .l-form-select__placeholder {
      font-size: 12px;
    }
  }
  
  &--large {
    .l-form-select__selector {
      min-height: 40px;
      padding: 6px 28px 6px 10px;
    }
    
    .l-form-select__selection-item,
    .l-form-select__placeholder {
      font-size: 16px;
    }
  }
}

// 下拉动画
.l-select-dropdown-enter-active,
.l-select-dropdown-leave-active {
  transition: all 0.2s ease-in-out;
  transform-origin: top;
}

.l-select-dropdown-enter-from,
.l-select-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}

// 旋转动画
@keyframes l-select-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
