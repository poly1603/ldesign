/**
 * 示例图片管理
 */

// 使用免费的图片API
const sampleImages = [
  { url: 'https://picsum.photos/800/600?random=1', name: '风景1' },
  { url: 'https://picsum.photos/600/800?random=2', name: '竖版图' },
  { url: 'https://picsum.photos/1200/800?random=3', name: '横版图' },
  { url: 'https://picsum.photos/400/400?random=4', name: '正方形' },
  { url: 'https://picsum.photos/1920/1080?random=5', name: '高清图' },
  { url: 'https://picsum.photos/500/700?random=6', name: '人像图' }
]

export async function loadSampleImages() {
  const container = document.getElementById('sample-images')
  if (!container) return
  
  container.innerHTML = '<div class="sample-images" id="sample-grid"></div>'
  const grid = document.getElementById('sample-grid')
  
  sampleImages.forEach(sample => {
    const item = document.createElement('div')
    item.className = 'sample-image'
    item.title = sample.name
    
    const img = document.createElement('img')
    img.src = sample.url
    img.alt = sample.name
    img.loading = 'lazy'
    
    img.addEventListener('click', () => {
      loadSampleImage(sample.url, sample.name)
    })
    
    img.addEventListener('error', () => {
      // 如果加载失败，使用占位图
      img.src = 'data:image/svg+xml,%3Csvg width="200" height="200" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3E加载失败%3C/text%3E%3C/svg%3E'
    })
    
    item.appendChild(img)
    grid.appendChild(item)
  })
  
  // 添加本地上传选项
  const uploadItem = document.createElement('div')
  uploadItem.className = 'sample-image'
  uploadItem.style.background = 'var(--light-bg)'
  uploadItem.style.display = 'flex'
  uploadItem.style.alignItems = 'center'
  uploadItem.style.justifyContent = 'center'
  uploadItem.style.cursor = 'pointer'
  uploadItem.innerHTML = '<span style="font-size: 24px;">➕</span>'
  uploadItem.title = '上传本地图片'
  
  uploadItem.addEventListener('click', () => {
    document.getElementById('upload-btn')?.click()
  })
  
  grid.appendChild(uploadItem)
}

function loadSampleImage(url, name) {
  window.initCropper(url)
  window.showSuccessToast(`已加载示例图片: ${name}`)
}

// 添加一个用于生成测试图片的函数
export function generateTestImage(width = 800, height = 600, text = 'Test Image') {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')
  
  // 生成随机渐变背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`)
  gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 50%)`)
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  // 添加文字
  ctx.fillStyle = 'white'
  ctx.font = `${Math.min(width, height) / 10}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  
  // 添加尺寸标注
  ctx.font = '20px Arial'
  ctx.fillText(`${width} x ${height}`, width / 2, height - 30)
  
  return canvas.toDataURL()
}