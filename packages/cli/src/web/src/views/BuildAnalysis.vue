<template>
  <div class="build-analysis-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <Loader2 :size="48" class="loading-icon" />
      <p>正在分析产物...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <XCircle :size="48" class="error-icon" />
      <h2>分析失败</h2>
      <p>{{ error }}</p>
      <button @click="loadAnalysis" class="btn-retry">
        <RefreshCw :size="18" />
        <span>重试</span>
      </button>
    </div>

    <!-- 产物不存在 -->
    <div v-else-if="analysis && !analysis.distExists" class="empty-container">
      <PackageX :size="48" class="empty-icon" />
      <h2>产物不存在</h2>
      <p>未找到打包产物，请先执行打包操作</p>
      <p class="hint">预期目录: {{ analysis.distPath }}</p>
    </div>

    <!-- 分析结果 -->
    <div v-else-if="analysis" class="analysis-content">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <button @click="closeWindow" class="btn-back" title="返回">
            <ArrowLeft :size="20" />
          </button>
          <div class="project-icon">
            <Package :size="32" />
          </div>
          <div class="project-info">
            <h1>{{ analysis.projectName }}</h1>
            <div class="meta">
              <span class="version">v{{ analysis.version }}</span>
              <span class="separator">•</span>
              <span class="build-time">{{ formatTime(analysis.buildTime) }}</span>
            </div>
          </div>
        </div>
        <div class="header-actions">
          <button @click="downloadReport" class="btn-download">
            <Download :size="18" />
            <span>导出报告</span>
          </button>
          <button @click="loadAnalysis" class="btn-refresh">
            <RefreshCw :size="18" />
            <span>刷新</span>
          </button>
          <button @click="closeWindow" class="btn-close">
            <X :size="18" />
            <span>关闭</span>
          </button>
        </div>
      </div>

      <!-- 统计概览 -->
      <div class="stats-overview">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon files">
            <FileText :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">文件总数</div>
            <div class="stat-value">{{ analysis.totalFiles }}</div>
            <div class="stat-trend positive">
              <TrendingUp :size="14" />
              <span>较上次 +12</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-card-success">
          <div class="stat-icon size">
            <HardDrive :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">总大小</div>
            <div class="stat-value">{{ formatSize(analysis.totalSize) }}</div>
            <div class="stat-trend positive">
              <TrendingUp :size="14" />
              <span>+5.2%</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-card-warning">
          <div class="stat-icon folders">
            <Folder :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">目录数</div>
            <div class="stat-value">{{ analysis.totalDirectories }}</div>
            <div class="stat-info">
              <Clock :size="14" />
              <span>{{ formatTime(analysis.buildTime).split(' ')[1] }}</span>
            </div>
          </div>
        </div>

        <div class="stat-card stat-card-info">
          <div class="stat-icon types">
            <FileType :size="24" />
          </div>
          <div class="stat-content">
            <div class="stat-label">文件类型</div>
            <div class="stat-value">{{ analysis.fileTypes.length }}</div>
            <div class="stat-info">
              <span>主要类型: {{ analysis.fileTypes[0]?.type || '-' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content">
        <!-- 左侧列 -->
        <div class="left-column">
          <!-- 产物目录 -->
          <div v-if="analysis.distDirectories && analysis.distDirectories.length > 1" class="card dist-dirs-card">
            <div class="card-header">
              <Folder :size="20" />
              <h3>产物目录 ({{ analysis.distDirectories.length }})</h3>
            </div>
            <div class="card-body">
              <div class="dist-dirs-list">
                <div
                  v-for="(distDir, index) in analysis.distDirectories"
                  :key="distDir.name"
                  class="dist-dir-item"
                  :class="{ 'not-exists': !distDir.exists }"
                >
                  <div class="dist-dir-header">
                    <div class="dist-dir-info">
                      <div
                        class="dir-color"
                        :style="{ background: getTypeColor(index) }"
                      ></div>
                      <Folder :size="16" class="dir-icon" />
                      <span class="dir-name">{{ distDir.name }}</span>
                      <span v-if="!distDir.exists" class="dir-status">（不存在）</span>
                    </div>
                    <div v-if="distDir.exists" class="dist-dir-stats">
                      <span class="stat-item">
                        <FileText :size="14" />
                        {{ distDir.totalFiles }} 文件
                      </span>
                      <span class="stat-separator">•</span>
                      <span class="stat-item">
                        <HardDrive :size="14" />
                        {{ formatSize(distDir.totalSize) }}
                      </span>
                    </div>
                  </div>
                  <div v-if="distDir.exists" class="dist-dir-details">
                    <div class="detail-item">
                      <span class="detail-label">目录数：</span>
                      <span class="detail-value">{{ distDir.totalDirectories }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">主要类型：</span>
                      <span class="detail-value">{{ getMainFileType(distDir) }}</span>
                    </div>
                  </div>
                  <div v-if="distDir.exists" class="size-bar">
                    <div
                      class="size-bar-fill"
                      :style="{
                        width: getSizePercentage(distDir) + '%',
                        background: getTypeColor(index)
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 文件类型分布 -->
          <div class="card file-type-card">
            <div class="card-header">
              <PieChartIcon :size="20" />
              <h3>文件类型分布</h3>
            </div>
            <div class="card-body">
              <div class="file-type-content">
                <!-- 饼图 -->
                <div class="chart-section">
                  <PieChart
                    :data="pieChartData"
                    :size="280"
                    :inner-radius="70"
                    :total-label="formatSize(analysis.totalSize)"
                  />
                </div>
                
                <!-- 类型列表 -->
                <div class="types-list-section">
                  <div class="file-types-list">
                    <div
                      v-for="(fileType, index) in analysis.fileTypes"
                      :key="fileType.type"
                      class="file-type-item"
                    >
                      <div class="file-type-header">
                        <div class="file-type-info">
                          <div
                            class="type-color"
                            :style="{ background: getTypeColor(index) }"
                          ></div>
                          <span class="type-name">.{{ fileType.type }}</span>
                          <span class="type-count">({{ fileType.count }})</span>
                        </div>
                        <div class="file-type-size">
                          <span class="size-value">{{ formatSize(fileType.size) }}</span>
                          <span class="size-percentage">{{ fileType.percentage.toFixed(1) }}%</span>
                        </div>
                      </div>
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: fileType.percentage + '%',
                            background: getTypeColor(index)
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 最大文件 -->
          <div class="card">
            <div class="card-header">
              <TrendingUp :size="20" />
              <h3>最大文件 Top 10</h3>
            </div>
            <div class="card-body">
              <BarChart :data="largestFilesData" color-scheme="gradient" />
            </div>
          </div>

          <!-- 依赖分析 -->
          <div v-if="analysis.dependencies" class="card">
            <div class="card-header">
              <GitBranch :size="20" />
              <h3>依赖分析</h3>
            </div>
            <div class="card-body">
              <div class="dependencies-summary">
                <div class="dep-stat">
                  <div class="dep-icon prod">
                    <Package :size="20" />
                  </div>
                  <div class="dep-info">
                    <div class="dep-count">{{ analysis.dependencies.production.length }}</div>
                    <div class="dep-label">生产依赖</div>
                  </div>
                </div>
                <div class="dep-stat">
                  <div class="dep-icon dev">
                    <Wrench :size="20" />
                  </div>
                  <div class="dep-info">
                    <div class="dep-count">{{ analysis.dependencies.development.length }}</div>
                    <div class="dep-label">开发依赖</div>
                  </div>
                </div>
                <div class="dep-stat">
                  <div class="dep-icon total">
                    <Layers :size="20" />
                  </div>
                  <div class="dep-info">
                    <div class="dep-count">{{ analysis.dependencies.total }}</div>
                    <div class="dep-label">总依赖</div>
                  </div>
                </div>
              </div>
              
              <div v-if="analysis.dependencies.production.length > 0" class="dep-list">
                <h4>生产依赖</h4>
                <div class="dep-items">
                  <span
                    v-for="dep in analysis.dependencies.production.slice(0, 10)"
                    :key="dep"
                    class="dep-tag"
                  >
                    {{ dep }}
                  </span>
                  <span v-if="analysis.dependencies.production.length > 10" class="dep-tag more">
                    +{{ analysis.dependencies.production.length - 10 }} 更多
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧列 -->
        <div class="right-column">
          <!-- 文件树 -->
          <div class="card file-tree-card">
            <div class="card-header">
              <FolderTree :size="20" />
              <h3>文件结构</h3>
              <div class="tree-actions">
                <button @click="expandAll" class="tree-btn" title="展开全部">
                  <ChevronsDown :size="16" />
                </button>
                <button @click="collapseAll" class="tree-btn" title="收起全部">
                  <ChevronsUp :size="16" />
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="file-tree">
                <FileTreeNode
                  v-for="node in analysis.fileTree"
                  :key="node.path"
                  :node="node"
                  :level="0"
                  :expanded-keys="expandedKeys"
                  @toggle="toggleNode"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Package, FileText, HardDrive, Folder, FileType, PieChart as PieChartIcon, TrendingUp,
  GitBranch, FolderTree, Download, RefreshCw, X, Loader2, XCircle,
  PackageX, Wrench, Layers, ChevronsDown, ChevronsUp, AlertTriangle, Clock, ArrowLeft
} from 'lucide-vue-next'
import { useApi } from '../composables/useApi'
import FileTreeNode from '../components/FileTreeNode.vue'
import PieChart from '../components/PieChart.vue'
import BarChart from '../components/BarChart.vue'

const route = useRoute()
const router = useRouter()
const api = useApi()

// 响应式数据
const loading = ref(true)
const error = ref<string | null>(null)
const analysis = ref<any>(null)
const expandedKeys = ref<Set<string>>(new Set())

// 类型颜色
const typeColors = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#E91E63'
]

// 获取类型颜色
const getTypeColor = (index: number) => {
  return typeColors[index % typeColors.length]
}

// 饼图数据
const pieChartData = computed(() => {
  if (!analysis.value?.fileTypes) return []
  
  return analysis.value.fileTypes.map((fileType: any, index: number) => ({
    name: `.${fileType.type}`,
    value: fileType.size,
    displayValue: formatSize(fileType.size),
    count: fileType.count,
    color: getTypeColor(index),
    percentage: fileType.percentage
  }))
})

// 条形图数据（最大文件）
const largestFilesData = computed(() => {
  if (!analysis.value?.largestFiles) return []
  
  return analysis.value.largestFiles.map((file: any) => ({
    label: file.path,
    value: file.size,
    displayValue: formatSize(file.size),
    percentage: file.percentage
  }))
})

// 格式化文件大小
const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

// 格式化时间
const formatTime = (time?: string): string => {
  if (!time) return '未知'
  
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取产物目录的主要文件类型
const getMainFileType = (distDir: any): string => {
  if (!distDir.fileTypes || distDir.fileTypes.length === 0) return '-'
  return `.${distDir.fileTypes[0].type}`
}

// 计算产物目录的大小百分比
const getSizePercentage = (distDir: any): number => {
  if (!analysis.value || !distDir.totalSize || !analysis.value.totalSize) return 0
  return (distDir.totalSize / analysis.value.totalSize) * 100
}

// 加载分析数据
const loadAnalysis = async () => {
  loading.value = true
  error.value = null
  
  try {
    const projectId = route.params.id as string
    const response = await api.get(`/api/projects/${projectId}/build-analysis`)
    
    if (response.success) {
      analysis.value = response.data
      // 默认展开第一层
      if (analysis.value.fileTree && analysis.value.fileTree.length > 0) {
        expandedKeys.value.add(analysis.value.fileTree[0].path)
      }
    } else {
      error.value = response.message || '加载分析数据失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载分析数据失败'
  } finally {
    loading.value = false
  }
}

// 切换节点展开/收起
const toggleNode = (path: string) => {
  if (expandedKeys.value.has(path)) {
    expandedKeys.value.delete(path)
  } else {
    expandedKeys.value.add(path)
  }
}

// 展开全部
const expandAll = () => {
  const allKeys = new Set<string>()
  const collectKeys = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node.type === 'directory') {
        allKeys.add(node.path)
        if (node.children) {
          collectKeys(node.children)
        }
      }
    })
  }
  if (analysis.value?.fileTree) {
    collectKeys(analysis.value.fileTree)
  }
  expandedKeys.value = allKeys
}

