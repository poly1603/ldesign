/**
 * Excel Viewer React 组件
 */

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { ExcelViewer as CoreViewer } from '@ldesign/excel-viewer-core';
import type {
  ExcelViewerOptions,
  SheetData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';

export interface ExcelViewerProps {
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
  /** 类名 */
  className?: string;
  /** 样式 */
  style?: React.CSSProperties;
  
  // 事件回调
  onLoad?: (data: { status: string; sheets?: SheetData[] }) => void;
  onLoadError?: (error: any) => void;
  onCellChange?: (data: { row: number; col: number; oldValue: any; newValue: any }) => void;
  onCellClick?: (data: { sheetIndex: number; row: number; col: number; value: any }) => void;
  onCellDoubleClick?: (data: { sheetIndex: number; row: number; col: number; value: any }) => void;
  onSelectionChange?: (range: SelectionRange) => void;
  onSheetChange?: (data: { index: number }) => void;
  onError?: (error: any) => void;
}

export interface ExcelViewerRef {
  loadFile: (file: File | ArrayBuffer | string) => Promise<void>;
  getData: () => SheetData[];
  exportFile: (options: ExportOptions) => Blob | null;
  downloadFile: (options: ExportOptions) => void;
  search: (options: SearchOptions) => SearchResult[];
  getSelection: () => SelectionRange | null;
  setCellValue: (row: number, col: number, value: any) => void;
  getCellValue: (row: number, col: number) => any;
  setActiveSheet: (index: number) => void;
  undo: () => void;
  redo: () => void;
  refresh: () => void;
}

export const ExcelViewer = forwardRef<ExcelViewerRef, ExcelViewerProps>((props, ref) => {
  const {
    file,
    showToolbar = true,
    showFormulaBar = true,
    showSheetTabs = true,
    allowEdit = true,
    allowCopy = true,
    allowPaste = true,
    lang = 'zh',
    theme = 'light',
    customStyle,
    height = '600px',
    width = '100%',
    className,
    style,
    onLoad,
    onLoadError,
    onCellChange,
    onCellClick,
    onCellDoubleClick,
    onSelectionChange,
    onSheetChange,
    onError,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<CoreViewer | null>(null);

  // 初始化查看器
  useEffect(() => {
    if (!containerRef.current) return;

    const options: ExcelViewerOptions = {
      container: containerRef.current,
      showToolbar,
      showFormulaBar,
      showSheetTabs,
      allowEdit,
      allowCopy,
      allowPaste,
      lang,
      theme,
      customStyle,
      hooks: {
        afterLoad: (data) => {
          onLoad?.({ status: 'success', sheets: data });
        },
        onCellClick: (sheetIndex, row, col, value) => {
          onCellClick?.({ sheetIndex, row, col, value });
        },
        onCellDoubleClick: (sheetIndex, row, col, value) => {
          onCellDoubleClick?.({ sheetIndex, row, col, value });
        },
        onSelectionChange: (range) => {
          onSelectionChange?.(range);
        },
        onError: (error) => {
          onError?.(error);
        },
      },
    };

    const viewer = new CoreViewer(options);
    viewerRef.current = viewer;

    // 绑定事件
    viewer.on('load', (data) => onLoad?.(data));
    viewer.on('loadError', (data) => onLoadError?.(data.error));
    viewer.on('cellChange', (data) => onCellChange?.(data));
    viewer.on('sheetChange', (data) => onSheetChange?.(data));
    viewer.on('error', (data) => onError?.(data.error));

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []); // 只在挂载时初始化一次

  // 监听配置变化（不重新创建实例）
  useEffect(() => {
    // 这里可以添加动态配置更新逻辑
  }, [
    showToolbar,
    showFormulaBar,
    showSheetTabs,
    allowEdit,
    allowCopy,
    allowPaste,
    lang,
    theme,
    customStyle,
  ]);

  // 加载文件
  useEffect(() => {
    if (file && viewerRef.current) {
      viewerRef.current.loadFile(file);
    }
  }, [file]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    loadFile: async (file: File | ArrayBuffer | string) => {
      if (viewerRef.current) {
        await viewerRef.current.loadFile(file);
      }
    },
    getData: () => {
      return viewerRef.current?.getData() || [];
    },
    exportFile: (options: ExportOptions) => {
      return viewerRef.current?.exportFile(options) || null;
    },
    downloadFile: (options: ExportOptions) => {
      viewerRef.current?.downloadFile(options);
    },
    search: (options: SearchOptions) => {
      return viewerRef.current?.search(options) || [];
    },
    getSelection: () => {
      return viewerRef.current?.getSelection() || null;
    },
    setCellValue: (row: number, col: number, value: any) => {
      viewerRef.current?.setCellValue(row, col, value);
    },
    getCellValue: (row: number, col: number) => {
      return viewerRef.current?.getCellValue(row, col);
    },
    setActiveSheet: (index: number) => {
      viewerRef.current?.setActiveSheet(index);
    },
    undo: () => {
      viewerRef.current?.undo();
    },
    redo: () => {
      viewerRef.current?.redo();
    },
    refresh: () => {
      viewerRef.current?.refresh();
    },
  }));

  // 计算容器样式
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={`excel-viewer-react ${className || ''}`}
      style={containerStyle}
    />
  );
});

ExcelViewer.displayName = 'ExcelViewer';


