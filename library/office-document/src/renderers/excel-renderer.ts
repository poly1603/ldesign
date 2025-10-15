import * as XLSX from 'xlsx';
import Spreadsheet from 'x-data-spreadsheet';
import 'x-data-spreadsheet/dist/xspreadsheet.css';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Excel Document Renderer
 * Uses x-data-spreadsheet for high-fidelity rendering with styles and interactivity
 */
export class ExcelRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private workbook: XLSX.WorkBook | null = null;
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
   // Parse Excel file
   const uint8Array = new Uint8Array(data);
   this.workbook = XLSX.read(uint8Array, { type: 'array', cellStyles: true });

   if (!this.workbook || !this.workbook.SheetNames || this.workbook.SheetNames.length === 0) {
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
   const spreadsheetData = xsData.length > 0 ? xsData : [{ name: 'Sheet1', rows: {} }];
   
   this.spreadsheet = new Spreadsheet(wrapper, {
    mode: options.excel?.enableEditing ? 'edit' : 'read',
    showToolbar: options.excel?.showFormulaBar || false,
    showGrid: options.excel?.showGridLines !== false,
    showContextmenu: options.excel?.enableEditing || false,
    view: {
     height: () => wrapper.clientHeight,
     width: () => wrapper.clientWidth
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
   if (spreadsheetData.length > 0) {
    // loadData expects the data in a specific format
    this.spreadsheet.loadData(spreadsheetData);
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
  * Convert SheetJS workbook to x-data-spreadsheet format
  */
 private convertWorkbookToXS(workbook: XLSX.WorkBook): any {
  const sheets: any[] = [];
  
  workbook.SheetNames.forEach((sheetName) => {
   const worksheet = workbook.Sheets[sheetName];
   const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
   
   const rows: any = {};
   const cols: any = {};

   // Convert cells
   for (let R = range.s.r; R <= range.e.r; ++R) {
    const rowData: any = { cells: {} };
    
    for (let C = range.s.c; C <= range.e.c; ++C) {
     const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
     const cell = worksheet[cellAddress];
     
     if (cell) {
      const cellData: any = {};
      
      // Set text/value based on cell type
      if (cell.v !== undefined) {
       if (cell.t === 'n') {
        // Number
        cellData.text = cell.w || String(cell.v);
       } else if (cell.t === 'd') {
        // Date
        cellData.text = cell.w || cell.v.toLocaleDateString();
       } else if (cell.f) {
        // Formula
        cellData.text = cell.w || String(cell.v);
        cellData.formula = cell.f;
       } else {
        // String or other
        cellData.text = String(cell.v);
       }
      }
      
      // Add cell style if available
      if (cell.s) {
       const style: any = {};
       
       // Font
       if (cell.s.font) {
        if (cell.s.font.bold) style.bold = true;
        if (cell.s.font.italic) style.italic = true;
        if (cell.s.font.underline) style.underline = true;
        if (cell.s.font.strike) style.strike = true;
        if (cell.s.font.name) style.font = { name: cell.s.font.name };
        if (cell.s.font.sz) style.fontSize = cell.s.font.sz;
        if (cell.s.font.color) style.color = this.rgbToHex(cell.s.font.color);
       }
       
       // Fill
       if (cell.s.fill && cell.s.fill.fgColor) {
        style.bgcolor = this.rgbToHex(cell.s.fill.fgColor);
       }
       
       // Alignment
       if (cell.s.alignment) {
        if (cell.s.alignment.horizontal) {
         style.align = cell.s.alignment.horizontal;
        }
        if (cell.s.alignment.vertical) {
         style.valign = cell.s.alignment.vertical;
        }
        if (cell.s.alignment.wrapText) {
         style.textwrap = true;
        }
       }
       
       // Border
       if (cell.s.border) {
        const border: any[] = [];
        if (cell.s.border.top) border.push('top');
        if (cell.s.border.bottom) border.push('bottom');
        if (cell.s.border.left) border.push('left');
        if (cell.s.border.right) border.push('right');
        if (border.length > 0) {
         style.border = {
          top: cell.s.border.top ? ['thin', '#000'] : null,
          bottom: cell.s.border.bottom ? ['thin', '#000'] : null,
          left: cell.s.border.left ? ['thin', '#000'] : null,
          right: cell.s.border.right ? ['thin', '#000'] : null
         };
        }
       }
       
       if (Object.keys(style).length > 0) {
        cellData.style = style;
       }
      }
      
      rowData.cells[C] = cellData;
     }
    }
    
    if (Object.keys(rowData.cells).length > 0) {
     rows[R] = rowData;
    }
   }

   // Set column widths
   if (worksheet['!cols']) {
    worksheet['!cols'].forEach((col: any, index: number) => {
     if (col && col.wpx) {
      cols[index] = { width: Math.round(col.wpx) };
     } else if (col && col.width) {
      cols[index] = { width: Math.round(col.width * 10) };
     }
    });
   }

   // Set row heights
   const rowHeights: any = {};
   if (worksheet['!rows']) {
    worksheet['!rows'].forEach((row: any, index: number) => {
     if (row && row.hpx) {
      if (!rows[index]) rows[index] = { cells: {} };
      rows[index].height = Math.round(row.hpx);
     }
    });
   }

   sheets.push({
    name: sheetName,
    rows,
    cols,
    merges: worksheet['!merges'] || [],
    freeze: worksheet['!freeze'] || 'A1'
   });
  });
  
  return sheets;
 }

 /**
  * Convert RGB color to hex
  */
 private rgbToHex(color: any): string {
  if (!color) return '#000000';
  if (color.rgb) {
   return '#' + color.rgb.substring(2);
  }
  return '#000000';
 }

 /**
  * Switch to a different sheet
  */
 switchSheet(sheetIndex: number): void {
  if (this.spreadsheet && this.workbook) {
   if (sheetIndex >= 0 && sheetIndex < this.workbook.SheetNames.length) {
    this.spreadsheet.changeSheet(sheetIndex);
   }
  }
 }

/**
 * Get document metadata
 */
async getMetadata(data: ArrayBuffer): Promise<DocumentMetadata> {
  try {
   const uint8Array = new Uint8Array(data);
   const workbook = XLSX.read(uint8Array, { type: 'array' });

   const sheetCount = workbook.SheetNames.length;
   let totalCells = 0;

   // Count total cells
   workbook.SheetNames.forEach(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const rows = range.e.r - range.s.r + 1;
    const cols = range.e.c - range.s.c + 1;
    totalCells += rows * cols;
   });

   return {
    title: 'Excel Workbook',
    pageCount: sheetCount,
    sheets: workbook.SheetNames,
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
  const sheetName = this.workbook.SheetNames[currentSheetIndex];
  const worksheet = this.workbook.Sheets[sheetName];

  switch (format) {
   case 'html':
    const htmlContent = XLSX.utils.sheet_to_html(worksheet);
    return new Blob([htmlContent], { type: 'text/html' });

   case 'text':
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
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
