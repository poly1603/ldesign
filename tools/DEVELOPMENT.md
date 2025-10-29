# LDesign 开发指南

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Windows / macOS / Linux

### 安装依赖

```bash
# 在tools目录下
cd server
pnpm install

cd ../web
pnpm install
```

### 方式一：使用快速启动脚本（推荐）

```powershell
# Windows PowerShell
.\start.ps1
```

这将自动启动后端和前端服务，并打开两个独立的终端窗口。

### 方式二：手动启动

**终端1 - 启动后端**:
```bash
cd server
pnpm start
```

**终端2 - 启动前端**:
```bash
cd web
pnpm dev
```

### 访问应用

- 前端: http://localhost:5173
- 后端API: http://127.0.0.1:3000
- API文档: http://127.0.0.1:3000/api/health

## 📁 项目结构

```
tools/
├── server/              # 后端服务
│   ├── src/
│   │   ├── core/       # 核心功能（任务管理器等）
│   │   ├── routes/     # API路由
│   │   ├── middleware/ # 中间件
│   │   ├── database/   # 数据库
│   │   ├── utils/      # 工具函数
│   │   ├── types/      # 类型定义
│   │   └── index.ts    # 入口文件
│   ├── scripts/        # 脚本（seed等）
│   ├── dist/           # 构建输出
│   └── .ldesign/       # 数据文件（SQLite数据库）
│
├── web/                # 前端应用
│   ├── src/
│   │   ├── api/        # API封装
│   │   ├── components/ # 公共组件
│   │   ├── views/      # 页面组件
│   │   ├── store/      # Pinia状态管理
│   │   ├── router/     # 路由配置
│   │   ├── config/     # 配置文件
│   │   └── assets/     # 静态资源
│   └── dist/           # 构建输出
│
├── shared/             # 共享代码
├── FEATURES.md         # 功能文档
├── DEVELOPMENT.md      # 开发指南（本文件）
└── start.ps1           # 快速启动脚本
```

## 🔧 开发工作流

### 1. 添加新的后端API

#### 步骤1: 创建路由文件

在 `server/src/routes/` 创建新的路由文件，例如 `myfeature.ts`:

```typescript
import { Router } from 'express'
import { success, error } from '../utils/response'

export const myFeatureRouter = Router()

myFeatureRouter.get('/', (req, res) => {
  try {
    // 实现逻辑
    return success(res, { message: 'Hello World' })
  } catch (err: any) {
    return error(res, err.message, 'ERROR_CODE', 500)
  }
})
```

#### 步骤2: 注册路由

在 `server/src/routes/index.ts` 注册路由:

```typescript
import { myFeatureRouter } from './myfeature'

export function setupRoutes(app: Express) {
  // ... 其他路由
  app.use('/api/myfeature', myFeatureRouter)
}
```

#### 步骤3: 重新构建

```bash
cd server
pnpm build
```

#### 步骤4: 重启后端

重启后端服务即可生效。

### 2. 添加新的前端页面

#### 步骤1: 创建页面组件

在 `web/src/views/` 创建新的Vue组件，例如 `MyFeature.vue`:

```vue
<template>
  <div class="my-feature-page">
    <n-page-header title="我的功能" subtitle="功能描述" />
    
    <n-card class="mt-4">
      <!-- 页面内容 -->
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/api'

// 逻辑代码
</script>

<style scoped>
.my-feature-page {
  padding: 24px;
}
.mt-4 {
  margin-top: 16px;
}
</style>
```

#### 步骤2: 添加路由

在 `web/src/router/index.ts` 添加路由:

```typescript
{
  path: '/myfeature',
  name: 'MyFeature',
  component: () => import('../views/MyFeature.vue'),
}
```

#### 步骤3: 添加菜单项

在 `web/src/components/Layout.vue` 添加菜单:

```typescript
import { MyIcon } from 'lucide-vue-next'

const menuOptions: MenuOption[] = [
  // ... 其他菜单
  { label: '我的功能', key: '/myfeature', icon: renderIcon(MyIcon) },
]

const pageTitles: Record<string, string> = {
  // ... 其他标题
  '/myfeature': '我的功能',
}
```

### 3. 添加API封装

在 `web/src/api/` 创建API文件，例如 `myfeature.ts`:

```typescript
import { apiClient } from './client'

export const myFeatureApi = {
  getData: (): Promise<any> => {
    return apiClient.get('/myfeature')
  },
  
  createData: (data: any): Promise<any> => {
    return apiClient.post('/myfeature', data)
  },
}
```

在 `web/src/api/index.ts` 导出:

