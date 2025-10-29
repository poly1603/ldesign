# LDesign Tools 重构说明

## 📦 新的包结构

重构后,tools 目录下的包结构更加清晰:

```
tools/
├── cli/           # @ldesign/cli - 统一的命令行入口
├── server/        # @ldesign/server - Express后端API服务
├── web/           # @ldesign/web - Vue3前端管理界面
├── shared/        # @ldesign/shared - 共享代码和类型
├── builder/       # @ldesign/builder - 构建工具
├── launcher/      # @ldesign/launcher - 启动器
├── deployer/      # @ldesign/deployer - 部署工具
├── generator/     # @ldesign/generator - 代码生成器
├── testing/       # @ldesign/testing - 测试工具
├── git/           # @ldesign/git - Git操作工具
├── security/      # @ldesign/security - 安全扫描
├── monitor/       # @ldesign/monitor - 性能监控
├── deps/          # @ldesign/deps - 依赖管理
├── docs-generator/# @ldesign/docs-generator - 文档生成
├── formatter/     # @ldesign/formatter - 代码格式化
├── changelog/     # @ldesign/changelog - 变更日志
├── publisher/     # @ldesign/publisher - 发布工具
├── performance/   # @ldesign/performance - 性能分析
├── translator/    # @ldesign/translator - 国际化翻译
├── mock/          # @ldesign/mock - Mock数据
├── env/           # @ldesign/env - 环境配置
├── kit/           # @ldesign/kit - 工具集
└── docs/          # @ldesign/docs - 文档工具
```

## 🎯 重构目标

### 1. **@ldesign/cli** - 统一命令行入口
- 作为唯一的全局安装包
- 集成所有tools包的功能
- 提供统一的命令接口
- 用户只需: `npm install -g @ldesign/cli`

### 2. **@ldesign/server** - 独立后端服务
- Express后端API服务
- 封装所有tools包的API接口
- 可独立使用或被cli调用
- 提供REST API和WebSocket

### 3. **@ldesign/web** - 独立前端项目
- Vue3 + Vite + Naive UI
- 现代化的管理界面
- 通过API与server通信
- 可独立开发和部署

### 4. **@ldesign/shared** - 共享代码库
- 类型定义
- 工具函数
- 常量定义
- 被cli/server/web共同使用

## 🔄 依赖关系

```
@ldesign/cli
  ├─> @ldesign/server
  ├─> @ldesign/web
  ├─> @ldesign/shared
  └─> 所有其他 tools 包 (builder, launcher, deployer, ...)

@ldesign/server
  ├─> @ldesign/shared
  └─> 所有其他 tools 包

@ldesign/web
  └─> 仅通过 HTTP/WebSocket 与 server 通信

@ldesign/shared
  └─> 无依赖 (基础包)
```

## 📝 可用命令

安装 CLI 后,可使用以下命令:

```bash
# 安装
npm install -g @ldesign/cli

# UI 管理界面
ldesign ui                    # 启动可视化界面
ldesign ui --port 8080        # 指定端口
ldesign ui --no-open          # 不自动打开浏览器

# 构建相关
ldesign build                 # 构建项目
ldesign build --mode dev      # 开发模式构建
ldesign build --watch         # 监听模式
ldesign build --analyze       # 打包分析

# 开发相关
ldesign dev                   # 启动开发服务器
ldesign dev --port 3000       # 指定端口
ldesign dev --open            # 自动打开浏览器

# 测试相关
ldesign test                  # 运行测试
ldesign test --watch          # 监听模式
ldesign test --coverage       # 生成覆盖率报告

# 部署相关
ldesign deploy                # 部署到生产环境
ldesign deploy --env staging  # 部署到staging环境
ldesign deploy --dry-run      # 模拟运行

# 代码生成
ldesign gen component Button  # 生成组件
ldesign gen page Dashboard    # 生成页面
ldesign g api UserService     # 生成API (简写)

# 更多命令正在开发中...
```

## 🚀 开发指南

### 开发 CLI
```bash
cd tools/cli
pnpm install
pnpm build
```

### 开发 Server
```bash
cd tools/server
pnpm install
pnpm dev
```

### 开发 Web
```bash
cd tools/web
pnpm install
pnpm dev
```

### 开发 Shared
```bash
cd tools/shared
pnpm install
pnpm build
```

## 📊 重构对比

### 重构前
```
tools/cli/
└── packages/
    ├── cli/          # CLI包
    ├── server/       # 后端服务
    ├── web-ui/       # 前端界面
    └── shared/       # 共享代码
```

### 重构后
```
tools/
├── cli/              # @ldesign/cli
├── server/           # @ldesign/server
├── web/              # @ldesign/web
├── shared/           # @ldesign/shared
└── [其他tools包]/
```

## ✅ 重构优势

1. **架构更清晰** - 前后端完全解耦,职责明确
2. **独立使用** - server和web可作为独立包使用
3. **统一入口** - cli作为唯一的全局安装包
4. **易于扩展** - 添加新工具只需在cli中注册命令
5. **开发友好** - 前后端可独立开发和调试
6. **用户体验** - 只需安装cli一个包即可使用所有功能

## 📅 迁移步骤

如果你在重构前已经安装了旧版本,请按以下步骤迁移:

1. **卸载旧包**
   ```bash
   npm uninstall -g @ldesign/cli
   ```

2. **更新依赖**
   ```bash
   cd /path/to/ldesign
   pnpm install
   ```

3. **构建新包**
   ```bash
   # 构建所有包
   pnpm -r --filter './tools/*' build
   ```

4. **全局安装CLI**
   ```bash
   cd tools/cli
   npm link
   # 或者
   pnpm add -g @ldesign/cli
   ```

5. **验证安装**
   ```bash
   ldesign --version
   ldesign --help
   ```

## 🐛 问题排查

### 依赖问题
```bash
# 清理并重新安装
pnpm -r exec rimraf node_modules
rm -rf node_modules
pnpm install
```

### 构建问题
```bash
# 清理构建产物
pnpm -r --filter './tools/*' clean
# 重新构建
pnpm -r --filter './tools/*' build
```

### 包链接问题
```bash
# 重新链接
cd tools/cli
npm unlink
npm link
```

## 📮 反馈

如有问题或建议,请提交 Issue 或 PR。

---

**重构完成日期**: 2025-10-28  
**负责人**: LDesign Team
