/**
 * Excel 文件解析器
 * 使用 SheetJS (xlsx) 解析 Excel 文件
 */

import * as XLSX from 'xlsx';
import type {
  SheetData,
  CellData,
  CellStyle,
  MergeCell,
  RowConfig,
  ColumnConfig,
} from './types';

/**
 * Excel 文件解析器类
 */
export class ExcelParser {
  private workbook: XLSX.WorkBook | null = null;

  /**
   * 从文件加载 Excel
   */
  async loadFromFile(file: File): Promise<SheetData[]> {
    const arrayBuffer = await file.arrayBuffer();
    return this.loadFromArrayBuffer(arrayBuffer);
  }

  /**
   * 从 ArrayBuffer 加载 Excel
   */
  loadFromArrayBuffer(arrayBuffer: ArrayBuffer): SheetData[] {
    this.workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      cellNF: true,
    });

    return this.parseWorkbook();
  }

  /**
   * 从 URL 加载 Excel
   */
  async loadFromUrl(url: string): Promise<SheetData[]> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from ${url}: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return this.loadFromArrayBuffer(arrayBuffer);
  }

  /**
   * 从 base64 字符串加载
   */
  loadFromBase64(base64: string): SheetData[] {
    this.workbook = XLSX.read(base64, {
      type: 'base64',
      cellStyles: true,
      cellFormula: true,
      cellDates: true,
      cellNF: true,
    });

    return this.parseWorkbook();
  }

  /**
   * 解析工作簿
   */
  private parseWorkbook(): SheetData[] {
    if (!this.workbook) {
      throw new Error('Workbook not loaded');
    }

    const sheets: SheetData[] = [];
    const sheetNames = this.workbook.SheetNames;

    sheetNames.forEach((name, index) => {
      const worksheet = this.workbook!.Sheets[name];
      const sheetData = this.parseWorksheet(worksheet, name, index);
      sheets.push(sheetData);
    });

    return sheets;
  }

  /**
   * 解析工作表
   */
  private parseWorksheet(
    worksheet: XLSX.WorkSheet,
    name: string,
    index: number
  ): SheetData {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const data: CellData[][] = [];
    const merges: MergeCell[] = [];
    const rows: RowConfig[] = [];
    const columns: ColumnConfig[] = [];

    // 解析单元格数据
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const row: CellData[] = [];
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = worksheet[cellAddress];
        row.push(this.parseCell(cell));
      }
      data.push(row);
    }

    // 解析合并单元格
    if (worksheet['!merges']) {
      worksheet['!merges'].forEach((merge) => {
        merges.push({
          r: merge.s.r,
          c: merge.s.c,
          rs: merge.e.r - merge.s.r + 1,
          cs: merge.e.c - merge.s.c + 1,
        });
      });
    }

    // 解析行高
    if (worksheet['!rows']) {
      worksheet['!rows'].forEach((row, index) => {
        if (row) {
          rows.push({
            index,
            height: row.hpx || row.hpt,
            hidden: row.hidden || false,
          });
        }
      });
    }

    // 解析列宽
    if (worksheet['!cols']) {
      worksheet['!cols'].forEach((col, index) => {
        if (col) {
          columns.push({
            index,
            width: col.wpx || col.wch,
            hidden: col.hidden || false,
          });
        }
      });
    }

    return {
      name,
      index,
      data,
      merges: merges.length > 0 ? merges : undefined,
      rows: rows.length > 0 ? rows : undefined,
      columns: columns.length > 0 ? columns : undefined,
    };
  }

  /**
   * 解析单元格
   */
  private parseCell(cell: XLSX.CellObject | undefined): CellData {
    if (!cell) {
      return {};
    }

    const cellData: CellData = {
      v: cell.v,
      t: cell.t as any,
      w: cell.w,
    };

    // 解析公式
    if (cell.f) {
      cellData.f = cell.f;
    }

    // 解析格式
    if (cell.z) {
      cellData.z = cell.z;
    }

    // 解析样式
    if (cell.s) {
      cellData.s = this.parseCellStyle(cell.s);
    }

    return cellData;
  }

  /**
   * 解析单元格样式
   */
  private parseCellStyle(style: any): CellStyle {
    const cellStyle: CellStyle = {};

    // 解析字体
    if (style.font) {
      cellStyle.font = {
        name: style.font.name,
        size: style.font.sz,
        bold: style.font.bold,
        italic: style.font.italic,
        underline: style.font.underline,
        strike: style.font.strike,
        color: style.font.color?.rgb || style.font.color?.theme,
      };
    }

    // 解析填充
    if (style.fill) {
      cellStyle.fill = {
        type: style.fill.patternType,
        fgColor: style.fill.fgColor?.rgb || style.fill.fgColor?.theme,
        bgColor: style.fill.bgColor?.rgb || style.fill.bgColor?.theme,
        pattern: style.fill.pattern,
      };
    }

    // 解析边框
    if (style.border) {
      cellStyle.border = {
        top: style.border.top
          ? { style: style.border.top.style, color: style.border.top.color?.rgb }
          : undefined,
        bottom: style.border.bottom
          ? { style: style.border.bottom.style, color: style.border.bottom.color?.rgb }
          : undefined,
        left: style.border.left
          ? { style: style.border.left.style, color: style.border.left.color?.rgb }
          : undefined,
        right: style.border.right
          ? { style: style.border.right.style, color: style.border.right.color?.rgb }
          : undefined,
      };
    }

    // 解析对齐
    if (style.alignment) {
      cellStyle.alignment = {
        horizontal: style.alignment.horizontal,
        vertical: style.alignment.vertical,
        wrapText: style.alignment.wrapText,
        textRotation: style.alignment.textRotation,
      };
    }

    // 解析数字格式
    if (style.numFmt) {
      cellStyle.numFmt = style.numFmt;
    }

    return cellStyle;
  }

  /**
   * 将数据转换为 Luckysheet 格式
   */
  convertToLuckysheetFormat(sheets: SheetData[]): any[] {
    return sheets.map((sheet) => {
      const luckysheet: any = {
        name: sheet.name,
        index: sheet.index,
        status: sheet.index === 0 ? 1 : 0,
        order: sheet.index,
        celldata: [],
        row: sheet.data.length,
        column: sheet.data[0]?.length || 0,
        config: {},
      };

      // 转换单元格数据
      sheet.data.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell && (cell.v !== undefined || cell.f)) {
            const luckyCell: any = {
              r,
              c,
              v: this.convertCellToLuckysheet(cell),
            };
            luckysheet.celldata.push(luckyCell);
          }
        });
      });

      // 转换合并单元格
      if (sheet.merges && sheet.merges.length > 0) {
        luckysheet.config.merge = {};
        sheet.merges.forEach((merge) => {
          const key = `${merge.r}_${merge.c}`;
          luckysheet.config.merge[key] = {
            r: merge.r,
            c: merge.c,
            rs: merge.rs,
            cs: merge.cs,
          };
        });
      }

      // 转换行配置
      if (sheet.rows && sheet.rows.length > 0) {
        luckysheet.config.rowlen = {};
        sheet.rows.forEach((row) => {
          if (row.height) {
            luckysheet.config.rowlen[row.index] = row.height;
          }
        });
      }

      // 转换列配置
      if (sheet.columns && sheet.columns.length > 0) {
        luckysheet.config.columnlen = {};
        sheet.columns.forEach((col) => {
          if (col.width) {
            luckysheet.config.columnlen[col.index] = col.width;
          }
        });
      }

      // 转换冻结配置
      if (sheet.frozen) {
        luckysheet.config.frozen = {
          type: sheet.frozen.type,
        };
        if (sheet.frozen.row !== undefined) {
          luckysheet.config.frozen.range = {
            row_focus: sheet.frozen.row,
          };
        }
        if (sheet.frozen.column !== undefined) {
          luckysheet.config.frozen.range = {
            ...luckysheet.config.frozen.range,
            column_focus: sheet.frozen.column,
          };
        }
      }

      return luckysheet;
    });
  }

  /**
   * 转换单元格为 Luckysheet 格式
   */
  private convertCellToLuckysheet(cell: CellData): any {
    const luckyCell: any = {
      v: cell.v,
      ct: { fa: cell.z || 'General', t: this.mapCellType(cell.t) },
    };

    // 转换公式
    if (cell.f) {
      luckyCell.f = `=${cell.f}`;
    }

    // 转换样式
    if (cell.s) {
      // 字体
      if (cell.s.font) {
        luckyCell.ff = cell.s.font.name || 'Arial';
        luckyCell.fs = cell.s.font.size || 11;
        if (cell.s.font.bold) luckyCell.bl = 1;
        if (cell.s.font.italic) luckyCell.it = 1;
        if (cell.s.font.underline) luckyCell.un = 1;
        if (cell.s.font.strike) luckyCell.st = 1;
        if (cell.s.font.color) luckyCell.fc = this.convertColor(cell.s.font.color);
      }

      // 填充
      if (cell.s.fill?.fgColor) {
        luckyCell.bg = this.convertColor(cell.s.fill.fgColor);
      }

      // 边框
      if (cell.s.border) {
        luckyCell.bd = {};
        if (cell.s.border.top) {
          luckyCell.bd.t = {
            style: this.convertBorderStyle(cell.s.border.top.style),
            color: this.convertColor(cell.s.border.top.color),
          };
        }
        if (cell.s.border.bottom) {
          luckyCell.bd.b = {
            style: this.convertBorderStyle(cell.s.border.bottom.style),
            color: this.convertColor(cell.s.border.bottom.color),
          };
        }
        if (cell.s.border.left) {
          luckyCell.bd.l = {
            style: this.convertBorderStyle(cell.s.border.left.style),
            color: this.convertColor(cell.s.border.left.color),
          };
        }
        if (cell.s.border.right) {
          luckyCell.bd.r = {
            style: this.convertBorderStyle(cell.s.border.right.style),
            color: this.convertColor(cell.s.border.right.color),
          };
        }
      }

      // 对齐
      if (cell.s.alignment) {
        luckyCell.ht = this.mapAlignment(cell.s.alignment.horizontal, 'h');
        luckyCell.vt = this.mapAlignment(cell.s.alignment.vertical, 'v');
        if (cell.s.alignment.wrapText) luckyCell.tb = '2';
        if (cell.s.alignment.textRotation) luckyCell.tr = cell.s.alignment.textRotation;
      }
    }

    return luckyCell;
  }

  /**
   * 映射单元格类型
   */
  private mapCellType(type?: string): string {
    const typeMap: { [key: string]: string } = {
      s: 's', // 字符串
      n: 'n', // 数字
      b: 'b', // 布尔
      d: 'd', // 日期
      e: 'e', // 错误
      z: 's', // 空
    };
    return typeMap[type || 's'] || 's';
  }

  /**
   * 转换颜色值
   */
  private convertColor(color?: string): string {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color;
    return `#${color}`;
  }

  /**
   * 转换边框样式
   */
  private convertBorderStyle(style?: string): number {
    const styleMap: { [key: string]: number } = {
      thin: 1,
      medium: 2,
      thick: 3,
      dotted: 4,
      dashed: 5,
      double: 6,
    };
    return styleMap[style || 'thin'] || 1;
  }

  /**
   * 映射对齐方式
   */
  private mapAlignment(align?: string, direction?: 'h' | 'v'): string {
    if (direction === 'h') {
      const alignMap: { [key: string]: string } = {
        left: '1',
        center: '0',
        right: '2',
        fill: '1',
        justify: '1',
      };
      return alignMap[align || 'left'] || '1';
    } else {
      const alignMap: { [key: string]: string } = {
        top: '1',
        middle: '0',
        bottom: '2',
      };
      return alignMap[align || 'middle'] || '0';
    }
  }

  /**
   * 获取工作簿
   */
  getWorkbook(): XLSX.WorkBook | null {
    return this.workbook;
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.workbook = null;
  }
}


