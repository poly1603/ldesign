/**
 * 物料类型定义
 */

import type { Component } from 'vue';
import type { LayoutConfig } from './layout';

/**
 * 物料定义
 */
export interface Material {
  /** 物料名称（组件名） */
  name: string;
  /** 显示标题 */
  title: string;
  /** 分类 */
  category: string;
  /** 图标 */
  icon: string;
  /** 描述 */
  description?: string;
  /** 标签 */
  tags?: string[];
  /** 属性元数据 */
  props: PropMeta[];
  /** 事件元数据 */
  events: EventMeta[];
  /** 插槽元数据 */
  slots?: SlotMeta[];
  /** Vue 组件 */
  component: Component;
  /** 默认属性值 */
  defaultProps?: Record<string, any>;
  /** 默认布局配置 */
  defaultLayout?: LayoutConfig;
  /** 默认样式 */
  defaultStyles?: Record<string, any>;
  /** 是否可以有子组件 */
  canHaveChildren?: boolean;
  /** 允许的子组件类型 */
  allowedChildren?: string[];
  /** 是否为容器组件 */
  isContainer?: boolean;
  /** 预览图 */
  preview?: string;
  /** 文档链接 */
  docUrl?: string;
  /** 版本 */
  version?: string;
}

/**
 * 属性元数据
 */
export interface PropMeta {
  /** 属性名 */
  name: string;
  /** 显示标签 */
  label: string;
  /** 属性类型 */
  type: PropType;
  /** 默认值 */
  default?: any;
  /** 是否必填 */
  required?: boolean;
  /** 描述 */
  description?: string;
  /** 选项（用于 select、radio） */
  options?: Array<{ label: string; value: any }>;
  /** 最小值（用于 number、slider） */
  min?: number;
  /** 最大值（用于 number、slider） */
  max?: number;
  /** 步长（用于 number、slider） */
  step?: number;
  /** 属性分组 */
  group?: string;
  /** 是否可数据绑定 */
  bindable?: boolean;
  /** 验证规则 */
  rules?: any[];
  /** 条件显示 */
  condition?: (props: Record<string, any>) => boolean;
}

/**
 * 属性类型
 */
export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime'
  | 'time'
  | 'textarea'
  | 'json'
  | 'array'
  | 'object'
  | 'function'
  | 'expression'
  | 'datasource'
  | 'icon'
  | 'image'
  | 'file';

/**
 * 事件元数据
 */
export interface EventMeta {
  /** 事件名 */
  name: string;
  /** 显示标签 */
  label: string;
  /** 描述 */
  description?: string;
  /** 参数 */
  params?: EventParamMeta[];
}

/**
 * 事件参数元数据
 */
export interface EventParamMeta {
  /** 参数名 */
  name: string;
  /** 参数类型 */
  type: string;
  /** 描述 */
  description?: string;
}

/**
 * 插槽元数据
 */
export interface SlotMeta {
  /** 插槽名 */
  name: string;
  /** 显示标签 */
  label: string;
  /** 描述 */
  description?: string;
  /** 是否为作用域插槽 */
  scoped?: boolean;
  /** 作用域参数 */
  scopeParams?: Record<string, string>;
}

/**
 * 物料分类
 */
export interface MaterialCategory {
  /** 分类 ID */
  id: string;
  /** 分类名称 */
  name: string;
  /** 图标 */
  icon?: string;
  /** 描述 */
  description?: string;
  /** 排序 */
  order?: number;
}

/**
 * 物料包
 */
export interface MaterialPackage {
  /** 包名 */
  name: string;
  /** 版本 */
  version: string;
  /** 描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 物料列表 */
  materials: Material[];
  /** 分类 */
  categories?: MaterialCategory[];
  /** 依赖 */
  dependencies?: Record<string, string>;
}

/**
 * 物料注册表接口
 */
export interface MaterialRegistry {
  /** 注册物料 */
  register(material: Material): void;
  /** 批量注册 */
  registerAll(materials: Material[]): void;
  /** 注册物料包 */
  registerPackage(pkg: MaterialPackage): void;
  /** 获取物料 */
  get(name: string): Material | undefined;
  /** 获取所有物料 */
  getAll(): Material[];
  /** 按分类获取 */
  getByCategory(category: string): Material[];
  /** 获取所有分类 */
  getCategories(): MaterialCategory[];
  /** 搜索物料 */
  search(keyword: string): Material[];
  /** 取消注册 */
  unregister(name: string): void;
}

/**
 * 物料加载器接口
 */
export interface MaterialLoader {
  /** 加载物料包 */
  load(source: string): Promise<MaterialPackage>;
  /** 加载远程物料 */
  loadRemote(url: string): Promise<MaterialPackage>;
  /** 加载本地物料 */
  loadLocal(path: string): Promise<MaterialPackage>;
}

/**
 * 物料元数据
 */
export interface MaterialMetadata {
  /** 包名 */
  package: string;
  /** 物料名 */
  name: string;
  /** 版本 */
  version: string;
  /** 加载时间 */
  loadedAt: Date;
  /** 来源 */
  source: 'builtin' | 'npm' | 'remote' | 'local';
}



