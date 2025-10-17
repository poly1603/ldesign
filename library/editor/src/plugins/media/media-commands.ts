/**
 * 媒体命令插件
 * 注册所有媒体相关的命令
 */

import type { Plugin } from '../../types'

const MediaCommandsPlugin: Plugin = {
  name: 'MediaCommands',
  install(editor: any) {
    // 注册插入图片命令
    editor.commands.register('insertImage', () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e: any) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e: any) => {
            const img = document.createElement('img')
            img.src = e.target.result
            img.style.maxWidth = '100%'
            editor.insertHTML(img.outerHTML)
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
      return true
    })

    // 注册插入视频命令
    editor.commands.register('insertVideo', () => {
      const url = prompt('Enter video URL:')
      if (url) {
        const video = document.createElement('video')
        video.src = url
        video.controls = true
        video.style.maxWidth = '100%'
        editor.insertHTML(video.outerHTML)
      }
      return true
    })

    // 注册插入音频命令
    editor.commands.register('insertAudio', () => {
      const url = prompt('Enter audio URL:')
      if (url) {
        const audio = document.createElement('audio')
        audio.src = url
        audio.controls = true
        editor.insertHTML(audio.outerHTML)
      }
      return true
    })

    // 注册插入表格命令 - 显示网格选择器
    editor.commands.register('insertTable', () => {
      console.log('[MediaCommands] insertTable called - showing grid selector');
      
      // 获取表格按钮
      const tableButton = document.querySelector('[data-name="table"]') as HTMLElement;
      if (!tableButton) {
        console.error('[MediaCommands] Table button not found');
        return false;
      }
      
      // 获取编辑器内容区域
      const editorContent = document.querySelector('.ldesign-editor-content') as HTMLElement;
      if (!editorContent) {
        console.error('[MediaCommands] Editor content not found');
        return false;
      }
      
      // 保存当前选区
      const selection = window.getSelection();
      let savedRange: Range | null = null;
      
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (editorContent.contains(range.commonAncestorContainer)) {
          savedRange = range.cloneRange();
        }
      }
      
      // 移除已存在的选择器
      const existing = document.querySelector('.table-grid-selector');
      if (existing) existing.remove();
      
      // 创建网格选择器
      const selector = document.createElement('div');
      selector.className = 'table-grid-selector';
      selector.style.cssText = `
        position: fixed;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 12px;
        z-index: 999999;
      `;
      
      // 标题
      const title = document.createElement('div');
      title.style.cssText = 'font-size: 13px; color: #666; margin-bottom: 8px; text-align: center;';
      title.textContent = '选择表格大小';
      selector.appendChild(title);
      
      // 网格
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(10, 24px);
        grid-template-rows: repeat(10, 24px);
        gap: 2px;
        background: #f5f5f5;
        padding: 4px;
        border-radius: 4px;
        margin-bottom: 8px;
      `;
      
      // 尺寸显示
      const sizeDisplay = document.createElement('div');
      sizeDisplay.style.cssText = 'text-align: center; font-weight: bold; padding: 6px; background: #f0f0f0; border-radius: 4px;';
      sizeDisplay.textContent = '0 × 0';
      
      // 创建单元格
      const cells: HTMLElement[] = [];
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const cell = document.createElement('div');
          cell.style.cssText = `
            background: white;
            border: 1px solid #e0e0e0;
            cursor: pointer;
            transition: all 0.1s;
          `;
          cell.dataset.row = String(row + 1);
          cell.dataset.col = String(col + 1);
          
          // 鼠标悬停
          cell.addEventListener('mouseenter', () => {
            const r = parseInt(cell.dataset.row!);
            const c = parseInt(cell.dataset.col!);
            
            cells.forEach((cellEl, idx) => {
              const cellRow = Math.floor(idx / 10) + 1;
              const cellCol = (idx % 10) + 1;
              if (cellRow <= r && cellCol <= c) {
                cellEl.style.background = '#2196F3';
                cellEl.style.borderColor = '#1976D2';
              } else {
                cellEl.style.background = 'white';
                cellEl.style.borderColor = '#e0e0e0';
              }
            });
            
            sizeDisplay.textContent = `${r} × ${c}`;
          });
          
          // 点击选择
          cell.addEventListener('click', () => {
            const rows = parseInt(cell.dataset.row!);
            const cols = parseInt(cell.dataset.col!);
            
            console.log(`[MediaCommands] Creating ${rows}×${cols} table`);
            
            // 创建表格
            const table = document.createElement('table');
            table.style.borderCollapse = 'collapse';
            table.style.width = '100%';
            table.style.margin = '10px 0';
            
            // 表头
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            for (let j = 0; j < cols; j++) {
              const th = document.createElement('th');
              th.style.border = '1px solid #ddd';
              th.style.padding = '8px';
              th.style.backgroundColor = '#f5f5f5';
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
                td.style.border = '1px solid #ddd';
                td.style.padding = '8px';
                td.innerHTML = '&nbsp;';
                td.contentEditable = 'true';
                tr.appendChild(td);
              }
              tbody.appendChild(tr);
            }
            table.appendChild(tbody);
            
            // 插入到编辑器
            editorContent.focus();
            
            if (savedRange) {
              selection!.removeAllRanges();
              selection!.addRange(savedRange);
              
              try {
                savedRange.deleteContents();
                savedRange.insertNode(table);
              } catch (error) {
                editorContent.appendChild(table);
              }
            } else {
              editorContent.appendChild(table);
            }
            
            // 添加段落
            const p = document.createElement('p');
            p.innerHTML = '<br>';
            table.parentNode?.insertBefore(p, table.nextSibling);
            
            // 触发更新
            editorContent.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 关闭选择器
            selector.remove();
          });
          
          cells.push(cell);
          grid.appendChild(cell);
        }
      }
      
      // 鼠标离开网格
      grid.addEventListener('mouseleave', () => {
        cells.forEach(cell => {
          cell.style.background = 'white';
          cell.style.borderColor = '#e0e0e0';
        });
        sizeDisplay.textContent = '0 × 0';
      });
      
      selector.appendChild(grid);
      selector.appendChild(sizeDisplay);
      
      // 添加到页面
      document.body.appendChild(selector);
      
      // 定位
      const rect = tableButton.getBoundingClientRect();
      let left = rect.left;
      let top = rect.bottom + 5;
      
      if (left + 268 > window.innerWidth) {
        left = window.innerWidth - 268 - 10;
      }
      if (top + 320 > window.innerHeight) {
        top = rect.top - 320 - 5;
      }
      
      selector.style.left = left + 'px';
      selector.style.top = top + 'px';
      
      // 点击外部关闭
      setTimeout(() => {
        const closeHandler = (e: MouseEvent) => {
          if (!selector.contains(e.target as Node) && e.target !== tableButton) {
            selector.remove();
            document.removeEventListener('click', closeHandler);
          }
        };
        document.addEventListener('click', closeHandler);
      }, 0);
      
      console.log('✅ [MediaCommands] Grid selector displayed');
      return true;
    })

    // 注册插入代码块命令
    editor.commands.register('insertCodeBlock', () => {
      const pre = document.createElement('pre')
      const code = document.createElement('code')
      code.textContent = '// Enter your code here'
      pre.appendChild(code)
      pre.style.background = '#f4f4f4'
      pre.style.padding = '10px'
      pre.style.borderRadius = '4px'
      editor.insertHTML(pre.outerHTML)
      return true
    })

    // 注册插入表情命令
    editor.commands.register('insertEmoji', () => {
      const emojis = ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗']
      const emoji = prompt('Select emoji (1-16):\n' + emojis.map((e, i) => `${i+1}: ${e}`).join(' '))
      if (emoji) {
        const index = parseInt(emoji) - 1
        if (index >= 0 && index < emojis.length) {
          editor.insertHTML(emojis[index])
        }
      }
      return true
    })

    console.log('[MediaCommandsPlugin] All media commands registered')
  }
}

export default MediaCommandsPlugin