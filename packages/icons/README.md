# @ldesign/icons

现代化的 SVG 图标系统，自动将 SVG 文件转换为多框架组件。基于 TDesign Icons 构建，支持 2130+ 高质量图标。

## ✨ 特性

- 🎯 **多框架支持**: React、Vue 3、Angular 等主流框架
- 🚀 **自动化构建**: 一键生成所有框架的图标组件
- 📦 **TypeScript 优先**: 完整的类型定义和类型安全
- ⚡ **高性能**: 快速构建，支持 2130+ 图标的批量处理
- 🔧 **智能处理**: 自动 SVG 优化和属性绑定
- 📋 **完整元数据**: 自动生成 manifest 和类型定义
- 🎨 **动态属性**: 支持 size、color、strokeWidth 等动态配置
- 📚 **开箱即用**: 生成的组件可直接在项目中使用

## � 项目结构

```
packages/icons/
├── src/                          # 所有功能代码
│   ├── core/                     # 核心功能
│   │   ├── gulp/                 # Gulp 构建任务
│   │   ├── svg-processor/        # SVG 处理器
│   │   ├── types.ts              # 核心类型定义
│   │   └── utils/                # 工具函数
│   ├── packages/                 # 各框架包
│   │   ├── react/                # React 组件包
│   │   ├── vue-next/             # Vue 3 组件包
│   │   ├── angular/              # Angular 组件包
│   │   └── ...                   # 其他框架
│   ├── scripts/                  # 构建脚本
│   └── tools/                    # 开发工具
├── tdesign-icons-develop/        # SVG 源文件
│   └── svg/                      # 2130+ SVG 图标文件
├── build-all.js                  # 主构建脚本
├── verify-build.js               # 构建验证脚本
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 在 packages/icons 目录下
npm install
# 或
pnpm install
```

### 2. 构建所有图标组件

```bash
# 构建所有框架的图标组件
npm run build:all

# 或使用 pnpm
pnpm run build:all
```

### 3. 验证构建结果

```bash
# 验证构建是否成功
npm run verify
```

## ➕ 如何新增图标

### 1. 添加 SVG 文件

将新的 SVG 图标文件添加到 `tdesign-icons-develop/svg/` 目录：

```bash
# 将你的 SVG 文件复制到源目录
cp your-new-icon.svg tdesign-icons-develop/svg/
```

### 2. SVG 文件要求

- **文件名**: 使用 kebab-case 命名，如 `user-profile.svg`
- **viewBox**: 必须包含 `viewBox="0 0 24 24"` 属性
- **内容**: 纯 SVG 路径，不包含样式和脚本
- **优化**: 建议使用 SVGO 预先优化

### 3. 重新构建

```bash
# 重新构建所有组件
npm run build:all

# 验证新图标是否正确生成
npm run verify
```

### 4. 生成的组件

新图标会自动生成对应的组件：
- `your-new-icon.svg` → `YourNewIconIcon` (React)
- `your-new-icon.svg` → `YourNewIconIcon.vue` (Vue)
- `your-new-icon.svg` → `YourNewIconComponent` (Angular)

## 📦 构建和打包

### 可用的构建命令

```bash
# 构建所有框架的图标组件
npm run build:all          # 使用 build-all.js (推荐)
npm run generate:all        # 使用 TypeScript 脚本

# 单独构建特定框架
npm run build:react         # 仅构建 React 组件
npm run build:vue           # 仅构建 Vue 组件
npm run build:angular       # 仅构建 Angular 组件

# 验证构建结果
npm run verify              # 验证所有包的完整性

# 开发相关
npm run dev                 # 启动开发服务器
npm run dev-server          # 启动预览服务器
npm run docs:generate       # 生成文档
```

### 构建输出

构建完成后，组件会生成到我们的 src 目录结构中：

```
src/packages/{framework}/src/
├── components/              # 所有图标组件
│   ├── add.tsx             # 单个图标组件
│   ├── user.tsx            # ...
│   └── ...                 # 2130+ 个组件
├── index.ts                # 自动生成的统一导出文件
├── icon-base.tsx           # 基础图标组件
├── manifest.json           # 图标元数据
└── types.ts                # TypeScript 类型定义
```

**生成位置：**
- React: `src/packages/react/src/components/`
- Vue 3: `src/packages/vue-next/src/components/`
- Angular: `src/packages/angular/src/components/`

## 📖 使用生成的组件

### React 组件

```tsx
// 导入单个图标 - 从我们的 src 目录
import { AddIcon, UserIcon } from './src/packages/react/src';

// 使用组件
function App() {
  return (
    <div>
      <AddIcon size={24} color="blue" strokeWidth={2} />
      <UserIcon size="32px" color="#ff6b6b" />
    </div>
  );
}
```

### Vue 3 组件

