# LDesign 文档站点

基于 VitePress 构建的 LDesign 统一文档站点。

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建文档
pnpm build

# 预览构建结果
pnpm preview
```

## 目录结构

```
docs-site/
├── .vitepress/
│   ├── config.ts      # VitePress 配置
│   ├── theme/         # 自定义主题
│   │   ├── index.ts   # 主题入口
│   │   ├── Layout.vue # 自定义布局
│   │   └── styles/    # 自定义样式
│   └── dist/          # 构建输出
├── guide/             # 指南文档
├── packages/          # 核心包文档
├── libraries/         # 组件库文档
├── tools/             # 工具链文档
├── public/            # 静态资源
└── index.md           # 首页
```

## 编写文档

### Markdown 扩展

VitePress 支持所有标准 Markdown 语法，并提供了以下扩展：

#### 自定义容器

```markdown
::: tip 提示
这是一个提示
:::

::: warning 注意
这是一个警告
:::

::: danger 危险
这是一个危险警告
:::

::: details 点击查看详情
这是详情内容
:::
```

#### 代码高亮

````markdown
```ts {1,3-4}
function hello() {
  console.log('Hello')  // [!code highlight]
  console.log('World')  // [!code ++]
  console.log('Old')    // [!code --]
}
```
````

#### 导入代码片段

```markdown
<<< @/snippets/example.ts
<<< @/snippets/example.ts{2,4-5}
```

### 添加新页面

1. 在相应目录创建 `.md` 文件
2. 在 `.vitepress/theme/sidebar.ts` 中添加链接
3. 如果是新分类，更新导航配置

### 组件使用

可以在 Markdown 中直接使用 Vue 组件：

```markdown
<DemoBlock>
  <template #demo>
    <!-- 演示内容 -->
  </template>
  <template #code>
    <!-- 代码内容 -->
  </template>
</DemoBlock>
```

## 部署

### GitHub Pages

```bash
# 运行部署脚本
bash deploy.sh
```

### Netlify

1. 连接 GitHub 仓库
2. 设置构建命令：`pnpm build`
3. 设置发布目录：`.vitepress/dist`

### Vercel

1. 导入项目
2. 框架预设选择 VitePress
3. 构建命令会自动设置

## 配置说明

### 搜索配置

使用本地搜索，支持中文分词：

```ts
search: {
  provider: 'local',
  options: {
    locales: {
      root: {
        translations: {
          // 中文翻译
        }
      }
    }
  }
}
```

### 主题配置

自定义主题色在 `.vitepress/theme/styles/vars.css` 中修改：

```css
:root {
  --vp-c-brand-1: #3451b2;
  --vp-c-brand-2: #3a5ccc;
  --vp-c-brand-3: #5672cd;
}
```

## 注意事项

1. 所有文档使用中文编写
2. 代码示例需要可运行
3. API 文档需要完整的类型定义
4. 保持文档风格一致
5. 定期更新文档内容

## 贡献指南

1. Fork 项目
2. 创建文档分支：`git checkout -b docs/your-feature`
3. 提交更改：`git commit -m 'docs: 添加 xxx 文档'`
4. 推送分支：`git push origin docs/your-feature`
5. 创建 Pull Request
