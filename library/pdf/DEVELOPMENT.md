# 开发指南

本文档介绍如何在本地开发和调试@ldesign/pdf项目。

## 📋 前置要求

- Node.js >= 18
- pnpm >= 8

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/ldesign/pdf.git
cd pdf
```

### 2. 安装依赖

```bash
pnpm install
```

这将安装主项目和所有示例项目的依赖。

### 3. 启动开发服务器

#### 运行Vue3示例

```bash
pnpm dev:vue3
# 或
pnpm example:vue3
```

访问 http://localhost:3000

#### 运行原生JS示例

```bash
pnpm dev:vanilla
# 或
pnpm example:vanilla
```

访问 http://localhost:3001

#### 运行文档站点

```bash
pnpm docs:dev
```

访问 http://localhost:5173

## 📦 构建

### 构建主库

```bash
pnpm build
```

输出到 `dist/` 目录。

### 构建所有项目

```bash
pnpm build:all
```

这将依次构建：
1. 主库
2. Vue3示例
3. 原生JS示例
4. 文档站点

### 单独构建示例

```bash
# Vue3示例
cd examples/vue3-demo
pnpm build

# 原生JS示例
cd examples/vanilla-demo
pnpm build
```

### 构建文档

```bash
pnpm docs:build
```

输出到 `docs/.vitepress/dist/` 目录。

## 🏗️ 项目结构

```
pdf/
├── src/                          # 源代码
│   ├── core/                     # 核心功能
│   │   ├── PDFViewer.ts         # 主查看器类
│   │   ├── DocumentManager.ts   # 文档管理
│   │   └── PageRenderer.ts      # 页面渲染
│   ├── adapters/                 # 框架适配器
│   │   └── vue/                 # Vue适配器
│   │       ├── PDFViewer.vue    # Vue组件
│   │       ├── usePDFViewer.ts  # Composable
│   │       └── index.ts
│   ├── types/                    # 类型定义
│   │   └── index.ts
│   ├── utils/                    # 工具类
│   │   ├── EventEmitter.ts
│   │   └── CacheManager.ts
│   └── index.ts                  # 主入口
│
├── examples/                     # 示例项目
│   ├── vue3-demo/               # Vue3示例
│   │   ├── src/
│   │   │   ├── App.vue
│   │   │   └── demos/           # 各种示例
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── vanilla-demo/            # 原生JS示例
│       ├── index.html
│       ├── main.js
│       ├── package.json
│       └── vite.config.js
│
├── docs/                        # VitePress文档
│   ├── .vitepress/
│   │   └── config.ts
│   ├── index.md
│   ├── guide/                   # 指南
│   └── api/                     # API文档
│
├── scripts/                     # 构建脚本
│   ├── dev.js                  # 开发脚本
│   └── build-all.js            # 构建脚本
│
├── package.json                # 主包配置
├── pnpm-workspace.yaml         # pnpm工作区配置
├── vite.config.ts              # Vite配置
├── tsconfig.json               # TypeScript配置
└── README.md
```

## 🔧 开发工作流

### 修改核心代码

1. 在 `src/` 目录下修改代码
2. 重新构建: `pnpm build`
3. 在示例中测试修改

### 修改Vue适配器

1. 在 `src/adapters/vue/` 下修改
2. 重新构建: `pnpm build`
3. 在Vue示例中测试

### 添加新功能

1. 在核心类中实现功能
2. 更新类型定义
3. 在适配器中暴露API
4. 更新文档
5. 在示例中演示

### 更新文档

1. 在 `docs/` 目录下编辑Markdown文件
2. 运行 `pnpm docs:dev` 预览
3. 检查格式和链接

## 🧪 测试

### 手动测试

在示例项目中手动测试：

```bash
# 测试Vue组件
pnpm dev:vue3

