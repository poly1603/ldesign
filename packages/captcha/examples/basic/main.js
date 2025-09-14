/**
 * @ldesign/captcha 基础示例
 * 展示所有验证方式的使用方法
 */

import {
  CaptchaType,
  CaptchaStatus,
  SlidePuzzleCaptcha,
  ClickTextCaptcha,
  RotateSliderCaptcha,
  ClickCaptcha,
  ThemeManager
} from '@ldesign/captcha'

// 验证码实例存储
const captchaInstances = {
  slidePuzzle: null,
  clickText: null,
  rotateSlider: null,
  click: null
}

// 初始化主题切换器
function initThemeSwitcher() {
  const themeOptions = document.getElementById('themeOptions')
  
  themeOptions.addEventListener('click', (e) => {
    if (e.target.classList.contains('theme-option')) {
      const theme = e.target.dataset.theme
      
      // 更新按钮状态
      themeOptions.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active')
      })
      e.target.classList.add('active')
      
      // 应用主题
      const themeManager = new ThemeManager()
      themeManager.setTheme(theme)

      // 重新应用主题到所有验证码实例
      Object.values(captchaInstances).forEach(instance => {
        if (instance && instance.rootElement) {
          themeManager.applyToElement(instance.rootElement, theme)
        }
      })
    }
  })
  
  // 加载保存的主题
  const themeManager = new ThemeManager()
  themeManager.loadThemeFromStorage()
}

// 通用状态显示函数
function showStatus(containerId, type, message) {
  const statusElement = document.getElementById(`${containerId}Status`)
  statusElement.className = `status ${type}`
  statusElement.textContent = message
  statusElement.style.display = 'block'
  
  // 3秒后自动隐藏
  setTimeout(() => {
    statusElement.style.display = 'none'
  }, 3000)
}

// 通用事件处理器
function createEventHandlers(containerId) {
  return {
    onSuccess: (result) => {
      console.log(`[${containerId}] 验证成功:`, result)
      showStatus(containerId, 'success', `验证成功！耗时: ${result.duration}ms`)
    },
    onFail: (error) => {
      console.log(`[${containerId}] 验证失败:`, error)
      showStatus(containerId, 'error', `验证失败: ${error.message}`)
    },
    onStatusChange: (status) => {
      console.log(`[${containerId}] 状态变化:`, status)
      
      let message = ''
      let type = 'info'
      
      switch (status) {
        case CaptchaStatus.INITIALIZING:
          message = '正在初始化...'
          break
        case CaptchaStatus.READY:
          message = '准备就绪，可以开始验证'
          break
        case CaptchaStatus.VERIFYING:
          message = '正在验证中...'
          break
        case CaptchaStatus.SUCCESS:
          message = '验证成功！'
          type = 'success'
          break
        case CaptchaStatus.FAILED:
          message = '验证失败，请重试'
          type = 'error'
          break
        case CaptchaStatus.ERROR:
          message = '发生错误'
          type = 'error'
          break
      }
      
      if (message) {
        showStatus(containerId, type, message)
      }
    },
    onRetry: () => {
      console.log(`[${containerId}] 重试验证`)
      showStatus(containerId, 'info', '正在重试...')
    },
    onProgress: (data) => {
      console.log(`[${containerId}] 验证进度:`, data)
    }
  }
}

// 滑动拼图验证
window.initSlidePuzzle = async function() {
  try {
    if (captchaInstances.slidePuzzle) {
      captchaInstances.slidePuzzle.destroy()
    }
    
    captchaInstances.slidePuzzle = new SlidePuzzleCaptcha({
      container: document.getElementById('slidePuzzleContainer'),
      width: 350,
      height: 200,
      debug: true,
      tolerance: 5,
      ...createEventHandlers('slidePuzzle')
    })
    
    await captchaInstances.slidePuzzle.init()
    console.log('滑动拼图验证初始化完成')
  } catch (error) {
    console.error('滑动拼图验证初始化失败:', error)
    showStatus('slidePuzzle', 'error', '初始化失败')
  }
}

window.resetSlidePuzzle = function() {
  if (captchaInstances.slidePuzzle) {
    captchaInstances.slidePuzzle.reset()
  }
}

window.startSlidePuzzle = function() {
  if (captchaInstances.slidePuzzle) {
    captchaInstances.slidePuzzle.start()
  }
}

// 按顺序点击文字验证
window.initClickText = async function() {
  try {
    if (captchaInstances.clickText) {
      captchaInstances.clickText.destroy()
    }
    
    captchaInstances.clickText = new ClickTextCaptcha({
      container: document.getElementById('clickTextContainer'),
      width: 350,
      height: 200,
      debug: true,
      textCount: 4,
      texts: ['春', '夏', '秋', '冬', '东', '南', '西', '北', '红', '橙', '黄', '绿', '青', '蓝', '紫'],
      ...createEventHandlers('clickText')
    })
    
    await captchaInstances.clickText.init()
    console.log('点击文字验证初始化完成')
  } catch (error) {
    console.error('点击文字验证初始化失败:', error)
    showStatus('clickText', 'error', '初始化失败')
  }
}

window.resetClickText = function() {
  if (captchaInstances.clickText) {
    captchaInstances.clickText.reset()
  }
}

window.startClickText = function() {
  if (captchaInstances.clickText) {
    captchaInstances.clickText.start()
  }
}

// 滑动滑块图片回正验证
window.initRotateSlider = async function() {
  try {
    if (captchaInstances.rotateSlider) {
      captchaInstances.rotateSlider.destroy()
    }
    
    captchaInstances.rotateSlider = new RotateSliderCaptcha({
      container: document.getElementById('rotateSliderContainer'),
      width: 350,
      height: 250,
      debug: true,
      tolerance: 8,
      sliderStyle: 'circular', // 或 'linear'
      targetAngle: 0,
      ...createEventHandlers('rotateSlider')
    })
    
    await captchaInstances.rotateSlider.init()
    console.log('旋转滑块验证初始化完成')
  } catch (error) {
    console.error('旋转滑块验证初始化失败:', error)
    showStatus('rotateSlider', 'error', '初始化失败')
  }
}

window.resetRotateSlider = function() {
  if (captchaInstances.rotateSlider) {
    captchaInstances.rotateSlider.reset()
  }
}

window.startRotateSlider = function() {
  if (captchaInstances.rotateSlider) {
    captchaInstances.rotateSlider.start()
  }
}

// 点击验证
window.initClick = async function() {
  try {
    if (captchaInstances.click) {
      captchaInstances.click.destroy()
    }
    
    captchaInstances.click = new ClickCaptcha({
      container: document.getElementById('clickContainer'),
      width: 350,
      height: 200,
      debug: true,
      tolerance: 15,
      maxClicks: 3,
      ...createEventHandlers('click')
    })
    
    await captchaInstances.click.init()
    console.log('点击验证初始化完成')
  } catch (error) {
    console.error('点击验证初始化失败:', error)
    showStatus('click', 'error', '初始化失败')
  }
}

window.resetClick = function() {
  if (captchaInstances.click) {
    captchaInstances.click.reset()
  }
}

window.startClick = function() {
  if (captchaInstances.click) {
    captchaInstances.click.start()
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  console.log('@ldesign/captcha 基础示例已加载')
  
  // 初始化主题切换器
  initThemeSwitcher()
  
  // 自动初始化所有验证码
  setTimeout(() => {
    initSlidePuzzle()
    initClickText()
    initRotateSlider()
    initClick()
  }, 500)
})

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  Object.values(captchaInstances).forEach(instance => {
    if (instance) {
      instance.destroy()
    }
  })
})
