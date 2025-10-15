import * as XLSX from 'xlsx';
import type { IDocumentRenderer, DocumentMetadata, ViewerOptions } from '../types';

/**
 * Excel Document Renderer
 * Uses SheetJS (xlsx) to render Excel files
 */
export class ExcelRenderer implements IDocumentRenderer {
 private container: HTMLElement | null = null;
 private workbook: XLSX.WorkBook | null = null;
 private currentSheet: number = 0;
 private currentData: ArrayBuffer | null = null;
 private options: ViewerOptions | null = null;
 private sheetTabsContainer: HTMLElement | null = null;
 private contentElement: HTMLElement | null = null;

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
   this.workbook = XLSX.read(uint8Array, { type: 'array' });

   if (!this.workbook || !this.workbook.SheetNames || this.workbook.SheetNames.length === 0) {
    throw new Error('No sheets found in Excel file');
   }

   // Set default sheet
   this.currentSheet = options.excel?.defaultSheet ?? 0;
   if (this.currentSheet >= this.workbook.SheetNames.length) {
    this.currentSheet = 0;
   }

   // Clear container
   container.innerHTML = '';

   // Create wrapper
   const wrapper = document.createElement('div');
   wrapper.className = 'excel-viewer-wrapper';

   // Create formula bar if enabled
   if (options.excel?.showFormulaBar) {
    const formulaBar = this.createFormulaBar();
    wrapper.appendChild(formulaBar);
   }

   // Create sheet tabs if enabled
   if (options.excel?.showSheetTabs !== false) {
    this.sheetTabsContainer = this.createSheetTabs();
    wrapper.appendChild(this.sheetTabsContainer);
   }

   // Create content area
   this.contentElement = document.createElement('div');
   this.contentElement.className = 'excel-viewer-content';

   // Render current sheet
   this.renderSheet(this.currentSheet);

   wrapper.appendChild(this.contentElement);
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
  * Create formula bar
  */
 private createFormulaBar(): HTMLElement {
  const formulaBar = document.createElement('div');
  formulaBar.className = 'excel-formula-bar';
  formulaBar.innerHTML = `
   <span class="formula-label">fx</span>
   <input type="text" class="formula-input" readonly placeholder="Select a cell to view its content" />
  `;
  return formulaBar;
 }

 /**
  * Create sheet tabs
  */
 private createSheetTabs(): HTMLElement {
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'excel-sheet-tabs';

  if (!this.workbook) return tabsContainer;

  this.workbook.SheetNames.forEach((sheetName, index) => {
   const tab = document.createElement('button');
   tab.className = 'sheet-tab';
   tab.textContent = sheetName;
   tab.dataset.index = String(index);

   if (index === this.currentSheet) {
    tab.classList.add('active');
   }

   tab.addEventListener('click', () => this.switchSheet(index));
   tabsContainer.appendChild(tab);
  });

  return tabsContainer;
 }

 /**
  * Switch to a different sheet
  */
 switchSheet(sheetIndex: number): void {
  if (!this.workbook || sheetIndex < 0 || sheetIndex >= this.workbook.SheetNames.length) {
   return;
  }

  this.currentSheet = sheetIndex;
  this.renderSheet(sheetIndex);

  // Update active tab
  if (this.sheetTabsContainer) {
   const tabs = this.sheetTabsContainer.querySelectorAll('.sheet-tab');
   tabs.forEach((tab, index) => {
    if (index === sheetIndex) {
     tab.classList.add('active');
    } else {
     tab.classList.remove('active');
    }
   });
  }
 }

 /**
  * Render a specific sheet
  */
 private renderSheet(sheetIndex: number): void {
  if (!this.workbook || !this.contentElement) return;

  const sheetName = this.workbook.SheetNames[sheetIndex];
  const worksheet = this.workbook.Sheets[sheetName];

  // Convert sheet to HTML table
  const htmlTable = XLSX.utils.sheet_to_html(worksheet, {
   id: 'excel-table',
   editable: this.options?.excel?.enableEditing ?? false
  });

  // Clear and set content
  this.contentElement.innerHTML = htmlTable;

  // Add grid lines class if enabled
  const table = this.contentElement.querySelector('table');
  if (table) {
   table.className = 'excel-table';
   if (this.options?.excel?.showGridLines !== false) {
    table.classList.add('show-grid-lines');
   }

   // Add cell click handlers for formula bar
   if (this.options?.excel?.showFormulaBar) {
    this.attachCellHandlers(table, worksheet);
   }
  }
 }

 /**
  * Attach click handlers to cells
  */
 private attachCellHandlers(table: HTMLTableElement, worksheet: XLSX.WorkSheet): void {
  const cells = table.querySelectorAll('td');
  const formulaInput = this.container?.querySelector('.formula-input') as HTMLInputElement;

  if (!formulaInput) return;

  cells.forEach((cell, index) => {
   cell.addEventListener('click', () => {
    // Calculate cell address (e.g., A1, B2)
    const row = Math.floor(index / (cells.length / table.rows.length));
    const col = index % (table.rows[0]?.cells.length || 1);
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });

    // Get cell value
    const cellData = worksheet[cellAddress];
    if (cellData) {
     formulaInput.value = cellData.f || cellData.v || '';
    } else {
     formulaInput.value = '';
    }

    // Highlight selected cell
    cells.forEach(c => c.classList.remove('selected'));
    cell.classList.add('selected');
   });
  });
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
  if (!this.workbook) {
   throw new Error('No document loaded');
  }

  const sheetName = this.workbook.SheetNames[this.currentSheet];
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
  if (this.container) {
   this.container.innerHTML = '';
  }
  this.container = null;
  this.contentElement = null;
  this.sheetTabsContainer = null;
  this.workbook = null;
  this.currentData = null;
  this.options = null;
 }
}