# 测试原生JS API
pnpm dev:vanilla
```

### 测试清单

- [ ] PDF加载（URL、本地文件、ArrayBuffer）
- [ ] 页面导航（上一页、下一页、跳转）
- [ ] 缩放控制（放大、缩小、适应）
- [ ] 页面旋转
- [ ] 文本搜索
- [ ] 打印功能
- [ ] 下载功能
- [ ] 事件系统
- [ ] 错误处理

### 跨浏览器测试

在以下浏览器中测试：

- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

## 📝 代码规范

### TypeScript

- 所有代码使用TypeScript编写
- 提供完整的类型定义
- 避免使用`any`

```typescript
// ✅ 好的
interface Config {
  scale: number;
  quality: string;
}

function init(config: Config): void {
  // ...
}

// ❌ 不好的
function init(config: any): any {
  // ...
}
```

### 命名约定

- **类名**: PascalCase
- **函数/变量**: camelCase
- **常量**: UPPER_SNAKE_CASE
- **私有成员**: _camelCase

### 注释

使用JSDoc格式：

```typescript
/**
 * 加载PDF文档
 * @param source - PDF来源
 * @returns Promise<void>
 */
async load(source: PDFSource): Promise<void> {
  // 实现...
}
```

## 🐛 调试

### 使用浏览器开发者工具

1. 打开开发者工具 (F12)
2. 在Sources面板设置断点
3. 检查Console中的日志

### 启用详细日志

在代码中添加日志：

```typescript
console.log('[PDFViewer] Loading PDF:', source);
console.log('[PageRenderer] Rendering page:', pageNumber);
```

### Source Maps

构建时会生成Source Maps，方便调试：

```javascript
// vite.config.ts
build: {
  sourcemap: true,
}
```

## 📦 发布流程

### 1. 更新版本

```bash
# 修改 package.json 中的版本号
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

### 2. 构建

```bash
pnpm build
```

### 3. 测试

```bash
# 在示例中测试构建产物
pnpm dev:vue3
pnpm dev:vanilla
```

### 4. 发布

```bash
npm publish --access public
```

### 5. 创建Git标签

```bash
git tag v1.0.0
git push origin v1.0.0
```

## 🔍 常见问题

### Worker加载失败

**问题**: "Setting up fake worker failed"

**解决方案**: 确保正确配置workerSrc

```typescript
workerSrc: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.js'
```

### 类型错误

**问题**: TypeScript类型检查失败

**解决方案**:
1. 检查类型定义是否正确
2. 运行 `vue-tsc` 检查类型
3. 更新类型定义

### 构建失败

**问题**: Vite构建失败

**解决方案**:
1. 清理缓存: `rm -rf node_modules .vite dist`
2. 重新安装: `pnpm install`
3. 重新构建: `pnpm build`

### 示例无法运行

**问题**: 示例项目启动失败

**解决方案**:
1. 确保主库已构建: `pnpm build`
2. 清理示例项目缓存
3. 重新安装示例依赖

## 💡 开发技巧

### 热更新

主库代码修改后不会自动热更新到示例中，需要：

1. 重新构建主库: `pnpm build`
2. 重启示例项目

### 使用本地版本

在示例项目中使用workspace协议：

```json
{
  "dependencies": {
    "@ldesign/pdf": "workspace:*"
  }
}
```

### 快速迭代

开发时可以：

1. 使用 `pnpm build --watch` 监听主库变化
2. 同时运行示例项目
3. 保存即可看到效果

## 📚 参考资源

- [PDF.js文档](https://mozilla.github.io/pdf.js/)
- [Vue 3文档](https://vuejs.org/)
- [Vite文档](https://vitejs.dev/)
- [VitePress文档](https://vitepress.dev/)
- [TypeScript文档](https://www.typescriptlang.org/)

## 🤝 获取帮助

如有问题，可以：

- 查看[常见问题](./docs/guide/faq.md)
- 提交[Issue](https://github.com/ldesign/pdf/issues)
- 查看[示例代码](./examples/)

---

Happy coding! 🎉
