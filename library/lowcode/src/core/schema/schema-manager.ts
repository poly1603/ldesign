/**
 * Schema 管理器
 * 负责Schema的创建、更新、删除、验证等操作
 */

import type { LowcodeSchema, ComponentNode, DataSource, Method } from '../../types';
import { generateId, deepClone } from '../../utils';

/**
 * Schema 管理器类
 */
export class SchemaManager {
  private schema: LowcodeSchema;
  private listeners: Map<string, Set<(schema: LowcodeSchema) => void>>;

  constructor(initialSchema?: LowcodeSchema) {
    this.schema = initialSchema || this.createEmptySchema();
    this.listeners = new Map();
  }

  /**
   * 创建空 Schema
   */
  createEmptySchema(): LowcodeSchema {
    return {
      version: '1.0.0',
      components: [],
      datasources: [],
      variables: {},
      methods: [],
      lifecycle: {}
    };
  }

  /**
   * 获取当前 Schema
   */
  getSchema(): LowcodeSchema {
    return deepClone(this.schema);
  }

  /**
   * 设置 Schema
   */
  setSchema(schema: LowcodeSchema): void {
    this.schema = deepClone(schema);
    this.emit('change', this.schema);
  }

  /**
   * 添加组件
   */
  addComponent(component: ComponentNode, parentId?: string): void {
    const newComponent = {
      ...component,
      id: component.id || generateId('comp')
    };

    if (parentId) {
      const parent = this.findComponent(parentId);
      if (parent) {
        parent.children.push(newComponent);
      }
    } else {
      this.schema.components.push(newComponent);
    }

    this.emit('change', this.schema);
    this.emit('component:add', newComponent);
  }

  /**
   * 更新组件
   */
  updateComponent(id: string, updates: Partial<ComponentNode>): void {
    const component = this.findComponent(id);
    if (component) {
      Object.assign(component, updates);
      this.emit('change', this.schema);
      this.emit('component:update', component);
    }
  }

  /**
   * 删除组件
   */
  deleteComponent(id: string): boolean {
    const result = this.deleteComponentRecursive(this.schema.components, id);
    if (result) {
      this.emit('change', this.schema);
      this.emit('component:delete', id);
    }
    return result;
  }

  /**
   * 递归删除组件
   */
  private deleteComponentRecursive(components: ComponentNode[], id: string): boolean {
    for (let i = 0; i < components.length; i++) {
      if (components[i].id === id) {
        components.splice(i, 1);
        return true;
      }
      if (components[i].children.length > 0) {
        if (this.deleteComponentRecursive(components[i].children, id)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * 查找组件
   */
  findComponent(id: string): ComponentNode | null {
    return this.findComponentRecursive(this.schema.components, id);
  }

  /**
   * 递归查找组件
   */
  private findComponentRecursive(components: ComponentNode[], id: string): ComponentNode | null {
    for (const component of components) {
      if (component.id === id) {
        return component;
      }
      if (component.children.length > 0) {
        const found = this.findComponentRecursive(component.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 移动组件
   */
  moveComponent(id: string, targetParentId: string | null, index: number): void {
    const component = this.findComponent(id);
    if (!component) return;

    // 从原位置删除
    this.deleteComponent(id);

    // 添加到新位置
    if (targetParentId) {
      const parent = this.findComponent(targetParentId);
      if (parent) {
        parent.children.splice(index, 0, component);
      }
    } else {
      this.schema.components.splice(index, 0, component);
    }

    this.emit('change', this.schema);
    this.emit('component:move', { id, targetParentId, index });
  }

  /**
   * 复制组件
   */
  copyComponent(id: string): ComponentNode | null {
    const component = this.findComponent(id);
    if (!component) return null;

    const copied = deepClone(component);
    this.assignNewIds(copied);

    return copied;
  }

  /**
   * 为组件及其子组件分配新ID
   */
  private assignNewIds(component: ComponentNode): void {
    component.id = generateId('comp');
    component.children.forEach(child => this.assignNewIds(child));
  }

  /**
   * 获取所有组件（扁平化）
   */
  getAllComponents(): ComponentNode[] {
    const result: ComponentNode[] = [];
    this.flattenComponents(this.schema.components, result);
    return result;
  }

  /**
   * 扁平化组件树
   */
  private flattenComponents(components: ComponentNode[], result: ComponentNode[]): void {
    components.forEach(component => {
      result.push(component);
      if (component.children.length > 0) {
        this.flattenComponents(component.children, result);
      }
    });
  }

  /**
   * 添加数据源
   */
  addDataSource(datasource: DataSource): void {
    this.schema.datasources.push(datasource);
    this.emit('change', this.schema);
  }

  /**
   * 更新数据源
   */
  updateDataSource(id: string, updates: Partial<DataSource>): void {
    const datasource = this.schema.datasources.find(ds => ds.id === id);
    if (datasource) {
      Object.assign(datasource, updates);
      this.emit('change', this.schema);
    }
  }

  /**
   * 删除数据源
   */
  deleteDataSource(id: string): void {
    const index = this.schema.datasources.findIndex(ds => ds.id === id);
    if (index !== -1) {
      this.schema.datasources.splice(index, 1);
      this.emit('change', this.schema);
    }
  }

  /**
   * 添加变量
   */
  addVariable(name: string, value: any): void {
    this.schema.variables[name] = value;
    this.emit('change', this.schema);
  }

  /**
   * 更新变量
   */
  updateVariable(name: string, value: any): void {
    if (name in this.schema.variables) {
      this.schema.variables[name] = value;
      this.emit('change', this.schema);
    }
  }

  /**
   * 删除变量
   */
  deleteVariable(name: string): void {
    if (name in this.schema.variables) {
      delete this.schema.variables[name];
      this.emit('change', this.schema);
    }
  }

  /**
   * 添加方法
   */
  addMethod(method: Method): void {
    this.schema.methods.push(method);
    this.emit('change', this.schema);
  }

  /**
   * 更新方法
   */
  updateMethod(name: string, updates: Partial<Method>): void {
    const method = this.schema.methods.find(m => m.name === name);
    if (method) {
      Object.assign(method, updates);
      this.emit('change', this.schema);
    }
  }

  /**
   * 删除方法
   */
  deleteMethod(name: string): void {
    const index = this.schema.methods.findIndex(m => m.name === name);
    if (index !== -1) {
      this.schema.methods.splice(index, 1);
      this.emit('change', this.schema);
    }
  }

  /**
   * 导入 Schema
   */
  importSchema(schema: LowcodeSchema): void {
    this.setSchema(schema);
  }

  /**
   * 导出 Schema
   */
  exportSchema(): string {
    return JSON.stringify(this.schema, null, 2);
  }

  /**
   * 监听事件
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * 移除监听
   */
  off(event: string, callback: (data: any) => void): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * 清空 Schema
   */
  clear(): void {
    this.schema = this.createEmptySchema();
    this.emit('change', this.schema);
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.listeners.clear();
  }
}



