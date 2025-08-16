<script setup lang="ts">
import type { FormSelectProps } from '../types/components'
import type { FieldOption } from '../types/field'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { generateId } from '../utils/common'

interface Props extends FormSelectProps {
  label?: string
  required?: boolean
  showColon?: boolean
  errorMessage?: string
  showError?: boolean
  showLabel?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'search', query: string): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showColon: true,
  showError: true,
  showLabel: true,
  multiple: false,
  filterable: false,
  clearable: false,
  options: () => [],
  noDataText: '暂无数据',
  placeholder: '请选择',
})

const emit = defineEmits<Emits>()

const selectId = ref(generateId('form-select'))
const dropdownVisible = ref(false)
const searchQuery = ref('')
const searchRef = ref<HTMLInputElement>()

// 计算属性
const selectValue = computed({
  get: () => props.modelValue,
  set: (value: any) => emit('update:modelValue', value),
})

const selectedItems = computed(() => {
  if (!props.multiple)
    return []
  const values = Array.isArray(selectValue.value) ? selectValue.value : []
  return props.options.filter(option => values.includes(option.value))
})

const selectedLabel = computed(() => {
  if (props.multiple)
    return ''
  const option = props.options.find(opt => opt.value === selectValue.value)
  return option?.label || ''
})

const hasSelection = computed(() => {
  if (props.multiple) {
    return Array.isArray(selectValue.value) && selectValue.value.length > 0
  }
  return (
    selectValue.value !== undefined
    && selectValue.value !== null
    && selectValue.value !== ''
  )
})

const filteredOptions = computed(() => {
  if (!props.filterable || !searchQuery.value) {
    return props.options
  }

  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query),
  )
})

const selectClasses = computed(() => [
  'form-select',
  `form-select--${props.size}`,
  {
    'form-select--disabled': props.disabled,
    'form-select--multiple': props.multiple,
    'form-select--open': dropdownVisible.value,
  },
])

const labelClasses = computed(() => [
  'form-select__label',
  {
    'form-select__label--required': props.required,
  },
])

const wrapperClasses = computed(() => [
  'form-select__wrapper',
  {
    'form-select__wrapper--focused': dropdownVisible.value,
    'form-select__wrapper--disabled': props.disabled,
    'form-select__wrapper--error': props.showError && props.errorMessage,
  },
])

const dropdownClasses = computed(() => [
  'form-select__dropdown',
  {
    'form-select__dropdown--multiple': props.multiple,
  },
])

// 方法
function handleToggle() {
  if (props.disabled)
    return

  dropdownVisible.value = !dropdownVisible.value

  if (dropdownVisible.value && props.filterable) {
    nextTick(() => {
      searchRef.value?.focus()
    })
  }
}

function handleSelectOption(option: FieldOption) {
  if (option.disabled)
    return

  if (props.multiple) {
    const values = Array.isArray(selectValue.value)
      ? [...selectValue.value]
      : []
    const index = values.indexOf(option.value)

    if (index > -1) {
      values.splice(index, 1)
    }
    else {
      values.push(option.value)
    }

    selectValue.value = values
  }
  else {
    selectValue.value = option.value
    dropdownVisible.value = false
  }

  emit('change', selectValue.value)
}

function handleRemoveTag(value: any) {
  if (props.disabled)
    return

  const values = Array.isArray(selectValue.value) ? [...selectValue.value] : []
  const index = values.indexOf(value)

  if (index > -1) {
    values.splice(index, 1)
    selectValue.value = values
    emit('change', selectValue.value)
  }
}

function handleSearch() {
  emit('search', searchQuery.value)
}

function isSelected(value: any) {
  if (props.multiple) {
    const values = Array.isArray(selectValue.value) ? selectValue.value : []
    return values.includes(value)
  }
  return selectValue.value === value
}

