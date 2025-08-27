/**
 * 表单相关工具函数
 */

import type { FormFieldItem, FormFieldConfig, FormGroupConfig, AnyObject } from '../types'

/**
 * 扁平化表单字段
 */
export function flattenFormFields(fields: FormFieldItem[], parentPath = ''): FormFieldConfig[] {
  const result: FormFieldConfig[] = []
  
  for (const field of fields) {
    if (field.type === 'group' && 'fields' in field) {
      // 递归处理分组字段
      const groupField = field as FormGroupConfig
      const groupPath = parentPath ? `${parentPath}.${groupField.name}` : groupField.name
      result.push(...flattenFormFields(groupField.fields, groupPath))
    } else if (field.type !== 'actions' && 'name' in field) {
      // 处理普通字段
      const fieldConfig = field as FormFieldConfig
      const fieldPath = parentPath ? `${parentPath}.${fieldConfig.name}` : fieldConfig.name
      
      result.push({
        ...fieldConfig,
        name: fieldPath
      })
    }
  }
  
  return result
}

/**
 * 获取字段的完整路径
 */
export function getFieldPath(field: FormFieldConfig, parentPath = ''): string {
  return parentPath ? `${parentPath}.${field.name}` : field.name
}

/**
 * 根据路径查找字段配置
 */
export function findFieldByPath(fields: FormFieldItem[], path: string): FormFieldConfig | null {
  const pathParts = path.split('.')
  let currentFields = fields
  let currentField: FormFieldItem | null = null
  
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    currentField = currentFields.find(field => 
      'name' in field && field.name === part
    ) || null
    
    if (!currentField) {
      return null
    }
    
    if (i < pathParts.length - 1) {
      // 还有更深的路径，继续查找
      if (currentField.type === 'group' && 'fields' in currentField) {
        currentFields = (currentField as FormGroupConfig).fields
      } else {
        return null
      }
    }
  }
  
  return currentField as FormFieldConfig
}

/**
 * 获取表单的所有字段名
 */
export function getFormFieldNames(fields: FormFieldItem[]): string[] {
  const flatFields = flattenFormFields(fields)
  return flatFields.map(field => field.name)
}

/**
 * 获取必填字段名
 */
export function getRequiredFieldNames(fields: FormFieldItem[], formData: AnyObject = {}): string[] {
  const flatFields = flattenFormFields(fields)
  return flatFields
    .filter(field => {
      if (typeof field.required === 'function') {
        return field.required(formData)
      }
      return field.required
    })
    .map(field => field.name)
}

/**
 * 获取可见字段名
 */
export function getVisibleFieldNames(fields: FormFieldItem[], formData: AnyObject = {}): string[] {
  const flatFields = flattenFormFields(fields)
  return flatFields
    .filter(field => {
      if (typeof field.hidden === 'function') {
        return !field.hidden(formData)
      }
      return !field.hidden
    })
    .map(field => field.name)
}

/**
 * 创建默认表单数据
 */
export function createDefaultFormData(fields: FormFieldItem[]): AnyObject {
  const data: AnyObject = {}
  const flatFields = flattenFormFields(fields)
  
  for (const field of flatFields) {
    if (field.defaultValue !== undefined) {
      setNestedValue(data, field.name, field.defaultValue)
    }
  }
  
  return data
}

/**
 * 验证表单数据完整性
 */
export function validateFormDataIntegrity(
  fields: FormFieldItem[], 
  formData: AnyObject
): { valid: boolean; missingFields: string[]; extraFields: string[] } {
  const fieldNames = getFormFieldNames(fields)
  const dataKeys = getObjectPaths(formData)
  
  const missingFields = fieldNames.filter(name => !hasNestedPath(formData, name))
  const extraFields = dataKeys.filter(key => !fieldNames.includes(key))
  
  return {
    valid: missingFields.length === 0 && extraFields.length === 0,
    missingFields,
    extraFields
  }
}

/**
 * 清理表单数据（移除不存在的字段）
 */
export function cleanFormData(fields: FormFieldItem[], formData: AnyObject): AnyObject {
  const fieldNames = getFormFieldNames(fields)
  const cleanedData: AnyObject = {}
  
  for (const fieldName of fieldNames) {
    if (hasNestedPath(formData, fieldName)) {
      setNestedValue(cleanedData, fieldName, getNestedValue(formData, fieldName))
    }
  }
  
  return cleanedData
}

/**
 * 比较两个表单数据是否相等
 */
export function isFormDataEqual(data1: AnyObject, data2: AnyObject): boolean {
  return isEqual(data1, data2)
}

