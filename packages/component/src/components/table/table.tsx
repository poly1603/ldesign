import { Component, Prop, State, Element, Event, EventEmitter, Watch, Method, h, Host } from '@stencil/core';
import { generateId } from '../../utils';

/**
 * Table 表格组件
 * 
 * 用于展示行列数据的表格组件，支持排序、筛选、分页等功能
 * 
 * @example
 * ```tsx
 * <ld-table columns={columns} data={data}></ld-table>
 * ```
 */
@Component({
  tag: 'ld-table',
  styleUrl: 'table.less',
  shadow: true,
})
export class Table {
  @Element() el!: HTMLElement;

  /**
   * 表格列配置
   */
  @Prop() columns: TableColumn[] = [];

  /**
   * 表格数据
   */
  @Prop() data: TableRow[] = [];

  /**
   * 是否显示边框
   */
  @Prop() bordered: boolean = false;

  /**
   * 是否显示斑马纹
   */
  @Prop() striped: boolean = false;

  /**
   * 表格尺寸
   */
  @Prop() size: 'small' | 'medium' | 'large' = 'medium';

  /**
   * 是否显示表头
   */
  @Prop() showHeader: boolean = true;

  /**
   * 是否可选择行
   */
  @Prop() selectable: boolean = false;

  /**
   * 选择类型
   */
  @Prop() selectionType: 'checkbox' | 'radio' = 'checkbox';

  /**
   * 是否可排序
   */
  @Prop() sortable: boolean = false;

  /**
   * 是否可筛选
   */
  @Prop() filterable: boolean = false;

  /**
   * 是否可调整列宽
   */
  @Prop() resizable: boolean = false;

  /**
   * 是否固定表头
   */
  @Prop() fixedHeader: boolean = false;

  /**
   * 表格高度（固定表头时使用）
   */
  @Prop() height?: string | number;

  /**
   * 是否显示分页
   */
  @Prop() pagination: boolean = false;

  /**
   * 分页配置
   */
  @Prop() paginationConfig?: PaginationConfig;

  /**
   * 加载状态
   */
  @Prop() loading: boolean = false;

  /**
   * 空数据提示
   */
  @Prop() emptyText: string = '暂无数据';

  /**
   * 自定义样式类名
   */
  @Prop() customClass?: string;

  /**
   * 内部状态：选中的行
   */
  @State() selectedRows: Set<string | number> = new Set();

  /**
   * 内部状态：排序配置
   */
  @State() sortConfig: SortConfig = {};

  /**
   * 内部状态：筛选配置
   */
  @State() filterConfig: FilterConfig = {};

  /**
   * 内部状态：当前页码
   */
  @State() currentPage: number = 1;

  /**
   * 内部状态：每页条数
   */
  @State() pageSize: number = 10;

  /**
   * 内部状态：表格 ID
   */
  @State() tableId: string = generateId('table');

  /**
   * 行选择事件
   */
  @Event() ldRowSelect!: EventEmitter<TableRowSelectEvent>;

  /**
   * 行点击事件
   */
  @Event() ldRowClick!: EventEmitter<TableRowClickEvent>;

  /**
   * 排序事件
   */
  @Event() ldSort!: EventEmitter<TableSortEvent>;

  /**
   * 筛选事件
   */
  @Event() ldFilter!: EventEmitter<TableFilterEvent>;

  /**
   * 分页事件
   */
  @Event() ldPageChange!: EventEmitter<TablePageChangeEvent>;

  /**
   * 监听数据变化
   */
  @Watch('data')
  onDataChange() {
    // 重置选择状态
    this.selectedRows.clear();
    this.selectedRows = new Set(this.selectedRows);
  }

  /**
   * 监听分页配置变化
   */
  @Watch('paginationConfig')
  onPaginationConfigChange(newConfig: PaginationConfig) {
    if (newConfig) {
      this.currentPage = newConfig.current || 1;
      this.pageSize = newConfig.pageSize || 10;
    }
  }

  /**
   * 组件加载完成
   */
  componentDidLoad() {
    if (this.paginationConfig) {
      this.currentPage = this.paginationConfig.current || 1;
      this.pageSize = this.paginationConfig.pageSize || 10;
    }
  }

  /**
   * 获取选中的行
   */
  @Method()
  async getSelectedRows(): Promise<TableRow[]> {
    return this.data.filter((row, index) =>
      this.selectedRows.has(this.getRowKey(row, index))
    );
  }

  /**
   * 设置选中的行
   */
  @Method()
  async setSelectedRows(keys: (string | number)[]): Promise<void> {
    this.selectedRows = new Set(keys);
  }

  /**
   * 清空选择
   */
  @Method()
  async clearSelection(): Promise<void> {
    this.selectedRows.clear();
    this.selectedRows = new Set(this.selectedRows);
  }

