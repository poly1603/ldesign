/**
 * Vue 3 适配器导出
 *
 * @description
 * 导出 Vue 3 相关功能，包括 hooks、组件、指令等
 */

import type { App } from 'vue';

// === Composition API Hooks ===
export { useForm } from './hooks/useForm';
export { useField, FORM_CONTEXT_KEY } from './hooks/useField';
export { useFieldArray } from './hooks/useFieldArray';
export { useFormContext, provideFormContext } from './hooks/useFormContext';

// === Hooks 默认导出 ===
export * from './hooks';

// === Vue 组件 ===
// export { default as LDesignForm } from './components/LDesignForm.vue';
// export { default as LDesignFormItem } from './components/LDesignFormItem.vue';
// export { default as FieldArray } from './components/FieldArray.vue';
// export { default as FormProvider } from './components/FormProvider.vue';

// === Vue 指令 ===
// export { vModel } from './directives/vModel';

// === 安装函数 ===
export function install(app: App): void {
  // 注册全局组件
  // app.component('LDesignForm', LDesignForm);
  // app.component('LDesignFormItem', LDesignFormItem);
  // app.component('FieldArray', FieldArray);
  // app.component('FormProvider', FormProvider);

  // 注册全局指令
  // app.directive('model', vModel);

  // 注册全局属性
  // app.config.globalProperties.$form = {
  //   create: createForm,
  //   validate: validateForm
  // };

  console.log('LDesign Form plugin installed');
}

// === 默认导出 ===
export default {
  install,
  useForm,
  useField,
  useFieldArray,
  useFormContext,
  provideFormContext
};
