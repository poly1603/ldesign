/**
 * 核心类型定义
 */

// ============== 基础类型 ==============

export type RowKey = string | number;

export interface RowData {
  [key: string]: any;
}

// ============== 列定义 ==============

export type ColumnAlign = 'left' | 'center' | 'right';
export type ColumnFixed = 'left' | 'right' | false;
export type SortOrder = 'asc' | 'desc' | null;

export interface ColumnDef<TData = RowData> {
  /** 列唯一标识 */
  id?: string;
  /** 数据字段名 */
  prop?: keyof TData;
  /** 列标题 */
  label?: string;
  /** 列宽度 */
  width?: number;
  /** 最小宽度 */
  minWidth?: number;
  /** 最大宽度 */
  maxWidth?: number;
  /** 对齐方式 */
  align?: ColumnAlign;
  /** 固定列 */
  fixed?: ColumnFixed;
  /** 是否可排序 */
  sortable?: boolean;
  /** 是否可筛选 */
  filterable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 自定义渲染器 */
  render?: (row: TData, rowIndex: number) => any;
  /** 自定义格式化 */
  formatter?: (value: any, row: TData, rowIndex: number) => any;
  /** 自定义排序函数 */
  sortFn?: (a: TData, b: TData) => number;
  /** 自定义筛选函数 */
  filterFn?: (value: any, row: TData) => boolean;
  /** 子列（用于多级表头） */
  children?: ColumnDef<TData>[];
}

export interface Column<TData = RowData> extends Omit<Required<ColumnDef<TData>>, 'children' | 'formatter' | 'sortFn' | 'filterFn'> {
  /** 计算后的列ID */
  id: string;
  /** 层级 */
  level: number;
  /** 父列ID */
  parentId?: string;
  /** 子列 */
  children?: Column<TData>[];
  /** 实际渲染宽度 */
  computedWidth: number;
  /** 固定列偏移量 */
  fixedOffset?: number;
  /** 自定义格式化 */
  formatter?: (value: any, row: TData, rowIndex: number) => any;
  /** 自定义排序函数 */
  sortFn?: (a: TData, b: TData) => number;
  /** 自定义筛选函数 */
  filterFn?: (value: any, row: TData) => boolean;
}

// ============== 排序 ==============

export interface SortingColumn {
  id: string;
  order: 'asc' | 'desc';
}

export type SortingState = SortingColumn[];

// ============== 筛选 ==============

export type FilterOperator = 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: any;
}

export type FilterState = FilterCondition[];

// ============== 分页 ==============

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  total?: number;
}

// ============== 选择 ==============

export type SelectionMode = 'single' | 'multiple' | false;

export interface SelectionState {
  selectedRowKeys: Set<RowKey>;
  mode: SelectionMode;
}

// ============== 展开行 ==============

export interface ExpandState {
  expandedRowKeys: Set<RowKey>;
}

// ============== 编辑 ==============

export interface EditCell {
  rowKey: RowKey;
  columnId: string;
  value: any;
}

export interface EditState {
  editingCells: Map<string, EditCell>;
}

// ============== 虚拟滚动 ==============

export interface VirtualScrollState {
  /** 滚动容器高度 */
  containerHeight: number;
  /** 滚动容器宽度 */
  containerWidth: number;
  /** 垂直滚动位置 */
  scrollTop: number;
  /** 水平滚动位置 */
  scrollLeft: number;
  /** 可见行范围 */
  visibleRowRange: { start: number; end: number };
  /** 可见列范围 */
  visibleColumnRange: { start: number; end: number };
  /** 缓冲区大小 */
  overscan: number;
}

// ============== 表格配置 ==============

export interface TableOptions<TData = RowData> {
  /** 数据源 */
  data: TData[];
  /** 列定义 */
  columns: ColumnDef<TData>[];
  /** 行唯一键 */
  rowKey?: keyof TData | ((row: TData) => RowKey);
  /** 默认行高 */
  rowHeight?: number;
  /** 表头高度 */
  headerHeight?: number;
  /** 是否启用虚拟滚动 */
  virtual?: boolean;
  /** 虚拟滚动缓冲区 */
  overscan?: number;
  /** 是否显示斑马纹 */
  stripe?: boolean;
  /** 是否显示边框 */
  border?: boolean;
  /** 选择模式 */
  selectionMode?: SelectionMode;
  /** 默认选中行 */
  defaultSelectedRowKeys?: RowKey[];
  /** 默认展开行 */
  defaultExpandedRowKeys?: RowKey[];
  /** 默认排序 */
  defaultSorting?: SortingState;
  /** 默认筛选 */
  defaultFilters?: FilterState;
  /** 默认分页 */
  defaultPagination?: PaginationState;
  /** 是否支持树形数据 */
  treeProps?: {
    children?: string;
    hasChildren?: string;
  };
}

// ============== 表格状态 ==============

export interface TableState<TData = RowData> {
  /** 原始数据 */
  rawData: TData[];
  /** 处理后的数据（排序、筛选、分页后） */
  processedData: TData[];
  /** 列信息 */
  columns: Column<TData>[];
  /** 排序状态 */
  sorting: SortingState;
  /** 筛选状态 */
  filters: FilterState;
  /** 分页状态 */
  pagination: PaginationState | null;
  /** 选择状态 */
  selection: SelectionState;
  /** 展开状态 */
  expand: ExpandState;
  /** 编辑状态 */
  edit: EditState;
  /** 虚拟滚动状态 */
  virtualScroll: VirtualScrollState | null;
}

// ============== 事件 ==============

export interface TableEvents<TData = RowData> {
  onDataChange?: (data: TData[]) => void;
  onSortChange?: (sorting: SortingState) => void;
  onFilterChange?: (filters: FilterState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSelectionChange?: (selectedKeys: RowKey[], selectedRows: TData[]) => void;
  onExpandChange?: (expandedKeys: RowKey[]) => void;
  onCellClick?: (row: TData, column: Column<TData>, event: Event) => void;
  onRowClick?: (row: TData, event: Event) => void;
  onCellEdit?: (cell: EditCell) => void;
}

// ============== 监听器 ==============

export type StateListener<TData = RowData> = (state: TableState<TData>) => void;
export type Unsubscribe = () => void;


