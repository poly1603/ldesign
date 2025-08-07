// 表单数据处理工具

import type { FormData } from '../types/form'

/**
 * 格式化表单数据
 */
export function formatFormData(data: FormData): FormData {
  const formatted: FormData = {}

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null && value !== '') {
      formatted[key] = value
    }
  }

  return formatted
}

/**
 * 解析表单数据
 */
export function parseFormData(data: any): FormData {
  if (!data || typeof data !== 'object') {
    return {}
  }

  const parsed: FormData = {}

  for (const [key, value] of Object.entries(data)) {
    parsed[key] = value
  }

  return parsed
}

/**
 * 克隆表单数据
 */
export function cloneFormData(data: FormData): FormData {
  return JSON.parse(JSON.stringify(data))
}
