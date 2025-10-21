/**
 * 导出管理器
 */

import type { RowData, Column } from '../types';
import { getNestedValue } from '../utils';

export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  /** 文件名 */
  filename?: string;
  /** 导出格式 */
  format: ExportFormat;
  /** 是否包含表头 */
  includeHeader?: boolean;
  /** 要导出的列（不指定则导出所有） */
  columns?: string[];
  /** 自定义分隔符（CSV） */
  delimiter?: string;
}

export class ExportManager<TData extends RowData = RowData> {
  /**
   * 导出数据
   */
  export(
    data: TData[],
    columns: Column<TData>[],
    options: ExportOptions
  ): void {
    const {
      filename = 'export',
      format,
      includeHeader = true,
      columns: columnIds,
    } = options;

    // 过滤要导出的列
    const exportColumns = columnIds
      ? columns.filter((col) => columnIds.includes(col.id))
      : columns;

    switch (format) {
      case 'csv':
        this.exportCSV(data, exportColumns, filename, includeHeader, options.delimiter);
        break;
      case 'json':
        this.exportJSON(data, exportColumns, filename);
        break;
      case 'excel':
        this.exportExcel(data, exportColumns, filename);
        break;
    }
  }

  /**
   * 导出为CSV
   */
  private exportCSV(
    data: TData[],
    columns: Column<TData>[],
    filename: string,
    includeHeader: boolean,
    delimiter: string = ','
  ): void {
    const rows: string[] = [];

    // 添加表头
    if (includeHeader) {
      const headers = columns.map((col) => this.escapeCSV(col.label));
      rows.push(headers.join(delimiter));
    }

    // 添加数据行
    for (const row of data) {
      const values = columns.map((col) => {
        const value = col.formatter
          ? col.formatter(getNestedValue(row, col.prop as string), row, 0)
          : getNestedValue(row, col.prop as string);
        return this.escapeCSV(String(value ?? ''));
      });
      rows.push(values.join(delimiter));
    }

    const csv = rows.join('\n');
    this.download(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
  }

  /**
   * 导出为JSON
   */
  private exportJSON(
    data: TData[],
    columns: Column<TData>[],
    filename: string
  ): void {
    const exportData = data.map((row) => {
      const obj: any = {};
      for (const col of columns) {
        const value = col.formatter
          ? col.formatter(getNestedValue(row, col.prop as string), row, 0)
          : getNestedValue(row, col.prop as string);
        obj[col.id] = value;
      }
      return obj;
    });

    const json = JSON.stringify(exportData, null, 2);
    this.download(json, `${filename}.json`, 'application/json;charset=utf-8;');
  }

  /**
   * 导出为Excel（简化版，实际项目中建议使用exceljs）
   */
  private exportExcel(
    data: TData[],
    columns: Column<TData>[],
    filename: string
  ): void {
    // 这里使用HTML表格转Excel的简单方法
    // 实际项目中应该使用exceljs等专业库
    let html = '<html><head><meta charset="utf-8"></head><body><table>';

    // 表头
    html += '<thead><tr>';
    for (const col of columns) {
      html += `<th>${col.label}</th>`;
    }
    html += '</tr></thead>';

    // 数据
    html += '<tbody>';
    for (const row of data) {
      html += '<tr>';
      for (const col of columns) {
        const value = col.formatter
          ? col.formatter(getNestedValue(row, col.prop as string), row, 0)
          : getNestedValue(row, col.prop as string);
        html += `<td>${value ?? ''}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table></body></html>';

    this.download(
      html,
      `${filename}.xls`,
      'application/vnd.ms-excel;charset=utf-8;'
    );
  }

  /**
   * 转义CSV值
   */
  private escapeCSV(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * 下载文件
   */
  private download(content: string, filename: string, mimeType: string): void {
    const blob = new Blob(['\ufeff' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}



