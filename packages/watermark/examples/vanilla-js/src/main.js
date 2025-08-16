/**
 * LDesign Watermark 原生 JavaScript 示例
 * 展示水印组件的各种用法和功能
 */

import { createWatermark, destroyWatermark } from '@ldesign/watermark'

// 全局变量
const watermarkInstances = new Map()
let currentMainWatermark = null

/**
 * 初始化应用
 */
async function initApp() {
  // eslint-disable-next-line no-console
  console.log('🚀 初始化 LDesign Watermark 示例应用')

  // 绑定控制面板事件
  bindControlPanelEvents()

  // 创建默认水印
  await createDefaultWatermark()

  // eslint-disable-next-line no-console
  console.log('✅ 应用初始化完成')
}

/**
 * 绑定控制面板事件
 */
function bindControlPanelEvents() {
  // 实时更新数值显示
  const fontSizeSlider = document.getElementById('font-size')
  const fontSizeValue = document.getElementById('font-size-value')
  fontSizeSlider.addEventListener('input', e => {
    fontSizeValue.textContent = `${e.target.value}px`
  })

  const opacitySlider = document.getElementById('opacity')
  const opacityValue = document.getElementById('opacity-value')
  opacitySlider.addEventListener('input', e => {
    opacityValue.textContent = e.target.value
  })

  const rotateSlider = document.getElementById('rotate')
  const rotateValue = document.getElementById('rotate-value')
  rotateSlider.addEventListener('input', e => {
    rotateValue.textContent = `${e.target.value}°`
  })

  // 按钮事件
  document
    .getElementById('apply-watermark')
    .addEventListener('click', applyMainWatermark)
  document
    .getElementById('toggle-watermark')
    .addEventListener('click', toggleMainWatermark)
  document
    .getElementById('clear-watermark')
    .addEventListener('click', clearMainWatermark)
}

/**
 * 获取控制面板配置
 */
function getControlPanelConfig() {
  return {
    content:
      document.getElementById('watermark-text').value || 'LDesign Watermark',
    style: {
      fontSize: Number.parseInt(document.getElementById('font-size').value),
      opacity: Number.parseFloat(document.getElementById('opacity').value),
      rotate: Number.parseInt(document.getElementById('rotate').value),
      color: document.getElementById('color').value,
    },
    renderMode: document.getElementById('render-mode').value,
  }
}

/**
 * 创建默认水印
 */
async function createDefaultWatermark() {
  try {
    const config = getControlPanelConfig()
    currentMainWatermark = await createWatermark(document.body, {
      ...config,
      zIndex: 1000,
      layout: {
        gapX: 200,
        gapY: 150,
      },
    })
    // eslint-disable-next-line no-console
    console.log('✅ 默认水印创建成功', currentMainWatermark)
  } catch (error) {
    console.error('❌ 创建默认水印失败:', error)
  }
}

/**
 * 应用主水印
 */
async function applyMainWatermark() {
  try {
    // 先清除现有水印
    if (currentMainWatermark) {
      await destroyWatermark(currentMainWatermark)
    }

    // 创建新水印
    await createDefaultWatermark()

    showNotification('✅ 水印配置已应用', 'success')
  } catch (error) {
    console.error('❌ 应用水印失败:', error)
    showNotification('❌ 应用水印失败', 'error')
  }
}

/**
 * 切换主水印显示
 */
function toggleMainWatermark() {
  if (currentMainWatermark) {
    const isVisible = currentMainWatermark.visible
    if (isVisible) {
      // 隐藏水印
      currentMainWatermark.elements.forEach(el => {
        el.style.display = 'none'
      })
      currentMainWatermark.visible = false
      showNotification('🙈 水印已隐藏', 'info')
    } else {
      // 显示水印
      currentMainWatermark.elements.forEach(el => {
        el.style.display = 'block'
      })
      currentMainWatermark.visible = true
      showNotification('👁️ 水印已显示', 'info')
    }
  }
}

/**
 * 清除主水印
 */
async function clearMainWatermark() {
  try {
    if (currentMainWatermark) {
      await destroyWatermark(currentMainWatermark)
      currentMainWatermark = null
      showNotification('🗑️ 水印已清除', 'info')
    }
  } catch (error) {
    console.error('❌ 清除水印失败:', error)
    showNotification('❌ 清除水印失败', 'error')
  }
}

/**
 * 创建基础文字水印
 */
window.createBasicWatermark = async function () {
  try {
    const container = document.getElementById('demo-basic')
    const instanceId = 'basic-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    const instance = await createWatermark(container, {
      content: '基础水印',
      style: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.1)',
        opacity: 0.8,
      },
      layout: {
        gapX: 80,
        gapY: 60,
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-basic', true)
    showNotification('✅ 基础水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建基础水印失败:', error)
    showNotification('❌ 创建基础水印失败', 'error')
  }
}

