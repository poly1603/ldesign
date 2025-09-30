# CLI 问题修复总结

## 修复日期
2025-09-30

## 修复的问题

### 1. ✅ 项目类型识别问题

**问题描述**：
- `@ldesign/api` 项目被错误识别为"项目+库"（both）
- 实际上应该只识别为"库"（library）
- 原因：旧的识别逻辑仅基于 package.json 字段判断，api 项目有 `scripts.dev`，导致被识别为项目

**解决方案**：
- 优化 `detectProjectType` 函数，优先使用依赖判断
- 检查是否有 `@ldesign/builder`（表示库）或 `@ldesign/launcher`（表示项目）
- 只有在没有这些依赖时，才回退到基于 package.json 字段的判断

**修改文件**：
- `packages/cli/src/server/database/projects.ts`

**测试结果**：
- ✅ `@ldesign/api` 现在正确识别为"库"
- ✅ 项目详情页面只显示库相关操作（打包、发布、测试）
- ✅ 不显示项目相关操作（开发、预览、部署）

---

### 2. ✅ WebSocket 连接问题

**问题描述**：
- Dev 模式下 WebSocket 无法连接
- 原因：前端硬编码连接到 3000 端口，但如果 3000 被占用，服务器会使用其他端口

**解决方案**：
- 修改 WebSocket 连接逻辑，先从 API 获取实际端口
- 在开发模式下，调用 `/api/config` 获取服务器实际使用的端口
- 然后使用获取到的端口连接 WebSocket

**修改文件**：
- `packages/cli/src/web/src/composables/useWebSocket.ts`

**测试结果**：
- ✅ Dev 模式下 WebSocket 正常连接
- ✅ Build 模式下 WebSocket 正常连接
- ✅ 端口自动切换后仍能正常连接

---

### 3. ✅ 添加服务器配置管理

**问题描述**：
- 用户希望能配置默认端口等参数
- 没有配置持久化机制

**解决方案**：
- 创建配置管理模块 `config.ts`
- 配置保存到用户目录 `~/.ldesign-cli/config.json`
- 支持配置默认端口、主机、自动打开浏览器、调试模式等

**新增文件**：
- `packages/cli/src/server/config.ts`

**配置项**：
```typescript
interface ServerConfig {
  defaultPort: number        // 默认端口（默认 3000）
  defaultHost: string        // 默认主机（默认 localhost）
  autoOpen: boolean          // 自动打开浏览器（默认 true）
  debug: boolean             // 调试模式（默认 false）
}
```

**测试结果**：
- ✅ 配置正确保存到 `~/.ldesign-cli/config.json`
- ✅ 重启服务器后配置生效
- ✅ 配置管理器正常工作

---

### 4. ✅ 添加配置 API 接口

**问题描述**：
- 前端需要获取服务器配置信息
- 需要支持保存配置

**解决方案**：
- 添加 `GET /api/config` 接口，返回服务器配置
- 添加 `POST /api/config` 接口，保存配置
- 返回当前运行时配置（包括实际使用的端口和主机）

**修改文件**：
- `packages/cli/src/server/routes/api.ts`

**API 接口**：
```typescript
// 获取配置
GET /api/config
Response: {
  success: true,
  data: {
    defaultPort: 3000,
    defaultHost: "localhost",
    autoOpen: true,
    debug: false,
    currentPort: 3000,      // 当前实际端口
    currentHost: "localhost" // 当前实际主机
  }
}

// 保存配置
POST /api/config
Body: {
  defaultPort?: number,
  defaultHost?: string,
  autoOpen?: boolean,
  debug?: boolean
}
```

**测试结果**：
- ✅ GET 接口正常返回配置
- ✅ POST 接口正确保存配置
- ✅ 配置验证正常工作

---

### 5. ✅ 实现设置页面

**问题描述**：
- 设置页面是占位实现
- 需要实现完整的配置界面

**解决方案**：
- 实现完整的设置页面
- 支持配置默认端口、主机、自动打开浏览器、调试模式
- 显示当前运行状态（实际端口和主机）
- 支持保存和重置配置

**修改文件**：
- `packages/cli/src/web/src/views/Settings.vue`

**功能特性**：
- ✅ 表单验证（端口范围 1-65535）
- ✅ 实时显示当前运行状态
- ✅ 保存成功提示
- ✅ 重置为默认值
- ✅ 美观的 UI 设计

**测试结果**：
- ✅ 设置页面正常加载
- ✅ 配置正确显示
- ✅ 保存功能正常
- ✅ 重置功能正常

---

### 6. ✅ 修复 UI 命令使用配置

**问题描述**：
- UI 命令没有使用保存的配置
- 每次都使用硬编码的默认值

**解决方案**：
- 修改 `uiCommand` 函数，从配置管理器读取配置
- 优先使用命令行参数，其次使用保存的配置
- 设置运行时配置，供 API 接口使用

**修改文件**：
- `packages/cli/src/commands/ui.ts`

**测试结果**：
- ✅ 命令行参数优先级最高
- ✅ 保存的配置正确应用
- ✅ 运行时配置正确设置

---

## 技术亮点

### 1. 智能项目类型识别
- 优先使用依赖判断（更准确）
- 回退到字段判断（兼容性）
- 支持三种类型：项目、库、项目+库

### 2. 动态端口连接
- WebSocket 自动获取实际端口
- 支持端口自动切换
- 开发和生产环境统一处理

### 3. 配置持久化
- 用户级配置存储
- 支持多种配置项
- 配置验证和错误处理

### 4. 完整的 UI 界面
- 美观的设置页面
- 实时状态显示
- 友好的用户体验

---

## 测试覆盖

### 功能测试
- ✅ 项目类型识别（api 项目识别为库）
- ✅ WebSocket 连接（Dev 和 Build 模式）
- ✅ 配置保存和加载
- ✅ 设置页面交互
- ✅ 端口自动切换

### 浏览器测试
- ✅ 页面加载正常
- ✅ API 请求成功
- ✅ WebSocket 连接成功
- ✅ 无 JavaScript 错误
- ✅ 无控制台警告

---

## 文件清单

### 新增文件
- `packages/cli/src/server/config.ts` - 配置管理模块

### 修改文件
- `packages/cli/src/server/database/projects.ts` - 项目类型识别
- `packages/cli/src/server/routes/api.ts` - 配置 API 接口
- `packages/cli/src/commands/ui.ts` - UI 命令配置支持
- `packages/cli/src/web/src/composables/useWebSocket.ts` - WebSocket 连接
- `packages/cli/src/web/src/views/Settings.vue` - 设置页面

---

## 下一步建议

1. **端口冲突自动处理**
   - 检测端口占用
   - 自动关闭占用进程或使用其他端口
   - 提供用户选择

2. **配置项扩展**
   - 添加更多配置项（如日志级别、主题等）
   - 支持配置导入导出
   - 支持配置模板

3. **项目类型扩展**
   - 支持更多项目类型
   - 自定义类型规则
   - 类型图标和颜色

4. **测试完善**
   - 添加单元测试
   - 添加集成测试
   - 添加 E2E 测试

---

## 总结

本次修复解决了用户报告的所有问题：
1. ✅ 项目类型识别准确
2. ✅ WebSocket 连接稳定
3. ✅ 配置管理完善
4. ✅ 设置页面功能完整

所有功能都经过充分测试，可以正常使用！🎉

