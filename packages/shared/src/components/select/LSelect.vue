<!--
  美化的选择器组件
  支持丰富的动画效果和自定义样式
-->

<template>
  <div class="l-select" :class="[
    `l-select--${size}`,
    {
      'l-select--disabled': disabled,
      'l-select--open': isOpen,
      'l-select--clearable': clearable && hasValue
    }
  ]" @click="handleToggle">
    <!-- 选择器输入框 -->
    <div class="l-select__input">
      <div class="l-select__value">
        <template v-if="selectedOption">
          <!-- 选项图标 -->
          <span v-if="showIcon && selectedOption.icon" class="l-select__icon">
            {{ selectedOption.icon }}
          </span>
          <!-- 选项颜色 -->
          <span v-if="showColor && selectedOption.color" class="l-select__color"
            :style="{ backgroundColor: selectedOption.color }" />
          <!-- 选项标签 -->
          <span class="l-select__label">{{ selectedOption.label }}</span>
        </template>
        <span v-else class="l-select__placeholder">{{ placeholder }}</span>
      </div>

      <!-- 清空按钮 -->
      <button v-if="clearable && hasValue" class="l-select__clear" @click.stop="handleClear">
        ×
      </button>

      <!-- 下拉箭头 -->
      <span class="l-select__arrow" :class="{ 'l-select__arrow--open': isOpen }">
        ▼
      </span>
    </div>

    <!-- 下拉选项列表 -->
    <Transition :name="`l-select-${animation}`" appear>
      <div v-if="isOpen" class="l-select__dropdown"
        :style="{ maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight }">
        <!-- 搜索框 -->
        <div v-if="filterable" class="l-select__search">
          <input v-model="searchQuery" class="l-select__search-input" :placeholder="`搜索${placeholder || '选项'}...`"
            @input="handleSearch" />
        </div>

        <!-- 选项列表 -->
        <div class="l-select__options">
          <template v-for="option in filteredOptions" :key="option.value">
            <div class="l-select__option" :class="{
              'l-select__option--selected': option.value === modelValue,
              'l-select__option--disabled': option.disabled
            }" @click="handleSelect(option)">
              <!-- 选项图标 -->
              <span v-if="showIcon && option.icon" class="l-select__option-icon">
                {{ option.icon }}
              </span>

              <!-- 选项颜色 -->
              <span v-if="showColor && option.color" class="l-select__option-color"
                :style="{ backgroundColor: option.color }" />

              <!-- 选项内容 -->
              <div class="l-select__option-content">
                <span class="l-select__option-label">{{ option.label }}</span>
                <span v-if="showDescription && option.description" class="l-select__option-desc">
                  {{ option.description }}
                </span>
              </div>

              <!-- 选中标记 -->
              <span v-if="option.value === modelValue" class="l-select__option-check">
                ✓
              </span>
            </div>
          </template>

          <!-- 无选项提示 -->
          <div v-if="filteredOptions.length === 0" class="l-select__empty">
            {{ searchQuery ? '无匹配选项' : '暂无选项' }}
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { SelectProps, SelectEmits, SelectOption } from './types'

// Props
const props = withDefaults(defineProps<SelectProps>(), {
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  filterable: false,
  size: 'medium',
  showColor: false,
  showIcon: false,
  showDescription: false,
  maxHeight: 200,
  animation: 'fade',
  animationDuration: 200
})

// Emits
const emit = defineEmits<SelectEmits>()

// 响应式数据
const isOpen = ref(false)
const searchQuery = ref('')

// 计算属性
const selectedOption = computed(() =>
  props.options.find(option => option.value === props.modelValue)
)

const hasValue = computed(() =>
  props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== ''
)

const filteredOptions = computed(() => {
  if (!props.filterable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query) ||
    option.description?.toLowerCase().includes(query)
  )
})

// 方法
const handleToggle = () => {
  if (props.disabled) return

  isOpen.value = !isOpen.value

  if (isOpen.value) {
    emit('open')
  } else {
    emit('close')
    searchQuery.value = ''
  }
}

const handleSelect = (option: SelectOption) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.value, option)

  isOpen.value = false
  searchQuery.value = ''
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
}

const handleSearch = () => {
  emit('search', searchQuery.value)
}

// 点击外部关闭下拉框
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.l-select')) {
    isOpen.value = false
    searchQuery.value = ''
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="less" scoped>
.l-select {
  position: relative;
  display: inline-block;
  width: 100%;

  &__input {
    position: relative;
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      border-color: #40a9ff;
    }
  }

  &__value {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__icon {
    font-size: 16px;
  }

  &__color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #d9d9d9;
  }

  &__label {
    color: #262626;
  }

  &__placeholder {
    color: #bfbfbf;
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    margin-right: 4px;
    border: none;
    background: #bfbfbf;
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s ease;

    &:hover {
      background: #ff4d4f;
    }
  }

  &__arrow {
    font-size: 12px;
    color: #bfbfbf;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    margin-top: 4px;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  &__search {
    padding: 8px;
    border-bottom: 1px solid #f0f0f0;

    &-input {
      width: 100%;
      padding: 4px 8px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      outline: none;

      &:focus {
        border-color: #40a9ff;
      }
    }
  }

  &__options {
    max-height: inherit;
    overflow-y: auto;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #f5f5f5;
    }

    &--selected {
      background: #e6f7ff;
      color: #1890ff;
    }

    &--disabled {
      color: #bfbfbf;
      cursor: not-allowed;

      &:hover {
        background: transparent;
      }
    }

    &-icon {
      font-size: 16px;
    }

    &-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 1px solid #d9d9d9;
    }

    &-content {
      flex: 1;
    }

    &-label {
      display: block;
      font-weight: 500;
    }

    &-desc {
      display: block;
      font-size: 12px;
      color: #8c8c8c;
      margin-top: 2px;
    }

    &-check {
      color: #1890ff;
      font-weight: bold;
    }
  }

  &__empty {
    padding: 16px;
    text-align: center;
    color: #bfbfbf;
    font-size: 14px;
  }

  /* 尺寸变体 */
  &--small {
    .l-select__input {
      padding: 4px 8px;
      font-size: 12px;
    }
  }

  &--large {
    .l-select__input {
      padding: 12px 16px;
      font-size: 16px;
    }
  }

  /* 状态变体 */
  &--disabled {
    .l-select__input {
      background: #f5f5f5;
      color: #bfbfbf;
      cursor: not-allowed;

      &:hover {
        border-color: #d9d9d9;
      }
    }
  }

  &--open {
    .l-select__input {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}

/* 动画效果 */
.l-select-fade-enter-active,
.l-select-fade-leave-active {
  transition: opacity 0.2s ease;
}

.l-select-fade-enter-from,
.l-select-fade-leave-to {
  opacity: 0;
}

.l-select-slide-enter-active,
.l-select-slide-leave-active {
  transition: all 0.2s ease;
}

.l-select-slide-enter-from,
.l-select-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.l-select-zoom-enter-active,
.l-select-zoom-leave-active {
  transition: all 0.2s ease;
}

.l-select-zoom-enter-from,
.l-select-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.l-select-bounce-enter-active {
  animation: l-select-bounce-in 0.3s ease;
}

.l-select-bounce-leave-active {
  animation: l-select-bounce-out 0.2s ease;
}

@keyframes l-select-bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes l-select-bounce-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
