# @ldesign/form 文档

这是 @ldesign/form 表单组件库的官方文档，使用 VitePress 构建。

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

文档将在 http://localhost:5174 上运行。

### 构建文档

```bash
pnpm build
```

构建后的静态文件将生成在 `.vitepress/dist` 目录中。

### 预览构建结果

```bash
pnpm preview
```

## 部署

### 自动部署

使用提供的部署脚本：

```bash
pnpm deploy
```

### 手动部署

1. 构建文档：

   ```bash
   pnpm build
   ```

2. 将 `.vitepress/dist` 目录中的文件部署到你的静态文件服务器。

### GitHub Pages 部署

1. 修改 `deploy.sh` 文件中的 GitHub 仓库地址
2. 运行部署脚本：
   ```bash
   pnpm deploy
   ```

## 文档结构

```
docs/
├── .vitepress/          # VitePress 配置
│   ├── config.js        # 站点配置
│   └── theme/           # 主题配置
├── guide/               # 指南文档
│   ├── introduction.md  # 介绍
│   ├── installation.md  # 安装
│   ├── getting-started.md # 快速开始
│   ├── concepts.md      # 基础概念
│   └── custom-components.md # 自定义组件
├── examples/            # 示例
│   ├── basic.md         # 基础示例
│   └── dynamic.md       # 动态表单
├── api/                 # API 文档
│   ├── components.md    # 组件 API
│   ├── composables.md   # Composables
│   ├── types.md         # 类型定义
│   └── utils.md         # 工具函数
└── index.md             # 首页
```

## 编写文档

### 添加新页面

1. 在相应目录下创建 `.md` 文件
2. 在 `.vitepress/config.js` 中添加导航配置
3. 更新相关页面的链接

### Markdown 扩展

VitePress 支持多种 Markdown 扩展：

- 代码块语法高亮
- 自定义容器
- 表格
- 数学公式
- 等等

详细信息请参考 [VitePress 文档](https://vitepress.dev/)。

### Vue 组件

可以在 Markdown 中直接使用 Vue 组件：

```vue
<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
```

## 注意事项

1. 确保所有链接都是有效的，构建时会检查死链接
2. 代码示例中避免使用模板字符串，可能导致构建错误
3. 图片资源放在 `public` 目录下
4. 修改配置后需要重启开发服务器

## 贡献

欢迎贡献文档！请确保：

1. 文档内容准确、清晰
2. 代码示例可以正常运行
3. 遵循现有的文档结构和风格
4. 提交前运行构建检查是否有错误

## 许可证

MIT