```vue
<template>
  <div>
    <AddIcon :size="24" color="blue" :stroke-width="2" />
    <UserIcon size="32px" color="#ff6b6b" />
  </div>
</template>

<script setup>
// 导入单个图标 - 从我们的 src 目录
import { AddIcon, UserIcon } from './src/packages/vue-next/src';
</script>
```

### Angular 组件

```typescript
// app.module.ts
import { AddComponent, UserComponent } from './src/packages/angular/src';

@NgModule({
  imports: [AddComponent, UserComponent],
  // ...
})
export class AppModule {}
```

```html
<!-- app.component.html -->
<tdesign-add [size]="24" color="blue" [strokeWidth]="2"></tdesign-add>
<tdesign-user size="32px" color="#ff6b6b"></tdesign-user>
```

### 组件属性

所有生成的图标组件都支持以下属性：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `size` | `number \| string` | `24` | 图标尺寸 |
| `color` | `string` | `'currentColor'` | 图标颜色 |
| `strokeWidth` | `number` | `2` | 描边宽度 |
| `className` | `string` | - | CSS 类名 |
| `style` | `object` | - | 内联样式 |

## 🛠️ 开发指南

### 项目架构

```
src/
├── core/                    # 核心功能模块
│   ├── gulp/               # Gulp 构建任务
│   │   ├── generate-icons.ts      # 图标生成
│   │   ├── generate-entry.ts      # 入口文件生成
│   │   ├── generate-manifest.ts   # 元数据生成
│   │   ├── svg-info-check.ts      # SVG 处理
│   │   └── use-template.ts        # 模板系统
│   ├── svg-processor/      # SVG 处理器
│   ├── types.ts           # 核心类型定义
│   └── utils/             # 工具函数
├── packages/              # 各框架包
│   ├── react/            # React 包
│   │   ├── gulp/         # React 构建任务
│   │   └── src/          # 生成的组件输出目录
│   ├── vue-next/         # Vue 3 包
│   └── angular/          # Angular 包
├── scripts/              # 构建脚本
│   ├── build-all.ts     # 主构建脚本
│   └── generate.ts      # 生成脚本
└── tools/               # 开发工具
    ├── dev-server/      # 开发服务器
    ├── docs/           # 文档生成
    └── preview/        # 预览工具
```

### 添加新框架支持

1. 在 `src/packages/` 下创建新框架目录
2. 创建框架特定的模板文件
3. 实现框架特定的构建任务
4. 更新主构建脚本

### 自定义构建流程

可以通过修改 `build-all.js` 来自定义构建流程：

```javascript
// 修改处理的图标数量
for (const svgFile of svgFiles.slice(0, 100)) { // 仅处理前100个

// 添加新的框架配置
const config = {
  packages: {
    react: { /* ... */ },
    vue: { /* ... */ },
    svelte: { /* 新框架配置 */ }
  }
};
```

## 🧪 测试和验证

```bash
# 运行构建验证
npm run verify

# 运行单元测试
npm run test

# 运行测试 UI
npm run test:ui
```

## � 构建统计

当前系统支持：
- **SVG 源文件**: 2130 个高质量图标
- **支持框架**: React、Vue 3、Angular
- **生成组件**: 6390+ 个 (每个框架 2130 个)
- **构建速度**: < 30 秒 (全量构建)
- **成功率**: 100%

## 🔧 故障排除

### 常见问题

**Q: 构建失败，提示找不到 SVG 文件**
```bash
# 确保 SVG 源文件存在
ls tdesign-icons-develop/svg/ | wc -l
```

**Q: 生成的组件有语法错误**
```bash
# 重新运行构建
npm run build:all
# 验证结果
npm run verify
```

**Q: 新增的图标没有生成组件**
```bash
# 检查 SVG 文件格式
# 确保包含 viewBox 属性
# 重新构建
npm run build:all
```

## 📚 API 参考

### 生成的组件接口

```typescript
// React 组件
interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

// Vue 组件
interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: Record<string, any>;
}
```

## 🚀 快速命令参考

```bash
# 🔧 开发环境设置
npm install                 # 安装依赖

# 📦 构建命令
npm run build:all          # 构建所有框架组件
npm run verify             # 验证构建结果

# ➕ 新增图标流程
# 1. 添加 SVG 文件到 tdesign-icons-develop/svg/
# 2. 运行构建
npm run build:all
# 3. 验证结果
npm run verify

# 🧪 测试命令
npm run test               # 运行测试
npm run test:ui           # 测试 UI

# 🛠️ 开发工具
npm run dev               # 开发服务器
npm run dev-server        # 预览服务器
npm run docs:generate     # 生成文档
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情。

## 🔗 相关链接

- [LDesign 设计系统](https://github.com/ldesign/ldesign)
- [TDesign Icons](https://github.com/Tencent/tdesign-icons) - 图标源文件
- [问题反馈](https://github.com/ldesign/ldesign/issues)
- [更新日志](./CHANGELOG.md)
