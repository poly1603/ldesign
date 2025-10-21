/**
 * React表格组件
 */

import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  type RowData,
  type RowKey,
  type SortingState,
  type Column,
  getRowKey,
} from '@ldesign/table-core';
import { useTable } from '../hooks/useTable';
import '@ldesign/table-styles/src/index.css';

export interface LTableProps<TData extends RowData = RowData> {
  data: TData[];
  columns: any[];
  rowKey?: keyof TData | ((row: TData) => RowKey);
  rowHeight?: number;
  headerHeight?: number;
  virtual?: boolean;
  stripe?: boolean;
  border?: boolean;
  selectionMode?: 'single' | 'multiple' | false;
  expandable?: boolean;
  loading?: boolean;
  height?: number | string;
  
  // 插槽/渲染函数
  renderHeader?: (column: Column<TData>) => ReactNode;
  renderCell?: (
    row: TData,
    column: Column<TData>,
    rowIndex: number
  ) => ReactNode;
  renderExpand?: (row: TData, rowIndex: number) => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;

  // 事件回调
  onSelectionChange?: (selectedKeys: RowKey[], selectedRows: TData[]) => void;
  onSortChange?: (sorting: SortingState) => void;
  onRowClick?: (row: TData, rowIndex: number, event: React.MouseEvent) => void;
  onCellClick?: (
    row: TData,
    column: Column<TData>,
    rowIndex: number,
    event: React.MouseEvent
  ) => void;
}

