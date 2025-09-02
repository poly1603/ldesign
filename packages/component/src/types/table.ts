/**
 * Table 表格组件类型定义
 */

/**
 * 表格列配置接口
 */
export interface TableColumn {
  /**
   * 列的唯一标识
   */
  key: string;

  /**
   * 列标题
   */
  title: string;

  /**
   * 列宽度
   */
  width?: string | number;

  /**
   * 是否可排序
   */
  sortable?: boolean;

  /**
   * 是否可筛选
   */
  filterable?: boolean;

  /**
   * 是否可调整大小
   */
  resizable?: boolean;

  /**
   * 列对齐方式
   */
  align?: 'left' | 'center' | 'right';

  /**
   * 是否固定列
   */
  fixed?: 'left' | 'right' | boolean;

  /**
   * 自定义渲染函数
   */
  render?: (value: any, row: TableRow, index: number) => any;

  /**
   * 自定义筛选器
   */
  filters?: TableFilter[];

  /**
   * 默认排序方向
   */
  defaultSortOrder?: 'asc' | 'desc';

  /**
   * 列的数据类型
   */
  dataType?: 'string' | 'number' | 'date' | 'boolean';

  /**
   * 是否可编辑
   */
  editable?: boolean;

  /**
   * 列的CSS类名
   */
  className?: string;

  /**
   * 列的样式
   */
  style?: { [key: string]: string };
}

/**
 * 表格行数据接口
 */
export interface TableRow {
  /**
   * 行的唯一标识
   */
  id?: string | number;

  /**
   * 行的键值
   */
  key?: string | number;

  /**
   * 行数据
   */
  [key: string]: any;
}

/**
 * 排序配置接口
 */
export interface SortConfig {
  /**
   * 排序列
   */
  column?: string;

  /**
   * 排序方向
   */
  direction?: 'asc' | 'desc' | null;
}

/**
 * 筛选配置接口
 */
export interface FilterConfig {
  /**
   * 筛选条件
   */
  [key: string]: any;
}

/**
 * 筛选器接口
 */
export interface TableFilter {
  /**
   * 筛选器文本
   */
  text: string;

  /**
   * 筛选器值
   */
  value: any;

  /**
   * 是否选中
   */
  selected?: boolean;
}

/**
 * 分页配置接口
 */
export interface PaginationConfig {
  /**
   * 当前页码
   */
  current?: number;

  /**
   * 每页条数
   */
  pageSize?: number;

  /**
   * 总条数
   */
  total?: number;

  /**
   * 是否显示每页条数选择器
   */
  showSizeChanger?: boolean;

  /**
   * 是否显示快速跳转
   */
  showQuickJumper?: boolean;

  /**
   * 是否显示总数
   */
  showTotal?: boolean;

  /**
   * 每页条数选项
   */
  pageSizeOptions?: number[];

  /**
   * 总数显示函数
   */
  showTotalText?: (total: number, range: [number, number]) => string;
}

/**
 * 表格属性接口
 */
export interface TableProps {
  /**
   * 表格列配置
   */
  columns?: TableColumn[];

  /**
   * 表格数据
   */
  data?: TableRow[];

  /**
   * 是否显示边框
   */
  bordered?: boolean;

  /**
   * 是否显示斑马纹
   */
  striped?: boolean;

  /**
   * 表格尺寸
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * 是否显示表头
   */
  showHeader?: boolean;

  /**
   * 是否可选择行
   */
  selectable?: boolean;

  /**
   * 选择类型
   */
  selectionType?: 'checkbox' | 'radio';

  /**
   * 是否可排序
   */
  sortable?: boolean;

  /**
   * 是否可筛选
   */
  filterable?: boolean;

  /**
   * 是否可调整列宽
   */
  resizable?: boolean;

  /**
   * 是否固定表头
   */
  fixedHeader?: boolean;

  /**
   * 表格高度
   */
  height?: string | number;

  /**
   * 是否显示分页
   */
  pagination?: boolean;

  /**
   * 分页配置
   */
  paginationConfig?: PaginationConfig;

  /**
   * 加载状态
   */
  loading?: boolean;

  /**
   * 空数据提示
   */
  emptyText?: string;

  /**
   * 自定义样式类名
   */
  customClass?: string;
}

/**
 * 表格事件接口
 */
export interface TableEvents {
  /**
   * 行选择事件
   */
  ldRowSelect: (event: TableRowSelectEvent) => void;

  /**
   * 行点击事件
   */
  ldRowClick: (event: TableRowClickEvent) => void;