// 收起全部
const collapseAll = () => {
  expandedKeys.value.clear()
}

// 下载报告
const downloadReport = () => {
  if (!analysis.value) return
  
  const reportData = {
    ...analysis.value,
    generatedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(reportData, null, 2)], {
    type: 'application/json'
  })
  
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `build-analysis-${analysis.value.projectName}-${analysis.value.version}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 返回打包页面
const closeWindow = () => {
  const projectId = route.params.id as string
  router.push(`/projects/${projectId}/build`)
}

// 生命周期
onMounted(() => {
  loadAnalysis()
})
</script>

<style lang="less" scoped>
.build-analysis-page {
  min-height: 100vh;
  background: var(--ldesign-bg-color);
  padding: var(--ls-spacing-xl);
}

// 加载/错误/空状态
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: var(--ls-spacing-lg);

  svg {
    color: var(--ldesign-text-color-placeholder);
  }

  h2 {
    font-size: var(--ls-font-size-xl);
    color: var(--ldesign-text-color-primary);
    margin: 0;
  }

  p {
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-secondary);
    margin: 0;
  }

  .hint {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-tertiary);
  }
}

.loading-icon {
  animation: spin 1s linear infinite;
}

.error-icon {
  color: var(--ldesign-error-color) !important;
}

.empty-icon {
  color: var(--ldesign-warning-color) !important;
}

.btn-retry {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  background: var(--ldesign-brand-color);
  color: white;
  border: none;
  border-radius: var(--ls-radius-md);
  cursor: pointer;
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: var(--ldesign-brand-color-hover);
    transform: translateY(-1px);
    box-shadow: var(--ldesign-shadow-2);
  }
}

// 页面头部
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ls-spacing-xl);
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-radius-lg);
  box-shadow: var(--ldesign-shadow-1);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-base);

    .btn-back {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-radius-md);
      background: var(--ldesign-bg-color);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: var(--ldesign-brand-color);
        color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-light);
        transform: translateX(-2px);
      }
    }

    .project-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, var(--ldesign-brand-color-focus), var(--ldesign-brand-color-hover));
      border-radius: var(--ls-radius-lg);
      color: var(--ldesign-brand-color);
    }

    .project-info {
      h1 {
        margin: 0 0 4px 0;
        font-size: var(--ls-font-size-h3);
        color: var(--ldesign-text-color-primary);
        font-weight: 600;
      }

      .meta {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-xs);
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);

        .version {
          color: var(--ldesign-brand-color);
          font-weight: 600;
          font-family: 'Consolas', 'Monaco', monospace;
        }

        .separator {
          color: var(--ldesign-border-color);
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);

    button {
      display: inline-flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      padding: var(--ls-spacing-sm) var(--ls-spacing-base);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-radius-md);
      background: var(--ldesign-bg-color);
      color: var(--ldesign-text-color-primary);
      cursor: pointer;
      font-size: var(--ls-font-size-sm);
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        border-color: var(--ldesign-brand-color);
        color: var(--ldesign-brand-color);
        transform: translateY(-1px);
      }
    }

    .btn-download {
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      color: #1565c0;
      border-color: #90caf9;

      &:hover {
        background: linear-gradient(135deg, #bbdefb, #90caf9);
        color: #0d47a1;
      }
    }
  }
}

// 统计概览
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-spacing-xl);

  .stat-card {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: var(--ls-spacing-base);
    padding: var(--ls-spacing-lg);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-radius-lg);
    box-shadow: var(--ldesign-shadow-1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--stat-color), transparent);
      opacity: 0;
      transition: opacity 0.3s;
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--ldesign-shadow-3);
      border-color: var(--stat-color);

      &::before {
        opacity: 1;
      }

      .stat-icon {
        transform: scale(1.05);
      }
    }

    &.stat-card-primary {
      --stat-color: #2196F3;
    }

    &.stat-card-success {
      --stat-color: #4CAF50;
    }

    &.stat-card-warning {
      --stat-color: #FF9800;
    }

    &.stat-card-info {
      --stat-color: #9C27B0;
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: var(--ls-radius-lg);
      flex-shrink: 0;
      transition: transform 0.3s;

      &.files {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        color: #1565c0;
        box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
      }

      &.size {
        background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
        color: #2e7d32;
        box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
      }

      &.folders {
        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        color: #ef6c00;
        box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
      }

      &.types {
        background: linear-gradient(135deg, #f3e5f5, #e1bee7);
        color: #7b1fa2;
        box-shadow: 0 4px 12px rgba(156, 39, 176, 0.2);
      }
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;

      .stat-label {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-tertiary);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: var(--ls-font-size-h2);
        font-weight: 700;
        color: var(--ldesign-text-color-primary);
        line-height: 1.2;
        margin-bottom: 4px;
        font-family: 'Consolas', 'Monaco', monospace;
      }

      .stat-trend,
      .stat-info {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-tertiary);

        svg {
          flex-shrink: 0;
        }

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .stat-trend.positive {
        color: #4caf50;

        svg {
          color: #4caf50;
        }
      }

      .stat-trend.negative {
        color: #f44336;

        svg {
          color: #f44336;
          transform: rotate(180deg);
        }
      }
    }
  }
}

// 主要内容区域
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ls-spacing-xl);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

// 卡片样式
.card {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-radius-lg);
  box-shadow: var(--ldesign-shadow-1);
  overflow: hidden;

  .card-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-spacing-base) var(--ls-spacing-lg);
    border-bottom: 1px solid var(--ldesign-border-color);
    background: var(--ldesign-bg-color-component);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      flex: 1;
      margin: 0;
      font-size: var(--ls-font-size-base);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }

    .tree-actions {
      display: flex;
      gap: var(--ls-spacing-xs);

      .tree-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-radius-sm);
        background: var(--ldesign-bg-color);
        color: var(--ldesign-text-color-secondary);
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: var(--ldesign-brand-color);
          color: var(--ldesign-brand-color);
        }
      }
    }
  }

  .card-body {
    padding: var(--ls-spacing-lg);
  }
}

// 文件类型卡片布局
.file-type-card {
  .file-type-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: var(--ls-spacing-xl);
    align-items: start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .chart-section {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--ls-spacing-base) 0;
    }

    .types-list-section {
      flex: 1;
      min-width: 0;
    }
  }
}

// 文件类型列表
.file-types-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);

  .file-type-item {
    .file-type-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--ls-spacing-xs);

      .file-type-info {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-xs);

        .type-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .type-name {
          font-family: 'Consolas', 'Monaco', monospace;
          font-weight: 600;
          color: var(--ldesign-text-color-primary);
        }

        .type-count {
          color: var(--ldesign-text-color-tertiary);
          font-size: var(--ls-font-size-sm);
        }
      }

      .file-type-size {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-sm);

        .size-value {
          font-weight: 600;
          color: var(--ldesign-text-color-primary);
        }

        .size-percentage {
          color: var(--ldesign-brand-color);
          font-weight: 500;
        }
      }
    }

    .progress-bar {
      height: 6px;
      background: var(--ldesign-bg-color-component);
      border-radius: 3px;
      overflow: hidden;

      .progress-fill {
        height: 100%;
        transition: width 0.3s ease;
      }
    }
  }
}

// 最大文件列表
.largest-files-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);

  .large-file-item {
    display: flex;
    gap: var(--ls-spacing-sm);

    .file-rank {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: var(--ldesign-brand-color-light);
      color: var(--ldesign-brand-color);
      border-radius: 50%;
      font-size: var(--ls-font-size-xs);
      font-weight: 700;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      min-width: 0;

      .file-path {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: var(--ls-spacing-xs);
      }

      .file-size-bar {
        .size-text {
          display: flex;
          justify-content: space-between;
          font-size: var(--ls-font-size-xs);
          margin-bottom: 4px;

          .size {
            font-weight: 600;
            color: var(--ldesign-text-color-secondary);
          }

          .percentage {
            color: var(--ldesign-brand-color);
            font-weight: 500;
          }
        }

        .progress-bar {
          height: 4px;
          background: var(--ldesign-bg-color-component);
          border-radius: 2px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: var(--ldesign-brand-color);
            transition: width 0.3s ease;
          }
        }
      }
    }
  }
}

// 产物目录
.dist-dirs-card {
  margin-bottom: var(--ls-spacing-lg);

  .dist-dirs-list {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-base);
  }

  .dist-dir-item {
    padding: var(--ls-spacing-base);
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-radius-md);
    transition: all 0.2s;

    &.not-exists {
      opacity: 0.5;
      background: var(--ldesign-bg-color);
    }

    &:hover:not(.not-exists) {
      transform: translateX(4px);
      border-color: var(--ldesign-brand-color);
      box-shadow: var(--ldesign-shadow-1);
    }
  }

  .dist-dir-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ls-spacing-xs);

    .dist-dir-info {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);

      .dir-color {
        width: 4px;
        height: 20px;
        border-radius: 2px;
      }

      .dir-icon {
        color: var(--ldesign-brand-color);
      }

      .dir-name {
        font-weight: 600;
        font-size: var(--ls-font-size-base);
        font-family: 'Consolas', 'Monaco', monospace;
        color: var(--ldesign-text-color-primary);
      }

      .dir-status {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-tertiary);
      }
    }

    .dist-dir-stats {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .stat-separator {
        color: var(--ldesign-border-color);
      }
    }
  }

  .dist-dir-details {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--ls-spacing-xs);
    margin-bottom: var(--ls-spacing-xs);
    font-size: var(--ls-font-size-sm);

    .detail-item {
      display: flex;
      gap: 4px;

      .detail-label {
        color: var(--ldesign-text-color-tertiary);
      }

      .detail-value {
        color: var(--ldesign-text-color-primary);
        font-weight: 500;
      }
    }
  }

  .size-bar {
    height: 4px;
    background: var(--ldesign-bg-color);
    border-radius: 2px;
    overflow: hidden;

    .size-bar-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 2px;
    }
  }
}

// 依赖分析
.dependencies-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);

  .dep-stat {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-spacing-base);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-radius-md);

    .dep-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--ls-radius-sm);

      &.prod {
        background: linear-gradient(135deg, #e3f2fd, #bbdefb);
        color: #1565c0;
      }

      &.dev {
        background: linear-gradient(135deg, #fff3e0, #ffe0b2);
        color: #ef6c00;
      }

      &.total {
        background: linear-gradient(135deg, #f3e5f5, #e1bee7);
        color: #7b1fa2;
      }
    }

    .dep-info {
      flex: 1;

      .dep-count {
        font-size: var(--ls-font-size-lg);
        font-weight: 700;
        color: var(--ldesign-text-color-primary);
        line-height: 1.2;
      }

      .dep-label {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-secondary);
      }
    }
  }
}

.dep-list {
  h4 {
    margin: 0 0 var(--ls-spacing-sm) 0;
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
  }

  .dep-items {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ls-spacing-xs);

    .dep-tag {
      padding: 4px 8px;
      background: var(--ldesign-bg-color-component);
      border: 1px solid var(--ldesign-border-color);
      border-radius: var(--ls-radius-sm);
      font-size: var(--ls-font-size-xs);
      font-family: 'Consolas', 'Monaco', monospace;
      color: var(--ldesign-text-color-secondary);

      &.more {
        background: var(--ldesign-brand-color-light);
        color: var(--ldesign-brand-color);
        border-color: var(--ldesign-brand-color);
        font-weight: 500;
      }
    }
  }
}

// 文件树
.file-tree-card {
  height: fit-content;
  max-height: calc(100vh - 300px);

  .card-body {
    max-height: calc(100vh - 400px);
    overflow-y: auto;
    padding: 0;
  }
}

.file-tree {
  padding: var(--ls-spacing-sm);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>