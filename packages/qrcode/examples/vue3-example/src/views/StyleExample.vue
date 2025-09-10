<template>
  <div class="style-example">
    <h2 class="section-title">样式定制示例</h2>
    <p class="section-description">
      展示 @ldesign/qrcode 的样式定制功能，包括颜色、渐变、形状和边框等自定义选项。
    </p>

    <div class="grid grid-2">
      <!-- 样式配置面板 -->
      <div class="card">
        <h3 class="card-title">样式配置</h3>
        
        <div class="form-group">
          <label class="form-label">二维码文本</label>
          <input
            v-model="qrText"
            type="text"
            class="form-input"
            placeholder="输入二维码内容..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">二维码大小</label>
          <input
            v-model.number="qrSize"
            type="range"
            min="150"
            max="400"
            step="10"
            class="form-range"
          />
          <span class="range-value">{{ qrSize }}px</span>
        </div>

        <!-- 颜色配置 -->
        <div class="color-section">
          <h4 class="subsection-title">颜色配置</h4>
          
          <div class="form-group">
            <label class="form-label">前景色</label>
            <div class="color-input-group">
              <input
                v-model="foregroundColor"
                type="color"
                class="color-picker"
              />
              <input
                v-model="foregroundColor"
                type="text"
                class="form-input color-text"
                placeholder="#000000"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">背景色</label>
            <div class="color-input-group">
              <input
                v-model="backgroundColor"
                type="color"
                class="color-picker"
              />
              <input
                v-model="backgroundColor"
                type="text"
                class="form-input color-text"
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">使用渐变</label>
            <input
              v-model="useGradient"
              type="checkbox"
              class="form-checkbox"
            />
          </div>

          <div v-if="useGradient" class="gradient-config">
            <div class="form-group">
              <label class="form-label">渐变类型</label>
              <select v-model="gradientType" class="form-input">
                <option value="linear">线性渐变</option>
                <option value="radial">径向渐变</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">渐变起始色</label>
              <input
                v-model="gradientStart"
                type="color"
                class="color-picker"
              />
            </div>

            <div class="form-group">
              <label class="form-label">渐变结束色</label>
              <input
                v-model="gradientEnd"
                type="color"
                class="color-picker"
              />
            </div>

            <div v-if="gradientType === 'linear'" class="form-group">
              <label class="form-label">渐变角度</label>
              <input
                v-model.number="gradientAngle"
                type="range"
                min="0"
                max="360"
                step="15"
                class="form-range"
              />
              <span class="range-value">{{ gradientAngle }}°</span>
            </div>
          </div>
        </div>

        <!-- 形状配置 -->
        <div class="shape-section">
          <h4 class="subsection-title">形状配置</h4>
          
          <div class="form-group">
            <label class="form-label">点样式</label>
            <select v-model="dotStyle" class="form-input">
              <option value="square">方形</option>
              <option value="rounded">圆角</option>
              <option value="dots">圆点</option>
              <option value="classy">优雅</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">角落样式</label>
            <select v-model="cornerStyle" class="form-input">
              <option value="square">方形</option>
              <option value="rounded">圆角</option>
              <option value="extra-rounded">超圆角</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">边框圆角</label>
            <input
              v-model.number="borderRadius"
              type="range"
              min="0"
              max="20"
              step="1"
              class="form-range"
            />
            <span class="range-value">{{ borderRadius }}px</span>
          </div>

          <div class="form-group">
            <label class="form-label">边距</label>
            <input
              v-model.number="margin"
              type="range"
              min="0"
              max="20"
              step="1"
              class="form-range"
            />
            <span class="range-value">{{ margin }}px</span>
          </div>
        </div>

        <button @click="generateStyledQR" class="btn btn-primary" :disabled="!qrText.trim()">
          生成样式化二维码
        </button>
      </div>

      <!-- 预览面板 -->
      <div class="card">
        <h3 class="card-title">样式预览</h3>
        
        <div class="preview-area">
          <div v-if="isLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在生成二维码...</p>
          </div>
          
          <div v-else-if="result" class="qr-result">
            <div class="qr-container" ref="qrContainer" v-html="displayHtml"></div>
            <div class="style-info">
              <h4>当前样式配置</h4>
              <div class="style-details">
                <p><strong>前景色:</strong> {{ foregroundColor }}</p>
                <p><strong>背景色:</strong> {{ backgroundColor }}</p>
                <p><strong>点样式:</strong> {{ dotStyle }}</p>
                <p><strong>角落样式:</strong> {{ cornerStyle }}</p>
                <p><strong>边框圆角:</strong> {{ borderRadius }}px</p>
                <p><strong>边距:</strong> {{ margin }}px</p>
                <p v-if="useGradient"><strong>渐变:</strong> {{ gradientType }}</p>
              </div>
            </div>
          </div>
          
          <div v-else class="placeholder">
            <div class="placeholder-icon">🎨</div>
            <p>配置样式并生成二维码</p>
          </div>
        </div>

        <!-- 预设样式 -->
        <div class="preset-styles">
          <h4>预设样式</h4>
          <div class="preset-grid">
            <button
              v-for="preset in presetStyles"
              :key="preset.name"
              @click="applyPreset(preset)"
              class="preset-btn"
              :style="{ background: preset.preview }"
            >
              {{ preset.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 样式对比 -->
    <div class="card">
      <h3 class="card-title">样式对比</h3>
      <div class="comparison-grid">
        <div
          v-for="(comparison, index) in comparisons"
          :key="index"
          class="comparison-item"
        >
          <h4>{{ comparison.name }}</h4>
          <div class="comparison-qr" :ref="el => setComparisonRef(el, index)"></div>
          <p class="comparison-desc">{{ comparison.description }}</p>
        </div>
      </div>
      <button @click="generateComparisons" class="btn btn-primary">生成对比示例</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import {
  generateQRCode,
  type QRCodeResult,
  type SimpleQRCodeOptions
} from '@ldesign/qrcode'

// 基础配置
const qrText = ref('https://www.ldesign.com/style-demo')
const qrSize = ref(250)

// 颜色配置
const foregroundColor = ref('#722ED1')
const backgroundColor = ref('#ffffff')
const useGradient = ref(false)
const gradientType = ref<'linear' | 'radial'>('linear')
const gradientStart = ref('#722ED1')
const gradientEnd = ref('#8c5ad3')
const gradientAngle = ref(45)

// 形状配置
const dotStyle = ref<'square' | 'rounded' | 'dots' | 'classy'>('rounded')
const cornerStyle = ref<'square' | 'rounded' | 'extra-rounded'>('rounded')
const borderRadius = ref(6)
const margin = ref(4)

// 状态
const isLoading = ref(false)
const result = ref<QRCodeResult | null>(null)
const qrContainer = ref<HTMLDivElement>()

// 渲染HTML（优先 SVG，其次 dataURL）
const displayHtml = computed(() => {
  const r: any = result.value as any
  if (!r) return ''
  if (r.svg) return r.svg as string
  const dataURL = r.dataURL || (typeof r.data === 'string' ? r.data : '')
  if (dataURL) {
    const size = qrSize.value
    return `<img src="${dataURL}" width="${size}" height="${size}" />`
  }
  return ''
})

// 对比示例
const comparisons = ref<any[]>([])
const comparisonRefs = ref<(HTMLDivElement | null)[]>([])

// 预设样式
const presetStyles = [
  {
    name: '经典',
    preview: 'linear-gradient(45deg, #000000, #333333)',
    config: {
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      dotStyle: 'square',
      cornerStyle: 'square',
      borderRadius: 0,
      margin: 4,
      useGradient: false
    }
  },
  {
    name: '现代',
    preview: 'linear-gradient(45deg, #722ED1, #8c5ad3)',
    config: {
      foregroundColor: '#722ED1',
      backgroundColor: '#f1ecf9',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
      borderRadius: 8,
      margin: 6,
      useGradient: false
    }
  },
  {
    name: '渐变',
    preview: 'linear-gradient(45deg, #722ED1, #8c5ad3)',
    config: {
      foregroundColor: '#722ED1',
      backgroundColor: '#ffffff',
      dotStyle: 'dots',
      cornerStyle: 'extra-rounded',
      borderRadius: 12,
      margin: 8,
      useGradient: true,
      gradientType: 'linear',
      gradientStart: '#722ED1',
      gradientEnd: '#8c5ad3',
      gradientAngle: 45
    }
  },
  {
    name: '优雅',
    preview: 'linear-gradient(45deg, #35165f, #5e2aa7)',
    config: {
      foregroundColor: '#35165f',
      backgroundColor: '#f1ecf9',
      dotStyle: 'classy',
      cornerStyle: 'extra-rounded',
      borderRadius: 10,
      margin: 10,
      useGradient: false
    }
  }
]

/**
 * 生成样式化二维码
 */
const generateStyledQR = async (): Promise<void> => {
  if (!qrText.value.trim()) return

  isLoading.value = true

  try {
    // 简化的样式选项，使用 SimpleQRCodeOptions
    const options: SimpleQRCodeOptions = {
      size: qrSize.value,
      format: 'canvas',
      margin: margin.value,
      foregroundColor: useGradient.value ? gradientStart.value : foregroundColor.value,
      backgroundColor: backgroundColor.value
    }

    const qrResult = await generateQRCode(qrText.value, options)
    result.value = qrResult

    await nextTick()
    if (qrContainer.value) {
      const host = qrContainer.value
      host.innerHTML = ''
      const svg = (qrResult as any)?.svg
      const dataURL = (qrResult as any)?.dataURL || (typeof (qrResult as any)?.data === 'string' ? (qrResult as any).data : '')
      if (svg) {
        host.innerHTML = svg
      } else if (dataURL) {
        const img = new Image()
        img.src = dataURL
        img.width = qrSize.value
        img.height = qrSize.value
        host.appendChild(img)
      } else if (qrResult.element) {
        host.appendChild(qrResult.element)
      }
    }
  } catch (error) {
    console.error('生成样式化二维码失败:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * 应用预设样式
 */
const applyPreset = (preset: typeof presetStyles[0]): void => {
  const config = preset.config
  
  foregroundColor.value = config.foregroundColor
  backgroundColor.value = config.backgroundColor
  dotStyle.value = config.dotStyle as any
  cornerStyle.value = config.cornerStyle as any
  borderRadius.value = config.borderRadius
  margin.value = config.margin
  useGradient.value = config.useGradient

  if (config.useGradient) {
    gradientType.value = config.gradientType as any
    gradientStart.value = config.gradientStart!
    gradientEnd.value = config.gradientEnd!
    gradientAngle.value = config.gradientAngle!
  }

  generateStyledQR()
}

/**
 * 生成对比示例
 */
const generateComparisons = async (): Promise<void> => {
  const comparisonConfigs = [
    {
      name: '方形样式',
      description: '传统方形点和角落',
      style: { dotStyle: 'square', cornerStyle: 'square', foregroundColor: '#000000' }
    },
    {
      name: '圆角样式',
      description: '现代圆角设计',
      style: { dotStyle: 'rounded', cornerStyle: 'rounded', foregroundColor: '#722ED1' }
    },
    {
      name: '圆点样式',
      description: '圆点形状，更加柔和',
      style: { dotStyle: 'dots', cornerStyle: 'extra-rounded', foregroundColor: '#8c5ad3' }
    },
    {
      name: '优雅样式',
      description: '精致的优雅设计',
      style: { dotStyle: 'classy', cornerStyle: 'extra-rounded', foregroundColor: '#35165f' }
    }
  ]

  comparisons.value = []
  comparisonRefs.value = []

  for (let i = 0; i < comparisonConfigs.length; i++) {
    const config = comparisonConfigs[i]!
    
    try {
      const options: SimpleQRCodeOptions = {
        size: 180,
        format: 'canvas',
        margin: 4,
        foregroundColor: config.style.foregroundColor,
        backgroundColor: '#ffffff'
      }

      const result = await generateQRCode(qrText.value, options)
      
      comparisons.value.push({
        ...config,
        result
      })
    } catch (error) {
      console.error(`生成对比示例 ${i} 失败:`, error)
    }
  }

  await nextTick()
  comparisons.value.forEach((comparison, index) => {
    const container = comparisonRefs.value[index]
    if (container && comparison.result?.element) {
      container.innerHTML = ''
      container.appendChild(comparison.result.element)
    }
  })
}

/**
 * 设置对比示例的引用
 */
const setComparisonRef = (el: any, index: number): void => {
  if (el && el instanceof HTMLDivElement) {
    comparisonRefs.value[index] = el
  }
}

// 监听配置变化，自动重新生成二维码
watch(
  [qrText, qrSize, margin, foregroundColor, backgroundColor, useGradient, gradientStart, gradientEnd],
  () => {
    generateStyledQR()
  },
  { deep: true }
)

// 初始生成
generateStyledQR()
</script>

<style scoped>
.style-example {
  max-width: 100%;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.section-description {
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-spacing-lg);
  line-height: 1.6;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-base);
  padding-bottom: var(--ls-spacing-xs);
  border-bottom: 2px solid var(--ldesign-brand-color-2);
}

.subsection-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--ldesign-brand-color-7);
  margin: var(--ls-spacing-base) 0 var(--ls-spacing-sm) 0;
  padding-bottom: var(--ls-spacing-xs);
  border-bottom: 1px solid var(--ldesign-brand-color-2);
}

.color-section,
.shape-section {
  margin-bottom: var(--ls-spacing-base);
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-brand-color-1);
  border-radius: var(--ls-border-radius-base);
}

.color-input-group {
  display: flex;
  gap: var(--ls-spacing-sm);
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 40px;
  border: 1px solid var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
}

.color-text {
  flex: 1;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.gradient-config {
  margin-top: var(--ls-spacing-sm);
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-brand-color-2);
  border-radius: var(--ls-border-radius-base);
}

.range-value {
  font-size: 14px;
  color: var(--ldesign-brand-color-6);
  font-weight: 500;
}

.form-range {
  width: 100%;
  margin-bottom: var(--ls-spacing-xs);
}

.preview-area {
  min-height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.loading {
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--ldesign-border-level-1-color);
  border-top: 3px solid var(--ldesign-brand-color-6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--ls-spacing-sm);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.qr-result {
  text-align: center;
  width: 100%;
}

.qr-container {
  margin-bottom: var(--ls-spacing-base);
  display: flex;
  justify-content: center;
}

.style-info {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  text-align: left;
}

.style-info h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.style-details p {
  margin-bottom: var(--ls-spacing-xs);
  font-size: 14px;
}

.placeholder {
  text-align: center;
  color: var(--ldesign-text-color-placeholder);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: var(--ls-spacing-sm);
}

.preset-styles {
  margin-top: var(--ls-spacing-base);
  padding-top: var(--ls-spacing-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.preset-styles h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--ls-spacing-sm);
}

.preset-btn {
  padding: var(--ls-spacing-sm);
  border: 1px solid var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.preset-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--ldesign-shadow-2);
}

.comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-base);
}

.comparison-item {
  text-align: center;
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
}

.comparison-item h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.comparison-qr {
  margin-bottom: var(--ls-spacing-sm);
  display: flex;
  justify-content: center;
}

.comparison-desc {
  font-size: 14px;
  color: var(--ldesign-text-color-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .color-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .comparison-grid {
    grid-template-columns: 1fr;
  }
}
</style>
