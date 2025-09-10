<template>
  <div class="link-demo">
    <div class="demo-header">
      <h2>🔗 链接功能演示</h2>
      <p>测试链接插入、编辑、预览等功能，体验完整的链接管理能力。</p>
    </div>

    <div class="demo-content">
      <div class="demo-section">
        <div class="editor-container">
          <h3>链接编辑器</h3>
          
          <!-- 链接工具栏 -->
          <div class="link-toolbar">
            <div class="toolbar-group">
              <button @click="insertLink" class="toolbar-btn">
                🔗 插入链接
              </button>
              <button @click="insertQuickLink" class="toolbar-btn">
                ⚡ 快速链接
              </button>
              <button @click="insertEmailLink" class="toolbar-btn">
                📧 邮箱链接
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="editLink" class="toolbar-btn" :disabled="!selectedLink">
                ✏️ 编辑链接
              </button>
              <button @click="removeLink" class="toolbar-btn" :disabled="!selectedLink">
                🗑️ 移除链接
              </button>
              <button @click="openLink" class="toolbar-btn" :disabled="!selectedLink">
                🌐 打开链接
              </button>
            </div>
            <div class="toolbar-group">
              <button @click="copyLink" class="toolbar-btn" :disabled="!selectedLink">
                📋 复制链接
              </button>
              <button @click="validateLinks" class="toolbar-btn">
                ✅ 验证链接
              </button>
            </div>
          </div>

          <!-- 编辑器区域 -->
          <div 
            ref="editorContainer" 
            class="editor-area"
            contenteditable="true"
            @click="handleEditorClick"
            @keyup="handleKeyUp"
          >
            <h2>链接功能测试</h2>
            <p>这是一个链接功能演示页面。您可以：</p>
            <ul>
              <li>插入各种类型的链接</li>
              <li>编辑现有链接的属性</li>
              <li>预览和打开链接</li>
              <li>验证链接的有效性</li>
            </ul>
            <p>选择文本后点击"插入链接"按钮，或者直接点击按钮插入链接。</p>
            <p>示例链接：<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></p>
          </div>

          <!-- 状态栏 -->
          <div class="status-bar">
            <div class="status-item">
              <span class="status-label">选中链接:</span>
              <span class="status-value">{{ selectedLink ? '是' : '否' }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">链接数量:</span>
              <span class="status-value">{{ linkCount }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">编辑器状态:</span>
              <span class="status-value">{{ editorStatus }}</span>
            </div>
          </div>
        </div>

        <div class="info-panel">
          <h3>链接管理</h3>
          
          <div class="info-section">
            <h4>链接信息</h4>
            <div v-if="selectedLink" class="link-info">
              <div class="info-item">
                <strong>URL:</strong> {{ selectedLink.href }}
              </div>
              <div class="info-item">
                <strong>文本:</strong> {{ selectedLink.textContent }}
              </div>
              <div class="info-item">
                <strong>标题:</strong> {{ selectedLink.title || '无' }}
              </div>
              <div class="info-item">
                <strong>打开方式:</strong> {{ selectedLink.target || '_self' }}
              </div>
              <div class="info-item">
                <strong>关系:</strong> {{ selectedLink.rel || '无' }}
              </div>
            </div>
            <div v-else class="no-selection">
              请点击链接查看详细信息
            </div>
          </div>

          <div class="info-section">
            <h4>页面链接列表</h4>
            <div class="links-list">
              <div 
                v-for="(link, index) in pageLinks" 
                :key="index"
                class="link-item"
                @click="selectLinkFromList(link)"
              >
                <div class="link-text">{{ link.textContent || link.href }}</div>
                <div class="link-url">{{ link.href }}</div>
                <div class="link-status" :class="getLinkStatusClass(link)">
                  {{ getLinkStatus(link) }}
                </div>
              </div>
              <div v-if="pageLinks.length === 0" class="empty-state">
                暂无链接
              </div>
            </div>
          </div>

          <div class="info-section">
            <h4>快速链接模板</h4>
            <div class="quick-links">
              <button 
                v-for="template in linkTemplates" 
                :key="template.name"
                @click="insertTemplateLink(template)"
                class="template-btn"
              >
                {{ template.icon }} {{ template.name }}
              </button>
            </div>
          </div>

          <div class="info-section">
            <h4>功能测试</h4>
            <div class="test-buttons">
              <button @click="testLinkAPI" class="test-btn">🧪 测试链接API</button>
              <button @click="exportLinks" class="test-btn">📤 导出链接</button>
              <button @click="clearEditor" class="test-btn">🗑️ 清空编辑器</button>
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
const selectedLink = ref<HTMLAnchorElement | null>(null)
const editorStatus = ref('就绪')

// 链接模板
const linkTemplates = reactive([
  { name: 'GitHub', icon: '🐙', url: 'https://github.com', target: '_blank' },
  { name: 'MDN', icon: '📚', url: 'https://developer.mozilla.org', target: '_blank' },
  { name: 'Vue.js', icon: '💚', url: 'https://vuejs.org', target: '_blank' },
  { name: 'TypeScript', icon: '🔷', url: 'https://typescriptlang.org', target: '_blank' },
  { name: 'Vite', icon: '⚡', url: 'https://vitejs.dev', target: '_blank' }
])

// 计算属性
const linkCount = computed(() => {
  if (!editorContainer.value) return 0
  return editorContainer.value.querySelectorAll('a').length
})

const pageLinks = computed(() => {
  if (!editorContainer.value) return []
  return Array.from(editorContainer.value.querySelectorAll('a'))
})

// 生命周期
onMounted(() => {
  console.log('🔗 链接演示页面已加载')
  setupLinkHandlers()
})

// 设置链接处理器
function setupLinkHandlers() {
  if (!editorContainer.value) return

  // 监听链接点击事件
  editorContainer.value.addEventListener('click', (e) => {
    if (e.target instanceof HTMLAnchorElement) {
      e.preventDefault()
      selectLink(e.target)
    } else {
      selectedLink.value = null
    }
  })
}

// 处理编辑器点击
function handleEditorClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement) {
    e.preventDefault()
    selectLink(e.target)
  } else {
    selectedLink.value = null
  }
}

