# Tools 目录功能分析

本文档分析 `tools/` 目录下所有工具包的功能，为 Web 项目管理界面提供设计依据。

---

## 📦 工具包列表

### 1. **Builder** (`tools/builder/`)
**功能**: 项目构建工具
- 支持多种框架（Vue, React, Angular, Svelte 等）
- 提供构建配置管理
- 支持开发/生产模式构建
- 性能优化和代码分割

**Web UI 需求**:
- 构建配置编辑器
- 一键构建按钮
- 构建日志查看
- 构建产物预览

---

### 2. **Changelog** (`tools/changelog/`)
**功能**: 变更日志生成
- 自动生成 CHANGELOG.md
- 基于 Git 提交历史
- 支持多种格式（Conventional Commits）
- 版本管理

**Web UI 需求**:
- 变更日志查看器
- 版本历史时间线
- 生成变更日志按钮
- 变更日志编辑器

---

### 3. **CLI** (`tools/cli/`)
**功能**: 命令行工具
- 集成所有工具的 CLI 接口
- UI 命令（启动 Server + Web）
- 项目管理命令

**Web UI 需求**:
- 不需要单独的 UI（已经是 CLI 工具）

---

### 4. **Deployer** (`tools/deployer/`)
**功能**: 部署工具
- 支持多种部署目标（Vercel, Netlify, Docker 等）
- 部署配置管理
- 部署历史记录
- 回滚功能

**Web UI 需求**:
- 部署配置编辑器
- 一键部署按钮
- 部署历史查看
- 部署状态监控
- 回滚操作

---

### 5. **Deps** (`tools/deps/`)
**功能**: 依赖分析工具
- 依赖树可视化
- 依赖更新检查
- 安全漏洞扫描
- 依赖大小分析

**Web UI 需求**:
- 依赖树可视化图表
- 依赖更新列表
- 安全漏洞报告
- 依赖大小分析图表

---

### 6. **Docs Generator** (`tools/docs-generator/`)
**功能**: 文档生成工具
- 自动生成 API 文档
- 支持多种文档格式
- 文档模板管理
- 文档预览

**Web UI 需求**:
- 文档生成配置
- 一键生成文档按钮
- 文档预览
- 模板管理

---

### 7. **Env** (`tools/env/`)
**功能**: 环境变量管理
- 多环境配置管理
- 环境变量加密
- 配置对比
- 配置导入导出

**Web UI 需求**:
- 环境变量编辑器
- 环境切换
- 配置对比视图
- 加密/解密功能

---

### 8. **Formatter** (`tools/formatter/`)
**功能**: 代码格式化工具
- 支持多种语言
- 自定义格式化规则
- 批量格式化
- 格式化预览

**Web UI 需求**:
- 格式化配置编辑器
- 一键格式化按钮
- 格式化预览
- 格式化历史

---

### 9. **Generator** (`tools/generator/`)
**功能**: 代码生成工具
- 组件生成
- 页面生成
- API 生成
- 模板管理

**Web UI 需求**:
- 代码生成向导
- 模板选择器
- 生成预览
- 模板编辑器

---

### 10. **Git** (`tools/git/`)
**功能**: Git 操作工具
- Git 状态查看
- 提交历史
- 分支管理
- 标签管理

**Web UI 需求**:
- Git 状态面板
- 提交历史时间线
- 分支可视化
- 快捷操作按钮

---

### 11. **Kit** (`tools/kit/`)
**功能**: 工具集合
- 通用工具函数
- 网络工具
- 文件工具
- 测试工具

**Web UI 需求**:
- 工具箱面板
- 常用工具快捷入口

---

### 12. **Launcher** (`tools/launcher/`)
**功能**: 项目启动器
- 开发服务器启动
- 多项目并行启动
- 端口管理
- 进程管理

**Web UI 需求**:
- 启动配置编辑器
- 一键启动按钮
- 进程监控
- 日志查看

---

### 13. **Mock** (`tools/mock/`)
**功能**: Mock 数据服务
- Mock API 服务器
- 数据模板管理
- 场景切换
- 请求拦截

**Web UI 需求**:
- Mock 配置编辑器
- API 列表管理
- 场景切换器
- 请求日志查看

---

### 14. **Monitor** (`tools/monitor/`)
**功能**: 监控工具
- 性能监控
- 错误监控
- 日志收集
- 告警管理

**Web UI 需求**:
- 监控仪表板
- 性能图表
- 错误日志查看
- 告警配置

---

### 15. **Performance** (`tools/performance/`)
**功能**: 性能分析工具
- 性能测试
- 性能报告
- 性能优化建议
- 性能对比

**Web UI 需求**:
- 性能测试配置
- 性能报告查看
- 性能图表
- 优化建议列表

---

### 16. **Publisher** (`tools/publisher/`)
**功能**: 发布工具
- NPM 发布
- 版本管理
- 发布历史
- 发布检查

**Web UI 需求**:
- 发布配置编辑器
- 一键发布按钮
- 发布历史查看
- 发布检查列表

---

### 17. **Security** (`tools/security/`)
**功能**: 安全扫描工具
- 安全漏洞扫描
- 代码安全检查
- 依赖安全分析
- 安全报告

