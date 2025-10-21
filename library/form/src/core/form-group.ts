/**
 * @ldesign/form - Form Group Manager
 * 表单分组管理器
 */

import type { FieldConfig } from '../utils/types'
import { deepClone } from '../utils/helpers'

/**
 * 表单分组配置
 */
export interface FormGroupConfig {
  /** 分组名称 */
  name: string
  /** 分组标题 */
  title?: string
  /** 分组描述 */
  description?: string
  /** 分组字段 */
  fields: string[]
  /** 是否可折叠 */
  collapsible?: boolean
  /** 默认是否折叠 */
  defaultCollapsed?: boolean
  /** 是否可见 */
  visible?: boolean | ((values: any) => boolean)
}

/**
 * 表单分组管理器类
 */
export class FormGroupManager {
  private groups: Map<string, FormGroupConfig>
  private collapsedGroups: Set<string>
  private fieldToGroup: Map<string, string>

  constructor() {
    this.groups = new Map()
    this.collapsedGroups = new Set()
    this.fieldToGroup = new Map()
  }

  /**
   * 注册分组
   * @param config 分组配置
   */
  registerGroup(config: FormGroupConfig): void {
    this.groups.set(config.name, deepClone(config))

    // 建立字段到分组的映射
    config.fields.forEach(field => {
      this.fieldToGroup.set(field, config.name)
    })

    // 设置初始折叠状态
    if (config.defaultCollapsed) {
      this.collapsedGroups.add(config.name)
    }
  }

  /**
   * 批量注册分组
   * @param configs 分组配置数组
   */
  registerGroups(configs: FormGroupConfig[]): void {
    configs.forEach(config => this.registerGroup(config))
  }

  /**
   * 注销分组
   * @param name 分组名称
   */
  unregisterGroup(name: string): void {
    const group = this.groups.get(name)
    if (group) {
      // 移除字段映射
      group.fields.forEach(field => {
        this.fieldToGroup.delete(field)
      })
    }

    this.groups.delete(name)
    this.collapsedGroups.delete(name)
  }

  /**
   * 获取分组配置
   * @param name 分组名称
   */
  getGroup(name: string): FormGroupConfig | undefined {
    const group = this.groups.get(name)
    return group ? deepClone(group) : undefined
  }

  /**
   * 获取所有分组
   */
  getAllGroups(): FormGroupConfig[] {
    return Array.from(this.groups.values()).map(group => deepClone(group))
  }

  /**
   * 获取字段所属分组
   * @param fieldName 字段名
   */
  getFieldGroup(fieldName: string): string | undefined {
    return this.fieldToGroup.get(fieldName)
  }

  /**
   * 切换分组折叠状态
   * @param name 分组名称
   */
  toggleGroupCollapse(name: string): void {
    if (this.collapsedGroups.has(name)) {
      this.collapsedGroups.delete(name)
    } else {
      this.collapsedGroups.add(name)
    }
  }

  /**
   * 设置分组折叠状态
   * @param name 分组名称
   * @param collapsed 是否折叠
   */
  setGroupCollapsed(name: string, collapsed: boolean): void {
    if (collapsed) {
      this.collapsedGroups.add(name)
    } else {
      this.collapsedGroups.delete(name)
    }
  }

  /**
   * 获取分组是否折叠
   * @param name 分组名称
   */
  isGroupCollapsed(name: string): boolean {
    return this.collapsedGroups.has(name)
  }

  /**
   * 获取分组的可见字段
   * @param name 分组名称
   * @param values 表单值
   */
  getGroupVisibleFields(name: string, values: any): string[] {
    const group = this.groups.get(name)
    if (!group) return []

    // 检查分组是否可见
    let groupVisible = true
    if (typeof group.visible === 'boolean') {
      groupVisible = group.visible
    } else if (typeof group.visible === 'function') {
      try {
        groupVisible = group.visible(values)
      } catch (error) {
        console.error(`Error in visible function for group "${name}":`, error)
      }
    }

    if (!groupVisible) return []

    // 如果分组折叠，返回空数组
    if (this.isGroupCollapsed(name)) return []

    return group.fields
  }

  /**
   * 获取所有可见字段
   * @param values 表单值
   */
  getAllVisibleFields(values: any): string[] {
    const visibleFields: string[] = []

    this.groups.forEach((group, name) => {
      const fields = this.getGroupVisibleFields(name, values)
      visibleFields.push(...fields)
    })

    return visibleFields
  }

  /**
   * 清空所有分组
   */
  clear(): void {
    this.groups.clear()
    this.collapsedGroups.clear()
    this.fieldToGroup.clear()
  }

  /**
   * 销毁分组管理器
   */
  destroy(): void {
    this.clear()
  }
}

/**
 * 创建表单分组管理器
 */
export function createFormGroupManager(): FormGroupManager {
  return new FormGroupManager()
}



