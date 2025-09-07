/**
 * 表单布局工具模块
 * 
 * @description
 * 提供动态网格布局和智能按钮定位的通用逻辑，
 * 确保三种实现方式（原生JavaScript、Web Components、Vue组件）的表现完全一致
 */

/**
 * 字段配置接口
 */
export interface FieldConfig {
  name: string
  label: string
  row: number
  type?: 'text' | 'select'
  options?: { value: string; label: string }[]
  placeholder?: string
}

/**
 * 表单配置接口
 */
export interface FormConfig {
  defaultRowCount: number
  collapsible: boolean
  actionPosition: 'inline' | 'newline'
  actionAlign: 'left' | 'center' | 'right'
  layoutMode?: 'adaptive' | 'fixed-2' | 'fixed-3' | 'fixed-4'
  minFieldWidth?: number
  buttonColumns?: number
}

/**
 * 布局计算结果接口
 */
export interface LayoutResult {
  dynamicColumns: number
  shouldButtonsInRow: boolean
  buttonGridColumn: string
  lastVisibleRow: number
  visibleRows: number
  fieldVisibleRows: number
  maxVisibleFields: number // 新增：最大可见字段数
}

/**
 * 断点配置
 */
const BREAKPOINTS = {
  mobile: { max: 768, minColumns: 2, minFieldWidth: 150 },
  tablet: { max: 1200, minColumns: 3, minFieldWidth: 180 },
  desktop: { max: Infinity, minColumns: 4, minFieldWidth: 200 }
}

/**
 * 根据容器宽度和字段最小宽度计算最优列数
 * 
 * @param containerWidth 容器宽度
 * @param minFieldWidth 字段最小宽度
 * @param layoutMode 布局模式
 * @returns 最优列数
 */
export const calculateOptimalColumns = (
  containerWidth: number,
  minFieldWidth: number = 200,
  layoutMode: FormConfig['layoutMode'] = 'adaptive'
): number => {
  // 固定布局模式
  if (layoutMode?.startsWith('fixed-')) {
    const fixedColumns = parseInt(layoutMode.split('-')[1])
    return Math.max(1, fixedColumns)
  }

  // 自适应布局模式
  if (containerWidth <= 0) return 1

  // 根据断点确定最小列数和字段宽度
  let minColumns = 1
  let effectiveMinWidth = minFieldWidth

  for (const [, breakpoint] of Object.entries(BREAKPOINTS)) {
    if (containerWidth <= breakpoint.max) {
      minColumns = breakpoint.minColumns
      effectiveMinWidth = Math.max(minFieldWidth, breakpoint.minFieldWidth)
      break
    }
  }

  // 计算最优列数，但不少于断点要求的最小列数
  const calculatedColumns = Math.floor(containerWidth / effectiveMinWidth)
  return Math.max(minColumns, Math.min(calculatedColumns, 6)) // 最多6列
}

/**
 * 按行分组字段
 * 
 * @param fields 字段配置数组
 * @returns 按行分组的字段对象
 */
export const groupFieldsByRow = (fields: FieldConfig[]): Record<number, FieldConfig[]> => {
  const result: Record<number, FieldConfig[]> = {}
  fields.forEach(field => {
    if (!result[field.row]) {
      result[field.row] = []
    }
    result[field.row].push(field)
  })
  return result
}

/**
 * 计算表单布局参数
 *
 * @param config 表单配置
 * @param fields 字段配置数组
 * @param isExpanded 是否展开
 * @param containerWidth 容器宽度
 * @returns 布局计算结果
 */
