<!--
  LDesignForm 组件
  
  @description
  主要的表单组件，提供完整的表单功能
-->

<template>
  <form
    :class="formClasses"
    @submit.prevent="handleSubmit"
    @reset.prevent="handleReset"
  >
    <FormProvider :form="form">
      <slot />
    </FormProvider>
  </form>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, type PropType } from 'vue';
import { useForm } from '../hooks/useForm';
import FormProvider from './FormProvider.vue';
import type { LDesignFormProps, LDesignFormEmits, LDesignFormExpose } from './types';

// === Props 定义 ===
const props = withDefaults(defineProps<LDesignFormProps>(), {
  layout: 'vertical',
  labelAlign: 'left',
  size: 'medium',
  showValidationIcon: true,
  validateOnInput: false,
  validateOnBlur: true,
  validateOnSubmit: true
});

// === Emits 定义 ===
const emit = defineEmits<LDesignFormEmits>();

// === 表单实例 ===
const form = useForm({
  ...props.config,
  initialValues: props.initialValues,
  defaultValues: props.defaultValues
});

// === 计算属性 ===
const formClasses = computed(() => [
  'ldesign-form',
  `ldesign-form--${props.layout}`,
  `ldesign-form--${props.size}`,
  {
    'ldesign-form--disabled': props.disabled,
    'ldesign-form--readonly': props.readonly,
    'ldesign-form--dirty': form.isDirty.value,
    'ldesign-form--valid': form.isValid.value,
    'ldesign-form--invalid': !form.isValid.value,
    'ldesign-form--pending': form.isPending.value,
    'ldesign-form--submitted': form.isSubmitted.value
  }
]);

// === 事件处理 ===
const handleSubmit = async () => {
  if (!props.validateOnSubmit) {
    const data = form.getValues();
    emit('submit', data, true);
    return;
  }

  try {
    const result = await form.submit();
    emit('submit', result.data, result.valid);
  } catch (error) {
    console.error('Form submission error:', error);
    const data = form.getValues();
    emit('submit', data, false);
  }
};

const handleReset = () => {
  form.reset();
  const data = form.getValues();
  emit('reset', data);
};

// === 监听表单变化 ===
watch(
  () => form.data.value,
  (newData) => {
    emit('update:modelValue', newData);
  },
  { deep: true }
);

// 监听字段变化
form.form.onChange((event) => {
  emit('change', form.data.value, event.fieldName, event.value);
});

// 监听验证结果
watch(
  () => form.validation.value,
  (validation) => {
    emit('validate', validation);
  },
  { deep: true }
);

// === 暴露的方法和属性 ===
defineExpose<LDesignFormExpose>({
  form,
  submit: handleSubmit,
  reset: handleReset,
  validate: form.validate,
  clearValidation: form.clearValidation
});
</script>

<script lang="ts">
export default {
  name: 'LDesignForm',
  inheritAttrs: false
};
</script>

<style lang="less">
.ldesign-form {
  // 基础样式
  font-family: inherit;
  font-size: var(--ls-font-size-base);
  line-height: 1.5;
  color: var(--ldesign-text-color-primary);

  // 布局样式
  &--vertical {
    .ldesign-form-item {
      margin-bottom: var(--ls-spacing-base);
    }
  }

  &--horizontal {
    .ldesign-form-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: var(--ls-spacing-base);

      .ldesign-form-item__label {
        flex: 0 0 auto;
        margin-right: var(--ls-spacing-sm);
        margin-bottom: 0;
      }

      .ldesign-form-item__content {
        flex: 1;
      }
    }
  }

  &--inline {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-base);

    .ldesign-form-item {
      display: inline-flex;
      align-items: center;
      margin-bottom: 0;

      .ldesign-form-item__label {
        margin-right: var(--ls-spacing-xs);
        margin-bottom: 0;
      }
    }
  }

  // 尺寸样式
  &--small {
    font-size: var(--ls-font-size-sm);

    .ldesign-form-item {
      margin-bottom: var(--ls-spacing-sm);
    }
  }

  &--large {
    font-size: var(--ls-font-size-lg);

    .ldesign-form-item {
      margin-bottom: var(--ls-spacing-lg);
    }
  }

  // 状态样式
  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--readonly {
    .ldesign-form-item__control {
      pointer-events: none;
    }
  }

  &--dirty {
    // 表单已修改状态样式
  }

  &--valid {
    // 表单有效状态样式
  }

  &--invalid {
    // 表单无效状态样式
  }

  &--pending {
    // 表单验证中状态样式
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      pointer-events: none;
      z-index: 1;
    }
  }

  &--submitted {
    // 表单已提交状态样式
  }
}
</style>
