<script setup lang="ts">
import { ref } from 'vue'
import {
  hexToRgb,
  rgbToHsl,
  generateMonochromaticPalette,
  checkAccessibility,
  blendColors,
  generateAnalogousPalette,
  generateComplementaryPalette
} from '@ldesign/color'

// 当前选中的演示标签
const activeTab = ref('converter')

const tabs = [
  { key: 'converter', label: '颜色转换', icon: '🎨' },
  { key: 'mixer', label: '颜色混合', icon: '🌈' },
  { key: 'palette', label: '调色板生成', icon: '🎯' },
  { key: 'accessibility', label: '可访问性检查', icon: '♿' },
]

// 颜色转换演示
const inputColor = ref('#1890ff')
const convertedColors = ref({
  rgb: { r: 24, g: 144, b: 255 },
  hsl: { h: 210, s: 100, l: 55 }
})

const updateConvertedColors = () => {
  try {
    const rgb = hexToRgb(inputColor.value)
    if (rgb) {
      convertedColors.value.rgb = rgb
      convertedColors.value.hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    }
  } catch (error) {
    console.error('颜色转换失败:', error)
  }
}

// 颜色混合演示
const mixerColor1 = ref('#ff0000')
const mixerColor2 = ref('#0000ff')
const mixedColor = ref('#800080')

const updateMixedColor = () => {
  try {
    mixedColor.value = blendColors(mixerColor1.value, mixerColor2.value, 'normal', 0.5)
  } catch (error) {
    console.error('颜色混合失败:', error)
  }
}

// 调色板生成演示
const paletteBaseColor = ref('#1890ff')
const paletteType = ref('monochromatic')
const generatedPalette = ref<string[]>([])

const generatePalette = () => {
  try {
    switch (paletteType.value) {
      case 'monochromatic':
        generatedPalette.value = generateMonochromaticPalette(paletteBaseColor.value, 5)
        break
      case 'analogous':
        generatedPalette.value = generateAnalogousPalette(paletteBaseColor.value, 5)
        break
      case 'complementary':
        generatedPalette.value = generateComplementaryPalette(paletteBaseColor.value)
        break
      default:
        generatedPalette.value = generateMonochromaticPalette(paletteBaseColor.value, 5)
    }
  } catch (error) {
    console.error('调色板生成失败:', error)
  }
}

// 可访问性检查演示
const accessibilityFg = ref('#000000')
const accessibilityBg = ref('#ffffff')
const accessibilityResult = ref({ ratio: 21, level: 'AAA' })

const checkColorAccessibility = () => {
  try {
    const result = checkAccessibility(accessibilityFg.value, accessibilityBg.value, 'normal')
    accessibilityResult.value = {
      ratio: result.ratio,
      level: result.level
    }
  } catch (error) {
    console.error('可访问性检查失败:', error)
  }
}

// 初始化演示数据
updateConvertedColors()
updateMixedColor()
generatePalette()
checkColorAccessibility()




</script>

