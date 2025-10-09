# NPM 源服务可用性检测功能 - 完整文档

## 📋 功能概述

为 NPM 源管理页面添加了完整的服务可用性检测系统，实时监控每个 NPM 源的服务状态、响应延迟和健康状况。

## ✨ 核心功能

### 1. **实时状态检测**
- ✅ 自动检测所有 NPM 源的服务可用性
- ✅ 显示三种状态：检测中、可用、不可用
- ✅ 实时显示响应延迟（毫秒）
- ✅ 记录最后检测时间

### 2. **定时自动检测**
- ✅ 每 60 秒自动检测一次
- ✅ 支持启用/禁用自动检测
- ✅ 页面卸载时自动清理定时器

### 3. **手动重检功能**
- ✅ 每个源卡片提供"重检"按钮
- ✅ 单独触发某个源的可用性检测
- ✅ 显示检测进度

### 4. **延迟显示**
- ✅ 实时显示每个源的响应延迟
- ✅ 延迟信息显示在状态标签中
- ✅ 悬停提示显示详细信息

## 🔧 技术实现

### 前端实现 (`NpmSourceManager.vue`)

#### 接口扩展
```typescript
interface NpmSource {
  // ... 现有属性
  // 服务可用性状态
  isAvailable?: boolean      // 是否可用
  isChecking?: boolean       // 是否正在检测中
  latency?: number          // 延迟（毫秒）
  lastCheckTime?: string    // 最后检测时间
}
```

#### 核心函数

**1. 检测单个源**
```typescript
async function checkSourceAvailability(source: NpmSource) {
  const startTime = Date.now()
  source.isChecking = true
  
  const result = await get(`/api/npm-sources/${source.id}/check-availability`)
  
  source.isAvailable = result.data.available
  source.latency = result.data.latency || (Date.now() - startTime)
  source.lastCheckTime = new Date().toISOString()
  source.isChecking = false
}
```

**2. 检测所有源**
```typescript
async function checkAllSourcesAvailability() {
  await Promise.all(sources.value.map(source => checkSourceAvailability(source)))
}
```

**3. 定时检测**
```typescript
function startAutoCheck() {
  autoCheckInterval.value = window.setInterval(() => {
    if (autoCheckEnabled.value && sources.value.length > 0) {
      checkAllSourcesAvailability()
    }
  }, 60000) // 60秒
}
```

**4. 切换自动检测**
```typescript
function toggleAutoCheck() {
  autoCheckEnabled.value = !autoCheckEnabled.value
  if (autoCheckEnabled.value) {
    checkAllSourcesAvailability() // 立即检测一次
  }
}
```

#### UI 状态显示

```vue
<!-- 检测中 -->
<span class="status-badge checking">
  <span class="status-spinner"></span>
  检测中
</span>

<!-- 可用 -->
<span class="status-badge available">
  ✓ 可用 <span class="latency-text">(123ms)</span>
</span>

<!-- 不可用 -->
<span class="status-badge unavailable">
  ✗ 不可用 <span class="latency-text">(5000ms)</span>
</span>
```

### 后端实现 (`npm-sources.ts`)

#### API 端点
```
GET /api/npm-sources/:id/check-availability
```

#### 检测逻辑
```typescript
const startTime = Date.now()

// 1. 尝试 npm ping
const result = executeCommand(`npm ping --registry=${source.url}`)

let available = false
if (result.success) {
  available = true
} else {
  // 2. 备用方案：curl 检测
  const curlResult = executeCommand(
    `curl -s -o /dev/null -w "%{http_code}" ${source.url} --max-time 5`
  )
  const statusCode = parseInt(curlResult.output.trim())
  available = statusCode >= 200 && statusCode < 400
}

const latency = Date.now() - startTime

return {
  success: true,
  data: { available, latency }
}
```

## 🎨 UI/UX 设计

### 状态颜色系统

| 状态 | 颜色 | 图标 | 动画 |
|------|------|------|------|
| 检测中 | 蓝色 | ⏳ | 旋转动画 |
| 可用 | 绿色 | ✓ | 无 |
| 不可用 | 红色 | ✗ | 无 |

### 视觉效果

