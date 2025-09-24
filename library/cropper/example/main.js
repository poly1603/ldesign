/**
 * @ldesign/cropper 示例应用
 * 展示如何使用图片裁剪器
 */

import { Cropper } from '../src/index.ts'
import '../src/style.less'

// 全局变量
let cropper = null

/**
 * 初始化裁剪器
 * @param {HTMLImageElement} imageElement 图片元素
 */
function initCropper(imageElement) {
  // 销毁现有的裁剪器
  if (cropper) {
    cropper.destroy()
  }

  // 创建新的裁剪器实例
  cropper = new Cropper(imageElement, {
    container: imageElement.parentElement,
    template: `
      <cropper-canvas background>
        <cropper-image rotatable scalable translatable></cropper-image>
        <cropper-shade hidden></cropper-shade>
        <cropper-handle action="select" plain></cropper-handle>
        <cropper-selection initial-coverage="0.5" movable resizable keyboard>
          <cropper-grid role="grid" bordered covered></cropper-grid>
          <cropper-crosshair centered></cropper-crosshair>
          <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
          <cropper-handle action="n-resize"></cropper-handle>
          <cropper-handle action="e-resize"></cropper-handle>
          <cropper-handle action="s-resize"></cropper-handle>
          <cropper-handle action="w-resize"></cropper-handle>
          <cropper-handle action="ne-resize"></cropper-handle>
          <cropper-handle action="nw-resize"></cropper-handle>
          <cropper-handle action="se-resize"></cropper-handle>
          <cropper-handle action="sw-resize"></cropper-handle>
        </cropper-selection>
      </cropper-canvas>
    `
  })

  console.log('裁剪器已初始化:', cropper)
}

/**
 * 裁剪图片
 */
function cropImage() {
  if (!cropper) {
    alert('请先选择一张图片')
    return
  }

  try {
    // 获取裁剪数据
    const data = cropper.getData()
    console.log('裁剪数据:', data)

    if (!data || data.width === 0 || data.height === 0) {
      alert('请先选择要裁剪的区域')
      return
    }

    // 获取裁剪后的画布
    cropper.getCroppedCanvas({
      width: Math.round(data.width),
      height: Math.round(data.height)
    }).then(canvas => {
      // 显示结果
      const resultDiv = document.getElementById('result')
      const containerDiv = document.getElementById('croppedImageContainer')
      const infoDiv = document.getElementById('cropInfo')

      // 清空之前的结果
      containerDiv.innerHTML = ''
      
      // 添加裁剪后的画布
      containerDiv.appendChild(canvas)
      
      // 显示裁剪信息
      infoDiv.innerHTML = `
        <p>裁剪区域: x=${Math.round(data.x)}, y=${Math.round(data.y)}</p>
        <p>裁剪尺寸: ${Math.round(data.width)} × ${Math.round(data.height)} 像素</p>
        <p>文件大小: ${(canvas.toDataURL().length * 0.75 / 1024).toFixed(2)} KB</p>
      `
      
      // 显示结果区域
      resultDiv.style.display = 'block'
      
      console.log('裁剪完成')
    }).catch(error => {
      console.error('裁剪失败:', error)
      alert('裁剪失败: ' + error.message)
    })
  } catch (error) {
    console.error('裁剪过程中出错:', error)
    alert('裁剪过程中出错: ' + error.message)
  }
}

/**
 * 重置裁剪器
 */
function resetCropper() {
  if (cropper) {
    cropper.reset()
    console.log('裁剪器已重置')
  }
}

/**
 * 清除选择区域
 */
function clearSelection() {
  if (cropper) {
    cropper.clear()
    console.log('选择区域已清除')
  }
}

/**
 * 处理文件选择
 * @param {Event} event 文件选择事件
 */
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 创建文件读取器
  const reader = new FileReader()
  reader.onload = function(e) {
    const imageElement = document.getElementById('image')
    imageElement.src = e.target.result
    
    // 等待图片加载完成后初始化裁剪器
    imageElement.onload = function() {
      initCropper(imageElement)
    }
  }
  reader.readAsDataURL(file)
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('@ldesign/cropper 示例应用已启动')
  
  // 绑定文件选择事件
  const imageInput = document.getElementById('imageInput')
  imageInput.addEventListener('change', handleFileSelect)
  
  // 初始化默认图片的裁剪器
  const imageElement = document.getElementById('image')
  imageElement.onload = function() {
    initCropper(imageElement)
  }
  
  // 如果图片已经加载完成，直接初始化
  if (imageElement.complete) {
    initCropper(imageElement)
  }
})

// 将函数暴露到全局作用域，供 HTML 中的按钮调用
window.cropImage = cropImage
window.resetCropper = resetCropper
window.clearSelection = clearSelection

// 添加键盘快捷键支持
document.addEventListener('keydown', function(event) {
  if (!cropper) return
  
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      cropImage()
      break
    case 'Escape':
      event.preventDefault()
      clearSelection()
      break
    case 'r':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        resetCropper()
      }
      break
  }
})

console.log('示例应用脚本已加载')
