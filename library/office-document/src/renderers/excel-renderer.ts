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

   // Initialize x-data-spreadsheet
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

   // Load data
   this.spreadsheet.loadData(xsData);

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
  return workbook.SheetNames.map((sheetName, sheetIndex) => {
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
      
      // Set text/value
      if (cell.v !== undefined) {
       cellData.text = String(cell.v);
      }
      
      // Set number format
      if (cell.t === 'n') {
       cellData.type = 'number';
      }
      
      // Add cell style if available
      if (cell.s) {
       const style: any = {};
       
       // Font
       if (cell.s.font) {
        if (cell.s.font.bold) style.bold = true;
        if (cell.s.font.italic) style.italic = true;
        if (cell.s.font.name) style.font = cell.s.font.name;
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
     if (col.wpx) {
      cols[index] = { width: col.wpx };
     }
    });
   }

   return {
    name: sheetName,
    rows,
    cols,
    merges: worksheet['!merges'] || [],
    freeze: 'A1'
   };
  });
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
