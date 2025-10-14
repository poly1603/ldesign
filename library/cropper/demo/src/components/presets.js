/**
 * 预设模板组件
 */

// 重新创建裁剪器函数
function recreateCropper() {
  const currentSrc = window.appState.cropper?.getImageData()?.src || null
  if (currentSrc) {
    window.initCropper(currentSrc)
  }
}

const presets = [
  { name: '自由', ratio: NaN, width: 0, height: 0 },
  { name: '正方形', ratio: 1, width: 500, height: 500 },
  { name: '头像', ratio: 1, width: 200, height: 200 },
  { name: 'Facebook封面', ratio: 2.628, width: 820, height: 312 },
  { name: 'Twitter封面', ratio: 3, width: 1500, height: 500 },
  { name: 'YouTube封面', ratio: 16/9, width: 1280, height: 720 },
  { name: 'Instagram帖子', ratio: 1, width: 1080, height: 1080 },
  { name: 'Instagram故事', ratio: 9/16, width: 1080, height: 1920 },
  { name: '证件照', ratio: 3/4, width: 295, height: 413 },
  { name: '横向A4', ratio: 1.414, width: 2480, height: 1754 },
  { name: '竖向A4', ratio: 0.707, width: 1754, height: 2480 },
  { name: '16:9横屏', ratio: 16/9, width: 1920, height: 1080 }
]

export function initPresets() {
  const container = document.getElementById('preset-templates')
  if (!container) return
  
  container.innerHTML = `<div class="preset-grid" id="preset-grid"></div>`
  
  const grid = document.getElementById('preset-grid')
  
  presets.forEach((preset, index) => {
    const item = document.createElement('div')
    item.className = 'preset-item'
    item.dataset.index = index
    
    item.innerHTML = `
      <div class="preset-name">${preset.name}</div>
      <div class="preset-size">
        ${preset.width > 0 ? `${preset.width}×${preset.height}` : '自定义'}
      </div>
    `
    
    item.addEventListener('click', () => {
      applyPreset(preset)
      
      // 更新选中状态
      document.querySelectorAll('.preset-item').forEach(el => {
        el.classList.remove('active')
      })
      item.classList.add('active')
    })
    
    grid.appendChild(item)
  })
}

async function applyPreset(preset) {
  window.appState.settings.aspectRatio = preset.ratio
  
  if (window.appState.cropper) {
    // 保存当前导出设置
    window.appState.pendingExportSize = {
      width: preset.width > 0 ? preset.width : 800,
      height: preset.height > 0 ? preset.height : 600
    }
    
    // 通过重新创建裁剪器来应用新的宽高比
    recreateCropper()
    
    // 延迟一小段时间确保裁剪器完全初始化
    setTimeout(() => {
      // 更新导出尺寸
      const exportWidth = document.getElementById('export-width')
      const exportHeight = document.getElementById('export-height')
      
      if (exportWidth && exportHeight) {
        if (preset.width > 0 && preset.height > 0) {
          exportWidth.value = preset.width
          exportHeight.value = preset.height
        } else if (!isNaN(preset.ratio)) {
          // 如果没有指定尺寸但有宽高比，根据宽高比计算
          const currentWidth = parseInt(exportWidth.value) || 800
          exportHeight.value = Math.round(currentWidth / preset.ratio)
        }
      }
      
      // 主动触发裁剪框更新
      if (window.appState.cropper && window.appState.cropper.cropBox) {
        const imageData = window.appState.cropper.getImageData()
        if (imageData) {
          // 计算新的裁剪框尺寸
          let width, height
          const containerRect = window.appState.cropper.container.getBoundingClientRect()
          const maxWidth = containerRect.width * 0.8
          const maxHeight = containerRect.height * 0.8
          
          if (!isNaN(preset.ratio)) {
            if (preset.ratio > 1) {
              width = Math.min(maxWidth, imageData.naturalWidth * 0.8)
              height = width / preset.ratio
            } else {
              height = Math.min(maxHeight, imageData.naturalHeight * 0.8)
              width = height * preset.ratio
            }
          } else {
            width = imageData.naturalWidth * 0.8
            height = imageData.naturalHeight * 0.8
          }
          
          // 应用裁剪框数据
          window.appState.cropper.setData({
            left: (containerRect.width - width) / 2,
            top: (containerRect.height - height) / 2,
            width: width,
            height: height
          })
        }
      }
      
      window.showSuccessToast(`已应用模板: ${preset.name}`)
    }, 100)
  }
  
  // 更新宽高比选择器
  const ratioSelect = document.getElementById('aspect-ratio')
  if (ratioSelect) {
    // 查找匹配的选项
    let found = false
    for (let option of ratioSelect.options) {
      if (option.value === 'NaN' && isNaN(preset.ratio)) {
        option.selected = true
        found = true
        break
      } else if (Math.abs(parseFloat(option.value) - preset.ratio) < 0.01) {
        option.selected = true
        found = true
        break
      }
    }
    
    // 如果没找到匹配项，选择自由模式
    if (!found && !isNaN(preset.ratio)) {
      ratioSelect.value = 'NaN'
    }
  }
}