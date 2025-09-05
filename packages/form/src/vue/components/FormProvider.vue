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
import { provide, type PropType } from 'vue';
import type { ReactiveFormInstance } from '@/types/vue';
import type { FormProviderProps, FormProviderEmits, FormProviderExpose } from './types';
import { FORM_CONTEXT_KEY } from '../hooks/useField';

// === Props 定义 ===
const props = defineProps<FormProviderProps>();

// === Emits 定义 ===
const emit = defineEmits<FormProviderEmits>();

// === 提供表单上下文 ===
provide(FORM_CONTEXT_KEY, props.form);

// === 暴露的方法和属性 ===
defineExpose<FormProviderExpose>({
  form: props.form
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