/**
 * 创建图片水印
 */
window.createImageWatermark = async function () {
  try {
    const container = document.getElementById('demo-image')
    const instanceId = 'image-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    // 创建一个简单的 SVG 图片作为水印
    const svgData = `
      <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="30" fill="none" stroke="#ccc" stroke-width="1" rx="5"/>
        <text x="30" y="20" text-anchor="middle" font-size="12" fill="#999">LOGO</text>
      </svg>
    `
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' })
    const svgUrl = URL.createObjectURL(svgBlob)

    const instance = await createWatermark(container, {
      content: {
        src: svgUrl,
        width: 60,
        height: 30,
        opacity: 0.3,
      },
      layout: {
        gapX: 100,
        gapY: 80,
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-image', true)
    showNotification('✅ 图片水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建图片水印失败:', error)
    showNotification('❌ 创建图片水印失败', 'error')
  }
}

/**
 * 创建 Canvas 水印
 */
window.createCanvasWatermark = async function () {
  try {
    const container = document.getElementById('demo-canvas')
    const instanceId = 'canvas-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    const instance = await createWatermark(container, {
      content: 'Canvas 渲染',
      renderMode: 'canvas',
      style: {
        fontSize: 16,
        color: '#4CAF50',
        opacity: 0.2,
      },
      layout: {
        gapX: 120,
        gapY: 80,
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-canvas', true)
    showNotification('✅ Canvas 水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建 Canvas 水印失败:', error)
    showNotification('❌ 创建 Canvas 水印失败', 'error')
  }
}

/**
 * 创建动画水印
 */
window.createAnimationWatermark = async function () {
  try {
    const container = document.getElementById('demo-animation')
    const instanceId = 'animation-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    const instance = await createWatermark(container, {
      content: '动画水印',
      style: {
        fontSize: 18,
        color: '#FF6B6B',
        opacity: 0.3,
      },
      layout: {
        gapX: 100,
        gapY: 70,
      },
      animation: {
        type: 'fade',
        duration: 2000,
        iteration: 'infinite',
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-animation', true)
    showNotification('✅ 动画水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建动画水印失败:', error)
    showNotification('❌ 创建动画水印失败', 'error')
  }
}

/**
 * 创建响应式水印
 */
window.createResponsiveWatermark = async function () {
  try {
    const container = document.getElementById('demo-responsive')
    const instanceId = 'responsive-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    const instance = await createWatermark(container, {
      content: '响应式',
      style: {
        fontSize: 14,
        color: '#9C27B0',
        opacity: 0.25,
      },
      layout: {
        gapX: 80,
        gapY: 60,
        autoCalculate: true,
      },
      responsive: {
        enabled: true,
        autoResize: true,
        breakpoints: {
          mobile: {
            maxWidth: 768,
            style: { fontSize: 12 },
            layout: { gapX: 60, gapY: 40 },
          },
        },
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-responsive', true)
    showNotification('✅ 响应式水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建响应式水印失败:', error)
    showNotification('❌ 创建响应式水印失败', 'error')
  }
}

/**
 * 创建安全防护水印
 */
window.createSecurityWatermark = async function () {
  try {
    const container = document.getElementById('demo-security')
    const instanceId = 'security-watermark'

    // 清除现有实例
    if (watermarkInstances.has(instanceId)) {
      await destroyWatermark(watermarkInstances.get(instanceId))
    }

    const instance = await createWatermark(container, {
      content: '安全防护',
      style: {
        fontSize: 16,
        color: '#F44336',
        opacity: 0.2,
      },
      layout: {
        gapX: 90,
        gapY: 70,
      },
      security: {
        level: 'high',
        mutationObserver: true,
        styleProtection: true,
        canvasProtection: true,
      },
    })

    watermarkInstances.set(instanceId, instance)
    updateStatus('status-security', true)
    showNotification('✅ 安全水印创建成功', 'success')
  } catch (error) {
    console.error('❌ 创建安全水印失败:', error)
    showNotification('❌ 创建安全水印失败', 'error')
  }
}

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
  // 创建通知元素
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `

  // 根据类型设置样式
  switch (type) {
    case 'success':
      notification.style.background = '#28a745'
      break
    case 'error':
      notification.style.background = '#dc3545'
      break
    case 'info':
    default:
      notification.style.background = '#17a2b8'
      break
  }

  notification.textContent = message
  document.body.appendChild(notification)

  // 3秒后自动移除
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease'
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

/**
 * 更新状态指示器
 */
function updateStatus(statusId, active) {
  const statusEl = document.getElementById(statusId)
  if (statusEl) {
    statusEl.className = `status-indicator ${
      active ? 'status-active' : 'status-inactive'
    }`
  }
}

// 添加 CSS 动画
const style = document.createElement('style')
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`
document.head.appendChild(style)

// 启动应用
initApp().catch(console.error)
