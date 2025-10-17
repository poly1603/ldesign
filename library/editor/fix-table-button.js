/**
 * 修复表格按钮 - 注入网格选择器功能
 * 在浏览器控制台中执行此脚本，或添加到页面中
 */

(function() {
  console.log('🔧 开始修复表格按钮...');
  
  // 表格网格选择器类
  class TableGridSelector {
    constructor(button, onSelect) {
      this.button = button;
      this.onSelect = onSelect;
      this.maxRows = 10;
      this.maxCols = 10;
    }
    
    show() {
      // 移除已存在的选择器
      const existing = document.querySelector('.table-grid-selector');
      if (existing) existing.remove();
      
      // 创建容器
      this.container = document.createElement('div');
      this.container.className = 'table-grid-selector';
      this.container.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 12px;
        z-index: 100000;
      `;
      
      // 添加样式
      if (!document.querySelector('#table-grid-styles')) {
        const style = document.createElement('style');
        style.id = 'table-grid-styles';
        style.textContent = `
          .table-grid-selector {
            animation: fadeIn 0.2s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .grid-cell {
            width: 24px;
            height: 24px;
            background: white;
            border: 1px solid #e0e0e0;
            cursor: pointer;
            transition: all 0.1s;
          }
          .grid-cell.highlighted {
            background: #2196F3;
            border-color: #1976D2;
          }
        `;
        document.head.appendChild(style);
      }
      
      // 标题
      const title = document.createElement('div');
      title.style.cssText = 'font-size: 13px; color: #666; margin-bottom: 8px; text-align: center;';
      title.textContent = '选择表格大小';
      this.container.appendChild(title);
      
      // 网格
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(${this.maxCols}, 1fr);
        gap: 2px;
        background: #f5f5f5;
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 8px;
      `;
      
      // 创建单元格
      this.cells = [];
      for (let r = 0; r < this.maxRows; r++) {
        for (let c = 0; c < this.maxCols; c++) {
          const cell = document.createElement('div');
          cell.className = 'grid-cell';
          cell.dataset.row = r + 1;
          cell.dataset.col = c + 1;
          
          cell.addEventListener('mouseenter', () => {
            this.updateHighlight(r + 1, c + 1);
          });
          
          cell.addEventListener('click', () => {
            this.select(r + 1, c + 1);
          });
          
          this.cells.push(cell);
          grid.appendChild(cell);
        }
      }
      
      grid.addEventListener('mouseleave', () => {
        this.updateHighlight(0, 0);
      });
      
      this.container.appendChild(grid);
      
      // 尺寸显示
      this.sizeDisplay = document.createElement('div');
      this.sizeDisplay.style.cssText = 'text-align: center; font-weight: bold; padding: 6px; background: #f0f0f0; border-radius: 4px;';
      this.sizeDisplay.textContent = '0 × 0';
      this.container.appendChild(this.sizeDisplay);
      
      // 添加到页面
      document.body.appendChild(this.container);
      
      // 定位
      const rect = this.button.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 5;
      
      const containerRect = this.container.getBoundingClientRect();
      if (left + containerRect.width > window.innerWidth - 10) {
        left = window.innerWidth - containerRect.width - 10;
      }
      if (top + containerRect.height > window.innerHeight - 10) {
        top = rect.top - containerRect.height - 5;
      }
      
      this.container.style.left = left + 'px';
      this.container.style.top = top + 'px';
      
      // 点击外部关闭
      setTimeout(() => {
        this.outsideClickHandler = (e) => {
          if (!this.container.contains(e.target) && e.target !== this.button) {
            this.close();
          }
        };
        document.addEventListener('click', this.outsideClickHandler);
      }, 0);
    }
    
    updateHighlight(row, col) {
      this.cells.forEach((cell, idx) => {
        const r = Math.floor(idx / this.maxCols) + 1;
        const c = (idx % this.maxCols) + 1;
        if (r <= row && c <= col) {
          cell.classList.add('highlighted');
        } else {
          cell.classList.remove('highlighted');
        }
      });
      
      this.sizeDisplay.textContent = row > 0 ? `${row} × ${col}` : '0 × 0';
    }
    
    select(row, col) {
      this.close();
      if (this.onSelect) {
        this.onSelect(row, col);
      }
    }
    
    close() {
      if (this.container) {
        this.container.remove();
        if (this.outsideClickHandler) {
          document.removeEventListener('click', this.outsideClickHandler);
        }
      }
    }
  }
  
  // 创建表格函数
  function createTable(rows, cols) {
    const wrapper = document.createElement('div');
    wrapper.style.margin = '10px 0';
    
    const table = document.createElement('table');
    table.style.cssText = 'border-collapse: collapse; width: 100%;';
    
    // 表头
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let j = 0; j < cols; j++) {
      const th = document.createElement('th');
      th.style.cssText = 'border: 1px solid #ddd; padding: 8px; background: #f5f5f5;';
      th.textContent = `列 ${j + 1}`;
      th.contentEditable = 'true';
      headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // 表体
    const tbody = document.createElement('tbody');
    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < cols; j++) {
        const td = document.createElement('td');
        td.style.cssText = 'border: 1px solid #ddd; padding: 8px;';
        td.innerHTML = '&nbsp;';
        td.contentEditable = 'true';
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    
    wrapper.appendChild(table);
    return wrapper;
  }
  
  // 修复所有表格按钮
  function fixTableButtons() {
    const tableButtons = document.querySelectorAll('[data-name="table"], [title*="表格"], button:has([class*="table"])');
    
    tableButtons.forEach(button => {
      // 移除旧的事件监听器
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      // 添加新的点击事件
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('✅ 表格按钮点击 - 显示网格选择器');
        
        const editorContent = document.querySelector('.ldesign-editor-content, [contenteditable="true"]');
        if (!editorContent) {
          console.error('未找到编辑器内容区域');
          return;
        }
        
        // 保存选区
        const selection = window.getSelection();
        let savedRange = null;
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          if (editorContent.contains(range.commonAncestorContainer)) {
            savedRange = range.cloneRange();
          }
        }
        
        // 显示选择器
        const selector = new TableGridSelector(newButton, (rows, cols) => {
          console.log(`插入 ${rows} × ${cols} 表格`);
          
          const table = createTable(rows, cols);
          
          editorContent.focus();
          
          if (savedRange) {
            selection.removeAllRanges();
            selection.addRange(savedRange);
            
            try {
              savedRange.deleteContents();
              savedRange.insertNode(table);
            } catch (e) {
              editorContent.appendChild(table);
            }
          } else {
            editorContent.appendChild(table);
          }
          
          // 添加段落
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          table.parentNode.insertBefore(p, table.nextSibling);
          
          // 触发更新
          const event = new Event('input', { bubbles: true });
          editorContent.dispatchEvent(event);
        });
        
        selector.show();
      });
      
      console.log('✅ 已修复表格按钮:', newButton);
    });
  }
  
  // 立即执行修复
  fixTableButtons();
  
  // 监听动态内容
  const observer = new MutationObserver(() => {
    const tableButtons = document.querySelectorAll('[data-name="table"]');
    tableButtons.forEach(button => {
      if (!button.dataset.fixed) {
        fixTableButtons();
        button.dataset.fixed = 'true';
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('✅ 表格按钮修复完成！');
})();