// 处理键盘事件
function handleKeyUp(e: KeyboardEvent) {
  // 可以添加快捷键支持
  if (e.ctrlKey && e.key === 'k') {
    e.preventDefault()
    insertLink()
  }
}

// 选中链接
function selectLink(link: HTMLAnchorElement) {
  // 清除之前的选中状态
  document.querySelectorAll('.selected-link').forEach(el => {
    el.classList.remove('selected-link')
  })

  // 设置新的选中状态
  link.classList.add('selected-link')
  selectedLink.value = link
  editorStatus.value = `已选中链接: ${link.textContent || link.href}`
}

// 插入链接
function insertLink() {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  
  const href = prompt('请输入链接URL:')
  if (!href) return
  
  const text = prompt('请输入链接文本:', selectedText || href) || href
  const title = prompt('请输入链接标题 (可选):') || ''
  const target = confirm('是否在新窗口打开链接？') ? '_blank' : '_self'
  
  createLink({
    href,
    text,
    title,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : undefined
  })
}

// 插入快速链接
function insertQuickLink() {
  const quickLinks = [
    'https://www.google.com',
    'https://www.github.com',
    'https://www.stackoverflow.com',
    'https://www.mdn.mozilla.org'
  ]
  
  const href = quickLinks[Math.floor(Math.random() * quickLinks.length)]
  const text = new URL(href).hostname
  
  createLink({
    href,
    text,
    target: '_blank',
    rel: 'noopener noreferrer'
  })
}

// 插入邮箱链接
function insertEmailLink() {
  const email = prompt('请输入邮箱地址:')
  if (!email) return
  
  const subject = prompt('邮件主题 (可选):') || ''
  const body = prompt('邮件内容 (可选):') || ''
  
  let href = `mailto:${email}`
  const params = []
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  if (params.length > 0) href += '?' + params.join('&')
  
  createLink({
    href,
    text: email,
    title: `发送邮件给 ${email}`
  })
}

