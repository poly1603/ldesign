# 数据存储迁移指南 - 从 localStorage 到本地数据库

## 🎯 迁移目标

将所有速妖存储的数据从 localStorage 和 JSON 文件迁移到本地 SQLite 数据库中，实现：

✅ **统一数据管理** - 所有数据存储在数据库中  
✅ **自动启动数据库** - 后台启动时自动初始化数据库  
✅ **无缝数据迁移** - 首次启动自动迁移现有数据  
✅ **更好的性能** - 数据库查询比 JSON 文件读写更快  
✅ **数据完整性** - 支持事务、外键约束等  
✅ **易于扩展** - Repository 模式便于添加新功能  

## 📦 已完成的工作

### 1. 数据库核心模块 ✅

创建了以下核心文件：

- **`src/server/database/DatabaseManager.ts`** - 数据库管理器
  - 自动创建数据库连接
  - 创建所有必要的表结构
  - 支持WAL模式提高并发性能
  - 提供备份、优化、统计等功能

- **`src/server/database/MigrationService.ts`** - 数据迁移服务
  - 自动检测并迁移 JSON 文件数据
  - 支持项目、NPM源、AI配置、用户设置的迁移
  - 自动备份原始数据文件

- **`src/server/database/repositories/ProjectRepository.ts`** - 项目数据访问层
  - 提供完整的 CRUD 操作
  - 支持搜索、排序、分页
  - 类型安全的接口

- **`src/server/database/index.ts`** - 统一导出接口
  - 提供 `initializeDatabase()` 初始化函数
  - 提供 `getRepositories()` 获取所有仓库
  - 提供 `closeDatabase()` 关闭连接

### 2. 数据库表结构 ✅

已创建以下数据表：

| 表名 | 说明 | 主要字段 |
|------|------|----------|
| `projects` | 项目信息 | id, name, path, type, framework, description |
| `npm_sources` | NPM源配置 | id, name, url, type, is_logged_in, login_info |
| `ai_configs` | AI配置 | id, provider, api_key, model, base_url |
| `ai_conversations` | AI对话 | id, title, provider, model, metadata |
| `ai_messages` | AI消息 | id, conversation_id, role, content |
| `user_settings` | 用户设置 | key, value, type |
| `node_configs` | Node版本配置 | id, version, path, is_default |
| `verdaccio_config` | Verdaccio配置 | key, value |

## 🚀 使用方法

### 步骤1: 安装依赖

```bash
# 已经为您安装了 better-sqlite3
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3
```

### 步骤2: 在后台启动时初始化数据库

在您的后台入口文件中添加以下代码：

```typescript
import { initializeDatabase, closeDatabase } from './database'

async function startServer() {
  // 1. 初始化数据库（会自动执行数据迁移）
  const result = await initializeDatabase({
    verbose: process.env.NODE_ENV === 'development',
    autoMigrate: true,
  })

  if (!result.success) {
    console.error('数据库初始化失败:', result.message)
    process.exit(1)
  }

  // 2. 启动您的HTTP服务器
  // ... 其他启动代码
}

// 3. 进程退出时关闭数据库
process.on('SIGINT', () => {
  closeDatabase()
  process.exit(0)
})

process.on('SIGTERM', () => {
  closeDatabase()
  process.exit(0)
})

startServer()
```

### 步骤3: 修改后端API

将原来从 JSON 文件读写的代码改为使用 Repository：

```typescript
// ❌ 旧方式
import * as fs from 'fs'
const projects = JSON.parse(fs.readFileSync('data/projects.json', 'utf-8'))

// ✅ 新方式
import { getRepositories } from './database'
const repos = getRepositories()
const projects = repos.project.findAll()
```

### 步骤4: 修改前端代码

前端不再直接使用 localStorage，而是通过 API 访问：

```typescript
// ❌ 旧方式
localStorage.setItem('projects', JSON.stringify(projects))

// ✅ 新方式
await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(projectData),
})
```

## 📝 迁移清单

接下来需要修改的文件：

### 后端API文件