export const calculateFormLayout = (
  config: FormConfig,
  fields: FieldConfig[],
  isExpanded: boolean,
  containerWidth: number
): LayoutResult => {
  // 计算基础参数
  const maxRows = Math.max(...fields.map(f => f.row))
  const fieldVisibleRows = isExpanded ? maxRows : config.defaultRowCount
  const lastVisibleRow = fieldVisibleRows

  // 计算动态列数
  const dynamicColumns = calculateOptimalColumns(
    containerWidth,
    config.minFieldWidth,
    config.layoutMode
  )

  // 计算最大可见字段数
  let maxVisibleFields: number
  if (isExpanded) {
    // 展开状态：显示所有字段
    maxVisibleFields = fields.length
  } else {
    // 收起状态：根据行数和列数计算
    const buttonColumns = config.buttonColumns || 1
    if (config.actionPosition === 'inline') {
      // 按钮在行内：需要为按钮预留空间
      const totalAvailableSlots = fieldVisibleRows * dynamicColumns
      maxVisibleFields = Math.max(0, totalAvailableSlots - buttonColumns)
    } else {
      // 按钮新行：可以使用全部空间
      maxVisibleFields = fieldVisibleRows * dynamicColumns
    }
    // 不能超过实际字段数量
    maxVisibleFields = Math.min(maxVisibleFields, fields.length)
  }

  // 计算实际显示的字段（按顺序）
  const visibleFields = fields.slice(0, maxVisibleFields)

  // 重新计算按钮布局（基于实际显示的字段）
  const buttonColumns = config.buttonColumns || 1
  let shouldButtonsInRow = false
  let buttonGridColumn = '1 / -1' // 默认新行

  if (config.actionPosition === 'inline' && visibleFields.length > 0) {
    // 计算最后一个显示字段的位置
    const lastFieldIndex = visibleFields.length - 1
    const lastFieldRow = Math.floor(lastFieldIndex / dynamicColumns) + 1
    const lastFieldCol = (lastFieldIndex % dynamicColumns) + 1

    // 检查最后一行是否有足够空间放置按钮
    const availableColumnsInLastRow = dynamicColumns - lastFieldCol
    if (availableColumnsInLastRow >= buttonColumns) {
      shouldButtonsInRow = true
      const startColumn = lastFieldCol + 1
      const endColumn = dynamicColumns + 1
      buttonGridColumn = `${startColumn} / ${endColumn}`
    }
  }

  // 计算实际可见行数（用于状态显示，包括按钮行）
  const actualFieldRows = Math.ceil(visibleFields.length / dynamicColumns)
  const visibleRows = shouldButtonsInRow ? actualFieldRows : actualFieldRows + 1

  return {
    dynamicColumns,
    shouldButtonsInRow,
    buttonGridColumn,
    lastVisibleRow: actualFieldRows,
    visibleRows,
    fieldVisibleRows: actualFieldRows,
    maxVisibleFields
  }
}

/**
 * 创建ResizeObserver监听容器宽度变化
 * 
 * @param element 要监听的元素
 * @param callback 宽度变化回调函数
 * @returns ResizeObserver实例
 */
export const createResizeObserver = (
  element: Element,
  callback: (width: number) => void
): ResizeObserver => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const containerWidth = entry.contentRect.width
      callback(containerWidth)
    }
  })

  resizeObserver.observe(element)
  return resizeObserver
}

/**
 * 防抖函数
 * 
 * @param func 要防抖的函数
 * @param wait 等待时间（毫秒）
 * @returns 防抖后的函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 获取元素的实际可用宽度（减去padding和border）
 * 
 * @param element DOM元素
 * @returns 可用宽度
 */
export const getAvailableWidth = (element: HTMLElement): number => {
  const computedStyle = window.getComputedStyle(element)
  const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
  const paddingRight = parseFloat(computedStyle.paddingRight) || 0
  const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
  const borderRight = parseFloat(computedStyle.borderRightWidth) || 0

  const totalPadding = paddingLeft + paddingRight + borderLeft + borderRight
  return Math.max(0, element.offsetWidth - totalPadding)
}

/**
 * 生成CSS Grid模板列字符串
 *
 * @param columns 列数
 * @returns CSS Grid模板列字符串
 */
export const generateGridTemplate = (columns: number): string => {
  return `repeat(${columns}, 1fr)`
}

/**
 * 为字段生成网格样式
 * 移除明确的grid-column定位，让CSS Grid自动流动以确保列宽一致
 *
 * @param fieldIndex 字段在当前行中的索引（从0开始）
 * @param totalColumns 总列数
 * @returns 字段的网格样式对象
 */
export const generateFieldGridStyle = (fieldIndex: number, totalColumns: number): Record<string, string> => {
  // 不设置明确的grid-column，让CSS Grid自动流动
  // 这样可以确保所有行的列宽保持一致
  return {}
}

/**
 * 为按钮组生成网格定位样式
 *
 * @param buttonGridColumn 按钮组的网格列位置字符串
 * @returns 按钮组的网格定位样式对象
 */
export const generateButtonGridStyle = (buttonGridColumn: string): Record<string, string> => {
  return {
    gridColumn: buttonGridColumn
  }
}

/**
 * 默认表单配置
 */