// 创建链接
function createLink(config: {
  href: string
  text?: string
  title?: string
  target?: string
  rel?: string
}) {
  if (!editorContainer.value) return

  const link = document.createElement('a')
  link.href = config.href
  link.textContent = config.text || config.href
  
  if (config.title) link.title = config.title
  if (config.target) link.target = config.target
  if (config.rel) link.rel = config.rel

  // 添加样式
  link.style.color = 'var(--ldesign-brand-color)'
  link.style.textDecoration = 'underline'
  link.style.cursor = 'pointer'

  // 添加事件监听器
  link.addEventListener('click', (e) => {
    e.preventDefault()
    selectLink(link)
  })

  // 插入到编辑器
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    
    // 如果有选中文本，替换选中内容
    if (selection.toString()) {
      range.deleteContents()
    }
    
    range.insertNode(link)
    range.setStartAfter(link)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  } else {
    editorContainer.value.appendChild(link)
  }

  editorStatus.value = '链接已插入'
}

// 编辑链接
function editLink() {
  if (!selectedLink.value) return

  const link = selectedLink.value
  const newHref = prompt('链接URL:', link.href)
  if (newHref !== null && newHref !== link.href) {
    link.href = newHref
  }

  const newText = prompt('链接文本:', link.textContent || '')
  if (newText !== null && newText !== link.textContent) {
    link.textContent = newText
  }

  const newTitle = prompt('链接标题:', link.title)
  if (newTitle !== null) {
    link.title = newTitle
  }

  const newTarget = confirm('是否在新窗口打开？') ? '_blank' : '_self'
  link.target = newTarget
  link.rel = newTarget === '_blank' ? 'noopener noreferrer' : ''

  editorStatus.value = '链接已更新'
}

// 移除链接
function removeLink() {
  if (!selectedLink.value) return

  const link = selectedLink.value
  const textNode = document.createTextNode(link.textContent || '')
  link.parentNode?.replaceChild(textNode, link)
  
  selectedLink.value = null
  editorStatus.value = '链接已移除'
}

// 打开链接
function openLink() {
  if (!selectedLink.value) return

  const link = selectedLink.value
  const target = link.target || '_self'
  window.open(link.href, target)
  
  editorStatus.value = `已打开链接: ${link.href}`
}

// 复制链接
function copyLink() {
  if (!selectedLink.value) return

  const link = selectedLink.value
  navigator.clipboard.writeText(link.href).then(() => {
    editorStatus.value = '链接已复制到剪贴板'
  }).catch(() => {
    editorStatus.value = '复制失败'
  })
}

// 验证链接
async function validateLinks() {
  const links = pageLinks.value
  if (links.length === 0) {
    editorStatus.value = '没有链接需要验证'
    return
  }

  editorStatus.value = '正在验证链接...'
  let validCount = 0
  let invalidCount = 0

  for (const link of links) {
    try {
      // 简单的URL格式验证
      new URL(link.href)
      link.classList.remove('invalid-link')
      link.classList.add('valid-link')
      validCount++
    } catch {
      link.classList.remove('valid-link')
      link.classList.add('invalid-link')
      invalidCount++
    }
  }

  editorStatus.value = `验证完成: ${validCount} 个有效，${invalidCount} 个无效`
}

