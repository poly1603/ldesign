<template>
  <div ref="containerRef" class="excel-viewer-vue" :style="containerStyle"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { ExcelViewer } from '@ldesign/excel-viewer-core';
import type {
  ExcelViewerOptions,
  SheetData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';

interface Props {
  /** 文件源（File 对象、ArrayBuffer 或 URL） */
  file?: File | ArrayBuffer | string;
  /** 是否显示工具栏 */
  showToolbar?: boolean;
  /** 是否显示公式栏 */
  showFormulaBar?: boolean;
  /** 是否显示表格标签 */
  showSheetTabs?: boolean;
  /** 是否允许编辑 */
  allowEdit?: boolean;
  /** 是否允许复制 */
  allowCopy?: boolean;
  /** 是否允许粘贴 */
  allowPaste?: boolean;
  /** 语言 */
  lang?: 'zh' | 'en';
  /** 主题 */
  theme?: 'light' | 'dark';
  /** 自定义样式 */
  customStyle?: string;
  /** 容器高度 */
  height?: string | number;
  /** 容器宽度 */
  width?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  showToolbar: true,
  showFormulaBar: true,
  showSheetTabs: true,
  allowEdit: true,
  allowCopy: true,
  allowPaste: true,
  lang: 'zh',
  theme: 'light',
  height: '600px',
  width: '100%',
});

interface Emits {
  (e: 'load', data: { status: string; sheets?: SheetData[] }): void;
  (e: 'loadError', error: any): void;
  (e: 'cellChange', data: { row: number; col: number; oldValue: any; newValue: any }): void;
  (e: 'cellClick', data: { sheetIndex: number; row: number; col: number; value: any }): void;
  (e: 'cellDoubleClick', data: { sheetIndex: number; row: number; col: number; value: any }): void;
  (e: 'selectionChange', range: SelectionRange): void;
  (e: 'sheetChange', data: { index: number }): void;
  (e: 'error', error: any): void;
}

const emit = defineEmits<Emits>();

const containerRef = ref<HTMLElement>();
let viewer: ExcelViewer | null = null;

const containerStyle = computed(() => {
  const style: Record<string, string> = {};
  
  if (typeof props.height === 'number') {
    style.height = `${props.height}px`;
  } else {
    style.height = props.height;
  }
  
  if (typeof props.width === 'number') {
    style.width = `${props.width}px`;
  } else {
    style.width = props.width;
  }
  
  return style;
});

/**
 * 初始化查看器
 */
const initViewer = () => {
  if (!containerRef.value) return;

  const options: ExcelViewerOptions = {
    container: containerRef.value,
    showToolbar: props.showToolbar,
    showFormulaBar: props.showFormulaBar,
    showSheetTabs: props.showSheetTabs,
    allowEdit: props.allowEdit,
    allowCopy: props.allowCopy,
    allowPaste: props.allowPaste,
    lang: props.lang,
    theme: props.theme,
    customStyle: props.customStyle,
    hooks: {
      afterLoad: (data) => {
        emit('load', { status: 'success', sheets: data });
      },
      onCellClick: (sheetIndex, row, col, value) => {
        emit('cellClick', { sheetIndex, row, col, value });
      },
      onCellDoubleClick: (sheetIndex, row, col, value) => {
        emit('cellDoubleClick', { sheetIndex, row, col, value });
      },
      onSelectionChange: (range) => {
        emit('selectionChange', range);
      },
      onError: (error) => {
        emit('error', error);
      },
    },
  };

  viewer = new ExcelViewer(options);

  // 绑定事件
  viewer.on('load', (data) => emit('load', data));
  viewer.on('loadError', (data) => emit('loadError', data.error));
  viewer.on('cellChange', (data) => emit('cellChange', data));
  viewer.on('sheetChange', (data) => emit('sheetChange', data));
  viewer.on('error', (data) => emit('error', data.error));
};

/**
 * 加载文件
 */
const loadFile = async (file: File | ArrayBuffer | string) => {
  if (!viewer) return;
  await viewer.loadFile(file);
};

/**
 * 获取数据
 */
const getData = (): SheetData[] => {
  return viewer?.getData() || [];
};

/**
 * 导出文件
 */
const exportFile = (options: ExportOptions): Blob | null => {
  return viewer?.exportFile(options) || null;
};

/**
 * 下载文件
 */
const downloadFile = (options: ExportOptions): void => {
  viewer?.downloadFile(options);
};

/**
 * 搜索
 */
const search = (options: SearchOptions): SearchResult[] => {
  return viewer?.search(options) || [];
};

/**
 * 获取选中区域
 */
const getSelection = (): SelectionRange | null => {
  return viewer?.getSelection() || null;
};

/**
 * 设置单元格值
 */
const setCellValue = (row: number, col: number, value: any): void => {
  viewer?.setCellValue(row, col, value);
};

/**
 * 获取单元格值
 */
const getCellValue = (row: number, col: number): any => {
  return viewer?.getCellValue(row, col);
};

/**
 * 切换工作表
 */
const setActiveSheet = (index: number): void => {
  viewer?.setActiveSheet(index);
};

/**
 * 撤销
 */
const undo = (): void => {
  viewer?.undo();
};

/**
 * 重做
 */
const redo = (): void => {
  viewer?.redo();
};

/**
 * 刷新
 */
const refresh = (): void => {
  viewer?.refresh();
};

// 监听文件变化
watch(() => props.file, async (newFile) => {
  if (newFile && viewer) {
    await loadFile(newFile);
  }
});

onMounted(() => {
  initViewer();
  
  // 如果有初始文件，加载它
  if (props.file && viewer) {
    loadFile(props.file);
  }
});

onBeforeUnmount(() => {
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
});

// 暴露方法给父组件
defineExpose({
  loadFile,
  getData,
  exportFile,
  downloadFile,
  search,
  getSelection,
  setCellValue,
  getCellValue,
  setActiveSheet,
  undo,
  redo,
  refresh,
});
</script>

<style scoped>
.excel-viewer-vue {
  position: relative;
  overflow: hidden;
}
</style>


