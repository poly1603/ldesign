/**
 * Lit表格组件
 */

import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import {
  TableCore,
  type TableState,
  type RowData,
  type RowKey,
  type SortingState,
  type Column,
  getRowKey,
} from '@ldesign/table-core';
import '@ldesign/table-styles/src/index.css';

@customElement('l-table')
export class LTable<TData extends RowData = RowData> extends LitElement {
  // 样式
  static styles = css`
    :host {
      display: block;
      width: 100%;
    }
  `;

  // 属性
  @property({ type: Array }) data: TData[] = [];
  @property({ type: Array }) columns: any[] = [];
  @property({ type: String }) rowKey: keyof TData | string = 'id' as keyof TData;
  @property({ type: Number }) rowHeight = 48;
  @property({ type: Number }) headerHeight = 48;
  @property({ type: Boolean }) virtual = false;
  @property({ type: Boolean }) stripe = false;
  @property({ type: Boolean }) border = false;
  @property({ type: String }) selectionMode: 'single' | 'multiple' | 'false' = 'false';
  @property({ type: Boolean }) expandable = false;
  @property({ type: Boolean }) loading = false;

  // 内部状态
  @state() private tableState: TableState<TData> | null = null;

  // 引用
  @query('.l-table__container') private containerEl?: HTMLDivElement;

