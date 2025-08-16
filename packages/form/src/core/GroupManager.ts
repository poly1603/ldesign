// 分组管理器

import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import type {
  FormGroupConfig,
  GroupState,
  GroupManager as IGroupManager,
} from '../types/group'
import { deepClone } from '../utils/common'
import { SimpleEventEmitter } from '../utils/event'

/**
 * 分组管理器实现
 */
export class GroupManager extends SimpleEventEmitter implements IGroupManager {
  private groups: Map<string, FormGroupConfig> = new Map()
  private groupStates: Map<string, GroupState> = new Map()
  private fieldGroupMap: Map<string, string> = new Map() // 字段名 -> 分组名映射

  constructor() {
    super()
  }

  /**
   * 添加分组
   */
  addGroup(group: FormGroupConfig): void {
    // 验证分组配置
    this.validateGroupConfig(group)

    this.groups.set(group.name, deepClone(group))

    // 初始化分组状态
    this.initializeGroupState(group)

    // 更新字段分组映射
    this.updateFieldGroupMapping(group)

    this.emit('add', group)
  }

  /**
   * 移除分组
   */
  removeGroup(name: string): void {
    const group = this.groups.get(name)
    if (!group) {
      return
    }

    // 清理字段分组映射
    group.fields.forEach((field) => {
      this.fieldGroupMap.delete(field.name)
    })

    this.groups.delete(name)
    this.groupStates.delete(name)

    this.emit('remove', name)
  }

  /**
   * 获取分组
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
   * 展开分组
   */
  expandGroup(name: string): void {
    const state = this.groupStates.get(name)
    if (state && !state.expanded) {
      state.expanded = true
      this.emit('expand', name)
      this.emit('stateChange', name, state)
    }
  }

  /**
   * 收起分组
   */
  collapseGroup(name: string): void {
    const state = this.groupStates.get(name)
    if (state && state.expanded) {
      state.expanded = false
      this.emit('collapse', name)
      this.emit('stateChange', name, state)
    }
  }

  /**
   * 切换分组展开状态
   */
  toggleGroup(name: string): void {
    const state = this.groupStates.get(name)
    if (state) {
      if (state.expanded) {
        this.collapseGroup(name)
      }
      else {
        this.expandGroup(name)
      }
    }
  }

  /**
   * 获取分组状态
   */
  getGroupState(name: string): GroupState | undefined {
    const state = this.groupStates.get(name)
    return state ? deepClone(state) : undefined
  }

  /**
   * 设置分组状态
   */
  setGroupState(name: string, state: Partial<GroupState>): void {
    const currentState = this.groupStates.get(name)
    if (currentState) {
      Object.assign(currentState, state)
      this.emit('stateChange', name, currentState)
    }
  }

  /**
   * 验证分组
   */
  async validateGroup(name: string): Promise<boolean> {
    const group = this.groups.get(name)
    const state = this.groupStates.get(name)

    if (!group || !state) {
      return false
    }

    state.validating = true
    this.emit('stateChange', name, state)

    try {
      let isValid = true
      const errors: Record<string, string[]> = {}

      // 验证分组条件
      if (group.validation?.condition) {
        const groupData = this.getGroupData(name)
        const formData = this.getAllGroupsData()
        isValid = group.validation.condition(groupData, formData)
      }

      // 自定义验证器
      if (isValid && group.validation?.validator) {
        const groupData = this.getGroupData(name)
        const formData = this.getAllGroupsData()
        const result = await group.validation.validator(groupData, formData)

        if (typeof result === 'boolean') {
          isValid = result
        }
        else {
          isValid = false
          errors[name] = [result]
        }
      }

      state.valid = isValid
      state.errors = errors
      state.validating = false

      this.emit('validate', name, isValid)
      this.emit('stateChange', name, state)

      return isValid
    }
    catch (error) {
      state.valid = false
      state.errors = { [name]: [`验证过程中发生错误: ${error.message}`] }
      state.validating = false

      this.emit('validate', name, false)
      this.emit('stateChange', name, state)

      return false
    }
  }

  /**
   * 获取分组数据
   */
  getGroupData(name: string): Record<string, any> {
    const state = this.groupStates.get(name)
    return state ? deepClone(state.data) : {}
  }

  /**
   * 设置分组数据
   */
  setGroupData(name: string, data: Record<string, any>): void {
    const state = this.groupStates.get(name)
    if (state) {
      const oldData = state.data
      state.data = deepClone(data)
      state.dirty = true

      this.emit('dataChange', name, data)
      this.emit('stateChange', name, state)
    }
  }

