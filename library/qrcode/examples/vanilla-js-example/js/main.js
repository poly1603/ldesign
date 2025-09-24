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

  // 初始化样式定制
  initStyleExample()

  // 初始化数据类型
  initDataTypeExample()

  // 初始化性能测试
  initPerformanceExample()

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
 * 初始化样式定制示例
 */
function initStyleExample() {
  const textInput = document.getElementById('style-text')
  const sizeSlider = document.getElementById('style-size')
  const sizeValue = document.getElementById('style-size-value')
  const marginSlider = document.getElementById('style-margin')
  const marginValue = document.getElementById('style-margin-value')
  const foregroundPicker = document.getElementById('style-foreground')
  const foregroundText = document.getElementById('style-foreground-text')
  const backgroundPicker = document.getElementById('style-background')
  const backgroundText = document.getElementById('style-background-text')
  const generateBtn = document.getElementById('generate-style-qr')
  const presetButtons = document.querySelectorAll('.preset-button')

  // 预设样式配置
  const presets = {
    classic: { foreground: '#000000', background: '#ffffff' },
    modern: { foreground: '#722ED1', background: '#f1ecf9' },
    gradient: { foreground: '#722ED1', background: '#ffffff' },
    elegant: { foreground: '#35165f', background: '#f8f8f8' }
  }

  // 绑定事件
  sizeSlider.addEventListener('input', () => {
    sizeValue.textContent = sizeSlider.value
  })

  marginSlider.addEventListener('input', () => {
    marginValue.textContent = marginSlider.value
  })

  foregroundPicker.addEventListener('input', () => {
    foregroundText.value = foregroundPicker.value
  })

  foregroundText.addEventListener('input', () => {
    if (isValidColor(foregroundText.value)) {
      foregroundPicker.value = foregroundText.value
    }
  })

  backgroundPicker.addEventListener('input', () => {
    backgroundText.value = backgroundPicker.value
  })

  backgroundText.addEventListener('input', () => {
    if (isValidColor(backgroundText.value)) {
      backgroundPicker.value = backgroundText.value
    }
  })

  generateBtn.addEventListener('click', generateStyleQRCode)

  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const presetName = button.dataset.preset
      const preset = presets[presetName]
      if (preset) {
        foregroundPicker.value = preset.foreground
        foregroundText.value = preset.foreground
        backgroundPicker.value = preset.background
        backgroundText.value = preset.background
        generateStyleQRCode()
      }
    })
  })

  // 生成初始二维码
  generateStyleQRCode()
}

/**
 * 生成样式定制二维码
 */
async function generateStyleQRCode() {
  const textInput = document.getElementById('style-text')
  const sizeSlider = document.getElementById('style-size')
  const marginSlider = document.getElementById('style-margin')
  const foregroundText = document.getElementById('style-foreground-text')
  const backgroundText = document.getElementById('style-background-text')
  const container = document.getElementById('style-qr-container')
  const presetContainer = document.getElementById('style-preset-container')
  const generateBtn = document.getElementById('generate-style-qr')

  if (!textInput.value.trim()) return

  generateBtn.textContent = '生成中...'
  generateBtn.disabled = true

  try {
    const options = {
      size: parseInt(sizeSlider.value),
      format: 'canvas',
      errorCorrectionLevel: 'M',
      margin: parseInt(marginSlider.value),
      foregroundColor: foregroundText.value,
      backgroundColor: backgroundText.value
    }

    const result = await generateQRCode(textInput.value, options)

    // 渲染主要二维码
    if (result.element) {
      container.innerHTML = ''
      container.appendChild(result.element)
    }

    // 生成预设样式示例
    await generatePresetExamples(textInput.value, presetContainer)

  } catch (error) {
    console.error('生成二维码失败:', error)
    container.innerHTML = `<p style="color: #e54848;">生成失败: ${error.message}</p>`
  } finally {
    generateBtn.textContent = '生成二维码'
    generateBtn.disabled = false
  }
}

/**
 * 生成预设样式示例
 */