export const DEFAULT_FORM_CONFIG: FormConfig = {
  defaultRowCount: 1,
  collapsible: true,
  actionPosition: 'inline',
  actionAlign: 'left',
  layoutMode: 'adaptive',
  minFieldWidth: 200,
  buttonColumns: 1
}

/**
 * 默认字段配置
 */
export const DEFAULT_FIELDS: FieldConfig[] = [
  // 第一行 - 基础搜索条件
  { name: 'keyword', label: '关键词', row: 1, type: 'text', placeholder: '请输入搜索关键词' },
  {
    name: 'category', label: '分类', row: 1, type: 'select', options: [
      { value: '', label: '请选择分类' },
      { value: 'tech', label: '技术' },
      { value: 'design', label: '设计' },
      { value: 'product', label: '产品' },
      { value: 'marketing', label: '市场' }
    ]
  },
  {
    name: 'status', label: '状态', row: 1, type: 'select', options: [
      { value: '', label: '请选择状态' },
      { value: 'active', label: '激活' },
      { value: 'inactive', label: '未激活' },
      { value: 'pending', label: '待审核' },
      { value: 'draft', label: '草稿' }
    ]
  },
  { name: 'code', label: '编号', row: 1, type: 'text', placeholder: '请输入编号' },

  // 第二行 - 时间和人员
  { name: 'dateRange', label: '日期范围', row: 2, type: 'text', placeholder: '请选择日期范围' },
  { name: 'creator', label: '创建人', row: 2, type: 'text', placeholder: '请输入创建人' },
  {
    name: 'priority', label: '优先级', row: 2, type: 'select', options: [
      { value: '', label: '请选择优先级' },
      { value: 'urgent', label: '紧急' },
      { value: 'high', label: '高' },
      { value: 'medium', label: '中' },
      { value: 'low', label: '低' }
    ]
  },
  { name: 'assignee', label: '负责人', row: 2, type: 'text', placeholder: '请输入负责人' },

  // 第三行 - 组织和项目
  {
    name: 'department', label: '部门', row: 3, type: 'select', options: [
      { value: '', label: '请选择部门' },
      { value: 'tech', label: '技术部' },
      { value: 'product', label: '产品部' },
      { value: 'design', label: '设计部' },
      { value: 'operation', label: '运营部' },
      { value: 'marketing', label: '市场部' },
      { value: 'hr', label: '人事部' }
    ]
  },
  { name: 'project', label: '项目', row: 3, type: 'text', placeholder: '请输入项目名称' },
  {
    name: 'region', label: '地区', row: 3, type: 'select', options: [
      { value: '', label: '请选择地区' },
      { value: 'north', label: '华北' },
      { value: 'south', label: '华南' },
      { value: 'east', label: '华东' },
      { value: 'west', label: '华西' }
    ]
  },
  { name: 'budget', label: '预算', row: 3, type: 'text', placeholder: '请输入预算范围' },

  // 第四行 - 标签和属性
  { name: 'tags', label: '标签', row: 4, type: 'text', placeholder: '请输入标签，多个用逗号分隔' },
  {
    name: 'type', label: '类型', row: 4, type: 'select', options: [
      { value: '', label: '请选择类型' },
      { value: 'feature', label: '功能' },
      { value: 'bug', label: '缺陷' },
      { value: 'improvement', label: '改进' },
      { value: 'task', label: '任务' }
    ]
  },
  { name: 'version', label: '版本', row: 4, type: 'text', placeholder: '请输入版本号' },
  {
    name: 'environment', label: '环境', row: 4, type: 'select', options: [
      { value: '', label: '请选择环境' },
      { value: 'dev', label: '开发环境' },
      { value: 'test', label: '测试环境' },
      { value: 'staging', label: '预发布环境' },
      { value: 'prod', label: '生产环境' }
    ]
  },

  // 第五行 - 扩展属性
  { name: 'source', label: '来源', row: 5, type: 'text', placeholder: '请输入来源' },
  {
    name: 'level', label: '级别', row: 5, type: 'select', options: [
      { value: '', label: '请选择级别' },
      { value: 'p0', label: 'P0' },
      { value: 'p1', label: 'P1' },
      { value: 'p2', label: 'P2' },
      { value: 'p3', label: 'P3' }
    ]
  },
  { name: 'platform', label: '平台', row: 5, type: 'text', placeholder: '请输入平台' },
  { name: 'remark', label: '备注', row: 5, type: 'text', placeholder: '请输入备注信息' }
]