  private tableCore: TableCore<TData> | null = null;
  private resizeObserver: ResizeObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    this.initializeTable();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroyTable();
  }

  private initializeTable() {
    const selectionModeValue = this.selectionMode === 'false' ? false : this.selectionMode as 'single' | 'multiple';
    
    this.tableCore = new TableCore<TData>({
      data: this.data,
      columns: this.columns,
      rowKey: this.rowKey as any,
      rowHeight: this.rowHeight,
      headerHeight: this.headerHeight,
      virtual: this.virtual,
      selectionMode: selectionModeValue,
    });

    this.tableCore.subscribe((state) => {
      this.tableState = state;
    });
  }

  private destroyTable() {
    if (this.tableCore) {
      this.tableCore.destroy();
      this.tableCore = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('data') && this.tableCore) {
      this.tableCore.setData(this.data);
    }

    if (this.virtual && this.containerEl && !this.resizeObserver && this.tableCore) {
      const { clientWidth, clientHeight } = this.containerEl;
      this.tableCore.setContainerSize(clientWidth, clientHeight);

      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this.tableCore?.setContainerSize(width, height);
        }
      });

      this.resizeObserver.observe(this.containerEl);
    }
  }

  private getRowKeyValue(row: TData, index: number): RowKey {
    return getRowKey(row, this.rowKey as any, index);
  }

  private getColumnStyle(column: Column<TData>) {
    const style: any = {
      width: `${column.computedWidth}px`,
    };

    if (column.fixed === 'left' || column.fixed === 'right') {
      style[column.fixed] = `${column.fixedOffset}px`;
    }

    return style;
  }

  private getCellValue(row: TData, column: Column<TData>) {
    if (column.prop) {
      return row[column.prop];
    }
    return '';
  }

  private formatCellValue(row: TData, column: Column<TData>, rowIndex: number) {
    const value = this.getCellValue(row, column);
    if (column.formatter) {
      return column.formatter(value, row, rowIndex);
    }
    return value;
  }

  private isRowSelected(row: TData, index: number): boolean {
    if (!this.tableState) return false;
    const key = this.getRowKeyValue(row, index);
    return this.tableState.selection.selectedRowKeys.has(key);
  }

  private isRowExpanded(row: TData, index: number): boolean {
    if (!this.tableState) return false;
    const key = this.getRowKeyValue(row, index);
    return this.tableState.expand.expandedRowKeys.has(key);
  }

  private isSorting(columnId: string): boolean {
    if (!this.tableState) return false;
    return this.tableState.sorting.some((s) => s.id === columnId);
  }

  private getSortOrder(columnId: string): 'asc' | 'desc' | null {
    if (!this.tableState) return null;
    const sort = this.tableState.sorting.find((s) => s.id === columnId);
    return sort?.order ?? null;
  }

  private handleSelectAll() {
    this.tableCore?.toggleSelectAll();
    this.dispatchEvent(
      new CustomEvent('selection-change', {
        detail: {
          selectedKeys: Array.from(this.tableState?.selection.selectedRowKeys ?? []),
          selectedRows: this.tableCore?.getSelectedRows() ?? [],
        },
      })
    );
  }

  private handleRowSelect(row: TData, index: number) {
    const key = this.getRowKeyValue(row, index);
    this.tableCore?.toggleRowSelection(key);
    this.dispatchEvent(
      new CustomEvent('selection-change', {
        detail: {
          selectedKeys: Array.from(this.tableState?.selection.selectedRowKeys ?? []),
          selectedRows: this.tableCore?.getSelectedRows() ?? [],
        },
      })
    );
  }

  private handleRowExpand(row: TData, index: number) {
    const key = this.getRowKeyValue(row, index);
    this.tableCore?.toggleRowExpand(key);
  }

  private handleSort(columnId: string) {
    if (!this.tableCore || !this.tableState) return;
    const currentSort = this.tableState.sorting.find((s) => s.id === columnId);
    let newSorting: SortingState = [];

    if (!currentSort) {
      newSorting = [{ id: columnId, order: 'asc' }];
    } else if (currentSort.order === 'asc') {
      newSorting = [{ id: columnId, order: 'desc' }];
    }

    this.tableCore.setSorting(newSorting);
    this.dispatchEvent(
      new CustomEvent('sort-change', {
        detail: { sorting: newSorting },
      })
    );
  }

  private handleScroll(event: Event) {
    if (!this.virtual || !this.tableCore) return;
    const target = event.target as HTMLDivElement;
    this.tableCore.setScrollTop(target.scrollTop);
    this.tableCore.setScrollLeft(target.scrollLeft);
  }

  render() {
    if (!this.tableState) return html``;

    const flatColumns = this.tableState.columns;
    const displayData = this.virtual && this.tableState.virtualScroll
      ? this.tableState.processedData.slice(
          this.tableState.virtualScroll.visibleRowRange.start,
          this.tableState.virtualScroll.visibleRowRange.end
        )
      : this.tableState.processedData;

    const startIndex = this.virtual && this.tableState.virtualScroll
      ? this.tableState.virtualScroll.visibleRowRange.start
      : 0;

    const totalHeight = this.virtual
      ? this.tableState.processedData.length * this.rowHeight + this.headerHeight
      : 0;

    const bodyStyle = this.virtual && this.tableState.virtualScroll
      ? { transform: `translateY(${this.tableState.virtualScroll.visibleRowRange.start * this.rowHeight}px)` }
      : {};

    const columnCount =
      flatColumns.length +
      (this.selectionMode !== 'false' ? 1 : 0) +
      (this.expandable ? 1 : 0);

    const isAllSelected = this.tableState.processedData.length > 0 &&
      this.tableState.processedData.every((row, index) => {
        const key = this.getRowKeyValue(row, index);
        return this.tableState!.selection.selectedRowKeys.has(key);
      });

    const isIndeterminate = (() => {
      const selectedCount = this.tableState.processedData.filter((row, index) => {
        const key = this.getRowKeyValue(row, index);
        return this.tableState!.selection.selectedRowKeys.has(key);
      }).length;
      return selectedCount > 0 && selectedCount < this.tableState.processedData.length;
    })();

    return html`
      <div
        class=${classMap({
          'l-table': true,
          'l-table--stripe': this.stripe,
          'l-table--border': this.border,
          'l-table--virtual': this.virtual,
        })}
      >
        <div class="l-table__wrapper">
          <div
            class="l-table__container"
            @scroll=${this.handleScroll}
          >
            ${this.virtual
              ? html`<div
                  class="l-table__virtual-spacer"
                  style=${styleMap({ height: `${totalHeight}px` })}
                ></div>`
              : ''}

            <table class="l-table__table">
              <!-- 表头 -->
              <thead class="l-table__header">
                <tr class="l-table__header-row">
                  ${this.selectionMode !== 'false'
                    ? html`<th
                        class="l-table__header-cell l-table__header-cell--center"
                        style="width: 48px"
                      >
                        ${this.selectionMode === 'multiple'
                          ? html`<div class="l-table__selection">
                              <label class="l-table__checkbox">
                                <input
                                  type="checkbox"
                                  class="l-table__checkbox-input"
                                  .checked=${isAllSelected}
                                  .indeterminate=${isIndeterminate}
                                  @change=${this.handleSelectAll}
                                />
                                <span class="l-table__checkbox-inner"></span>
                              </label>
                            </div>`
                          : ''}
                      </th>`
                    : ''}
                  
                  ${this.expandable
                    ? html`<th
                        class="l-table__header-cell l-table__header-cell--center"
                        style="width: 48px"
                      ></th>`
                    : ''}

                  ${flatColumns.map(
                    (column) => html`
                      <th
                        class=${classMap({
                          'l-table__header-cell': true,
                          [`l-table__header-cell--${column.align}`]: true,
                          'l-table__header-cell--sortable': column.sortable,
                          'l-table__header-cell--sorting': this.isSorting(column.id),
                          'l-table__header-cell--fixed-left': column.fixed === 'left',
                          'l-table__header-cell--fixed-right': column.fixed === 'right',
                        })}
                        style=${styleMap(this.getColumnStyle(column))}
                        @click=${column.sortable ? () => this.handleSort(column.id) : null}
                      >
                        <div class="l-table__header-cell-content">
                          ${column.label}
                          ${column.sortable
                            ? html`<span class="l-table__sort">
                                <i
                                  class=${classMap({
                                    'l-table__sort-icon': true,
                                    'l-table__sort-icon--asc': true,
                                    'is-active': this.getSortOrder(column.id) === 'asc',
                                  })}
                                ></i>
                                <i
                                  class=${classMap({
                                    'l-table__sort-icon': true,
                                    'l-table__sort-icon--desc': true,
                                    'is-active': this.getSortOrder(column.id) === 'desc',
                                  })}
                                ></i>
                              </span>`
                            : ''}
                        </div>
                      </th>
                    `
                  )}
                </tr>
              </thead>

              <!-- 表体 -->
              <tbody class="l-table__body" style=${styleMap(bodyStyle)}>
                ${displayData.length > 0
                  ? displayData.map((row, rowIndex) => {
                      const actualIndex = startIndex + rowIndex;

                      return html`
                        <tr
                          class=${classMap({
                            'l-table__body-row': true,
                            'l-table__body-row--selected': this.isRowSelected(row, actualIndex),
                          })}
                        >
                          ${this.selectionMode !== 'false'
                            ? html`<td class="l-table__body-cell l-table__body-cell--center">
                                <div class="l-table__selection">
                                  <label class="l-table__checkbox">
                                    <input
                                      type="checkbox"
                                      class="l-table__checkbox-input"
                                      .checked=${this.isRowSelected(row, actualIndex)}
                                      @change=${() => this.handleRowSelect(row, actualIndex)}
                                    />
                                    <span class="l-table__checkbox-inner"></span>
                                  </label>
                                </div>
                              </td>`
                            : ''}

                          ${this.expandable
                            ? html`<td class="l-table__body-cell l-table__body-cell--center">
                                <div
                                  class=${classMap({
                                    'l-table__expand': true,
                                    'l-table__expand--expanded': this.isRowExpanded(row, actualIndex),
                                  })}
                                  @click=${() => this.handleRowExpand(row, actualIndex)}
                                >
                                  <i class="l-table__expand-icon"></i>
                                </div>
                              </td>`
                            : ''}

                          ${flatColumns.map(
                            (column) => html`
                              <td
                                class=${classMap({
                                  'l-table__body-cell': true,
                                  [`l-table__body-cell--${column.align}`]: true,
                                  'l-table__body-cell--fixed-left': column.fixed === 'left',
                                  'l-table__body-cell--fixed-right': column.fixed === 'right',
                                })}
                                style=${styleMap(this.getColumnStyle(column))}
                              >
                                ${this.formatCellValue(row, column, actualIndex)}
                              </td>
                            `
                          )}
                        </tr>

                        ${this.expandable && this.isRowExpanded(row, actualIndex)
                          ? html`<tr class="l-table__expand-row">
                              <td colspan=${columnCount} class="l-table__expand-cell">
                                <div class="l-table__expand-content">
                                  <slot name="expand" .row=${row} .rowIndex=${actualIndex}></slot>
                                </div>
                              </td>
                            </tr>`
                          : ''}
                      `;
                    })
                  : html`<tr>
                      <td colspan=${columnCount} class="l-table__empty">
                        <slot name="empty">
                          <div class="l-table__empty-text">暂无数据</div>
                        </slot>
                      </td>
                    </tr>`}
              </tbody>
            </table>
          </div>
        </div>

        ${this.loading
          ? html`<div class="l-table__loading">
              <slot name="loading">
                <div class="l-table__loading-text">加载中...</div>
              </slot>
            </div>`
          : ''}
      </div>
    `;
  }

  // 公共方法
  public getSelectedRows(): TData[] {
    return this.tableCore?.getSelectedRows() ?? [];
  }

  public clearSelection(): void {
    this.tableCore?.toggleSelectAll();
  }

  public exportData(options: any): void {
    this.tableCore?.exportData(options);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'l-table': LTable;
  }
}


