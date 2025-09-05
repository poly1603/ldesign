# LDesign Icons 架构设计

## 项目结构

```
@ldesign/icons
├── assets/                   # 原始 SVG 文件
│   └── svg/                  # SVG 图标文件目录
├── packages/                 # 各框架图标包
│   ├── icons-svg/           # 优化后的 SVG 基础包
│   │   ├── src/
│   │   │   ├── svg/         # 优化后的 SVG 文件
│   │   │   ├── manifest.json # 图标清单
│   │   │   └── index.ts     # 导出文件
│   │   ├── package.json
│   │   └── rollup.config.js
│   ├── icons-vue/           # Vue 3 图标组件包
│   │   ├── src/
│   │   │   ├── *Icon.ts    # 各个图标组件
│   │   │   ├── index.ts    # 统一导出
│   │   │   └── style.css   # 样式文件
│   │   ├── es/              # ES Module 构建产物
│   │   ├── lib/             # CommonJS 构建产物
│   │   ├── dist/            # UMD 构建产物
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── rollup.config.js
│   ├── icons-vue2/          # Vue 2 图标组件包
│   ├── icons-react/         # React 图标组件包
│   ├── icons-lit/           # Lit Web Components 包
│   └── shared/              # 共享工具包
├── scripts/                  # 构建脚本
│   ├── generate-svg.js      # SVG 处理脚本
│   └── generate-components.js # 组件生成脚本
├── test/                     # 测试文件
├── site/                     # 文档网站
├── rollup.config.base.js    # Rollup 基础配置
├── tsconfig.json            # TypeScript 配置
└── package.json             # 根 package.json (monorepo)
```

## 构建流程

### 1. SVG 处理阶段
```bash
npm run build:svg
```
- 读取 `assets/svg/` 目录下的所有 SVG 文件
- 使用 SVGO 进行优化（去除冗余信息、压缩路径等）
- 生成标准化的 SVG 文件到 `packages/icons-svg/src/svg/`
- 生成 manifest.json 包含所有图标元信息

### 2. 组件生成阶段
```bash
npm run build:components
```
- 读取 manifest.json
- 为每个框架生成对应的组件文件
- 生成类型定义文件
- 生成样式文件

### 3. 构建打包阶段
```bash
npm run build:packages
```
- 使用 Rollup 构建各个包
- 生成多种格式：
  - ES Modules (es/)
  - CommonJS (lib/)
  - UMD (dist/)
  - TypeScript 声明文件

## 技术栈

### 核心依赖
- **构建工具**: Rollup 4.x
- **语言**: TypeScript 5.x
- **SVG 优化**: SVGO 3.x
- **包管理**: npm workspaces

### 框架支持
- **Vue 3**: 3.x (Composition API)
- **Vue 2**: 2.6+ / 2.7 (支持 Composition API)
- **React**: 16.8+ (Hooks)
- **Lit**: 3.x (Web Components)

## 特性

### 🎯 按需加载
每个图标都是独立的组件，支持 Tree Shaking

```js
// 只导入需要的图标
import { HomeIcon, UserIcon } from '@ldesign/icons-vue'
```

### 🎨 统一 API
所有框架的图标组件都有统一的属性接口

```typescript
interface IconProps {
  size?: string | number      // 图标大小
  color?: string              // 图标颜色  
  strokeWidth?: string | number // 线条宽度
  spin?: boolean              // 旋转动画
}
```

### 📦 多种构建格式
- **ES Modules**: 现代打包工具优化
- **CommonJS**: Node.js 兼容
- **UMD**: 浏览器直接使用
- **TypeScript**: 完整类型支持

### 🚀 性能优化
- SVG 自动优化压缩
- 组件按需加载
- 零运行时依赖（除框架本身）
- Tree Shaking 友好

## 开发指南

### 添加新图标
1. 将 SVG 文件放入 `assets/svg/` 目录
2. 运行 `npm run build:svg` 处理 SVG
3. 运行 `npm run build:components` 生成组件
4. 运行 `npm run build:packages` 构建包

### 自定义 SVGO 配置
编辑 `scripts/generate-svg.js` 中的 `svgoConfig`

### 自定义组件模板
编辑 `scripts/generate-components.js` 中对应框架的生成函数

## 发布流程

```bash
# 1. 构建所有包
npm run build

# 2. 运行测试
npm test

# 3. 更新版本
npm run release

# 4. 发布到 npm
npm run publish
```

## API 文档

### Vue 3 使用
```vue
<template>
  <HomeIcon :size="24" color="#333" :spin="loading" />
</template>

<script setup>
import { HomeIcon } from '@ldesign/icons-vue'
import '@ldesign/icons-vue/style.css' // 导入样式
</script>
```

### React 使用
```jsx
import { HomeIcon } from '@ldesign/icons-react'
import '@ldesign/icons-react/style.css'

function App() {
  return <HomeIcon size={24} color="#333" spin={loading} />
}
```

### Lit/原生 Web Components
```html
<script type="module">
  import { HomeIcon } from '@ldesign/icons-lit'
</script>

<ld-home-icon size="24" color="#333" spin></ld-home-icon>
```

## 性能指标

- **构建大小**: 单个图标组件 ~2KB (gzipped)
- **构建时间**: < 30s (500+ 图标)
- **Tree Shaking**: ✅ 完全支持
- **SSR**: ✅ Vue/React 支持
- **TypeScript**: ✅ 完整类型定义

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交代码
4. 创建 Pull Request

## License

MIT
