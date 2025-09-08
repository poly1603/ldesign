/**
 * Vanilla JavaScript 示例应用主脚本
 * 展示 @ldesign/qrcode 在原生 JavaScript 环境中的使用
 */

import { generateQRCode } from '@ldesign/qrcode'

// 应用状态
let currentResult = null
let logoPreviewSrc = null

/**
 * 初始化应用
 */
function initApp() {
  // 初始化标签切换
  initTabs()
  
  // 初始化基础示例
  initBasicExample()
  
  // 初始化高级功能
  initAdvancedExample()
  
  // 生成初始二维码
  generateBasicQRCode()
}

/**
 * 初始化标签切换功能
 */
function initTabs() {
  const tabButtons = document.querySelectorAll('.nav-tab')
  const tabPanels = document.querySelectorAll('.tab-panel')
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.dataset.tab
      
      // 移除所有活动状态
      tabButtons.forEach(btn => btn.classList.remove('active'))
      tabPanels.forEach(panel => panel.classList.remove('active'))
      
      // 添加当前活动状态
      button.classList.add('active')
      document.getElementById(`${tabId}-tab`).classList.add('active')
    })
  })
}

/**
 * 初始化基础示例
 */
function initBasicExample() {
  // 获取DOM元素
  const qrTextEl = document.getElementById('qr-text')
  const qrSizeEl = document.getElementById('qr-size')
  const qrFormatEl = document.getElementById('qr-format')
  const errorLevelEl = document.getElementById('error-level')
  const qrMarginEl = document.getElementById('qr-margin')
  const generateBtn = document.getElementById('generate-btn')
  const downloadBtn = document.getElementById('download-btn')
  const sizeValueEl = document.getElementById('size-value')
  const marginValueEl = document.getElementById('margin-value')
  const exampleBtns = document.querySelectorAll('.example-btn')
  
  // 绑定事件
  qrSizeEl.addEventListener('input', () => {
    sizeValueEl.textContent = `${qrSizeEl.value}px`
  })
  
  qrMarginEl.addEventListener('input', () => {
    marginValueEl.textContent = qrMarginEl.value
  })
  
  generateBtn.addEventListener('click', generateBasicQRCode)
  downloadBtn.addEventListener('click', downloadQRCode)
  
  // 快速示例按钮
  exampleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text
      const size = btn.dataset.size
      
      qrTextEl.value = text
      qrSizeEl.value = size
      sizeValueEl.textContent = `${size}px`
      
      generateBasicQRCode()
    })
  })
}

/**
 * 初始化高级功能
 */
function initAdvancedExample() {
  // Logo 功能
  const logoFileEl = document.getElementById('logo-file')
  const logoSizeEl = document.getElementById('logo-size')
  const logoSizeValueEl = document.getElementById('logo-size-value')
  const generateLogoBtn = document.getElementById('generate-logo-btn')
  
  // 批量功能
  const batchSizeEl = document.getElementById('batch-size')
  const batchSizeValueEl = document.getElementById('batch-size-value')
  const generateBatchBtn = document.getElementById('generate-batch-btn')
  
  // 绑定事件
  logoFileEl.addEventListener('change', handleLogoUpload)
  
  logoSizeEl.addEventListener('input', () => {
    logoSizeValueEl.textContent = `${logoSizeEl.value}px`
  })
  
  batchSizeEl.addEventListener('input', () => {
    batchSizeValueEl.textContent = `${batchSizeEl.value}px`
  })
  
  generateLogoBtn.addEventListener('click', generateLogoQRCode)
  generateBatchBtn.addEventListener('click', generateBatchQRCodes)
}

/**
 * 生成基础二维码
 */
async function generateBasicQRCode() {
  const qrText = document.getElementById('qr-text').value.trim()
  const qrSize = parseInt(document.getElementById('qr-size').value)
  const qrFormat = document.getElementById('qr-format').value
  const errorLevel = document.getElementById('error-level').value
  const qrMargin = parseInt(document.getElementById('qr-margin').value)
  
  if (!qrText) return
  
  const generateBtn = document.getElementById('generate-btn')
  const downloadBtn = document.getElementById('download-btn')
  const qrContainer = document.getElementById('qr-container')
  const qrInfo = document.getElementById('qr-info')
  const qrPlaceholder = document.getElementById('qr-placeholder')
  
  try {
    // 显示加载状态
    generateBtn.textContent = '生成中...'
    generateBtn.disabled = true
    downloadBtn.disabled = true
    
    // 隐藏占位符和信息
    qrPlaceholder.style.display = 'none'
    qrInfo.style.display = 'none'
    qrContainer.innerHTML = ''
    
    // 生成二维码
    const options = {
      size: qrSize,
      format: qrFormat,
      errorCorrectionLevel: errorLevel,
      margin: qrMargin
    }
    
    const result = await generateQRCode(qrText, options)
    currentResult = result
    
    // 渲染二维码
    if (result.element) {
      qrContainer.appendChild(result.element)
    }
    
    // 显示信息
    document.getElementById('info-format').textContent = result.format
    document.getElementById('info-size').textContent = `${result.size}px`
    document.getElementById('info-time').textContent = formatTime(result.timestamp)
    qrInfo.style.display = 'block'
    
    // 启用下载按钮
    downloadBtn.disabled = false
    
  } catch (error) {
    console.error('生成二维码失败:', error)
    qrContainer.innerHTML = `<p style="color: #e54848;">生成失败: ${error.message}</p>`
  } finally {
    generateBtn.textContent = '生成二维码'
    generateBtn.disabled = false
  }
}

