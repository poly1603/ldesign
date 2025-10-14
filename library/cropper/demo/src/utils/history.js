/**
 * 历史记录管理
 */

export function initHistory() {
  // 历史记录管理已在 main.js 中实现
  // 这里可以添加额外的历史记录功能
  
  // 监听快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Z = 撤销
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault()
      document.getElementById('undo-btn')?.click()
    }
    
    // Ctrl/Cmd + Shift + Z 或 Ctrl/Cmd + Y = 重做
    if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
      e.preventDefault()
      document.getElementById('redo-btn')?.click()
    }
  })
}