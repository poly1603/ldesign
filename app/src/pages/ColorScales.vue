<template>
  <div class="color-scales-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">🎨 色阶展示</h1>
      <p class="page-description">
        展示 @ldesign/color 生成的所有10级色阶，包括主色调、功能色和中性色
      </p>
    </div>

    <!-- 主题控制 -->
    <div class="theme-controls">
      <div class="control-group">
        <label for="theme-select">主题选择：</label>
        <select id="theme-select" v-model="selectedTheme" @change="handleThemeChange">
          <option value="">选择主题</option>
          <option v-for="theme in availableThemes" :key="theme" :value="theme">
            {{ getThemeDisplayName(theme) }}
          </option>
        </select>
      </div>
      
      <div class="control-group">
        <label for="mode-select">模式选择：</label>
        <select id="mode-select" v-model="selectedMode" @change="handleModeChange">
          <option value="light">亮色模式</option>
          <option value="dark">暗色模式</option>
        </select>
      </div>
    </div>

    <!-- 色阶展示区域 -->
    <div class="scales-container">
      <!-- 主色调色阶 -->
      <div class="scale-section">
        <h2 class="section-title">主色调 (Primary)</h2>
        <div class="color-scale">
          <div 
            v-for="(color, index) in primaryScale" 
            :key="`primary-${index}`"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="copyColor(color)"
          >
            <div class="color-info">
              <span class="color-index">{{ index + 1 }}</span>
              <span class="color-value">{{ color }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 功能色色阶 -->
      <div class="scale-section">
        <h2 class="section-title">功能色</h2>
        
        <!-- 成功色 -->
        <div class="functional-color">
          <h3 class="color-title">成功色 (Success)</h3>
          <div class="color-scale">
            <div 
              v-for="(color, index) in successScale" 
              :key="`success-${index}`"
              class="color-item"
              :style="{ backgroundColor: color }"
              @click="copyColor(color)"
            >
              <div class="color-info">
                <span class="color-index">{{ index + 1 }}</span>
                <span class="color-value">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 警告色 -->
        <div class="functional-color">
          <h3 class="color-title">警告色 (Warning)</h3>
          <div class="color-scale">
            <div 
              v-for="(color, index) in warningScale" 
              :key="`warning-${index}`"
              class="color-item"
              :style="{ backgroundColor: color }"
              @click="copyColor(color)"
            >
              <div class="color-info">
                <span class="color-index">{{ index + 1 }}</span>
                <span class="color-value">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 危险色 -->
        <div class="functional-color">
          <h3 class="color-title">危险色 (Danger)</h3>
          <div class="color-scale">
            <div 
              v-for="(color, index) in dangerScale" 
              :key="`danger-${index}`"
              class="color-item"
              :style="{ backgroundColor: color }"
              @click="copyColor(color)"
            >
              <div class="color-info">
                <span class="color-index">{{ index + 1 }}</span>
                <span class="color-value">{{ color }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 中性色色阶 -->
      <div class="scale-section">
        <h2 class="section-title">中性色 (Gray)</h2>
        <div class="color-scale">
          <div 
            v-for="(color, index) in grayScale" 
            :key="`gray-${index}`"
            class="color-item"
            :style="{ backgroundColor: color }"
            @click="copyColor(color)"
          >
            <div class="color-info">
              <span class="color-index">{{ index + 1 }}</span>
              <span class="color-value">{{ color }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="usage-guide">
      <h2 class="section-title">使用说明</h2>
      <div class="guide-content">
        <div class="guide-item">
          <h3>🎯 色阶规则</h3>
          <p>每个颜色类别都包含10个色阶，从浅到深依次编号1-10</p>
          <ul>
            <li><strong>1-3级</strong>：浅色调，适用于背景、悬停状态</li>
            <li><strong>4-6级</strong>：中等色调，适用于边框、次要元素</li>
            <li><strong>7-10级</strong>：深色调，适用于文本、主要元素</li>
          </ul>
        </div>
        
        <div class="guide-item">
          <h3>💡 使用方式</h3>
          <p>在CSS中使用生成的CSS变量：</p>
          <pre><code>/* 主色调第6级 */
color: var(--ldesign-brand-color-6);

/* 成功色第3级 */
background: var(--ldesign-success-color-3);

/* 中性色第8级 */
border-color: var(--ldesign-gray-color-8);</code></pre>
        </div>
        
        <div class="guide-item">
          <h3>🔄 暗色模式</h3>
          <p>暗色模式下色阶会自动调整，确保在深色背景下的可读性和对比度</p>
        </div>
      </div>
    </div>

    <!-- 复制提示 -->
    <div v-if="copyMessage" class="copy-toast">
      {{ copyMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

// 响应式数据
const selectedTheme = ref('')
const selectedMode = ref<'light' | 'dark'>('light')
const availableThemes = ref<string[]>([])
const copyMessage = ref('')

// 色阶数据
const primaryScale = ref<string[]>([])
const successScale = ref<string[]>([])
const warningScale = ref<string[]>([])
const dangerScale = ref<string[]>([])
const grayScale = ref<string[]>([])

// 主题显示名称映射
const themeDisplayNames: Record<string, string> = {
  'default': '默认主题',
  'arco-blue': 'Arco蓝',
  'arco-green': 'Arco绿',
  'arco-purple': 'Arco紫',
  'sunset-orange': '日落橙',
  'sky-cyan': '天空青',
  'calendula': '金盏花',
  'midnight-blue': '午夜蓝',
  'graphite-gray': '石墨灰',
  'lavender': '薰衣草',
  'forest-green': '森林绿',
  'brand': '品牌主题',
  'ocean': '海洋主题'
}

/**
 * 获取主题显示名称
 */
function getThemeDisplayName(theme: string): string {
  return themeDisplayNames[theme] || theme
}

/**
 * 从CSS变量中提取色阶
 */
function extractColorScale(prefix: string): string[] {
  const colors: string[] = []
  const computedStyle = getComputedStyle(document.documentElement)

  for (let i = 1; i <= 10; i++) {
    const varName = `--ldesign-${prefix}-color-${i}`
    const color = computedStyle.getPropertyValue(varName).trim()
    if (color) {
      colors.push(color)
    } else {
      // 如果没有找到带数字的变量，尝试基础变量
      const baseVarName = `--ldesign-${prefix}-color`
      const baseColor = computedStyle.getPropertyValue(baseVarName).trim()
      if (baseColor && i === 6) { // 通常基础色是第6级
        colors.push(baseColor)
      } else {
        // 为不同色阶生成渐变色作为占位
        const baseHue = prefix === 'danger' ? 0 : prefix === 'warning' ? 45 : prefix === 'success' ? 120 : 240
        const lightness = 90 - (i - 1) * 8 // 从90%到18%
        colors.push(`hsl(${baseHue}, 70%, ${lightness}%)`)
      }
    }
  }

  return colors
}

/**
 * 更新色阶数据
 */
function updateColorScales() {
  primaryScale.value = extractColorScale('brand')
  successScale.value = extractColorScale('success')
  warningScale.value = extractColorScale('warning')
  dangerScale.value = extractColorScale('danger')
  grayScale.value = extractColorScale('gray')
}

/**
 * 处理主题变化
 */
function handleThemeChange() {
  if (selectedTheme.value) {
    // 直接调用全局主题切换函数
    const themeSelect = document.querySelector('.theme-selector select') as HTMLSelectElement
    if (themeSelect) {
      themeSelect.value = getThemeSelectValue(selectedTheme.value)
      themeSelect.dispatchEvent(new Event('change'))
    }

    // 延迟更新色阶以确保CSS变量已更新
    setTimeout(updateColorScales, 200)
  }
}

/**
 * 处理模式变化
 */
function handleModeChange() {
  // 直接调用全局暗色模式切换函数
  const darkModeButton = document.querySelector('.dark-mode-toggle') as HTMLButtonElement
  if (darkModeButton && selectedMode.value === 'dark') {
    const currentMode = document.body.getAttribute('data-theme-mode')
    if (currentMode !== 'dark') {
      darkModeButton.click()
    }
  } else if (darkModeButton && selectedMode.value === 'light') {
    const currentMode = document.body.getAttribute('data-theme-mode')
    if (currentMode === 'dark') {
      darkModeButton.click()
    }
  }

  // 延迟更新色阶以确保CSS变量已更新
  setTimeout(updateColorScales, 200)
}

/**
 * 获取主题选择器的值
 */
function getThemeSelectValue(theme: string): string {
  const themeMap: Record<string, string> = {
    'default': '',
    'arco-blue': 'Arco蓝',
    'arco-green': 'Arco绿',
    'arco-purple': 'Arco紫',
    'sunset-orange': '日落橙',
    'sky-cyan': '天空青',
    'calendula': '金盏花',
    'midnight-blue': '午夜蓝',
    'graphite-gray': '石墨灰',
    'lavender': '薰衣草',
    'forest-green': '森林绿',
    'brand': '品牌主题',
    'ocean': '海洋主题'
  }
  return themeMap[theme] || theme
}

/**
 * 复制颜色值
 */
async function copyColor(color: string) {
  try {
    await navigator.clipboard.writeText(color)
    copyMessage.value = `已复制: ${color}`
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
    copyMessage.value = '复制失败'
    setTimeout(() => {
      copyMessage.value = ''
    }, 2000)
  }
}

/**
 * 同步全局主题状态
 */
function syncGlobalTheme() {
  // 获取当前全局主题
  const themeSelect = document.querySelector('.theme-selector select') as HTMLSelectElement
  if (themeSelect) {
    const currentTheme = themeSelect.value
    // 反向映射主题名称
    const themeReverseMap: Record<string, string> = {
      'Arco蓝': 'arco-blue',
      'Arco绿': 'arco-green',
      'Arco紫': 'arco-purple',
      '日落橙': 'sunset-orange',
      '天空青': 'sky-cyan',
      '金盏花': 'calendula',
      '午夜蓝': 'midnight-blue',
      '石墨灰': 'graphite-gray',
      '薰衣草': 'lavender',
      '森林绿': 'forest-green',
      '品牌主题': 'brand',
      '海洋主题': 'ocean'
    }
    selectedTheme.value = themeReverseMap[currentTheme] || 'arco-blue'
  }

  // 获取当前模式
  const currentMode = document.body.getAttribute('data-theme-mode')
  selectedMode.value = currentMode === 'dark' ? 'dark' : 'light'
}

/**
 * 初始化
 */
onMounted(() => {
  // 获取可用主题列表
  availableThemes.value = [
    'default', 'arco-blue', 'arco-green', 'arco-purple',
    'sunset-orange', 'sky-cyan', 'calendula', 'midnight-blue',
    'graphite-gray', 'lavender', 'forest-green', 'brand', 'ocean'
  ]

  // 同步全局主题状态
  syncGlobalTheme()

  // 初始化色阶数据
  updateColorScales()

  // 监听全局主题变化事件
  window.addEventListener('theme-updated', () => {
    syncGlobalTheme()
    updateColorScales()
  })

  // 监听DOM变化以检测主题切换
  const observer = new MutationObserver(() => {
    syncGlobalTheme()
    updateColorScales()
  })

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-theme-mode']
  })

  // 定期同步主题状态
  setInterval(() => {
    syncGlobalTheme()
    updateColorScales()
  }, 1000)
})
</script>

<style lang="less" scoped>
.color-scales-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 1rem;
  }

  .page-description {
    font-size: 1.1rem;
    color: var(--color-text-secondary);
    max-width: 600px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

.theme-controls {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 1.5rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);

  .control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    label {
      font-weight: 500;
      color: var(--color-text);
      white-space: nowrap;
    }

    select {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      background: var(--color-bg);
      color: var(--color-text);
      font-size: 0.9rem;
      min-width: 150px;

      &:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 2px var(--color-primary-lighter);
      }
    }
  }
}

