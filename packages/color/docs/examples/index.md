# 示例项目

通过实际示例学习如何使用 @ldesign/color 的各种功能。

## 🚀 在线演示

体验 @ldesign/color 的强大功能：

- [🎨 颜色转换器](./color-converter.md) - 实时颜色格式转换
- [🌈 调色板工具](./palette-tool.md) - 智能调色板生成
- [🎯 主题切换器](./theme-switcher.md) - 动态主题管理
- [♿ 可访问性检查器](./accessibility-checker.md) - WCAG 标准检查

## 📱 集成示例

学习如何在不同框架中集成：

- [Vue 3 项目](./vue3-integration.md) - 完整的 Vue 3 集成示例
- [Nuxt 3 项目](./nuxt3-integration.md) - Nuxt 3 SSR 支持
- [Vite 项目](./vite-integration.md) - Vite 构建工具集成

## 🎨 基础示例

### 颜色转换

```vue
<template>
  <div class="color-converter">
    <h3>颜色转换器</h3>

    <div class="input-group">
      <label>输入颜色 (HEX):</label>
      <input
        v-model="hexColor"
        type="text"
        placeholder="#1890ff"
        @input="convertColor"
      />
    </div>

    <div class="results" v-if="results">
      <div class="color-preview" :style="{ backgroundColor: hexColor }"></div>

      <div class="conversions">
        <p><strong>RGB:</strong> {{ results.rgb }}</p>
        <p><strong>HSL:</strong> {{ results.hsl }}</p>
        <p><strong>HSV:</strong> {{ results.hsv }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { hexToRgb, rgbToHsl, rgbToHsv } from '@ldesign/color'

const hexColor = ref('#1890ff')
const results = reactive({
  rgb: null,
  hsl: null,
  hsv: null,
})

function convertColor() {
  try {
    const rgb = hexToRgb(hexColor.value)
    if (rgb) {
      results.rgb = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`

      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
      results.hsl = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`

      const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
      results.hsv = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`
    }
  } catch (error) {
    console.error('颜色转换失败:', error)
  }
}

// 初始转换
convertColor()
</script>

<style scoped>
.color-converter {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.results {
  display: flex;
  gap: 16px;
  align-items: center;
}

.color-preview {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  flex-shrink: 0;
}

.conversions p {
  margin: 4px 0;
  font-size: 14px;
}
</style>
```

### 调色板生成

```vue
<template>
  <div class="palette-generator">
    <h3>调色板生成器</h3>

    <div class="controls">
      <div class="input-group">
        <label>基础颜色:</label>
        <input v-model="baseColor" type="color" @change="generatePalettes" />
        <input v-model="baseColor" type="text" @input="generatePalettes" />
      </div>

      <div class="input-group">
        <label>调色板类型:</label>
        <select v-model="paletteType" @change="generatePalettes">
          <option value="monochromatic">单色</option>
          <option value="analogous">类似色</option>
          <option value="complementary">互补色</option>
          <option value="triadic">三元色</option>
        </select>
      </div>
    </div>

    <div class="palette" v-if="palette.length">
      <div
        v-for="(color, index) in palette"
        :key="index"
        class="color-swatch"
        :style="{ backgroundColor: color }"
        :title="color"
      >
        <span class="color-code">{{ color }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  generateMonochromaticPalette,
  generateAnalogousPalette,
  generateComplementaryPalette,
  generateTriadicPalette,
} from '@ldesign/color'

const baseColor = ref('#1890ff')
const paletteType = ref('monochromatic')
const palette = reactive([])

function generatePalettes() {
  try {
    palette.length = 0

    let newPalette = []

    switch (paletteType.value) {
      case 'monochromatic':
        newPalette = generateMonochromaticPalette(baseColor.value, 5)
        break
      case 'analogous':
        newPalette = generateAnalogousPalette(baseColor.value, 5)
        break
      case 'complementary':
        newPalette = generateComplementaryPalette(baseColor.value)
        break
      case 'triadic':
        newPalette = generateTriadicPalette(baseColor.value)
        break
    }

    palette.push(...newPalette)
  } catch (error) {
    console.error('调色板生成失败:', error)
  }
}

// 初始生成
generatePalettes()
</script>

<style scoped>
.palette-generator {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-weight: 500;
  font-size: 14px;
}

.input-group input,
.input-group select {
  padding: 8px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 14px;
}

.input-group input[type='color'] {
  width: 50px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.palette {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  display: flex;
  align-items: end;
  justify-content: center;
  padding: 8px;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.color-swatch:hover {
  transform: scale(1.05);
}

.color-code {
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  color: #333;
}
</style>
```

## 🎯 主题管理示例

### 简单主题切换

```vue
<template>
  <div class="theme-demo">
    <h3>主题管理演示</h3>

    <div class="theme-info">
      <p>
        当前主题: <strong>{{ currentTheme }}</strong>
      </p>
      <p>
        当前模式: <strong>{{ currentMode }}</strong>
      </p>
    </div>

    <div class="theme-controls">
      <div class="theme-selector">
        <label>选择主题:</label>
        <select :value="currentTheme" @change="setTheme($event.target.value)">
          <option v-for="theme in availableThemes" :key="theme" :value="theme">
            {{ theme }}
          </option>
        </select>
      </div>

      <button @click="toggleMode" class="mode-toggle">
        切换到 {{ isDark ? '亮色' : '暗色' }} 模式
      </button>
    </div>

    <div class="color-showcase">
      <div class="color-item" style="background: var(--color-primary)">
        <span>主色</span>
      </div>
      <div class="color-item" style="background: var(--color-success)">
        <span>成功色</span>
      </div>
      <div class="color-item" style="background: var(--color-warning)">
        <span>警告色</span>
      </div>
      <div class="color-item" style="background: var(--color-danger)">
        <span>危险色</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@ldesign/color/vue'

const {
  currentTheme,
  currentMode,
  isDark,
  availableThemes,
  setTheme,
  toggleMode,
} = useTheme()
</script>

<style scoped>
.theme-demo {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
  background: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.theme-info {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--color-background-soft);
  border-radius: 8px;
}

.theme-controls {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.theme-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-selector select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: var(--color-background);
  color: var(--color-text);
}

.mode-toggle {
  padding: 8px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.mode-toggle:hover {
  opacity: 0.8;
}

.color-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 12px;
}

.color-item {
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
```

## 📚 更多示例

- [颜色转换器](./color-converter.md) - 完整的颜色格式转换工具
- [调色板工具](./palette-tool.md) - 专业的调色板生成器
- [主题切换器](./theme-switcher.md) - 高级主题管理功能
- [可访问性检查器](./accessibility-checker.md) - WCAG 标准检查工具

## 🔗 相关资源

- [API 文档](/api/) - 完整的 API 参考
- [指南](/guide/) - 详细的使用指南
- [GitHub](https://github.com/ldesign/color) - 源代码和问题反馈
