# Grid Examples 自动化测试指南

本指南说明如何启动和测试 Grid 库的三个示例项目（Vue、React、Vanilla）。

## 📋 目录

- [快速开始](#快速开始)
- [方式一：PowerShell 自动化脚本](#方式一powershell-自动化脚本)
- [方式二：Node.js + Playwright 脚本](#方式二nodejs--playwright-脚本)
- [方式三：手动启动](#方式三手动启动)
- [测试检查清单](#测试检查清单)
- [MCP Playwright 集成](#mcp-playwright-集成)

## 🚀 快速开始

### 前置要求

```bash
# 1. 确保已安装依赖
pnpm install

# 2. 构建 Grid 库
pnpm build

# 3. 为示例项目安装依赖
cd examples/vue-demo && pnpm install && cd ../..
cd examples/react-demo && pnpm install && cd ../..
cd examples/vanilla-demo && pnpm install && cd ../..
```

## 方式一：PowerShell 自动化脚本

### 使用方法

```powershell
# 在 library/grid 目录下执行
.\test-examples.ps1
```

### 功能特性

✅ 自动检查并清理端口占用  
✅ 同时启动三个示例项目  
✅ 自动打开浏览器访问所有示例  
✅ 实时显示服务器日志  
✅ 支持 Ctrl+C 清理所有进程  

### 端口配置

- Vue Demo: `http://localhost:5173`
- React Demo: `http://localhost:5174`
- Vanilla Demo: `http://localhost:5175`

## 方式二：Node.js + Playwright 脚本

### 安装 Playwright

```bash
# 安装 Playwright
pnpm add -D playwright

# 安装浏览器驱动
npx playwright install chromium
```

### 使用方法

```bash
# 在 library/grid 目录下执行
node test-examples.mjs
```

### 功能特性

✅ 自动启动所有示例项目  
✅ 使用 Playwright 自动化浏览器  
✅ 自动截图（桌面端和移动端）  
✅ 自动测试拖拽功能  
✅ 检查控制台错误  
✅ 生成详细测试报告  

### 生成的文件

测试完成后会在 `screenshots/` 目录生成以下截图：

- `Vue-Demo.png` - Vue 示例桌面版截图
- `Vue-Demo-mobile.png` - Vue 示例移动版截图
- `React-Demo.png` - React 示例桌面版截图
- `React-Demo-mobile.png` - React 示例移动版截图
- `Vanilla-Demo.png` - Vanilla 示例桌面版截图
- `Vanilla-Demo-mobile.png` - Vanilla 示例移动版截图

## 方式三：手动启动

如果你想手动控制每个示例项目，可以分别在不同的终端窗口中启动：

### 终端 1 - Vue Demo

```bash
cd examples/vue-demo
pnpm dev --port 5173
```

### 终端 2 - React Demo

```bash
cd examples/react-demo
pnpm dev --port 5174
```

### 终端 3 - Vanilla Demo

```bash
cd examples/vanilla-demo
pnpm dev --port 5175
```

然后手动在浏览器中打开以下 URL：

- http://localhost:5173 (Vue)
- http://localhost:5174 (React)
- http://localhost:5175 (Vanilla)

## 📝 测试检查清单

在浏览器中打开每个示例后，请按以下清单进行测试：

### 基本功能

- [ ] Grid 容器正常渲染
- [ ] Grid 项目正常显示
- [ ] 页面无控制台错误
- [ ] 样式正常加载

### 拖拽功能

- [ ] 可以拖动 Grid 项目
- [ ] 拖动时有视觉反馈
- [ ] 拖动后位置正确保存
- [ ] 拖动不会破坏布局

### 调整大小

- [ ] 可以调整 Grid 项目大小
- [ ] 调整时有视觉反馈
- [ ] 调整后大小正确保存
- [ ] 调整不会影响其他项目

### 响应式布局

- [ ] 桌面端布局正常（> 1024px）
- [ ] 平板端布局正常（768px - 1024px）
- [ ] 移动端布局正常（< 768px）
- [ ] 窗口调整时布局自动适配

### 性能测试

- [ ] 页面加载速度正常
- [ ] 拖拽流畅无卡顿
- [ ] 没有内存泄漏
- [ ] CPU 占用合理

### 框架特定测试

#### Vue Demo
- [ ] 响应式数据更新正常
- [ ] 组件生命周期正常
- [ ] 事件绑定正常

#### React Demo
- [ ] 状态管理正常
- [ ] Hooks 使用正常
- [ ] 组件重渲染优化正常

#### Vanilla Demo
- [ ] 原生 API 调用正常
- [ ] 事件处理正常
- [ ] DOM 操作正常

## 🤖 MCP Playwright 集成

本项目已配置 MCP Playwright 服务器，可以通过 MCP 协议进行自动化测试。

### MCP 配置文件

位置：`D:\WorkBench\ldesign\mcp\playwright.json`

```json
{
  "mcpServers": {
    "Playwright": {
      "command": "npx",
      "args": [
        "-y",
        "@executeautomation/playwright-mcp-server"
      ],
      "env": {}
    }
  }
}
```

### 使用 MCP 进行测试

如果你使用支持 MCP 的 AI 助手（如 Claude Desktop），可以直接请求：

> "使用 Playwright MCP 打开 http://localhost:5173、http://localhost:5174 和 http://localhost:5175，并测试 Grid 功能"

MCP 服务器将自动：

1. 启动浏览器
2. 访问指定 URL
3. 执行自动化测试
4. 生成测试报告

## 🐛 常见问题

### 问题：端口已被占用

**解决方案：**
```powershell
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process

# 或使用我们的脚本，会自动清理端口
.\test-examples.ps1
```

### 问题：依赖安装失败

**解决方案：**
```bash
# 清理并重新安装
pnpm clean
pnpm install
```

### 问题：Playwright 浏览器未安装

**解决方案：**
```bash
npx playwright install chromium
```

### 问题：Grid 不显示

**检查项：**
1. 确保 Grid 库已构建：`pnpm build`
2. 检查控制台是否有错误
3. 确认样式文件已加载
4. 清除浏览器缓存

## 📊 性能基准

预期性能指标：

- **页面加载时间**: < 1s
- **首次渲染时间**: < 500ms
- **拖拽响应时间**: < 16ms (60fps)
- **内存占用**: < 50MB
- **CPU 占用**: < 10% (空闲时)

## 🔗 相关链接

- [Grid 库文档](./docs/index.md)
- [GridStack 官方文档](https://gridstackjs.com/)
- [Playwright 文档](https://playwright.dev/)
- [MCP 协议文档](https://modelcontextprotocol.io/)

## 📄 许可证

MIT License
