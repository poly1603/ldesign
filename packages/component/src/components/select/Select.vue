<template>
  <div
    ref="selectRef"
    :class="selectClass"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <!-- 选择器输入框 -->
    <div
      ref="inputRef"
      :class="inputClass"
      :tabindex="disabled ? -1 : 0"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <!-- 多选标签 -->
      <div v-if="multiple && selectedOptions.length > 0" class="ld-select__tags">
        <span
          v-for="option in selectedOptions"
          :key="option.value"
          class="ld-select__tag"
        >
          {{ option.label }}
          <i
            class="ld-select__tag-close"
            @click.stop="removeTag(option.value)"
          >×</i>
        </span>
      </div>

      <!-- 单选显示文本 -->
      <span
        v-else-if="!multiple && selectedOption"
        class="ld-select__selected-text"
      >
        {{ selectedOption.label }}
      </span>

      <!-- 占位符 -->
      <span
        v-else
        class="ld-select__placeholder"
      >
        {{ placeholder }}
      </span>

      <!-- 搜索输入框 -->
      <input
        v-if="filterable && visible"
        ref="filterInputRef"
        v-model="filterText"
        class="ld-select__filter-input"
        @input="handleFilterInput"
        @keydown.stop
      />

      <!-- 清空按钮 -->
      <i
        v-if="clearable && hasValue && !disabled"
        class="ld-select__clear"
        @click.stop="handleClear"
      >×</i>

      <!-- 下拉箭头 -->
      <i :class="arrowClass">▼</i>
    </div>

    <!-- 下拉面板 -->
    <transition name="ld-select-dropdown">
      <div
        v-show="visible"
        :class="dropdownClass"
        :style="dropdownStyle"
      >
        <!-- 加载状态 -->
        <div v-if="loading" class="ld-select__loading">
          {{ loadingText }}
        </div>

        <!-- 选项列表 -->
        <div v-else-if="filteredOptions.length > 0" class="ld-select__options">
          <div
            v-for="option in filteredOptions"
            :key="option.value"
            :class="getOptionClass(option)"
            @click="selectOption(option)"
          >
            {{ option.label }}
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else class="ld-select__empty">
          {{ filterText ? noMatchText : noDataText }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onUnmounted } from 'vue'
import { selectProps, selectEmits, type SelectOption } from './types'

defineOptions({
  name: 'LSelect'
})

const props = defineProps(selectProps)
const emit = defineEmits(selectEmits)

// 模板引用
const selectRef = ref<HTMLElement>()
const inputRef = ref<HTMLElement>()
const filterInputRef = ref<HTMLInputElement>()

// 响应式状态
const visible = ref(false)
const filterText = ref('')
const focusedIndex = ref(-1)

// 计算属性
const selectClass = computed(() => [
  'ld-select',
  `ld-select--${props.size}`,
  {
    'ld-select--disabled': props.disabled,
    'ld-select--multiple': props.multiple,
    'ld-select--filterable': props.filterable,
    'ld-select--visible': visible.value
  }
])

const inputClass = computed(() => [
  'ld-select__input',
  {
    'ld-select__input--focus': visible.value
  }
])

const arrowClass = computed(() => [
  'ld-select__arrow',
  {
    'ld-select__arrow--reverse': visible.value
  }
])

const dropdownClass = computed(() => [
  'ld-select__dropdown',
  props.popperClass
])

const dropdownStyle = computed(() => ({}))

// 选中的选项
const selectedOption = computed(() => {
  if (props.multiple) return null
  return props.options.find(option => option.value === props.modelValue)
})

const selectedOptions = computed(() => {
  if (!props.multiple) return []
  const values = Array.isArray(props.modelValue) ? props.modelValue : []
  return props.options.filter(option => values.includes(option.value))
})

// 是否有值
const hasValue = computed(() => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.length > 0
  }
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== ''
})

// 过滤后的选项
const filteredOptions = computed(() => {
  if (!props.filterable || !filterText.value) {
    return props.options
  }
  return props.options.filter(option =>
    option.label.toLowerCase().includes(filterText.value.toLowerCase())
  )
})

// 获取选项样式类
const getOptionClass = (option: SelectOption) => [
  'ld-select__option',
  {
    'ld-select__option--disabled': option.disabled,
    'ld-select__option--selected': isSelected(option)
  }
]

// 判断选项是否被选中
const isSelected = (option: SelectOption) => {
  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? props.modelValue : []
    return values.includes(option.value)
  }
  return props.modelValue === option.value
}

// 事件处理
const handleClick = () => {
  if (props.disabled) return
  toggleVisible()
}

const handleFocus = (event: FocusEvent) => {
  if (props.disabled) return
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  if (props.disabled) return
  emit('blur', event)
  // 延迟隐藏下拉框，以便处理选项点击
  setTimeout(() => {
    if (!selectRef.value?.contains(document.activeElement)) {
      hideDropdown()
    }
  }, 200)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()
      if (!visible.value) {
        showDropdown()
      } else if (focusedIndex.value >= 0) {
        selectOption(filteredOptions.value[focusedIndex.value])
      }
      break
    case 'Escape':
      hideDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (!visible.value) {
        showDropdown()
      } else {
        focusedIndex.value = Math.min(focusedIndex.value + 1, filteredOptions.value.length - 1)
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

const handleFilterInput = () => {
  // 过滤输入处理
}

const handleClear = () => {
  const newValue = props.multiple ? [] : undefined
  emit('update:modelValue', newValue as any)
  emit('change', newValue as any)
  emit('clear')
  hideDropdown()
}

// 选择选项
const selectOption = (option: SelectOption) => {
  if (option.disabled) return

  let newValue: string | number | (string | number)[]

  if (props.multiple) {
    const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = values.indexOf(option.value)

    if (index > -1) {
      values.splice(index, 1)
    } else {
      if (props.multipleLimit > 0 && values.length >= props.multipleLimit) {
        return
      }
      values.push(option.value)
    }
    newValue = values
  } else {
    newValue = option.value
    hideDropdown()
  }

  emit('update:modelValue', newValue)
  emit('change', newValue)
}

// 移除标签
const removeTag = (value: string | number) => {
  if (props.disabled) return

  const values = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = values.indexOf(value)

  if (index > -1) {
    values.splice(index, 1)
    emit('update:modelValue', values)
    emit('change', values)
    emit('remove-tag', value)
  }
}

// 显示/隐藏下拉框
const toggleVisible = () => {
  if (visible.value) {
    hideDropdown()
  } else {
    showDropdown()
  }
}

const showDropdown = () => {
  if (props.disabled) return
  visible.value = true
  emit('visible-change', true)

  nextTick(() => {
    if (props.filterable && filterInputRef.value) {
      filterInputRef.value.focus()
    }
  })
}

const hideDropdown = () => {
  visible.value = false
  filterText.value = ''
  focusedIndex.value = -1
  emit('visible-change', false)
}

// 实例方法
const focus = () => {
  inputRef.value?.focus()
}

const blur = () => {
  inputRef.value?.blur()
}

const clear = () => {
  handleClear()
}

// 点击外部关闭
const handleClickOutside = (event: Event) => {
  if (!selectRef.value?.contains(event.target as Node)) {
    hideDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露实例方法
defineExpose({
  $el: selectRef,
  focus,
  blur,
  clear
})
</script>

<style lang="less">
@import './select.less';
</style>