  /**
   * 获取行的唯一标识
   */
  private getRowKey(row: TableRow, index: number): string | number {
    return row.id || row.key || index;
  }

  /**
   * 处理行选择
   */
  private handleRowSelect = (row: TableRow, index: number, selected: boolean) => {
    const key = this.getRowKey(row, index);

    if (this.selectionType === 'radio') {
      this.selectedRows.clear();
      if (selected) {
        this.selectedRows.add(key);
      }
    } else {
      if (selected) {
        this.selectedRows.add(key);
      } else {
        this.selectedRows.delete(key);
      }
    }

    this.selectedRows = new Set(this.selectedRows);

    this.ldRowSelect.emit({
      row,
      index,
      selected,
      selectedRows: Array.from(this.selectedRows),
    });
  };

  /**
   * 处理全选
   */
  private handleSelectAll = (selected: boolean) => {
    if (selected) {
      this.getCurrentPageData().forEach((row, index) => {
        const key = this.getRowKey(row, index);
        this.selectedRows.add(key);
      });
    } else {
      this.getCurrentPageData().forEach((row, index) => {
        const key = this.getRowKey(row, index);
        this.selectedRows.delete(key);
      });
    }

    this.selectedRows = new Set(this.selectedRows);
  };

  /**
   * 处理行点击
   */
  private handleRowClick = (row: TableRow, index: number, event: MouseEvent) => {
    this.ldRowClick.emit({
      row,
      index,
      event,
    });
  };

  /**
   * 处理排序
   */
  private handleSort = (column: TableColumn, direction: 'asc' | 'desc' | null) => {
    this.sortConfig = {
      column: column.key,
      direction,
    };

    this.ldSort.emit({
      column,
      direction,
      sortConfig: this.sortConfig,
    });
  };

  /**
   * 处理筛选
   */
  private handleFilter = (column: TableColumn, value: any) => {
    this.filterConfig = {
      ...this.filterConfig,
      [column.key]: value,
    };

    this.ldFilter.emit({
      column,
      value,
      filterConfig: this.filterConfig,
    });
  };

  /**
   * 处理分页
   */
  private handlePageChange = (page: number, pageSize: number) => {
    this.currentPage = page;
    this.pageSize = pageSize;

    this.ldPageChange.emit({
      current: page,
      pageSize,
      total: this.data.length,
    });
  };

