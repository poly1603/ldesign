<!--
  LDesignFormItem 组件
  
  @description
  表单项组件，包装表单字段并提供标签、验证信息等
-->

<template>
  <div :class="formItemClasses">
    <!-- 标签 -->
    <div
      v-if="label || $slots.label"
      :class="labelClasses"
      :style="labelStyles"
    >
      <slot name="label">
        <label :for="fieldId" class="ldesign-form-item__label-text">
          {{ label }}
          <span v-if="isRequired" class="ldesign-form-item__required">*</span>
        </label>
      </slot>
    </div>

    <!-- 内容区域 -->
    <div class="ldesign-form-item__content">
      <!-- 控件包装 -->
      <div class="ldesign-form-item__control">
        <slot
          :field="field"
          :value="field.value.value"
          :setValue="(value) => field.setValue(value)"
        />
        
        <!-- 验证图标 -->
        <div
          v-if="showValidationIcon && validationIcon"
          class="ldesign-form-item__icon"
        >
          <component :is="validationIcon" />
        </div>
      </div>

      <!-- 错误信息 -->
      <div class="ldesign-form-item__error">
        <slot name="error" :error="errorMessage">
          {{ errorMessage }}
        </slot>
      </div>

      <!-- 帮助信息 -->
      <div
        v-if="help || $slots.help"
        class="ldesign-form-item__help"
      >
        <slot name="help">{{ help }}</slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, type PropType } from 'vue';
import { useField } from '../hooks/useField';
import { useFormContext } from '../hooks/useFormContext';
import type { LDesignFormItemProps, LDesignFormItemEmits, LDesignFormItemExpose } from './types';

// === Props 定义 ===
const props = withDefaults(defineProps<LDesignFormItemProps>(), {
  labelPosition: 'left',
  labelAlign: 'left',
  size: 'medium',
  showValidationIcon: true
});

// === Emits 定义 ===
const emit = defineEmits<LDesignFormItemEmits>();

// === 获取表单上下文 ===
const formContext = useFormContext();

// === 字段实例 ===
// 优先使用props中的form，如果没有则从上下文中获取
const formInstance = props.form || formContext?.form;

if (!formInstance) {
  throw new Error('LDesignFormItem must be used within a form context or have a form prop');
}

const field = useField(props.name, {
  ...props.config,
  form: formInstance,
  rules: props.rules,
  required: props.required
});

// === 计算属性 ===
const fieldId = computed(() => `field-${props.name}-${Date.now()}`);

const isRequired = computed(() => {
  return props.required ||
         (props.rules && props.rules.some((rule: any) => rule.required)) ||
         (field.field && field.field.config && field.field.config.required);
});

const formItemClasses = computed(() => [
  'ldesign-form-item',
  `ldesign-form-item--${props.size}`,
  `ldesign-form-item--label-${props.labelPosition}`,
  {
    'ldesign-form-item--required': isRequired.value,
    'ldesign-form-item--disabled': props.disabled,
    'ldesign-form-item--readonly': props.readonly,
    'ldesign-form-item--error': hasError.value,
    'ldesign-form-item--success': hasSuccess.value,
    'ldesign-form-item--warning': hasWarning.value,
    'ldesign-form-item--validating': field.isPending.value,
    'ldesign-form-item--dirty': field.isDirty.value,
    'ldesign-form-item--touched': field.isTouched.value,
    'ldesign-form-item--horizontal': props.layout === 'horizontal',
    'ldesign-form-item--inline': props.layout === 'inline'
  }
]);

const labelClasses = computed(() => [
  'ldesign-form-item__label',
  `ldesign-form-item__label--${props.labelAlign}`,
  {
    'ldesign-form-item__label--required': isRequired.value
  }
]);

const labelStyles = computed(() => {
  const styles: Record<string, any> = {};
  
  if (props.labelWidth) {
    if (typeof props.labelWidth === 'number') {
      styles.width = `${props.labelWidth}px`;
    } else {
      styles.width = props.labelWidth;
    }
  }
  
  return styles;
});

const errorMessage = computed(() => {
  if (props.error) return props.error;
  
  const validation = field.validation.value;
  if (validation && !validation.valid) {
    return validation.message;
  }
  
  return '';
});

const hasError = computed(() => {
  return props.validateStatus === 'error' || 
         (field.validation.value && !field.validation.value.valid);
});

const hasSuccess = computed(() => {
  return props.validateStatus === 'success' || 
         (field.validation.value && field.validation.value.valid && field.isTouched.value);
});

const hasWarning = computed(() => {
  return props.validateStatus === 'warning';
});

