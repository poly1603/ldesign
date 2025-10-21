<template>
  <div
    ref="tableRef"
    class="l-table"
    :class="tableClasses"
  >
    <div class="l-table__wrapper">
      <div
        ref="containerRef"
        class="l-table__container"
        @scroll="handleScroll"
      >
        <!-- 虚拟滚动占位 -->
        <div
          v-if="virtual"
          class="l-table__virtual-spacer"
          :style="{ height: `${totalHeight}px` }"
        />

        <table class="l-table__table" :style="tableStyle">
          <!-- 表头 -->
          <thead class="l-table__header">
            <tr class="l-table__header-row">
              <!-- 选择列 -->
              <th
                v-if="selectionMode"
                class="l-table__header-cell l-table__header-cell--center"
                :style="{ width: '48px' }"
              >
                <div class="l-table__selection" v-if="selectionMode === 'multiple'">
                  <label class="l-table__checkbox">
                    <input
                      type="checkbox"
                      class="l-table__checkbox-input"
                      :checked="isAllSelected"
                      :indeterminate="isIndeterminate"
                      @change="handleSelectAll"
                    />
                    <span class="l-table__checkbox-inner"></span>
                  </label>
                </div>
              </th>

              <!-- 展开列 -->
              <th
                v-if="expandable"
                class="l-table__header-cell l-table__header-cell--center"
                :style="{ width: '48px' }"
              >
              </th>

              <!-- 数据列 -->
              <th
                v-for="column in flatColumns"
                :key="column.id"
                class="l-table__header-cell"
                :class="[
                  `l-table__header-cell--${column.align}`,
                  {
                    'l-table__header-cell--sortable': column.sortable,
                    'l-table__header-cell--sorting': isSorting(column.id),
                    'l-table__header-cell--fixed-left': column.fixed === 'left',
                    'l-table__header-cell--fixed-right': column.fixed === 'right',
                  }
                ]"
                :style="getColumnStyle(column)"
                @click="column.sortable && handleSort(column.id)"
              >
                <div class="l-table__header-cell-content">
                  <slot :name="`header-${column.id}`" :column="column">
                    {{ column.label }}
                  </slot>
                  
                  <!-- 排序图标 -->
                  <span v-if="column.sortable" class="l-table__sort">
                    <i
                      class="l-table__sort-icon l-table__sort-icon--asc"
                      :class="{ 'is-active': getSortOrder(column.id) === 'asc' }"
                    ></i>
                    <i
                      class="l-table__sort-icon l-table__sort-icon--desc"
                      :class="{ 'is-active': getSortOrder(column.id) === 'desc' }"
                    ></i>
                  </span>
                </div>

                <!-- 列宽调整 -->
                <div
                  v-if="column.resizable"
                  class="l-table__resize-handle"
                  @mousedown="handleResizeStart($event, column.id)"
                ></div>
              </th>
            </tr>
          </thead>

          <!-- 表体 -->
          <tbody class="l-table__body" :style="bodyStyle">
            <template v-if="displayData.length > 0">
              <template
                v-for="(row, rowIndex) in displayData"
                :key="getRowKeyValue(row, startIndex + rowIndex)"
              >
                <!-- 主行 -->
                <tr
                  class="l-table__body-row"
                  :class="{
                    'l-table__body-row--selected': isRowSelected(row, startIndex + rowIndex)
                  }"
                  @click="handleRowClick(row, startIndex + rowIndex, $event)"
                >
                  <!-- 选择列 -->
                  <td
                    v-if="selectionMode"
                    class="l-table__body-cell l-table__body-cell--center"
                  >
                    <div class="l-table__selection">
                      <label class="l-table__checkbox">
                        <input
                          type="checkbox"
                          class="l-table__checkbox-input"
                          :checked="isRowSelected(row, startIndex + rowIndex)"
                          @change="handleRowSelect(row, startIndex + rowIndex)"
                        />
                        <span class="l-table__checkbox-inner"></span>
                      </label>
                    </div>
                  </td>

                  <!-- 展开列 -->
                  <td
                    v-if="expandable"
                    class="l-table__body-cell l-table__body-cell--center"
                  >
                    <div
                      class="l-table__expand"
                      :class="{ 'l-table__expand--expanded': isRowExpanded(row, startIndex + rowIndex) }"
                      @click.stop="handleRowExpand(row, startIndex + rowIndex)"
                    >
                      <i class="l-table__expand-icon"></i>
                    </div>
                  </td>

                  <!-- 数据列 -->
                  <td
                    v-for="column in flatColumns"
                    :key="column.id"
                    class="l-table__body-cell"
                    :class="[
                      `l-table__body-cell--${column.align}`,
                      {
                        'l-table__body-cell--fixed-left': column.fixed === 'left',
                        'l-table__body-cell--fixed-right': column.fixed === 'right',
                      }
                    ]"
                    :style="getColumnStyle(column)"
                    @click="handleCellClick(row, column, startIndex + rowIndex, $event)"
                  >
                    <slot
                      :name="`cell-${column.id}`"
                      :row="row"
                      :column="column"
                      :rowIndex="startIndex + rowIndex"
                      :value="getCellValue(row, column)"
                    >
                      {{ formatCellValue(row, column, startIndex + rowIndex) }}
                    </slot>
                  </td>
                </tr>

                <!-- 展开行 -->
                <tr
                  v-if="expandable && isRowExpanded(row, startIndex + rowIndex)"
                  class="l-table__expand-row"
                >
                  <td
                    :colspan="columnCount"
                    class="l-table__expand-cell"
                  >
                    <div class="l-table__expand-content">
                      <slot
                        name="expand"
                        :row="row"
                        :rowIndex="startIndex + rowIndex"
                      ></slot>
                    </div>
                  </td>
                </tr>
              </template>
            </template>

            <!-- 空状态 -->
            <tr v-else>
              <td :colspan="columnCount" class="l-table__empty">
                <slot name="empty">
                  <div class="l-table__empty-text">暂无数据</div>
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="l-table__loading">
      <slot name="loading">
        <div class="l-table__loading-text">加载中...</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts" generic="TData extends RowData">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import type { RowData, RowKey, SortingState, Column } from '@ldesign/table-core';
