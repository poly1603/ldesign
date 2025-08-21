<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /** 标签文本 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 是否显示冒号 */
  showColon?: boolean
  /** 标签位置 */
  position?: 'left' | 'right' | 'top' | 'none'
  /** 标签宽度 */
  width?: string | number
  /** 标签对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 标签与组件间距 */
  gap?: number
  /** 关联的表单控件ID */
  for?: string
  /** 提示信息 */
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  align: 'left',
  gap: 8,
  showColon: false,
})

// 计算标签样式
const labelStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.position === 'left' || props.position === 'right') {
    if (props.width) {
      style.width
        = typeof props.width === 'number' ? `${props.width}px` : props.width
      style.flexShrink = 0
    }
    if (props.gap) {
      if (props.position === 'left') {
        style.marginRight = `${props.gap}px`
      }
      else {
        style.marginLeft = `${props.gap}px`
      }
    }
  }
  else if (props.position === 'top') {
    if (props.gap) {
      style.marginBottom = `${props.gap}px`
    }
  }

  return style
})

// 计算标签类名
const labelClasses = computed(() => [
  'form-label',
  `form-label--${props.align}`,
  {
    'form-label--required': props.required,
  },
])
</script>

<template>
  <div
    v-if="label && position !== 'none'"
    class="form-label"
    :class="labelClasses"
    :style="labelStyle"
  >
    <label :for="for" class="form-label__text">
      {{ label }}
      <span v-if="required" class="form-label__required">*</span>
      <span v-if="showColon" class="form-label__colon">:</span>
    </label>
    <div v-if="tooltip" class="form-label__tooltip" :title="tooltip">
      ?
    </div>
  </div>
</template>

<style scoped>
.form-label {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.form-label--left {
  justify-content: flex-start;
}

.form-label--center {
  justify-content: center;
}

.form-label--right {
  justify-content: flex-end;
}

.form-label__text {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-primary, #262626);
  font-weight: var(--form-font-weight-medium, 500);
  cursor: pointer;
}

.form-label__required {
  color: var(--form-color-error, #f5222d);
  margin-left: 2px;
}

.form-label__colon {
  margin-left: 2px;
}

.form-label__tooltip {
  margin-left: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-color-info, #1890ff);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}
</style>
