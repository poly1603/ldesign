<template>
  <div class="basic-example">
    <h2 class="section-title">基础二维码生成示例</h2>
    <p class="section-description">
      展示 @ldesign/qrcode 的基本使用方法，包括文本输入、格式选择和基本配置。
    </p>

    <div class="grid grid-2">
      <!-- 配置面板 -->
      <div class="card">
        <h3 class="card-title">配置选项</h3>
        
        <div class="form-group">
          <label class="form-label">输入文本或URL</label>
          <textarea
            v-model="qrText"
            class="form-input form-textarea"
            placeholder="请输入要生成二维码的文本或URL..."
            rows="3"
          />
        </div>

        <div class="form-group">
          <label class="form-label">二维码大小</label>
          <input
            v-model.number="qrSize"
            type="range"
            min="100"
            max="500"
            step="10"
            class="form-range"
          />
          <span class="range-value">{{ qrSize }}px</span>
        </div>

        <div class="form-group">
          <label class="form-label">输出格式</label>
          <select v-model="qrFormat" class="form-input">
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">错误纠正级别</label>
          <select v-model="errorLevel" class="form-input">
            <option value="L">L (低) - 约7%</option>
            <option value="M">M (中) - 约15%</option>
            <option value="Q">Q (四分位) - 约25%</option>
            <option value="H">H (高) - 约30%</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">边距</label>
          <input
            v-model.number="qrMargin"
            type="range"
            min="0"
            max="10"
            step="1"
            class="form-range"
          />
          <span class="range-value">{{ qrMargin }}</span>
        </div>

        <div class="form-actions">
          <button @click="generateQRCodeHandler" class="btn btn-primary" :disabled="!qrText.trim()">
            生成二维码
          </button>
          <button @click="downloadQRCode" class="btn" :disabled="!result">
            下载二维码
          </button>
        </div>
      </div>

      <!-- 预览面板 -->
      <div class="card">
        <h3 class="card-title">二维码预览</h3>
        
        <div class="qr-preview">
          <div v-if="isLoading" class="loading">
            <div class="loading-spinner"></div>
            <p>正在生成二维码...</p>
          </div>
          
          <div v-else-if="error" class="error">
            <p class="error-message">{{ error.message }}</p>
            <button @click="generateQRCodeHandler" class="btn btn-primary">重试</button>
          </div>
          
          <div v-else-if="result" class="qr-result">
            <div class="qr-container" ref="qrContainer"></div>
            <div class="qr-info">
              <p><strong>格式:</strong> {{ result.format }}</p>
              <p><strong>尺寸:</strong> {{ result.size }}px</p>
              <p><strong>生成时间:</strong> {{ formatTime(result.timestamp) }}</p>
              <p v-if="result.fromCache"><strong>来源:</strong> 缓存</p>
            </div>
          </div>
          
          <div v-else class="placeholder">
            <div class="placeholder-icon">📱</div>
            <p>请输入文本并点击生成按钮</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速示例 -->
    <div class="card">
      <h3 class="card-title">快速示例</h3>
      <div class="quick-examples">
        <button
          v-for="example in quickExamples"
          :key="example.label"
          @click="loadExample(example)"
          class="btn example-btn"
        >
          {{ example.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { generateQRCode, type QRCodeResult, type QRCodeError, type SimpleQRCodeOptions } from '@ldesign/qrcode'

// 响应式数据
const qrText = ref('https://github.com/ldesign/qrcode')
const qrSize = ref(200)
const qrFormat = ref<'canvas' | 'svg' | 'image'>('canvas')
const errorLevel = ref<'L' | 'M' | 'Q' | 'H'>('M')
const qrMargin = ref(1)

const isLoading = ref(false)
const error = ref<QRCodeError | null>(null)
const result = ref<QRCodeResult | null>(null)
const qrContainer = ref<HTMLDivElement>()

// 快速示例数据
const quickExamples = [
  { label: '网站URL', text: 'https://www.ldesign.com', size: 200 },
  { label: '联系方式', text: 'tel:+86-138-0013-8000', size: 180 },
  { label: '邮箱地址', text: 'mailto:contact@ldesign.com', size: 200 },
  { label: '短文本', text: 'Hello LDesign!', size: 150 },
  { label: '长文本', text: '这是一个包含中文字符的长文本示例，用于测试二维码生成器对不同字符集的支持能力。', size: 250 }
]

/**
 * 生成二维码
 */
const generateQRCodeHandler = async (): Promise<void> => {
  if (!qrText.value.trim()) return

  isLoading.value = true
  error.value = null
  result.value = null

  try {
    // 使用 generateQRCode 函数生成二维码
    const options = {
      size: qrSize.value,
      format: qrFormat.value,
      errorCorrectionLevel: errorLevel.value,
      margin: qrMargin.value
    }

    const qrResult = await generateQRCode(qrText.value, options)
    result.value = qrResult

    // 等待 DOM 更新后渲染二维码
    await nextTick()
    if (qrContainer.value && qrResult.element) {
      qrContainer.value.innerHTML = ''
      qrContainer.value.appendChild(qrResult.element)
    }
  } catch (err) {
    error.value = err as QRCodeError
    console.error('二维码生成失败:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 下载二维码
 */
const downloadQRCode = (): void => {
  if (!result.value) return

  try {
    const link = document.createElement('a')
    link.download = `qrcode-${Date.now()}.${qrFormat.value === 'svg' ? 'svg' : 'png'}`
    
    if (qrFormat.value === 'svg' && result.value.svg) {
      const blob = new Blob([result.value.svg], { type: 'image/svg+xml' })
      link.href = URL.createObjectURL(blob)
    } else if (result.value.dataURL) {
      link.href = result.value.dataURL
    }
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } catch (err) {
    console.error('下载失败:', err)
  }
}

/**
 * 加载快速示例
 */
const loadExample = (example: typeof quickExamples[0]): void => {
  qrText.value = example.text
  qrSize.value = example.size
  generateQRCodeHandler()
}

/**
 * 格式化时间
 */
const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString()
}

// 初始生成
generateQRCodeHandler()
</script>

<style scoped>
.basic-example {
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

.form-range {
  width: 100%;
  margin-bottom: var(--ls-spacing-xs);
}

.range-value {
  font-size: 14px;
  color: var(--ldesign-brand-color-6);
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-top: var(--ls-spacing-base);
}

.qr-preview {
  min-height: 300px;
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

.error {
  text-align: center;
  color: var(--ldesign-error-color-5);
}

.error-message {
  margin-bottom: var(--ls-spacing-base);
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

.qr-info {
  text-align: left;
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  font-size: 14px;
}

.qr-info p {
  margin-bottom: var(--ls-spacing-xs);
}

.placeholder {
  text-align: center;
  color: var(--ldesign-text-color-placeholder);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: var(--ls-spacing-sm);
}

.quick-examples {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-sm);
}

.example-btn {
  font-size: 13px;
  padding: var(--ls-spacing-xs) var(--ls-spacing-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column;
  }
  
  .quick-examples {
    flex-direction: column;
  }
  
  .example-btn {
    width: 100%;
  }
}
</style>
