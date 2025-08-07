# @ldesign/form 演示项目

这个目录包含了 @ldesign/form 的完整演示项目，展示了如何在不同环境中使用这个动态表单系统。

## 📁 项目结构

```
examples/
├── vanilla-js-demo/         # 原生 JavaScript 演示项目
├── vue-demo/               # Vue 3 + TypeScript 演示项目
├── vue-component.html      # Vue 组件使用示例
├── composition-api.html    # Composition API 使用示例
└── vanilla-javascript.html # 原生 JavaScript 使用示例
```

## 🚀 演示项目

### 1. 原生 JavaScript 演示项目 (`vanilla-js-demo/`)

**技术栈**: 原生 JavaScript + Vite  
**端口**: http://localhost:3001

这个项目展示了如何在纯 JavaScript 环境中使用 @ldesign/form，无需任何框架依赖。

**特性演示**:

- 基础表单创建和操作
- 表单验证和状态管理
- 动态字段添加/删除
- 事件监听和处理
- API 操作演示

**启动方式**:

```bash
cd vanilla-js-demo
npm install
npm run dev
```

### 2. Vue 3 演示项目 (`vue-demo/`)

**技术栈**: Vue 3 + TypeScript + Vite  
**端口**: http://localhost:3002

这个项目展示了如何在 Vue 3 应用中使用 @ldesign/form，包括组件方式和 Composition API 方式。

**特性演示**:

- Vue 组件方式使用
- Composition API Hook 使用
- 高级功能（条件渲染、异步验证）
- 表单分组功能
- 主题系统演示

**启动方式**:

```bash
cd vue-demo
npm install
npm run dev
```

## 🎯 功能对比

| 功能特性   | 原生 JS 项目 | Vue 3 项目 | 说明                     |
| ---------- | ------------ | ---------- | ------------------------ |
| 基础表单   | ✅           | ✅         | 表单创建、验证、数据绑定 |
| 动态字段   | ✅           | ✅         | 运行时添加/删除字段      |
| 条件渲染   | ⚠️           | ✅         | 基于字段值的动态显示     |
| 异步验证   | ✅           | ✅         | 服务器端验证模拟         |
| 表单分组   | ⚠️           | ✅         | 字段分组和管理           |
| 主题系统   | ⚠️           | ✅         | 多主题切换和自定义       |
| 事件系统   | ✅           | ✅         | 完整的事件监听           |
| 状态管理   | ✅           | ✅         | 表单状态实时更新         |
| TypeScript | ❌           | ✅         | 类型安全支持             |

> ✅ 完整支持 | ⚠️ 部分支持 | ❌ 不支持

## 📋 演示内容

### 基础功能演示

- **表单创建**: 使用配置对象创建动态表单
- **数据绑定**: 双向数据绑定和实时状态更新
- **表单验证**: 内置验证规则和自定义验证
- **字段类型**: 输入框、选择器、文本域、单选按钮等
- **布局系统**: 响应式网格布局和字段跨列

### 高级功能演示

- **条件渲染**: 基于其他字段值的动态显示控制
- **异步验证**: 模拟服务器端验证（用户名重复检查等）
- **自定义验证**: 复杂的验证逻辑和跨字段验证
- **动态字段**: 运行时添加和删除字段
- **表单分组**: 将相关字段组织成逻辑分组

### 主题和样式

- **预设主题**: 9 种内置主题（浅色、暗色、蓝色等）
- **主题切换**: 运行时主题切换功能
- **响应式设计**: 移动端友好的界面适配
- **自定义样式**: 深度样式定制能力

### API 演示

- **表单操作**: 提交、重置、清空、验证
- **字段操作**: 显示/隐藏、启用/禁用、设置值
- **状态管理**: 获取表单状态、验证状态、错误信息
- **事件监听**: 表单事件的监听和处理

## 🔧 开发指南

### 环境要求

- Node.js 16+
- npm 或 yarn
- 现代浏览器（支持 ES6+）

### 安装依赖

每个演示项目都需要单独安装依赖：

```bash
# 原生 JavaScript 项目
cd vanilla-js-demo && npm install

# Vue 3 项目
cd vue-demo && npm install
```

### 验证项目设置

在启动项目之前，建议先验证项目设置是否正确：

```bash
# 在 examples 目录下
node verify-setup.js
```

这将检查：

- 项目文件结构是否完整
- package.json 配置是否正确
- 源文件导入是否正确
- 配置文件是否有效

