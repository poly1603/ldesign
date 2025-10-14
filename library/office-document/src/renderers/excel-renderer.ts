/**
 * Excel Document Renderer
 */

import * as XLSX from 'xlsx';
import { ExcelRenderOptions, RenderResult, DocumentInfo } from '../types';
import { createElement, generateId } from '../utils';

export class ExcelRenderer {
  private container: HTMLElement;
  private options: ExcelRenderOptions;
  private workbook: XLSX.WorkBook | null = null;
  private currentSheet = 0;
  private contentElement: HTMLElement | null = null;

  constructor(container: HTMLElement, options: ExcelRenderOptions) {
    this.container = container;
    this.options = {
      showGridLines: true,
      showHeaders: true,
      editable: false,
      showFormulas: false,
      enableFiltering: true,
      enableSorting: true,
      activeSheet: 0,
      ...options
    };
  }

  async render(data: ArrayBuffer): Promise<RenderResult> {
    try {
      // Parse Excel file
      this.workbook = XLSX.read(data, { type: 'array', cellStyles: true });
      
      // Create viewer
      this.createViewer();

      // Render active sheet
      this.renderSheet(this.options.activeSheet || 0);

      // Call onLoad callback
      if (this.options.onLoad) {
        const docInfo: DocumentInfo = {
          type: 'excel',
          name: 'spreadsheet.xlsx',
          size: data.byteLength,
          metadata: {
            sheetCount: this.workbook.SheetNames.length,
            sheets: this.workbook.SheetNames
          }
        };
        this.options.onLoad(docInfo);
      }

      return this.createRenderResult();
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(error as Error);
      }
      throw error;
    }
  }

  private createViewer(): void {
    // Clear container
    this.container.innerHTML = '';

    // Create wrapper
    const wrapper = createElement('div', {
      className: 'od-excel-viewer',
      id: generateId('excel'),
      style: {
        width: typeof this.options.width === 'number'
          ? `${this.options.width}px`
          : this.options.width || '100%',
        height: typeof this.options.height === 'number'
          ? `${this.options.height}px`
          : this.options.height || '600px',
        display: 'flex',
        flexDirection: 'column'
      }
    });

    // Add toolbar if enabled
    if (this.options.toolbar) {
      const toolbar = this.createToolbar();
      wrapper.appendChild(toolbar);
    }

    // Add sheet tabs
    if (this.workbook && this.workbook.SheetNames.length > 1) {
      const tabs = this.createSheetTabs();
      wrapper.appendChild(tabs);
    }

    // Create content area
    this.contentElement = createElement('div', {
      className: 'od-excel-content',
      style: {
        flex: 1,
        overflow: 'auto',
        backgroundColor: this.options.theme?.background || '#fff',
        padding: '10px'
      }
    });

    wrapper.appendChild(this.contentElement);
    this.container.appendChild(wrapper);
  }

  private createToolbar(): HTMLElement {
    const toolbar = createElement('div', {
      className: 'od-excel-toolbar',
      style: {
        padding: '10px',
        borderBottom: '1px solid #ddd',
        backgroundColor: this.options.theme?.toolbar?.background || '#f5f5f5',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }
    });

    // Add formula bar if editable
    if (this.options.editable) {
      const formulaBar = createElement('input', {
        className: 'od-formula-bar',
        attributes: {
          type: 'text',
          placeholder: 'Formula or value'
        },
        style: {
          flex: 1,
          padding: '5px',
          border: '1px solid #ddd'
        }
      });
      toolbar.appendChild(formulaBar);
    }

    // Add toolbar buttons
    const buttons = [
      { id: 'filter', text: '🔽', title: 'Toggle Filters', action: () => this.toggleFilters() },
      { id: 'sort', text: '↕️', title: 'Sort', action: () => this.showSortOptions() },
      { id: 'formulas', text: 'ƒx', title: 'Show Formulas', action: () => this.toggleFormulas() },
      { id: 'download', text: '💾', title: 'Download', action: () => this.download() }
    ];

    buttons.forEach(btn => {
      const button = createElement('button', {
        className: 'od-toolbar-button',
        textContent: btn.text,
        attributes: { title: btn.title }
      });
      button.onclick = btn.action;
      toolbar.appendChild(button);
    });

    return toolbar;
  }

  private createSheetTabs(): HTMLElement {
    const tabsContainer = createElement('div', {
      className: 'od-sheet-tabs',
      style: {
        display: 'flex',
        gap: '2px',
        padding: '5px',
        backgroundColor: '#f0f0f0',
        borderBottom: '1px solid #ddd',
        overflowX: 'auto'
      }
    });

    this.workbook?.SheetNames.forEach((name, index) => {
      const tab = createElement('button', {
        className: 'od-sheet-tab',
        textContent: name,
        style: {
          padding: '5px 15px',
          border: 'none',
          backgroundColor: index === this.currentSheet ? '#fff' : '#e0e0e0',
          cursor: 'pointer',
          borderRadius: '4px 4px 0 0'
        }
      });

      tab.onclick = () => this.renderSheet(index);
      tabsContainer.appendChild(tab);
    });

    return tabsContainer;
  }

  private renderSheet(sheetIndex: number): void {
    if (!this.workbook || !this.contentElement) return;

    this.currentSheet = sheetIndex;
    const worksheet = this.workbook.Sheets[this.workbook.SheetNames[sheetIndex]];

    // Convert to HTML table
    const htmlTable = XLSX.utils.sheet_to_html(worksheet, {
      editable: this.options.editable,
      header: this.options.showHeaders ? undefined : ''
    });

    // Create table container
    const tableContainer = createElement('div', {
      className: 'od-excel-table-container',
      innerHTML: htmlTable
    });

    // Style the table
    const table = tableContainer.querySelector('table');
    if (table) {
      this.styleTable(table as HTMLTableElement);
    }

    // Clear and append
    this.contentElement.innerHTML = '';
    this.contentElement.appendChild(tableContainer);

    // Update sheet tabs styling
    this.updateSheetTabsStyle();

    // Setup cell editing if enabled
    if (this.options.editable) {
      this.setupCellEditing();
    }

    // Setup filtering if enabled
    if (this.options.enableFiltering) {
      this.setupFiltering();
    }
  }

  private styleTable(table: HTMLTableElement): void {
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.fontFamily = 'Arial, sans-serif';
    table.style.fontSize = '14px';

    // Style cells
    const cells = table.querySelectorAll('td, th');
    cells.forEach((cell) => {
      const cellEl = cell as HTMLElement;
      cellEl.style.border = this.options.showGridLines 
        ? `1px solid ${this.options.theme?.border || '#ddd'}`
        : 'none';
      cellEl.style.padding = '8px';
      cellEl.style.textAlign = 'left';
      
      if (cell.tagName === 'TH') {
        cellEl.style.backgroundColor = this.options.theme?.toolbar?.background || '#f0f0f0';
        cellEl.style.fontWeight = 'bold';
        cellEl.style.position = 'sticky';
        cellEl.style.top = '0';
        cellEl.style.zIndex = '10';
      }
    });

    // Add hover effect
    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      (row as HTMLElement).addEventListener('mouseenter', (e) => {
        if ((e.currentTarget as HTMLElement).querySelector('th')) return;
        (e.currentTarget as HTMLElement).style.backgroundColor = '#f5f5f5';
      });
      (row as HTMLElement).addEventListener('mouseleave', (e) => {
        if ((e.currentTarget as HTMLElement).querySelector('th')) return;
        (e.currentTarget as HTMLElement).style.backgroundColor = '';
      });
    });
  }

  private updateSheetTabsStyle(): void {
    const tabs = this.container.querySelectorAll('.od-sheet-tab');
    tabs.forEach((tab, index) => {
      (tab as HTMLElement).style.backgroundColor = 
        index === this.currentSheet ? '#fff' : '#e0e0e0';
    });
  }

  private setupCellEditing(): void {
    if (!this.contentElement) return;

    const cells = this.contentElement.querySelectorAll('td');
    cells.forEach(cell => {
      (cell as HTMLElement).contentEditable = 'true';
      (cell as HTMLElement).addEventListener('focus', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = '2px solid #4CAF50';
        
        // Update formula bar
        const formulaBar = this.container.querySelector('.od-formula-bar') as HTMLInputElement;
        if (formulaBar) {
          formulaBar.value = target.textContent || '';
        }
      });
      
      (cell as HTMLElement).addEventListener('blur', (e) => {
        const target = e.target as HTMLElement;
        target.style.outline = '';
      });

      (cell as HTMLElement).addEventListener('input', (e) => {
        // Handle cell value changes
        const target = e.target as HTMLElement;
        const formulaBar = this.container.querySelector('.od-formula-bar') as HTMLInputElement;
        if (formulaBar) {
          formulaBar.value = target.textContent || '';
        }
      });
    });
  }

  private setupFiltering(): void {
    if (!this.contentElement) return;

    const table = this.contentElement.querySelector('table');
    if (!table) return;

    const headerRow = table.querySelector('tr');
    if (!headerRow) return;

    const headers = headerRow.querySelectorAll('th');
    headers.forEach((header, index) => {
      const filterButton = createElement('button', {
        className: 'od-filter-button',
        textContent: '▼',
        style: {
          marginLeft: '5px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          fontSize: '10px'
        }
      });

      filterButton.onclick = () => this.showFilterMenu(index);
      header.appendChild(filterButton);
    });
  }

  private showFilterMenu(columnIndex: number): void {
    // Simplified filter menu - in production, this would be more sophisticated
    const filterValue = prompt('Enter filter value:');
    if (!filterValue) return;

    const table = this.contentElement?.querySelector('table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach((row, rowIndex) => {
      if (rowIndex === 0) return; // Skip header row

      const cells = row.querySelectorAll('td');
      const cell = cells[columnIndex];
      
      if (cell) {
        const cellText = (cell.textContent || '').toLowerCase();
        const shouldShow = cellText.includes(filterValue.toLowerCase());
        (row as HTMLElement).style.display = shouldShow ? '' : 'none';
      }
    });
  }

  private toggleFilters(): void {
    const filterButtons = this.container.querySelectorAll('.od-filter-button');
    filterButtons.forEach(button => {
      (button as HTMLElement).style.display = 
        (button as HTMLElement).style.display === 'none' ? '' : 'none';
    });
  }

  private toggleFormulas(): void {
    this.options.showFormulas = !this.options.showFormulas;
    // Re-render current sheet with formula display toggled
    this.renderSheet(this.currentSheet);
  }

  private showSortOptions(): void {
    // Simplified sort - in production, this would be more sophisticated
    const columnIndex = parseInt(prompt('Enter column number to sort (0-based):') || '0');
    this.sortTable(columnIndex);
  }

  private sortTable(columnIndex: number): void {
    const table = this.contentElement?.querySelector('table');
    if (!table) return;

    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr')).slice(1); // Skip header

    rows.sort((a, b) => {
      const aCell = a.querySelectorAll('td')[columnIndex];
      const bCell = b.querySelectorAll('td')[columnIndex];
      
      if (!aCell || !bCell) return 0;
      
      const aText = aCell.textContent || '';
      const bText = bCell.textContent || '';
      
      // Try to parse as numbers
      const aNum = parseFloat(aText);
      const bNum = parseFloat(bText);
      
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      
      return aText.localeCompare(bText);
    });

    // Re-append sorted rows
    rows.forEach(row => tbody.appendChild(row));
  }

  private download(): void {
    if (!this.workbook) return;

    // Create a new workbook with current edits
    const newWb = XLSX.utils.book_new();
    
    this.workbook.SheetNames.forEach(name => {
      XLSX.utils.book_append_sheet(newWb, this.workbook!.Sheets[name], name);
    });

    // Generate file and download
    XLSX.writeFile(newWb, 'edited_spreadsheet.xlsx');
  }

  private createRenderResult(): RenderResult {
    return {
      destroy: () => this.destroy(),
      refresh: () => this.refresh(),
      goToPage: (page: number) => this.goToSheet(page),
      setZoom: (zoom: number) => this.setZoom(zoom),
      getCurrentPage: () => this.currentSheet,
      getTotalPages: () => this.workbook?.SheetNames.length || 0,
      download: () => this.download()
    };
  }

  private destroy(): void {
    this.container.innerHTML = '';
    this.workbook = null;
    this.contentElement = null;
  }

  private refresh(): void {
    if (this.workbook) {
      this.renderSheet(this.currentSheet);
    }
  }

  private goToSheet(sheetIndex: number): void {
    if (!this.workbook) return;
    
    if (sheetIndex >= 0 && sheetIndex < this.workbook.SheetNames.length) {
      this.renderSheet(sheetIndex);
    }
  }

  private setZoom(zoom: number): void {
    if (this.contentElement) {
      const table = this.contentElement.querySelector('table');
      if (table) {
        (table as HTMLElement).style.transform = `scale(${zoom / 100})`;
        (table as HTMLElement).style.transformOrigin = 'top left';
      }
    }

    if (this.options.onZoomChange) {
      this.options.onZoomChange(zoom);
    }
  }
}