import { useTable } from '../composables/useTable';
import { getRowKey } from '@ldesign/table-core';

// Props
const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    rowKey: 'id' as any,
    rowHeight: 48,
    headerHeight: 48,
    virtual: false,
    stripe: false,
    border: false,
    selectionMode: false,
    expandable: false,
    loading: false,
  }
);

// Emits
const emit = defineEmits<{
  'selection-change': [selectedKeys: RowKey[], selectedRows: TData[]];
  'sort-change': [sorting: SortingState];
  'row-click': [row: TData, rowIndex: number, event: Event];
  'cell-click': [row: TData, column: Column<TData>, rowIndex: number, event: Event];
}>();

// Refs
const tableRef = ref<HTMLDivElement>();
const containerRef = ref<HTMLDivElement>();

// 使用表格核心
const { state, tableCore } = useTable<TData>({
  data: props.data,
  columns: props.columns,
  rowKey: props.rowKey,
  rowHeight: props.rowHeight,
  headerHeight: props.headerHeight,
  virtual: props.virtual,
  selectionMode: props.selectionMode,
});

// 计算属性
const tableClasses = computed(() => [
  {
    'l-table--stripe': props.stripe,
    'l-table--border': props.border,
    'l-table--virtual': props.virtual,
  },
]);

const flatColumns = computed(() => state.value.columns);

const columnCount = computed(() => {
  let count = flatColumns.value.length;
  if (props.selectionMode) count++;
  if (props.expandable) count++;
  return count;
});

const displayData = computed(() => {
  if (props.virtual && state.value.virtualScroll) {
    const { start, end } = state.value.virtualScroll.visibleRowRange;
    return state.value.processedData.slice(start, end);
  }
  return state.value.processedData;
});

const startIndex = computed(() => {
  if (props.virtual && state.value.virtualScroll) {
    return state.value.virtualScroll.visibleRowRange.start;
  }
  return 0;
});

const totalHeight = computed(() => {
  if (props.virtual && state.value.virtualScroll) {
    return state.value.processedData.length * props.rowHeight + props.headerHeight;
  }
  return 0;
});

const bodyStyle = computed(() => {
  if (props.virtual && state.value.virtualScroll) {
    const offset = state.value.virtualScroll.visibleRowRange.start * props.rowHeight;
    return {
      transform: `translateY(${offset}px)`,
    };
  }
  return {};
});

const tableStyle = computed(() => {
  if (props.height) {
    return {
      height: typeof props.height === 'number' ? `${props.height}px` : props.height,
    };
  }
  return {};
});

const isAllSelected = computed(() => {
  const data = state.value.processedData;
  if (data.length === 0) return false;
  return data.every((row, index) => {
    const key = getRowKeyValue(row, index);
    return state.value.selection.selectedRowKeys.has(key);
  });
});

const isIndeterminate = computed(() => {
  const data = state.value.processedData;
  const selectedCount = data.filter((row, index) => {
    const key = getRowKeyValue(row, index);
    return state.value.selection.selectedRowKeys.has(key);
  }).length;
  return selectedCount > 0 && selectedCount < data.length;
});

