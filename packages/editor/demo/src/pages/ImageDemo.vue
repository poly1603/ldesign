<template>
  <div class="image-demo">
    <div class="demo-header">
      <h2>🖼️ 图片功能演示</h2>
      <p>测试图片插入、编辑、上传等功能，体验完整的图片管理能力。</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <div class="editor-container">
          <h3>图片编辑器</h3>
          
          <!-- 图片工具栏 -->
          <div class="image-toolbar">
            <div class="toolbar-group">
              <button @click="insertImageFromUrl" class="toolbar-btn">
                🔗 URL插入
              </button>
              <button @click="uploadImage" class="toolbar-btn">
                📁 上传图片
              </button>
              <button @click="insertSampleImage" class="toolbar-btn">
                🖼️ 示例图片
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="alignImage('left')" class="toolbar-btn" :disabled="!selectedImage">
                ⬅️ 左对齐
              </button>
              <button @click="alignImage('center')" class="toolbar-btn" :disabled="!selectedImage">
                ↔️ 居中
              </button>
              <button @click="alignImage('right')" class="toolbar-btn" :disabled="!selectedImage">
                ➡️ 右对齐
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="resizeImage(300)" class="toolbar-btn" :disabled="!selectedImage">
                📏 小尺寸
              </button>
              <button @click="resizeImage(500)" class="toolbar-btn" :disabled="!selectedImage">
                📐 中尺寸
              </button>
              <button @click="resizeImage(800)" class="toolbar-btn" :disabled="!selectedImage">
                📊 大尺寸
              </button>
            </div>
          </div>

          <!-- 编辑器区域 -->
          <div 
            ref="editorContainer" 
            class="editor-area"
            contenteditable="true"
            @click="handleEditorClick"
          >
            <h2>图片功能测试</h2>
            <p>这是一个图片功能演示页面。您可以：</p>
            <ul>
              <li>通过URL插入图片</li>
              <li>上传本地图片文件</li>
              <li>调整图片大小和对齐方式</li>
              <li>编辑图片属性</li>
            </ul>
            <p>点击上方的按钮来测试各种图片功能！</p>
          </div>

          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-item">
              <span class="status-label">选中图片:</span>
              <span class="status-value">{{ selectedImage ? '是' : '否' }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">图片数量:</span>
              <span class="status-value">{{ imageCount }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">编辑器状态:</span>
              <span class="status-value">{{ editorStatus }}</span>
            </div>
          </div>
        </div>

        <div class="info-panel">
          <h3>图片管理</h3>
          
          <div class="info-section">
            <h4>上传配置</h4>
            <div class="config-list">
              <div class="config-item">
                <strong>允许类型:</strong> image/*
              </div>
              <div class="config-item">
                <strong>最大大小:</strong> {{ formatFileSize(maxFileSize) }}
              </div>
              <div class="config-item">
                <strong>多文件上传:</strong> 支持
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>已上传图片</h4>
            <div class="media-list">
              <div 
                v-for="media in mediaFiles" 
                :key="media.id"
                class="media-item"
              >
                <img :src="media.thumbnailUrl || media.url" :alt="media.name" class="media-thumbnail">
                <div class="media-info">
                  <div class="media-name">{{ media.name }}</div>
                  <div class="media-size">{{ formatFileSize(media.size) }}</div>
                  <div class="media-dimensions" v-if="media.metadata?.width">
                    {{ media.metadata.width }}×{{ media.metadata.height }}
                  </div>
                </div>
                <div class="media-actions">
                  <button @click="insertMediaImage(media)" class="action-btn">插入</button>
                  <button @click="deleteMedia(media.id)" class="action-btn danger">删除</button>
                </div>
              </div>
              <div v-if="mediaFiles.length === 0" class="empty-state">
                暂无上传的图片
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>功能测试</h4>
            <div class="test-buttons">
              <button @click="testImageAPI" class="test-btn">🧪 测试图片API</button>
              <button @click="clearEditor" class="test-btn">🗑️ 清空编辑器</button>
              <button @click="exportContent" class="test-btn">📤 导出内容</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

// 响应式数据
const editorContainer = ref<HTMLElement>()
const selectedImage = ref<HTMLImageElement | null>(null)
const editorStatus = ref('就绪')
const maxFileSize = ref(10 * 1024 * 1024) // 10MB

// 媒体文件列表
const mediaFiles = reactive<any[]>([])

// 计算属性
const imageCount = computed(() => {
  if (!editorContainer.value) return 0
  return editorContainer.value.querySelectorAll('img').length
})

// 生命周期
onMounted(() => {
  console.log('🖼️ 图片演示页面已加载')
  setupImageHandlers()
})

// 设置图片处理器
function setupImageHandlers() {
  if (!editorContainer.value) return

  // 监听图片点击事件
  editorContainer.value.addEventListener('click', (e) => {
    if (e.target instanceof HTMLImageElement) {
      selectImage(e.target)
    } else {
      selectedImage.value = null
    }
  })
}

// 处理编辑器点击
function handleEditorClick(e: Event) {
  if (e.target instanceof HTMLImageElement) {
    selectImage(e.target)
  } else {
    selectedImage.value = null
  }
}

// 选中图片
function selectImage(img: HTMLImageElement) {
  // 清除之前的选中状态
  document.querySelectorAll('.selected-image').forEach(el => {
    el.classList.remove('selected-image')
  })

  // 设置新的选中状态
  img.classList.add('selected-image')
  selectedImage.value = img
  editorStatus.value = `已选中图片: ${img.alt || '无标题'}`
}

// 通过URL插入图片
function insertImageFromUrl() {
  const url = prompt('请输入图片URL:')
  if (url) {
    const alt = prompt('请输入替代文本 (可选):') || ''
    insertImage({ src: url, alt })
  }
}

// 上传图片
function uploadImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true

  input.addEventListener('change', async (e) => {
    const files = (e.target as HTMLInputElement).files
    if (files && files.length > 0) {
      await handleFileUpload(Array.from(files))
    }
  })

  input.click()
}

// 插入示例图片
function insertSampleImage() {
  const sampleImages = [
    { src: 'https://picsum.photos/400/300?random=1', alt: '示例图片1' },
    { src: 'https://picsum.photos/500/350?random=2', alt: '示例图片2' },
    { src: 'https://picsum.photos/600/400?random=3', alt: '示例图片3' }
  ]
  
  const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)]
  insertImage(randomImage)
}

// 插入图片
function insertImage(config: { src: string; alt?: string; width?: number; height?: number }) {
  if (!editorContainer.value) return

  const img = document.createElement('img')
  img.src = config.src
  img.alt = config.alt || ''
  img.style.maxWidth = '100%'
  img.style.height = 'auto'
  
  if (config.width) {
    img.width = config.width
  }
  
  if (config.height) {
    img.height = config.height
  }

  // 添加点击事件
  img.addEventListener('click', () => selectImage(img))

  // 插入到编辑器
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.insertNode(img)
    range.setStartAfter(img)
    range.collapse(true)
  } else {
    editorContainer.value.appendChild(img)
  }

  editorStatus.value = '图片已插入'
}

// 对齐图片
function alignImage(alignment: 'left' | 'center' | 'right') {
  if (!selectedImage.value) return

  const img = selectedImage.value
  
  // 清除之前的对齐样式
  img.style.display = ''
  img.style.margin = ''
  img.style.float = ''

  // 应用新的对齐方式
  if (alignment === 'center') {
    img.style.display = 'block'
    img.style.margin = '0 auto'
  } else {
    img.style.float = alignment
  }

  editorStatus.value = `图片已${alignment === 'left' ? '左' : alignment === 'right' ? '右' : '居中'}对齐`
}

// 调整图片大小
function resizeImage(width: number) {
  if (!selectedImage.value) return

  selectedImage.value.width = width
  selectedImage.value.style.width = width + 'px'
  selectedImage.value.style.height = 'auto'

  editorStatus.value = `图片大小已调整为 ${width}px`
}

// 处理文件上传
async function handleFileUpload(files: File[]) {
  editorStatus.value = '正在上传图片...'

  for (const file of files) {
    try {
      // 验证文件
      if (!file.type.startsWith('image/')) {
        throw new Error('只支持图片文件')
      }

      if (file.size > maxFileSize.value) {
        throw new Error(`文件大小超过限制: ${formatFileSize(file.size)}`)
      }

      // 创建媒体文件对象
      const mediaFile = await createMediaFile(file)
      mediaFiles.push(mediaFile)

      // 插入图片
      insertImage({
        src: mediaFile.url,
        alt: mediaFile.name,
        width: mediaFile.metadata?.width > 800 ? 800 : mediaFile.metadata?.width
      })

      editorStatus.value = `图片上传成功: ${file.name}`
    } catch (error) {
      console.error('图片上传失败:', error)
      editorStatus.value = `上传失败: ${error instanceof Error ? error.message : '未知错误'}`
    }
  }
}

// 创建媒体文件对象
async function createMediaFile(file: File) {
  const id = Date.now().toString()
  const url = URL.createObjectURL(file)
  
  // 获取图片尺寸
  const dimensions = await getImageDimensions(file)

  return {
    id,
    name: file.name,
    type: 'image',
    mimeType: file.type,
    size: file.size,
    url,
    thumbnailUrl: url,
    uploadTime: new Date(),
    metadata: {
      width: dimensions.width,
      height: dimensions.height,
      lastModified: file.lastModified
    }
  }
}

// 获取图片尺寸
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('无法加载图片'))
    }

    img.src = url
  })
}

// 插入媒体图片
function insertMediaImage(media: any) {
  insertImage({
    src: media.url,
    alt: media.name,
    width: media.metadata?.width > 600 ? 600 : media.metadata?.width
  })
}

// 删除媒体文件
function deleteMedia(id: string) {
  const index = mediaFiles.findIndex(m => m.id === id)
  if (index > -1) {
    const media = mediaFiles[index]
    URL.revokeObjectURL(media.url)
    mediaFiles.splice(index, 1)
    editorStatus.value = `已删除: ${media.name}`
  }
}

// 测试图片API
function testImageAPI() {
  const testResults = []
  
  // 测试图片数量
  const imgCount = editorContainer.value?.querySelectorAll('img').length || 0
  testResults.push(`图片数量: ${imgCount}`)
  
  // 测试选中状态
  testResults.push(`选中图片: ${selectedImage.value ? '是' : '否'}`)
  
  // 测试媒体文件
  testResults.push(`媒体文件: ${mediaFiles.length}`)
  
  alert('图片API测试结果:\n' + testResults.join('\n'))
}

// 清空编辑器
function clearEditor() {
  if (editorContainer.value && confirm('确定要清空编辑器内容吗？')) {
    editorContainer.value.innerHTML = '<p>编辑器已清空，可以重新开始测试。</p>'
    selectedImage.value = null
    editorStatus.value = '编辑器已清空'
  }
}

// 导出内容
function exportContent() {
  if (!editorContainer.value) return
  
  const content = editorContainer.value.innerHTML
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'editor-content.html'
  a.click()
  
  URL.revokeObjectURL(url)
  editorStatus.value = '内容已导出'
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`
}
</script>

<style lang="less" scoped>
.image-demo {
  padding: var(--ls-padding-base);
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);

  h2 {
    color: var(--ldesign-text-color-primary);
    margin-bottom: var(--ls-margin-sm);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.demo-content {
  .demo-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--ls-spacing-lg);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
}

.editor-container {
  .image-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    margin-bottom: var(--ls-margin-sm);

    .toolbar-group {
      display: flex;
      gap: var(--ls-spacing-xs);
    }

    .toolbar-btn {
      padding: var(--ls-padding-xs) var(--ls-padding-sm);
      background: var(--ldesign-brand-color);
      color: var(--ldesign-font-white-1);
      border: none;
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        background: var(--ldesign-gray-color-4);
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  .editor-area {
    min-height: 400px;
    padding: var(--ls-padding-base);
    border: 2px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-container);
    font-family: inherit;
    line-height: 1.6;
    outline: none;

    &:focus {
      border-color: var(--ldesign-brand-color);
    }

    :deep(.selected-image) {
      outline: 2px solid var(--ldesign-brand-color);
      outline-offset: 2px;
    }

    img {
      max-width: 100%;
      height: auto;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        opacity: 0.9;
      }
    }
  }

  .status-bar {
    display: flex;
    gap: var(--ls-spacing-base);
    padding: var(--ls-padding-sm);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    margin-top: var(--ls-margin-sm);
    font-size: var(--ls-font-size-xs);

    .status-item {
      .status-label {
        color: var(--ldesign-text-color-secondary);
        margin-right: var(--ls-spacing-xs);
      }

      .status-value {
        color: var(--ldesign-text-color-primary);
        font-weight: 500;
      }
    }
  }
}

.info-panel {
  .info-section {
    margin-bottom: var(--ls-margin-base);
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);

    h4 {
      margin: 0 0 var(--ls-margin-sm) 0;
      color: var(--ldesign-text-color-primary);
      font-size: var(--ls-font-size-sm);
    }
  }

  .config-list {
    .config-item {
      padding: var(--ls-padding-xs) 0;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);

      strong {
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  .media-list {
    .media-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);
      padding: var(--ls-padding-sm);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-sm);
      margin-bottom: var(--ls-margin-xs);

      .media-thumbnail {
        width: 40px;
        height: 40px;
        object-fit: cover;
        border-radius: var(--ls-border-radius-sm);
      }

      .media-info {
        flex: 1;
        font-size: var(--ls-font-size-xs);

        .media-name {
          font-weight: 500;
          color: var(--ldesign-text-color-primary);
        }

        .media-size,
        .media-dimensions {
          color: var(--ldesign-text-color-secondary);
        }
      }

      .media-actions {
        display: flex;
        gap: var(--ls-spacing-xs);

        .action-btn {
          padding: var(--ls-padding-xs);
          background: var(--ldesign-brand-color);
          color: var(--ldesign-font-white-1);
          border: none;
          border-radius: var(--ls-border-radius-sm);
          cursor: pointer;
          font-size: var(--ls-font-size-xs);

          &.danger {
            background: var(--ldesign-error-color);
          }

          &:hover {
            opacity: 0.9;
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      color: var(--ldesign-text-color-placeholder);
      font-size: var(--ls-font-size-xs);
      padding: var(--ls-padding-base);
    }
  }

  .test-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);

    .test-btn {
      padding: var(--ls-padding-sm);
      background: var(--ldesign-success-color);
      color: var(--ldesign-font-white-1);
      border: none;
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);

      &:hover {
        background: var(--ldesign-success-color-hover);
      }
    }
  }
}
</style>
