import * as ExcelJS from 'exceljs';
import Spreadsheet from 'x-data-spreadsheet';
import 'x-data-spreadsheet/dist/xspreadsheet.css';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Excel Document Renderer
 * Uses ExcelJS for parsing and x-data-spreadsheet for high-fidelity rendering with styles and interactivity
 */
export class ExcelRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private workbook: ExcelJS.Workbook | null = null;
 private spreadsheet: any = null;
 private currentData: ArrayBuffer | null = null;
 private options: ViewerOptions | null = null;

 /**
  * Render Excel document
  */
 async render(container: HTMLElement, data: ArrayBuffer, options: ViewerOptions): Promise<void> {
  this.container = container;
  this.currentData = data;
  this.options = options;

  try {
   // Parse Excel file using ExcelJS
   this.workbook = new ExcelJS.Workbook();
   await this.workbook.xlsx.load(data);

   if (!this.workbook || this.workbook.worksheets.length === 0) {
    throw new Error('No sheets found in Excel file');
   }

   // Clear container
   container.innerHTML = '';

   // Create wrapper
   const wrapper = document.createElement('div');
   wrapper.className = 'excel-viewer-wrapper';
   wrapper.style.width = '100%';
   wrapper.style.height = '100%';

   container.appendChild(wrapper);

   // Convert workbook to x-data-spreadsheet format
   const xsData = this.convertWorkbookToXS(this.workbook);

   // Initialize x-data-spreadsheet with correct data format
   const spreadsheetData = xsData && xsData.length > 0 ? xsData : [{ name: 'Sheet1', rows: {}, cols: {} }];
   
   this.spreadsheet = new Spreadsheet(wrapper, {
    mode: options.excel?.enableEditing ? 'edit' : 'read',
    showToolbar: options.excel?.showFormulaBar || false,
    showGrid: options.excel?.showGridLines !== false,
    showContextmenu: options.excel?.enableEditing || false,
    view: {
     height: () => wrapper.clientHeight || 600,
     width: () => wrapper.clientWidth || 800
    },
    row: {
     len: 100,
     height: 25
    },
    col: {
     len: 26,
     width: 100,
     indexWidth: 60,
     minWidth: 60
    }
   });

   // Load data - x-data-spreadsheet expects array of sheet objects
   if (spreadsheetData && spreadsheetData.length > 0) {
    try {
     // loadData expects the data in a specific format
     this.spreadsheet.loadData(spreadsheetData);
    } catch (loadError) {
     console.error('Error loading data into spreadsheet:', loadError);
     // Try with minimal data structure
     this.spreadsheet.loadData([{ name: 'Sheet1', rows: {}, cols: {} }]);
    }
   }

   // Call onLoad callback
   options.onLoad?.();
  } catch (error) {
   const err = error instanceof Error ? error : new Error('Failed to render Excel document');
   options.onError?.(err);
   throw err;
  }
 }

 /**
  * Convert ExcelJS workbook to x-data-spreadsheet format
  */
 private convertWorkbookToXS(workbook: ExcelJS.Workbook): any {
  const sheets: any[] = [];
  
  workbook.worksheets.forEach((worksheet) => {
   const rows: any = {};
   const cols: any = {};
   const styles: any[] = []; // Store styles

   // Get dimensions
   const rowCount = worksheet.rowCount || 0;
   const columnCount = worksheet.columnCount || 0;

   // Convert cells
   worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const rowData: any = { cells: {} };
    const R = rowNumber - 1; // Convert to 0-based index
    
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
     const C = colNumber - 1; // Convert to 0-based index
     const cellData: any = {};
     
     // Set text/value based on cell type
     if (cell.value !== null && cell.value !== undefined) {
      if (cell.type === ExcelJS.ValueType.Number) {
       cellData.text = String(cell.value);
      } else if (cell.type === ExcelJS.ValueType.Date) {
       const date = cell.value as Date;
       cellData.text = date.toLocaleDateString();
      } else if (cell.type === ExcelJS.ValueType.Formula) {
       const formulaCell = cell as ExcelJS.FormulaCell;
       cellData.text = String(formulaCell.result || '');
       cellData.formula = formulaCell.formula;
      } else if (cell.type === ExcelJS.ValueType.Hyperlink) {
       const hyperlinkCell = cell as ExcelJS.HyperlinkCell;
       cellData.text = hyperlinkCell.text || String(hyperlinkCell.hyperlink);
      } else {
       cellData.text = String(cell.value);
      }
     }
     
     // Add cell style if available
     if (cell.style) {
      const style: any = {};
      
      // Font
      if (cell.font) {
       if (cell.font.bold) style.bold = true;
       if (cell.font.italic) style.italic = true;
       if (cell.font.underline) style.underline = true;
       if (cell.font.strike) style.strike = true;
       if (cell.font.name) style.font = { name: cell.font.name };
       if (cell.font.size) style.fontSize = cell.font.size;
       if (cell.font.color) style.color = this.argbToHex(cell.font.color.argb);
      }
      
      // Fill
      if (cell.fill && cell.fill.type === 'pattern' && (cell.fill as ExcelJS.FillPattern).fgColor) {
       const patternFill = cell.fill as ExcelJS.FillPattern;
       if (patternFill.fgColor) {
        style.bgcolor = this.argbToHex(patternFill.fgColor.argb);
       }
      }
      
      // Alignment
      if (cell.alignment) {
       if (cell.alignment.horizontal) {
        style.align = cell.alignment.horizontal;
       }
       if (cell.alignment.vertical) {
        style.valign = cell.alignment.vertical;
       }
       if (cell.alignment.wrapText) {
        style.textwrap = true;
       }
      }
      
      // Border
      if (cell.border) {
       const borderStyles: any = {};
       if (cell.border.top) borderStyles.top = ['thin', '#000'];
       if (cell.border.bottom) borderStyles.bottom = ['thin', '#000'];
       if (cell.border.left) borderStyles.left = ['thin', '#000'];
       if (cell.border.right) borderStyles.right = ['thin', '#000'];
       if (Object.keys(borderStyles).length > 0) {
        style.border = borderStyles;
       }
      }
      
      if (Object.keys(style).length > 0) {
       cellData.style = style;
      }
     }
     
     if (cellData.text !== undefined || Object.keys(cellData).length > 0) {
      // Ensure text exists even if empty
      if (!cellData.text) cellData.text = '';
      rowData.cells[C] = cellData;
     }
    });
    
    // Set row height if available
    if (row.height) {
     rowData.height = Math.round(row.height);
    }
    
    // Only add rows that have cells
    if (Object.keys(rowData.cells).length > 0) {
     rows[R] = rowData;
    }
   });

   // Set column widths
   worksheet.columns?.forEach((column, index) => {
    if (column && column.width) {
     cols[index] = { width: Math.round(column.width * 10) };
    }
   });

   // Get merged cells
   const merges: any[] = [];
   worksheet.model.merges.forEach((merge: string) => {
    const [start, end] = merge.split(':');
    if (start && end) {
     merges.push(merge);
    }
   });

   // Ensure we have valid data structure
   const sheetData: any = {
    name: worksheet.name || `Sheet${sheets.length + 1}`,
    rows: Object.keys(rows).length > 0 ? rows : {},
    cols: Object.keys(cols).length > 0 ? cols : {}
   };
   
   // Add optional properties only if they have values
   if (merges && merges.length > 0) {
    sheetData.merges = merges;
   }
   
   if (worksheet.views?.[0]?.state === 'frozen') {
    const view = worksheet.views[0];
    if (view.xSplit || view.ySplit) {
     sheetData.freeze = `${view.xSplit || 0}:${view.ySplit || 0}`;
    }
   }
   
   sheets.push(sheetData);
  });
  
  return sheets;
 }

 /**
  * Convert ARGB color to hex
  */
 private argbToHex(argb: string | undefined): string {
  if (!argb) return '#000000';
  // Remove alpha channel if present (first 2 chars)
  if (argb.length === 8) {
   return '#' + argb.substring(2);
  }
  return '#' + argb;
 }

 /**
  * Switch to a different sheet
  */
 switchSheet(sheetIndex: number): void {
  if (this.spreadsheet && this.workbook) {
   if (sheetIndex >= 0 && sheetIndex < this.workbook.worksheets.length) {
    this.spreadsheet.changeSheet(sheetIndex);
   }
  }
 }

