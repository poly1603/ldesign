/**
 * 渲染引擎封装
 * 集成 Luckysheet 提供高性能渲染
 */

import type { SheetData, ExcelViewerOptions, LuckysheetConfig } from './types';

// 声明全局 luckysheet 对象
declare global {
  interface Window {
    luckysheet: any;
  }
}

/**
 * 渲染引擎类
 */
export class ExcelRenderer {
  private container: HTMLElement;
  private options: ExcelViewerOptions;
  private luckysheetInstance: any = null;
  private currentSheetIndex = 0;

  constructor(container: HTMLElement, options: ExcelViewerOptions) {
    this.container = container;
    this.options = options;
  }

  /**
   * 初始化渲染器
   */
  async init(data: any[]): Promise<void> {
    // 确保 Luckysheet 已加载
    if (typeof window.luckysheet === 'undefined') {
      throw new Error('Luckysheet is not loaded. Please include luckysheet library.');
    }

    // 创建容器
    this.setupContainer();

    // 配置 Luckysheet
    const config = this.createLuckysheetConfig(data);

    // 初始化 Luckysheet
    return new Promise((resolve, reject) => {
      try {
        window.luckysheet.create(config);
        this.luckysheetInstance = window.luckysheet;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 设置容器
   */
  private setupContainer(): void {
    // 清空容器
    this.container.innerHTML = '';

    // 设置容器样式
    this.container.style.position = 'relative';
    this.container.style.width = '100%';
    this.container.style.height = '100%';
    
    // 创建 Luckysheet 容器
    const luckysheetContainer = document.createElement('div');
    luckysheetContainer.id = `luckysheet-${Date.now()}`;
    luckysheetContainer.style.width = '100%';
    luckysheetContainer.style.height = '100%';
    this.container.appendChild(luckysheetContainer);
  }

  /**
   * 创建 Luckysheet 配置
   */
  private createLuckysheetConfig(data: any[]): LuckysheetConfig {
    const containerId = this.container.querySelector('[id^="luckysheet-"]')?.id || 'luckysheet';

    const config: LuckysheetConfig = {
      container: containerId,
      data,
      lang: this.options.lang || 'zh',
      allowCopy: this.options.allowCopy !== false,
      allowEdit: this.options.allowEdit !== false,
      showToolbar: this.options.showToolbar !== false,
      showFormulaBar: this.options.showFormulaBar !== false,
      showsheetbar: this.options.showSheetTabs !== false,
      showstatisticBar: true,
      sheetFormulaBar: this.options.showFormulaBar !== false,
      enableAddRow: this.options.allowEdit !== false,
      enableAddCol: this.options.allowEdit !== false,
      userMenuItem: this.createUserMenu(),
      devicePixelRatio: window.devicePixelRatio || 1,
      hook: this.createHooks(),
    };

    return config;
  }

  /**
   * 创建用户菜单
   */
  private createUserMenu(): any[] {
    const menu: any[] = [];

    if (this.options.allowEdit) {
      menu.push(
        {
          text: '插入行',
          name: 'insertRow',
        },
        {
          text: '插入列',
          name: 'insertColumn',
        },
        {
          text: '删除行',
          name: 'deleteRow',
        },
        {
          text: '删除列',
          name: 'deleteColumn',
        }
      );
    }

    return menu;
  }

  /**
   * 创建事件钩子
   */
  private createHooks(): any {
    const hooks: any = {};

    // 单元格更新后
    if (this.options.hooks?.afterCellChange) {
      hooks.cellUpdated = (r: number, c: number, oldValue: any, newValue: any, isRefresh: boolean) => {
        if (!isRefresh && this.options.hooks?.afterCellChange) {
          this.options.hooks.afterCellChange(this.currentSheetIndex, r, c, oldValue, newValue);
        }
      };
    }

    // 单元格点击
    if (this.options.hooks?.onCellClick) {
      hooks.cellClick = (cell: any, postion: any) => {
        if (this.options.hooks?.onCellClick && cell) {
          this.options.hooks.onCellClick(
            this.currentSheetIndex,
            postion.r,
            postion.c,
            cell.v
          );
        }
      };
    }

    // 单元格双击
    if (this.options.hooks?.onCellDoubleClick) {
      hooks.cellDoubleClick = (cell: any, postion: any) => {
        if (this.options.hooks?.onCellDoubleClick && cell) {
          this.options.hooks.onCellDoubleClick(
            this.currentSheetIndex,
            postion.r,
            postion.c,
            cell.v
          );
        }
      };
    }

    // 选区变化
    if (this.options.hooks?.onSelectionChange) {
      hooks.rangeSelect = (sheet: any, range: any) => {
        if (this.options.hooks?.onSelectionChange && range && range.length > 0) {
          const r = range[0];
          this.options.hooks.onSelectionChange({
            sheetIndex: this.currentSheetIndex,
            startRow: r.row[0],
            startCol: r.column[0],
            endRow: r.row[1],
            endCol: r.column[1],
          });
        }
      };
    }

    // 工作表切换
    hooks.sheetActivate = (index: number) => {
      this.currentSheetIndex = index;
    };

    return hooks;
  }

  /**
   * 获取当前数据
   */
  getData(): any[] {
    if (!this.luckysheetInstance) {
      return [];
    }

    try {
      return this.luckysheetInstance.getAllSheets();
    } catch (error) {
      console.error('Failed to get data:', error);
      return [];
    }
  }

  /**
   * 获取当前工作表数据
   */
  getCurrentSheetData(): any {
    if (!this.luckysheetInstance) {
      return null;
    }

    try {
      return this.luckysheetInstance.getSheetData();
    } catch (error) {
      console.error('Failed to get current sheet data:', error);
      return null;
    }
  }

  /**
   * 切换工作表
   */
  setActiveSheet(index: number): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      this.luckysheetInstance.setSheetActive(index);
      this.currentSheetIndex = index;
    } catch (error) {
      console.error('Failed to set active sheet:', error);
    }
  }

  /**
   * 获取当前工作表索引
   */
  getCurrentSheetIndex(): number {
    return this.currentSheetIndex;
  }

  /**
   * 刷新渲染
   */
  refresh(): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      this.luckysheetInstance.refresh();
    } catch (error) {
      console.error('Failed to refresh:', error);
    }
  }

