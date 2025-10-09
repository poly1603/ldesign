<template>
  <div class="package-detail">
    <!-- 返回按钮 -->
    <div class="back-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>返回源详情</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <Loader2 :size="48" class="loading-spinner" />
      <p>正在加载包信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-section">
      <XCircle :size="48" class="error-icon" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadPackageDetail" class="retry-btn">重试</button>
    </div>

    <!-- 包详情内容 -->
    <div v-else-if="packageInfo" class="package-content">
      <!-- 包头部信息 -->
      <div class="package-header-card">
        <div class="package-icon-large">
          <Package :size="48" />
        </div>
        <div class="package-header-info">
          <h1 class="package-title">{{ packageInfo.name }}</h1>
          <p v-if="packageInfo.description" class="package-subtitle">{{ packageInfo.description }}</p>
          <div class="package-badges">
            <span class="badge version">
              <Tag :size="14" />
              v{{ packageInfo.version }}
            </span>
            <span class="badge license" v-if="packageInfo.license">
              <FileText :size="14" />
              {{ packageInfo.license }}
            </span>
            <a v-if="packageInfo.homepage" :href="packageInfo.homepage" target="_blank" class="badge link">
              <ExternalLink :size="14" />
              主页
            </a>
            <a v-if="packageInfo.repository?.url" :href="getRepoUrl(packageInfo.repository.url)" target="_blank" class="badge link">
              <Github :size="14" />
              仓库
            </a>
          </div>
        </div>
        <div class="package-actions">
          <button class="action-btn primary" @click="copyInstallCommand">
            <Copy :size="18" />
            <span>复制安装命令</span>
          </button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <Download :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">最新版本</div>
            <div class="stat-value">{{ packageInfo.version }}</div>
          </div>
        </div>
        <div class="stat-card" v-if="packageInfo.time?.modified">
          <div class="stat-icon">
            <Calendar :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">更新时间</div>
            <div class="stat-value">{{ formatDate(packageInfo.time.modified) }}</div>
          </div>
        </div>
        <div class="stat-card" v-if="packageInfo.author">
          <div class="stat-icon">
            <User :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">作者</div>
            <div class="stat-value">{{ getAuthorName(packageInfo.author) }}</div>
          </div>
        </div>
        <div class="stat-card" v-if="packageInfo.keywords?.length">
          <div class="stat-icon">
            <Tags :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">关键词</div>
            <div class="stat-value">{{ packageInfo.keywords.length }} 个</div>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="details-section">
        <!-- README -->
        <div class="detail-card" v-if="packageInfo.readme">
          <div class="card-header">
            <BookOpen :size="20" />
            <h2>README</h2>
          </div>
          <div class="readme-content" v-html="renderMarkdown(packageInfo.readme)"></div>
        </div>

        <!-- 依赖 -->
        <div class="detail-card" v-if="packageInfo.dependencies && Object.keys(packageInfo.dependencies).length > 0">
          <div class="card-header">
            <Package :size="20" />
            <h2>依赖项 ({{ Object.keys(packageInfo.dependencies).length }})</h2>
          </div>
          <div class="dependencies-list">
            <div v-for="(version, name) in packageInfo.dependencies" :key="name" class="dependency-item">
              <code class="dep-name">{{ name }}</code>
              <span class="dep-version">{{ version }}</span>
            </div>
          </div>
        </div>

        <!-- 开发依赖 -->
        <div class="detail-card" v-if="packageInfo.devDependencies && Object.keys(packageInfo.devDependencies).length > 0">
          <div class="card-header">
            <Code :size="20" />
            <h2>开发依赖 ({{ Object.keys(packageInfo.devDependencies).length }})</h2>
          </div>
          <div class="dependencies-list">
            <div v-for="(version, name) in packageInfo.devDependencies" :key="name" class="dependency-item">
              <code class="dep-name">{{ name }}</code>
              <span class="dep-version">{{ version }}</span>
            </div>
          </div>
        </div>

        <!-- 版本历史 -->
        <div class="detail-card" v-if="packageInfo.versions">
          <div class="card-header">
            <Clock :size="20" />
            <h2>版本历史 ({{ Object.keys(packageInfo.versions || {}).length }})</h2>
          </div>
          <div class="versions-list">
            <div v-for="(info, version) in getRecentVersions()" :key="version" class="version-item">
              <div class="version-tag">{{ version }}</div>
              <div class="version-time">{{ formatDate(packageInfo.time[version]) }}</div>
            </div>
          </div>
        </div>

        <!-- 关键词 -->
        <div class="detail-card" v-if="packageInfo.keywords?.length">
          <div class="card-header">
            <Tags :size="20" />
            <h2>关键词</h2>
          </div>
          <div class="keywords-list">
            <span v-for="keyword in packageInfo.keywords" :key="keyword" class="keyword-tag">
              {{ keyword }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Package,
  Loader2,
  XCircle,
  Tag,
  FileText,
  ExternalLink,
  Github,
  Copy,
  Download,
  Calendar,
  User,
  Tags,
  BookOpen,
  Code,
  Clock
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import { useMessage } from '../composables/useMessage'

const route = useRoute()
const router = useRouter()
const api = useApi()
const message = useMessage()

// 状态
const loading = ref(true)
const error = ref<string | null>(null)
const packageInfo = ref<any>(null)

// 返回源详情
const goBack = () => {
  const sourceId = route.params.id as string
  router.push(`/npm-sources/${sourceId}`)
}

// 加载包详情
const loadPackageDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const sourceId = route.params.id as string
    const packageName = route.params.packageName as string
    const response = await api.get(`/api/npm-sources/${sourceId}/packages/${packageName}`)

    if (response.success) {
      packageInfo.value = response.data
    } else {
      error.value = response.message || '加载包信息失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载包信息失败'
  } finally {
    loading.value = false
  }
}