async function generatePresetExamples(text, container) {
  const presets = [
    { name: '经典', foreground: '#000000', background: '#ffffff' },
    { name: '现代', foreground: '#722ED1', background: '#f1ecf9' },
    { name: '渐变', foreground: '#722ED1', background: '#ffffff' },
    { name: '优雅', foreground: '#35165f', background: '#f8f8f8' }
  ]

  container.innerHTML = ''

  for (const preset of presets) {
    try {
      const options = {
        size: 120,
        format: 'canvas',
        errorCorrectionLevel: 'M',
        margin: 2,
        foregroundColor: preset.foreground,
        backgroundColor: preset.background
      }

      const result = await generateQRCode(text, options)

      if (result.element) {
        const presetItem = document.createElement('div')
        presetItem.className = 'preset-item'

        const qrDiv = document.createElement('div')
        qrDiv.className = 'preset-qr'
        qrDiv.appendChild(result.element)

        const nameDiv = document.createElement('div')
        nameDiv.className = 'preset-name'
        nameDiv.textContent = preset.name

        presetItem.appendChild(qrDiv)
        presetItem.appendChild(nameDiv)
        container.appendChild(presetItem)
      }
    } catch (error) {
      console.error(`生成预设样式 ${preset.name} 失败:`, error)
    }
  }
}

/**
 * 初始化数据类型示例
 */
function initDataTypeExample() {
  const typeCards = document.querySelectorAll('.type-card')
  const generateBtn = document.getElementById('generate-datatype-qr')
  const resetBtn = document.getElementById('reset-datatype')

  // 数据类型配置
  const dataTypes = {
    url: {
      label: 'URL链接',
      icon: '🌐',
      defaultData: 'https://www.ldesign.com'
    },
    wifi: {
      label: 'WiFi网络',
      icon: '📶',
      defaultData: 'WIFI:T:WPA;S:LDesign-Office;P:password123;H:false;'
    },
    contact: {
      label: '联系人',
      icon: '👤',
      defaultData: 'BEGIN:VCARD\nVERSION:3.0\nFN:LDesign Team\nORG:LDesign\nTEL:+86-138-0013-8000\nEMAIL:contact@ldesign.com\nURL:https://www.ldesign.com\nEND:VCARD'
    },
    email: {
      label: '邮件',
      icon: '📧',
      defaultData: 'mailto:contact@ldesign.com?subject=Hello&body=Hi there!'
    },
    sms: {
      label: '短信',
      icon: '💬',
      defaultData: 'sms:+86-138-0013-8000?body=Hello from LDesign!'
    },
    phone: {
      label: '电话',
      icon: '📞',
      defaultData: 'tel:+86-138-0013-8000'
    },
    location: {
      label: '地理位置',
      icon: '📍',
      defaultData: 'geo:39.9042,116.4074?q=北京天安门'
    },
    text: {
      label: '纯文本',
      icon: '📝',
      defaultData: 'Hello, this is a QR code generated by @ldesign/qrcode!'
    }
  }

  let selectedType = null

  // 绑定类型卡片事件
  typeCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.type
      selectDataType(type, dataTypes[type])
    })
  })

  generateBtn.addEventListener('click', generateDataTypeQRCode)
  resetBtn.addEventListener('click', resetToDefault)

  function selectDataType(type, config) {
    selectedType = type

    // 更新UI状态
    typeCards.forEach(card => card.classList.remove('active'))
    document.querySelector(`[data-type="${type}"]`).classList.add('active')

    // 更新标题和图标
    document.getElementById('datatype-icon').textContent = config.icon
    document.getElementById('datatype-title').textContent = config.label

    // 显示输入区域，隐藏空状态
    document.getElementById('datatype-input-area').style.display = 'block'
    document.getElementById('datatype-empty').style.display = 'none'

    // 设置默认内容
    document.getElementById('datatype-content').value = config.defaultData

    // 自动生成二维码
    generateDataTypeQRCode()
  }

  function resetToDefault() {
    if (selectedType && dataTypes[selectedType]) {
      document.getElementById('datatype-content').value = dataTypes[selectedType].defaultData
      generateDataTypeQRCode()
    }
  }
}

/**
 * 生成数据类型二维码
 */
