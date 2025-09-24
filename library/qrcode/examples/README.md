# @ldesign/qrcode 示例项目集合

这个目录包含了 `@ldesign/qrcode` 二维码生成库在不同框架和环境中的完整示例项目，展示了库的各种功能和使用方法。

## 📁 项目结构

```
examples/
├── vue3-example/           # Vue 3 + TypeScript 示例
├── react-example/          # React + TypeScript 示例
├── angular-example/        # Angular + TypeScript 示例
├── vanilla-js-example/     # 原生 JavaScript/HTML 示例
└── README.md              # 本文件
```

## 🚀 快速开始

### 前置要求

- Node.js 16+ 
- pnpm 8+
- 现代浏览器支持

### 安装依赖

在项目根目录下运行：

```bash
# 安装所有示例项目的依赖
cd packages/qrcode
pnpm install

# 或者单独安装某个示例项目
cd examples/vue3-example
pnpm install
```

### 启动示例项目

每个示例项目都可以独立运行：

```bash
# Vue 3 示例 (端口 3000)
cd examples/vue3-example
pnpm dev

# React 示例 (端口 3001)
cd examples/react-example
pnpm dev

# Angular 示例 (端口 3002)
cd examples/angular-example
pnpm start

# Vanilla JS 示例 (端口 3003)
cd examples/vanilla-js-example
pnpm dev
```

## 📋 示例项目详情

### 1. Vue 3 + TypeScript 示例

**路径**: `vue3-example/`  
**端口**: 3000  
**技术栈**: Vue 3, TypeScript, Vite, Composition API

**功能特性**:
- ✅ 基础二维码生成
- ✅ 高级功能（Logo 嵌入、批量生成）
- ✅ 样式定制（颜色、渐变、形状）
- ✅ 数据类型支持（URL、WiFi、联系人等）
- ✅ 性能测试和优化

**启动命令**:
```bash
cd examples/vue3-example
pnpm dev
```

### 2. React + TypeScript 示例

**路径**: `react-example/`  
**端口**: 3001  
**技术栈**: React 18, TypeScript, Vite, Hooks

**功能特性**:
- ✅ 基础二维码生成
- ✅ 高级功能（Logo 嵌入、批量生成）
- ✅ 样式定制
- ✅ 数据类型支持
- ✅ 响应式设计

**启动命令**:
```bash
cd examples/react-example
pnpm dev
```

### 3. Angular + TypeScript 示例

**路径**: `angular-example/`  
**端口**: 3002  
**技术栈**: Angular 17, TypeScript, Standalone Components

**功能特性**:
- ✅ 基础二维码生成
- ✅ 高级功能（Logo 嵌入、批量生成）
- ✅ 独立组件架构
- ✅ 路由导航
- ✅ 响应式设计

**启动命令**:
```bash
cd examples/angular-example
pnpm start
```

### 4. Vanilla JavaScript/HTML 示例

**路径**: `vanilla-js-example/`  
**端口**: 3003  
**技术栈**: 原生 JavaScript (ES6+), HTML5, CSS3, Vite

**功能特性**:
- ✅ 基础二维码生成
- ✅ 高级功能（Logo 嵌入、批量生成）
- ✅ 纯前端实现
- ✅ 模块化架构
- ✅ 响应式设计

**启动命令**:
```bash
cd examples/vanilla-js-example
pnpm dev
```

## 🎯 功能对比

| 功能 | Vue 3 | React | Angular | Vanilla JS |
|------|-------|-------|---------|------------|
| 基础生成 | ✅ | ✅ | ✅ | ✅ |
| Logo 嵌入 | ✅ | ✅ | ✅ | ✅ |
| 批量生成 | ✅ | ✅ | ✅ | ✅ |
| 样式定制 | ✅ | ✅ | 🚧 | 🚧 |
| 数据类型 | ✅ | ✅ | 🚧 | 🚧 |
| 性能测试 | ✅ | 🚧 | 🚧 | 🚧 |
| 响应式设计 | ✅ | ✅ | ✅ | ✅ |
| TypeScript | ✅ | ✅ | ✅ | ❌ |

> ✅ 已完成 | 🚧 开发中 | ❌ 不支持

## 🛠️ 开发指南

### 添加新示例

1. 在 `examples/` 目录下创建新的示例项目目录
2. 按照现有项目结构创建配置文件
3. 实现基础功能和高级功能
4. 添加完整的 README.md 文档
5. 更新本文件的项目列表

### 代码规范

- 使用 TypeScript（除 Vanilla JS 外）
- 遵循 ESM 模块规范
- 使用 LDesign 设计系统
- 包含完整的错误处理
- 添加详细的代码注释

### 样式规范

所有示例项目都使用 LDesign 设计系统的 CSS 变量：

```css
:root {
  --ldesign-brand-color-6: #7334cb;
  --ldesign-text-color-primary: rgba(0, 0, 0, 90%);
  --ldesign-bg-color-container: #ffffff;
  /* ... 更多变量 */
}
```

## 📖 API 使用示例

### 基本用法

```javascript
import { generateQRCode } from '@ldesign/qrcode'

const options = {
  size: 200,
  format: 'canvas',
  errorCorrectionLevel: 'M'
}

const result = await generateQRCode('Hello World', options)
```

### 高级用法

```javascript
// 带 Logo 的二维码
const options = {
  size: 300,
  format: 'canvas',
  errorCorrectionLevel: 'H',
  logo: {
    src: logoImageSrc,
    size: 60
  }
}

// 自定义样式
const options = {
  size: 250,
  format: 'canvas',
  foregroundColor: '#722ED1',
  backgroundColor: '#f1ecf9',
  margin: 4
}
```

## 🧪 测试指南

每个示例项目都包含完整的测试功能：

1. **功能测试** - 验证二维码生成功能
2. **界面测试** - 检查用户界面响应
3. **兼容性测试** - 确保跨浏览器兼容
4. **性能测试** - 测试生成速度和内存使用

### 测试步骤

1. 启动示例项目
2. 测试基础二维码生成功能
3. 测试高级功能（Logo、批量等）
4. 验证不同数据类型支持
5. 检查响应式设计
6. 测试下载功能

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 实现新功能或修复问题
4. 添加或更新测试
5. 更新文档
6. 提交 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件

## 🔗 相关链接

- [LDesign 官网](https://www.ldesign.com)
- [GitHub 仓库](https://github.com/ldesign/qrcode)
- [API 文档](../docs/api.md)
- [更新日志](../CHANGELOG.md)
- [问题反馈](https://github.com/ldesign/qrcode/issues)