- [ ] `src/server/routes/projects.ts` - 项目相关API
- [ ] `src/server/routes/npm-sources.ts` - NPM源相关API  
- [ ] `src/server/routes/ai.ts` - AI配置相关API
- [ ] `src/server/routes/settings.ts` - 用户设置相关API
- [ ] `src/server/index.ts` - 服务器启动文件

### 前端组件文件

- [ ] `src/web/src/views/ProjectAction.vue` - 移除 localStorage 使用
- [ ] `src/web/src/views/AIDemo.vue` - 移除 localStorage 使用
- [ ] `src/web/src/ai/config.ts` - 改为通过API获取配置
- [ ] `src/web/src/composables/useTheme.ts` - 改为通过API存储主题设置

## 🔧 API示例代码

### Express 路由示例

```typescript
import { Router } from 'express'
import { getRepositories } from '../database'

const router = Router()
const repos = getRepositories()

// 获取所有项目
router.get('/api/projects', (req, res) => {
  try {
    const projects = repos.project.findAll()
    res.json({ success: true, data: projects })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 创建项目
router.post('/api/projects', (req, res) => {
  try {
    const project = repos.project.create(req.body)
    res.json({ success: true, data: project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 更新项目
router.put('/api/projects/:id', (req, res) => {
  try {
    const project = repos.project.update(req.params.id, req.body)
    res.json({ success: true, data: project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 删除项目
router.delete('/api/projects/:id', (req, res) => {
  try {
    repos.project.delete(req.params.id)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
```

## 🔍 测试建议

1. **备份数据** - 在迁移前备份 `data/` 目录
2. **开发环境测试** - 先在开发环境测试迁移功能
3. **检查迁移结果** - 启动后检查控制台输出的迁移统计
4. **功能测试** - 测试所有CRUD操作是否正常工作
5. **性能测试** - 对比迁移前后的查询性能

## 📊 数据库位置

数据库文件存储在：

- **Windows**: `C:\Users\{用户名}\AppData\Roaming\ldesign\database\ldesign.db`
- **macOS**: `~/Library/Application Support/ldesign/database/ldesign.db`
- **Linux**: `~/.config/ldesign/database/ldesign.db`

## 🛠️ 维护命令

```typescript
import { getDatabaseManager } from './database'

const dbManager = getDatabaseManager()

// 备份数据库
await dbManager.backup()

// 优化数据库
dbManager.optimize()

// 检查数据库健康状态
const isHealthy = dbManager.checkIntegrity()

// 获取统计信息
const stats = dbManager.getStats()
console.log('数据库大小:', stats.size)
console.log('表信息:', stats.tables)
```

## 💡 最佳实践

1. **使用Repository模式** - 不要直接操作数据库，通过 Repository 访问
2. **使用事务** - 批量操作使用 `transaction()` 包装
3. **定期备份** - 定期备份数据库文件
4. **错误处理** - 所有数据库操作添加 try-catch
5. **类型安全** - 使用 TypeScript 接口定义数据结构

## ❓ 常见问题

### Q: 如何添加新的数据表？

1. 在 `DatabaseManager.ts` 的 `createTables()` 中添加表结构
2. 创建对应的 Repository 类
3. 在 `index.ts` 中导出新的 Repository
4. 如果需要迁移旧数据，在 `MigrationService.ts` 中添加迁移逻辑

### Q: 数据库文件会占用多少空间？

SQLite 数据库非常高效，通常比 JSON 文件更小。对于大多数应用场景，数据库文件不会超过几MB。

### Q: 如何处理并发访问？

better-sqlite3 已启用 WAL 模式，支持多读单写，适合大多数场景。

## 📚 参考文档

- [better-sqlite3 文档](https://github.com/WiseLibs/better-sqlite3)
- [SQLite 官方文档](https://www.sqlite.org/docs.html)
- [数据库系统使用指南](./src/server/database/README.md)

## 🎉 总结

现在您已经拥有了一个完整的本地数据库系统！

- ✅ 数据库管理器已就绪
- ✅ 自动数据迁移已实现
- ✅ Repository 模式已建立
- ✅ 使用文档已完善

接下来只需要：
1. 修改后端 API 使用 Repository
2. 修改前端代码通过 API 访问数据
3. 测试迁移功能
4. 上线使用

祝您使用愉快！🚀
