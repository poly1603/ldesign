/**
 * Excel 导出器
 * 支持导出为 Excel、CSV、JSON 等格式
 */

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import type { SheetData, ExportOptions, CellData } from './types';

/**
 * Excel 导出器类
 */
export class ExcelExporter {
  /**
   * 导出为 Excel 文件
   */
  exportToExcel(sheets: SheetData[], options: ExportOptions = { format: 'xlsx' }): Blob {
    const workbook = XLSX.utils.book_new();

    // 确定要导出的工作表
    const sheetsToExport = this.getSheetsToExport(sheets, options.sheets);

    sheetsToExport.forEach((sheet) => {
      const worksheet = this.createWorksheet(sheet, options);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    // 生成文件
    const wbout = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: options.includeStyles !== false,
    });

    return new Blob([wbout], { type: 'application/octet-stream' });
  }

  /**
   * 导出为 CSV 文件
   */
  exportToCSV(sheets: SheetData[], options: ExportOptions = { format: 'csv' }): Blob {
    const sheetsToExport = this.getSheetsToExport(sheets, options.sheets);
    let csvContent = '';

    sheetsToExport.forEach((sheet, index) => {
      if (index > 0) {
        csvContent += '\n\n'; // 多个工作表之间添加空行
      }

      // 添加工作表名称
      if (sheetsToExport.length > 1) {
        csvContent += `Sheet: ${sheet.name}\n`;
      }

      // 转换为 CSV
      sheet.data.forEach((row) => {
        const rowData = row.map((cell) => this.cellToCSV(cell));
        csvContent += rowData.join(',') + '\n';
      });
    });

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * 导出为 HTML
   */
  exportToHTML(sheets: SheetData[], options: ExportOptions = { format: 'html' }): Blob {
    const sheetsToExport = this.getSheetsToExport(sheets, options.sheets);
    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${options.filename || 'Excel Export'}</title>
  <style>
    table { border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .sheet-title { font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; }
  </style>
</head>
<body>
`;

    sheetsToExport.forEach((sheet) => {
      html += `<div class="sheet-title">${sheet.name}</div>\n`;
      html += '<table>\n';

      sheet.data.forEach((row, rowIndex) => {
        html += '  <tr>\n';
        row.forEach((cell, colIndex) => {
          const tag = rowIndex === 0 ? 'th' : 'td';
          const style = this.getCellHTMLStyle(cell);
          const value = this.getCellDisplayValue(cell);
          html += `    <${tag}${style ? ` style="${style}"` : ''}>${value}</${tag}>\n`;
        });
        html += '  </tr>\n';
      });

      html += '</table>\n';
    });

    html += '</body>\n</html>';

    return new Blob([html], { type: 'text/html;charset=utf-8;' });
  }

  /**
   * 导出为 JSON
   */
  exportToJSON(sheets: SheetData[], options: ExportOptions = { format: 'json' }): Blob {
    const sheetsToExport = this.getSheetsToExport(sheets, options.sheets);
    const jsonData: any = {};

    sheetsToExport.forEach((sheet) => {
      const sheetData: any[] = [];

      // 使用第一行作为表头
      const headers = sheet.data[0]?.map((cell) => this.getCellDisplayValue(cell)) || [];

      // 转换数据行
      for (let i = 1; i < sheet.data.length; i++) {
        const row = sheet.data[i];
        const rowObj: any = {};

        row.forEach((cell, index) => {
          const header = headers[index] || `Column${index}`;
          rowObj[header] = this.getCellDisplayValue(cell);
        });

        sheetData.push(rowObj);
      }

      jsonData[sheet.name] = sheetData;
    });

    const jsonString = JSON.stringify(jsonData, null, 2);
    return new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  }

  /**
   * 截图导出
   */
  async exportToImage(container: HTMLElement, filename?: string): Promise<Blob> {
    try {
      const canvas = await html2canvas(container, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        logging: false,
      });

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png');
      });
    } catch (error) {
      throw new Error(`Failed to export image: ${(error as Error).message}`);
    }
  }

  /**
   * 创建工作表
   */
  private createWorksheet(sheet: SheetData, options: ExportOptions): XLSX.WorkSheet {
    const worksheet: XLSX.WorkSheet = {};
    const range = {
      s: { r: 0, c: 0 },
      e: { r: sheet.data.length - 1, c: (sheet.data[0]?.length || 0) - 1 },
    };

    // 填充单元格数据
    sheet.data.forEach((row, r) => {
      row.forEach((cell, c) => {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        worksheet[cellAddress] = this.convertCellToXLSX(cell, options);
      });
    });

    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // 添加合并单元格
    if (sheet.merges && sheet.merges.length > 0) {
      worksheet['!merges'] = sheet.merges.map((merge) => ({
        s: { r: merge.r, c: merge.c },
        e: { r: merge.r + merge.rs - 1, c: merge.c + merge.cs - 1 },
      }));
    }

    // 添加列宽
    if (sheet.columns && sheet.columns.length > 0) {
      worksheet['!cols'] = sheet.columns.map((col) => ({
        wch: col.width ? col.width / 8 : undefined,
        hidden: col.hidden,
      }));
    }

    // 添加行高
    if (sheet.rows && sheet.rows.length > 0) {
      worksheet['!rows'] = sheet.rows.map((row) => ({
        hpt: row.height,
        hidden: row.hidden,
      }));
    }

    return worksheet;
  }

  /**
   * 转换单元格为 XLSX 格式
   */
  private convertCellToXLSX(cell: CellData, options: ExportOptions): XLSX.CellObject {
    const xlsxCell: XLSX.CellObject = {
      v: cell.v,
      t: cell.t || 's',
    };

    // 保留公式
    if (cell.f && options.includeFormulas !== false) {
      xlsxCell.f = cell.f;
    }

    // 保留格式
    if (cell.z) {
      xlsxCell.z = cell.z;
    }

    // 保留显示值
    if (cell.w) {
      xlsxCell.w = cell.w;
    }

    // 保留样式（如果选项允许）
    if (cell.s && options.includeStyles !== false) {
      xlsxCell.s = cell.s as any;
    }

    return xlsxCell;
  }

  /**
   * 单元格转 CSV 格式
   */
  private cellToCSV(cell: CellData): string {
    const value = this.getCellDisplayValue(cell);
    // 如果值包含逗号、引号或换行符，需要用引号包裹并转义引号
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * 获取单元格显示值
   */
  private getCellDisplayValue(cell: CellData): string {
    if (!cell || cell.v === undefined) return '';

    // 优先使用格式化后的值
    if (cell.w) return cell.w;

    // 根据类型返回值
    if (cell.t === 'b') return cell.v ? 'TRUE' : 'FALSE';
    if (cell.t === 'd') return new Date(cell.v as any).toLocaleDateString();
    if (cell.t === 'e') return String(cell.v);

    return String(cell.v);
  }

  /**
   * 获取单元格 HTML 样式
   */
  private getCellHTMLStyle(cell: CellData): string {
    if (!cell.s) return '';

    const styles: string[] = [];

    // 字体样式
    if (cell.s.font) {
      if (cell.s.font.name) styles.push(`font-family: ${cell.s.font.name}`);
      if (cell.s.font.size) styles.push(`font-size: ${cell.s.font.size}pt`);
      if (cell.s.font.bold) styles.push('font-weight: bold');
      if (cell.s.font.italic) styles.push('font-style: italic');
      if (cell.s.font.underline) styles.push('text-decoration: underline');
      if (cell.s.font.color) styles.push(`color: ${cell.s.font.color}`);
    }

    // 填充颜色
    if (cell.s.fill?.fgColor) {
      styles.push(`background-color: ${cell.s.fill.fgColor}`);
    }

    // 对齐
    if (cell.s.alignment) {
      if (cell.s.alignment.horizontal) {
        styles.push(`text-align: ${cell.s.alignment.horizontal}`);
      }
      if (cell.s.alignment.vertical) {
        styles.push(`vertical-align: ${cell.s.alignment.vertical}`);
      }
    }

    return styles.join('; ');
  }

  /**
   * 获取要导出的工作表
   */
  private getSheetsToExport(sheets: SheetData[], sheetFilter?: number[] | string[]): SheetData[] {
    if (!sheetFilter || sheetFilter.length === 0) {
      return sheets;
    }

    return sheets.filter((sheet) => {
      if (typeof sheetFilter[0] === 'number') {
        return (sheetFilter as number[]).includes(sheet.index);
      } else {
        return (sheetFilter as string[]).includes(sheet.name);
      }
    });
  }

  /**
   * 下载文件
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}


