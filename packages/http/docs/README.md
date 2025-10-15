# @ldesign/http 文档

本目录包含 @ldesign/http 的完整文档，使用 VitePress 构建。

## 文档结构

```
docs/
├── .vitepress/       # VitePress 配置
│   ├── config.ts      # 站点配置
│   └── theme/        # 主题定制
├── guide/          # 使用指南
│   ├── index.md       # 介绍
│   ├── getting-started.md # 快速开始
│   ├── installation.md   # 安装
│   └── client.md      # 客户端详解
├── api/           # API 参考
│   ├── index.md       # API 概览
│   └── create-http-client.md # 工厂函数
├── vue/           # Vue 集成
│   └── index.md       # Vue 使用指南
├── examples/        # 示例代码
│   ├── index.md       # 示例索引
│   └── basic.md       # 基础示例
└── index.md         # 首页
```

## 本地开发

启动文档开发服务器：

```bash
# 在项目根目录
pnpm docs:dev
```

服务器将在 http://localhost:5173 启动。

## 构建文档

构建生产版本的文档：

```bash
pnpm docs:build
```

构建产物将输出到 `docs/.vitepress/dist` 目录。

## 预览文档

预览构建后的文档：

```bash
pnpm docs:preview
```

## 贡献文档

欢迎贡献文档！请遵循以下准则：

1. **使用 Markdown** - 所有文档使用 Markdown 格式
2. **代码示例** - 提供清晰的代码示例和注释
3. **类型安全** - 示例代码应包含 TypeScript 类型
4. **中英对照** - 重要术语提供中英文对照
5. **链接完整** - 确保内部链接正确

## 文档规范

### 文件命名

- 使用小写字母和连字符：`getting-started.md`
- 避免使用空格和特殊字符
- 文件名应简洁且描述清楚

### 文档结构

每个文档页面应包含：

1. 标题（# 一级标题）
2. 简介段落
3. 主要内容（## 二级标题）
4. 代码示例
5. 相关链接

### 代码示例

使用语法高亮的代码块：

\`\`\`typescript
// 代码示例
import { createHttpClient } from '@ldesign/http'

const client = createHttpClient({
  baseURL: 'https://api.example.com'
})
\`\`\`

## 需要帮助？

- 查看 [VitePress 文档](https://vitepress.dev/)
- 提交 [Issue](https://github.com/ldesign/http/issues)
- 加入 [讨论区](https://github.com/ldesign/http/discussions)
