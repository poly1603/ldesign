// 分组工具函数

import type { FormGroupConfig, GroupState } from '../types/group'
import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import { deepClone } from './common'

/**
 * 创建默认分组配置
 */
export function createDefaultGroup(
  name: string,
  title: string,
  fields: FormItemConfig[]
): FormGroupConfig {
  return {
    name,
    title,
    fields,
    collapsible: false,
    collapsed: false,
    visible: true,
    order: 0,
  }
}

/**
 * 创建默认分组状态
 */
export function createDefaultGroupState(group: FormGroupConfig): GroupState {
  const fieldStates: Record<string, any> = {}
  const data: Record<string, any> = {}

  group.fields.forEach(field => {
    const value = field.defaultValue
    data[field.name] = value
    fieldStates[field.name] = {
      value,
      dirty: false,
      touched: false,
      valid: true,
      errors: [],
    }
  })

  return {
    name: group.name,
    expanded: !group.collapsed,
    visible: group.visible !== false,
    data,
    errors: {},
    valid: true,
    validating: false,
    dirty: false,
    fieldStates,
  }
}

/**
 * 验证分组配置
 */
export function validateGroupConfig(group: FormGroupConfig): string[] {
  const errors: string[] = []

  if (!group.name) {
    errors.push('分组名称不能为空')
  }

  if (!group.title) {
    errors.push('分组标题不能为空')
  }

  if (!Array.isArray(group.fields)) {
    errors.push('分组字段必须是数组')
  } else if (group.fields.length === 0) {
    errors.push('分组至少需要包含一个字段')
  }

  // 检查字段名重复
  const fieldNames = new Set<string>()
  group.fields.forEach(field => {
    if (!field.name) {
      errors.push('字段名称不能为空')
    } else if (fieldNames.has(field.name)) {
      errors.push(`分组中存在重复的字段名: ${field.name}`)
    } else {
      fieldNames.add(field.name)
    }
  })

  return errors
}

/**
 * 合并分组配置
 */
export function mergeGroupConfig(
  base: FormGroupConfig,
  override: Partial<FormGroupConfig>
): FormGroupConfig {
  return {
    ...base,
    ...override,
    fields: override.fields || base.fields,
    validation: {
      ...base.validation,
      ...override.validation,
    },
  }
}

/**
 * 从字段列表创建分组
 */
export function createGroupsFromFields(
  fields: FormItemConfig[],
  groupSize: number = 5
): FormGroupConfig[] {
  const groups: FormGroupConfig[] = []

  for (let i = 0; i < fields.length; i += groupSize) {
    const groupFields = fields.slice(i, i + groupSize)
    const groupIndex = Math.floor(i / groupSize) + 1

    groups.push({
      name: `group${groupIndex}`,
      title: `分组 ${groupIndex}`,
      fields: groupFields,
      collapsible: true,
      collapsed: groupIndex > 1, // 第一个分组默认展开
      visible: true,
      order: groupIndex - 1,
    })
  }

  return groups
}

/**
 * 按字段类型分组
 */
export function groupFieldsByType(
  fields: FormItemConfig[]
): Record<string, FormItemConfig[]> {
  const groups: Record<string, FormItemConfig[]> = {}

  fields.forEach(field => {
    const type = field.component || 'unknown'
    if (!groups[type]) {
      groups[type] = []
    }
    groups[type].push(field)
  })

  return groups
}

/**
 * 按字段标签前缀分组
 */
export function groupFieldsByPrefix(
  fields: FormItemConfig[],
  separator: string = '.'
): FormGroupConfig[] {
  const prefixGroups: Record<string, FormItemConfig[]> = {}

  fields.forEach(field => {
    const title = field.title || field.name
    const parts = title.split(separator)

    if (parts.length > 1) {
      const prefix = parts[0]
      if (!prefixGroups[prefix]) {
        prefixGroups[prefix] = []
      }
      prefixGroups[prefix].push({
        ...field,
        title: parts.slice(1).join(separator), // 移除前缀
      })
    } else {
      // 没有前缀的字段放到默认分组
      if (!prefixGroups['其他']) {
        prefixGroups['其他'] = []
      }
      prefixGroups['其他'].push(field)
    }
  })

  return Object.entries(prefixGroups).map(([prefix, groupFields], index) => ({
    name: `group_${prefix.toLowerCase().replace(/\s+/g, '_')}`,
    title: prefix,
    fields: groupFields,
    collapsible: true,
    collapsed: index > 0,
    visible: true,
    order: index,
  }))
}

/**
 * 排序分组
 */
export function sortGroups(groups: FormGroupConfig[]): FormGroupConfig[] {
  return [...groups].sort((a, b) => {
    // 首先按 order 排序
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order
    }

    // 然后按名称排序
    return a.name.localeCompare(b.name)
  })
}

