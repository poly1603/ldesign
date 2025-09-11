/**
 * 图表导出功能演示
 */

// 引入图表库
import { Chart } from '@ldesign/chart'

/**
 * 初始化导出演示页面
 */
export function initExportDemo() {
  console.log('🔄 初始化导出演示页面...')

  try {
    // 创建示例图表
    const chart = createExportDemoChart()
    
    // 设置导出按钮事件
    setupExportButtons(chart)

    console.log('✅ 导出演示页面初始化完成')
    return { chart }
  } catch (error) {
    console.error('❌ 导出演示页面初始化失败:', error)
    return null
  }
}

/**
 * 创建用于导出演示的图表
 */
function createExportDemoChart() {
  const data = [
    { name: '1月', value: 120 },
    { name: '2月', value: 200 },
    { name: '3月', value: 150 },
    { name: '4月', value: 300 },
    { name: '5月', value: 250 },
    { name: '6月', value: 400 },
    { name: '7月', value: 350 },
    { name: '8月', value: 450 },
    { name: '9月', value: 380 },
    { name: '10月', value: 420 },
    { name: '11月', value: 320 },
    { name: '12月', value: 480 },
  ]

  try {
    const container = document.getElementById('export-demo-chart')
    if (!container) {
      throw new Error('找不到图表容器')
    }

    const chart = new Chart(container, {
      type: 'line',
      data,
      title: '年度销售数据',
      theme: 'light',
      responsive: true
    })

    return chart
  } catch (error) {
    console.error('创建导出演示图表失败:', error)
    return null
  }
}

/**
 * 设置导出按钮事件
 */
function setupExportButtons(chart) {
  if (!chart) return

  // PNG 导出
  const pngBtn = document.getElementById('export-png-btn')
  if (pngBtn) {
    pngBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 PNG...')
        await chart.downloadExport('png', 'sales-chart')
        showStatus('PNG 导出成功！', 'success')
      } catch (error) {
        console.error('PNG 导出失败:', error)
        showStatus('PNG 导出失败: ' + error.message, 'error')
      }
    })
  }

  // SVG 导出
  const svgBtn = document.getElementById('export-svg-btn')
  if (svgBtn) {
    svgBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 SVG...')
        await chart.downloadExport('svg', 'sales-chart')
        showStatus('SVG 导出成功！', 'success')
      } catch (error) {
        console.error('SVG 导出失败:', error)
        showStatus('SVG 导出失败: ' + error.message, 'error')
      }
    })
  }

  // PDF 导出
  const pdfBtn = document.getElementById('export-pdf-btn')
  if (pdfBtn) {
    pdfBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 PDF...')
        await chart.downloadExport('pdf', 'sales-chart')
        showStatus('PDF 导出成功！', 'success')
      } catch (error) {
        console.error('PDF 导出失败:', error)
        showStatus('PDF 导出失败: ' + error.message, 'error')
      }
    })
  }

  // CSV 导出
  const csvBtn = document.getElementById('export-csv-btn')
  if (csvBtn) {
    csvBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 CSV...')
        await chart.downloadExport('csv', 'sales-data')
        showStatus('CSV 导出成功！', 'success')
      } catch (error) {
        console.error('CSV 导出失败:', error)
        showStatus('CSV 导出失败: ' + error.message, 'error')
      }
    })
  }

  // Excel 导出
  const excelBtn = document.getElementById('export-excel-btn')
  if (excelBtn) {
    excelBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 Excel...')
        await chart.downloadExport('excel', 'sales-data')
        showStatus('Excel 导出成功！', 'success')
      } catch (error) {
        console.error('Excel 导出失败:', error)
        showStatus('Excel 导出失败: ' + error.message, 'error')
      }
    })
  }

  // JSON 导出
  const jsonBtn = document.getElementById('export-json-btn')
  if (jsonBtn) {
    jsonBtn.addEventListener('click', async () => {
      try {
        showStatus('正在导出 JSON...')
        await chart.downloadExport('json', 'sales-data')
        showStatus('JSON 导出成功！', 'success')
      } catch (error) {
        console.error('JSON 导出失败:', error)
        showStatus('JSON 导出失败: ' + error.message, 'error')
      }
    })
  }

  // 预览图片
  const previewBtn = document.getElementById('preview-image-btn')
  if (previewBtn) {
    previewBtn.addEventListener('click', async () => {
      try {
        showStatus('正在生成预览...')
        const imageDataURL = await chart.exportImage('png')
        showImagePreview(imageDataURL)
        showStatus('预览生成成功！', 'success')
      } catch (error) {
        console.error('预览生成失败:', error)
        showStatus('预览生成失败: ' + error.message, 'error')
      }
    })
  }
}

/**
 * 显示状态信息
 */
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('export-status')
  if (!statusEl) return

  statusEl.textContent = message
  statusEl.className = `export-status ${type}`

  // 3秒后清除状态
  setTimeout(() => {
    statusEl.textContent = ''
    statusEl.className = 'export-status'
  }, 3000)
}

/**
 * 显示图片预览
 */
function showImagePreview(dataURL) {
  const previewEl = document.getElementById('image-preview')
  if (!previewEl) return

  previewEl.innerHTML = `
    <h4>图片预览</h4>
    <img src="${dataURL}" alt="图表预览" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px;" />
    <p style="margin-top: 10px; font-size: 12px; color: #666;">
      右键点击图片可以保存到本地
    </p>
  `
}

/**
 * 清理资源
 */
export function cleanupExportDemo() {
  // 清理事件监听器等资源
  const buttons = [
    'export-png-btn',
    'export-svg-btn', 
    'export-pdf-btn',
    'export-csv-btn',
    'export-excel-btn',
    'export-json-btn',
    'preview-image-btn'
  ]

  buttons.forEach(id => {
    const btn = document.getElementById(id)
    if (btn) {
      btn.replaceWith(btn.cloneNode(true))
    }
  })

  // 清理预览
  const previewEl = document.getElementById('image-preview')
  if (previewEl) {
    previewEl.innerHTML = ''
  }

  // 清理状态
  const statusEl = document.getElementById('export-status')
  if (statusEl) {
    statusEl.textContent = ''
    statusEl.className = 'export-status'
  }
}