.scales-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.scale-section {
  display: flex;
  flex-direction: column;

  .section-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1rem;
    text-align: center;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--color-primary);
  }
}

.functional-color {
  display: flex;
  flex-direction: column;

  .color-title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--color-text);
    margin-bottom: 0.8rem;
    text-align: center;
  }
}

.color-scale {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.color-item {
  height: 60px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--color-border);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .color-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 0.3rem;
    font-size: 0.7rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }

  &:hover .color-info {
    transform: translateY(0);
  }

  .color-index {
    font-weight: 600;
    font-size: 0.8rem;
  }

  .color-value {
    font-family: 'Courier New', monospace;
    font-size: 0.6rem;
  }
}

.usage-guide {
  margin-top: 4rem;
  padding: 2rem;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--color-border);

  .section-title {
    font-size: 1.8rem;
    font-weight: 600;
    color: var(--color-text);
    margin-bottom: 1.5rem;
  }

  .guide-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .guide-item {
    h3 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: 0.8rem;
    }

    p {
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    ul {
      color: var(--color-text-secondary);
      padding-left: 1.5rem;

      li {
        margin-bottom: 0.5rem;
        line-height: 1.5;

        strong {
          color: var(--color-text);
        }
      }
    }

    pre {
      background: var(--color-bg-tertiary);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      font-size: 0.85rem;

      code {
        color: var(--color-text);
        font-family: 'Courier New', monospace;
      }
    }
  }
}

.copy-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: var(--color-success);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-scales-page {
    padding: 1rem;
  }

  .page-header .page-title {
    font-size: 2rem;
  }

  .theme-controls {
    flex-direction: column;
    gap: 1rem;

    .control-group {
      justify-content: center;
    }
  }

  .color-scale {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.5rem;
  }

  .guide-content {
    grid-template-columns: 1fr;
  }
}
</style>