/**
 * 下载二维码
 */
function downloadQRCode() {
  if (!currentResult) return
  
  try {
    const link = document.createElement('a')
    const format = document.getElementById('qr-format').value
    link.download = `qrcode-${Date.now()}.${format === 'svg' ? 'svg' : 'png'}`
    
    if (format === 'svg' && currentResult.svg) {
      const blob = new Blob([currentResult.svg], { type: 'image/svg+xml' })
      link.href = URL.createObjectURL(blob)
    } else if (currentResult.dataURL) {
      link.href = currentResult.dataURL
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (error) {
    console.error('下载失败:', error)
  }
}

/**
 * 处理 Logo 文件上传
 */
function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreviewSrc = e.target.result
      const logoPreview = document.getElementById('logo-preview')
      const logoImg = document.getElementById('logo-img')
      
      logoImg.src = logoPreviewSrc
      logoPreview.style.display = 'block'
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 生成带 Logo 的二维码
 */
async function generateLogoQRCode() {
  const logoText = document.getElementById('logo-text').value.trim()
  const logoSize = parseInt(document.getElementById('logo-size').value)
  
  if (!logoText) return
  
  const generateBtn = document.getElementById('generate-logo-btn')
  const logoContainer = document.getElementById('logo-qr-container')
  
  try {
    generateBtn.textContent = '生成中...'
    generateBtn.disabled = true
    logoContainer.innerHTML = ''
    
    const logoOptions = logoPreviewSrc ? {
      src: logoPreviewSrc,
      size: logoSize
    } : undefined
    
    const options = {
      size: 250,
      format: 'canvas',
      errorCorrectionLevel: 'H',
      logo: logoOptions
    }
    
    const result = await generateQRCode(logoText, options)
    
    if (result.element) {
      logoContainer.appendChild(result.element)
    }
    
  } catch (error) {
    console.error('生成带Logo二维码失败:', error)
    logoContainer.innerHTML = `<p style="color: #e54848;">生成失败: ${error.message}</p>`
  } finally {
    generateBtn.textContent = '生成带Logo的二维码'
    generateBtn.disabled = false
  }
}

/**
 * 批量生成二维码
 */
async function generateBatchQRCodes() {
  const batchText = document.getElementById('batch-text').value.trim()
  const batchSize = parseInt(document.getElementById('batch-size').value)
  
  if (!batchText) return
  
  const generateBtn = document.getElementById('generate-batch-btn')
  const batchContainer = document.getElementById('batch-container')
  const batchInfo = document.getElementById('batch-info')
  
  try {
    generateBtn.textContent = '生成中...'
    generateBtn.disabled = true
    batchContainer.innerHTML = ''
    batchInfo.style.display = 'none'
    
    const texts = batchText.split('\n').filter(text => text.trim())
    const results = []
    
    // 逐个生成二维码
    for (const text of texts) {
      const result = await generateQRCode(text.trim(), {
        size: batchSize,
        format: 'canvas',
        errorCorrectionLevel: 'M'
      })
      results.push(result)
    }
    
    // 渲染到容器
    results.forEach((result, index) => {
      if (result.element) {
        const wrapper = document.createElement('div')
        wrapper.className = 'batch-item'
        wrapper.appendChild(result.element)
        
        const label = document.createElement('p')
        label.textContent = texts[index]
        label.className = 'batch-label'
        wrapper.appendChild(label)
        
        batchContainer.appendChild(wrapper)
      }
    })
    
    // 显示结果信息
    batchInfo.textContent = `成功生成 ${results.length} 个二维码`
    batchInfo.style.display = 'block'
    
  } catch (error) {
    console.error('批量生成失败:', error)
    batchContainer.innerHTML = `<p style="color: #e54848;">生成失败: ${error.message}</p>`
  } finally {
    generateBtn.textContent = '批量生成'
    generateBtn.disabled = false
  }
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp)
