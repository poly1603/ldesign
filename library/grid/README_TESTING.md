# Grid Examples - 自动化测试套件

> 一键启动三个示例项目（Vue、React、Vanilla），自动打开浏览器并进行功能验证

## 🎯 目标

确保 Grid 库的三个示例项目（Vue、React、Vanilla）启动后：
1. ✅ 自动在浏览器中打开
2. ✅ 所有功能正常工作
3. ✅ 无控制台错误
4. ✅ 响应式布局正常

## ⚡ 快速开始（推荐）

```powershell
# 在 library/grid 目录下执行
.\quick-start.ps1
```

这将：
1. 在三个独立窗口启动开发服务器
2. 等待服务器就绪
3. 自动在浏览器中打开三个标签页访问：
   - http://localhost:5173 (Vue Demo)
   - http://localhost:5174 (React Demo)
   - http://localhost:5175 (Vanilla Demo)

## 📦 可用的脚本

### 1. 快速启动（最简单）
```powershell
.\quick-start.ps1
```
- ✅ 最快速的方式
- ✅ 适合日常开发测试
- ✅ 独立窗口易于管理

### 2. 完整测试（带监控）
```powershell
.\test-examples.ps1
```
- ✅ 自动检查端口占用
- ✅ 实时显示服务器日志
- ✅ 优雅的退出处理

### 3. 自动化测试（最全面）
```bash
# 首次需要安装 Playwright
pnpm add -D playwright
npx playwright install chromium

# 运行自动化测试
pnpm test:examples
```
- ✅ 完全自动化
- ✅ 自动截图
- ✅ 测试拖拽功能
- ✅ 测试响应式布局
- ✅ 生成详细报告

### 4. npm 脚本方式
```bash
# PowerShell 方式
pnpm test:examples:ps

# Node.js + Playwright 方式
pnpm test:examples

# 安装所有示例依赖
pnpm test:examples:install
```

## 📁 创建的文件

```
library/grid/
├── quick-start.ps1           # 快速启动脚本
├── test-examples.ps1         # 完整测试脚本
├── test-examples.mjs         # Playwright 自动化测试
├── TEST_GUIDE.md            # 完整测试指南
├── TESTING_SUMMARY.md       # 测试总结
├── README_TESTING.md        # 本文档
└── examples/
    ├── README.md            # 示例说明
    ├── vue-demo/            # Vue 示例
    ├── react-demo/          # React 示例
    └── vanilla-demo/        # Vanilla JS 示例
```

## 🧪 测试内容

### 自动验证项目
- ✅ 服务器启动
- ✅ 页面访问
- ✅ Grid 容器渲染
- ✅ Grid 项目显示
- ✅ 拖拽功能（自动化测试）
- ✅ 响应式布局（自动化测试）
- ✅ 控制台错误检测（自动化测试）

### 手动验证项目
- 拖拽流畅度
- 调整大小功能
- 视觉效果
- 性能表现

## 🤖 MCP Playwright 集成

本项目已配置 MCP Playwright 服务器（`D:\WorkBench\ldesign\mcp\playwright.json`），支持通过 MCP 协议进行自动化测试。

### 使用方式

1. 启动服务器（使用上述任一脚本）
2. 向支持 MCP 的 AI 助手（如 Claude Desktop）请求：

```
使用 Playwright MCP 测试 Grid 示例：
- http://localhost:5173 (Vue)
- http://localhost:5174 (React)
- http://localhost:5175 (Vanilla)

验证：Grid 渲染、拖拽功能、响应式布局
```

## 📊 测试覆盖范围

| 测试类型 | quick-start | test-examples | test-examples.mjs |
|---------|-------------|---------------|-------------------|
| 启动服务器 | ✅ | ✅ | ✅ |
| 打开浏览器 | ✅ | ✅ | ✅ |
| 端口检查 | ❌ | ✅ | ✅ |
| 日志输出 | ❌ | ✅ | ✅ |
| 自动截图 | ❌ | ❌ | ✅ |
| 拖拽测试 | ❌ | ❌ | ✅ |
| 响应式测试 | ❌ | ❌ | ✅ |
| 错误检测 | ❌ | ❌ | ✅ |
| 测试报告 | ❌ | ❌ | ✅ |

## 🎬 使用演示

### 场景 1：日常开发测试

```powershell
# 1. 快速启动
.\quick-start.ps1

# 2. 在浏览器中手动测试功能
# 3. 关闭 PowerShell 窗口停止服务器
```

### 场景 2：完整功能验证

```powershell
# 1. 启动带监控的测试
.\test-examples.ps1

# 2. 查看实时日志
# 3. 在浏览器中测试
# 4. 按 Ctrl+C 退出
```

### 场景 3：自动化回归测试

```bash
# 1. 运行自动化测试
pnpm test:examples

# 2. 等待测试完成（约 2-3 分钟）
# 3. 查看测试报告
# 4. 检查 screenshots/ 目录中的截图
```

## 🔧 常见问题

### Q: PowerShell 脚本无法执行？
A: 运行 `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process` 后再试

### Q: 端口被占用？
A: `test-examples.ps1` 会自动清理，或手动清理：
```powershell
Get-NetTCPConnection -LocalPort 5173,5174,5175 | % {
    Stop-Process -Id $_.OwningProcess -Force
}
```

### Q: 浏览器没有自动打开？
A: 等待更长时间或手动访问 URL

### Q: Grid 不显示？
A: 确保先构建 Grid 库：`pnpm build`

## 📚 详细文档

- [TEST_GUIDE.md](./TEST_GUIDE.md) - 完整测试指南
- [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) - 测试总结和报告示例
- [examples/README.md](./examples/README.md) - 示例项目说明

## ✨ 特点

1. **零配置** - 开箱即用
2. **多种方式** - 适应不同需求
3. **自动化** - 减少人工操作
4. **MCP 集成** - AI 助手支持
5. **详细文档** - 清晰的使用说明

## 🎯 执行建议

**首次使用**:
1. 安装依赖: `pnpm test:examples:install`
2. 快速测试: `.\quick-start.ps1`
3. 手动验证功能

**日常开发**:
- 使用 `.\quick-start.ps1` 快速启动

**发布前验证**:
1. 安装 Playwright: `pnpm add -D playwright && npx playwright install chromium`
2. 运行完整测试: `pnpm test:examples`
3. 检查测试报告和截图

## 📄 许可证

MIT License

---

**现在就开始！** 运行 `.\quick-start.ps1` 立即测试所有示例 🚀
