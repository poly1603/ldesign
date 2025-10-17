// 注入查找替换对话框功能
(function() {
  console.log('[Inject] Starting find-replace dialog injection...');
  
  // 创建查找替换对话框函数
  window.openFindDialog = function() {
    console.log('[FindDialog] Opening...');
    
    // 获取选中的文本
    const selection = window.getSelection();
    const initialText = selection.toString();
    
    // 移除已存在的对话框
    const existing = document.querySelector('.find-dialog-overlay');
    if (existing) {
      existing.remove();
    }
    
    // 创建对话框
    const overlay = document.createElement('div');
    overlay.className = 'find-dialog-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 90%;
      max-width: 500px;
      animation: slideIn 0.3s ease-out;
    `;
    
    dialog.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; display: flex; align-items: center; gap: 8px;">
            🔍 查找和替换
          </h2>
          <button class="close-btn" style="
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 24px;
            color: #6b7280;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">×</button>
        </div>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">查找内容</label>
          <input type="text" class="find-input" value="${initialText || ''}" placeholder="输入要查找的文本" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">替换为</label>
          <input type="text" class="replace-input" placeholder="输入替换文本" style="
            width: 100%;
            padding: 10px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            box-sizing: border-box;
          ">
        </div>
        
        <div style="margin-bottom: 20px; padding: 12px; background: #f9fafb; border-radius: 6px;">
          <label style="margin-right: 16px; cursor: pointer;">
            <input type="checkbox" class="case-sensitive"> 区分大小写
          </label>
          <label style="margin-right: 16px; cursor: pointer;">
            <input type="checkbox" class="whole-word"> 全字匹配
          </label>
          <label style="cursor: pointer;">
            <input type="checkbox" class="fuzzy-search"> 模糊搜索
          </label>
        </div>
        
        <div class="result-msg" style="
          display: none;
          padding: 10px;
          border-radius: 6px;
          margin-bottom: 16px;
          text-align: center;
          font-size: 14px;
        "></div>
      </div>
      
      <div style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 10px; justify-content: flex-end;">
        <button class="find-btn" style="
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">查找</button>
        <button class="replace-btn" style="
          padding: 10px 20px;
          background: #f59e0b;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">替换</button>
        <button class="replace-all-btn" style="
          padding: 10px 20px;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        ">全部替换</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 添加动画样式
    if (!document.getElementById('find-dialog-styles')) {
      const style = document.createElement('style');
      style.id = 'find-dialog-styles';
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
        .text-highlight {
          background: #fef08a !important;
          padding: 2px;
          border-radius: 2px;
        }
        .text-highlight-current {
          background: #facc15 !important;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }
    
    // 绑定事件
    const closeBtn = dialog.querySelector('.close-btn');
    const findInput = dialog.querySelector('.find-input');
    const replaceInput = dialog.querySelector('.replace-input');
    const findBtn = dialog.querySelector('.find-btn');
    const replaceBtn = dialog.querySelector('.replace-btn');
    const replaceAllBtn = dialog.querySelector('.replace-all-btn');
    const resultMsg = dialog.querySelector('.result-msg');
    
    // 关闭对话框
    const closeDialog = () => {
      overlay.remove();
      // 清除高亮
      clearHighlights();
    };
    
    closeBtn.onclick = closeDialog;
    overlay.onclick = (e) => {
      if (e.target === overlay) closeDialog();
    };
    
    // 显示消息
    const showMsg = (msg, type = 'info') => {
      resultMsg.textContent = msg;
      resultMsg.style.display = 'block';
      resultMsg.style.background = type === 'success' ? '#f0fdf4' : type === 'error' ? '#fee2e2' : '#eff6ff';
      resultMsg.style.color = type === 'success' ? '#16a34a' : type === 'error' ? '#dc2626' : '#2563eb';
      setTimeout(() => {
        resultMsg.style.display = 'none';
      }, 3000);
    };
    
    // 清除高亮
    const clearHighlights = () => {
      const content = document.querySelector('.ldesign-editor-content') || document.querySelector('[contenteditable]');
      if (content) {
        content.querySelectorAll('.text-highlight').forEach(el => {
          const text = el.textContent;
          const textNode = document.createTextNode(text);
          el.parentNode.replaceChild(textNode, el);
        });
      }
    };
    
    // 查找功能
    findBtn.onclick = () => {
      const searchText = findInput.value;
      if (!searchText) {
        showMsg('请输入查找内容', 'error');
        return;
      }
      
      const content = document.querySelector('.ldesign-editor-content') || document.querySelector('[contenteditable]');
      if (!content) {
        showMsg('未找到编辑器内容', 'error');
        return;
      }
      
      // 清除之前的高亮
      clearHighlights();
      
      // 获取选项
      const caseSensitive = dialog.querySelector('.case-sensitive').checked;
      const wholeWord = dialog.querySelector('.whole-word').checked;
      const fuzzySearch = dialog.querySelector('.fuzzy-search').checked;
      
      let pattern;
      if (fuzzySearch) {
        // 模糊搜索：允许字符之间有其他字符
        const fuzzyPattern = searchText.split('').map(c => 
          c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        ).join('.*?');
        pattern = new RegExp(fuzzyPattern, caseSensitive ? 'g' : 'gi');
      } else {
        const escaped = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundary = wholeWord ? '\\b' : '';
        pattern = new RegExp(
          `${wordBoundary}${escaped}${wordBoundary}`,
          caseSensitive ? 'g' : 'gi'
        );
      }
      
      // 递归处理文本节点
      let count = 0;
      const processTextNode = (node) => {
        if (node.nodeType === 3) { // 文本节点
          const text = node.textContent;
          const matches = [...text.matchAll(pattern)];
          if (matches.length > 0) {
            const wrapper = document.createElement('span');
            let lastIndex = 0;
            
            matches.forEach(match => {
              // 添加匹配前的文本
              if (match.index > lastIndex) {
                wrapper.appendChild(document.createTextNode(text.substring(lastIndex, match.index)));
              }
              
              // 添加高亮的匹配文本
              const highlight = document.createElement('span');
              highlight.className = 'text-highlight';
              highlight.textContent = match[0];
              wrapper.appendChild(highlight);
              count++;
              
              lastIndex = match.index + match[0].length;
            });
            
            // 添加剩余文本
            if (lastIndex < text.length) {
              wrapper.appendChild(document.createTextNode(text.substring(lastIndex)));
            }
            
            node.parentNode.replaceChild(wrapper, node);
            
            // 展开wrapper
            while (wrapper.firstChild) {
              wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.parentNode.removeChild(wrapper);
          }
        } else if (node.nodeType === 1 && node.contentEditable !== 'false') {
          // 元素节点，递归处理子节点
          const children = [...node.childNodes];
          children.forEach(child => processTextNode(child));
        }
      };
      
      processTextNode(content);
      
      if (count > 0) {
        showMsg(`找到 ${count} 个匹配项`, 'success');
        // 滚动到第一个匹配
        const firstHighlight = content.querySelector('.text-highlight');
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstHighlight.classList.add('text-highlight-current');
        }
      } else {
        showMsg('未找到匹配项', 'error');
      }
    };
    
    // 替换功能
    replaceBtn.onclick = () => {
      const searchText = findInput.value;
      const replaceText = replaceInput.value || '';
      
      if (!searchText) {
        showMsg('请输入查找内容', 'error');
        return;
      }
      
      const content = document.querySelector('.ldesign-editor-content') || document.querySelector('[contenteditable]');
      if (!content) return;
      
      // 找到第一个高亮的匹配项并替换
      const highlight = content.querySelector('.text-highlight');
      if (highlight) {
        highlight.textContent = replaceText;
        highlight.classList.remove('text-highlight');
        showMsg('替换成功', 'success');
        
        // 移动到下一个匹配项
        const nextHighlight = content.querySelector('.text-highlight');
        if (nextHighlight) {
          nextHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
          nextHighlight.classList.add('text-highlight-current');
        }
      } else {
        // 如果没有高亮，先执行查找
        findBtn.click();
      }
    };
    
    // 全部替换
    replaceAllBtn.onclick = () => {
      const searchText = findInput.value;
      const replaceText = replaceInput.value || '';
      
      if (!searchText) {
        showMsg('请输入查找内容', 'error');
        return;
      }
      
      const content = document.querySelector('.ldesign-editor-content') || document.querySelector('[contenteditable]');
      if (!content) return;
      
      // 统计匹配数量
      const highlights = content.querySelectorAll('.text-highlight');
      const count = highlights.length;
      
      if (count === 0) {
        // 先执行查找
        findBtn.click();
        // 再检查是否有匹配
        const newHighlights = content.querySelectorAll('.text-highlight');
        if (newHighlights.length > 0) {
          if (confirm(`确定要将所有 "${searchText}" (${newHighlights.length}处) 替换为 "${replaceText || '(空)'}" 吗？`)) {
            newHighlights.forEach(highlight => {
              highlight.textContent = replaceText;
              highlight.classList.remove('text-highlight');
            });
            showMsg(`成功替换 ${newHighlights.length} 处`, 'success');
          }
        }
      } else {
        if (confirm(`确定要将所有 "${searchText}" (${count}处) 替换为 "${replaceText || '(空)'}" 吗？`)) {
          highlights.forEach(highlight => {
            highlight.textContent = replaceText;
            highlight.classList.remove('text-highlight');
          });
          showMsg(`成功替换 ${count} 处`, 'success');
        }
      }
    };
    
    // 聚焦到查找输入框
    setTimeout(() => findInput.focus(), 100);
    
    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeDialog();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  };
  
  // 监听键盘快捷键
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
      e.preventDefault();
      window.openFindDialog();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      window.openFindDialog();
    }
  });
  
  // 替换工具栏的查找按钮点击事件
  const checkAndReplaceSearchButton = () => {
    const searchButton = document.querySelector('.ldesign-editor-toolbar-button[data-name="search"]');
    if (searchButton && !searchButton.hasAttribute('data-replaced')) {
      console.log('[Inject] Replacing search button click handler');
      searchButton.setAttribute('data-replaced', 'true');
      searchButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openFindDialog();
      };
      
      // 移除其他事件监听器
      const newSearchButton = searchButton.cloneNode(true);
      newSearchButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openFindDialog();
      };
      searchButton.parentNode.replaceChild(newSearchButton, searchButton);
    }
  };
  
  // 立即检查
  checkAndReplaceSearchButton();
  
  // 延迟检查（等待工具栏加载）
  setTimeout(checkAndReplaceSearchButton, 500);
  setTimeout(checkAndReplaceSearchButton, 1000);
  setTimeout(checkAndReplaceSearchButton, 2000);
  
  console.log('[Inject] Find-replace dialog injection completed!');
  console.log('[Inject] Press Ctrl+F to open the dialog');
})();