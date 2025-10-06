# 数据库系统使用指南

## 概述

本项目使用 SQLite 作为本地嵌入式数据库，通过 `better-sqlite3` 库进行管理。所有数据（项目、NPM 源、AI 配置、用户设置等）都存储在本地数据库中。

## 目录结构

```
database/
├── DatabaseManager.ts        # 数据库管理器核心
├── MigrationService.ts       # 数据迁移服务
├── index.ts                  # 统一导出接口
└── repositories/             # 数据访问层
    ├── ProjectRepository.ts  # 项目数据访问
    └── ...                   # 其他仓库
```

## 快速开始

### 1. 在后台启动时初始化数据库

在您的后台入口文件（例如 `src/server/index.ts`）中添加以下代码：

```typescript
import { initializeDatabase, closeDatabase } from './database'

// 应用启动时
async function startServer() {
  try {
    // 初始化数据库（会自动执行数据迁移）
    const result = await initializeDatabase({
      verbose: process.env.NODE_ENV === 'development',
      autoMigrate: true,
    })

    if (!result.success) {
      console.error('数据库初始化失败:', result.message)
      process.exit(1)
    }

    // 启动您的服务器...
    // ...
  } catch (error) {
    console.error('启动失败:', error)
    process.exit(1)
  }
}

// 应用退出时清理
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

### 2. 使用数据访问层

```typescript
import { getRepositories } from './database'

// 获取仓库实例
const repos = getRepositories()

// 创建项目
const newProject = repos.project.create({
  name: '我的项目',
  path: '/path/to/project',
  type: 'vue',
  framework: 'Vue 3',
  description: '这是一个测试项目',
})

// 查询所有项目
const projects = repos.project.findAll({
  orderBy: 'updated_at',
  order: 'DESC',
  limit: 10,
})

// 更新项目
repos.project.update(projectId, {
  name: '新名称',
  description: '更新后的描述',
})

// 删除项目
repos.project.delete(projectId)

// 搜索项目
const searchResults = repos.project.search('关键词')
```

## 数据迁移

### 自动迁移

首次启动时，系统会自动检测 `data/` 目录下的 JSON 文件，并将数据迁移到数据库：

- `projects.json` → `projects` 表
- `npm-sources.json` → `npm_sources` 表
- `ai-configs.json` → `ai_configs` 表
- `user-settings.json` → `user_settings` 表

原始 JSON 文件会自动备份到 `data/backup-{timestamp}/` 目录。

### 手动迁移

```typescript
import { getDatabaseManager, MigrationService } from './database'

const dbManager = getDatabaseManager()
await dbManager.initialize()

const migrationService = new MigrationService(dbManager, './data')

// 检查是否需要迁移
if (migrationService.needsMigration()) {
  // 备份现有数据
  await migrationService.backupDataFiles()
  
  // 执行迁移
  const result = await migrationService.migrate()
  console.log('迁移结果:', result)
}
```

## 数据库表结构

### projects（项目表）
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `path` (TEXT NOT NULL UNIQUE)
- `type` (TEXT NOT NULL)
- `framework` (TEXT)
- `description` (TEXT)
- `created_at` (INTEGER NOT NULL)
- `updated_at` (INTEGER NOT NULL)
- `last_opened_at` (INTEGER)
- `metadata` (TEXT JSON)

### npm_sources（NPM 源表）
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `url` (TEXT NOT NULL)
- `type` (TEXT NOT NULL)
- `description` (TEXT)
- `is_logged_in` (INTEGER DEFAULT 0)
- `login_info` (TEXT JSON)
- `created_at` (INTEGER NOT NULL)
- `updated_at` (INTEGER NOT NULL)

### ai_configs（AI 配置表）
- `id` (TEXT PRIMARY KEY)
- `provider` (TEXT NOT NULL)
- `api_key` (TEXT)
- `model` (TEXT)
- `base_url` (TEXT)
- `config` (TEXT JSON)
- `is_active` (INTEGER DEFAULT 0)
- `created_at` (INTEGER NOT NULL)
- `updated_at` (INTEGER NOT NULL)

### ai_conversations（AI 对话表）
- `id` (TEXT PRIMARY KEY)
- `title` (TEXT NOT NULL)
- `provider` (TEXT NOT NULL)
- `model` (TEXT NOT NULL)
- `created_at` (INTEGER NOT NULL)
- `updated_at` (INTEGER NOT NULL)
- `metadata` (TEXT JSON)

### ai_messages（AI 消息表）
- `id` (TEXT PRIMARY KEY)
- `conversation_id` (TEXT NOT NULL)
- `role` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `created_at` (INTEGER NOT NULL)

### user_settings（用户设置表）
- `key` (TEXT PRIMARY KEY)
- `value` (TEXT NOT NULL)
- `type` (TEXT NOT NULL)
- `created_at` (INTEGER NOT NULL)
- `updated_at` (INTEGER NOT NULL)

## API 接口示例

### 在 Express 路由中使用

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
    if (!project) {
      return res.status(404).json({ success: false, message: '项目不存在' })
    }
    res.json({ success: true, data: project })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// 删除项目
router.delete('/api/projects/:id', (req, res) => {
  try {
    const success = repos.project.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ success: false, message: '项目不存在' })
    }
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
```

## 数据库维护

### 备份数据库

```typescript
import { getDatabaseManager } from './database'

const dbManager = getDatabaseManager()
const backupPath = await dbManager.backup()
console.log('数据库已备份到:', backupPath)
```

### 优化数据库

```typescript
dbManager.optimize()
```

### 检查数据库完整性

```typescript
const isHealthy = dbManager.checkIntegrity()
console.log('数据库健康状态:', isHealthy)
```

### 获取统计信息

```typescript
const stats = dbManager.getStats()
console.log('数据库大小:', stats.size)
console.log('表信息:', stats.tables)
```

## 前端数据访问

前端不再直接使用 `localStorage`，而是通过 API 访问数据库：

```typescript
// ❌ 旧方式（不推荐）
localStorage.setItem('projects', JSON.stringify(projects))

// ✅ 新方式（推荐）
const response = await fetch('/api/projects', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(projectData),
})
const result = await response.json()
```

## 注意事项

1. **数据库位置**：数据库文件默认存储在 `{userData}/database/ldesign.db`
2. **并发安全**：better-sqlite3 使用 WAL 模式，支持多读单写
3. **事务支持**：Repository 中的批量操作会自动使用事务
4. **数据备份**：建议定期备份数据库文件
5. **性能优化**：已创建索引，查询性能良好

## 故障排除

### 数据库锁定
如果遇到"database is locked"错误，检查是否有其他进程正在访问数据库。

### 迁移失败
检查 `data/` 目录中的 JSON 文件格式是否正确，查看备份目录中的原始文件。

### 性能问题
运行 `dbManager.optimize()` 优化数据库，或使用 `VACUUM` 命令压缩数据库。

## 扩展

要添加新的数据表和仓库：

1. 在 `DatabaseManager.ts` 的 `createTables()` 方法中添加表结构
2. 在 `repositories/` 目录下创建新的 Repository 类
3. 在 `MigrationService.ts` 中添加相应的迁移逻辑
4. 在 `index.ts` 的 `getRepositories()` 中导出新仓库

## 许可证

MIT
