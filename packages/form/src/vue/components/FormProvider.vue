<!--
  FormProvider 组件
  
  @description
  提供表单上下文，让子组件可以访问表单实例
-->

<template>
  <div class="ldesign-form-provider">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide, computed, toRef, ref, watch, onUnmounted, type PropType } from 'vue';
import type { ReactiveFormInstance } from '@/types/vue';
import type { FormProviderProps, FormProviderEmits, FormProviderExpose } from './types';
import { FORM_CONTEXT_KEY } from '../hooks/useField';
import { EVENT_NAMES } from '../../core/events';

// === Props 定义 ===
const props = defineProps<FormProviderProps>();

// === Emits 定义 ===
const emit = defineEmits<FormProviderEmits>();

// === 响应式表单数据 ===
const formData = ref<any>({});
const formDataVersion = ref(0); // 用于强制更新

// 表单变化处理器
const handleFormChange = (event: any) => {
  if (props.form) {
    formData.value = { ...props.form.data };
    formDataVersion.value++; // 强制触发响应式更新
  }
};

// 创建一个响应式的表单数据计算属性
const reactiveFormData = computed(() => {
  if (!props.form) {
    return {};
  }

  // 触发响应式依赖
  formDataVersion.value;

  // 返回表单的当前数据
  return { ...props.form.data };
});

// 监听表单变化
watch(() => props.form, (newForm, oldForm) => {
  // 清理旧的事件监听器
  if (oldForm && oldForm.events) {
    oldForm.events.off(EVENT_NAMES.FORM_CHANGE, handleFormChange);
  }

  if (newForm) {
    // 初始化表单数据
    formData.value = { ...newForm.data };

    // 监听表单变化事件
    if (newForm.events && typeof newForm.events.on === 'function') {
      newForm.events.on(EVENT_NAMES.FORM_CHANGE, handleFormChange);
    }
  } else {
    // 如果没有表单，清空数据
    formData.value = {};
  }
}, { immediate: true });

// 组件卸载时清理事件监听器
onUnmounted(() => {
  if (props.form && props.form.events) {
    props.form.events.off(EVENT_NAMES.FORM_CHANGE, handleFormChange);
  }
});

// === 提供表单上下文 ===
// 创建表单上下文对象，包含表单实例和其他上下文信息
const formContext = computed(() => {
  if (!props.form) {
    return null;
  }

  // 使用响应式的表单数据
  const currentFormData = reactiveFormData.value;

  return {
    form: props.form,
    formId: props.form.id,
    formData: currentFormData, // 使用响应式的表单数据
    _version: formDataVersion.value // 添加版本号确保响应式更新
  };
});

// 提供表单上下文
provide(FORM_CONTEXT_KEY, formContext);

// === 暴露的方法和属性 ===
defineExpose<FormProviderExpose>({
  form: props.form,
  formContext: formContext.value
});
</script>

<script lang="ts">
export default {
  name: 'FormProvider',
  inheritAttrs: false
};
</script>

<style lang="less">
.ldesign-form-provider {
  // FormProvider 通常不需要特殊样式
  // 它只是一个逻辑容器，用于提供上下文
}
</style>
