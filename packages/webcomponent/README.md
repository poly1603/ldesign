# @ldesign/webcomponent

基于 Lit 的 Web Component 组件库，提供高质量的 UI 组件。

## 特性

- 🚀 基于 Lit 3.x，性能优异
- 📦 TypeScript 支持，类型安全
- 🎨 完整的设计系统，支持主题定制
- 📱 响应式设计，移动端友好
- 🧪 完整的测试覆盖
- 📖 详细的文档和示例

## 安装

```bash
npm install @ldesign/webcomponent
```

## 使用

### 在 HTML 中使用

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="https://unpkg.com/@ldesign/webcomponent"></script>
</head>
<body>
  <ldesign-button type="primary">点击我</ldesign-button>
  <ldesign-input placeholder="请输入内容"></ldesign-input>
</body>
</html>
```

### 在 JavaScript/TypeScript 中使用

```typescript
import '@ldesign/webcomponent'

// 或者按需导入
import '@ldesign/webcomponent/button'
import '@ldesign/webcomponent/input'
```

## 组件列表

- [x] Button - 按钮组件
- [x] Input - 输入框组件
- [x] Radio - 单选框组件
- [x] Checkbox - 复选框组件
- [x] Switch - 开关组件

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build

# 启动文档
pnpm docs:dev
```

## 文档

详细文档请访问：[LDesign Web Component 文档](./docs)

## 许可证

MIT License
