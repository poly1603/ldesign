# Grid Library Examples

本目录包含三个完整的示例项目，展示如何在不同框架中使用 Grid 库。

## 📁 示例项目

### 1. Vue Demo (`vue-demo/`)
- **框架**: Vue 3 + Composition API
- **端口**: 5173
- **特性**: 
  - 响应式数据绑定
  - Vue 组件封装
  - 生命周期钩子集成

### 2. React Demo (`react-demo/`)
- **框架**: React 18 + Hooks
- **端口**: 5174
- **特性**:
  - React Hooks 集成
  - 状态管理
  - 组件优化

### 3. Vanilla Demo (`vanilla-demo/`)
- **框架**: 原生 JavaScript + TypeScript
- **端口**: 5175
- **特性**:
  - 纯 JavaScript API
  - TypeScript 类型支持
  - 无框架依赖

## 🚀 快速启动

### 方法一：使用快速启动脚本（推荐）

```powershell
# 在 library/grid 目录下执行
.\quick-start.ps1
```

此脚本会：
1. 在三个独立的 PowerShell 窗口中启动服务器
2. 等待 10 秒确保服务器启动
3. 自动在浏览器中打开三个标签页

### 方法二：使用 npm 脚本

```bash
# 在 library/grid 目录下
pnpm test:examples:ps    # Windows PowerShell
# 或
pnpm test:examples        # Node.js + Playwright (需要先安装 playwright)
```

### 方法三：手动启动

分别在三个终端中运行：

```bash
# 终端 1 - Vue
cd examples/vue-demo
pnpm dev --port 5173

# 终端 2 - React
cd examples/react-demo
pnpm dev --port 5174

# 终端 3 - Vanilla
cd examples/vanilla-demo
pnpm dev --port 5175
```

## 📦 安装依赖

首次运行前，需要为每个示例安装依赖：

```bash
# 方式一：一键安装所有示例依赖
pnpm test:examples:install

# 方式二：手动安装
cd vue-demo && pnpm install
cd ../react-demo && pnpm install
cd ../vanilla-demo && pnpm install
```

## 🌐 访问地址

启动后，可在浏览器中访问：

- **Vue Demo**: http://localhost:5173
- **React Demo**: http://localhost:5174
- **Vanilla Demo**: http://localhost:5175

## 🧪 自动化测试

### 使用 Playwright 自动化测试

1. 安装 Playwright:
```bash
cd ../..  # 返回 library/grid 目录
pnpm add -D playwright
npx playwright install chromium
```

2. 运行测试:
```bash
pnpm test:examples
```

测试将自动：
- 启动所有三个示例
- 打开浏览器并访问每个页面
- 截图保存到 `screenshots/` 目录
- 测试拖拽功能
- 测试响应式布局
- 检查控制台错误
- 生成详细的测试报告

### 使用 MCP Playwright

如果你使用支持 MCP 的 AI 助手，可以通过 MCP Playwright 服务器进行自动化测试。

配置文件位于: `D:\WorkBench\ldesign\mcp\playwright.json`

## 📝 功能测试清单

在浏览器中测试以下功能：

### ✅ 基本渲染
- [ ] Grid 容器正确渲染
- [ ] Grid 项正确显示
- [ ] 样式正确加载
- [ ] 无控制台错误

### ✅ 拖拽功能
- [ ] 可以拖动 Grid 项
- [ ] 拖动时有视觉反馈
- [ ] 拖动后位置正确保存
- [ ] 自动排列其他项

### ✅ 调整大小
- [ ] 可以调整 Grid 项大小
- [ ] 调整时有视觉反馈
- [ ] 调整后其他项自动适应
- [ ] 边界限制正常工作

### ✅ 响应式
- [ ] 桌面布局 (>1024px)
- [ ] 平板布局 (768px-1024px)
- [ ] 移动布局 (<768px)
- [ ] 窗口调整时自动适配

### ✅ 性能
- [ ] 页面加载快速 (<1s)
- [ ] 拖拽流畅 (60fps)
- [ ] 无内存泄漏
- [ ] CPU 占用合理

## 🛠️ 开发工具

每个示例都配置了：
- **热更新 (HMR)**: 代码修改自动刷新
- **TypeScript**: 完整的类型检查
- **Vite**: 快速的构建工具
- **ESLint**: 代码质量检查（可选）

## 📄 项目结构

```
examples/
├── vue-demo/
│   ├── src/
│   │   ├── App.vue          # 主组件
│   │   ├── main.ts          # 入口文件
│   │   └── style.css        # 样式
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── react-demo/
│   ├── src/
│   │   ├── App.tsx          # 主组件
│   │   ├── main.tsx         # 入口文件
│   │   └── index.css        # 样式
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
└── vanilla-demo/
    ├── src/
    │   ├── main.ts          # 主逻辑
    │   └── style.css        # 样式
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

## 🐛 常见问题

### 问题：端口已被占用

**解决方案:**
```powershell
# 查找并关闭占用端口的进程
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### 问题：依赖安装失败

**解决方案:**
```bash
# 清理 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 问题：Grid 不显示

**检查步骤:**
1. 确保父级 Grid 库已构建: `cd ../.. && pnpm build`
2. 清除浏览器缓存
3. 检查控制台错误
4. 确认样式文件已加载

### 问题：热更新不工作

**解决方案:**
```bash
# 重启开发服务器
# 或清理 Vite 缓存
rm -rf .vite node_modules/.vite
```

## 🔗 相关文档

- [Grid 库主文档](../README.md)
- [完整测试指南](../TEST_GUIDE.md)
- [GridStack 官方文档](https://gridstackjs.com/)
- [Vite 文档](https://vitejs.dev/)

## 💡 开发提示

1. **修改源码**: 修改 `library/grid/src/` 中的源码需要重新构建
2. **修改示例**: 修改示例代码会触发热更新，无需重启
3. **调试**: 使用浏览器开发者工具进行调试
4. **性能分析**: 使用 Chrome DevTools Performance 面板

## 📊 性能基准

预期性能指标：

| 指标 | 目标值 |
|------|--------|
| 页面加载时间 | < 1s |
| 首次渲染时间 | < 500ms |
| 拖拽响应时间 | < 16ms (60fps) |
| 内存占用 | < 50MB |
| CPU 占用 (空闲) | < 10% |

## 🤝 贡献

如果你发现问题或想要改进示例：

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 发起 Pull Request

## 📄 许可证

MIT License
