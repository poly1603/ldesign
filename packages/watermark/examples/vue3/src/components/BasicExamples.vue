<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useWatermark } from '../composables/useWatermark'

// 模板引用
const simpleTextRef = ref<HTMLElement>()
const customStyleRef = ref<HTMLElement>()
const imageWatermarkRef = ref<HTMLElement>()
const multiLineRef = ref<HTMLElement>()
const liveConfigRef = ref<HTMLElement>()

// 使用 Hook 管理水印实例
const simpleTextWatermark = useWatermark(simpleTextRef)
const customStyleWatermark = useWatermark(customStyleRef)
const imageWatermarkInstance = useWatermark(imageWatermarkRef)
const multiLineWatermark = useWatermark(multiLineRef)
const liveConfigWatermark = useWatermark(liveConfigRef)

// 实时配置
const config = reactive({
  content: 'LDesign Watermark',
  fontSize: 16,
  opacity: 0.15,
  rotate: -22,
  color: '#000000',
  renderMode: 'dom' as 'dom' | 'canvas' | 'svg',
})

// 默认配置
const defaultConfig = { ...config }

// 创建简单文字水印
async function createSimpleText() {
  try {
    await simpleTextWatermark.create('简单水印', {
      style: {
        fontSize: 14,
        color: 'rgba(0, 0, 0, 0.1)',
      },
    })
  }
  catch (error) {
    console.error('创建简单水印失败:', error)
  }
}

// 销毁简单文字水印
async function destroySimpleText() {
  await simpleTextWatermark.destroy()
}

// 创建自定义样式水印
async function createCustomStyle() {
  try {
    await customStyleWatermark.create('自定义样式', {
      style: {
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: '#4CAF50',
        opacity: 0.3,
        rotate: -15,
        textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
      },
      layout: {
        gapX: 120,
        gapY: 80,
      },
    })
  }
  catch (error) {
    console.error('创建自定义样式水印失败:', error)
  }
}

// 销毁自定义样式水印
async function destroyCustomStyle() {
  await customStyleWatermark.destroy()
}

// 创建图片水印
async function createImageWatermark() {
  try {
    await imageWatermarkInstance.create('LOGO', {
      layout: {
        gapX: 120,
        gapY: 100,
      },
    })
  }
  catch (error) {
    console.error('创建图片水印失败:', error)
  }
}

// 销毁图片水印
async function destroyImageWatermark() {
  await imageWatermarkInstance.destroy()
}

// 创建多行文字水印
async function createMultiLine() {
  try {
    await multiLineWatermark.create(['LDesign', 'Watermark', '多行水印'], {
      style: {
        fontSize: 16,
        color: 'rgba(156, 39, 176, 0.2)',
        lineHeight: 1.5,
      },
      layout: {
        gapX: 150,
        gapY: 120,
      },
    })
  }
  catch (error) {
    console.error('创建多行水印失败:', error)
  }
}

// 销毁多行文字水印
async function destroyMultiLine() {
  await multiLineWatermark.destroy()
}

// 应用实时配置
async function applyLiveConfig() {
  try {
    await liveConfigWatermark.create(config.content, {
      style: {
        fontSize: config.fontSize,
        color: config.color,
        opacity: config.opacity,
        rotate: config.rotate,
      },
    })
  }
  catch (error) {
    console.error('应用实时配置失败:', error)
  }
}

// 重置配置
function resetConfig() {
  Object.assign(config, defaultConfig)
}

// 销毁实时配置水印
async function destroyLiveConfig() {
  await liveConfigWatermark.destroy()
}

// 监听配置变化，自动应用
watch(
  config,
  () => {
    if (liveConfigWatermark.isActive.value) {
      applyLiveConfig()
    }
  },
  { deep: true },
)

// 组件挂载时自动创建所有示例水印
onMounted(async () => {
  // 自动创建基础示例水印
  await createSimpleText()
  await createCustomStyle()
  await createImageWatermark()
  await createMultiLine()
  await applyLiveConfig()
})

// 组件卸载时清理所有实例 - Hook 会自动清理
onUnmounted(async () => {
  // Hook 会自动清理水印实例，无需手动清理
})

// 代码示例
const simpleTextCode = `const watermark = await createWatermark(container, {
  content: '简单水印',
  style: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.1)'
  }
})`

const customStyleCode = `const watermark = await createWatermark(container, {
  content: '自定义样式',
  style: {
    fontSize: 18,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'bold',
    color: '#4CAF50',
    opacity: 0.3,
    rotate: -15,
    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
  },
  layout: {
    gapX: 120,
    gapY: 80
  }
})`

const imageWatermarkCode = `const watermark = await createWatermark(container, {
  content: {
    src: '/path/to/logo.svg',
    width: 80,
    height: 40,
    opacity: 0.4
  },
  layout: {
    gapX: 120,
    gapY: 100
  }
})`

const multiLineCode = `const watermark = await createWatermark(container, {
  content: ['LDesign', 'Watermark', '多行水印'],
  style: {
    fontSize: 16,
    color: 'rgba(156, 39, 176, 0.2)',
    lineHeight: 1.5
  },
  layout: {
    gapX: 150,
    gapY: 120
  }
})`
</script>

