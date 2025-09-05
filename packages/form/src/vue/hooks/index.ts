/**
 * Vue Hooks 导出
 * 
 * @description
 * 导出所有 Vue 3 Composition API hooks
 */

// === 主要 Hooks ===
export { useForm, default as useFormDefault } from './useForm';
export { useField, default as useFieldDefault, FORM_CONTEXT_KEY } from './useField';
export { useFormContext, provideFormContext, default as useFormContextDefault } from './useFormContext';
export { useFieldArray, default as useFieldArrayDefault } from './useFieldArray';

// === 默认导出 ===
export default {
  useForm: () => import('./useForm').then(m => m.useForm),
  useField: () => import('./useField').then(m => m.useField),
  useFormContext: () => import('./useFormContext').then(m => m.useFormContext),
  useFieldArray: () => import('./useFieldArray').then(m => m.useFieldArray)
};
