/**
 * @ldesign/form - Layout Type Definitions
 * 布局类型定义
 */

/**
 * 布局计算结果
 */
export interface LayoutResult {
  /** 当前列数 */
  columns: number
  /** 列宽 */
  columnWidth: number
  /** 标题宽度 */
  labelWidth: number
  /** 容器宽度 */
  containerWidth: number
  /** 是否需要换行 */
  needWrap: boolean
}

/**
 * 字段布局信息
 */
export interface FieldLayout {
  /** 字段名称 */
  name: string
  /** 占用列数 */
  span: number
  /** 行索引 */
  row: number
  /** 列索引 */
  column: number
  /** 是否可见 */
  visible: boolean
  /** 是否在预览区域 */
  inPreview: boolean
}

/**
 * 布局上下文
 */
export interface LayoutContext {
  /** 容器宽度 */
  containerWidth: number
  /** 配置的列宽 */
  spanWidth: number
  /** 最大列数 */
  maxSpan: number
  /** 最小列数 */
  minSpan: number
  /** 字段列表 */
  fields: Array<{ name: string; span: number; visible: boolean }>
}

/**
 * 标题宽度计算结果
 */
export interface LabelWidthResult {
  /** 各列的标题宽度 */
  widths: number[]
  /** 最大标题宽度 */
  maxWidth: number
  /** 是否有多行标题 */
  hasMultiline: boolean
}




