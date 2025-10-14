/**
 * 滤镜效果组件
 */

const filters = [
  { name: '亮度', id: 'brightness', min: 0, max: 200, default: 100, unit: '%' },
  { name: '对比度', id: 'contrast', min: 0, max: 200, default: 100, unit: '%' },
  { name: '饱和度', id: 'saturate', min: 0, max: 200, default: 100, unit: '%' },
  { name: '灰度', id: 'grayscale', min: 0, max: 100, default: 0, unit: '%' },
  { name: '褐色', id: 'sepia', min: 0, max: 100, default: 0, unit: '%' },
  { name: '色相旋转', id: 'hue-rotate', min: 0, max: 360, default: 0, unit: 'deg' },
  { name: '模糊', id: 'blur', min: 0, max: 20, default: 0, unit: 'px' },
  { name: '反色', id: 'invert', min: 0, max: 100, default: 0, unit: '%' }
]

export function initFilters() {
  const container = document.getElementById('filter-controls')
  if (!container) return
  
  let filtersHTML = ''
  
  filters.forEach(filter => {
    filtersHTML += `
      <div class="slider-group">
        <div class="slider-header">
          <span class="slider-label">${filter.name}</span>
          <span class="slider-value" id="${filter.id}-value">
            ${filter.default}${filter.unit}
          </span>
        </div>
        <input type="range" class="slider filter-slider" 
          id="${filter.id}-slider"
          data-filter="${filter.id}"
          data-unit="${filter.unit}"
          min="${filter.min}" 
          max="${filter.max}" 
          value="${filter.default}"
          step="1">
      </div>
    `
  })
  
  // 添加重置按钮
  filtersHTML += `
    <button class="btn btn-ghost" id="reset-filters" style="width: 100%; margin-top: 10px;">
      <i>🔄</i> 重置所有滤镜
    </button>
  `
  
  container.innerHTML = filtersHTML
  
  bindFilterEvents()
}

function bindFilterEvents() {
  // 绑定每个滤镜滑块
  document.querySelectorAll('.filter-slider').forEach(slider => {
    slider.addEventListener('input', handleFilterChange)
  })
  
  // 绑定重置按钮
  document.getElementById('reset-filters')?.addEventListener('click', resetFilters)
}

function handleFilterChange(e) {
  const slider = e.target
  const filterId = slider.dataset.filter
  const unit = slider.dataset.unit
  const value = parseInt(slider.value)
  
  // 更新显示值
  const valueDisplay = document.getElementById(`${filterId}-value`)
  if (valueDisplay) {
    valueDisplay.textContent = `${value}${unit}`
  }
  
  // 更新状态
  window.appState.filters[filterId.replace('-', '')] = value
  
  // 应用滤镜
  applyFilters()
}

function applyFilters() {
  const canvas = document.querySelector('.cropper-canvas')
  if (!canvas) return
  
  const filters = window.appState.filters
  const filterString = `
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
    saturate(${filters.saturate}%)
    grayscale(${filters.grayscale}%)
    sepia(${filters.sepia}%)
    hue-rotate(${filters.hueRotate}deg)
    blur(${filters.blur}px)
    invert(${filters.invert}%)
  `.trim()
  
  // 应用到canvas元素
  canvas.style.filter = filterString
  
  // 也应用到裁剪视图
  const viewBox = document.querySelector('.cropper-view-box img')
  if (viewBox) {
    viewBox.style.filter = filterString
  }
}

function resetFilters() {
  filters.forEach(filter => {
    const slider = document.getElementById(`${filter.id}-slider`)
    const valueDisplay = document.getElementById(`${filter.id}-value`)
    
    if (slider) {
      slider.value = filter.default
      if (valueDisplay) {
        valueDisplay.textContent = `${filter.default}${filter.unit}`
      }
    }
    
    // 重置状态
    const key = filter.id.replace('-', '')
    window.appState.filters[key] = filter.default
  })
  
  // 清除滤镜
  const canvas = document.querySelector('.cropper-canvas')
  if (canvas) {
    canvas.style.filter = 'none'
  }
  
  const viewBox = document.querySelector('.cropper-view-box img')
  if (viewBox) {
    viewBox.style.filter = 'none'
  }
  
  window.showSuccessToast('滤镜已重置')
}

// 导出函数供外部使用
window.applyFilters = applyFilters