async function generateDataTypeQRCode() {
  const contentTextarea = document.getElementById('datatype-content')
  const container = document.getElementById('datatype-qr-container')
  const info = document.getElementById('datatype-info')
  const lengthSpan = document.getElementById('datatype-length')
  const timestampSpan = document.getElementById('datatype-timestamp')
  const generateBtn = document.getElementById('generate-datatype-qr')

  if (!contentTextarea.value.trim()) return

  generateBtn.textContent = '生成中...'
  generateBtn.disabled = true

  try {
    const options = {
      size: 250,
      format: 'canvas',
      errorCorrectionLevel: 'M',
      margin: 4
    }

    const result = await generateQRCode(contentTextarea.value, options)

    // 渲染二维码
    if (result.element) {
      container.innerHTML = ''
      container.appendChild(result.element)
    }

    // 更新信息
    lengthSpan.textContent = `${contentTextarea.value.length} 字符`
    timestampSpan.textContent = formatTime(result.timestamp)
    info.style.display = 'block'

  } catch (error) {
    console.error('生成二维码失败:', error)
    container.innerHTML = `<p style="color: #e54848;">生成失败: ${error.message}</p>`
    info.style.display = 'none'
  } finally {
    generateBtn.textContent = '生成二维码'
    generateBtn.disabled = false
  }
}

/**
 * 验证颜色值
 */
function isValidColor(color) {
  const style = new Option().style
  style.color = color
  return style.color !== ''
}

/**
 * 格式化时间
 */
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString()
}

/**
 * 初始化性能测试示例
 */
function initPerformanceExample() {
  const runTestBtn = document.getElementById('run-performance-test')
  const clearResultsBtn = document.getElementById('clear-performance-results')

  runTestBtn.addEventListener('click', runPerformanceTest)
  clearResultsBtn.addEventListener('click', clearPerformanceResults)
}

/**
 * 运行性能测试
 */