```typescript
import { myFeatureApi } from './myfeature'

export const api = {
  // ... 其他API
  ...myFeatureApi,
}
```

## 🗄️ 数据库操作

### 使用现有数据库

数据库位于 `server/.ldesign/server.db`，使用 Better-SQLite3。

### 添加新表

在 `server/src/database/index.ts` 的 `createTables()` 方法中添加:

```typescript
this.db.exec(`
  CREATE TABLE IF NOT EXISTS my_table (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    createdAt INTEGER NOT NULL
  )
`)
```

### 查询数据

```typescript
import { db } from '../database'

// 查询所有
const rows = db.getDb().prepare('SELECT * FROM my_table').all()

// 查询单条
const row = db.getDb().prepare('SELECT * FROM my_table WHERE id = ?').get(id)

// 插入
db.getDb().prepare('INSERT INTO my_table (id, name, createdAt) VALUES (?, ?, ?)')
  .run(id, name, Date.now())

// 更新
db.getDb().prepare('UPDATE my_table SET name = ? WHERE id = ?')
  .run(name, id)

// 删除
db.getDb().prepare('DELETE FROM my_table WHERE id = ?').run(id)
```

### 重置数据库

```bash
cd server
rm -rf .ldesign
pnpm seed  # 重新初始化并添加示例数据
```

## 🎨 UI组件使用

### Naive UI 组件

项目使用 Naive UI 作为UI库。常用组件:

```vue
<template>
  <!-- 卡片 -->
  <n-card title="标题">内容</n-card>
  
  <!-- 按钮 -->
  <n-button type="primary" @click="handleClick">按钮</n-button>
  
  <!-- 表单 -->
  <n-form :model="formData">
    <n-form-item label="名称">
      <n-input v-model:value="formData.name" />
    </n-form-item>
  </n-form>
  
  <!-- 表格 -->
  <n-data-table :columns="columns" :data="data" />
  
  <!-- 消息提示 -->
  <script setup>
  import { useMessage } from 'naive-ui'
  const message = useMessage()
  message.success('操作成功')
  message.error('操作失败')
  </script>
</template>
```

### Lucide 图标

```vue
<template>
  <component :is="Home" :size="20" />
</template>

<script setup>
import { Home, Settings, User } from 'lucide-vue-next'
</script>
```

## 🧪 测试

### 后端测试

```bash
cd server
pnpm test
```

### 前端测试

```bash
cd web
# TODO: 添加测试配置
```

## 📦 构建和部署

### 开发环境

```bash
# 后端
cd server
pnpm dev  # 监听模式

# 前端
cd web
pnpm dev  # 热重载
```

### 生产构建

```bash
# 后端
cd server
pnpm build

# 前端
cd web
pnpm build
```

### 生产部署

```bash
# 后端
cd server
pnpm start

# 前端（使用nginx或其他静态服务器）
cd web/dist
# 部署dist目录内容
```

## 🐛 调试技巧

### 后端调试

1. 查看日志输出
2. 使用 `logger.info()`, `logger.error()` 等
3. 在VS Code中使用断点调试

### 前端调试

1. 使用浏览器开发者工具
2. Vue DevTools扩展
3. 查看控制台日志
4. 使用 `console.log()` 或 `console.table()`

### API测试

使用curl或Postman测试API:

```bash
# 健康检查
curl http://127.0.0.1:3000/api/health

# 获取项目列表
curl http://127.0.0.1:3000/api/projects

# 创建任务
curl -X POST http://127.0.0.1:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"type":"build","projectId":"demo-1"}'
```

## 🔍 常见问题

### Q: 后端启动失败

**A**: 检查:
1. 端口3000是否被占用
2. 依赖是否正确安装
3. 数据库文件是否正常

### Q: 前端连接不上后端

**A**: 检查:
1. 后端是否正在运行
2. Vite代理配置是否正确
3. CORS设置是否正确

### Q: 任务执行失败

**A**: 检查:
1. 任务执行器是否正确注册
2. 查看任务日志
3. 检查项目路径是否正确

### Q: 数据库操作失败

**A**: 检查:
1. 数据库是否正确初始化
2. SQL语句是否正确
3. 数据类型是否匹配

## 📚 参考文档

- [Vue 3 文档](https://vuejs.org/)
- [Naive UI 文档](https://www.naiveui.com/)
- [Vite 文档](https://vitejs.dev/)
- [Express 文档](https://expressjs.com/)
- [Better-SQLite3 文档](https://github.com/WiseLibs/better-sqlite3)
- [Pinia 文档](https://pinia.vuejs.org/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 使用有意义的变量和函数名
- 添加必要的注释
- 保持代码简洁清晰

---

**Happy Coding! 🚀**
