# LDesign Icons

> 一个现代化、高性能、支持多框架的企业级图标库解决方案

一个强大的工具，可以将 SVG 文件自动转换成 Vue2、Vue3、React 和 Lit Web Component 组件，让你可以轻松发布多个框架的图标库。

## ✨ 特性

- 🎯 **多框架支持**: 支持 Vue 2、Vue 3、React 和 Lit Web Components
- 🚀 **批量转换**: 一次性将整个目录的 SVG 文件转换为组件
- 📦 **即时发布**: 生成的组件包含 package.json，可直接发布到 npm
- 🔧 **SVG 优化**: 内置 SVGO 优化，减小文件大小
- 💪 **TypeScript 支持**: 可生成 TypeScript 组件和类型定义
- 🎨 **自定义配置**: 支持组件名前缀、后缀等自定义配置

## 📦 安装

```bash
# 克隆或下载项目后，在项目目录运行：
npm install

# 构建项目
npm run build
```

## 🚀 使用方法

### 命令行使用

```bash
# 转换为所有支持的框架格式
npm run convert:all

# 只转换为 Vue 2 组件
npm run convert:vue2

# 只转换为 Vue 3 组件
npm run convert:vue3

# 只转换为 React 组件
npm run convert:react

# 只转换为 Lit Web Component
npm run convert:lit
```

### 高级用法

使用 CLI 工具进行更多自定义配置：

```bash
# 使用自定义输入输出目录
node dist/cli.js --input ./my-svgs --output ./my-components --target vue3

# 添加组件名前缀和后缀
node dist/cli.js --prefix My --suffix Icon --target react

# 生成 JavaScript 组件（默认为 TypeScript）
node dist/cli.js --no-typescript --target vue2

# 不优化 SVG（默认会优化）
node dist/cli.js --no-optimize --target lit
```

### CLI 参数说明

| 参数 | 别名 | 说明 | 默认值 |
|------|------|------|--------|
| `--target` | `-t` | 目标框架 (vue2/vue3/react/lit/all) | all |
| `--input` | `-i` | SVG 文件输入目录 | ./examples/svg |
| `--output` | `-o` | 组件输出目录 | ./output |
| `--prefix` | `-p` | 组件名前缀 | - |
| `--suffix` | `-s` | 组件名后缀 | - |
| `--typescript` | `--ts` | 生成 TypeScript 组件 | true |
| `--optimize` | - | 使用 SVGO 优化 SVG | true |

## 📁 项目结构

```
icons/
├── src/                    # 源代码
│   ├── generators/         # 各框架的生成器
│   │   ├── vue2.ts        # Vue 2 组件生成器
│   │   ├── vue3.ts        # Vue 3 组件生成器
│   │   ├── react.ts       # React 组件生成器
│   │   └── lit.ts         # Lit 组件生成器
│   ├── utils/             # 工具函数
│   │   └── svg.ts         # SVG 处理工具
│   ├── types/             # TypeScript 类型定义
│   ├── cli.ts             # CLI 入口
│   └── index.ts           # 主入口
├── examples/              # 示例文件
│   └── svg/              # 示例 SVG 图标
├── output/               # 生成的组件（git ignored）
│   ├── vue2/            # Vue 2 组件
│   ├── vue3/            # Vue 3 组件
│   ├── react/           # React 组件
│   └── lit/             # Lit Web Components
└── dist/                # 编译后的 JavaScript 文件
```

## 🎯 生成的组件使用示例

### Vue 2
```vue
<template>
  <div>
    <HomeIcon :size="24" color="#333" />
  </div>
</template>

<script>
import { HomeIcon } from '@ldesign/icons-vue2'

export default {
  components: { HomeIcon }
}
</script>
```

### Vue 3
```vue
<template>
  <HomeIcon :size="24" color="#333" />
</template>

<script setup>
import { HomeIcon } from '@ldesign/icons-vue3'
</script>
```

### React
```jsx
import { HomeIcon } from '@ldesign/icons-react'

function App() {
  return <HomeIcon size={24} color="#333" />
}
```

### Lit Web Component
```html
<!-- 在 HTML 中直接使用 -->
<script type="module">
  import '@ldesign/icons-lit'
</script>

<home-icon size="24" color="#333"></home-icon>
```

```javascript
// 或在 JavaScript 中使用
import { HomeIcon } from '@ldesign/icons-lit'

const icon = document.createElement('home-icon')
icon.size = '24'
icon.color = '#333'
document.body.appendChild(icon)
```

## 📦 发布到 NPM

生成的每个组件库都包含 `package.json`，可以直接发布：

```bash
# 进入生成的组件目录
cd output/vue3

# 发布到 npm（需要先登录 npm）
npm publish --access public
```

## 🎨 添加新的 SVG 图标

1. 将 SVG 文件放入 `examples/svg/` 目录（或你指定的输入目录）
2. 运行转换命令
3. 新的组件会自动生成在输出目录

## ⚙️ SVG 优化配置

默认使用 SVGO 进行优化，配置包括：
- 保留 viewBox 属性
- 移除不必要的属性和元数据
- 转换样式到属性
- 移除脚本元素

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT
