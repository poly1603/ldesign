<template>
  <!-- 此组件仅用于声明式定义列，不渲染内容 -->
</template>

<script setup lang="ts">
import type { ColumnDef, RowData } from '@ldesign/table-core';

// Props定义列配置
withDefaults(
  defineProps<ColumnDef<RowData>>(),
  {
    align: 'left',
    fixed: false,
    sortable: false,
    filterable: false,
    resizable: true,
  }
);
</script>