  /**
   * 更新分组字段数据
   */
  updateGroupFieldData(name: string, fieldName: string, value: any): void {
    const state = this.groupStates.get(name)
    if (state) {
      const oldValue = state.data[fieldName]
      if (oldValue !== value) {
        state.data[fieldName] = value
        state.dirty = true

        // 更新字段状态
        if (!state.fieldStates[fieldName]) {
          state.fieldStates[fieldName] = {
            value,
            dirty: false,
            touched: false,
            valid: true,
            errors: [],
          }
        }

        state.fieldStates[fieldName].value = value
        state.fieldStates[fieldName].dirty = true
        state.fieldStates[fieldName].touched = true

        this.emit('dataChange', name, state.data)
        this.emit('stateChange', name, state)
      }
    }
  }

  /**
   * 重置分组
   */
  resetGroup(name: string): void {
    const group = this.groups.get(name)
    if (group) {
      this.initializeGroupState(group)
      this.emit('stateChange', name, this.groupStates.get(name)!)
    }
  }

  /**
   * 清空所有分组
   */
  clear(): void {
    const groupNames = Array.from(this.groups.keys())

    this.groups.clear()
    this.groupStates.clear()
    this.fieldGroupMap.clear()

    groupNames.forEach((name) => {
      this.emit('remove', name)
    })
  }

  /**
   * 获取字段所属的分组
   */
  getFieldGroup(fieldName: string): string | undefined {
    return this.fieldGroupMap.get(fieldName)
  }

  /**
   * 获取分组的字段列表
   */
  getGroupFields(name: string): FormItemConfig[] {
    const group = this.groups.get(name)
    return group ? deepClone(group.fields) : []
  }

  /**
   * 获取所有分组的数据
   */
  getAllGroupsData(): FormData {
    const allData: FormData = {}

    this.groupStates.forEach((state, name) => {
      Object.assign(allData, state.data)
    })

    return allData
  }

  /**
   * 获取可见的分组
   */
  getVisibleGroups(): FormGroupConfig[] {
    return Array.from(this.groups.values())
      .filter((group) => {
        const state = this.groupStates.get(group.name)
        return state?.visible !== false
      })
      .map(group => deepClone(group))
  }

  /**
   * 设置分组可见性
   */
  setGroupVisible(name: string, visible: boolean): void {
    const state = this.groupStates.get(name)
    if (state) {
      state.visible = visible
      this.emit('stateChange', name, state)
    }
  }

  /**
   * 初始化分组状态
   */
  private initializeGroupState(group: FormGroupConfig): void {
    const fieldStates: Record<string, any> = {}
    const data: Record<string, any> = {}

    group.fields.forEach((field) => {
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

    const state: GroupState = {
      name: group.name,
      expanded: !group.collapsed,
      visible: true,
      data,
      errors: {},
      valid: true,
      validating: false,
      dirty: false,
      fieldStates,
    }

    this.groupStates.set(group.name, state)
  }

  /**
   * 更新字段分组映射
   */
  private updateFieldGroupMapping(group: FormGroupConfig): void {
    group.fields.forEach((field) => {
      this.fieldGroupMap.set(field.name, group.name)
    })
  }

  /**
   * 验证分组配置
   */
  private validateGroupConfig(group: FormGroupConfig): void {
    if (!group.name) {
      throw new Error('分组名称不能为空')
    }

    if (this.groups.has(group.name)) {
      throw new Error(`分组 "${group.name}" 已存在`)
    }

    if (!Array.isArray(group.fields)) {
      throw new TypeError('分组字段必须是数组')
    }

    // 检查字段名重复
    const fieldNames = new Set<string>()
    group.fields.forEach((field) => {
      if (fieldNames.has(field.name)) {
        throw new Error(
          `分组 "${group.name}" 中存在重复的字段名: ${field.name}`,
        )
      }
      fieldNames.add(field.name)
    })
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    groupCount: number
    totalFields: number
    expandedGroups: number
    collapsedGroups: number
    visibleGroups: number
    hiddenGroups: number
  } {
    const states = Array.from(this.groupStates.values())

    return {
      groupCount: this.groups.size,
      totalFields: Array.from(this.groups.values()).reduce(
        (sum, group) => sum + group.fields.length,
        0,
      ),
      expandedGroups: states.filter(state => state.expanded).length,
      collapsedGroups: states.filter(state => !state.expanded).length,
      visibleGroups: states.filter(state => state.visible).length,
      hiddenGroups: states.filter(state => !state.visible).length,
    }
  }

  /**
   * 销毁分组管理器
   */
  destroy(): void {
    this.clear()
    this.removeAllListeners()
  }
}
