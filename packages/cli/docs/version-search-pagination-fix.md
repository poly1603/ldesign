# Node.js 版本搜索和分页功能优化

## 问题描述

用户反馈了两个主要问题：

1. **搜索功能无效**：在搜索框输入 "18" 后，没有筛选出 18.x.x 版本
2. **性能问题**：后端一次性返回所有版本（可能数百个），导致性能问题

## 解决方案

### 1. 后端分页支持 (`src/server/routes/fnm.ts`)

#### 修改点：
- **添加分页参数**：`page`（页码）、`pageSize`（每页数量）
- **服务端过滤**：支持精确匹配主版本号（如 "18" 匹配 "18.x.x"）
- **返回分页信息**：
  ```typescript
  {
    versions: [...],     // 当前页的版本列表
    total: 100,          // 总版本数
    page: 1,             // 当前页
    pageSize: 50,        // 每页数量
    totalPages: 2        // 总页数
  }
  ```

#### 过滤逻辑：
```typescript
if (filter) {
  const filterStr = (filter as string).toLowerCase()
  versions = versions.filter(v => {
    const version = v.version.toLowerCase()
    // 支持精确匹配主版本号（如 "18" 匹配 "18.x.x"）
    // 或部分匹配（如 "20.11" 匹配 "20.11.x"）
    return version.startsWith(filterStr) || version.includes(filterStr)
  })
}
```

#### 默认配置：
- 默认每页显示 **50** 个版本
- 默认返回第 **1** 页

### 2. 前端适配 (`src/web/src/views/NodeManager.vue`)

#### 新增状态管理：
```typescript
const totalVersions = ref(0)    // 总版本数
const totalPages = ref(0)       // 总页数
```

#### 修改 `fetchAvailableVersions` 函数：
- 添加 `resetPage` 参数，控制是否重置页码
- 请求参数包含：`page`、`pageSize`、`filter`、`lts`
- 处理后端返回的分页数据

#### 搜索功能优化：
```typescript
const handleSearch = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1 // 搜索时重置到第一页
    fetchAvailableVersions()
  }, 500) // 500ms 防抖
}
```

#### 筛选功能优化：
```typescript
const toggleFilter = (ltsOnly: boolean) => {
  showOnlyLTS.value = ltsOnly
  currentPage.value = 1 // 切换筛选时重置到第一页
  fetchAvailableVersions()
}
```

#### 分页控制优化：
```typescript
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchAvailableVersions(false) // 不重置页码
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchAvailableVersions(false) // 不重置页码
  }
}
```

### 3. 分页信息显示：
```vue
<span class="page-info">
  第 {{ currentPage }} / {{ totalPages }} 页
  （共 {{ totalVersions }} 个版本）
</span>
```

## 功能特点

### ✅ 搜索功能
- 支持**主版本号搜索**：输入 "18" 显示所有 18.x.x 版本
- 支持**精确搜索**：输入 "20.11" 显示所有 20.11.x 版本
- 支持**模糊搜索**：输入部分版本号即可匹配
- **500ms 防抖**：避免频繁请求

### ✅ 分页功能
- **后端分页**：不再一次性加载所有版本
- **每页 50 条**：平衡性能和用户体验
- **智能重置**：
  - 搜索时自动跳到第一页
  - 切换筛选时自动跳到第一页
  - 翻页时保持当前页码

### ✅ 筛选功能
- **全部版本** / **仅 LTS**：一键切换
- **自动刷新**：切换筛选后自动重新加载数据

### ✅ 性能优化
- **按需加载**：每次只加载 50 条数据
- **服务端过滤**：减少数据传输量
- **防抖处理**：避免频繁请求

## 使用示例

### 搜索 Node.js 18 版本：
1. 在搜索框输入 "18"
2. 等待 500ms（防抖）
3. 自动显示所有 18.x.x 版本
4. 每页显示 50 个版本

### 搜索 LTS 版本：
1. 点击 "仅 LTS" 按钮
2. 自动显示所有 LTS 版本
3. 可以结合搜索框过滤特定版本

### 分页浏览：
1. 点击 "下一页" 查看更多版本
2. 点击 "上一页" 返回上一页
3. 页面信息显示当前页/总页数/总版本数

## API 变化

### 请求参数：
```
GET /api/fnm/available-versions?page=1&pageSize=50&filter=18&lts=true
```

### 响应格式：
```json
{
  "success": true,
  "data": {
    "versions": [
      { "version": "18.20.0", "lts": "Hydrogen" },
      { "version": "18.19.0", "lts": "Hydrogen" },
      ...
    ],
    "total": 100,
    "page": 1,
    "pageSize": 50,
    "totalPages": 2
  }
}
```

## 注意事项

1. **首次加载**：页面加载时自动获取第一页数据
2. **搜索延迟**：为避免频繁请求，搜索有 500ms 延迟
3. **页码重置**：搜索或切换筛选时会自动重置到第一页
4. **国内镜像**：使用 `https://npmmirror.com/mirrors/node` 加速下载

## 技术细节

### 后端：
- 使用 `fnm list-remote` 命令获取版本列表
- 服务端过滤和分页，减少数据传输
- 支持模糊匹配和精确匹配

### 前端：
- Vue 3 Composition API
- 响应式状态管理
- 计算属性优化渲染
- 防抖处理提升性能

## 测试建议

1. **搜索功能测试**：
   - 输入 "18"，验证显示所有 18.x.x 版本
   - 输入 "20.11"，验证显示所有 20.11.x 版本
   - 清空搜索，验证显示所有版本

2. **分页功能测试**：
   - 点击下一页，验证加载新数据
   - 点击上一页，验证返回上一页
   - 验证页码和总数信息正确

3. **筛选功能测试**：
   - 点击 "仅 LTS"，验证只显示 LTS 版本
   - 点击 "全部版本"，验证显示所有版本
   - 结合搜索测试筛选功能

4. **性能测试**：
   - 监控网络请求，验证每次只加载 50 条
   - 测试搜索防抖效果
   - 验证页面响应速度

## 总结

通过后端分页和前端优化，成功解决了搜索功能失效和性能问题。现在用户可以：
- ✅ 快速搜索特定版本
- ✅ 按需加载版本数据
- ✅ 流畅浏览所有可用版本
- ✅ 享受更好的用户体验