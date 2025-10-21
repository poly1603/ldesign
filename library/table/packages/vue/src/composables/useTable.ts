/**
 * useTable 组合式函数
 */

import { ref, onUnmounted, watch, type Ref } from 'vue';
import { TableCore, type TableOptions, type TableState, type RowData } from '@ldesign/table-core';

export interface UseTableOptions<TData extends RowData> extends TableOptions<TData> {
  // Vue特定选项
}

export function useTable<TData extends RowData = RowData>(
  options: UseTableOptions<TData>
) {
  const tableCore = new TableCore<TData>(options);
  const state = ref<TableState<TData>>(tableCore.getState()) as Ref<TableState<TData>>;

  // 订阅状态变化
  const unsubscribe = tableCore.subscribe((newState) => {
    state.value = newState;
  });

  // 清理
  onUnmounted(() => {
    unsubscribe();
    tableCore.destroy();
  });

  // 监听数据变化
  watch(
    () => options.data,
    (newData) => {
      if (newData) {
        tableCore.setData(newData);
      }
    },
    { deep: true }
  );

  return {
    state,
    tableCore,
    // 导出常用方法
    setData: tableCore.setData.bind(tableCore),
    setSorting: tableCore.setSorting.bind(tableCore),
    setFilters: tableCore.setFilters.bind(tableCore),
    setPagination: tableCore.setPagination.bind(tableCore),
    toggleRowSelection: tableCore.toggleRowSelection.bind(tableCore),
    toggleSelectAll: tableCore.toggleSelectAll.bind(tableCore),
    getSelectedRows: tableCore.getSelectedRows.bind(tableCore),
    toggleRowExpand: tableCore.toggleRowExpand.bind(tableCore),
    resizeColumn: tableCore.resizeColumn.bind(tableCore),
    setScrollTop: tableCore.setScrollTop.bind(tableCore),
    setScrollLeft: tableCore.setScrollLeft.bind(tableCore),
    setContainerSize: tableCore.setContainerSize.bind(tableCore),
    exportData: tableCore.exportData.bind(tableCore),
  };
}


