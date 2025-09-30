# Node 版本搜索和列表功能实现

## 功能需求

在"安装自定义版本"区域添加：
1. **搜索框** - 搜索可用的 Node 版本
2. **筛选按钮** - LTS 版本 / 全部版本
3. **版本列表** - 显示可安装的版本（带安装按钮）
4. **分页** - 支持分页显示（版本太多时）

## 后端 API

### 新增接口：GET `/api/fnm/available-versions`

**功能**: 获取所有可安装的 Node.js 版本

**请求参数**:
```typescript
{
  filter?: string  // 版本过滤，如 "18" 或 "20.11"
  lts?: boolean    // 只显示 LTS 版本
}
```

**响应**:
```json
{
  "success": true,
  "data": [
    { "version": "21.6.1", "lts": null },
    { "version": "20.11.0", "lts": "Iron" },
    { "version": "18.19.0", "lts": "Hydrogen" }
  ]
}
```

## 前端实现

### 1. 新增数据状态

```typescript
// 可用版本相关
const availableVersions = ref<Array<{ version: string; lts: string | null }>>([])
const loadingAvailable = ref(false)
const searchQuery = ref('')
const showOnlyLTS = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
```

### 2. 新增方法

```typescript
// 获取可用版本列表
const fetchAvailableVersions = async () => {
  loadingAvailable.value = true
  try {
    const params: any = {}
    if (searchQuery.value) {
      params.filter = searchQuery.value
    }
    if (showOnlyLTS.value) {
      params.lts = 'true'
    }
    
    const response = await api.get('/api/fnm/available-versions', { 
      params 
    })
    
    if (response.success) {
      availableVersions.value = response.data
    }
  } catch (err) {
    console.error('获取可用版本失败:', err)
  } finally {
    loadingAvailable.value = false
  }
}

// 计算分页后的版本列表
const paginatedVersions = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return availableVersions.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(availableVersions.value.length / pageSize.value)
})
```

### 3. UI 模板

```vue
<!-- 安装自定义版本 - 改进版 -->
<div class="install-version-card">
  <h2>
    <CircleIcon :size="20" />
    <span>安装自定义版本</span>
  </h2>
  
  <!-- 搜索栏 -->
  <div class="search-bar">
    <div class="search-input-group">
      <Search :size="18" />
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索版本号，如: 18, 20.11, lts..." 
        class="version-search-input"
        @input="debouncedSearch"
      />
      <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
        <X :size="14" />
      </button>
    </div>
    
    <!-- 筛选按钮 -->
    <div class="filter-buttons">
      <button 
        :class="['filter-btn', { active: !showOnlyLTS }]"
        @click="toggleFilter(false)"
      >
        全部版本
      </button>
      <button 
        :class="['filter-btn', { active: showOnlyLTS }]"
        @click="toggleFilter(true)"
      >
        <Star :size="14" />
        仅 LTS
      </button>
    </div>
  </div>
  
  <!-- 版本列表 -->
  <div class="available-versions-list">
    <!-- 加载状态 -->
    <div v-if="loadingAvailable" class="loading-state">
      <Loader2 :size="24" class="spinner" />
      <span>加载中...</span>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="availableVersions.length === 0" class="empty-state">
      <p>未找到匹配的版本</p>
    </div>
    
    <!-- 版本列表 -->
    <div v-else class="versions-table">
      <div class="table-header">
        <div class="col-version">版本</div>
        <div class="col-lts">类型</div>
        <div class="col-status">状态</div>
        <div class="col-action">操作</div>
      </div>
      
      <div class="table-body">
        <div 
          v-for="item in paginatedVersions" 
          :key="item.version" 
          class="table-row"
          :class="{ 
            installed: isVersionInstalled(item.version),
            current: item.version === nodeVersions.current 
          }"
        >
          <!-- 版本号 -->
          <div class="col-version">
            <code>{{ item.version }}</code>
          </div>
          
          <!-- LTS 标记 -->
          <div class="col-lts">
            <span v-if="item.lts" class="lts-badge">
              <Star :size="12" />
              LTS ({{ item.lts }})
            </span>
            <span v-else class="current-badge">Current</span>
          </div>
          
          <!-- 安装状态 -->
          <div class="col-status">
            <span v-if="item.version === nodeVersions.current" class="status-current">
              <CheckCircle :size="14" />
              当前版本
            </span>
            <span v-else-if="isVersionInstalled(item.version)" class="status-installed">
              <Check :size="14" />
              已安装
            </span>
            <span v-else class="status-available">
              未安装
            </span>
          </div>
          
          <!-- 操作按钮 -->
          <div class="col-action">
            <template v-if="isVersionInstalling(item.version)">
              <button class="action-btn installing" disabled>
                <Loader2 :size="14" class="spinner" />
                安装中 {{ getVersionProgress(item.version)?.progress }}%
              </button>
            </template>
            <template v-else-if="item.version === nodeVersions.current">
              <span class="current-label">使用中</span>
            </template>
            <template v-else-if="isVersionInstalled(item.version)">
              <button 
                class="action-btn switch" 
                @click="switchVersion(item.version)"
                :disabled="switching"
              >
                <RefreshCw :size="14" />
                切换
              </button>
            </template>
            <template v-else>
              <button 
                class="action-btn install" 
                @click="installVersion(item.version)"
                :disabled="installing"
              >
                <Download :size="14" />
                安装
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <ChevronLeft :size="16" />
        上一页
      </button>
      
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 页
        （共 {{ availableVersions.length }} 个版本）
      </span>
      
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
        <ChevronRight :size="16" />
      </button>
    </div>
  </div>
  
  <!-- 提示 -->
  <div class="install-tips">
    <p>💡 提示：</p>
    <ul>
      <li>LTS 版本适合生产环境，更稳定</li>
      <li>Current 版本包含最新特性</li>
      <li>可以搜索主版本号（如 18）或精确版本（如 20.11.0）</li>
    </ul>
  </div>
</div>
```