```
┌─────────────────────────────────────────────────────┐
│ 🌐 NPM 源管理                                        │
│ 管理和切换不同的 NPM 注册表源                        │
│                                                      │
│ [+ 添加源] [⟳ 刷新]                                  │
├─────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐   │
│ │ 本地           私有    ✓ 可用(35ms)  已登录  │   │
│ │ 地址: http://127.0.0.1:4873                  │   │
│ │ 本地部署                                      │   │
│ │ 用户:swimly 最后登录:2025/10/06 11:37        │   │
│ │                                               │   │
│ │ [切换] [重检] [登录检测] [退出] [编辑] [删除]│   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ npm 官方      公共    ✓ 可用(523ms)  未登录  │   │
│ │ 地址: https://registry.npmjs.org/            │   │
│ │ npm 官方镜像源                                │   │
│ │                                               │   │
│ │ [切换] [重检] [登录检测] [登录] [编辑] [删除]│   │
│ └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 样式实现

```less
.status-badge {
  font-size: var(--ls-font-size-sm);
  padding: 4px 12px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.available {
    background: var(--ldesign-success-color-1);
    color: var(--ldesign-success-color);
    font-weight: 500;
  }

  &.unavailable {
    background: var(--ldesign-danger-color-1);
    color: var(--ldesign-danger-color);
    font-weight: 500;
  }

  &.checking {
    background: var(--ldesign-brand-color-1);
    color: var(--ldesign-brand-color);
    
    .status-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid currentColor;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .latency-text {
    font-size: 0.85em;
    opacity: 0.8;
    margin-left: 2px;
  }
}
```

## 🔄 工作流程

### 页面加载流程
```
1. 组件挂载 (onMounted)
   ↓
2. 加载源列表 (loadSources)
   ↓
3. 自动触发可用性检测 (checkAllSourcesAvailability)
   ↓
4. 并发检测所有源
   ↓
5. 更新每个源的状态和延迟
   ↓
6. 启动定时检测 (startAutoCheck)
```

### 检测流程
```
用户触发 / 定时器触发
   ↓
设置 isChecking = true
   ↓
记录开始时间
   ↓
调用后端 API
   ↓
后端执行 npm ping / curl
   ↓
返回结果 + 延迟
   ↓
更新源状态
   ↓
设置 isChecking = false
```

### 自动检测循环
```
启动定时器 (60秒)
   ↓
检查是否启用自动检测
   ↓
YES → 检测所有源
   ↓
更新状态
   ↓
等待 60 秒
   ↓
重复...
```

## 📊 性能优化

### 1. **并发检测**
- 所有源同时检测，而非串行
- 使用 `Promise.all()` 实现并发

### 2. **非阻塞 UI**
- 检测过程中 UI 保持响应
- 显示加载动画提供实时反馈

### 3. **智能缓存**
- 记录最后检测时间
- 避免频繁重复检测

### 4. **资源清理**
- 组件卸载时清理定时器
- 防止内存泄漏

## 🚀 使用场景

### 1. **快速诊断**
在发布包之前，快速确认目标源是否可用：
```
本地: ✓ 可用 (35ms)    → 可以发布
npm:  ✓ 可用 (523ms)   → 可以发布
私有: ✗ 不可用 (5000ms) → 需要排查
```

### 2. **源选择依据**
根据延迟选择最快的源：
```
源 A: ✓ 可用 (50ms)   ← 最快
源 B: ✓ 可用 (200ms)
源 C: ✓ 可用 (800ms)
```

### 3. **健康监控**
实时监控所有配置的 NPM 源健康状况：
```
定期检测 (每分钟)
↓
发现异常自动提示
↓
管理员及时处理
```

### 4. **网络诊断**
通过延迟判断网络连接质量：
```
< 100ms   → 优秀
100-500ms → 良好
500-2s    → 较慢
> 2s      → 需要检查网络
```

## ⚙️ 配置选项

### 自动检测间隔
当前设置：60 秒（可在代码中调整）

```typescript
// 修改检测间隔（毫秒）
autoCheckInterval.value = window.setInterval(() => {
  // ...
}, 60000) // ← 这里修改
```

### 超时时间
后端 curl 命令超时：5 秒

```bash
curl ... --max-time 5  # ← 这里修改
```

### 判定标准
HTTP 状态码 200-399 认为服务可用

```typescript
available = statusCode >= 200 && statusCode < 400
```

## 🐛 错误处理

### 前端错误处理
```typescript
try {
  const result = await get(`/api/npm-sources/${source.id}/check-availability`)
  source.isAvailable = result.data.available
} catch (error) {
  // 出错标记为不可用
  source.isAvailable = false
  source.latency = Date.now() - startTime
}
```

### 后端错误处理
```typescript
catch (error) {
  npmLogger.error('检测源可用性失败:', error)
  res.json({
    success: true,
    data: {
      available: false,
      latency: 5000 // 超时
    }
  })
}
```

## 📈 扩展建议

### 已实现 ✅
- [x] 实时状态检测
- [x] 延迟显示
- [x] 定时自动检测
- [x] 手动重检功能
- [x] 并发检测优化

### 待实现 🔜
- [ ] 检测历史记录
- [ ] 可用性趋势图表
- [ ] 告警通知系统
- [ ] 自定义检测间隔
- [ ] 导出检测报告
- [ ] 批量检测控制

## 🎯 最佳实践

### 1. 合理设置检测间隔
```typescript
// 开发环境：30 秒
autoCheckInterval = 30000

// 生产环境：60 秒（推荐）
autoCheckInterval = 60000

// 低频使用：300 秒（5分钟）
autoCheckInterval = 300000
```

### 2. 及时响应异常
```typescript
if (source.isAvailable === false) {
  // 1. 检查网络连接
  // 2. 确认源地址正确
  // 3. 验证防火墙设置
  // 4. 联系源管理员
}
```

### 3. 选择合适的源
```typescript
// 优先选择延迟低的可用源
const bestSource = sources
  .filter(s => s.isAvailable)
  .sort((a, b) => (a.latency || Infinity) - (b.latency || Infinity))[0]
```

## 📚 相关文档

- NPM 源管理功能文档
- Verdaccio 集成文档
- 包发布流程文档

---

**版本**: 2.0.0  
**完成日期**: 2025-10-06  
**状态**: ✅ 已完成并优化
