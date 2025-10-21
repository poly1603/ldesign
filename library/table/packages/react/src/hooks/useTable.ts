/**
 * useTable Hook
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  TableCore,
  type TableOptions,
  type TableState,
  type RowData,
} from '@ldesign/table-core';

export interface UseTableOptions<TData extends RowData>
  extends TableOptions<TData> {}

export function useTable<TData extends RowData = RowData>(
  options: UseTableOptions<TData>
) {
  const [state, setState] = useState<TableState<TData> | null>(null);
  const tableCoreRef = useRef<TableCore<TData> | null>(null);

  // 初始化表格核心
  useEffect(() => {
    const tableCore = new TableCore<TData>(options);
    tableCoreRef.current = tableCore;

    // 订阅状态变化
    const unsubscribe = tableCore.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
      tableCore.destroy();
      tableCoreRef.current = null;
    };
  }, []); // 只在挂载时初始化

  // 监听数据变化
  useEffect(() => {
    if (tableCoreRef.current && options.data) {
      tableCoreRef.current.setData(options.data);
    }
  }, [options.data]);

  // 导出方法
  const methods = useMemo(
    () => ({
      setData: (data: TData[]) => tableCoreRef.current?.setData(data),
      setSorting: (sorting: any) => tableCoreRef.current?.setSorting(sorting),
      setFilters: (filters: any) => tableCoreRef.current?.setFilters(filters),
      setPagination: (pagination: any) =>
        tableCoreRef.current?.setPagination(pagination),
      toggleRowSelection: (rowKey: any) =>
        tableCoreRef.current?.toggleRowSelection(rowKey),
      toggleSelectAll: () => tableCoreRef.current?.toggleSelectAll(),
      getSelectedRows: () => tableCoreRef.current?.getSelectedRows() ?? [],
      toggleRowExpand: (rowKey: any) =>
        tableCoreRef.current?.toggleRowExpand(rowKey),
      resizeColumn: (columnId: string, width: number) =>
        tableCoreRef.current?.resizeColumn(columnId, width),
      setScrollTop: (scrollTop: number) =>
        tableCoreRef.current?.setScrollTop(scrollTop),
      setScrollLeft: (scrollLeft: number) =>
        tableCoreRef.current?.setScrollLeft(scrollLeft),
      setContainerSize: (width: number, height: number) =>
        tableCoreRef.current?.setContainerSize(width, height),
      exportData: (options: any) => tableCoreRef.current?.exportData(options),
    }),
    []
  );

  return {
    state,
    tableCore: tableCoreRef.current,
    ...methods,
  };
}



