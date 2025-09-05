# SVG IconFont 转换工具

@ldesign/kit 提供了强大的 SVG 到 IconFont 转换工具，支持批量转换、多种字体格式和自动生成样式文件。

## 快速开始

### 基本使用

```typescript
import { SvgToIconFont } from '@ldesign/kit/iconfont'

// 创建转换器
const converter = new SvgToIconFont({
  fontName: 'MyIcons',
  outputDir: './dist/fonts',
  formats: ['ttf', 'woff', 'woff2', 'eot', 'svg'],
})

// 从目录转换 SVG 文件
const result = await converter.convertFromDirectory('./src/icons')

console.log('转换完成:', result)
// {
//   success: true,
//   fontFiles: ['./dist/fonts/MyIcons.ttf', './dist/fonts/MyIcons.woff', ...],
//   cssFiles: ['./dist/fonts/MyIcons.css', './dist/fonts/MyIcons.scss', ...],
//   icons: [...],
//   duration: 1234
// }
```

### 从文件列表转换

```typescript
const svgFiles = ['./icons/home.svg', './icons/user.svg', './icons/settings.svg']

const result = await converter.convertFromFiles(svgFiles)
```

## 配置选项

### 基础配置

```typescript
const converter = new SvgToIconFont({
  // 字体名称（必需）
  fontName: 'MyIcons',

  // 字体族名称（可选，默认使用 fontName）
  fontFamily: 'My Icon Font',

  // CSS 类名（可选，默认使用 fontName 小写）
  className: 'my-icon',

  // CSS 前缀（可选，默认 'icon-'）
  cssPrefix: 'icon-',

  // 输出目录（必需）
  outputDir: './dist/fonts',

  // 生成的字体格式
  formats: ['ttf', 'woff', 'woff2', 'eot', 'svg'],

  // 起始 Unicode 码点
  startUnicode: 0xe001,

  // 是否标准化 SVG
  normalize: true,

  // 字体高度
  fontHeight: 1000,

  // 字体下降值
  descent: 200,
})
```

### 元数据配置

```typescript
const converter = new SvgToIconFont({
  fontName: 'MyIcons',
  outputDir: './dist/fonts',

  // 字体元数据
  metadata: {
    title: 'My Icon Font',
    description: 'Custom icon font for my application',
    url: 'https://myapp.com',
    author: 'My Name',
    license: 'MIT',
    version: '1.0.0',
  },
})
```

### CSS 生成选项

```typescript
const converter = new SvgToIconFont({
  fontName: 'MyIcons',
  outputDir: './dist/fonts',

  // CSS 生成选项
  cssOptions: {
    // 是否生成 SCSS 文件
    generateScss: true,

    // 是否生成 Less 文件
    generateLess: true,

    // 是否生成 Stylus 文件
    generateStylus: true,

    // 基础选择器
    baseSelector: '.my-icon',

    // 类前缀
    classPrefix: 'icon-',
  },
})
```

## 生成的文件

### 字体文件

转换器会生成多种格式的字体文件：

- `MyIcons.ttf` - TrueType 字体
- `MyIcons.woff` - Web 字体格式 1.0
- `MyIcons.woff2` - Web 字体格式 2.0
- `MyIcons.eot` - Embedded OpenType（IE 支持）
- `MyIcons.svg` - SVG 字体

### 样式文件

根据配置生成相应的样式文件：

#### CSS 文件 (MyIcons.css)

```css
@font-face {
  font-family: 'MyIcons';
  src: url('./MyIcons.eot');
  src:
    url('./MyIcons.eot?#iefix') format('embedded-opentype'),
    url('./MyIcons.woff2') format('woff2'),
    url('./MyIcons.woff') format('woff'),
    url('./MyIcons.ttf') format('truetype'),
    url('./MyIcons.svg#MyIcons') format('svg');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}

.my-icon {
  font-family: 'MyIcons' !important;
  speak: never;
  font-style: normal;
  font-weight: normal;
  font-variant: normal;
  text-transform: none;
  line-height: 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.my-icon.icon-home:before {
  content: '\e001';
}

.my-icon.icon-user:before {
  content: '\e002';
}
```

#### SCSS 文件 (MyIcons.scss)