// 复制安装命令
const copyInstallCommand = () => {
  if (!packageInfo.value) return
  
  const command = `npm install ${packageInfo.value.name}`
  navigator.clipboard.writeText(command)
  message.success('安装命令已复制到剪贴板')
}

// 获取仓库 URL
const getRepoUrl = (repoUrl: string) => {
  if (repoUrl.startsWith('git+')) {
    repoUrl = repoUrl.substring(4)
  }
  if (repoUrl.endsWith('.git')) {
    repoUrl = repoUrl.substring(0, repoUrl.length - 4)
  }
  return repoUrl
}

// 获取作者名称
const getAuthorName = (author: any) => {
  if (typeof author === 'string') return author
  if (author?.name) return author.name
  return '未知'
}

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

// 获取最近版本（最多10个）
const getRecentVersions = () => {
  if (!packageInfo.value?.versions) return {}
  
  const versions = Object.keys(packageInfo.value.versions)
  const recent = versions.slice(-10).reverse()
  const result: any = {}
  
  recent.forEach(v => {
    result[v] = packageInfo.value.versions[v]
  })
  
  return result
}

// 简单的 Markdown 渲染（可以考虑使用 marked 库）
const renderMarkdown = (markdown: string) => {
  if (!markdown) return ''
  
  // 简单转换，实际项目中建议使用 marked 或 markdown-it 库
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n$/gim, '<br />')
  
  return html
}

onMounted(() => {
  loadPackageDetail()
})
</script>

<style lang="less" scoped>
.package-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-spacing-xl);
}

.back-header {
  margin-bottom: var(--ls-spacing-lg);

  .back-btn {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    background: transparent;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--ldesign-bg-color-component-hover);
      color: var(--ldesign-brand-color);
      border-color: var(--ldesign-brand-color);
    }
  }
}

