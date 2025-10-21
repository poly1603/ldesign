# @ldesign/launcher 更新日志

## v1.0.1 - 2025-09-05

### 🚀 新功能

#### 日志系统优化
- **简洁模式**：新增 `compact` 模式，提供更清晰的日志输出
- **智能图标**：使用直观的图标替代传统的日志级别标识
  - ℹ️ 信息提示
  - ⚠️ 警告信息  
  - ❌ 错误信息
  - 🔍 调试信息
- **级别控制**：支持通过 `--debug` 和 `--silent` 参数控制日志详细程度

#### 配置文件加载优化
- **TypeScript 支持增强**：改进 `.ts` 配置文件的动态加载机制
- **错误降级处理**：配置加载失败时自动使用默认配置，确保项目正常运行
- **友好错误提示**：提供清晰的错误信息和解决建议

### 🐛 问题修复

#### 配置文件问题
- 修复 TypeScript 配置文件加载时的 "Cannot convert undefined or null to object" 错误
- 修复 "Dynamic require of fs is not supported" 错误
- 改进 jiti 加载器配置，增加 `esmResolve` 支持

#### 日志输出问题
- 移除冗余的 JSON 对象输出，减少控制台噪音
- 优化关键信息显示，只保留用户关心的数据（URL、端口、构建时间等）
- 修复日志格式不一致的问题

### 📈 性能优化

- **日志性能**：简洁模式下减少字符串处理和格式化开销
- **配置加载**：优化配置文件解析流程，减少不必要的重复加载
- **错误处理**：改进错误捕获和处理机制，避免程序崩溃

### 🔧 开发体验改进

#### 普通模式输出示例
```
ℹ️  正在启动开发服务器...
ℹ️  检测到 Vue 3 项目
ℹ️  智能插件加载完成 {"count":1}
ℹ️  开发服务器启动成功 {"url":"http://localhost:3000/","duration":207}
```

#### Debug 模式输出示例
```
[2025-09-05T02:46:43.626Z] [ViteLauncher] [DEBUG] ViteLauncher 基础初始化完成
[2025-09-05T02:46:43.633Z] [SmartPluginManager] [DEBUG] 正在检测项目类型...
[2025-09-05T02:46:43.634Z] [SmartPluginManager] [INFO ] 检测到 Vue 3 项目
[2025-09-05T02:46:43.635Z] [SmartPluginManager] [DEBUG] 正在加载推荐插件...
```

### 🛠️ 技术改进

#### Logger 类增强
- 新增 `compact` 属性控制输出模式
- 新增 `shouldShowData()` 方法智能过滤显示数据
- 新增 `formatCompactData()` 方法格式化关键信息
- 新增 `setCompact()` 和 `getCompact()` 方法

#### ConfigManager 增强
- 改进 TypeScript 文件加载逻辑
- 增加配置验证和降级处理
- 优化错误信息和建议提示

#### CLI 命令优化
- 自动检测 `--debug` 和 `--silent` 参数
- 根据环境变量智能设置日志级别
- 统一各命令的日志配置

### 📋 使用说明

#### 日志级别控制
```bash
# 普通模式（简洁输出）
pnpm launcher dev

# Debug 模式（详细输出）
pnpm launcher dev --debug

# 静默模式（最少输出）
pnpm launcher dev --silent
```

#### 配置文件支持
- 支持 `launcher.config.js`（推荐）
- 支持 `launcher.config.ts`（实验性）
- 配置加载失败时自动降级到默认配置

### 🔄 兼容性

- ✅ 向后兼容现有配置文件
- ✅ 保持 API 接口不变
- ✅ 支持所有现有命令和参数
- ✅ 兼容 Vue 2/3、React、Svelte 项目

### 📝 注意事项

1. **TypeScript 配置文件**：建议使用 `.js` 格式以获得更好的兼容性
2. **Debug 模式**：会显示详细的内部状态，适合开发调试使用
3. **简洁模式**：默认启用，提供最佳的用户体验

---

## 下一步计划

- [ ] 进一步优化 TypeScript 配置文件支持
- [ ] 添加配置文件模板生成功能
- [ ] 增加更多自定义日志格式选项
- [ ] 支持日志输出到文件
