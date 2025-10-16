/**
 * 原生JS示例主文件
 */

import {
  calculateSizeScale,
  compareSizeModes,
  formatCSSValue,
  getNextSizeMode,
  getPreviousSizeMode,
  getSizeModeDisplayName,
  globalSizeManager,
  isValidSizeMode,
  parseCSSValue,
  parseSizeMode,
  type SizeMode,
} from '../../../src'

// 全局状态
const currentManager = globalSizeManager
let currentMode: SizeMode = 'medium'

// DOM元素引用
const elements = {
  currentModeEl: document.getElementById('currentMode') as HTMLElement,
  currentModeDisplay: document.querySelector(
    '.current-mode-display',
  ) as HTMLElement,
  sizeBtns: document.querySelectorAll(
    '.size-btn',
  ) as NodeListOf<HTMLButtonElement>,
  managerModeEl: document.getElementById('managerMode') as HTMLElement,
  baseFontSizeEl: document.getElementById('baseFontSize') as HTMLElement,
  baseSpacingEl: document.getElementById('baseSpacing') as HTMLElement,
  cssVariablesEl: document.getElementById('cssVariables') as HTMLElement,
  responsiveLayoutEl: document.getElementById(
    'responsiveLayout',
  ) as HTMLElement,
  utilsResultEl: document.getElementById('utilsResult') as HTMLElement,
  cssUtilsResultEl: document.getElementById('cssUtilsResult') as HTMLElement,
}

/**
 * 初始化应用
 */
function initApp() {
  

  // 设置初始状态
  updateUI()
  updateLayoutClass()

  // 绑定事件监听器
  bindEventListeners()

  // 监听尺寸变化
  currentManager.onSizeChange((event: any) => {
    
    currentMode = event.currentMode
    updateUI()
    updateLayoutClass()
  })

  
}

/**
 * 绑定事件监听器
 */
function bindEventListeners() {
  // 尺寸切换按钮
  elements.sizeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode as SizeMode
      if (isValidSizeMode(mode)) {
        setMode(mode)
      }
    })
  })

  // 上一个/下一个模式按钮
  const prevBtn = document.getElementById('prevModeBtn')
  const nextBtn = document.getElementById('nextModeBtn')

  prevBtn?.addEventListener('click', () => {
    const prevMode = getPreviousSizeMode(currentMode)
    setMode(prevMode)
  })

  nextBtn?.addEventListener('click', () => {
    const nextMode = getNextSizeMode(currentMode)
    setMode(nextMode)
  })

  // CSS生成和注入按钮
  const generateCSSBtn = document.getElementById('generateCSSBtn')
  const injectCSSBtn = document.getElementById('injectCSSBtn')

  generateCSSBtn?.addEventListener('click', generateCSS)
  injectCSSBtn?.addEventListener('click', injectCSS)

  // 工具函数演示按钮
  const validateModeBtn = document.getElementById('validateModeBtn')
  const compareModeBtn = document.getElementById('compareModeBtn')
  const parseModeBtn = document.getElementById('parseModeBtn')

  validateModeBtn?.addEventListener('click', demoValidateMode)
  compareModeBtn?.addEventListener('click', demoCompareMode)
  parseModeBtn?.addEventListener('click', demoParseMode)

  // CSS工具函数演示按钮
  const formatValueBtn = document.getElementById('formatValueBtn')
  const parseValueBtn = document.getElementById('parseValueBtn')
  const scaleCalcBtn = document.getElementById('scaleCalcBtn')

  formatValueBtn?.addEventListener('click', demoFormatValue)
  parseValueBtn?.addEventListener('click', demoParseValue)
  scaleCalcBtn?.addEventListener('click', demoScaleCalc)
}

/**
 * 设置尺寸模式
 */
function setMode(mode: SizeMode) {
  currentManager.setMode(mode)
  currentMode = mode
}

/**
 * 更新UI显示
 */
function updateUI() {
  // 更新当前模式显示
  if (elements.currentModeEl) {
    elements.currentModeEl.textContent = currentMode
  }

  if (elements.currentModeDisplay) {
    elements.currentModeDisplay.textContent = ` (${getSizeModeDisplayName(
      currentMode,
    )})`
  }

  // 更新按钮状态
  elements.sizeBtns.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === currentMode)
  })

  // 更新管理器信息
  const config = currentManager.getConfig()

  if (elements.managerModeEl) {
    elements.managerModeEl.textContent = currentMode
  }

  if (elements.baseFontSizeEl) {
    elements.baseFontSizeEl.textContent = config.fontSize.base
  }

  if (elements.baseSpacingEl) {
    elements.baseSpacingEl.textContent = config.spacing.base
  }
}

/**
 * 更新布局类名
 */
