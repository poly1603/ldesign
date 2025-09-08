# @ldesign/icons

强大的 SVG 图标转换工具，将 SVG 文件转换为各种前端框架的组件。

## ✨ 特性

- 🎯 **多框架支持**: Vue 2/3、React、Lit、Angular、Svelte
- 🔧 **高度可配置**: 支持前缀、后缀、主题、动画等
- 🚀 **性能优化**: 内置 SVGO 优化，支持 Tree-shaking
- 📦 **TypeScript 优先**: 完整的类型定义和类型安全
- 🎨 **主题系统**: 支持颜色主题和动态切换
- ⚡ **CLI 工具**: 命令行工具，支持批量转换
- 🧪 **全面测试**: 100% 测试覆盖率
- 📚 **详细文档**: 完整的 API 文档和示例

## 📦 安装

```bash
# 使用 pnpm
pnpm add @ldesign/icons

# 使用 npm
npm install @ldesign/icons

# 使用 yarn
yarn add @ldesign/icons
```

## 🚀 快速开始

### CLI 使用

```bash
# 转换 SVG 为 Vue 3 组件
npx ldesign-icons convert -i ./svg -o ./icons -t vue3

# 使用配置文件
npx ldesign-icons convert -c ldesign-icons.config.json

# 初始化配置文件
npx ldesign-icons init --target vue3
```

### 编程式使用

```typescript
import { IconConverter } from '@ldesign/icons';

const converter = new IconConverter({
  target: 'vue3',
  inputDir: './svg',
  outputDir: './icons',
  typescript: true,
  optimize: true,
  prefix: 'Icon',
  suffix: '',
  features: {
    theming: true,
    animation: true,
    preview: true
  }
});

const result = await converter.convert();
console.log(`转换完成！生成了 ${result.stats?.totalIcons} 个图标组件`);
```

## 📋 配置选项

### 基础配置

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `target` | `TargetFramework` | - | 目标框架 |
| `inputDir` | `string` | - | SVG 文件输入目录 |
| `outputDir` | `string` | - | 组件输出目录 |
| `typescript` | `boolean` | `true` | 生成 TypeScript 组件 |
| `optimize` | `boolean` | `true` | 启用 SVG 优化 |

### 组件命名

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `prefix` | `string` | `''` | 组件名前缀 |
| `suffix` | `string` | `'Icon'` | 组件名后缀 |

### 高级功能

```typescript
interface AdvancedFeatures {
  theming: boolean;      // 主题支持
  animation: boolean;    // 动画支持
  preview: boolean;      // 预览页面生成
  composables: boolean;  // Vue Composables
  styles: boolean;       // 样式文件生成
}
```

## 🎨 主题系统

支持完整的主题配置：

```typescript
interface ColorTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  custom?: Record<string, string>;
}
```

## 📖 支持的框架

### Vue 3

生成现代 Vue 3 组件，支持：
- Composition API
- TypeScript
- 主题系统
- 动画效果
- Composables

```vue
<template>
  <HomeIcon :size="24" color="primary" />
</template>

<script setup>
import { HomeIcon } from '@/icons';
</script>
```

### Vue 2

生成兼容 Vue 2 的组件：
- Options API
- 向后兼容
- 完整功能支持

### React

生成 React 函数组件：
- TypeScript 支持
- Props 类型定义
- 主题集成

```tsx
import { HomeIcon } from './icons';

function App() {
  return <HomeIcon size={24} color="primary" />;
}
```

### 其他框架

- **Lit**: Web Components
- **Angular**: Angular 组件
- **Svelte**: Svelte 组件

## 🛠️ CLI 命令

### convert

转换 SVG 文件为组件：

```bash
ldesign-icons convert [options]
```

**选项:**
- `-i, --input <dir>`: 输入目录
- `-o, --output <dir>`: 输出目录
- `-t, --target <framework>`: 目标框架
- `-c, --config <file>`: 配置文件
- `--prefix <prefix>`: 组件名前缀
- `--suffix <suffix>`: 组件名后缀
- `--no-optimize`: 禁用优化
- `--no-typescript`: 生成 JavaScript
- `--verbose`: 详细输出

### validate

验证配置文件：

```bash
ldesign-icons validate -c config.json
```

### init

创建配置文件模板：

```bash
ldesign-icons init [options]
```

## 📁 输出结构

```
icons/
├── components/
│   ├── HomeIcon.ts
│   ├── UserIcon.ts
│   └── ...
├── composables/
│   ├── useTheme.ts
│   └── useAnimation.ts
├── styles/
│   └── icons.css
├── types/
│   └── index.ts
├── index.ts
└── package.json
```

## ⚙️ 一键生成与打包

```bash
# 在 packages/icons 目录下
pnpm run build:all
# 或者
pnpm run generate:packages

# 支持可选参数（示例）：
# 使用自定义配置文件、输入目录、输出基目录和框架选择
pnpm run build:all -- --config ldesign-icons.config.json --input examples/svg --output output --frameworks vue3,react
```

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 运行测试 UI
pnpm test:ui
```

## 📚 API 文档

### IconConverter

主要的转换器类：

```typescript
class IconConverter {
  constructor(config: Partial<IconConfig>);
  convert(): Promise<ConversionResult>;
  validateConfig(): ValidationResult;
}
```

### SVGParser

SVG 解析器：

```typescript
class SVGParser {
  static parse(content: string): ParsedSVG;
  static validate(svg: ParsedSVG): ValidationResult;
}
```

### ConfigManager

配置管理器：

```typescript
class ConfigManager {
  static createDefault(target: TargetFramework, inputDir: string, outputDir: string): IconConfig;
  static loadFromFile(filePath: string): Promise<IconConfig>;
  static validate(config: Partial<IconConfig>): ValidationResult;
}
```

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md)。

## 📄 许可证

MIT License - 查看 [LICENSE](../../LICENSE) 文件了解详情。

## 🔗 相关链接

- [LDesign 设计系统](https://github.com/ldesign/ldesign)
- [问题反馈](https://github.com/ldesign/ldesign/issues)
- [更新日志](./CHANGELOG.md)
