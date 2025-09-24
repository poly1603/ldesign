# Vue使用示例

## 基础使用

### 组件方式

```vue
<template>
  <div>
    <h2>基础二维码</h2>
    <QRCode 
      text="Hello Vue!"
      :size="200"
      format="canvas"
    />
    
    <h2>带下载功能</h2>
    <QRCode 
      :text="qrText"
      :size="300"
      format="svg"
      :show-download-button="true"
      download-button-text="下载二维码"
      download-filename="vue-qrcode"
      @generated="onGenerated"
      @error="onError"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QRCode } from '@ldesign/qrcode/vue'

const qrText = ref('https://vuejs.org')

const onGenerated = (result) => {
  console.log('二维码生成成功:', result)
}

const onError = (error) => {
  console.error('生成失败:', error)
}
</script>
```

### Hook方式

```vue
<template>
  <div>
    <input 
      v-model="inputText" 
      placeholder="输入要生成的文本"
      @input="handleInput"
    />
    
    <div v-if="loading">生成中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="result" ref="qrContainer"></div>
    
    <button @click="regenerate" :disabled="loading">重新生成</button>
    <button @click="clearCache">清除缓存</button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useQRCode } from '@ldesign/qrcode/vue'

const inputText = ref('Hello Vue Hook!')
const qrContainer = ref()

const { result, loading, error, generate, regenerate, clearCache } = useQRCode({
  data: inputText.value,
  size: 250,
  format: 'canvas',
  color: {
    foreground: '#2563eb',
    background: '#f8fafc'
  }
})

// 监听结果变化，渲染到容器
watch(result, async (newResult) => {
  if (newResult && qrContainer.value) {
    await nextTick()
    qrContainer.value.innerHTML = ''
    qrContainer.value.appendChild(newResult.element)
  }
})

const handleInput = () => {
  if (inputText.value.trim()) {
    generate(inputText.value)
  }
}

// 初始生成
handleInput()
</script>
```

## 高级功能

### 响应式二维码

```vue
<template>
  <div class="qr-container">
    <QRCode 
      :text="dynamicText"
      :size="qrSize"
      :format="qrFormat"
      :color="qrColor"
      :logo="qrLogo"
      :style="qrStyle"
      class="responsive-qr"
    />
    
    <!-- 控制面板 -->
    <div class="controls">
      <div class="control-group">
        <label>文本内容:</label>
        <textarea v-model="dynamicText" rows="3"></textarea>
      </div>
      
      <div class="control-group">
        <label>尺寸: {{ qrSize }}px</label>
        <input 
          type="range" 
          v-model.number="qrSize" 
          min="100" 
          max="500" 
          step="10"
        />
      </div>
      
      <div class="control-group">
        <label>格式:</label>
        <select v-model="qrFormat">
          <option value="canvas">Canvas</option>
          <option value="svg">SVG</option>
          <option value="image">Image</option>
        </select>
      </div>
      
      <div class="control-group">
        <label>前景色:</label>
        <input type="color" v-model="foregroundColor" />
      </div>
      
      <div class="control-group">
        <label>背景色:</label>
        <input type="color" v-model="backgroundColor" />
      </div>
      
      <div class="control-group">
        <label>
          <input type="checkbox" v-model="enableLogo" />
          启用Logo
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QRCode } from '@ldesign/qrcode/vue'

const dynamicText = ref('https://vuejs.org')
const qrSize = ref(300)
const qrFormat = ref('svg')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#ffffff')
const enableLogo = ref(false)

const qrColor = computed(() => ({
  foreground: foregroundColor.value,
  background: backgroundColor.value
}))

const qrLogo = computed(() => 
  enableLogo.value ? {
    src: '/logo.png',
    size: qrSize.value * 0.2,
    shape: 'circle'
  } : undefined
)

const qrStyle = computed(() => ({
  dotStyle: 'rounded',
  cornerStyle: 'circle'
}))
</script>

<style scoped>
.qr-container {
  display: flex;
  gap: 2rem;
  padding: 2rem;
}

.responsive-qr {
  flex-shrink: 0;
}

.controls {
  flex: 1;
  max-width: 300px;
}

.control-group {
  margin-bottom: 1rem;
}

.control-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.control-group input,
.control-group select,
.control-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
</style>
```

### 批量生成组件

```vue
<template>
  <div class="batch-generator">
    <h2>批量二维码生成</h2>
    
    <div class="input-section">
      <textarea 
        v-model="textList"
        placeholder="每行一个文本，将生成对应的二维码"
        rows="6"
      ></textarea>
      
      <div class="options">
        <label>
          尺寸:
          <input type="number" v-model.number="batchSize" min="100" max="500" />
        </label>
        
        <label>
          格式:
          <select v-model="batchFormat">
            <option value="canvas">Canvas</option>
            <option value="svg">SVG</option>
          </select>
        </label>
        
        <button @click="generateBatch" :disabled="generating">
          {{ generating ? '生成中...' : '批量生成' }}
        </button>
      </div>
    </div>
    
    <div class="results" v-if="batchResults.length > 0">
      <h3>生成结果 ({{ batchResults.length }}个)</h3>
      <div class="qr-grid">
        <div 
          v-for="(item, index) in batchResults" 
          :key="index"
          class="qr-item"
        >
          <QRCode 
            :text="item.text"
            :size="batchSize"
            :format="batchFormat"
            :show-download-button="true"
            :download-filename="`qrcode-${index + 1}`"
          />
          <p class="qr-text">{{ item.text }}</p>
        </div>
      </div>
      
      <button @click="downloadAll" class="download-all">
        下载全部
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { QRCode, useBatchQRCode } from '@ldesign/qrcode/vue'

const textList = ref(`https://vuejs.org
https://github.com/vuejs/vue
https://vitejs.dev
https://pinia.vuejs.org`)

