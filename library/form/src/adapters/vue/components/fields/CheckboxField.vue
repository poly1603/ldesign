<template>
  <div class="ldesign-checkbox-field" :class="fieldClass">
    <!-- 全选/反选控制 -->
    <div v-if="showCheckAll" class="ldesign-checkbox-all">
      <div
        class="ldesign-checkbox-item"
        :class="{
          'is-checked': isAllChecked,
          'is-indeterminate': isIndeterminate,
          'is-disabled': disabled
        }"
        @click="handleCheckAll"
      >
        <span class="ldesign-checkbox-input">
          <span class="ldesign-checkbox-inner" />
        </span>
        <span class="ldesign-checkbox-label">全选</span>
      </div>
    </div>

    <!-- 选项列表 -->
    <div
      v-for="option in options"
      :key="option.value"
      class="ldesign-checkbox-item"
      :class="{
        'is-disabled': disabled || option.disabled,
        'is-checked': isChecked(option)
      }"
      @click="handleClick(option)"
    >
      <span class="ldesign-checkbox-input">
        <span class="ldesign-checkbox-inner" />
        <input
          type="checkbox"
          :name="name"
          :value="option.value"
          :checked="isChecked(option)"
          :disabled="disabled || option.disabled"
          class="ldesign-checkbox-original"
        />
      </span>
      <span class="ldesign-checkbox-label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface CheckboxOption {
  label: string
  value: any
  disabled?: boolean
}

interface Props {
  modelValue?: any[]
  options?: CheckboxOption[]
  name?: string
  disabled?: boolean
  showCheckAll?: boolean
  min?: number
  max?: number
  direction?: 'horizontal' | 'vertical'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  disabled: false,
  showCheckAll: false,
  direction: 'horizontal'
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  'change': [value: any[], option: CheckboxOption]
}>()

const fieldClass = computed(() => ({
  [`is-${props.direction}`]: true
}))

const checkedValues = computed(() => {
  return Array.isArray(props.modelValue) ? props.modelValue : []
})

// 所有可选项（排除禁用）
const availableOptions = computed(() => {
  return props.options.filter(opt => !opt.disabled)
})

// 是否全选
const isAllChecked = computed(() => {
  return availableOptions.value.length > 0 && 
    availableOptions.value.every(opt => checkedValues.value.includes(opt.value))
})

// 是否半选
const isIndeterminate = computed(() => {
  const checkedCount = availableOptions.value.filter(opt => 
    checkedValues.value.includes(opt.value)
  ).length
  return checkedCount > 0 && checkedCount < availableOptions.value.length
})

const isChecked = (option: CheckboxOption) => {
  return checkedValues.value.includes(option.value)
}

const handleClick = (option: CheckboxOption) => {
  if (props.disabled || option.disabled) return

  const newValues = [...checkedValues.value]
  const index = newValues.indexOf(option.value)

  if (index > -1) {
    // 取消选中 - 检查最小数量限制
    if (props.min !== undefined && newValues.length <= props.min) {
      return
    }
    newValues.splice(index, 1)
  } else {
    // 选中 - 检查最大数量限制
    if (props.max !== undefined && newValues.length >= props.max) {
      return
    }
    newValues.push(option.value)
  }

  emit('update:modelValue', newValues)
  emit('change', newValues, option)
}

const handleCheckAll = () => {
  if (props.disabled) return

  let newValues: any[]
  
  if (isAllChecked.value) {
    // 取消全选
    newValues = []
  } else {
    // 全选
    newValues = availableOptions.value.map(opt => opt.value)
  }

  emit('update:modelValue', newValues)
}
</script>

<style lang="less" scoped>
.ldesign-checkbox-field {
  display: flex;
  gap: 12px;

  &.is-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }

  &.is-vertical {
    flex-direction: column;
  }
}

.ldesign-checkbox-all {
  width: 100%;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 4px;
}

.ldesign-checkbox-item {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 14px;
  line-height: 1;
  transition: all 0.3s;

  &.is-disabled {
    cursor: not-allowed;
    color: rgba(0, 0, 0, 0.25);
  }
}

.ldesign-checkbox-input {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  white-space: nowrap;
  vertical-align: sub;
  outline: none;
  cursor: pointer;
}

.ldesign-checkbox-inner {
  position: relative;
  display: block;
  width: 16px;
  height: 16px;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
  transition: all 0.3s;

  &::after {
    position: absolute;
    top: 50%;
    left: 21%;
    width: 5px;
    height: 9px;
    border: 2px solid #fff;
    border-top: 0;
    border-left: 0;
    transform: rotate(45deg) scale(0) translate(-50%, -50%);
    opacity: 0;
    transition: all 0.2s cubic-bezier(0.12, 0.4, 0.29, 1.46) 0.1s;
    content: '';
  }

  .ldesign-checkbox-item:hover:not(.is-disabled) & {
    border-color: #722ED1;
  }

  .ldesign-checkbox-item.is-checked & {
    background-color: #722ED1;
    border-color: #722ED1;

    &::after {
      transform: rotate(45deg) scale(1) translate(-50%, -50%);
      opacity: 1;
    }
  }

  .ldesign-checkbox-item.is-indeterminate & {
    background-color: #722ED1;
    border-color: #722ED1;

    &::after {
      top: 50%;
      left: 50%;
      width: 8px;
      height: 2px;
      border: none;
      background-color: #fff;
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .ldesign-checkbox-item.is-disabled & {
    background-color: #f5f5f5;
    border-color: #d9d9d9;

    &::after {
      border-color: rgba(0, 0, 0, 0.25);
    }
  }
}

.ldesign-checkbox-original {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  opacity: 0;
  margin: 0;
  pointer-events: none;
}

.ldesign-checkbox-label {
  padding: 0 8px 0 0;
  font-size: 14px;
}
</style>






