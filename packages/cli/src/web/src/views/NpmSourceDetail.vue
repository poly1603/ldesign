<template>
  <div class="npm-source-detail">
    <!-- 返回按钮 -->
    <div class="back-header">
      <button class="back-btn" @click="goBack">
        <ArrowLeft :size="20" />
        <span>返回源列表</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-section">
      <Loader2 :size="48" class="loading-spinner" />
      <p>正在加载源信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-section">
      <XCircle :size="48" class="error-icon" />
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="loadSourceDetail" class="retry-btn">重试</button>
    </div>

    <!-- 源详情内容 -->
    <div v-else-if="source" class="source-content">
      <!-- 源信息卡片 -->
      <div class="source-info-card">
        <div class="source-header">
          <div class="source-icon">
            <Package :size="32" />
          </div>
          <div class="source-main">
            <h1 class="source-name">{{ source.name }}</h1>
            <p v-if="source.description" class="source-description">{{ source.description }}</p>
            <div class="source-meta">
              <span class="meta-item">
                <span class="meta-label">地址:</span>
                <a :href="source.url" target="_blank" class="meta-value link">{{ source.url }}</a>
              </span>
              <span class="meta-item">
                <span class="meta-label">类型:</span>
                <span class="meta-value">{{ source.type === 'private' ? '私有源' : '公共源' }}</span>
              </span>
              <span v-if="source.loginInfo?.isLoggedIn" class="meta-item">
                <span class="meta-label">已登录:</span>
                <span class="meta-value">{{ source.loginInfo.username }}</span>
              </span>
            </div>
          </div>
          <div class="source-actions">
            <button class="action-btn primary" @click="switchToThisSource" :disabled="switching">
              <CheckCircle :size="18" v-if="!switching" />
              <Loader2 :size="18" class="spinning" v-else />
              <span>{{ switching ? '切换中...' : '切换到此源' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 包列表卡片 -->
      <div class="packages-card">
        <div class="packages-header">
          <h2>
            <Package :size="20" />
            <span>包列表</span>
            <span class="count" v-if="packages.total">({{ packages.total }})</span>
          </h2>
          <div class="packages-tools">
            <!-- 搜索框 -->
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索包名..."
                class="search-input"
                @input="handleSearch"
              />
              <Search :size="16" class="search-icon" />
            </div>
            <button class="refresh-btn" @click="loadPackages" :disabled="loadingPackages">
              <RefreshCw :size="18" :class="{ spinning: loadingPackages }" />
            </button>
          </div>
        </div>

        <!-- 包列表加载状态 -->
        <div v-if="loadingPackages" class="packages-loading">
          <Loader2 :size="32" class="loading-spinner" />
          <p>正在加载包列表...</p>
        </div>

        <!-- 包列表为空 -->
        <div v-else-if="packages.list.length === 0" class="empty-packages">
          <Box :size="64" class="empty-icon" />
          <h3>暂无包</h3>
          <p>{{ searchQuery ? '未找到匹配的包' : '该源中还没有发布任何包' }}</p>
        </div>

        <!-- 包列表 -->
        <div v-else class="packages-list">
          <div
            v-for="pkg in packages.list"
            :key="pkg.name"
            class="package-item"
            @click="goToPackageDetail(pkg.name)"
          >
            <div class="package-icon">
              <Box :size="24" />
            </div>
            <div class="package-info">
              <h3 class="package-name">{{ pkg.name }}</h3>
              <p class="package-description">{{ pkg.description || '暂无描述' }}</p>
              <div class="package-meta">
                <span class="meta-tag" v-if="pkg.version">
                  <Tag :size="12" />
                  {{ pkg.version }}
                </span>
                <span class="meta-tag" v-if="pkg.date">
                  <Calendar :size="12" />
                  {{ formatDate(pkg.date) }}
                </span>
                <span class="meta-tag" v-if="pkg.author">
                  <User :size="12" />
                  {{ typeof pkg.author === 'string' ? pkg.author : pkg.author.name }}
                </span>
              </div>
            </div>
            <div class="package-action">
              <ChevronRight :size="20" />
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="packages.totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="packages.page === 1"
            @click="goToPage(packages.page - 1)"
          >
            上一页
          </button>
          <span class="page-info">
            第 {{ packages.page }} / {{ packages.totalPages }} 页
          </span>
          <button
            class="page-btn"
            :disabled="packages.page === packages.totalPages"
            @click="goToPage(packages.page + 1)"
          >
            下一页
          </button>
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
  CheckCircle,
  Search,
  RefreshCw,
  Box,
  Tag,
  Calendar,
  User,
  ChevronRight
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'

const route = useRoute()
const router = useRouter()
const api = useApi()

// 状态
const loading = ref(true)
const loadingPackages = ref(false)
const switching = ref(false)
const error = ref<string | null>(null)
const source = ref<any>(null)
const searchQuery = ref('')
const packages = ref({
  list: [] as any[],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0
})

// 搜索防抖
let searchTimer: any = null

// 返回列表
const goBack = () => {
  router.push('/npm-sources')
}

// 加载源详情
const loadSourceDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const sourceId = route.params.id as string
    const response = await api.get(`/api/npm-sources/${sourceId}`)

    if (response.success) {
      source.value = response.data
      // 加载包列表
      await loadPackages()
    } else {
      error.value = response.message || '加载源信息失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载源信息失败'
  } finally {
    loading.value = false
  }
}

// 加载包列表
const loadPackages = async () => {
  if (!source.value) return

  loadingPackages.value = true

  try {
    const sourceId = route.params.id as string
    const response = await api.get(`/api/npm-sources/${sourceId}/packages`, {
      params: {
        page: packages.value.page,
        pageSize: packages.value.pageSize,
        search: searchQuery.value
      }
    })

    if (response.success) {
      packages.value = {
        list: response.data.packages || [],
        total: response.data.total || 0,
        page: response.data.page || 1,
        pageSize: response.data.pageSize || 20,
        totalPages: response.data.totalPages || 0
      }
    }
  } catch (err) {
    console.error('加载包列表失败:', err)
  } finally {
    loadingPackages.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    packages.value.page = 1 // 重置到第一页
    loadPackages()
  }, 500)
}

