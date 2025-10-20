/**
 * useExcelViewer Hook
 * 提供更灵活的 Excel Viewer 使用方式
 */

import { useRef, useEffect, useCallback } from 'react';
import { ExcelViewer } from '@ldesign/excel-viewer-core';
import type {
  ExcelViewerOptions,
  SheetData,
  ExportOptions,
  SearchOptions,
  SearchResult,
  SelectionRange,
} from '@ldesign/excel-viewer-core';

export interface UseExcelViewerOptions extends Partial<ExcelViewerOptions> {
  onLoad?: (data: { status: string; sheets?: SheetData[] }) => void;
  onLoadError?: (error: any) => void;
  onCellChange?: (data: { row: number; col: number; oldValue: any; newValue: any }) => void;
  onCellClick?: (data: { sheetIndex: number; row: number; col: number; value: any }) => void;
  onCellDoubleClick?: (data: { sheetIndex: number; row: number; col: number; value: any }) => void;
  onSelectionChange?: (range: SelectionRange) => void;
  onSheetChange?: (data: { index: number }) => void;
  onError?: (error: any) => void;
}

export interface UseExcelViewerReturn {
  containerRef: React.RefObject<HTMLDivElement>;
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
  destroy: () => void;
}

export function useExcelViewer(options: UseExcelViewerOptions = {}): UseExcelViewerReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<ExcelViewer | null>(null);

  const {
    onLoad,
    onLoadError,
    onCellChange,
    onCellClick,
    onCellDoubleClick,
    onSelectionChange,
    onSheetChange,
    onError,
    ...viewerOptions
  } = options;

  // 初始化
  useEffect(() => {
    if (!containerRef.current) return;

    const viewerConfig: ExcelViewerOptions = {
      ...viewerOptions,
      container: containerRef.current,
      hooks: {
        ...viewerOptions.hooks,
        afterLoad: (data) => {
          onLoad?.({ status: 'success', sheets: data });
          viewerOptions.hooks?.afterLoad?.(data);
        },
        onCellClick: (sheetIndex, row, col, value) => {
          onCellClick?.({ sheetIndex, row, col, value });
          viewerOptions.hooks?.onCellClick?.(sheetIndex, row, col, value);
        },
        onCellDoubleClick: (sheetIndex, row, col, value) => {
          onCellDoubleClick?.({ sheetIndex, row, col, value });
          viewerOptions.hooks?.onCellDoubleClick?.(sheetIndex, row, col, value);
        },
        onSelectionChange: (range) => {
          onSelectionChange?.(range);
          viewerOptions.hooks?.onSelectionChange?.(range);
        },
        onError: (error) => {
          onError?.(error);
          viewerOptions.hooks?.onError?.(error);
        },
      },
    };

    const viewer = new ExcelViewer(viewerConfig);
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
  }, []);

  // 加载文件
  const loadFile = useCallback(async (file: File | ArrayBuffer | string) => {
    if (viewerRef.current) {
      await viewerRef.current.loadFile(file);
    }
  }, []);

  // 获取数据
  const getData = useCallback(() => {
    return viewerRef.current?.getData() || [];
  }, []);

  // 导出文件
  const exportFile = useCallback((options: ExportOptions) => {
    return viewerRef.current?.exportFile(options) || null;
  }, []);

  // 下载文件
  const downloadFile = useCallback((options: ExportOptions) => {
    viewerRef.current?.downloadFile(options);
  }, []);

  // 搜索
  const search = useCallback((options: SearchOptions) => {
    return viewerRef.current?.search(options) || [];
  }, []);

  // 获取选中区域
  const getSelection = useCallback(() => {
    return viewerRef.current?.getSelection() || null;
  }, []);

  // 设置单元格值
  const setCellValue = useCallback((row: number, col: number, value: any) => {
    viewerRef.current?.setCellValue(row, col, value);
  }, []);

  // 获取单元格值
  const getCellValue = useCallback((row: number, col: number) => {
    return viewerRef.current?.getCellValue(row, col);
  }, []);

  // 切换工作表
  const setActiveSheet = useCallback((index: number) => {
    viewerRef.current?.setActiveSheet(index);
  }, []);

  // 撤销
  const undo = useCallback(() => {
    viewerRef.current?.undo();
  }, []);

  // 重做
  const redo = useCallback(() => {
    viewerRef.current?.redo();
  }, []);

  // 刷新
  const refresh = useCallback(() => {
    viewerRef.current?.refresh();
  }, []);

  // 销毁
  const destroy = useCallback(() => {
    viewerRef.current?.destroy();
    viewerRef.current = null;
  }, []);

  return {
    containerRef,
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
    destroy,
  };
}