.loading-section,
.error-section {
  text-align: center;
  padding: var(--ls-spacing-xxl);

  .loading-spinner,
  .error-icon {
    margin-bottom: var(--ls-spacing-base);
    color: var(--ldesign-brand-color);
  }

  .error-icon {
    color: var(--ldesign-error-color);
  }

  h3 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    color: var(--ldesign-text-color-secondary);
    margin: 0 0 var(--ls-spacing-base) 0;
  }

  .retry-btn {
    padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
    background: var(--ldesign-brand-color);
    color: white;
    border: none;
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: var(--ldesign-brand-color-hover);
    }
  }
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.package-header-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-xl);
  margin-bottom: var(--ls-spacing-lg);
  display: flex;
  gap: var(--ls-spacing-lg);
  align-items: flex-start;
}

.package-icon-large {
  width: 80px;
  height: 80px;
  border-radius: var(--ls-border-radius-lg);
  background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.package-header-info {
  flex: 1;
}

.package-title {
  font-size: var(--ls-font-size-xxl);
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-spacing-xs) 0;
  font-family: 'Consolas', 'Monaco', monospace;
}

.package-subtitle {
  color: var(--ldesign-text-color-secondary);
  margin: 0 0 var(--ls-spacing-base) 0;
  line-height: 1.6;
}

.package-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-sm);

  .badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: var(--ls-border-radius-base);
    font-size: var(--ls-font-size-sm);
    font-weight: 500;

    &.version {
      background: var(--ldesign-brand-color-1);
      color: var(--ldesign-brand-color);
    }

    &.license {
      background: var(--ldesign-gray-color-1);
      color: var(--ldesign-text-color-secondary);
    }

    &.link {
      background: var(--ldesign-bg-color-component);
      color: var(--ldesign-brand-color);
      text-decoration: none;
      border: 1px solid var(--ldesign-border-color);
      transition: all 0.2s ease;

      &:hover {
        background: var(--ldesign-brand-color);
        color: white;
        border-color: var(--ldesign-brand-color);
      }
    }
  }
}

.package-actions {
  .action-btn {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
    border: none;
    border-radius: var(--ls-border-radius-base);
    cursor: pointer;
    font-size: var(--ls-font-size-sm);
    font-weight: 500;
    transition: all 0.2s ease;

    &.primary {
      background: var(--ldesign-brand-color);
      color: white;

      &:hover {
        background: var(--ldesign-brand-color-hover);
      }
    }
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);
}

.stat-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  display: flex;
  gap: var(--ls-spacing-base);
  align-items: center;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-brand-color-1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ldesign-brand-color);
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: var(--ls-font-size-lg);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
}

.details-section {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.detail-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-lg);

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-spacing-base);
    padding-bottom: var(--ls-spacing-base);
    border-bottom: 1px solid var(--ldesign-border-color);

    h2 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
    }

    svg {
      color: var(--ldesign-brand-color);
    }
  }
}

.readme-content {
  color: var(--ldesign-text-color-primary);
  line-height: 1.8;
  font-size: var(--ls-font-size-base);

  :deep(h1), :deep(h2), :deep(h3) {
    color: var(--ldesign-text-color-primary);
    margin-top: var(--ls-spacing-lg);
    margin-bottom: var(--ls-spacing-base);
  }

  :deep(code) {
    background: var(--ldesign-gray-color-1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
  }

  :deep(a) {
    color: var(--ldesign-brand-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(img) {
    max-width: 100%;
    border-radius: var(--ls-border-radius-base);
    margin: var(--ls-spacing-base) 0;
  }
}

.dependencies-list,
.versions-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-xs);
}

.dependency-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-bg-color-component);
  border-radius: var(--ls-border-radius-sm);

  .dep-name {
    font-family: 'Consolas', 'Monaco', monospace;
    color: var(--ldesign-text-color-primary);
    font-size: var(--ls-font-size-sm);
  }

  .dep-version {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.version-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-sm);
  border-bottom: 1px solid var(--ldesign-border-color);

  &:last-child {
    border-bottom: none;
  }

  .version-tag {
    font-family: 'Consolas', 'Monaco', monospace;
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }

  .version-time {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}

.keywords-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-sm);

  .keyword-tag {
    padding: 6px 12px;
    background: var(--ldesign-gray-color-1);
    border-radius: var(--ls-border-radius-base);
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}
</style>
