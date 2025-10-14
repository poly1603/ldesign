/**
 * 键盘快捷键管理
 */

export function initKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!window.appState.cropper) return
    
    // 防止在输入框中触发快捷键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }
    
    // R = 重置
    if (e.key === 'r' || e.key === 'R') {
      e.preventDefault()
      window.appState.cropper.reset()
      window.showToast('已重置')
    }
    
    // C = 清除裁剪框
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault()
      window.appState.cropper.clear()
      window.showToast('已清除裁剪框')
    }
    
    // 方向键移动图片
    const moveStep = e.shiftKey ? 10 : 1 // Shift加速移动
    
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      window.appState.cropper.move(-moveStep, 0)
    }
    
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      window.appState.cropper.move(moveStep, 0)
    }
    
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      window.appState.cropper.move(0, -moveStep)
    }
    
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      window.appState.cropper.move(0, moveStep)
    }
    
    // + 或 = 放大
    if (e.key === '+' || e.key === '=') {
      e.preventDefault()
      const imageData = window.appState.cropper.getImageData()
      if (imageData) {
        window.appState.cropper.scale(imageData.scaleX * 1.1, imageData.scaleY * 1.1)
      }
    }
    
    // - 或 _ 缩小
    if (e.key === '-' || e.key === '_') {
      e.preventDefault()
      const imageData = window.appState.cropper.getImageData()
      if (imageData) {
        window.appState.cropper.scale(imageData.scaleX * 0.9, imageData.scaleY * 0.9)
      }
    }
    
    // [ 向左旋转
    if (e.key === '[') {
      e.preventDefault()
      window.appState.cropper.rotate(-90)
    }
    
    // ] 向右旋转
    if (e.key === ']') {
      e.preventDefault()
      window.appState.cropper.rotate(90)
    }
    
    // H 水平翻转
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault()
      const data = window.appState.cropper.getData()
      window.appState.cropper.scaleX(-data.scaleX)
    }
    
    // V 垂直翻转
    if (e.key === 'v' || e.key === 'V') {
      e.preventDefault()
      const data = window.appState.cropper.getData()
      window.appState.cropper.scaleY(-data.scaleY)
    }
    
    // Space 切换拖拽模式
    if (e.key === ' ') {
      e.preventDefault()
      const currentMode = window.appState.settings.dragMode
      const newMode = currentMode === 'crop' ? 'move' : 'crop'
      window.appState.settings.dragMode = newMode
      window.appState.cropper.setDragMode(newMode)
      window.showToast(`拖拽模式: ${newMode === 'crop' ? '裁剪' : '移动'}`)
    }
    
    // Enter 或 Ctrl/Cmd + S 导出
    if (e.key === 'Enter' || ((e.ctrlKey || e.metaKey) && e.key === 's')) {
      e.preventDefault()
      document.getElementById('export-image')?.click()
    }
    
    // Escape 退出全屏
    if (e.key === 'Escape') {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      }
    }
  })
  
  // 显示快捷键提示
  showKeyboardShortcuts()
}

function showKeyboardShortcuts() {
  // 可以在界面上添加一个帮助按钮显示快捷键列表
  console.log(`
    键盘快捷键：
    ============
    R - 重置
    C - 清除裁剪框
    方向键 - 移动图片
    Shift + 方向键 - 快速移动
    +/= - 放大
    -/_ - 缩小
    [ - 向左旋转90°
    ] - 向右旋转90°
    H - 水平翻转
    V - 垂直翻转
    空格 - 切换拖拽模式
    Enter - 导出图片
    Ctrl/Cmd + Z - 撤销
    Ctrl/Cmd + Shift + Z - 重做
    Ctrl/Cmd + S - 保存导出
  `)
}