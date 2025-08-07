// 表单工厂函数

import type { FormField, FormRule, FormLayout, FormGroup } from '../types/form'

/**
 * 创建表单字段
 */
export function createFormField(field: Partial<FormField>): FormField {
  return {
    name: '',
    title: '',
    component: 'FormInput',
    ...field,
  } as FormField
}

/**
 * 创建表单验证规则
 */
export function createFormRule(rule: Partial<FormRule>): FormRule {
  return {
    type: 'required',
    message: '',
    ...rule,
  } as FormRule
}

/**
 * 创建表单布局
 */
export function createFormLayout(layout: Partial<FormLayout>): FormLayout {
  return {
    columns: 1,
    horizontalGap: 16,
    verticalGap: 16,
    ...layout,
  }
}

/**
 * 创建表单分组
 */
export function createFormGroup(group: Partial<FormGroup>): FormGroup {
  return {
    name: '',
    title: '',
    fields: [],
    ...group,
  } as FormGroup
}