  /**
   * 获取当前页数据
   */
  private getCurrentPageData(): TableRow[] {
    if (!this.pagination) {
      return this.data;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.data.slice(start, end);
  }

  /**
   * 获取表格样式
   */
  private getTableStyle() {
    const style: any = {};

    if (this.height) {
      if (typeof this.height === 'number') {
        style.height = `${this.height}px`;
      } else {
        style.height = this.height;
      }
    }

    return style;
  }

  /**
   * 渲染表头
   */
  private renderHeader() {
    if (!this.showHeader) {
      return null;
    }

    return (
      <thead class="ld-table__header">
        <tr>
          {this.selectable && (
            <th class="ld-table__selection-column">
              {this.selectionType === 'checkbox' && (
                <ld-checkbox
                  checked={this.isAllSelected()}
                  indeterminate={this.isIndeterminate()}
                  onChange={(e: CustomEvent) => this.handleSelectAll(e.detail)}
                />
              )}
            </th>
          )}
          {this.columns.map(column => (
            <th
              key={column.key}
              class={{
                'ld-table__header-cell': true,
                'ld-table__header-cell--sortable': column.sortable && this.sortable,
                'ld-table__header-cell--filtered': this.filterConfig[column.key] !== undefined,
              }}
              style={{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }}
            >
              <div class="ld-table__header-content">
                <span class="ld-table__header-title">{column.title}</span>
                {column.sortable && this.sortable && this.renderSortIcon(column)}
                {column.filterable && this.filterable && this.renderFilterIcon(column)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
    );
  }

  /**
   * 渲染表体
   */
  private renderBody() {
    const currentData = this.getCurrentPageData();

    if (currentData.length === 0) {
      return (
        <tbody class="ld-table__body">
          <tr>
            <td
              class="ld-table__empty"
              colSpan={this.columns.length + (this.selectable ? 1 : 0)}
            >
              {this.emptyText}
            </td>
          </tr>
        </tbody>
      );
    }

    return (
      <tbody class="ld-table__body">
        {currentData.map((row, index) => this.renderRow(row, index))}
      </tbody>
    );
  }

  /**
   * 渲染行
   */
  private renderRow(row: TableRow, index: number) {
    const key = this.getRowKey(row, index);
    const isSelected = this.selectedRows.has(key);

    return (
      <tr
        key={key}
        class={{
          'ld-table__row': true,
          'ld-table__row--selected': isSelected,
          'ld-table__row--clickable': !!this.ldRowClick.emit,
        }}
        onClick={(e) => this.handleRowClick(row, index, e)}
      >
        {this.selectable && (
          <td class="ld-table__selection-column">
            {this.selectionType === 'checkbox' ? (
              <ld-checkbox
                checked={isSelected}
                onChange={(e: CustomEvent) => this.handleRowSelect(row, index, e.detail)}
              />
            ) : (
              <ld-radio
                checked={isSelected}
                onChange={(e: CustomEvent) => this.handleRowSelect(row, index, e.detail)}
              />
            )}
          </td>
        )}
        {this.columns.map(column => (
          <td
            key={column.key}
            class="ld-table__cell"
            style={{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }}
          >
            {this.renderCell(row, column, index)}
          </td>
        ))}
      </tr>
    );
  }

  /**
   * 渲染单元格
   */
  private renderCell(row: TableRow, column: TableColumn, index: number) {
    const value = row[column.key];

    if (column.render) {
      return column.render(value, row, index);
    }

    return value;
  }

  /**
   * 渲染排序图标
   */
  private renderSortIcon(column: TableColumn) {
    const currentSort = this.sortConfig.column === column.key ? this.sortConfig.direction : null;

    return (
      <span class="ld-table__sort-icon">
        <button
          class={{
            'ld-table__sort-btn': true,
            'ld-table__sort-btn--active': currentSort === 'asc',
          }}
          onClick={() => this.handleSort(column, currentSort === 'asc' ? null : 'asc')}
        >
          ↑
        </button>
        <button
          class={{
            'ld-table__sort-btn': true,
            'ld-table__sort-btn--active': currentSort === 'desc',
          }}
          onClick={() => this.handleSort(column, currentSort === 'desc' ? null : 'desc')}
        >
          ↓
        </button>
      </span>
    );
  }

  /**
   * 渲染筛选图标
   */
  private renderFilterIcon(column: TableColumn) {
    return (
      <span class="ld-table__filter-icon">
        <button
          class={{
            'ld-table__filter-btn': true,
            'ld-table__filter-btn--active': this.filterConfig[column.key] !== undefined,
          }}
          onClick={() => this.handleFilter(column, '')}
        >
          🔍
        </button>
      </span>
    );
  }

  /**
   * 是否全选
   */
  private isAllSelected(): boolean {
    const currentData = this.getCurrentPageData();
    return currentData.length > 0 && currentData.every((row, index) =>
      this.selectedRows.has(this.getRowKey(row, index))
    );
  }

  /**
   * 是否半选
   */
  private isIndeterminate(): boolean {
    const currentData = this.getCurrentPageData();
    const selectedCount = currentData.filter((row, index) =>
      this.selectedRows.has(this.getRowKey(row, index))
    ).length;

    return selectedCount > 0 && selectedCount < currentData.length;
  }

  render() {
    const tableClass = {
      'ld-table': true,
      'ld-table--bordered': this.bordered,
      'ld-table--striped': this.striped,
      'ld-table--fixed-header': this.fixedHeader,
      [`ld-table--${this.size}`]: true,
      [this.customClass]: !!this.customClass,
    };

    return (
      <Host>
        <div class="ld-table-wrapper">
          {this.loading && (
            <div class="ld-table__loading">
              <ld-spin />
            </div>
          )}
          <div class="ld-table-container" style={this.getTableStyle()}>
            <table class={tableClass} id={this.tableId}>
              {this.renderHeader()}
              {this.renderBody()}
            </table>
          </div>
          {this.pagination && (
            <div class="ld-table__pagination">
              <ld-pagination
                current={this.currentPage}
                pageSize={this.pageSize}
                total={this.data.length}
                {...this.paginationConfig}
                onChange={(e: CustomEvent) => this.handlePageChange(e.detail.current, e.detail.pageSize)}
              />
            </div>
          )}
        </div>
      </Host>
    );
  }
}

// 类型定义
export interface TableColumn {
  key: string;
  title: string;
  width?: string | number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: TableRow, index: number) => any;
}

export interface TableRow {
  [key: string]: any;
  id?: string | number;
  key?: string | number;
}

export interface SortConfig {
  column?: string;
  direction?: 'asc' | 'desc' | null;
}

export interface FilterConfig {
  [key: string]: any;
}

export interface PaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
}

export interface TableRowSelectEvent {
  row: TableRow;
  index: number;
  selected: boolean;
  selectedRows: (string | number)[];
}

export interface TableRowClickEvent {
  row: TableRow;
  index: number;
  event: MouseEvent;
}

export interface TableSortEvent {
  column: TableColumn;
  direction: 'asc' | 'desc' | null;
  sortConfig: SortConfig;
}

export interface TableFilterEvent {
  column: TableColumn;
  value: any;
  filterConfig: FilterConfig;
}

export interface TablePageChangeEvent {
  current: number;
  pageSize: number;
  total: number;
}