const batchSize = ref(150)
const batchFormat = ref('svg')
const generating = ref(false)
const batchResults = ref([])

const { generateBatch: batchGenerate } = useBatchQRCode()

const generateBatch = async () => {
  const texts = textList.value
    .split('\n')
    .map(text => text.trim())
    .filter(text => text.length > 0)
  
  if (texts.length === 0) return
  
  generating.value = true
  
  try {
    const results = await batchGenerate(texts, {
      size: batchSize.value,
      format: batchFormat.value
    })
    
    batchResults.value = texts.map((text, index) => ({
      text,
      result: results[index]
    }))
  } catch (error) {
    console.error('批量生成失败:', error)
  } finally {
    generating.value = false
  }
}

const downloadAll = async () => {
  for (let i = 0; i < batchResults.value.length; i++) {
    const item = batchResults.value[i]
    // 这里可以调用下载功能
    // await downloadQRCode(item.result, `qrcode-${i + 1}`)
  }
}
</script>

<style scoped>
.batch-generator {
  padding: 2rem;
}

.input-section {
  margin-bottom: 2rem;
}

.input-section textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.options {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.options input,
.options select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.options button {
  padding: 0.5rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
}

.options button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.qr-item {
  text-align: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.qr-text {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  word-break: break-all;
}

.download-all {
  padding: 0.75rem 1.5rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}
</style>
```

## 组合式API高级用法

### 自定义Hook

```javascript
// composables/useQRCodeManager.js
import { ref, computed, watch } from 'vue'
import { useQRCode } from '@ldesign/qrcode/vue'

export function useQRCodeManager(initialOptions = {}) {
  const history = ref([])
  const currentIndex = ref(-1)
  const maxHistory = ref(10)
  
  const { result, loading, error, generate, clearCache } = useQRCode(initialOptions)
  
  // 当前历史记录
  const currentHistory = computed(() => history.value[currentIndex.value])
  
  // 是否可以撤销/重做
  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)
  
  // 监听结果变化，添加到历史记录
  watch(result, (newResult) => {
    if (newResult) {
      // 移除当前位置之后的历史记录
      history.value = history.value.slice(0, currentIndex.value + 1)
      
      // 添加新记录
      history.value.push({
        result: newResult,
        timestamp: Date.now()
      })
      
      // 限制历史记录数量
      if (history.value.length > maxHistory.value) {
        history.value = history.value.slice(-maxHistory.value)
      }
      
      currentIndex.value = history.value.length - 1
    }
  })
  
  // 撤销
  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--
    }
  }
  
  // 重做
  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++
    }
  }
  
  // 清除历史记录
  const clearHistory = () => {
    history.value = []
    currentIndex.value = -1
  }
  
  return {
    // 基础功能
    result,
    loading,
    error,
    generate,
    clearCache,
    
    // 历史管理
    history: readonly(history),
    currentHistory,
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    
    // 配置
    maxHistory
  }
}
```

### 使用自定义Hook

```vue
<template>
  <div class="qr-manager">
    <div class="toolbar">
      <input 
        v-model="inputText" 
        placeholder="输入文本"
        @keyup.enter="handleGenerate"
      />
      <button @click="handleGenerate" :disabled="loading">
        {{ loading ? '生成中...' : '生成' }}
      </button>
      
      <div class="history-controls">
        <button @click="undo" :disabled="!canUndo">撤销</button>
        <button @click="redo" :disabled="!canRedo">重做</button>
        <span>{{ currentIndex + 1 }} / {{ history.length }}</span>
      </div>
    </div>
    
    <div class="content">
      <div v-if="error" class="error">
        错误: {{ error.message }}
      </div>
      
      <div v-else-if="currentHistory" class="qr-display">
        <div ref="qrContainer"></div>
        <p>生成时间: {{ formatTime(currentHistory.timestamp) }}</p>
      </div>
    </div>
    
    <div class="history-list">
      <h3>历史记录</h3>
      <div 
        v-for="(item, index) in history" 
        :key="index"
        :class="['history-item', { active: index === currentIndex }]"
        @click="currentIndex = index"
      >
        <small>{{ formatTime(item.timestamp) }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useQRCodeManager } from './composables/useQRCodeManager'

const inputText = ref('Hello Vue Manager!')
const qrContainer = ref()

const {
  result,
  loading,
  error,
  generate,
  history,
  currentHistory,
  currentIndex,
  canUndo,
  canRedo,
  undo,
  redo
} = useQRCodeManager({
  size: 250,
  format: 'svg'
})

// 渲染当前二维码
watch(currentHistory, async (newHistory) => {
  if (newHistory && qrContainer.value) {
    await nextTick()
    qrContainer.value.innerHTML = ''
    qrContainer.value.appendChild(newHistory.result.element.cloneNode(true))
  }
})

const handleGenerate = () => {
  if (inputText.value.trim()) {
    generate(inputText.value)
  }
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// 初始生成
handleGenerate()
</script>
```