/**
 * 过滤可见分组
 */
export function filterVisibleGroups(
  groups: FormGroupConfig[]
): FormGroupConfig[] {
  return groups.filter(group => group.visible !== false)
}

/**
 * 获取分组的所有字段名
 */
export function getGroupFieldNames(group: FormGroupConfig): string[] {
  return group.fields.map(field => field.name)
}

/**
 * 获取所有分组的字段名
 */
export function getAllGroupFieldNames(groups: FormGroupConfig[]): string[] {
  const fieldNames: string[] = []
  groups.forEach(group => {
    fieldNames.push(...getGroupFieldNames(group))
  })
  return fieldNames
}

/**
 * 检查字段是否属于分组
 */
export function isFieldInGroup(
  fieldName: string,
  group: FormGroupConfig
): boolean {
  return group.fields.some(field => field.name === fieldName)
}

/**
 * 查找字段所属的分组
 */
export function findFieldGroup(
  fieldName: string,
  groups: FormGroupConfig[]
): FormGroupConfig | undefined {
  return groups.find(group => isFieldInGroup(fieldName, group))
}

/**
 * 从分组中提取字段数据
 */
export function extractGroupData(
  group: FormGroupConfig,
  formData: FormData
): Record<string, any> {
  const groupData: Record<string, any> = {}

  group.fields.forEach(field => {
    if (field.name in formData) {
      groupData[field.name] = formData[field.name]
    }
  })

  return groupData
}

/**
 * 将分组数据合并到表单数据
 */
export function mergeGroupDataToForm(
  groupData: Record<string, any>,
  formData: FormData
): FormData {
  return {
    ...formData,
    ...groupData,
  }
}

/**
 * 计算分组统计信息
 */
export function calculateGroupStats(groups: FormGroupConfig[]): {
  totalGroups: number
  visibleGroups: number
  collapsibleGroups: number
  totalFields: number
  averageFieldsPerGroup: number
} {
  const visibleGroups = groups.filter(group => group.visible !== false)
  const collapsibleGroups = groups.filter(group => group.collapsible)
  const totalFields = groups.reduce(
    (sum, group) => sum + group.fields.length,
    0
  )

  return {
    totalGroups: groups.length,
    visibleGroups: visibleGroups.length,
    collapsibleGroups: collapsibleGroups.length,
    totalFields,
    averageFieldsPerGroup: groups.length > 0 ? totalFields / groups.length : 0,
  }
}

/**
 * 分组构建器
 */
export class GroupBuilder {
  private groups: FormGroupConfig[] = []

  /**
   * 添加分组
   */
  addGroup(group: FormGroupConfig): this {
    this.groups.push(deepClone(group))
    return this
  }

  /**
   * 创建并添加分组
   */
  createGroup(
    name: string,
    title: string,
    fields: FormItemConfig[],
    options: Partial<FormGroupConfig> = {}
  ): this {
    const group: FormGroupConfig = {
      name,
      title,
      fields,
      collapsible: false,
      collapsed: false,
      visible: true,
      order: this.groups.length,
      ...options,
    }

    return this.addGroup(group)
  }

  /**
   * 按字段数量自动分组
   */
  autoGroupBySize(fields: FormItemConfig[], groupSize: number = 5): this {
    const autoGroups = createGroupsFromFields(fields, groupSize)
    autoGroups.forEach(group => this.addGroup(group))
    return this
  }

  /**
   * 按字段前缀自动分组
   */
  autoGroupByPrefix(fields: FormItemConfig[], separator: string = '.'): this {
    const autoGroups = groupFieldsByPrefix(fields, separator)
    autoGroups.forEach(group => this.addGroup(group))
    return this
  }

  /**
   * 设置分组顺序
   */
  setOrder(groupName: string, order: number): this {
    const group = this.groups.find(g => g.name === groupName)
    if (group) {
      group.order = order
    }
    return this
  }

  /**
   * 设置分组可见性
   */
  setVisible(groupName: string, visible: boolean): this {
    const group = this.groups.find(g => g.name === groupName)
    if (group) {
      group.visible = visible
    }
    return this
  }

  /**
   * 设置分组可折叠性
   */
  setCollapsible(groupName: string, collapsible: boolean): this {
    const group = this.groups.find(g => g.name === groupName)
    if (group) {
      group.collapsible = collapsible
    }
    return this
  }

  /**
   * 构建分组列表
   */
  build(): FormGroupConfig[] {
    return sortGroups(this.groups)
  }

  /**
   * 重置构建器
   */
  reset(): this {
    this.groups = []
    return this
  }
}

/**
 * 创建分组构建器
 */
export function createGroupBuilder(): GroupBuilder {
  return new GroupBuilder()
}