<template>
  <div class="app">
    <!-- 头部 -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <h1>@ldesign/color 🎨</h1>
          <p>功能强大的现代颜色处理库演示</p>
        </div>
      </div>
    </header>

    <!-- 导航标签 -->
    <nav class="nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="['tab', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- 主要内容 -->
    <main class="main">
      <div class="container">
        <!-- 颜色转换演示 -->
        <div v-if="activeTab === 'converter'" class="demo-section">
          <h2>🎨 颜色格式转换</h2>
          <p>支持 HEX、RGB、HSL、HSV 等格式的相互转换</p>

          <div class="converter-demo">
            <div class="input-group">
              <label>输入颜色 (HEX):</label>
              <input
                v-model="inputColor"
                type="color"
                @input="updateConvertedColors"
              />
              <input
                v-model="inputColor"
                type="text"
                @input="updateConvertedColors"
                placeholder="#1890ff"
              />
            </div>

            <div class="color-preview" :style="{ backgroundColor: inputColor }">
              <span>{{ inputColor }}</span>
            </div>

            <div class="conversion-results">
              <div class="result-item">
                <strong>RGB:</strong>
                rgb({{ convertedColors.rgb.r }}, {{ convertedColors.rgb.g }}, {{ convertedColors.rgb.b }})
              </div>
              <div class="result-item">
                <strong>HSL:</strong>
                hsl({{ convertedColors.hsl.h }}°, {{ convertedColors.hsl.s }}%, {{ convertedColors.hsl.l }}%)
              </div>
            </div>
          </div>
        </div>

        <!-- 颜色混合演示 -->
        <div v-if="activeTab === 'mixer'" class="demo-section">
          <h2>🌈 颜色混合</h2>
          <p>支持多种混合模式的颜色混合功能</p>

          <div class="mixer-demo">
            <div class="input-group">
              <label>颜色 1:</label>
              <input
                v-model="mixerColor1"
                type="color"
                @input="updateMixedColor"
              />
              <input
                v-model="mixerColor1"
                type="text"
                @input="updateMixedColor"
              />
            </div>

            <div class="input-group">
              <label>颜色 2:</label>
              <input
                v-model="mixerColor2"
                type="color"
                @input="updateMixedColor"
              />
              <input
                v-model="mixerColor2"
                type="text"
                @input="updateMixedColor"
              />
            </div>

            <div class="color-preview" :style="{ backgroundColor: mixedColor }">
              <span>混合结果: {{ mixedColor }}</span>
            </div>
          </div>
        </div>

        <!-- 调色板生成演示 -->
        <div v-if="activeTab === 'palette'" class="demo-section">
          <h2>🎯 调色板生成</h2>
          <p>基于色彩理论生成专业的调色板</p>

          <div class="palette-demo">
            <div class="input-group">
              <label>基础颜色:</label>
              <input
                v-model="paletteBaseColor"
                type="color"
                @input="generatePalette"
              />
              <input
                v-model="paletteBaseColor"
                type="text"
                @input="generatePalette"
              />
            </div>

            <div class="input-group">
              <label>调色板类型:</label>
              <select v-model="paletteType" @change="generatePalette">
                <option value="monochromatic">单色调</option>
                <option value="analogous">类似色</option>
                <option value="complementary">互补色</option>
              </select>
            </div>

            <div class="palette-colors">
              <div
                v-for="(color, index) in generatedPalette"
                :key="index"
                class="palette-color"
                :style="{ backgroundColor: color }"
                :title="color"
              >
                {{ color }}
              </div>
            </div>
          </div>
        </div>

        <!-- 可访问性检查演示 -->
        <div v-if="activeTab === 'accessibility'" class="demo-section">
          <h2>♿ 可访问性检查</h2>
          <p>WCAG 标准对比度检查和颜色盲模拟</p>

          <div class="accessibility-demo">
            <div class="input-group">
              <label>前景色 (文字):</label>
              <input
                v-model="accessibilityFg"
                type="color"
                @input="checkColorAccessibility"
              />
              <input
                v-model="accessibilityFg"
                type="text"
                @input="checkColorAccessibility"
              />
            </div>

            <div class="input-group">
              <label>背景色:</label>
              <input
                v-model="accessibilityBg"
                type="color"
                @input="checkColorAccessibility"
              />
              <input
                v-model="accessibilityBg"
                type="text"
                @input="checkColorAccessibility"
              />
            </div>

            <div class="accessibility-result">
              <div
                class="text-preview"
                :style="{
                  color: accessibilityFg,
                  backgroundColor: accessibilityBg
                }"
              >
                示例文本 Sample Text
              </div>

              <div class="result-info">
                <div class="result-item">
                  <strong>对比度比值:</strong> {{ accessibilityResult.ratio.toFixed(2) }}:1
                </div>
                <div class="result-item">
                  <strong>WCAG 等级:</strong>
                  <span :class="['level', accessibilityResult.level.toLowerCase()]">
                    {{ accessibilityResult.level }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>&copy; 2024 @ldesign/color - 现代颜色处理解决方案</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.header {
  background: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-left h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-left p {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 1rem;
}

.nav-tabs {
  background: white;
  border-bottom: 1px solid #e5e5e5;
  padding: 0 2rem;
  display: flex;
  gap: 0;
  max-width: 1200px;
  margin: 0 auto;
  overflow-x: auto;
}

.tab {
  background: none;
  border: none;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
  white-space: nowrap;
  color: #666;
}

.tab:hover {
  background: #f5f5f5;
  color: #000;
}

.tab.active {
  color: #1890ff;
  border-bottom-color: #1890ff;
  background: #e6f7ff;
}

.tab-icon {
  font-size: 1.2rem;
}

.tab-label {
  font-weight: 500;
}

.main {
  flex: 1;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e5e5;
}

.demo-section h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.demo-section p {
  margin: 0 0 2rem 0;
  color: #666;
}

.converter-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-group label {
  font-weight: 500;
  min-width: 120px;
}

.input-group input[type="color"] {
  width: 60px;
  height: 40px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  cursor: pointer;
}

.input-group input[type="text"] {
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  font-family: monospace;
  min-width: 120px;
}

.color-preview {
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 1px solid #e5e5e5;
}

.conversion-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-family: monospace;
  border: 1px solid #e5e5e5;
}

/* 颜色混合演示样式 */
.mixer-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 调色板演示样式 */
.palette-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.palette-colors {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.palette-color {
  width: 120px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 8px;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  border: 1px solid #e5e5e5;
  font-size: 0.8rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.palette-color:hover {
  transform: scale(1.05);
}

/* 可访问性演示样式 */
.accessibility-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.accessibility-result {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.text-preview {
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 500;
  border: 1px solid #e5e5e5;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.level {
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.level.aaa {
  background: #52c41a;
  color: white;
}

.level.aa {
  background: #faad14;
  color: white;
}

.level.fail {
  background: #f5222d;
  color: white;
}

select {
  padding: 8px 12px;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  background: white;
  font-size: 1rem;
}

.footer {
  background: white;
  border-top: 1px solid #e5e5e5;
  padding: 2rem 0;
  text-align: center;
  color: #666;
}

.footer p {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    padding: 0 1rem;
  }

  .nav-tabs {
    padding: 0 1rem;
  }

  .container {
    padding: 0 1rem;
  }

  .demo-section {
    padding: 1rem;
  }

  .tab {
    padding: 0.75rem 1rem;
  }

  .tab-label {
    display: none;
  }

  .input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group label {
    min-width: auto;
  }
}
</style>