// 分页
const goToPage = (page: number) => {
  packages.value.page = page
  loadPackages()
}

// 切换到此源
const switchToThisSource = async () => {
  if (!source.value) return

  switching.value = true

  try {
    const sourceId = route.params.id as string
    const response = await api.post(`/api/npm-sources/${sourceId}/switch`)

    if (response.success) {
      alert('切换成功！')
    } else {
      alert(response.message || '切换失败')
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : '切换失败')
  } finally {
    switching.value = false
  }
}

// 跳转到包详情
const goToPackageDetail = (packageName: string) => {
  const sourceId = route.params.id as string
  router.push(`/npm-sources/${sourceId}/packages/${encodeURIComponent(packageName)}`)
}

// 格式化日期
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

onMounted(() => {
  loadSourceDetail()
})
</script>

<style lang="less" scoped>
.npm-source-detail {
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

.source-info-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-lg);
}

.source-header {
  display: flex;
  gap: var(--ls-spacing-lg);
  align-items: flex-start;
}

.source-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--ls-border-radius-lg);
  background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-hover) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.source-main {
  flex: 1;
}

.source-name {
  font-size: var(--ls-font-size-xl);
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-spacing-xs) 0;
}

.source-description {
  color: var(--ldesign-text-color-secondary);
  margin: 0 0 var(--ls-spacing-base) 0;
}

.source-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-base);

  .meta-item {
    display: flex;
    gap: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-sm);
  }

  .meta-label {
    color: var(--ldesign-text-color-secondary);
  }

  .meta-value {
    color: var(--ldesign-text-color-primary);
    font-weight: 500;

    &.link {
      color: var(--ldesign-brand-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.source-actions {
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

      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .spinning {
      animation: spin 1s linear infinite;
    }
  }
}

.packages-card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-spacing-lg);
}

.packages-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-spacing-lg);

  h2 {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
    margin: 0;

    svg {
      color: var(--ldesign-brand-color);
    }

    .count {
      color: var(--ldesign-text-color-secondary);
      font-weight: normal;
      font-size: var(--ls-font-size-base);
    }
  }

  .packages-tools {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

.search-box {
  position: relative;

  .search-input {
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    padding-left: 36px;
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    width: 240px;

    &:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
    }
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ldesign-text-color-secondary);
    pointer-events: none;
  }
}

.refresh-btn {
  padding: var(--ls-spacing-sm);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-brand-color);
    color: var(--ldesign-brand-color);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.packages-loading,
.empty-packages {
  text-align: center;
  padding: var(--ls-spacing-xxl);
  color: var(--ldesign-text-color-secondary);

  .loading-spinner,
  .empty-icon {
    margin-bottom: var(--ls-spacing-base);
  }

  h3 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0;
  }
}

.packages-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.package-item {
  display: flex;
  gap: var(--ls-spacing-base);
  padding: var(--ls-spacing-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-brand-color);
    transform: translateX(4px);
  }
}

.package-icon {
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

.package-info {
  flex: 1;
}

.package-name {
  font-size: var(--ls-font-size-base);
  font-weight: 600;
  color: var(--ldesign-text-color-primary);
  margin: 0 0 var(--ls-spacing-xs) 0;
  font-family: 'Consolas', 'Monaco', monospace;
}

.package-description {
  font-size: var(--ls-font-size-sm);
  color: var(--ldesign-text-color-secondary);
  margin: 0 0 var(--ls-spacing-xs) 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.package-meta {
  display: flex;
  gap: var(--ls-spacing-sm);
  flex-wrap: wrap;

  .meta-tag {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    background: var(--ldesign-gray-color-1);
    border-radius: var(--ls-border-radius-sm);
    font-size: 11px;
    color: var(--ldesign-text-color-secondary);
  }
}

.package-action {
  display: flex;
  align-items: center;
  color: var(--ldesign-text-color-secondary);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--ls-spacing-base);
  margin-top: var(--ls-spacing-lg);
  padding-top: var(--ls-spacing-lg);
  border-top: 1px solid var(--ldesign-border-color);

  .page-btn {
    padding: var(--ls-spacing-sm) var(--ls-spacing-base);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    background: var(--ldesign-bg-color-component);
    color: var(--ldesign-text-color-primary);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color);
      color: white;
      border-color: var(--ldesign-brand-color);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  .page-info {
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
  }
}
</style>