### 测试项目构建

验证项目是否能正常构建：

```bash
# 在 examples 目录下
node test-build.js
```

这将自动：

- 安装项目依赖
- 执行构建测试
- 生成测试报告

### 同时启动所有项目

#### 方式一：使用启动脚本（推荐）

```bash
# 在 examples 目录下

# Windows 用户
start-demos.bat

# macOS/Linux 用户
node start-demos.js

# 或者使用 npm 脚本
npm install  # 首次运行需要安装 concurrently
npm run dev:all
```

#### 方式二：手动启动

```bash
# 终端 1 - 启动原生 JS 项目
cd vanilla-js-demo
npm install
npm run dev

# 终端 2 - 启动 Vue 3 项目
cd vue-demo
npm install
npm run dev
```

这将同时启动两个演示项目：

- 原生 JS 项目: http://localhost:3001
- Vue 3 项目: http://localhost:3002

### 构建项目

```bash
# 构建原生 JS 项目
cd vanilla-js-demo && npm run build

# 构建 Vue 3 项目
cd vue-demo && npm run build
```

## 📖 学习路径

### 1. 初学者

建议从 **原生 JavaScript 项目** 开始：

- 了解基本的 API 使用
- 学习表单配置和验证
- 掌握事件处理和状态管理

### 2. Vue 开发者

推荐查看 **Vue 3 项目**：

- 学习 Vue 组件方式使用
- 掌握 Composition API Hook
- 了解高级功能和最佳实践

### 3. 高级用户

深入研究两个项目的源码：

- 对比不同使用方式的优缺点
- 学习复杂场景的解决方案
- 参考项目结构和代码组织

## 🎨 自定义和扩展

### 添加自定义字段组件

```javascript
// 注册自定义组件
import { registerComponent } from '@ldesign/form'

registerComponent('CustomInput', CustomInputComponent)

// 在表单配置中使用
{
  name: 'custom',
  title: '自定义字段',
  component: 'CustomInput'
}
```

### 创建自定义主题

```javascript
import { createCustomTheme } from '@ldesign/form'

const myTheme = createCustomTheme({
  name: 'my-theme',
  colors: {
    primary: '#1890ff',
    success: '#52c41a',
  },
})
```

### 扩展验证规则

```javascript
import { addValidationRule } from '@ldesign/form'

addValidationRule('phone', value => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value) || '请输入有效的手机号码'
})
```

## 🔗 相关资源

- [API 文档](../docs/API.md)
- [GitHub 仓库](https://github.com/ldesign/form)
- [更新日志](../CHANGELOG.md)
- [贡献指南](../CONTRIBUTING.md)

## 🔧 故障排除

### 常见问题

#### 1. 依赖安装失败

```bash
# 清除缓存后重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. 端口被占用

如果端口 3001 或 3002 被占用，可以修改 `vite.config.js/ts` 中的端口配置：

```javascript
export default defineConfig({
  server: {
    port: 3003, // 修改为其他端口
  },
})
```

#### 3. 模块导入错误

确保从正确的路径导入模块：

```javascript
// 正确的导入方式
import { createFormInstance } from '../../../src/vanilla.ts'
import { DynamicForm } from '../../../../src/components/DynamicForm.vue'
```

#### 4. TypeScript 类型错误

确保 TypeScript 配置正确，特别是路径映射：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

#### 5. 构建失败

检查是否有语法错误或缺少依赖：

```bash
# 运行类型检查
npm run type-check

# 检查 ESLint 错误
npm run lint
```

### 调试技巧

1. **开启详细日志**: 在启动命令前添加 `DEBUG=*`
2. **检查浏览器控制台**: 查看是否有 JavaScript 错误
3. **验证网络请求**: 确保静态资源能正常加载
4. **清除浏览器缓存**: 强制刷新页面 (Ctrl+F5)

### 获取帮助

如果问题仍然存在：

1. 运行 `node verify-setup.js` 检查项目设置
2. 运行 `node test-build.js` 测试构建过程
3. 查看终端输出的详细错误信息
4. 检查 `package.json` 中的依赖版本

## 🤝 反馈和贡献

如果您在使用演示项目时遇到问题或有改进建议，欢迎：

1. 提交 [GitHub Issue](https://github.com/ldesign/form/issues)
2. 发起 [Pull Request](https://github.com/ldesign/form/pulls)
3. 参与 [讨论区](https://github.com/ldesign/form/discussions)

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。