// 从列表选择链接
function selectLinkFromList(link: HTMLAnchorElement) {
  selectLink(link)
  
  // 滚动到链接位置
  link.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

// 获取链接状态
function getLinkStatus(link: HTMLAnchorElement): string {
  if (link.classList.contains('valid-link')) return '有效'
  if (link.classList.contains('invalid-link')) return '无效'
  return '未验证'
}

// 获取链接状态样式类
function getLinkStatusClass(link: HTMLAnchorElement): string {
  if (link.classList.contains('valid-link')) return 'status-valid'
  if (link.classList.contains('invalid-link')) return 'status-invalid'
  return 'status-unknown'
}

// 插入模板链接
function insertTemplateLink(template: any) {
  createLink({
    href: template.url,
    text: template.name,
    target: template.target,
    rel: template.target === '_blank' ? 'noopener noreferrer' : undefined
  })
}

// 测试链接API
function testLinkAPI() {
  const testResults = []
  
  // 测试链接数量
  testResults.push(`链接数量: ${linkCount.value}`)
  
  // 测试选中状态
  testResults.push(`选中链接: ${selectedLink.value ? '是' : '否'}`)
  
  // 测试链接类型
  const emailLinks = pageLinks.value.filter(link => link.href.startsWith('mailto:')).length
  const httpLinks = pageLinks.value.filter(link => link.href.startsWith('http')).length
  testResults.push(`邮箱链接: ${emailLinks}`)
  testResults.push(`HTTP链接: ${httpLinks}`)
  
  alert('链接API测试结果:\n' + testResults.join('\n'))
}

// 导出链接
function exportLinks() {
  const links = pageLinks.value.map(link => ({
    text: link.textContent,
    href: link.href,
    title: link.title,
    target: link.target
  }))
  
  const content = JSON.stringify(links, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'links.json'
  a.click()
  
  URL.revokeObjectURL(url)
  editorStatus.value = '链接已导出'
}

// 清空编辑器
function clearEditor() {
  if (editorContainer.value && confirm('确定要清空编辑器内容吗？')) {
    editorContainer.value.innerHTML = '<p>编辑器已清空，可以重新开始测试。</p>'
    selectedLink.value = null
    editorStatus.value = '编辑器已清空'
  }
}
</script>

<style lang="less" scoped>
.link-demo {
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
  .link-toolbar {
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

    :deep(.selected-link) {
      outline: 2px solid var(--ldesign-brand-color);
      outline-offset: 2px;
    }

    :deep(.valid-link) {
      border-bottom: 2px solid var(--ldesign-success-color);
    }

    :deep(.invalid-link) {
      border-bottom: 2px solid var(--ldesign-error-color);
    }

    a {
      color: var(--ldesign-brand-color);
      text-decoration: underline;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--ldesign-brand-color-hover);
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

  .link-info {
    .info-item {
      padding: var(--ls-padding-xs) 0;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
      word-break: break-all;

      strong {
        color: var(--ldesign-text-color-primary);
      }
    }
  }

  .no-selection {
    text-align: center;
    color: var(--ldesign-text-color-placeholder);
    font-size: var(--ls-font-size-xs);
    padding: var(--ls-padding-base);
  }

  .links-list {
    .link-item {
      padding: var(--ls-padding-sm);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-sm);
      margin-bottom: var(--ls-margin-xs);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-bg-color-container-hover);
      }

      .link-text {
        font-weight: 500;
        color: var(--ldesign-text-color-primary);
        font-size: var(--ls-font-size-xs);
        margin-bottom: var(--ls-margin-xs);
      }

      .link-url {
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-xs);
        word-break: break-all;
        margin-bottom: var(--ls-margin-xs);
      }

      .link-status {
        font-size: var(--ls-font-size-xs);
        padding: 2px 6px;
        border-radius: var(--ls-border-radius-sm);

        &.status-valid {
          background: var(--ldesign-success-color-2);
          color: var(--ldesign-success-color-8);
        }

        &.status-invalid {
          background: var(--ldesign-error-color-2);
          color: var(--ldesign-error-color-8);
        }

        &.status-unknown {
          background: var(--ldesign-gray-color-2);
          color: var(--ldesign-gray-color-8);
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

  .quick-links {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-xs);

    .template-btn {
      padding: var(--ls-padding-sm);
      background: var(--ldesign-bg-color-container);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      font-size: var(--ls-font-size-xs);
      text-align: left;
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-bg-color-container-hover);
        border-color: var(--ldesign-brand-color);
      }
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