function updateLayoutClass() {
  if (elements.responsiveLayoutEl) {
    // 移除所有布局类
    elements.responsiveLayoutEl.className = 'responsive-layout'

    // 添加当前模式的布局类
    elements.responsiveLayoutEl.classList.add(`layout-${currentMode}`)

    // 设置网格列数
    const columnCount = getColumnCount(currentMode)
    elements.responsiveLayoutEl.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`
  }
}

/**
 * 根据模式获取列数
 */
function getColumnCount(mode: SizeMode): number {
  switch (mode) {
    case 'small':
      return 1
    case 'medium':
      return 2
    case 'large':
      return 3
    case 'extra-large':
      return 4
    default:
      return 2
  }
}

/**
 * 生成CSS变量
 */
function generateCSS() {
  const variables = currentManager.generateCSSVariables()
  const cssString = Object.entries(variables)
    .map(([name, value]) => `${name}: ${value};`)
    .join('\n')

  if (elements.cssVariablesEl) {
    elements.cssVariablesEl.textContent = `:root {\n${cssString}\n}`
  }
}

/**
 * 注入CSS变量
 */
function injectCSS() {
  currentManager.injectCSS()

  // 显示成功消息
  if (elements.cssVariablesEl) {
    const originalText = elements.cssVariablesEl.textContent
    elements.cssVariablesEl.textContent = '✅ CSS变量已成功注入到页面中！'

    setTimeout(() => {
      if (originalText) {
        elements.cssVariablesEl.textContent = originalText
      }
    }, 2000)
  }
}

/**
 * 演示模式验证
 */
function demoValidateMode() {
  const testModes = ['small', 'invalid', 'large', 'xl', 'medium']
  const results = testModes.map(mode => ({
    mode,
    valid: isValidSizeMode(mode),
  }))

  const resultText = results
    .map(({ mode, valid }) => `${mode}: ${valid ? '✅' : '❌'}`)
    .join('\n')

  if (elements.utilsResultEl) {
    elements.utilsResultEl.innerHTML = `<pre>模式验证结果:\n${resultText}</pre>`
  }
}

/**
 * 演示模式比较
 */
function demoCompareMode() {
  const comparisons = [
    ['small', 'medium'],
    ['large', 'small'],
    ['medium', 'medium'],
    ['extra-large', 'large'],
  ]

  const results = comparisons.map(([mode1, mode2]) => {
    const result = compareSizeModes(mode1 as SizeMode, mode2 as SizeMode)
    let comparison = '='
    if (result < 0)
      comparison = '<'
    if (result > 0)
      comparison = '>'

    return `${mode1} ${comparison} ${mode2}`
  })

  if (elements.utilsResultEl) {
    elements.utilsResultEl.innerHTML = `<pre>模式比较结果:\n${results.join(
      '\n',
    )}</pre>`
  }
}

/**
 * 演示模式解析
 */
function demoParseMode() {
  const testInputs = ['s', 'm', 'l', 'xl', '小', '中', '大', '超大', 'invalid']
  const results = testInputs.map(input => ({
    input,
    parsed: parseSizeMode(input),
  }))

  const resultText = results
    .map(({ input, parsed }) => `"${input}" → ${parsed || 'null'}`)
    .join('\n')

  if (elements.utilsResultEl) {
    elements.utilsResultEl.innerHTML = `<pre>模式解析结果:\n${resultText}</pre>`
  }
}

/**
 * 演示值格式化
 */
function demoFormatValue() {
  const testValues = [
    [16, undefined],
    [1.5, 'rem'],
    [100, '%'],
    ['auto', undefined],
  ]

  const results = testValues.map(([value, unit]) => {
    const formatted = formatCSSValue(value as any, unit as any)
    return `${JSON.stringify(value)}${
      unit ? ` + "${unit}"` : ''
    } → "${formatted}"`
  })

  if (elements.cssUtilsResultEl) {
    elements.cssUtilsResultEl.innerHTML = `<pre>值格式化结果:\n${results.join(
      '\n',
    )}</pre>`
  }
}

/**
 * 演示值解析
 */
function demoParseValue() {
  const testValues = ['16px', '1.5rem', '100%', '0', '-10px']
  const results = testValues.map((value) => {
    const parsed = parseCSSValue(value)
    return `"${value}" → {number: ${parsed.number}, unit: "${parsed.unit}"}`
  })

  if (elements.cssUtilsResultEl) {
    elements.cssUtilsResultEl.innerHTML = `<pre>值解析结果:\n${results.join(
      '\n',
    )}</pre>`
  }
}

/**
 * 演示缩放计算
 */
function demoScaleCalc() {
  const comparisons = [
    ['small', 'medium'],
    ['medium', 'large'],
    ['small', 'extra-large'],
    ['large', 'small'],
  ]

  const results = comparisons.map(([from, to]) => {
    const scale = calculateSizeScale(from as SizeMode, to as SizeMode)
    return `${from} → ${to}: ${scale.toFixed(3)}x`
  })

  if (elements.cssUtilsResultEl) {
    elements.cssUtilsResultEl.innerHTML = `<pre>缩放比例计算:\n${results.join(
      '\n',
    )}</pre>`
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp)