```scss
$MyIcons-font-family: 'MyIcons';
$MyIcons-prefix: 'icon-';

@font-face {
  font-family: $MyIcons-font-family;
  // ... 字体声明
}

.my-icon {
  font-family: $MyIcons-font-family !important;
  // ... 基础样式
}

.my-icon.#{$MyIcons-prefix}home:before {
  content: '\e001';
}
```

### 预览文件

自动生成 HTML 预览文件：

```typescript
// 生成预览文件
const previewPath = await converter.generatePreview(result.icons)
console.log('预览文件:', previewPath)
```

## 高级功能

### 事件监听

```typescript
// 监听转换过程
converter.on('conversionStarted', data => {
  console.log('开始转换:', data)
})

converter.on('svgFilesScanned', data => {
  console.log(`扫描到 ${data.count} 个 SVG 文件`)
})

converter.on('iconsLoaded', data => {
  console.log(`加载了 ${data.count} 个图标`)
})

converter.on('fontsGenerated', data => {
  console.log('字体文件生成完成:', data.files)
})

converter.on('cssGenerated', data => {
  console.log('CSS 文件生成完成:', data.files)
})

converter.on('conversionCompleted', result => {
  console.log('转换完成，耗时:', result.duration, 'ms')
})
```

### 添加单个图标

```typescript
// 添加单个图标
const icon = await converter.addIcon('./new-icon.svg', 'new-icon')
console.log('添加图标:', icon)
```

### SVG 优化

```typescript
import { IconFontGenerator } from '@ldesign/kit/iconfont'

const generator = new IconFontGenerator(options)

// 验证 SVG 内容
const validation = generator.validateSvgContent(svgContent)
if (!validation.valid) {
  console.error('SVG 验证失败:', validation.errors)
}

// 优化 SVG 内容
const optimized = generator.optimizeSvgContent(svgContent)
```

## 最佳实践

### 1. SVG 文件准备

```bash
# 推荐的 SVG 文件结构
icons/
├── home.svg
├── user.svg
├── settings.svg
└── navigation/
    ├── arrow-left.svg
    └── arrow-right.svg
```

**SVG 文件要求：**

- 使用单色图标（避免复杂的颜色和渐变）
- 设置合适的 viewBox
- 使用 `currentColor` 作为填充色
- 移除不必要的元素和属性

```svg
<!-- 推荐的 SVG 格式 -->
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>
```

### 2. 命名规范

```typescript
// 使用一致的命名规范
const converter = new SvgToIconFont({
  fontName: 'AppIcons', // PascalCase
  className: 'app-icon', // kebab-case
  cssPrefix: 'icon-', // 统一前缀
})
```

### 3. 版本管理

```typescript
// 在 package.json 中管理版本
const packageJson = require('./package.json')

const converter = new SvgToIconFont({
  fontName: 'AppIcons',
  outputDir: './dist/fonts',
  metadata: {
    version: packageJson.version,
    description: 'Application icon font',
  },
})
```

### 4. 构建集成

```javascript
// webpack.config.js
const { SvgToIconFont } = require('@ldesign/kit/iconfont')

module.exports = {
  // ... 其他配置
  plugins: [
    {
      apply: compiler => {
        compiler.hooks.beforeCompile.tapAsync('IconFontPlugin', async (params, callback) => {
          const converter = new SvgToIconFont({
            fontName: 'AppIcons',
            outputDir: './dist/fonts',
          })

          await converter.convertFromDirectory('./src/icons')
          callback()
        })
      },
    },
  ],
}
```

## 故障排除

### 常见问题

1. **SVG 文件无法转换**

   ```typescript
   // 检查 SVG 文件格式
   const validation = generator.validateSvgContent(svgContent)
   console.log('验证结果:', validation)
   ```

2. **字体文件生成失败**

   ```typescript
   // 检查输出目录权限
   await fs.access(outputDir, fs.constants.W_OK)
   ```

3. **CSS 样式不生效**
   ```css
   /* 确保正确引入字体文件 */
   @font-face {
     font-family: 'MyIcons';
     src: url('./fonts/MyIcons.woff2') format('woff2');
   }
   ```

### 调试模式

```typescript
// 启用详细日志
converter.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```
