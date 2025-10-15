import * as XLSX from 'xlsx';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Enhanced Excel Document Renderer with better style support
 */
export class EnhancedExcelRenderer implements IDocumentRenderer {
  private container: HTMLElement | null = null;
  private workbook: XLSX.WorkBook | null = null;
  private currentSheet: number = 0;
  private sheetNames: string[] = [];
  private options: ViewerOptions | null = null;

  /**
   * Render Excel document with enhanced styling
   */
  async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
    this.container = container;
    this.options = options;

    try {
      // Clear container
      container.innerHTML = '';

      // Parse workbook with cellStyles option
      this.workbook = XLSX.read(data, { 
        type: 'array',
        cellStyles: true,  // Enable style parsing
        cellNF: true,      // Enable number format parsing
        cellDates: true,   // Enable date parsing
        sheetStubs: true   // Include empty cells
      });

      this.sheetNames = this.workbook.SheetNames;

      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'excel-viewer-wrapper';
      wrapper.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #f5f5f5;
      `;

      // Add custom styles for Excel rendering
      this.addExcelStyles();

      // Create toolbar with sheet tabs
      if (options.excel?.showSheetTabs !== false && this.sheetNames.length > 1) {
        const toolbar = this.createSheetTabs();
        wrapper.appendChild(toolbar);
      }

      // Create content area
      const contentArea = document.createElement('div');
      contentArea.className = 'excel-content-area';
      contentArea.style.cssText = `
        flex: 1;
        overflow: auto;
        padding: 20px;
        background: white;
      `;

      // Render current sheet with enhanced styling
      this.renderSheetEnhanced(contentArea);

      wrapper.appendChild(contentArea);
      container.appendChild(wrapper);

      // Call onLoad callback
      options.onLoad?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to render Excel document');
      options.onError?.(err);
      throw err;
    }
  }

  /**
   * Add custom CSS styles for Excel rendering
   */
  private addExcelStyles(): void {
    const styleId = 'excel-enhanced-styles';
    
    // Remove existing styles if any
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .excel-table {
        border-collapse: collapse;
        font-family: 'Calibri', 'Microsoft YaHei', 'Arial', sans-serif;
        font-size: 11px;
        background: white;
        table-layout: fixed;
        width: auto;
        margin: 0;
      }
      
      .excel-table th,
      .excel-table td {
        border: 1px solid #d0d7e5;
        padding: 2px 6px;
        text-align: left;
        white-space: nowrap;
        min-height: 20px;
        height: 20px;
        position: relative;
        vertical-align: middle;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
      }
      
      .excel-table th {
        background: #e7e6e6;
        font-weight: normal;
        text-align: center;
        border-color: #a0a0a0;
        font-size: 11px;
        color: #333;
      }
      
      .excel-table td {
        background: white;
        color: #000;
      }
      
      .excel-table td.number {
        text-align: right;
        padding-right: 8px;
      }
      
      .excel-table td.date {
        text-align: center;
      }
      
      .excel-table td.merged {
        text-align: center;
        vertical-align: middle;
        font-weight: normal;
        background: #f9f9f9;
        white-space: normal;
        word-wrap: break-word;
      }
      
      .excel-table tr:hover td {
        background: #e8f4ff;
      }
      
      .excel-table tr:hover td.merged {
        background: #e0e0e0;
      }
      
      .excel-header-row {
        background: #e7e6e6;
        position: sticky;
        top: 0;
        z-index: 10;
        box-shadow: 0 1px 0 0 #a0a0a0;
      }
      
      .excel-header-row th {
        padding: 4px 8px;
        font-weight: normal;
      }
      
      .excel-header-col {
        background: #e7e6e6;
        position: sticky;
        left: 0;
        z-index: 9;
        text-align: center;
        font-weight: normal;
        width: 50px;
        min-width: 50px;
        max-width: 50px;
        box-shadow: 1px 0 0 0 #a0a0a0;
      }
      
      .excel-header-corner {
        position: sticky;
        left: 0;
        top: 0;
        z-index: 11;
        background: #d4d0ce;
        border-right: 2px solid #a0a0a0;
        border-bottom: 2px solid #a0a0a0;
      }
      
      .sheet-tabs {
        display: flex;
        gap: 2px;
        padding: 10px;
        background: #f0f0f0;
        border-bottom: 2px solid #d0d0d0;
        overflow-x: auto;
      }
      
      .sheet-tab {
        padding: 8px 16px;
        background: white;
        border: 1px solid #d0d0d0;
        border-bottom: none;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        font-size: 13px;
      }
      
      .sheet-tab:hover {
        background: #f9f9f9;
      }
      
      .sheet-tab.active {
        background: #0078d4;
        color: white;
        font-weight: bold;
      }
      
      .cell-formula {
        background: #fffbf0;
        border-color: #ffa500;
      }
      
      .cell-error {
        background: #ffe0e0;
        color: red;
      }
      
      .cell-hyperlink {
        color: #0066cc;
        text-decoration: underline;
        cursor: pointer;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Render sheet with enhanced styling
   */
  private renderSheetEnhanced(container: HTMLElement): void {
    if (!this.workbook) return;

    const worksheet = this.workbook.Sheets[this.sheetNames[this.currentSheet]];
    if (!worksheet) return;

    // Get range
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Get merged cells
    const merges = worksheet['!merges'] || [];
    
    // Get column widths
    const cols = worksheet['!cols'] || [];
    
    // Get row heights
    const rows = worksheet['!rows'] || [];
    
    // Create wrapper for better scrolling
    const tableWrapper = document.createElement('div');
    tableWrapper.style.cssText = `
      width: 100%;
      height: 100%;
      overflow: auto;
      position: relative;
      background: white;
    `;
    
    // Create table
    const table = document.createElement('table');
    table.className = 'excel-table';
    table.style.cssText = 'border-collapse: collapse; table-layout: fixed; width: auto;';

    // Create header row (column labels) - only if not hidden by large merge
    const hasLargeTitleMerge = merges.some(merge => 
      merge.s.r === 0 && merge.s.c === 0 && 
      (merge.e.c >= range.e.c - 2 || merge.e.r >= 1)
    );
    
    if (!hasLargeTitleMerge) {
      const headerRow = document.createElement('tr');
      headerRow.className = 'excel-header-row';
      
      // Empty corner cell
      const cornerCell = document.createElement('th');
      cornerCell.className = 'excel-header-corner';
      cornerCell.textContent = '';
      cornerCell.style.cssText = 'width: 50px; min-width: 50px;';
      headerRow.appendChild(cornerCell);
      
      // Column headers (A, B, C, ...)
      for (let c = range.s.c; c <= range.e.c; c++) {
        const th = document.createElement('th');
        th.textContent = XLSX.utils.encode_col(c);
        const width = this.getColumnWidth(cols, c);
        th.style.width = width;
        th.style.minWidth = width;
        th.style.maxWidth = this.getColumnMaxWidth(cols, c);
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
      }
      table.appendChild(headerRow);
    }

    // Track merged cells
    const mergedCells = new Map<string, boolean>();
    const mergeMap = new Map<string, { rowspan: number; colspan: number; isStart: boolean }>();
    
    // Process merges
    merges.forEach(merge => {
      for (let r = merge.s.r; r <= merge.e.r; r++) {
        for (let c = merge.s.c; c <= merge.e.c; c++) {
          const addr = XLSX.utils.encode_cell({ r, c });
          if (r === merge.s.r && c === merge.s.c) {
            // This is the start cell of the merge
            mergeMap.set(addr, {
              rowspan: merge.e.r - merge.s.r + 1,
              colspan: merge.e.c - merge.s.c + 1,
              isStart: true
            });
            mergedCells.set(addr, true);
          } else {
            // This cell is covered by the merge
            mergedCells.set(addr, false);
          }
        }
      }
    });

    // Create data rows
    for (let r = range.s.r; r <= range.e.r; r++) {
      const row = document.createElement('tr');
      
      // Set row height if specified
      if (rows[r] && rows[r].hpt) {
        row.style.height = `${rows[r].hpt}pt`;
      } else if (rows[r] && rows[r].hpx) {
        row.style.height = `${rows[r].hpx}px`;
      }
      
      // Row header (row number) - only if not a large title
      if (!hasLargeTitleMerge) {
        const rowHeader = document.createElement('th');
        rowHeader.className = 'excel-header-col';
        rowHeader.textContent = String(r + 1);
        rowHeader.style.cssText = 'width: 50px; min-width: 50px; text-align: center;';
        row.appendChild(rowHeader);
      }

      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        
        // Check if this cell should be skipped (part of a merge but not the start)
        const mergedStatus = mergedCells.get(cellAddress);
        if (mergedStatus === false) {
          continue; // Skip cells that are covered by a merge
        }

        const cell = worksheet[cellAddress];
        const td = document.createElement('td');
        
        // Handle merged cells
        const mergeInfo = mergeMap.get(cellAddress);
        if (mergeInfo && mergeInfo.isStart) {
          td.rowSpan = mergeInfo.rowspan;
          td.colSpan = mergeInfo.colspan;
          td.className = 'merged';
          
          // Check if this is a large title merge (spans most columns and/or multiple rows)
          const isLargeTitle = (mergeInfo.colspan >= (range.e.c - range.s.c) * 0.7) || 
                               (r === 0 && mergeInfo.rowspan > 1);
          
          if (isLargeTitle) {
            td.style.cssText = `
              text-align: center; 
              vertical-align: middle; 
              font-size: 16px; 
              font-weight: bold; 
              padding: 12px;
              background: #f5f5f5;
              border: 2px solid #d0d0d0;
            `;
          } else {
            td.style.cssText = 'text-align: center; vertical-align: middle; background: #f9f9f9;';
          }
        }

        // Set content and styles
        if (cell) {
          const value = this.getCellValue(cell);
          td.textContent = value;

          // Apply cell styles (but don't override merge styles)
          if (!mergeInfo || !mergeInfo.isStart) {
            this.applyCellStyles(td, cell, worksheet);
          } else {
            // For merged cells, selectively apply some styles
            if (cell.s && cell.s.font) {
              if (cell.s.font.bold) td.style.fontWeight = 'bold';
              if (cell.s.font.sz) td.style.fontSize = `${cell.s.font.sz}pt`;
              if (cell.s.font.color) {
                const color = this.parseColor(cell.s.font.color);
                if (color) td.style.color = color;
              }
            }
          }
          
          // Detect data type for styling
          if (cell.t === 'n' && !mergeInfo) {
            td.classList.add('number');
            td.style.textAlign = 'right';
          } else if (cell.t === 'd') {
            td.classList.add('date');
            td.style.textAlign = 'center';
          } else if (cell.f) {
            td.classList.add('cell-formula');
            td.title = `Formula: ${cell.f}`;
          } else if (cell.t === 'e') {
            td.classList.add('cell-error');
          }
          
          // Handle hyperlinks
          if (cell.l) {
            td.classList.add('cell-hyperlink');
            td.onclick = () => window.open(cell.l.Target, '_blank');
          }
        } else if (!mergeInfo) {
          // Empty cell - add non-breaking space to maintain cell height
          td.innerHTML = '&nbsp;';
        }

        // Set column width
        const width = this.getColumnWidth(cols, c);
        td.style.width = width;
        td.style.minWidth = width;
        td.style.maxWidth = this.getColumnMaxWidth(cols, c);
        
        row.appendChild(td);
      }
      
      table.appendChild(row);
    }

    tableWrapper.appendChild(table);
    container.innerHTML = '';
    container.appendChild(tableWrapper);
  }

  /**
   * Apply cell styles from Excel
   */
  private applyCellStyles(td: HTMLTableCellElement, cell: any, worksheet: any): void {
    if (!cell.s) return;

    const style = cell.s;
    
    // Font styles
    if (style.font) {
      if (style.font.bold) td.style.fontWeight = 'bold';
      if (style.font.italic) td.style.fontStyle = 'italic';
      if (style.font.underline) td.style.textDecoration = 'underline';
      if (style.font.strike) td.style.textDecoration = 'line-through';
      if (style.font.sz) td.style.fontSize = `${style.font.sz}pt`;
      if (style.font.name) td.style.fontFamily = style.font.name;
      if (style.font.color) {
        const color = this.parseColor(style.font.color);
        if (color) td.style.color = color;
      }
    }
    
    // Fill (background)
    if (style.fill) {
      if (style.fill.fgColor) {
        const bgColor = this.parseColor(style.fill.fgColor);
        if (bgColor) td.style.backgroundColor = bgColor;
      } else if (style.fill.patternType === 'solid' && style.fill.bgColor) {
        const bgColor = this.parseColor(style.fill.bgColor);
        if (bgColor) td.style.backgroundColor = bgColor;
      }
    }
    
    // Alignment
    if (style.alignment) {
      if (style.alignment.horizontal) {
        const alignMap: any = {
          left: 'left',
          center: 'center',
          right: 'right',
          justify: 'justify',
          general: 'left'
        };
        td.style.textAlign = alignMap[style.alignment.horizontal] || 'left';
      }
      if (style.alignment.vertical) {
        const vAlignMap: any = {
          top: 'top',
          center: 'middle',
          bottom: 'bottom'
        };
        td.style.verticalAlign = vAlignMap[style.alignment.vertical] || 'middle';
      }
      if (style.alignment.wrapText) {
        td.style.whiteSpace = 'pre-wrap';
        td.style.wordWrap = 'break-word';
      }
      if (style.alignment.indent) {
        td.style.paddingLeft = `${style.alignment.indent * 10}px`;
      }
    }
    
    // Borders
    if (style.border) {
      const setBorder = (side: string, borderStyle: any) => {
        if (!borderStyle) return;
        
        const styleMap: any = {
          thin: '1px solid',
          medium: '2px solid',
          thick: '3px solid',
          dotted: '1px dotted',
          dashed: '1px dashed',
          double: '3px double'
        };
        
        const borderCss = styleMap[borderStyle.style] || '1px solid';
        const color = borderStyle.color ? this.parseColor(borderStyle.color) : '#000000';
        
        switch(side) {
          case 'top': td.style.borderTop = `${borderCss} ${color}`; break;
          case 'bottom': td.style.borderBottom = `${borderCss} ${color}`; break;
          case 'left': td.style.borderLeft = `${borderCss} ${color}`; break;
          case 'right': td.style.borderRight = `${borderCss} ${color}`; break;
        }
      };
      
      if (style.border.top) setBorder('top', style.border.top);
      if (style.border.bottom) setBorder('bottom', style.border.bottom);
      if (style.border.left) setBorder('left', style.border.left);
      if (style.border.right) setBorder('right', style.border.right);
    }
    
    // Number format
    if (style.numFmt) {
      td.setAttribute('data-format', style.numFmt);
    }
  }

  /**
   * Parse color from Excel format
   */
  private parseColor(color: any): string | null {
    if (!color) return null;
    
    // RGB color
    if (color.rgb) {
      if (color.rgb.length === 6) {
        return `#${color.rgb}`;
      } else if (color.rgb.length === 8) {
        // ARGB format, ignore alpha
        return `#${color.rgb.substring(2)}`;
      }
    }
    
    // Theme color
    if (color.theme !== undefined) {
      const themeColors = [
        '#000000', // 0 - Black
        '#FFFFFF', // 1 - White
        '#E7E6E6', // 2 - Gray
        '#44546A', // 3 - Dark Gray
        '#4472C4', // 4 - Blue
        '#ED7D31', // 5 - Orange
        '#A5A5A5', // 6 - Gray
        '#FFC000', // 7 - Gold
        '#5B9BD5', // 8 - Light Blue
        '#70AD47'  // 9 - Green
      ];
      
      let baseColor = themeColors[color.theme] || '#000000';
      
      // Apply tint if present
      if (color.tint) {
        baseColor = this.applyTint(baseColor, color.tint);
      }
      
      return baseColor;
    }
    
    // Indexed color
    if (color.indexed !== undefined) {
      // Excel indexed color palette
      const indexedColors = [
        '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF', '#000000', '#FFFFFF',
        '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF',
        '#00FFFF', '#800000', '#008000', '#000080', '#808000',
        '#800080', '#008080', '#C0C0C0', '#808080', '#9999FF',
        '#993366', '#FFFFCC', '#CCFFFF', '#660066', '#FF8080',
        '#0066CC', '#CCCCFF', '#000080', '#FF00FF', '#FFFF00',
        '#00FFFF', '#800080', '#800000', '#008080', '#0000FF',
        '#00CCFF', '#CCFFFF', '#CCFFCC', '#FFFF99', '#99CCFF',
        '#FF99CC', '#CC99FF', '#FFCC99', '#3366FF', '#33CCCC',
        '#99CC00', '#FFCC00', '#FF9900', '#FF6600', '#666699',
        '#969696', '#003366', '#339966', '#003300', '#333300',
        '#993300', '#993366', '#333399', '#333333'
      ];
      
      return indexedColors[color.indexed] || '#000000';
    }
    
    return null;
  }

  /**
   * Apply tint to color
   */
  private applyTint(hex: string, tint: number): string {
    const rgb = parseInt(hex.substring(1), 16);
    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;
    
    let newR, newG, newB;
    
    if (tint < 0) {
      // Darken
      const factor = 1 + tint;
      newR = Math.round(r * factor);
      newG = Math.round(g * factor);
      newB = Math.round(b * factor);
    } else {
      // Lighten
      newR = Math.round(r + (255 - r) * tint);
      newG = Math.round(g + (255 - g) * tint);
      newB = Math.round(b + (255 - b) * tint);
    }
    
    return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
  }

  /**
   * Get column width
   */
  private getColumnWidth(cols: any[], colIndex: number): string {
    if (!cols || !cols[colIndex]) return '85px';
    
    const col = cols[colIndex];
    if (col.wpx) {
      return `${Math.max(col.wpx, 50)}px`;
    } else if (col.wch) {
      // Character width to pixels (more accurate conversion)
      return `${Math.max(Math.round(col.wch * 7.5), 50)}px`;
    } else if (col.width) {
      // Excel width units to pixels (more accurate)
      return `${Math.max(Math.round(col.width * 7.5), 50)}px`;
    } else if (col.hidden) {
      return '0px';
    }
    
    return '85px';
  }

  /**
   * Get column max width
   */
  private getColumnMaxWidth(cols: any[], colIndex: number): string {
    if (!cols || !cols[colIndex]) return '400px';
    
    const col = cols[colIndex];
    if (col.wpx) {
      return `${Math.min(col.wpx * 1.5, 600)}px`;
    } else if (col.wch) {
      return `${Math.min(col.wch * 12, 600)}px`;
    } else if (col.width) {
      return `${Math.min(col.width * 12, 600)}px`;
    } else if (col.hidden) {
      return '0px';
    }
    
    return '400px';
  }

  /**
   * Get cell value as string
   */
  private getCellValue(cell: any): string {
    if (cell.v === undefined || cell.v === null) return '';
    
    // Formatted text (prefer formatted value)
    if (cell.w !== undefined && cell.w !== null && cell.w !== '') {
      return String(cell.w).trim();
    }
    
    // Rich text
    if (cell.r && Array.isArray(cell.r)) {
      return cell.r.map((r: any) => r.t || '').join('');
    }
    
    // Date
    if (cell.t === 'd') {
      if (cell.v instanceof Date) {
        return cell.v.toLocaleDateString();
      }
      return String(cell.v);
    }
    
    // Boolean
    if (cell.t === 'b') {
      return cell.v ? 'TRUE' : 'FALSE';
    }
    
    // Error
    if (cell.t === 'e') {
      return `#${cell.v}!`;
    }
    
    // Number with specific format
    if (cell.t === 'n' && cell.z) {
      // Try to format number if format string is available
      if (typeof cell.v === 'number') {
        // Handle percentage
        if (cell.z.includes('%')) {
          return `${(cell.v * 100).toFixed(2)}%`;
        }
        // Handle currency or accounting
        if (cell.z.includes('¥') || cell.z.includes('$')) {
          return `¥${cell.v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }
    }
    
    // String or default
    return String(cell.v).trim();
  }

  /**
   * Create sheet tabs
   */
  private createSheetTabs(): HTMLElement {
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'sheet-tabs';

    this.sheetNames.forEach((name, index) => {
      const tab = document.createElement('button');
      tab.className = 'sheet-tab';
      tab.textContent = name;
      
      if (index === this.currentSheet) {
        tab.classList.add('active');
      }

      tab.addEventListener('click', () => {
        this.switchSheet(index);
      });

      tabsContainer.appendChild(tab);
    });

    return tabsContainer;
  }

  /**
   * Switch to a different sheet
   */
  switchSheet(sheetIndex: number): void {
    if (sheetIndex < 0 || sheetIndex >= this.sheetNames.length) {
      return;
    }

    this.currentSheet = sheetIndex;

    // Update tabs
    const tabs = this.container?.querySelectorAll('.sheet-tab');
    tabs?.forEach((tab, index) => {
      if (index === sheetIndex) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Re-render content
    const contentArea = this.container?.querySelector('.excel-content-area') as HTMLElement;
    if (contentArea) {
      this.renderSheetEnhanced(contentArea);
    }
  }

  /**
   * Get document metadata
   */
  async getMetadata(data: ArrayBuffer): Promise<DocumentMetadata> {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      
      return {
        title: 'Excel Document',
        pageCount: workbook.SheetNames.length,
        sheets: workbook.SheetNames
      };
    } catch (error) {
      return {
        title: 'Excel Document',
        pageCount: 0
      };
    }
  }

  /**
   * Export document to different formats
   */
  async export(format: 'pdf' | 'html' | 'text'): Promise<Blob> {
    if (!this.workbook) {
      throw new Error('No document loaded');
    }

    switch (format) {
      case 'html':
        const html = XLSX.write(this.workbook, { bookType: 'html', type: 'string' });
        return new Blob([html], { type: 'text/html' });

      case 'text':
        const csv = XLSX.utils.sheet_to_csv(this.workbook.Sheets[this.sheetNames[this.currentSheet]]);
        return new Blob([csv], { type: 'text/plain' });

      case 'pdf':
        throw new Error('PDF export not yet implemented. Please use browser print to PDF feature.');

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Destroy renderer and clean up
   */
  destroy(): void {
    // Remove styles
    const style = document.getElementById('excel-enhanced-styles');
    if (style) {
      style.remove();
    }

    if (this.container) {
      this.container.innerHTML = '';
    }

    this.container = null;
    this.workbook = null;
    this.options = null;
  }
}