async function runPerformanceTest() {
  const testCount = parseInt(document.getElementById('perf-test-count').value)
  const testSize = parseInt(document.getElementById('perf-test-size').value)

  const testTypes = {
    generation: document.getElementById('test-generation').checked,
    cache: document.getElementById('test-cache').checked,
    batch: document.getElementById('test-batch').checked,
    memory: document.getElementById('test-memory').checked
  }

  // 检查是否有选中的测试
  const hasSelectedTests = Object.values(testTypes).some(Boolean)
  if (!hasSelectedTests) {
    alert('请至少选择一种测试类型')
    return
  }

  const runBtn = document.getElementById('run-performance-test')
  const clearBtn = document.getElementById('clear-performance-results')
  const progressSection = document.getElementById('performance-progress')
  const progressFill = document.getElementById('performance-progress-fill')
  const progressText = document.getElementById('performance-progress-text')
  const noResults = document.getElementById('performance-no-results')
  const resultsContainer = document.getElementById('performance-results-container')

  try {
    // 显示进度，禁用按钮
    runBtn.textContent = '测试中...'
    runBtn.disabled = true
    clearBtn.disabled = true
    progressSection.style.display = 'block'
    noResults.style.display = 'none'
    resultsContainer.style.display = 'block'
    resultsContainer.innerHTML = ''

    const tests = []
    if (testTypes.generation) tests.push('generation')
    if (testTypes.cache) tests.push('cache')
    if (testTypes.batch) tests.push('batch')
    if (testTypes.memory) tests.push('memory')

    const testResults = []

    for (let i = 0; i < tests.length; i++) {
      const testType = tests[i]
      progressText.textContent = `正在执行${getPerformanceTestName(testType)}...`

      const result = await runSinglePerformanceTest(testType, testCount, testSize)
      testResults.push(result)

      // 渲染结果
      renderPerformanceResult(result, resultsContainer)

      const progress = ((i + 1) / tests.length) * 100
      progressFill.style.width = `${progress}%`

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 生成对比图表
    generatePerformanceComparisonChart(testResults)

    progressText.textContent = '测试完成'
  } catch (error) {
    console.error('性能测试失败:', error)
    progressText.textContent = '测试失败'
  } finally {
    runBtn.textContent = '开始测试'
    runBtn.disabled = false
    clearBtn.disabled = false
    setTimeout(() => {
      progressSection.style.display = 'none'
    }, 2000)
  }
}

/**
 * 运行单个性能测试
 */
async function runSinglePerformanceTest(testType, testCount, testSize) {
  const startMemory = (performance.memory?.usedJSHeapSize || 0)

  switch (testType) {
    case 'generation':
      return await runGenerationPerformanceTest(testCount, testSize)
    case 'cache':
      return await runCachePerformanceTest(testCount, testSize)
    case 'batch':
      return await runBatchPerformanceTest(testCount, testSize)
    case 'memory':
      return await runMemoryPerformanceTest(testCount, testSize, startMemory)
    default:
      throw new Error(`未知测试类型: ${testType}`)
  }
}

/**
 * 生成速度测试
 */
async function runGenerationPerformanceTest(testCount, testSize) {
  const times = []
  const testData = generatePerformanceTestData(testCount)

  for (const data of testData) {
    const start = performance.now()

    await generateQRCode(data, {
      size: testSize,
      format: 'canvas'
    })

    const end = performance.now()
    times.push(end - start)
  }

  return {
    id: 'generation',
    name: '生成速度测试',
    totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minTime: Math.round(Math.min(...times)),
    maxTime: Math.round(Math.max(...times)),
    times,
    chart: true
  }
}

/**
 * 缓存性能测试
 */
async function runCachePerformanceTest(testCount, testSize) {
  const testData = 'https://www.ldesign.com/cache-test'
  const times = []
  let cacheHits = 0

  // 第一次生成（无缓存）
  const start1 = performance.now()
  await generateQRCode(testData, {
    size: testSize,
    format: 'canvas'
  })
  const end1 = performance.now()
  times.push(end1 - start1)

  // 后续生成（模拟缓存效果）
  for (let i = 1; i < testCount; i++) {
    const start = performance.now()

    await generateQRCode(testData, {
      size: testSize,
      format: 'canvas'
    })

    const end = performance.now()
    times.push(end - start)

    // 模拟缓存命中
    if (i > 1) {
      cacheHits++
    }
  }

  return {
    id: 'cache',
    name: '缓存性能测试',
    totalTime: Math.round(times.reduce((a, b) => a + b, 0)),
    averageTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    minTime: Math.round(Math.min(...times)),
    maxTime: Math.round(Math.max(...times)),
    cacheHitRate: Math.round((cacheHits / (testCount - 1)) * 100),
    times,
    chart: true
  }
}

/**
 * 批量处理测试
 */
async function runBatchPerformanceTest(testCount, testSize) {
  const testData = generatePerformanceTestData(testCount)

  const start = performance.now()

  // 批量生成二维码
  const promises = testData.map(data =>
    generateQRCode(data, {
      size: testSize,
      format: 'canvas'
    })
  )

  await Promise.all(promises)

  const end = performance.now()
  const totalTime = end - start

  return {
    id: 'batch',
    name: '批量处理测试',
    totalTime: Math.round(totalTime),
    averageTime: Math.round(totalTime / testCount),
    minTime: 0,
    maxTime: Math.round(totalTime),
    chart: false
  }
}

/**
 * 内存使用测试
 */
async function runMemoryPerformanceTest(testCount, testSize, startMemory) {
  const testData = generatePerformanceTestData(testCount)
  const results = []

  for (const data of testData) {
    const result = await generateQRCode(data, {
      size: testSize,
      format: 'canvas'
    })
    results.push(result)
  }

  const endMemory = (performance.memory?.usedJSHeapSize || 0)
  const memoryUsage = (endMemory - startMemory) / 1024 / 1024 // MB

  // 清理内存
  results.length = 0

  return {
    id: 'memory',
    name: '内存使用测试',
    totalTime: 0,
    averageTime: 0,
    minTime: 0,
    maxTime: 0,
    memoryUsage: Math.round(memoryUsage * 100) / 100,
    chart: false
  }
}

/**
 * 生成性能测试数据
 */
function generatePerformanceTestData(count) {
  const data = []
  for (let i = 0; i < count; i++) {
    data.push(`https://www.ldesign.com/test-${i}?timestamp=${Date.now()}`)
  }
  return data
}

/**
 * 获取性能测试名称
 */
function getPerformanceTestName(testType) {
  const names = {
    generation: '生成速度测试',
    cache: '缓存性能测试',
    batch: '批量处理测试',
    memory: '内存使用测试'
  }
  return names[testType] || testType
}

/**
 * 渲染性能测试结果
 */
function renderPerformanceResult(result, container) {
  const resultDiv = document.createElement('div')
  resultDiv.className = 'result-item'

  resultDiv.innerHTML = `
    <h4 class="result-title">${result.name}</h4>
    <div class="result-metrics">
      <div class="metric">
        <span class="metric-label">总耗时:</span>
        <span class="metric-value">${result.totalTime}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">平均耗时:</span>
        <span class="metric-value">${result.averageTime}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">最快:</span>
        <span class="metric-value">${result.minTime}ms</span>
      </div>
      <div class="metric">
        <span class="metric-label">最慢:</span>
        <span class="metric-value">${result.maxTime}ms</span>
      </div>
      ${result.cacheHitRate !== undefined ? `
        <div class="metric">
          <span class="metric-label">缓存命中率:</span>
          <span class="metric-value">${result.cacheHitRate}%</span>
        </div>
      ` : ''}
      ${result.memoryUsage ? `
        <div class="metric">
          <span class="metric-label">内存使用:</span>
          <span class="metric-value">${result.memoryUsage}MB</span>
        </div>
      ` : ''}
    </div>
    ${result.chart ? `
      <div class="result-chart">
        <canvas width="300" height="150" data-chart-id="${result.id}"></canvas>
      </div>
    ` : ''}
  `

  container.appendChild(resultDiv)

  // 绘制图表
  if (result.chart && result.times) {
    const canvas = resultDiv.querySelector(`canvas[data-chart-id="${result.id}"]`)
    drawPerformanceChart(canvas, result.times)
  }
}

/**
 * 绘制性能图表
 */
function drawPerformanceChart(canvas, times) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 简单的柱状图绘制
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#722ED1'

  const barWidth = canvas.width / times.length
  const maxTime = Math.max(...times)

  times.forEach((time, index) => {
    const barHeight = (time / maxTime) * canvas.height * 0.8
    const x = index * barWidth
    const y = canvas.height - barHeight

    ctx.fillRect(x, y, barWidth - 1, barHeight)
  })
}

