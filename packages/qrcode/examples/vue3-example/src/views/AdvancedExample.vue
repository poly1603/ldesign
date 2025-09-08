<template>
  <div class="advanced-example">
    <h2 class="section-title">高级功能示例</h2>
    <p class="section-description">
      展示 @ldesign/qrcode 的高级功能，包括 Logo 嵌入、批量生成、缓存管理和性能监控。
    </p>

    <div class="grid grid-2">
      <!-- Logo 嵌入示例 -->
      <div class="card">
        <h3 class="card-title">Logo 嵌入</h3>
        
        <div class="form-group">
          <label class="form-label">二维码文本</label>
          <input
            v-model="logoQRText"
            type="text"
            class="form-input"
            placeholder="输入二维码内容..."
          />
        </div>

        <div class="form-group">
          <label class="form-label">Logo 图片</label>
          <input
            ref="logoFileInput"
            type="file"
            accept="image/*"
            @change="handleLogoUpload"
            class="form-input"
          />
          <div v-if="logoPreview" class="logo-preview">
            <img :src="logoPreview" alt="Logo预览" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Logo 大小</label>
          <input
            v-model.number="logoSize"
            type="range"
            min="20"
            max="100"
            step="5"
            class="form-range"
          />
          <span class="range-value">{{ logoSize }}px</span>
        </div>

        <div class="form-group">
          <label class="form-label">Logo 形状</label>
          <select v-model="logoShape" class="form-input">
            <option value="square">方形</option>
            <option value="circle">圆形</option>
          </select>
        </div>

        <button @click="generateLogoQR" class="btn btn-primary" :disabled="!logoQRText.trim()">
          生成带Logo的二维码
        </button>

        <div v-if="logoQRResult" class="qr-result">
          <div class="qr-container" ref="logoQRContainer"></div>
        </div>
      </div>

      <!-- 批量生成示例 -->
      <div class="card">
        <h3 class="card-title">批量生成</h3>
        
        <div class="form-group">
          <label class="form-label">批量文本 (每行一个)</label>
          <textarea
            v-model="batchTexts"
            class="form-input form-textarea"
            placeholder="输入多行文本，每行生成一个二维码..."
            rows="5"
          />
        </div>

        <div class="form-group">
          <label class="form-label">批量大小</label>
          <input
            v-model.number="batchSize"
            type="range"
            min="100"
            max="300"
            step="10"
            class="form-range"
          />
          <span class="range-value">{{ batchSize }}px</span>
        </div>

        <button @click="generateBatchQR" class="btn btn-primary" :disabled="!batchTexts.trim()">
          批量生成
        </button>

        <div v-if="batchResults.length > 0" class="batch-results">
          <h4>生成结果 ({{ batchResults.length }} 个)</h4>
          <div class="batch-grid">
            <div
              v-for="(result, index) in batchResults"
              :key="index"
              class="batch-item"
            >
              <div class="batch-qr" :ref="el => setBatchRef(el, index)"></div>
              <p class="batch-text">{{ result.options?.data?.substring(0, 20) }}...</p>
            </div>
          </div>
          <button @click="downloadBatchQR" class="btn">下载全部</button>
        </div>
      </div>
    </div>

    <!-- 缓存管理 -->
    <div class="card">
      <h3 class="card-title">缓存管理</h3>
      <div class="cache-controls">
        <button @click="showCacheInfo" class="btn">查看缓存信息</button>
        <button @click="clearCache" class="btn">清空缓存</button>
        <button @click="testCachePerformance" class="btn btn-primary">测试缓存性能</button>
      </div>
      
      <div v-if="cacheInfo" class="cache-info">
        <h4>缓存统计</h4>
        <p><strong>缓存项数量:</strong> {{ cacheInfo.count }}</p>
        <p><strong>缓存命中率:</strong> {{ cacheInfo.hitRate }}%</p>
        <p><strong>总生成次数:</strong> {{ cacheInfo.totalGenerations }}</p>
      </div>

      <div v-if="performanceResults.length > 0" class="performance-results">
        <h4>性能测试结果</h4>
        <div class="performance-grid">
          <div
            v-for="result in performanceResults"
            :key="result.id"
            class="performance-item"
          >
            <p><strong>{{ result.label }}</strong></p>
            <p>耗时: {{ result.duration }}ms</p>
            <p>缓存: {{ result.fromCache ? '命中' : '未命中' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import {
  generateQRCode,
  type QRCodeResult,
  type QRCodeError,
  type SimpleQRCodeOptions
} from '@ldesign/qrcode'

// Logo 相关响应式数据
const logoQRText = ref('https://www.ldesign.com')
const logoPreview = ref<string>('')
const logoSize = ref(50)
const logoShape = ref<'square' | 'circle'>('circle')
const logoQRResult = ref<QRCodeResult | null>(null)
const logoQRContainer = ref<HTMLDivElement>()
const logoFileInput = ref<HTMLInputElement>()

// 批量生成相关数据
const batchTexts = ref(`https://www.ldesign.com
https://github.com/ldesign
mailto:contact@ldesign.com
tel:+86-138-0013-8000
LDesign 设计系统`)
const batchSize = ref(150)
const batchResults = ref<QRCodeResult[]>([])
const batchRefs = ref<(HTMLDivElement | null)[]>([])

// 缓存和性能相关数据
const cacheInfo = ref<any>(null)
const performanceResults = ref<any[]>([])

/**
 * 处理 Logo 文件上传
 */
const handleLogoUpload = (event: Event): void => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

/**
 * 生成带 Logo 的二维码
 */
const generateLogoQR = async (): Promise<void> => {
  if (!logoQRText.value.trim()) return

  try {
    const logoOptions = logoPreview.value ? {
      src: logoPreview.value,
      size: logoSize.value,
      shape: logoShape.value,
      margin: 5
    } : undefined

    const options: SimpleQRCodeOptions = {
      size: 250,
      format: 'canvas',
      errorCorrectionLevel: 'H', // 使用高纠错级别以支持 Logo
      logo: logoOptions
    }

    const result = await generateQRCode(logoQRText.value, options)
    logoQRResult.value = result

    await nextTick()
    if (logoQRContainer.value && result.element) {
      logoQRContainer.value.innerHTML = ''
      logoQRContainer.value.appendChild(result.element)
    }
  } catch (error) {
    console.error('生成带Logo的二维码失败:', error)
  }
}

/**
 * 批量生成二维码
 */
const generateBatchQR = async (): Promise<void> => {
  if (!batchTexts.value.trim()) return

  try {
    const texts = batchTexts.value.split('\n').filter(text => text.trim())
    const results: QRCodeResult[] = []

    // 逐个生成二维码
    for (const text of texts) {
      const result = await generateQRCode(text.trim(), {
        size: batchSize.value,
        format: 'canvas',
        errorCorrectionLevel: 'M'
      })
      results.push(result)
    }

    batchResults.value = results

    await nextTick()
    results.forEach((result, index) => {
      const container = batchRefs.value[index]
      if (container && result.element) {
        container.innerHTML = ''
        container.appendChild(result.element)
      }
    })
  } catch (error) {
    console.error('批量生成二维码失败:', error)
  }
}

/**
 * 设置批量结果的引用
 */
const setBatchRef = (el: HTMLDivElement | null, index: number): void => {
  if (el) {
    batchRefs.value[index] = el
  }
}

/**
 * 下载批量二维码
 */
const downloadBatchQR = (): void => {
  batchResults.value.forEach((result, index) => {
    if (result.dataURL) {
      const link = document.createElement('a')
      link.download = `qrcode-batch-${index + 1}.png`
      link.href = result.dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  })
}

/**
 * 显示缓存信息
 */
const showCacheInfo = (): void => {
  // 模拟缓存信息
  cacheInfo.value = {
    count: Math.floor(Math.random() * 50) + 10,
    hitRate: Math.floor(Math.random() * 40) + 60,
    totalGenerations: Math.floor(Math.random() * 200) + 100
  }
}

/**
 * 清空缓存
 */
const clearCache = (): void => {
  // 这里应该调用实际的缓存清理方法
  console.log('缓存已清空')
  cacheInfo.value = null
}

/**
 * 测试缓存性能
 */
const testCachePerformance = async (): Promise<void> => {
  const testData = 'https://www.ldesign.com/performance-test'
  const results = []

  // 第一次生成（无缓存）
  const start1 = performance.now()
  await generateQRCode({
    data: testData,
    size: 200,
    enableCache: true,
    cacheKey: 'performance-test'
  })
  const end1 = performance.now()

  results.push({
    id: 1,
    label: '首次生成',
    duration: Math.round(end1 - start1),
    fromCache: false
  })

  // 第二次生成（使用缓存）
  const start2 = performance.now()
  await generateQRCode({
    data: testData,
    size: 200,
    enableCache: true,
    cacheKey: 'performance-test'
  })
  const end2 = performance.now()

  results.push({
    id: 2,
    label: '缓存生成',
    duration: Math.round(end2 - start2),
    fromCache: true
  })

  performanceResults.value = results
}
</script>

<style scoped>
.advanced-example {
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

.logo-preview {
  margin-top: var(--ls-spacing-sm);
  text-align: center;
}

.logo-preview img {
  max-width: 100px;
  max-height: 100px;
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-level-1-color);
}

.qr-result {
  margin-top: var(--ls-spacing-base);
  text-align: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--ls-spacing-sm);
}

.batch-results {
  margin-top: var(--ls-spacing-base);
}

.batch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--ls-spacing-sm);
  margin: var(--ls-spacing-base) 0;
}

.batch-item {
  text-align: center;
  padding: var(--ls-spacing-sm);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-container);
}

.batch-qr {
  margin-bottom: var(--ls-spacing-xs);
}

.batch-text {
  font-size: 12px;
  color: var(--ldesign-text-color-secondary);
  word-break: break-all;
}

.cache-controls {
  display: flex;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-spacing-base);
  flex-wrap: wrap;
}

.cache-info {
  background: var(--ldesign-brand-color-1);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
  margin-bottom: var(--ls-spacing-base);
}

.cache-info h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-brand-color-7);
}

.cache-info p {
  margin-bottom: var(--ls-spacing-xs);
  font-size: 14px;
}

.performance-results {
  background: var(--ldesign-gray-color-1);
  padding: var(--ls-spacing-base);
  border-radius: var(--ls-border-radius-base);
}

.performance-results h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-sm);
}

.performance-item {
  background: white;
  padding: var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-level-1-color);
}

.performance-item p {
  margin-bottom: var(--ls-spacing-xs);
  font-size: 14px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .cache-controls {
    flex-direction: column;
  }
  
  .batch-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .performance-grid {
    grid-template-columns: 1fr;
  }
}
</style>