function handleClickOutside(event: Event) {
  const target = event.target as Element
  if (!target.closest('.form-select')) {
    dropdownVisible.value = false
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 监听
watch(dropdownVisible, (visible) => {
  if (!visible) {
    searchQuery.value = ''
  }
})

defineExpose({
  focus: handleToggle,
  blur: () => {
    dropdownVisible.value = false
  },
})
</script>

<template>
  <div class="form-select" :class="selectClasses">
    <div v-if="showLabel" class="form-select__label" :class="labelClasses">
      <label :for="selectId" class="form-select__label-text">
        {{ label }}
        <span v-if="required" class="form-select__required">*</span>
        <span v-if="showColon" class="form-select__colon">:</span>
      </label>
    </div>

    <div
      class="form-select__wrapper"
      :class="wrapperClasses"
      @click="handleToggle"
    >
      <div class="form-select__selection">
        <div v-if="!hasSelection" class="form-select__placeholder">
          {{ placeholder }}
        </div>
        <div v-else class="form-select__selected">
          <template v-if="multiple">
            <span
              v-for="item in selectedItems"
              :key="item.value"
              class="form-select__tag"
            >
              {{ item.label }}
              <button
                type="button"
                class="form-select__tag-close"
                @click.stop="handleRemoveTag(item.value)"
              >
                ×
              </button>
            </span>
          </template>
          <template v-else>
            {{ selectedLabel }}
          </template>
        </div>
      </div>

      <div
        class="form-select__arrow"
        :class="{ 'form-select__arrow--open': dropdownVisible }"
      >
        ▼
      </div>
    </div>

    <div
      v-if="dropdownVisible"
      class="form-select__dropdown"
      :class="dropdownClasses"
    >
      <div v-if="filterable" class="form-select__search">
        <input
          ref="searchRef"
          v-model="searchQuery"
          type="text"
          class="form-select__search-input"
          placeholder="搜索..."
          @input="handleSearch"
        >
      </div>

      <div class="form-select__options">
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          class="form-select__option"
          :class="{
            'form-select__option--selected': isSelected(option.value),
            'form-select__option--disabled': option.disabled,
          }"
          @click="handleSelectOption(option)"
        >
          <span class="form-select__option-label">{{ option.label }}</span>
          <span
            v-if="isSelected(option.value)"
            class="form-select__option-check"
          >✓</span>
        </div>

        <div v-if="filteredOptions.length === 0" class="form-select__empty">
          {{ noDataText }}
        </div>
      </div>
    </div>

    <div v-if="showError && errorMessage" class="form-select__error">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.form-select {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-select__label {
  display: flex;
  align-items: center;
  margin-bottom: var(--form-spacing-xs, 4px);
}

.form-select__label-text {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-primary, #262626);
  font-weight: var(--form-font-weight-medium, 500);
}

.form-select__required {
  color: var(--form-color-error, #f5222d);
  margin-left: 2px;
}

.form-select__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: var(--form-border-width, 1px) var(--form-border-style, solid) var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  background: var(--form-bg-primary, #ffffff);
  cursor: pointer;
  transition: all var(--form-animation-duration-normal, 300ms);
}

.form-select__wrapper--focused {
  border-color: var(--form-border-active, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-select__wrapper--disabled {
  background: var(--form-bg-disabled, #f5f5f5);
  cursor: not-allowed;
}

.form-select__selection {
  flex: 1;
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  min-height: 32px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--form-spacing-xs, 4px);
}

.form-select__placeholder {
  color: var(--form-text-placeholder, #bfbfbf);
}

.form-select__tag {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--form-spacing-xs, 4px);
  background: var(--form-bg-secondary, #fafafa);
  border: 1px solid var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-sm, 2px);
  font-size: var(--form-font-size-xs, 12px);
  gap: var(--form-spacing-xs, 4px);
}

.form-select__tag-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--form-text-secondary, #595959);
}

.form-select__arrow {
  padding: 0 var(--form-spacing-sm, 8px);
  color: var(--form-text-secondary, #595959);
  transition: transform var(--form-animation-duration-normal, 300ms);
}

.form-select__arrow--open {
  transform: rotate(180deg);
}

.form-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: var(--form-bg-primary, #ffffff);
  border: var(--form-border-width, 1px) var(--form-border-style, solid) var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  box-shadow: var(--form-shadow-lg, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
  max-height: 200px;
  overflow: hidden;
}

.form-select__search {
  padding: var(--form-spacing-sm, 8px);
  border-bottom: 1px solid var(--form-border-default, #d9d9d9);
}

.form-select__search-input {
  width: 100%;
  border: none;
  outline: none;
  padding: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-sm, 14px);
}

.form-select__options {
  max-height: 160px;
  overflow-y: auto;
}

.form-select__option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  cursor: pointer;
  transition: background-color var(--form-animation-duration-fast, 150ms);
}

.form-select__option:hover {
  background: var(--form-bg-hover, #f5f5f5);
}

.form-select__option--selected {
  background: var(--form-bg-active, #e6f7ff);
  color: var(--form-color-primary, #1890ff);
}

.form-select__option--disabled {
  color: var(--form-text-disabled, #bfbfbf);
  cursor: not-allowed;
}

.form-select__option-check {
  color: var(--form-color-primary, #1890ff);
}

.form-select__empty {
  padding: var(--form-spacing-base, 16px);
  text-align: center;
  color: var(--form-text-secondary, #595959);
}

.form-select__error {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-color-error, #f5222d);
}
</style>
