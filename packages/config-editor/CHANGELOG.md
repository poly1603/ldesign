# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-18

### Added

#### 🎯 核心功能
- **可视化配置编辑器** - 支持 launcher.config.ts、app.config.ts 和 package.json 的可视化编辑
- **前后端分离架构** - Vue 3 前端 + Express 后端的现代化架构
- **实时预览功能** - 配置修改实时反映到 JSON 预览区域
- **智能配置验证** - 内置配置验证和错误提示系统

#### 🖥️ 用户界面
- **现代化 UI** - 基于 Vue 3 Composition API 的响应式界面
- **LDESIGN 设计系统** - 完整的紫色主题设计系统集成
- **响应式布局** - 适配桌面和移动端的响应式设计
- **直观的导航** - 清晰的页面导航和配置文件切换

#### 🔧 技术特性
- **TypeScript 支持** - 完整的类型定义，无 any 类型
- **ESM 模块系统** - 使用现代 ES 模块语法
- **热重载开发** - 开发模式支持前后端热重载
- **配置文件自动发现** - 自动扫描和识别项目中的配置文件

#### 🛠️ 开发工具
- **CLI 工具** - 提供 `config-editor ui` 和 `config-editor dev` 命令
- **多种启动模式** - 支持生产模式和开发模式
- **端口和主机配置** - 支持自定义端口和主机地址
- **自动打开浏览器** - 启动时自动打开默认浏览器

#### 📦 配置解析器
- **LauncherConfigParser** - 解析 @ldesign/launcher 配置文件
- **AppConfigParser** - 解析应用程序配置文件
- **PackageJsonParser** - 解析 NPM 包配置文件
- **多格式支持** - 支持 .ts、.js、.mjs、.json 等格式

#### 🌐 API 服务
- **RESTful API** - 完整的配置文件 CRUD 操作接口
- **健康检查** - 服务器状态检查接口
- **工作目录管理** - 工作目录信息和文件列表接口
- **配置验证** - 配置文件验证接口

#### 🎨 样式系统
- **CSS 变量系统** - 基于 CSS 变量的主题系统
- **Less 预处理器** - 使用 Less 编写样式
- **组件化样式** - 可复用的样式组件和混入
- **设计令牌** - 完整的设计令牌系统

#### 🧪 测试框架
- **Vitest 测试** - 基于 Vitest 的单元测试框架
- **CLI 测试** - 命令行工具功能测试
- **API 测试** - 后端接口功能测试
- **类型检查** - TypeScript 类型检查集成

#### 📚 文档系统
- **完整的 README** - 详细的使用文档和 API 文档
- **代码注释** - 完整的 JSDoc 注释
- **类型文档** - 详细的 TypeScript 类型定义
- **使用示例** - 丰富的代码示例

#### 🔄 状态管理
- **Pinia 集成** - 使用 Pinia 进行状态管理
- **响应式配置** - 配置变更的响应式处理
- **服务器连接状态** - 前后端连接状态管理
- **错误处理** - 完善的错误处理和用户反馈

#### 🚀 构建系统
- **Vite 构建** - 使用 Vite 进行前端构建
- **tsup 打包** - 使用 tsup 进行库文件打包
- **多目标构建** - 支持 ESM 和 CJS 格式输出
- **类型声明** - 自动生成 TypeScript 类型声明文件

### Technical Details

#### 架构设计
- **前端**: Vue 3 + Vite + TypeScript + Pinia + Vue Router
- **后端**: Express + TypeScript + CORS
- **样式**: Less + LDESIGN 设计系统
- **构建**: tsup + Vite
- **测试**: Vitest
- **包管理**: pnpm

#### 文件结构
```
src/
├── components/     # Vue 组件
├── views/         # 页面组件
├── core/          # 核心功能类
├── server/        # 后端服务器
├── services/      # API 服务
├── stores/        # Pinia 状态管理
├── styles/        # LDESIGN 样式
├── types/         # TypeScript 类型
├── utils/         # 工具函数
├── constants/     # 常量定义
└── router/        # Vue Router 配置
```

#### 支持的配置格式
- TypeScript (.ts)
- JavaScript (.js, .mjs)
- JSON (.json)
- 未来计划支持 YAML (.yaml, .yml)

### Performance
- **快速启动** - 优化的启动时间
- **实时更新** - 配置变更的实时反映
- **内存优化** - 高效的内存使用
- **网络优化** - 优化的 API 请求

### Security
- **类型安全** - 完整的 TypeScript 类型检查
- **输入验证** - 配置输入的验证和清理
- **CORS 配置** - 安全的跨域资源共享配置
- **错误处理** - 安全的错误信息处理

### Compatibility
- **Node.js** - 支持 Node.js 16+
- **浏览器** - 支持现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)
- **操作系统** - 支持 Windows、macOS、Linux

### Known Issues
- CLI 测试在某些环境下可能需要安装 tsx
- API 测试需要后端服务器运行才能完全通过
- 某些配置文件格式的解析可能需要进一步优化

### Migration Guide
这是首个版本，无需迁移。

### Contributors
- LDesign Team

---

## [Unreleased]

### Planned Features
- VitePress 文档站点
- 更多配置文件格式支持
- 配置文件模板系统
- 批量配置操作
- 配置历史记录
- 插件系统
- 国际化支持