### 4. 样式

```less
// 搜索栏
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: center;
  
  .search-input-group {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    
    svg {
      position: absolute;
      left: 12px;
      color: var(--text-muted);
    }
    
    .version-search-input {
      width: 100%;
      padding: 10px 40px 10px 40px;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      font-size: 14px;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
    }
    
    .clear-btn {
      position: absolute;
      right: 8px;
      padding: 4px;
      border: none;
      background: none;
      cursor: pointer;
      color: var(--text-muted);
      
      &:hover {
        color: var(--text-primary);
      }
    }
  }
  
  .filter-buttons {
    display: flex;
    gap: 8px;
    
    .filter-btn {
      padding: 8px 16px;
      border: 1px solid var(--border-color);
      background: white;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
      
      &:hover {
        border-color: var(--primary-color);
      }
      
      &.active {
        background: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
    }
  }
}

// 版本表格
.versions-table {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  
  .table-header {
    display: grid;
    grid-template-columns: 1fr 180px 150px 120px;
    gap: 12px;
    padding: 12px 16px;
    background: var(--background-secondary);
    font-weight: 600;
    font-size: 13px;
    color: var(--text-secondary);
  }
  
  .table-body {
    max-height: 500px;
    overflow-y: auto;
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 1fr 180px 150px 120px;
    gap: 12px;
    padding: 12px 16px;
    border-top: 1px solid var(--border-color);
    transition: background 0.2s;
    
    &:hover {
      background: var(--background-hover);
    }
    
    &.current {
      background: rgba(34, 197, 94, 0.05);
    }
    
    &.installed {
      background: rgba(59, 130, 246, 0.03);
    }
  }
  
  .col-version {
    display: flex;
    align-items: center;
    
    code {
      background: var(--background-code);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
  
  .col-lts, .col-status, .col-action {
    display: flex;
    align-items: center;
  }
  
  .lts-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: #fef3c7;
    color: #92400e;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }
  
  .current-badge {
    padding: 4px 10px;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 12px;
    font-size: 12px;
  }
  
  .status-current {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #16a34a;
    font-weight: 500;
    font-size: 13px;
  }
  
  .status-installed {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #3b82f6;
    font-size: 13px;
  }
  
  .status-available {
    color: var(--text-muted);
    font-size: 13px;
  }
  
  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
    
    &.install {
      background: var(--primary-color);
      color: white;
      
      &:hover:not(:disabled) {
        background: var(--primary-hover);
      }
    }
    
    &.switch {
      background: #f3f4f6;
      color: #374151;
      
      &:hover:not(:disabled) {
        background: #e5e7eb;
      }
    }
    
    &.installing {
      background: #fef3c7;
      color: #92400e;
      cursor: not-allowed;
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
  
  .current-label {
    color: #16a34a;
    font-weight: 500;
    font-size: 13px;
  }
}

// 分页
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--background-secondary);
  border-radius: 6px;
  
  .page-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border: 1px solid var(--border-color);
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    
    &:hover:not(:disabled) {
      background: var(--background-hover);
    }
    
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  
  .page-info {
    font-size: 13px;
    color: var(--text-secondary);
  }
}
```

## 实现步骤

1. ✅ 添加后端 API (`/api/fnm/available-versions`)
2. ⏳ 在前端添加新的数据状态
3. ⏳ 实现搜索和筛选逻辑
4. ⏳ 更新 UI 模板
5. ⏳ 添加样式

## 注意事项

1. **性能优化**
   - 使用防抖处理搜索输入
   - 版本列表分页显示
   - 避免频繁请求 API

2. **用户体验**
   - 显示加载状态
   - 空状态提示
   - 已安装版本标记
   - 当前版本高亮

3. **错误处理**
   - API 请求失败提示
   - 版本解析错误处理

---

**创建日期**: 2025-09-30  
**状态**: 设计完成，待实现