/**
 * 获取表单数据的变更
 */
export function getFormDataChanges(
  originalData: AnyObject, 
  currentData: AnyObject
): { changed: string[]; added: string[]; removed: string[] } {
  const originalPaths = getObjectPaths(originalData)
  const currentPaths = getObjectPaths(currentData)
  
  const changed: string[] = []
  const added: string[] = []
  const removed: string[] = []
  
  // 检查变更和新增
  for (const path of currentPaths) {
    if (originalPaths.includes(path)) {
      const originalValue = getNestedValue(originalData, path)
      const currentValue = getNestedValue(currentData, path)
      if (!isEqual(originalValue, currentValue)) {
        changed.push(path)
      }
    } else {
      added.push(path)
    }
  }
  
  // 检查删除
  for (const path of originalPaths) {
    if (!currentPaths.includes(path)) {
      removed.push(path)
    }
  }
  
  return { changed, added, removed }
}

/**
 * 重置表单数据到初始状态
 */
export function resetFormData(fields: FormFieldItem[], currentData: AnyObject): AnyObject {
  const defaultData = createDefaultFormData(fields)
  return { ...defaultData }
}

/**
 * 合并表单数据
 */
export function mergeFormData(...dataSources: AnyObject[]): AnyObject {
  return deepMerge({}, ...dataSources)
}

/**
 * 序列化表单数据
 */
export function serializeFormData(data: AnyObject): string {
  return safeJsonStringify(data)
}

/**
 * 反序列化表单数据
 */
export function deserializeFormData(serialized: string): AnyObject {
  return safeJsonParse(serialized, {})
}

/**
 * 获取字段的显示值
 */
export function getFieldDisplayValue(
  field: FormFieldConfig, 
  value: any, 
  formData: AnyObject = {}
): string {
  if (value === null || value === undefined) {
    return ''
  }
  
  // 如果字段有格式化函数
  if (field.formatter) {
    return field.formatter(value, formData)
  }
  
  // 如果是选择类型字段，查找对应的标签
  if (field.component === 'select' || field.component === 'radio') {
    const options = field.props?.options || []
    const option = options.find((opt: any) => opt.value === value)
    return option?.label || String(value)
  }
  
  // 如果是多选类型字段
  if (field.component === 'checkbox' && Array.isArray(value)) {
    const options = field.props?.options || []
    const labels = value.map(val => {
      const option = options.find((opt: any) => opt.value === val)
      return option?.label || String(val)
    })
    return labels.join(', ')
  }
  
  // 如果是开关类型
  if (field.component === 'switch') {
    return value ? '是' : '否'
  }
  
  // 如果是日期类型
  if (field.component === 'date-picker' || field.component === 'time-picker') {
    if (value instanceof Date) {
      return formatDate(value, field.props?.format || 'YYYY-MM-DD')
    }
    return String(value)
  }
  
  // 默认转换为字符串
  return String(value)
}

// 辅助函数（从core/utils导入）
function getNestedValue(obj: AnyObject, path: string): any {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined
    }
    current = current[key]
  }
  
  return current
}

function setNestedValue(obj: AnyObject, path: string, value: any): void {
  const keys = path.split('.')
  let current = obj
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {}
    }
    current = current[key]
  }
  
  current[keys[keys.length - 1]] = value
}

function hasNestedPath(obj: AnyObject, path: string): boolean {
  const keys = path.split('.')
  let current = obj
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object' || !(key in current)) {
      return false
    }
    current = current[key]
  }
  
  return true
}

function getObjectPaths(obj: AnyObject, prefix = ''): string[] {
  const paths: string[] = []
  
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key
    paths.push(currentPath)
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...getObjectPaths(value, currentPath))
    }
  }
  
  return paths
}

function isEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return a === b
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return a === b
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => isEqual(item, b[index]))
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  return keysA.every(key => isEqual(a[key], b[key]))
}

function deepMerge<T extends AnyObject>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target
  
  const source = sources.shift()
  if (!source) return target
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return deepMerge(target, ...sources)
}

function isObject(item: any): item is AnyObject {
  return item && typeof item === 'object' && !Array.isArray(item)
}

function safeJsonStringify(obj: any, space?: number): string {
  try {
    return JSON.stringify(obj, null, space)
  } catch {
    return '{}'
  }
}

function safeJsonParse<T = any>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json)
  } catch {
    return defaultValue
  }
}

function formatDate(date: Date | string | number, format = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return 'Invalid Date'
  }
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}