/**
 * Get document metadata
 */
async getMetadata(data: ArrayBuffer): Promise<DocumentMetadata> {
  try {
   const workbook = new ExcelJS.Workbook();
   await workbook.xlsx.load(data);

   const sheetCount = workbook.worksheets.length;
   let totalCells = 0;

   // Count total cells
   workbook.worksheets.forEach(worksheet => {
    const rows = worksheet.rowCount || 0;
    const cols = worksheet.columnCount || 0;
    totalCells += rows * cols;
   });

   return {
    title: 'Excel Workbook',
    pageCount: sheetCount,
    sheets: workbook.worksheets.map(ws => ws.name),
    cellCount: totalCells
   };
  } catch (error) {
   console.error('Failed to extract metadata:', error);
   return {
    title: 'Excel Workbook'
   };
  }
 }

 /**
  * Export document to different formats
  */
 async export(format: 'pdf' | 'html' | 'text'): Promise<Blob> {
  if (!this.workbook || !this.spreadsheet) {
   throw new Error('No document loaded');
  }

  const currentSheetIndex = this.spreadsheet.sheetIndex || 0;
  const worksheet = this.workbook.worksheets[currentSheetIndex];

  switch (format) {
   case 'html':
    // Generate HTML from worksheet
    let htmlContent = '<table border="1">';
    worksheet.eachRow((row, rowNumber) => {
     htmlContent += '<tr>';
     row.eachCell((cell, colNumber) => {
      htmlContent += `<td>${cell.value || ''}</td>`;
     });
     htmlContent += '</tr>';
    });
    htmlContent += '</table>';
    return new Blob([htmlContent], { type: 'text/html' });

   case 'text':
    // Generate CSV from worksheet
    let csvContent = '';
    worksheet.eachRow((row, rowNumber) => {
     const values: string[] = [];
     row.eachCell((cell, colNumber) => {
      values.push(String(cell.value || ''));
     });
     csvContent += values.join(',') + '\n';
    });
    return new Blob([csvContent], { type: 'text/plain' });

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
  if (this.spreadsheet) {
   // x-data-spreadsheet doesn't have a destroy method, so we just clear the container
   this.spreadsheet = null;
  }
  
  if (this.container) {
   this.container.innerHTML = '';
  }
  
  this.container = null;
  this.workbook = null;
  this.currentData = null;
  this.options = null;
 }
}