  /**
   * 排序事件
   */
  ldSort: (event: TableSortEvent) => void;

  /**
   * 筛选事件
   */
  ldFilter: (event: TableFilterEvent) => void;

  /**
   * 分页事件
   */
  ldPageChange: (event: TablePageChangeEvent) => void;

  /**
   * 列宽调整事件
   */
  ldColumnResize: (event: TableColumnResizeEvent) => void;

  /**
   * 行展开事件
   */
  ldRowExpand: (event: TableRowExpandEvent) => void;
}

/**
 * 表格方法接口
 */
export interface TableMethods {
  /**
   * 获取选中的行
   */
  getSelectedRows(): Promise<TableRow[]>;

  /**
   * 设置选中的行
   */
  setSelectedRows(keys: (string | number)[]): Promise<void>;

  /**
   * 清空选择
   */
  clearSelection(): Promise<void>;

  /**
   * 刷新表格
   */
  refresh(): Promise<void>;

  /**
   * 滚动到指定行
   */
  scrollToRow(index: number): Promise<void>;

  /**
   * 获取表格数据
   */
  getData(): Promise<TableRow[]>;

  /**
   * 设置表格数据
   */
  setData(data: TableRow[]): Promise<void>;
}

/**
 * 行选择事件接口
 */
export interface TableRowSelectEvent {
  /**
   * 选中的行数据
   */
  row: TableRow;

  /**
   * 行索引
   */
  index: number;

  /**
   * 是否选中
   */
  selected: boolean;

  /**
   * 所有选中行的键值
   */
  selectedRows: (string | number)[];
}

/**
 * 行点击事件接口
 */
export interface TableRowClickEvent {
  /**
   * 点击的行数据
   */
  row: TableRow;

  /**
   * 行索引
   */
  index: number;

  /**
   * 原始事件
   */
  event: MouseEvent;
}

/**
 * 排序事件接口
 */
export interface TableSortEvent {
  /**
   * 排序列
   */
  column: TableColumn;

  /**
   * 排序方向
   */
  direction: 'asc' | 'desc' | null;

  /**
   * 排序配置
   */
  sortConfig: SortConfig;
}

/**
 * 筛选事件接口
 */
export interface TableFilterEvent {
  /**
   * 筛选列
   */
  column: TableColumn;

  /**
   * 筛选值
   */
  value: any;

  /**
   * 筛选配置
   */
  filterConfig: FilterConfig;
}

/**
 * 分页事件接口
 */
export interface TablePageChangeEvent {
  /**
   * 当前页码
   */
  current: number;

  /**
   * 每页条数
   */
  pageSize: number;

  /**
   * 总条数
   */
  total: number;
}

/**
 * 列宽调整事件接口
 */
export interface TableColumnResizeEvent {
  /**
   * 调整的列
   */
  column: TableColumn;

  /**
   * 新宽度
   */
  width: number;

  /**
   * 旧宽度
   */
  oldWidth: number;
}

/**
 * 行展开事件接口
 */
export interface TableRowExpandEvent {
  /**
   * 展开的行数据
   */
  row: TableRow;

  /**
   * 行索引
   */
  index: number;

  /**
   * 是否展开
   */
  expanded: boolean;
}

/**
 * 表格插槽接口
 */
export interface TableSlots {
  /**
   * 默认插槽 - 表格内容
   */
  default: any;

  /**
   * 空数据插槽
   */
  empty: any;

  /**
   * 加载插槽
   */
  loading: any;

  /**
   * 表头插槽
   */
  header: any;

  /**
   * 表尾插槽
   */
  footer: any;
}

/**
 * 表格配置选项
 */
export interface TableConfig extends TableProps {
  /**
   * 虚拟滚动配置
   */
  virtualScroll?: {
    /**
     * 是否启用虚拟滚动
     */
    enabled: boolean;

    /**
     * 行高度
     */
    itemHeight: number;

    /**
     * 缓冲区大小
     */
    buffer: number;
  };

  /**
   * 树形数据配置
   */
  treeConfig?: {
    /**
     * 子节点字段名
     */
    childrenKey: string;

    /**
     * 是否默认展开所有节点
     */
    defaultExpandAll: boolean;

    /**
     * 默认展开的节点键值
     */
    defaultExpandedKeys: (string | number)[];
  };

  /**
   * 拖拽配置
   */
  dragConfig?: {
    /**
     * 是否可拖拽行
     */
    rowDraggable: boolean;

    /**
     * 是否可拖拽列
     */
    columnDraggable: boolean;
  };
}
