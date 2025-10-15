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
   const xsData = this.convertWorkbookToXDataSpreadsheetFormat(this.workbook);
   
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
   if (xsData && xsData.length > 0) {
    this.spreadsheet.loadData(xsData);
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
  * Convert workbook to x-data-spreadsheet format 
  */
 private convertWorkbookToXDataSpreadsheetFormat(workbook: ExcelJS.Workbook): any[] {
  const sheets: any[] = [];
  
  workbook.worksheets.forEach((worksheet) => {
   const rows: any = {};
   const cols: any = {};
   const merges: string[] = [];
   const styles: any[] = [];
   
   // Process columns
   worksheet.columns?.forEach((column, index) => {
    if (column && column.width) {
     cols[index] = { width: Math.round(column.width * 7) };
    }
   });
   
   // Process rows
   let maxRow = 0;
   let maxCol = 0;
   
   worksheet.eachRow((row, rowNumber) => {
    const rowIndex = rowNumber - 1;
    maxRow = Math.max(maxRow, rowIndex);
    
    const rowData: any = { cells: {} };
    
    if (row.height) {
     rowData.height = Math.round(row.height);
    }
    
    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
     const colIndex = colNumber - 1;
     maxCol = Math.max(maxCol, colIndex);
     
     const cellData: any = {};
     
     // Get cell value
     if (cell.value !== null && cell.value !== undefined) {
      if (cell.type === ExcelJS.ValueType.Date) {
       cellData.text = (cell.value as Date).toLocaleDateString();
      } else if (cell.type === ExcelJS.ValueType.Formula) {
       const result = (cell as any).result;
       cellData.text = result !== null && result !== undefined ? String(result) : '';
      } else {
       cellData.text = String(cell.value);
      }
     }
     
     // Apply basic styles
     if (cell.font || cell.fill || cell.alignment || cell.border) {
      const style: any = {};
      
      if (cell.font) {
       if (cell.font.bold) style.bold = true;
       if (cell.font.italic) style.italic = true;
       if (cell.font.underline) style.underline = true;
       if (cell.font.strike) style.strike = true;
       if (cell.font.size) style.fontSize = cell.font.size;
       if (cell.font.color?.argb) {
        style.color = this.argbToHex(cell.font.color.argb);
       }
      }
      
      if (cell.fill && cell.fill.type === 'pattern') {
       const patternFill = cell.fill as ExcelJS.FillPattern;
       if (patternFill.fgColor?.argb) {
        style.bgcolor = this.argbToHex(patternFill.fgColor.argb);
       }
      }
      
      if (cell.alignment) {
       if (cell.alignment.horizontal) style.align = cell.alignment.horizontal;
       if (cell.alignment.vertical) style.valign = cell.alignment.vertical;
       if (cell.alignment.wrapText) style.textwrap = true;
      }
      
      if (cell.border) {
       const border: any = {};
       if (cell.border.top) border.top = ['thin', '#000'];
       if (cell.border.bottom) border.bottom = ['thin', '#000'];
       if (cell.border.left) border.left = ['thin', '#000'];
       if (cell.border.right) border.right = ['thin', '#000'];
       if (Object.keys(border).length > 0) {
        style.border = border;
       }
      }
      
      // Find or add style
      let styleIndex = styles.findIndex(s => JSON.stringify(s) === JSON.stringify(style));
      if (styleIndex === -1) {
       styles.push(style);
       styleIndex = styles.length - 1;
      }
      cellData.style = styleIndex;
     }
     
     if (cellData.text || cellData.style !== undefined) {
      rowData.cells[colIndex] = cellData;
     }
    });
    
    if (Object.keys(rowData.cells).length > 0 || rowData.height) {
     rows[rowIndex] = rowData;
    }
   });
   
   // Process merges
   worksheet.model.merges?.forEach((merge: string) => {
    merges.push(merge);
   });
   
   // Create sheet data
   const sheetData: any = {
    name: worksheet.name || 'Sheet',
    rows,
    cols,
    styles,
    merges
   };
   
   // Add freeze if present
   if (worksheet.views?.[0]?.state === 'frozen') {
    const view = worksheet.views[0];
    sheetData.freeze = `${view.ySplit || 0}-${view.xSplit || 0}`;
   }
   
   sheets.push(sheetData);
  });
  return sheets;
 }

 /**
  * Render a specific sheet as HTML table (backup method)
  */
 private renderSheet(sheetIndex: number): void {
  if (!this.workbook || !this.container) return;
  
  const worksheet = this.workbook.worksheets[sheetIndex];
  if (!worksheet) return;
  
  this.currentSheetIndex = sheetIndex;
  
  // Update tabs
  const tabs = this.container.querySelectorAll('.sheet-tab');
  tabs.forEach((tab, index) => {
   tab.classList.toggle('active', index === sheetIndex);
   (tab as HTMLElement).style.background = index === sheetIndex ? '#fff' : '#f9f9f9';
  });
  
  // Get content container
  const contentContainer = this.container.querySelector('#excel-content') as HTMLElement;
  if (!contentContainer) return;
  
  // Clear content
  contentContainer.innerHTML = '';
  
  // Create table
  const table = document.createElement('table');
  table.className = 'excel-table';
  table.style.cssText = `
   border-collapse: collapse;
   width: 100%;
   font-size: 13px;
   font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  `;
  
  // Create header row with column letters
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')); // Empty corner cell
  
  const maxCol = worksheet.columnCount || 10;
  for (let col = 1; col <= maxCol; col++) {
   const th = document.createElement('th');
   th.textContent = this.getColumnLetter(col);
   th.style.cssText = `
    background: #f0f0f0;
    border: 1px solid #ddd;
    padding: 8px;
    font-weight: bold;
    text-align: center;
    min-width: 80px;
   `;
   headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create table body with data
  const tbody = document.createElement('tbody');
  
  // Process each row
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
   const tr = document.createElement('tr');
   
   // Add row number
   const rowHeader = document.createElement('th');
   rowHeader.textContent = String(rowNumber);
   rowHeader.style.cssText = `
    background: #f0f0f0;
    border: 1px solid #ddd;
    padding: 8px;
    font-weight: bold;
    text-align: center;
    width: 50px;
   `;
   tr.appendChild(rowHeader);
   
   // Add cells
   for (let col = 1; col <= maxCol; col++) {
    const cell = row.getCell(col);
    const td = document.createElement('td');
    
    // Get cell value
    let cellValue = '';
    if (cell.value !== null && cell.value !== undefined) {
     if (cell.type === ExcelJS.ValueType.Date) {
      cellValue = (cell.value as Date).toLocaleDateString();
     } else if (cell.type === ExcelJS.ValueType.Formula) {
      cellValue = String((cell as any).result || '');
     } else {
      cellValue = String(cell.value);
     }
    }
    
    td.textContent = cellValue;
    td.style.cssText = `
     border: 1px solid #ddd;
     padding: 8px;
     text-align: ${typeof cell.value === 'number' ? 'right' : 'left'};
    `;
    
    // Apply cell styles
    if (cell.font) {
     if (cell.font.bold) td.style.fontWeight = 'bold';
     if (cell.font.italic) td.style.fontStyle = 'italic';
     if (cell.font.size) td.style.fontSize = `${cell.font.size}pt`;
     if (cell.font.color) {
      const color = cell.font.color.argb;
      if (color) td.style.color = `#${color.substring(2)}`;
     }
    }
    
    if (cell.fill && cell.fill.type === 'pattern') {
     const fill = cell.fill as ExcelJS.FillPattern;
     if (fill.fgColor?.argb) {
      td.style.background = `#${fill.fgColor.argb.substring(2)}`;
     }
    }
    
    tr.appendChild(td);
   }
   
   tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  contentContainer.appendChild(table);
 }

 /**
  * Get column letter from column number (1 = A, 2 = B, etc.)
  */
 private getColumnLetter(col: number): string {
  let letter = '';
  while (col > 0) {
   col--;
   letter = String.fromCharCode(65 + (col % 26)) + letter;
   col = Math.floor(col / 26);
  }
  return letter;
 }

 /**
  * Convert ExcelJS workbook to x-data-spreadsheet format (deprecated)
  */
 private convertWorkbookToXS(workbook: ExcelJS.Workbook): any {
  const sheets: any[] = [];
  
  console.log('Converting workbook with', workbook.worksheets.length, 'sheets');
  
  workbook.worksheets.forEach((worksheet, sheetIndex) => {
   const rows: any = {};
   const cols: any = {};
   const styles: any[] = []; // Store styles

   console.log(`Processing sheet ${sheetIndex}: ${worksheet.name}`);
   console.log(`Sheet dimensions: ${worksheet.rowCount} rows, ${worksheet.columnCount} cols`);
   console.log(`Actual cell count: ${worksheet.actualRowCount}, ${worksheet.actualColumnCount}`);
   
   // Get dimensions
   const rowCount = worksheet.rowCount || 0;
   const columnCount = worksheet.columnCount || 0;

   // Convert cells - use includeEmpty: true to capture all cells
   let totalCells = 0;
   let processedCells = 0;
   
   worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const rowData: any = { cells: {} };
    const R = rowNumber - 1; // Convert to 0-based index
    
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
     totalCells++;
     const C = colNumber - 1; // Convert to 0-based index
     const cellData: any = {};
     
     // Set text/value based on cell type
     if (cell.value !== null && cell.value !== undefined) {
      processedCells++;
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
     
     // Add cell if it has text or any content
     if (cellData.text !== undefined && cellData.text !== '') {
      rowData.cells[C] = cellData;
     } else if (Object.keys(cellData).length > 1) {
      // Has style but no text
      cellData.text = '';
      rowData.cells[C] = cellData;
     }
    });
    
    // Set row height if available
    if (row.height) {
     rowData.height = Math.round(row.height);
    }
    
   // Add rows even if they might have cells
   if (Object.keys(rowData.cells).length > 0) {
    rows[R] = rowData;
   }
   });

   console.log(`Sheet ${sheetIndex}: Processed ${processedCells} cells out of ${totalCells} total`);
   console.log(`Sheet ${sheetIndex}: Created ${Object.keys(rows).length} rows`);
   
   // If no rows were created but worksheet has data, add at least one cell
   if (Object.keys(rows).length === 0 && worksheet.actualRowCount > 0) {
    console.log('No rows created, attempting to read worksheet data directly...');
    // Try a simpler approach - just get the first few rows
    for (let r = 0; r < Math.min(10, worksheet.actualRowCount); r++) {
     const row = worksheet.getRow(r + 1);
     if (row && row.values && row.values.length > 0) {
      const rowData: any = { cells: {} };
      row.values.forEach((value, index) => {
       if (value !== null && value !== undefined) {
        rowData.cells[index - 1] = { text: String(value) };
       }
      });
      if (Object.keys(rowData.cells).length > 0) {
       rows[r] = rowData;
      }
     }
    }
    console.log(`After direct read: ${Object.keys(rows).length} rows`);
   }
   
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
  * Convert cell address (e.g., 'A1') to row and column index
  */
 private cellAddressToIndex(address: string): [number, number] {
  const match = address.match(/^([A-Z]+)(\d+)$/);
  if (!match) return [0, 0];
  
  const col = match[1];
  const row = parseInt(match[2], 10) - 1;
  
  let colIndex = 0;
  for (let i = 0; i < col.length; i++) {
   colIndex = colIndex * 26 + col.charCodeAt(i) - 64;
  }
  colIndex--;
  
  return [row, colIndex];
 }

 /**
  * Get or create style for cell
  */
 private getCellStyle(cell: ExcelJS.Cell, styles: any[]): number {
  const style: any = {};
  
  // Font styles
  if (cell.font) {
   const font: any = {};
   if (cell.font.bold) font.bold = true;
   if (cell.font.italic) font.italic = true;
   if (cell.font.underline) font.underline = true;
   if (cell.font.strike) font.strike = true;
   if (cell.font.name) font.name = cell.font.name;
   if (cell.font.size) font.size = Math.round(cell.font.size);
   if (cell.font.color?.argb) {
    font.color = this.argbToHex(cell.font.color.argb);
   }
   if (Object.keys(font).length > 0) {
    style.font = font;
   }
  }
  
  // Fill/Background
  if (cell.fill && cell.fill.type === 'pattern') {
   const patternFill = cell.fill as ExcelJS.FillPattern;
   if (patternFill.fgColor?.argb) {
    style.bgcolor = this.argbToHex(patternFill.fgColor.argb);
   }
  } else if (cell.fill && cell.fill.type === 'gradient') {
   const gradientFill = cell.fill as ExcelJS.FillGradient;
   // Use first stop color as background
   if (gradientFill.stops?.[0]?.color?.argb) {
    style.bgcolor = this.argbToHex(gradientFill.stops[0].color.argb);
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
   if (cell.alignment.textRotation) {
    style.textRotation = cell.alignment.textRotation;
   }
   if (cell.alignment.indent) {
    style.indent = cell.alignment.indent;
   }
  }
  
  // Borders
  if (cell.border) {
   const border: any = {};
   
   const convertBorder = (b: any) => {
    if (!b) return null;
    const style = b.style || 'thin';
    const color = b.color?.argb ? this.argbToHex(b.color.argb) : '#000000';
    return [style, color];
   };
   
   if (cell.border.top) border.top = convertBorder(cell.border.top);
   if (cell.border.bottom) border.bottom = convertBorder(cell.border.bottom);
   if (cell.border.left) border.left = convertBorder(cell.border.left);
   if (cell.border.right) border.right = convertBorder(cell.border.right);
   
   if (Object.keys(border).length > 0) {
    style.border = border;
   }
  }
  
  // Number format
  if (cell.numFmt) {
   style.format = cell.numFmt;
  }
  
  // Return style index or -1 if no style
  if (Object.keys(style).length === 0) {
   return -1;
  }
  
  // Check if this style already exists
  const existingIndex = styles.findIndex(s => JSON.stringify(s) === JSON.stringify(style));
  if (existingIndex !== -1) {
   return existingIndex;
  }
  
  // Add new style and return its index
  styles.push(style);
  return styles.length - 1;
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
    // x-data-spreadsheet uses sheet index directly
    this.spreadsheet.loadSheetData(sheetIndex);
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