// 方法
function getRowKeyValue(row: TData, index: number): RowKey {
  return getRowKey(row, props.rowKey, index);
}

function getColumnStyle(column: Column<TData>) {
  const style: any = {
    width: `${column.computedWidth}px`,
  };

  if (column.fixed === 'left' || column.fixed === 'right') {
    style[column.fixed] = `${column.fixedOffset}px`;
  }

  return style;
}

function getCellValue(row: TData, column: Column<TData>) {
  if (column.prop) {
    return row[column.prop];
  }
  return null;
}

function formatCellValue(row: TData, column: Column<TData>, rowIndex: number) {
  const value = getCellValue(row, column);
  if (column.formatter) {
    return column.formatter(value, row, rowIndex);
  }
  return value;
}

function isRowSelected(row: TData, index: number): boolean {
  const key = getRowKeyValue(row, index);
  return state.value.selection.selectedRowKeys.has(key);
}

function isRowExpanded(row: TData, index: number): boolean {
  const key = getRowKeyValue(row, index);
  return state.value.expand.expandedRowKeys.has(key);
}

function isSorting(columnId: string): boolean {
  return state.value.sorting.some((s) => s.id === columnId);
}

function getSortOrder(columnId: string): 'asc' | 'desc' | null {
  const sort = state.value.sorting.find((s) => s.id === columnId);
  return sort?.order ?? null;
}

function handleSelectAll() {
  tableCore.toggleSelectAll();
  emit('selection-change', Array.from(state.value.selection.selectedRowKeys), tableCore.getSelectedRows());
}

function handleRowSelect(row: TData, index: number) {
  const key = getRowKeyValue(row, index);
  tableCore.toggleRowSelection(key);
  emit('selection-change', Array.from(state.value.selection.selectedRowKeys), tableCore.getSelectedRows());
}

function handleRowExpand(row: TData, index: number) {
  const key = getRowKeyValue(row, index);
  tableCore.toggleRowExpand(key);
}

function handleSort(columnId: string) {
  const currentSort = state.value.sorting.find((s) => s.id === columnId);
  let newSorting: SortingState = [];

  if (!currentSort) {
    newSorting = [{ id: columnId, order: 'asc' }];
  } else if (currentSort.order === 'asc') {
    newSorting = [{ id: columnId, order: 'desc' }];
  } else {
    // 清除排序
    newSorting = [];
  }

  tableCore.setSorting(newSorting);
  emit('sort-change', newSorting);
}

function handleScroll(event: Event) {
  const target = event.target as HTMLDivElement;
  if (props.virtual) {
    tableCore.setScrollTop(target.scrollTop);
    tableCore.setScrollLeft(target.scrollLeft);
  }
}

function handleRowClick(row: TData, rowIndex: number, event: Event) {
  emit('row-click', row, rowIndex, event);
}

function handleCellClick(row: TData, column: Column<TData>, rowIndex: number, event: Event) {
  emit('cell-click', row, column, rowIndex, event);
}

// 列宽调整
let resizingColumn: string | null = null;
let resizeStartX = 0;
let resizeStartWidth = 0;

function handleResizeStart(event: MouseEvent, columnId: string) {
  event.stopPropagation();
  const column = flatColumns.value.find((c) => c.id === columnId);
  if (!column) return;

  resizingColumn = columnId;
  resizeStartX = event.clientX;
  resizeStartWidth = column.computedWidth;

  document.addEventListener('mousemove', handleResizeMove);
  document.addEventListener('mouseup', handleResizeEnd);
}

function handleResizeMove(event: MouseEvent) {
  if (!resizingColumn) return;

  const diff = event.clientX - resizeStartX;
  const newWidth = resizeStartWidth + diff;

  tableCore.resizeColumn(resizingColumn, newWidth);
}

function handleResizeEnd() {
  resizingColumn = null;
  document.removeEventListener('mousemove', handleResizeMove);
  document.removeEventListener('mouseup', handleResizeEnd);
}

// 生命周期
onMounted(() => {
  if (props.virtual && containerRef.value) {
    const { clientWidth, clientHeight } = containerRef.value;
    tableCore.setContainerSize(clientWidth, clientHeight);

    // 监听容器尺寸变化
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        tableCore.setContainerSize(width, height);
      }
    });

    resizeObserver.observe(containerRef.value);

    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

// 监听数据变化
watch(
  () => props.data,
  (newData) => {
    tableCore.setData(newData);
  },
  { deep: true }
);

// 暴露方法给父组件
defineExpose({
  getSelectedRows: () => tableCore.getSelectedRows(),
  clearSelection: () => tableCore.toggleSelectAll(),
  exportData: tableCore.exportData.bind(tableCore),
});
</script>