export function LTable<TData extends RowData = RowData>(
  props: LTableProps<TData>
) {
  const {
    data,
    columns,
    rowKey = 'id' as keyof TData,
    rowHeight = 48,
    headerHeight = 48,
    virtual = false,
    stripe = false,
    border = false,
    selectionMode = false,
    expandable = false,
    loading = false,
    height,
    renderHeader,
    renderCell,
    renderExpand,
    renderEmpty,
    renderLoading,
    onSelectionChange,
    onSortChange,
    onRowClick,
    onCellClick,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // 使用表格核心
  const { state, tableCore } = useTable<TData>({
    data,
    columns,
    rowKey,
    rowHeight,
    headerHeight,
    virtual,
    selectionMode,
  });

  // 类名
  const tableClasses = useMemo(
    () => [
      'l-table',
      stripe && 'l-table--stripe',
      border && 'l-table--border',
      virtual && 'l-table--virtual',
    ]
      .filter(Boolean)
      .join(' '),
    [stripe, border, virtual]
  );

  // 获取扁平列
  const flatColumns = useMemo(
    () => state?.columns ?? [],
    [state?.columns]
  );

  // 列数
  const columnCount = useMemo(() => {
    let count = flatColumns.length;
    if (selectionMode) count++;
    if (expandable) count++;
    return count;
  }, [flatColumns, selectionMode, expandable]);

  // 显示的数据
  const displayData = useMemo(() => {
    if (!state) return [];
    if (virtual && state.virtualScroll) {
      const { start, end } = state.virtualScroll.visibleRowRange;
      return state.processedData.slice(start, end);
    }
    return state.processedData;
  }, [state, virtual]);

  // 起始索引
  const startIndex = useMemo(() => {
    if (virtual && state?.virtualScroll) {
      return state.virtualScroll.visibleRowRange.start;
    }
    return 0;
  }, [virtual, state]);

  // 总高度
  const totalHeight = useMemo(() => {
    if (virtual && state) {
      return state.processedData.length * rowHeight + headerHeight;
    }
    return 0;
  }, [virtual, state, rowHeight, headerHeight]);

  // Body样式
  const bodyStyle = useMemo<CSSProperties>(() => {
    if (virtual && state?.virtualScroll) {
      const offset = state.virtualScroll.visibleRowRange.start * rowHeight;
      return {
        transform: `translateY(${offset}px)`,
      };
    }
    return {};
  }, [virtual, state, rowHeight]);

  // Table样式
  const tableStyle = useMemo<CSSProperties>(() => {
    if (height) {
      return {
        height: typeof height === 'number' ? `${height}px` : height,
      };
    }
    return {};
  }, [height]);

  // 是否全选
  const isAllSelected = useMemo(() => {
    if (!state || state.processedData.length === 0) return false;
    return state.processedData.every((row, index) => {
      const key = getRowKeyValue(row, index);
      return state.selection.selectedRowKeys.has(key);
    });
  }, [state]);

  // 是否部分选中
  const isIndeterminate = useMemo(() => {
    if (!state || state.processedData.length === 0) return false;
    const selectedCount = state.processedData.filter((row, index) => {
      const key = getRowKeyValue(row, index);
      return state.selection.selectedRowKeys.has(key);
    }).length;
    return selectedCount > 0 && selectedCount < state.processedData.length;
  }, [state]);

  // 工具函数
  const getRowKeyValue = useCallback(
    (row: TData, index: number): RowKey => {
      return getRowKey(row, rowKey, index);
    },
    [rowKey]
  );

  const getColumnStyle = useCallback((column: Column<TData>): CSSProperties => {
    const style: CSSProperties = {
      width: `${column.computedWidth}px`,
    };

    if (column.fixed === 'left' || column.fixed === 'right') {
      style[column.fixed] = `${column.fixedOffset}px`;
    }

    return style;
  }, []);

  const getCellValue = useCallback((row: TData, column: Column<TData>) => {
    if (column.prop) {
      return row[column.prop];
    }
    return null;
  }, []);

  const formatCellValue = useCallback(
    (row: TData, column: Column<TData>, rowIndex: number) => {
      const value = getCellValue(row, column);
      if (column.formatter) {
        return column.formatter(value, row, rowIndex);
      }
      return value;
    },
    [getCellValue]
  );

  const isRowSelected = useCallback(
    (row: TData, index: number): boolean => {
      if (!state) return false;
      const key = getRowKeyValue(row, index);
      return state.selection.selectedRowKeys.has(key);
    },
    [state, getRowKeyValue]
  );

  const isRowExpanded = useCallback(
    (row: TData, index: number): boolean => {
      if (!state) return false;
      const key = getRowKeyValue(row, index);
      return state.expand.expandedRowKeys.has(key);
    },
    [state, getRowKeyValue]
  );

  const isSorting = useCallback(
    (columnId: string): boolean => {
      if (!state) return false;
      return state.sorting.some((s) => s.id === columnId);
    },
    [state]
  );

  const getSortOrder = useCallback(
    (columnId: string): 'asc' | 'desc' | null => {
      if (!state) return null;
      const sort = state.sorting.find((s) => s.id === columnId);
      return sort?.order ?? null;
    },
    [state]
  );

  // 事件处理
  const handleSelectAll = useCallback(() => {
    if (!tableCore) return;
    tableCore.toggleSelectAll();
    if (onSelectionChange && state) {
      onSelectionChange(
        Array.from(state.selection.selectedRowKeys),
        tableCore.getSelectedRows()
      );
    }
  }, [tableCore, state, onSelectionChange]);

  const handleRowSelect = useCallback(
    (row: TData, index: number) => {
      if (!tableCore) return;
      const key = getRowKeyValue(row, index);
      tableCore.toggleRowSelection(key);
      if (onSelectionChange && state) {
        onSelectionChange(
          Array.from(state.selection.selectedRowKeys),
          tableCore.getSelectedRows()
        );
      }
    },
    [tableCore, state, getRowKeyValue, onSelectionChange]
  );

  const handleRowExpand = useCallback(
    (row: TData, index: number) => {
      if (!tableCore) return;
      const key = getRowKeyValue(row, index);
      tableCore.toggleRowExpand(key);
    },
    [tableCore, getRowKeyValue]
  );

  const handleSort = useCallback(
    (columnId: string) => {
      if (!tableCore || !state) return;
      const currentSort = state.sorting.find((s) => s.id === columnId);
      let newSorting: SortingState = [];

      if (!currentSort) {
        newSorting = [{ id: columnId, order: 'asc' }];
      } else if (currentSort.order === 'asc') {
        newSorting = [{ id: columnId, order: 'desc' }];
      }

      tableCore.setSorting(newSorting);
      onSortChange?.(newSorting);
    },
    [tableCore, state, onSortChange]
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!tableCore || !virtual) return;
      const target = event.target as HTMLDivElement;
      tableCore.setScrollTop(target.scrollTop);
      tableCore.setScrollLeft(target.scrollLeft);
    },
    [tableCore, virtual]
  );

  const handleRowClick = useCallback(
    (row: TData, rowIndex: number, event: React.MouseEvent) => {
      onRowClick?.(row, rowIndex, event);
    },
    [onRowClick]
  );

  const handleCellClick = useCallback(
    (
      row: TData,
      column: Column<TData>,
      rowIndex: number,
      event: React.MouseEvent
    ) => {
      onCellClick?.(row, column, rowIndex, event);
    },
    [onCellClick]
  );

  // 列宽调整
  const resizingColumn = useRef<string | null>(null);
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  const handleResizeStart = useCallback(
    (event: React.MouseEvent, columnId: string) => {
      event.stopPropagation();
      const column = flatColumns.find((c) => c.id === columnId);
      if (!column) return;

      resizingColumn.current = columnId;
      resizeStartX.current = event.clientX;
      resizeStartWidth.current = column.computedWidth;

      const handleResizeMove = (e: MouseEvent) => {
        if (!resizingColumn.current || !tableCore) return;
        const diff = e.clientX - resizeStartX.current;
        const newWidth = resizeStartWidth.current + diff;
        tableCore.resizeColumn(resizingColumn.current, newWidth);
      };

      const handleResizeEnd = () => {
        resizingColumn.current = null;
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };

      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
    },
    [flatColumns, tableCore]
  );

  // 监听容器尺寸
  useEffect(() => {
    if (!virtual || !containerRef.current || !tableCore) return;

    const { clientWidth, clientHeight } = containerRef.current;
    tableCore.setContainerSize(clientWidth, clientHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        tableCore.setContainerSize(width, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [virtual, tableCore]);

  if (!state) return null;

  return (
    <div className={tableClasses}>
      <div className="l-table__wrapper">
        <div
          ref={containerRef}
          className="l-table__container"
          onScroll={handleScroll}
        >
          {/* 虚拟滚动占位 */}
          {virtual && (
            <div
              className="l-table__virtual-spacer"
              style={{ height: `${totalHeight}px` }}
            />
          )}

          <table className="l-table__table" style={tableStyle}>
            {/* 表头 */}
            <thead className="l-table__header">
              <tr className="l-table__header-row">
                {/* 选择列 */}
                {selectionMode && (
                  <th
                    className="l-table__header-cell l-table__header-cell--center"
                    style={{ width: '48px' }}
                  >
                    {selectionMode === 'multiple' && (
                      <div className="l-table__selection">
                        <label className="l-table__checkbox">
                          <input
                            type="checkbox"
                            className="l-table__checkbox-input"
                            checked={isAllSelected}
                            ref={(input) => {
                              if (input) {
                                input.indeterminate = isIndeterminate;
                              }
                            }}
                            onChange={handleSelectAll}
                          />
                          <span className="l-table__checkbox-inner"></span>
                        </label>
                      </div>
                    )}
                  </th>
                )}

                {/* 展开列 */}
                {expandable && (
                  <th
                    className="l-table__header-cell l-table__header-cell--center"
                    style={{ width: '48px' }}
                  />
                )}

                {/* 数据列 */}
                {flatColumns.map((column) => (
                  <th
                    key={column.id}
                    className={[
                      'l-table__header-cell',
                      `l-table__header-cell--${column.align}`,
                      column.sortable && 'l-table__header-cell--sortable',
                      isSorting(column.id) && 'l-table__header-cell--sorting',
                      column.fixed === 'left' && 'l-table__header-cell--fixed-left',
                      column.fixed === 'right' && 'l-table__header-cell--fixed-right',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    style={getColumnStyle(column)}
                    onClick={
                      column.sortable ? () => handleSort(column.id) : undefined
                    }
                  >
                    <div className="l-table__header-cell-content">
                      {renderHeader ? renderHeader(column) : column.label}

                      {/* 排序图标 */}
                      {column.sortable && (
                        <span className="l-table__sort">
                          <i
                            className={[
                              'l-table__sort-icon',
                              'l-table__sort-icon--asc',
                              getSortOrder(column.id) === 'asc' && 'is-active',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          />
                          <i
                            className={[
                              'l-table__sort-icon',
                              'l-table__sort-icon--desc',
                              getSortOrder(column.id) === 'desc' && 'is-active',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                          />
                        </span>
                      )}
                    </div>

                    {/* 列宽调整 */}
                    {column.resizable && (
                      <div
                        className="l-table__resize-handle"
                        onMouseDown={(e) => handleResizeStart(e, column.id)}
                      />
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            {/* 表体 */}
            <tbody className="l-table__body" style={bodyStyle}>
              {displayData.length > 0 ? (
                displayData.map((row, rowIndex) => {
                  const actualIndex = startIndex + rowIndex;
                  const rowKeyValue = getRowKeyValue(row, actualIndex);

                  return (
                    <React.Fragment key={rowKeyValue}>
                      {/* 主行 */}
                      <tr
                        className={[
                          'l-table__body-row',
                          isRowSelected(row, actualIndex) &&
                            'l-table__body-row--selected',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={(e) => handleRowClick(row, actualIndex, e)}
                      >
                        {/* 选择列 */}
                        {selectionMode && (
                          <td className="l-table__body-cell l-table__body-cell--center">
                            <div className="l-table__selection">
                              <label className="l-table__checkbox">
                                <input
                                  type="checkbox"
                                  className="l-table__checkbox-input"
                                  checked={isRowSelected(row, actualIndex)}
                                  onChange={() =>
                                    handleRowSelect(row, actualIndex)
                                  }
                                />
                                <span className="l-table__checkbox-inner"></span>
                              </label>
                            </div>
                          </td>
                        )}

                        {/* 展开列 */}
                        {expandable && (
                          <td className="l-table__body-cell l-table__body-cell--center">
                            <div
                              className={[
                                'l-table__expand',
                                isRowExpanded(row, actualIndex) &&
                                  'l-table__expand--expanded',
                              ]
                                .filter(Boolean)
                                .join(' ')}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowExpand(row, actualIndex);
                              }}
                            >
                              <i className="l-table__expand-icon"></i>
                            </div>
                          </td>
                        )}

                        {/* 数据列 */}
                        {flatColumns.map((column) => (
                          <td
                            key={column.id}
                            className={[
                              'l-table__body-cell',
                              `l-table__body-cell--${column.align}`,
                              column.fixed === 'left' &&
                                'l-table__body-cell--fixed-left',
                              column.fixed === 'right' &&
                                'l-table__body-cell--fixed-right',
                            ]
                              .filter(Boolean)
                              .join(' ')}
                            style={getColumnStyle(column)}
                            onClick={(e) =>
                              handleCellClick(row, column, actualIndex, e)
                            }
                          >
                            {renderCell
                              ? renderCell(row, column, actualIndex)
                              : formatCellValue(row, column, actualIndex)}
                          </td>
                        ))}
                      </tr>

                      {/* 展开行 */}
                      {expandable && isRowExpanded(row, actualIndex) && (
                        <tr className="l-table__expand-row">
                          <td
                            colSpan={columnCount}
                            className="l-table__expand-cell"
                          >
                            <div className="l-table__expand-content">
                              {renderExpand?.(row, actualIndex)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columnCount} className="l-table__empty">
                    {renderEmpty ? (
                      renderEmpty()
                    ) : (
                      <div className="l-table__empty-text">暂无数据</div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="l-table__loading">
          {renderLoading ? (
            renderLoading()
          ) : (
            <div className="l-table__loading-text">加载中...</div>
          )}
        </div>
      )}
    </div>
  );
}

// 默认导出
export default LTable;