const validationIcon = computed(() => {
  if (!props.showValidationIcon) return null;
  
  if (field.isPending.value) {
    return 'LoadingIcon'; // 需要实际的图标组件
  }
  
  if (hasError.value) {
    return 'ErrorIcon';
  }
  
  if (hasSuccess.value) {
    return 'SuccessIcon';
  }
  
  if (hasWarning.value) {
    return 'WarningIcon';
  }
  
  return null;
});

// === 事件处理 ===
watch(
  () => field.value.value,
  (newValue) => {
    emit('update:modelValue', newValue);
    emit('change', newValue, props.name);
  }
);

watch(
  () => field.validation.value,
  (validation) => {
    if (validation) {
      emit('validate', validation);
    }
  }
);

// 监听规则变化
watch(
  () => props.rules,
  (newRules) => {
    if (newRules && field.field.config) {
      field.field.config.rules = newRules;
      // 重新验证以应用新规则
      field.validate();
    }
  },
  { deep: true }
);

// === 暴露的方法和属性 ===
defineExpose<LDesignFormItemExpose>({
  field,
  fieldValue: field.value,
  validate: field.validate,
  clearValidation: field.clearValidation,
  reset: field.reset
});
</script>

<script lang="ts">
export default {
  name: 'LDesignFormItem',
  inheritAttrs: false
};
</script>

<style lang="less">
.ldesign-form-item {
  // 基础样式
  position: relative;
  margin-bottom: var(--ls-spacing-base);

  // 标签样式
  &__label {
    display: block;
    margin-bottom: var(--ls-spacing-xs);
    font-weight: 500;
    color: var(--ldesign-text-color-primary);

    &--left {
      text-align: left;
    }

    &--right {
      text-align: right;
    }

    &--center {
      text-align: center;
    }
  }

  &__label-text {
    font-size: inherit;
    line-height: 1.5;
    cursor: pointer;
  }

  &__required {
    color: var(--ldesign-error-color);
    margin-left: 2px;
  }

  // 内容区域
  &__content {
    flex: 1;
  }

  &__control {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    position: absolute;
    right: var(--ls-spacing-xs);
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    z-index: 1;
  }

  // 错误信息
  &__error {
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-error-color);
    line-height: 1.4;
  }

  // 帮助信息
  &__help {
    margin-top: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-xs);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.4;
  }

  // 尺寸变体
  &--small {
    margin-bottom: var(--ls-spacing-sm);
    font-size: var(--ls-font-size-sm);

    .ldesign-form-item__label {
      margin-bottom: calc(var(--ls-spacing-xs) / 2);
    }
  }

  &--large {
    margin-bottom: var(--ls-spacing-lg);
    font-size: var(--ls-font-size-lg);

    .ldesign-form-item__label {
      margin-bottom: var(--ls-spacing-sm);
    }
  }

  // 状态样式
  &--required {
    .ldesign-form-item__label {
      &::after {
        content: '*';
        color: var(--ldesign-error-color);
        margin-left: 2px;
      }
    }
  }

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--readonly {
    .ldesign-form-item__control {
      pointer-events: none;
    }
  }

  &--error {
    .ldesign-form-item__control {
      border-color: var(--ldesign-error-color);
    }
  }

  &--success {
    .ldesign-form-item__control {
      border-color: var(--ldesign-success-color);
    }
  }

  &--warning {
    .ldesign-form-item__control {
      border-color: var(--ldesign-warning-color);
    }
  }

  &--validating {
    .ldesign-form-item__icon {
      animation: spin 1s linear infinite;
    }
  }

  &--dirty {
    // 已修改状态样式
  }

  &--touched {
    // 已触摸状态样式
  }

  // 标签位置变体
  &--label-top {
    // 顶部标签：垂直布局
    .ldesign-form-item__label {
      display: block;
      margin-bottom: var(--ls-spacing-xs);
    }
  }

  &--label-left {
    // 左侧标签：水平布局
    display: flex;
    align-items: flex-start;

    .ldesign-form-item__label {
      flex: 0 0 auto;
      width: var(--label-width);
      min-width: 80px;
      margin-right: var(--ls-spacing-sm);
      margin-bottom: 0;
      padding-top: calc(var(--ls-input-height-medium) / 2 - var(--ls-font-size-base) / 2);
      line-height: var(--ls-font-size-base);
    }

    .ldesign-form-item__content {
      flex: 1;
      min-width: 0; // 防止内容溢出
    }

    // 错误信息在左侧标签模式下需要调整位置
    .ldesign-form-item__error,
    .ldesign-form-item__help {
      margin-left: calc(var(--label-width, 100px) + var(--ls-spacing-sm));
    }
  }
}

@keyframes spin {
  from {
    transform: translateY(-50%) rotate(0deg);
  }
  to {
    transform: translateY(-50%) rotate(360deg);
  }
}
</style>
