/**
 * 预设模板组件
 */

// 内置的预设模板ID映射
const presetMapping = {
  '自由': 'free',
  '正方形': 'square',
  '头像': 'avatar-profile',
  'Facebook封面': 'facebook-cover',
  'Twitter封面': 'twitter-header',
  'YouTube封面': 'youtube-thumbnail',
  'Instagram帖子': 'instagram-post',
  'Instagram故事': 'instagram-story',
  '证件照': 'passport-photo',
  '横向A4': 'a4-landscape',
  '竖向A4': 'a4-portrait',
  '16:9横屏': 'landscape-16-9',
  'Facebook帖子': 'facebook-post',
  'LinkedIn封面': 'linkedin-cover'
}

const presets = [
  { name: '自由', ratio: NaN, width: 0, height: 0 },
  { name: '正方形', ratio: 1, width: 500, height: 500 },
  { name: '头像', ratio: 1, width: 200, height: 200 },
  { name: 'Facebook封面', ratio: 2.628, width: 1640, height: 859 },
  { name: 'Facebook帖子', ratio: 1.905, width: 1200, height: 630 },
  { name: 'Twitter封面', ratio: 3, width: 1500, height: 500 },
  { name: 'YouTube封面', ratio: 16/9, width: 1280, height: 720 },
  { name: 'Instagram帖子', ratio: 1, width: 1080, height: 1080 },
  { name: 'Instagram故事', ratio: 9/16, width: 1080, height: 1920 },
  { name: 'LinkedIn封面', ratio: 4, width: 1584, height: 396 },
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
  if (!window.appState.cropper) {
    window.showErrorToast('请先加载图片')
    return
  }
  
  // 首先尝试使用内置的 PresetManager
  const presetManager = window.appState.cropper.getPresetManager()
  const presetId = presetMapping[preset.name]
  
  if (presetManager && presetId) {
    // 使用内置的PresetManager应用预设
    const success = presetManager.applyPreset(presetId)
    
    if (success) {
      // 更新导出尺寸
      updateExportDimensions(preset)
      window.showSuccessToast(`已应用模板: ${preset.name}`)
    } else {
      // 如果内置预设失败，使用自定义逻辑
      applyCustomPreset(preset)
    }
  } else {
    // 如果没有PresetManager或找不到对应预设，使用自定义逻辑
    applyCustomPreset(preset)
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

function applyCustomPreset(preset) {
  const containerData = window.appState.cropper.getContainerData()
  const imageData = window.appState.cropper.getImageData()
  
  if (!containerData || !imageData) return
  
  // Calculate the target aspect ratio
  const targetAspectRatio = preset.ratio || (preset.width && preset.height ? preset.width / preset.height : NaN)
  
  // Clear existing aspect ratio first
  window.appState.cropper.setAspectRatio(NaN)
  
  // Calculate optimal crop box dimensions
  let cropWidth, cropHeight
  const maxWidth = Math.min(containerData.width * 0.85, imageData.width * 0.85)
  const maxHeight = Math.min(containerData.height * 0.85, imageData.height * 0.85)
  
  if (!isNaN(targetAspectRatio)) {
    const containerAspect = containerData.width / containerData.height
    
    if (targetAspectRatio > 1) {
      // Landscape
      if (targetAspectRatio > containerAspect) {
        cropWidth = maxWidth
        cropHeight = cropWidth / targetAspectRatio
      } else {
        cropHeight = maxHeight
        cropWidth = cropHeight * targetAspectRatio
      }
    } else if (targetAspectRatio < 1) {
      // Portrait
      if (1 / targetAspectRatio > containerData.height / containerData.width) {
        cropHeight = maxHeight
        cropWidth = cropHeight * targetAspectRatio
      } else {
        cropWidth = maxWidth
        cropHeight = cropWidth / targetAspectRatio
      }
    } else {
      // Square
      const size = Math.min(maxWidth, maxHeight)
      cropWidth = size
      cropHeight = size
    }
    
    // Final size check
    if (cropWidth > maxWidth) {
      cropWidth = maxWidth
      cropHeight = cropWidth / targetAspectRatio
    }
    if (cropHeight > maxHeight) {
      cropHeight = maxHeight
      cropWidth = cropHeight * targetAspectRatio
    }
  } else {
    // No aspect ratio
    const currentCrop = window.appState.cropper.getCropBoxData()
    cropWidth = currentCrop?.width || containerData.width * 0.5
    cropHeight = currentCrop?.height || containerData.height * 0.5
  }
  
  // Center the crop box
  const cropLeft = (containerData.width - cropWidth) / 2
  const cropTop = (containerData.height - cropHeight) / 2
  
  // Apply crop box settings
  window.appState.cropper.setCropBoxData({
    left: cropLeft,
    top: cropTop,
    width: cropWidth,
    height: cropHeight
  })
  
  // Set aspect ratio lock
  if (!isNaN(targetAspectRatio)) {
    window.appState.cropper.setAspectRatio(targetAspectRatio)
  }
  
  // Update export dimensions
  updateExportDimensions(preset)
  
  window.showSuccessToast(`已应用模板: ${preset.name}`)
}

function updateExportDimensions(preset) {
  const exportWidth = document.getElementById('export-width')
  const exportHeight = document.getElementById('export-height')
  
  if (exportWidth && exportHeight) {
    if (preset.width > 0 && preset.height > 0) {
      exportWidth.value = preset.width
      exportHeight.value = preset.height
    } else if (!isNaN(preset.ratio)) {
      // Calculate based on aspect ratio
      const cropData = window.appState.cropper.getCropBoxData()
      if (cropData) {
        // Use actual crop box dimensions as base
        const scale = 1000 / Math.max(cropData.width, cropData.height)
        exportWidth.value = Math.round(cropData.width * scale)
        exportHeight.value = Math.round(cropData.height * scale)
      } else {
        // Fallback to default
        const currentWidth = parseInt(exportWidth.value) || 800
        exportHeight.value = Math.round(currentWidth / preset.ratio)
      }
    }
  }
}