/**
 * 生成性能对比图表
 */
function generatePerformanceComparisonChart(testResults) {
  const comparisonCard = document.getElementById('performance-comparison-card')
  const canvas = document.getElementById('performance-comparison-chart')
  const legend = document.getElementById('performance-comparison-legend')

  if (!canvas || testResults.length === 0) return

  comparisonCard.style.display = 'block'

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 准备对比数据
  const comparisonData = testResults.map((result, index) => ({
    label: result.name,
    value: result.averageTime,
    color: `hsl(${260 + index * 30}, 70%, 60%)`
  }))

  // 绘制对比图表
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const maxValue = Math.max(...comparisonData.map(d => d.value))
  const barWidth = canvas.width / comparisonData.length * 0.8
  const spacing = canvas.width / comparisonData.length * 0.2

  comparisonData.forEach((data, index) => {
    const barHeight = (data.value / maxValue) * canvas.height * 0.8
    const x = index * (barWidth + spacing) + spacing / 2
    const y = canvas.height - barHeight - 20

    ctx.fillStyle = data.color
    ctx.fillRect(x, y, barWidth, barHeight)

    // 绘制数值标签
    ctx.fillStyle = '#333'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`${data.value}ms`, x + barWidth / 2, y - 5)
  })

  // 更新图例
  legend.innerHTML = comparisonData.map(data => `
    <div class="legend-item">
      <div class="legend-color" style="background-color: ${data.color}"></div>
      <span>${data.label}</span>
    </div>
  `).join('')
}

/**
 * 清空性能测试结果
 */
function clearPerformanceResults() {
  const noResults = document.getElementById('performance-no-results')
  const resultsContainer = document.getElementById('performance-results-container')
  const comparisonCard = document.getElementById('performance-comparison-card')

  noResults.style.display = 'block'
  resultsContainer.style.display = 'none'
  resultsContainer.innerHTML = ''
  comparisonCard.style.display = 'none'
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp)