**Web UI 需求**:
- 安全扫描按钮
- 安全报告查看
- 漏洞详情
- 修复建议

---

### 18. **Server** (`tools/server/`)
**功能**: API 服务器
- 提供所有工具的 API 接口
- WebSocket 支持
- 数据库管理
- 文件管理

**Web UI 需求**:
- 不需要单独的 UI（已经是后端服务）

---

### 19. **Shared** (`tools/shared/`)
**功能**: 共享代码
- 通用类型定义
- 通用工具函数
- 通用常量

**Web UI 需求**:
- 不需要单独的 UI（共享库）

---

### 20. **Testing** (`tools/testing/`)
**功能**: 测试工具
- 单元测试
- 集成测试
- E2E 测试
- 测试覆盖率

**Web UI 需求**:
- 测试配置编辑器
- 一键运行测试按钮
- 测试结果查看
- 覆盖率报告

---

### 21. **Translator** (`tools/translator/`)
**功能**: 国际化翻译工具
- 翻译文件管理
- 自动翻译
- 翻译对比
- 翻译导入导出

**Web UI 需求**:
- 翻译编辑器
- 语言切换
- 自动翻译按钮
- 翻译对比视图

---

### 22. **Web** (`tools/web/`)
**功能**: Web 管理界面
- 项目管理 UI
- 工具集成 UI
- 仪表板

**Web UI 需求**:
- 这就是我们要重构的项目

---

## 🎯 Web UI 设计方案

### 核心流程

```
1. 导入项目
   ↓
2. 项目列表
   ↓
3. 选择项目 → 进入项目详情
   ↓
4. 项目详情页（工具入口）
   ├── Builder（构建）
   ├── Deployer（部署）
   ├── Testing（测试）
   ├── Generator（代码生成）
   ├── Formatter（格式化）
   ├── Docs Generator（文档生成）
   ├── Changelog（变更日志）
   ├── Git（Git 操作）
   ├── Deps（依赖分析）
   ├── Env（环境变量）
   ├── Monitor（监控）
   ├── Performance（性能分析）
   ├── Security（安全扫描）
   ├── Publisher（发布）
   ├── Translator（翻译）
   ├── Mock（Mock 服务）
   └── Launcher（启动器）
```

### 页面结构

1. **仪表板** (`/`)
   - 项目统计
   - 快捷操作
   - 最近项目

2. **项目列表** (`/projects`)
   - 项目卡片列表
   - 导入项目按钮
   - 搜索和筛选

3. **项目详情** (`/projects/:id`)
   - 项目基本信息
   - 工具功能入口（卡片式布局）
   - 快捷操作

4. **工具功能页** (`/projects/:id/:tool`)
   - 每个工具的专属功能页面
   - 统一的布局和交互

---

## 📝 实施优先级

### P0 - 核心功能（必须实现）
1. ✅ 项目导入（目录选择器）
2. ✅ 项目列表
3. ✅ 项目详情
4. ✅ Builder 集成
5. ✅ Git 集成
6. ✅ Testing 集成

### P1 - 重要功能（优先实现）
1. Deployer 集成
2. Deps 集成
3. Monitor 集成
4. Generator 集成

### P2 - 增强功能（后续实现）
1. Formatter 集成
2. Docs Generator 集成
3. Changelog 集成
4. Env 集成
5. Performance 集成
6. Security 集成
7. Publisher 集成
8. Translator 集成
9. Mock 集成
10. Launcher 集成

---

## 🔧 技术实现

### 后端 API 设计

所有工具功能都需要对应的后端 API 接口：

```typescript
// 项目管理
GET    /api/projects              // 获取项目列表
POST   /api/projects/import       // 导入项目
GET    /api/projects/:id          // 获取项目详情
PUT    /api/projects/:id          // 更新项目
DELETE /api/projects/:id          // 删除项目

// 目录选择器
POST   /api/files/select-directory  // 打开目录选择器

// 工具功能（以 Builder 为例）
GET    /api/projects/:id/builder/config    // 获取构建配置
POST   /api/projects/:id/builder/build     // 执行构建
GET    /api/projects/:id/builder/logs      // 获取构建日志
```

### 前端组件设计

```
src/
├── views/
│   ├── Dashboard.vue           // 仪表板
│   ├── Projects.vue            // 项目列表
│   ├── ProjectDetail.vue       // 项目详情
│   └── project/                // 项目工具页面
│       ├── Builder.vue
│       ├── Deployer.vue
│       ├── Testing.vue
│       └── ...
├── components/
│   ├── ProjectCard.vue         // 项目卡片
│   ├── ToolCard.vue            // 工具卡片
│   ├── DirectoryPicker.vue     // 目录选择器
│   └── ...
└── api/
    ├── projects.ts             // 项目 API
    ├── builder.ts              // Builder API
    └── ...
```

---

## 🎨 UI/UX 设计原则

1. **简洁直观**: 清晰的导航和操作流程
2. **响应式**: 支持不同屏幕尺寸
3. **实时反馈**: 操作结果即时显示
4. **错误处理**: 友好的错误提示
5. **性能优化**: 快速加载和响应

---

## 📚 下一步

1. ✅ 分析完成
2. 设计项目管理 API
3. 实现目录选择器
4. 重构前端页面
5. 集成工具功能