  /**
   * 获取选中区域
   */
  getSelection(): any {
    if (!this.luckysheetInstance) {
      return null;
    }

    try {
      return this.luckysheetInstance.getRange();
    } catch (error) {
      console.error('Failed to get selection:', error);
      return null;
    }
  }

  /**
   * 设置单元格值
   */
  setCellValue(row: number, col: number, value: any): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      this.luckysheetInstance.setCellValue(row, col, value);
    } catch (error) {
      console.error('Failed to set cell value:', error);
    }
  }

  /**
   * 获取单元格值
   */
  getCellValue(row: number, col: number): any {
    if (!this.luckysheetInstance) {
      return null;
    }

    try {
      return this.luckysheetInstance.getCellValue(row, col);
    } catch (error) {
      console.error('Failed to get cell value:', error);
      return null;
    }
  }

  /**
   * 搜索
   */
  search(keyword: string, options?: any): any[] {
    if (!this.luckysheetInstance) {
      return [];
    }

    const results: any[] = [];
    const sheets = this.getData();

    sheets.forEach((sheet, sheetIndex) => {
      if (!sheet.data) return;

      sheet.data.forEach((row: any[], rowIndex: number) => {
        row.forEach((cell: any, colIndex: number) => {
          if (!cell) return;

          const value = String(cell.v || '');
          const searchValue = options?.caseSensitive ? keyword : keyword.toLowerCase();
          const cellValue = options?.caseSensitive ? value : value.toLowerCase();

          if (
            options?.matchWholeWord
              ? cellValue === searchValue
              : cellValue.includes(searchValue)
          ) {
            results.push({
              sheetIndex,
              sheetName: sheet.name,
              row: rowIndex,
              col: colIndex,
              value: cell.v,
              matchIndex: cellValue.indexOf(searchValue),
            });
          }
        });
      });
    });

    return results;
  }

  /**
   * 冻结行列
   */
  setFreeze(type: 'row' | 'column' | 'both', row?: number, column?: number): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      const config: any = { type };
      if (row !== undefined) config.range = { row_focus: row };
      if (column !== undefined) {
        config.range = { ...config.range, column_focus: column };
      }
      this.luckysheetInstance.setFreeze(config);
    } catch (error) {
      console.error('Failed to set freeze:', error);
    }
  }

  /**
   * 撤销
   */
  undo(): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      this.luckysheetInstance.undo();
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  }

  /**
   * 重做
   */
  redo(): void {
    if (!this.luckysheetInstance) {
      return;
    }

    try {
      this.luckysheetInstance.redo();
    } catch (error) {
      console.error('Failed to redo:', error);
    }
  }

  /**
   * 获取容器元素
   */
  getContainer(): HTMLElement {
    return this.container;
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.luckysheetInstance) {
      try {
        this.luckysheetInstance.destroy();
      } catch (error) {
        console.error('Failed to destroy luckysheet:', error);
      }
      this.luckysheetInstance = null;
    }

    // 清空容器
    this.container.innerHTML = '';
  }
}


