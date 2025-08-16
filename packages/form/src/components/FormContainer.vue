<script setup lang="ts">
import { computed } from 'vue'
import FormLabel from './FormLabel.vue'

interface Props {
  /** 标签文本 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 是否显示冒号 */
  showColon?: boolean
  /** 标签位置 */
  labelPosition?: 'left' | 'right' | 'top' | 'none'
  /** 标签宽度 */
  labelWidth?: string | number
  /** 标签对齐方式 */
  labelAlign?: 'left' | 'center' | 'right'
  /** 标签与组件间距 */
  labelGap?: number
  /** 关联的表单控件ID */
  for?: string
  /** 提示信息 */
  tooltip?: string
  /** 错误信息 */
  errorMessage?: string
  /** 是否显示错误 */
  showError?: boolean
  /** 描述信息 */
  description?: string
  /** 是否显示标签 */
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'top',
  labelAlign: 'left',
  labelGap: 8,
  showColon: false,
  showError: true,
  showLabel: true,
})

// 计算容器类名
const containerClasses = computed(() => [
  'form-container',
  `form-container--label-${props.labelPosition}`,
  {
    'form-container--has-label': props.showLabel && props.label,
    'form-container--required': props.required,
    'form-container--error': props.showError && props.errorMessage,
  },
])

// 计算容器样式
const containerStyle = computed(() => {
  const style: Record<string, any> = {}

  if (props.labelPosition === 'left' || props.labelPosition === 'right') {
    style.display = 'flex'
    style.alignItems = 'flex-start'
    if (props.labelPosition === 'right') {
      style.flexDirection = 'row-reverse'
    }
  } else {
    style.display = 'flex'
    style.flexDirection = 'column'
  }

  return style
})
</script>

<template>
  <div class="form-container" :class="containerClasses" :style="containerStyle">
    <!-- 标签 -->
    <FormLabel
      v-if="showLabel"
      :label="label"
      :required="required"
      :show-colon="showColon"
      :position="labelPosition"
      :width="labelWidth"
      :align="labelAlign"
      :gap="labelGap"
      :for="for"
      :tooltip="tooltip"
    />

    <!-- 内容区域 -->
    <div
      class="form-container__content"
      :class="{
        'form-container__content--full-width':
          !showLabel || !label || labelPosition === 'none',
      }"
    >
      <!-- 表单控件插槽 -->
      <slot />

      <!-- 错误信息 -->
      <div v-if="showError && errorMessage" class="form-container__error">
        {{ errorMessage }}
      </div>

      <!-- 描述信息 -->
      <div v-if="description" class="form-container__description">
        {{ description }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-container {
  width: 100%;
}

/* 标签位置：顶部（默认） */
.form-container--label-top {
  display: flex;
  flex-direction: column;
}

/* 标签位置：左侧 */
.form-container--label-left {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/* 标签位置：右侧 */
.form-container--label-right {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
}

/* 无标签 */
.form-container--label-none {
  display: flex;
  flex-direction: column;
}

.form-container__content {
  flex: 1;
  min-width: 0;
}

.form-container__content--full-width {
  width: 100%;
}

.form-container__error {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-sm, 12px);
  color: var(--form-color-error, #f5222d);
  line-height: 1.4;
}

.form-container__description {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-sm, 12px);
  color: var(--form-text-secondary, #8c8c8c);
  line-height: 1.4;
}

/* 错误状态样式 */
.form-container--error .form-container__content {
  /* 可以添加错误状态的特殊样式 */
}
</style>