<template>
  <div class="basic-examples">
    <h2 class="section-title">
      🎯 基础示例
    </h2>
    <p class="section-desc">
      展示水印组件的基本用法和核心功能
    </p>

    <div class="grid grid-2">
      <!-- 简单文字水印 -->
      <div class="card glass">
        <h3>简单文字水印</h3>
        <div ref="simpleTextRef" class="demo-container">
          <div class="demo-content">
            <p>这是一个简单的文字水印示例</p>
            <p>水印会自动铺满整个容器</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createSimpleText">
            创建水印
          </button>
          <button class="btn btn-danger" @click="destroySimpleText">
            清除水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ simpleTextCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 自定义样式水印 -->
      <div class="card glass">
        <h3>自定义样式水印</h3>
        <div ref="customStyleRef" class="demo-container">
          <div class="demo-content">
            <p>这是一个自定义样式的水印示例</p>
            <p>可以调整字体、颜色、透明度等</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createCustomStyle">
            创建水印
          </button>
          <button class="btn btn-danger" @click="destroyCustomStyle">
            清除水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ customStyleCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 图片水印 -->
      <div class="card glass">
        <h3>图片水印</h3>
        <div ref="imageWatermarkRef" class="demo-container">
          <div class="demo-content">
            <p>这是一个图片水印示例</p>
            <p>支持 PNG、JPG、SVG 等格式</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createImageWatermark">
            创建水印
          </button>
          <button class="btn btn-danger" @click="destroyImageWatermark">
            清除水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ imageWatermarkCode }}</code></pre>
          </details>
        </div>
      </div>

      <!-- 多行文字水印 -->
      <div class="card glass">
        <h3>多行文字水印</h3>
        <div ref="multiLineRef" class="demo-container">
          <div class="demo-content">
            <p>这是一个多行文字水印示例</p>
            <p>可以显示多行内容</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="createMultiLine">
            创建水印
          </button>
          <button class="btn btn-danger" @click="destroyMultiLine">
            清除水印
          </button>
        </div>
        <div class="code-preview">
          <details>
            <summary>查看代码</summary>
            <pre><code>{{ multiLineCode }}</code></pre>
          </details>
        </div>
      </div>
    </div>

    <!-- 实时配置面板 -->
    <div class="card glass mt-30">
      <h3>🎛️ 实时配置面板</h3>
      <div class="config-panel">
        <div class="config-grid">
          <div class="form-group">
            <label>水印文字</label>
            <input
              v-model="config.content"
              type="text"
              placeholder="输入水印文字"
            >
          </div>
          <div class="form-group">
            <label>字体大小: {{ config.fontSize }}px</label>
            <input v-model="config.fontSize" type="range" min="12" max="48">
          </div>
          <div class="form-group">
            <label>透明度: {{ config.opacity }}</label>
            <input
              v-model="config.opacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
            >
          </div>
          <div class="form-group">
            <label>旋转角度: {{ config.rotate }}°</label>
            <input v-model="config.rotate" type="range" min="-90" max="90">
          </div>
          <div class="form-group">
            <label>文字颜色</label>
            <input v-model="config.color" type="color">
          </div>
          <div class="form-group">
            <label>渲染模式</label>
            <select v-model="config.renderMode">
              <option value="dom">
                DOM
              </option>
              <option value="canvas">
                Canvas
              </option>
              <option value="svg">
                SVG
              </option>
            </select>
          </div>
        </div>
        <div ref="liveConfigRef" class="demo-container">
          <div class="demo-content">
            <p>实时预览区域</p>
            <p>修改上方配置可以实时看到效果</p>
          </div>
        </div>
        <div class="controls">
          <button class="btn btn-primary" @click="applyLiveConfig">
            应用配置
          </button>
          <button class="btn btn-secondary" @click="resetConfig">
            重置配置
          </button>
          <button class="btn btn-danger" @click="destroyLiveConfig">
            清除水印
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.basic-examples {
  .section-title {
    color: white;
    font-size: 1.8rem;
    margin-bottom: 10px;
    text-align: center;
  }

  .section-desc {
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin-bottom: 30px;
  }
}

.demo-container {
  position: relative;
  min-height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  margin: 15px 0;
  overflow: hidden;

  .demo-content {
    padding: 20px;
    text-align: center;
    color: #6c757d;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 200px;
  }
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 15px 0;
}

.code-preview {
  margin-top: 15px;

  details {
    summary {
      cursor: pointer;
      padding: 8px;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      font-weight: 500;
    }

    pre {
      margin-top: 10px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 6px;
      overflow-x: auto;

      code {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }
}

.config-panel {
  .config-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }
}

.mt-30 {
  margin-top: 30px;
}

@media (max-width: 768px) {
  .controls {
    flex-direction: column;
    align-items: center;
  }

  .config-panel .config-grid {
    grid-template-columns: 1fr;
  }
}
</style>
