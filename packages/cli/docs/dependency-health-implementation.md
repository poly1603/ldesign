# 依赖健康度分析系统实现文档

## 概述

本文档详细说明依赖健康度分析功能的实现，包含后端缓存系统和前端集成。

## 系统架构

```
前端 (DependenciesTab.vue)
  ↓
  ├─ 自动检查更新 (进入面板时)
  ├─ 获取健康度数据
  └─ 管理缓存
  ↓
后端 API
  ├─ /api/dependencies/check-updates (版本检查)
  ├─ /api/dependencies/analyze-health (健康度分析)
  ├─ /api/dependencies/cache-status (缓存状态)
  └─ /api/dependencies/clear-cache (清除缓存)
  ↓
版本缓存服务 (version-cache.ts)
  └─ 1天有效期，按项目路径存储
```

## 核心功能

### 1. 版本缓存系统

**位置**: `src/server/services/version-cache.ts`

**功能**:
- 按项目路径缓存依赖版本信息
- 1天 (24小时) 有效期
- 自动过期检测
- 支持增量更新（合并新旧数据）

**API**:
```typescript
// 读取缓存
readCache(projectPath: string): VersionCacheData | null

// 写入缓存
writeCache(projectPath: string, data: object): void

// 清除缓存
clearCache(projectPath: string): boolean

// 获取缓存状态
getCacheStatus(projectPath: string): CacheStatus

// 合并缓存数据
mergeWithCache(projectPath: string, newData: object): object
```

**缓存文件位置**:
```
<项目根目录>/.ldesign/version-cache.json
```

**数据结构**:
```json
{
  "timestamp": 1234567890000,
  "expiresAt": 1234654290000,
  "data": {
    "package-name": "1.2.3",
    ...
  }
}
```

### 2. 后端 API 接口

#### 2.1 检查更新接口

**端点**: `POST /api/dependencies/check-updates`

**请求参数**:
```typescript
{
  projectPath: string;
  dependencies: Array<{ name: string; version: string }>;
  forceRefresh?: boolean; // 强制刷新，忽略缓存
}
```

**响应**:
```typescript
{
  success: boolean;
  data: {
    versions: { [packageName: string]: string };
    fromCache: boolean;
  }
}
```

**特性**:
- 优先使用缓存数据（除非 `forceRefresh=true`）
- 缓存未命中时查询 npm registry
- 自动将新数据写入缓存
- 支持增量更新（合并已缓存和新查询的数据）

#### 2.2 健康度分析接口

**端点**: `POST /api/dependencies/analyze-health`

**请求参数**:
```typescript
{
  projectPath: string;
  dependencies: Array<{
    name: string;
    version: string;
    latestVersion?: string;
    isDev: boolean;
  }>;
}
```

**响应**:
```typescript
{
  success: boolean;
  data: {
    health: DependencyHealth;
    cacheStatus: CacheStatus;
    aiSuggestions?: Suggestion[]; // 预留 AI 建议接口
  }
}
```

**健康度数据结构**:
```typescript
interface DependencyHealth {
  score: {
    score: number;      // 0-100 分
    grade: string;      // S/A/B/C/D
    label: string;      // 健康/良好/一般/较差/危险
    color: string;      // 颜色代码
  };
  metrics: {
    total: number;        // 总依赖数
    upToDate: number;     // 最新版本数
    patchBehind: number;  // 补丁版本落后数
    minorBehind: number;  // 次版本落后数
    majorBehind: number;  // 主版本落后数
  };
  suggestions: Suggestion[];
}
```

#### 2.3 缓存状态接口

**端点**: `GET /api/dependencies/cache-status?projectPath=xxx`

**响应**:
```typescript
{
  success: boolean;
  data: {
    cached: boolean;
    cacheAge?: number;      // 缓存年龄（毫秒）
    cacheExpiry?: string;   // 过期时间
    itemCount?: number;     // 缓存项数量
  }
}
```

#### 2.4 清除缓存接口

**端点**: `POST /api/dependencies/clear-cache`

**请求参数**:
```typescript
{
  projectPath: string;
}
```

**响应**:
```typescript
{
  success: boolean;
  message: string;
}
```

### 3. 前端集成

**位置**: `src/web/src/components/tabs/DependenciesTab.vue`

#### 3.1 自动检查更新

进入依赖管理面板时自动执行：
```typescript
onMounted(async () => {
  await loadDependencies()
  // 静默模式，使用缓存
  if (dependencies.value.length > 0 || devDependencies.value.length > 0) {
    await checkUpdates(false, true)
  }
})
```

#### 3.2 健康度数据加载

