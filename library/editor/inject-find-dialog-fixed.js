// 增强型查找替换对话框 - 修复批量替换问题
(function() {
  console.log('[FindReplace] Injecting fixed enhanced find and replace dialog...');
  
  // 创建对话框函数
  window.openEnhancedFindDialog = function(editor) {
    console.log('[FindReplace] Opening fixed enhanced find dialog');
    
    // 移除已存在的对话框
    const existing = document.getElementById('enhanced-find-dialog');
    if (existing) {
      existing.remove();
    }
    
    // 创建对话框容器
    const dialog = document.createElement('div');
    dialog.id = 'enhanced-find-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      width: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      animation: slideIn 0.2s ease-out;
    `;
    
    // 添加动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      #enhanced-find-dialog input:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      
      #enhanced-find-dialog button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      #enhanced-find-dialog button:active {
        transform: translateY(0);
      }
      
      .editor-highlight {
        background: #fef08a !important;
        padding: 1px 2px;
        border-radius: 2px;
      }
      
      .editor-highlight-current {
        background: #facc15 !important;
      }
    `;
    document.head.appendChild(style);
    
    // 对话框内容
    dialog.innerHTML = `
      <div style="padding: 20px 24px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h3 style="margin: 0; font-size: 18px; color: #111827; display: flex; align-items: center; gap: 8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            查找和替换
          </h3>
          <button id="close-dialog" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.2s;
          " onmouseover="this.style.background='#f3f4f6'" onmouseout="this.style.background='none'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; color: #374151; font-size: 14px; font-weight: 500;">
            查找内容
          </label>
          <input type="text" id="find-input" placeholder="输入要查找的文本" style="
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 24px;">
          <label style="display: block; margin-bottom: 8px; color: #374151; font-size: 14px; font-weight: 500;">
            替换为
          </label>
          <input type="text" id="replace-input" placeholder="输入替换文本" style="
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #374151; font-size: 14px;">
            <input type="checkbox" id="case-sensitive" style="
              width: 16px;
              height: 16px;
              cursor: pointer;
            ">
            <span>区分大小写</span>
          </label>
        </div>
        
        <div id="match-info" style="
          padding: 12px;
          background: #f3f4f6;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
          color: #6b7280;
          display: none;
        "></div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button id="find-btn" style="
            padding: 10px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">
            查找全部
          </button>
          
          <button id="replace-btn" style="
            padding: 10px 16px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          ">
            替换全部
          </button>
        </div>
        
        <div style="margin-top: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button id="prev-btn" style="
            padding: 10px 16px;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: none;
          ">
            上一个
          </button>
          
          <button id="next-btn" style="
            padding: 10px 16px;
            background: #f3f4f6;
            color: #374151;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            display: none;
          ">
            下一个
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // 获取元素
    const findInput = document.getElementById('find-input');
    const replaceInput = document.getElementById('replace-input');
    const caseSensitive = document.getElementById('case-sensitive');
    const findBtn = document.getElementById('find-btn');
    const replaceBtn = document.getElementById('replace-btn');
    const closeBtn = document.getElementById('close-dialog');
    const matchInfo = document.getElementById('match-info');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    // 自动聚焦
    setTimeout(() => findInput.focus(), 100);
    
    // 状态
    let currentHighlights = [];
    let currentIndex = 0;
    
    // 清除高亮
    function clearHighlights() {
      document.querySelectorAll('.editor-highlight').forEach(el => {
        const parent = el.parentNode;
        if (parent) {
          const text = el.textContent;
          const textNode = document.createTextNode(text);
          parent.replaceChild(textNode, el);
        }
      });
      currentHighlights = [];
      currentIndex = 0;
    }
    
    // 查找并高亮
    function findAndHighlight(actionType = 'find') {
      clearHighlights();
      
      const findText = findInput.value;
      const replaceText = replaceInput.value;
      
      if (!findText) {
        alert('请输入查找内容');
        return;
      }
      
      // 获取编辑器内容区域
      const content = editor?.contentElement || document.querySelector('.editor-content') || document.querySelector('[contenteditable="true"]') || document.body;
      
      // 创建正则表达式
      const flags = caseSensitive.checked ? 'g' : 'gi';
      const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      
      // 递归处理节点
      let count = 0;
      
      function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || '';
          const matches = Array.from(text.matchAll(regex));
          
          if (matches.length > 0) {
            const parent = node.parentNode;
            if (!parent) return;
            
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            matches.forEach(m => {
              const matchIndex = m.index || 0;
              const matchText = m[0];
              
              // 添加匹配前的文本
              if (matchIndex > lastIndex) {
                fragment.appendChild(
                  document.createTextNode(text.substring(lastIndex, matchIndex))
                );
              }
              
              // 添加高亮的匹配文本
              const highlight = document.createElement('span');
              highlight.className = 'editor-highlight';
              highlight.textContent = matchText;
              fragment.appendChild(highlight);
              
              count++;
              lastIndex = matchIndex + matchText.length;
            });
            
            // 添加剩余文本
            if (lastIndex < text.length) {
              fragment.appendChild(
                document.createTextNode(text.substring(lastIndex))
              );
            }
            
            // 替换原节点
            parent.replaceChild(fragment, node);
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // 跳过某些元素
          const tagName = node.tagName?.toLowerCase();
          if (tagName === 'script' || tagName === 'style' || tagName === 'noscript') {
            return;
          }
          // 递归处理子节点
          const children = Array.from(node.childNodes);
          children.forEach(child => processNode(child));
        }
      }
      
      // 开始处理
      processNode(content);
      
      console.log('[FindReplace] Found matches:', count);
      
      // 更新高亮列表
      currentHighlights = Array.from(content.querySelectorAll('.editor-highlight'));
      
      if (count > 0) {
        // 显示匹配信息
        matchInfo.style.display = 'block';
        matchInfo.textContent = `找到 ${count} 个匹配项`;
        
        // 显示导航按钮
        if (count > 1) {
          prevBtn.style.display = 'block';
          nextBtn.style.display = 'block';
        }
        
        // 滚动到第一个匹配项
        if (currentHighlights.length > 0) {
          currentIndex = 0;
          currentHighlights[0].classList.add('editor-highlight-current');
          currentHighlights[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // 如果是替换操作
        if (actionType === 'replaceAll') {
          if (!replaceText && replaceText !== '') {
            alert('请输入替换文本');
            return;
          }
          
          if (confirm(`确定要将 ${count} 处 "${findText}" 替换为 "${replaceText || '(空)'}" 吗？`)) {
            // 收集所有需要替换的节点组（处理连续的高亮节点）
            const nodeGroups = [];
            const processedNodes = new Set();
            
            currentHighlights.forEach(el => {
              if (processedNodes.has(el)) {
                return;
              }
              
              // 收集连续的高亮节点
              const group = [el];
              processedNodes.add(el);
              
              // 检查后续兄弟节点是否也是高亮节点
              let nextSibling = el.nextSibling;
              while (nextSibling) {
                if (nextSibling.nodeType === Node.ELEMENT_NODE && 
                    nextSibling.classList && 
                    nextSibling.classList.contains('editor-highlight') &&
                    !processedNodes.has(nextSibling)) {
                  group.push(nextSibling);
                  processedNodes.add(nextSibling);
                  nextSibling = nextSibling.nextSibling;
                } else if (nextSibling.nodeType === Node.TEXT_NODE && 
                          !nextSibling.textContent?.trim()) {
                  // 跳过空白文本节点
                  nextSibling = nextSibling.nextSibling;
                } else {
                  break;
                }
              }
              
              nodeGroups.push({
                elements: group,
                parent: el.parentNode
              });
            });
            
            // 执行替换
            let replacedCount = 0;
            nodeGroups.forEach(({elements, parent}) => {
              try {
                // 获取组中所有文本
                const fullText = elements.map(el => el.textContent || '').join('');
                console.log(`[Replace] Replacing "${fullText}" with "${replaceText}"`);
                
                // 创建替换文本节点
                const newTextNode = document.createTextNode(replaceText);
                
                // 替换第一个节点
                parent.replaceChild(newTextNode, elements[0]);
                
                // 删除其余节点
                for (let i = 1; i < elements.length; i++) {
                  if (elements[i].parentNode) {
                    elements[i].remove();
                  }
                }
                
                replacedCount++;
              } catch (e) {
                console.error('替换失败:', e);
              }
            });
            
            // 清除高亮状态
            clearHighlights();
            
            // 显示成功消息
            matchInfo.style.display = 'block';
            matchInfo.style.background = '#d1fae5';
            matchInfo.style.color = '#065f46';
            matchInfo.textContent = `成功替换 ${replacedCount} 处`;
            
            // 隐藏导航按钮
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            
            console.log(`替换完成: 总计${count}处, 实际替换${replacedCount}处`);
          }
        }
      } else {
        matchInfo.style.display = 'block';
        matchInfo.style.background = '#fee2e2';
        matchInfo.style.color = '#991b1b';
        matchInfo.textContent = `未找到 "${findText}"`;
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
      }
    }
    
    // 导航到上一个/下一个
    function navigateHighlight(direction) {
      if (currentHighlights.length === 0) return;
      
      // 移除当前高亮
      currentHighlights[currentIndex].classList.remove('editor-highlight-current');
      
      // 更新索引
      if (direction === 'next') {
        currentIndex = (currentIndex + 1) % currentHighlights.length;
      } else {
        currentIndex = (currentIndex - 1 + currentHighlights.length) % currentHighlights.length;
      }
      
      // 添加新高亮
      currentHighlights[currentIndex].classList.add('editor-highlight-current');
      currentHighlights[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // 更新信息
      matchInfo.textContent = `第 ${currentIndex + 1} / ${currentHighlights.length} 个匹配项`;
    }
    
    // 绑定事件
    findBtn.addEventListener('click', () => findAndHighlight('find'));
    replaceBtn.addEventListener('click', () => findAndHighlight('replaceAll'));
    prevBtn.addEventListener('click', () => navigateHighlight('prev'));
    nextBtn.addEventListener('click', () => navigateHighlight('next'));
    
    closeBtn.addEventListener('click', () => {
      clearHighlights();
      dialog.remove();
    });
    
    // Enter键查找
    findInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey && currentHighlights.length > 0) {
          navigateHighlight('prev');
        } else if (currentHighlights.length > 0) {
          navigateHighlight('next');
        } else {
          findAndHighlight('find');
        }
      }
    });
    
    // Esc键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.getElementById('enhanced-find-dialog')) {
        clearHighlights();
        dialog.remove();
      }
    });
  };
  
  // 覆盖快捷键
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'f' || e.metaKey && e.key === 'f') {
      e.preventDefault();
      e.stopPropagation();
      const editor = window.editor || document.querySelector('.editor-instance');
      window.openEnhancedFindDialog(editor);
    }
  }, true);
  
  // 查找并替换工具栏按钮
  setTimeout(() => {
    const searchButton = document.querySelector('[data-command="search"], [title*="查找"], [title*="搜索"], [aria-label*="search"], .toolbar-item-search');
    
    if (searchButton) {
      console.log('[FindReplace] Found search button, replacing handler');
      
      // 移除旧的事件监听器
      const newButton = searchButton.cloneNode(true);
      searchButton.parentNode.replaceChild(newButton, searchButton);
      
      // 添加新的点击处理
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const editor = window.editor || document.querySelector('.editor-instance');
        window.openEnhancedFindDialog(editor);
      });
      
      console.log('[FindReplace] Search button handler replaced');
    } else {
      console.log('[FindReplace] Search button not found, retrying in 2 seconds...');
      setTimeout(arguments.callee, 2000);
    }
  }, 1000);
  
  console.log('[FindReplace] Fixed enhanced find and replace dialog injected successfully!');
  console.log('[FindReplace] Press Ctrl+F (or Cmd+F on Mac) to open the dialog');
})();