从后端 API 获取健康度数据：
```typescript
const loadHealthData = async () => {
  const response = await api.post('/api/dependencies/analyze-health', {
    projectPath: props.projectPath,
    dependencies: allDeps
  })
  
  if (response.success && response.data) {
    healthData.value = response.data.health
    cacheInfo.value = response.data.cacheStatus
    // TODO: 未来集成 AI 建议
  }
}
```

#### 3.3 UI 特性

**缓存状态指示器**:
- 📦 使用缓存数据（蓝色标签）
- ✨ 实时数据（绿色标签）

**清除缓存按钮**:
- 仅在有缓存时显示
- 点击后强制刷新数据
- 提供 hover 提示

**健康度面板**:
- 显示健康评分和等级
- 展示依赖指标统计
- 提供优化建议列表

## 使用流程

### 用户操作流程

1. **进入依赖管理面板**
   - 自动加载项目依赖
   - 静默检查更新（使用缓存）
   - 加载健康度数据

2. **查看健康度分析**
   - 查看健康评分和等级
   - 查看依赖指标统计
   - 查看优化建议

3. **手动刷新**
   - 点击"检查更新"按钮
   - 显示更新提示
   - 更新健康度数据

4. **清除缓存**
   - 点击"清除缓存"按钮
   - 强制从 npm 查询最新版本
   - 更新缓存数据

### 缓存策略

**缓存命中**:
- 缓存文件存在
- 缓存未过期（24小时内）
- 直接返回缓存数据

**缓存未命中**:
- 查询 npm registry
- 写入新缓存
- 返回实时数据

**增量更新**:
- 仅查询缓存中不存在的包
- 合并新旧数据
- 更新缓存时间戳

## 技术细节

### 评分算法

**基础分**: 100 分

**扣分规则**:
- 主版本落后: -20 分/个
- 次版本落后: -10 分/个
- 补丁版本落后: -3 分/个
- 安全风险: -5 分/个
- 依赖数量: 超过50个时额外扣分

**等级划分**:
- S 级: 95-100 分（健康）
- A 级: 85-94 分（良好）
- B 级: 70-84 分（一般）
- C 级: 50-69 分（较差）
- D 级: 0-49 分（危险）

### 建议生成

**自动建议类型**:
1. 主版本过时 (danger)
2. 次版本过时 (warning)
3. 补丁版本过时 (info)
4. 安全风险 (danger)
5. 依赖数量过多 (warning)

## 未来扩展

### AI 建议集成（预留）

**集成方案**:
```typescript
// 健康度分析 API 响应中预留字段
interface AnalyzeHealthResponse {
  health: DependencyHealth;
  cacheStatus: CacheStatus;
  aiSuggestions?: Suggestion[]; // AI 生成的建议
}

// 前端合并 AI 建议
if (response.data.aiSuggestions) {
  healthData.value.suggestions.push(...response.data.aiSuggestions)
}
```

**AI 建议来源**:
- DeepSeek API
- OpenAI GPT
- Claude API

**建议内容**:
- 依赖升级优先级
- 潜在兼容性问题
- 性能优化建议
- 安全漏洞提示

## 文件结构

```
packages/cli/
├── src/
│   ├── server/
│   │   ├── services/
│   │   │   └── version-cache.ts          # 版本缓存服务
│   │   └── routes/
│   │       └── project-tools.ts          # API 路由
│   └── web/
│       └── src/
│           ├── components/
│           │   └── tabs/
│           │       └── DependenciesTab.vue  # 依赖管理面板
│           └── utils/
│               └── dependencyHealth.ts      # 健康度计算工具
└── docs/
    └── dependency-health-implementation.md  # 本文档
```

## 测试建议

### 单元测试

1. **版本缓存服务测试**
   - 读写缓存
   - 过期检测
   - 增量更新
   - 清除缓存

2. **健康度计算测试**
   - 评分算法
   - 等级划分
   - 建议生成

### 集成测试

1. **API 接口测试**
   - 检查更新接口
   - 健康度分析接口
   - 缓存管理接口

2. **前后端联调测试**
   - 自动检查更新
   - 健康度数据加载
   - 缓存刷新

### 性能测试

1. **缓存性能**
   - 缓存命中率
   - 响应时间对比

2. **大量依赖测试**
   - 50+ 依赖项目
   - 100+ 依赖项目

## 总结

本实现完整地实现了依赖健康度分析系统，包含：

✅ 后端版本缓存系统（1天有效期）
✅ 健康度分析 API
✅ 缓存管理功能
✅ 前端自动检查更新
✅ 健康度面板展示
✅ 缓存状态指示
✅ AI 建议接口预留

系统采用缓存优先策略，避免频繁的网络请求，提升用户体验。同时预留了 AI 建议接口，为未来集成 DeepSeek 等 AI 服务提供了扩展空间。
