# 🛠️ 开发工具集合

@ldesign/launcher 提供了丰富的开发工具，帮助提升开发效率和项目质量。

## 🎨 字体转换工具

将特殊字体转换为 WebFont 格式，支持字体子集化和优化。

### 功能特点
- ✅ 多格式支持 (TTF, OTF, WOFF, WOFF2)
- ✅ 字体子集化 (减小文件大小)
- ✅ 自动字符分析 (提取项目中使用的字符)
- ✅ CSS 文件生成
- ✅ 字体族映射
- ✅ 字体显示策略配置

### 使用方法
```bash
# 基础字体转换
launcher tools font

# 指定源目录和输出目录
launcher tools font --source ./fonts --output ./public/fonts

# 启用子集化和 CSS 生成
launcher tools font --subset --css

# 指定输出格式
launcher tools font --formats woff2,woff

# 完整配置示例
launcher tools font \
  --source ./src/assets/fonts \
  --output ./public/fonts \
  --formats woff2,woff,ttf \
  --subset \
  --css \
  --prefix MyFont
```

### 配置选项
- `--source, -s`: 字体源目录 (默认: `./src/assets/fonts`)
- `--output, -o`: 输出目录 (默认: `./public/fonts`)
- `--formats`: 输出格式，逗号分隔 (默认: `woff2,woff`)
- `--subset`: 启用字体子集化
- `--css`: 生成 CSS 文件
- `--prefix`: 组件名前缀

## 🖼️ SVG 组件生成器

根据项目类型将 SVG 文件转换为对应框架的组件。

### 功能特点
- ✅ 多框架支持 (Vue, React, Svelte, Angular)
- ✅ 自动框架检测
- ✅ TypeScript 支持
- ✅ SVG 优化
- ✅ 组件索引生成
- ✅ 自定义模板支持

### 使用方法
```bash
# 基础 SVG 组件生成
launcher tools svg

# 指定源目录和输出目录
launcher tools svg --source ./icons --output ./components/icons

# 指定框架和启用 TypeScript
launcher tools svg --framework react --typescript

# 自定义组件前缀和优化 SVG
launcher tools svg --prefix Icon --optimize

# 完整配置示例
launcher tools svg \
  --source ./src/assets/icons \
  --output ./src/components/icons \
  --framework vue \
  --prefix Icon \
  --typescript \
  --optimize
```

### 配置选项
- `--source, -s`: SVG 源目录 (默认: `./src/assets/icons`)
- `--output, -o`: 输出目录 (默认: `./src/components/icons`)
- `--framework, -f`: 目标框架 (默认: `auto`)
- `--prefix`: 组件名前缀 (默认: `Icon`)
- `--typescript`: 生成 TypeScript
- `--optimize`: 优化 SVG

## 🖼️ 图片优化工具

自动优化和转换图片格式，支持 WebP、AVIF 等现代格式。

### 功能特点
- ✅ 现代格式支持 (WebP, AVIF)
- ✅ 响应式图片生成
- ✅ 质量控制
- ✅ 批量处理
- ✅ 优化统计
- ✅ 压缩率报告

### 使用方法
```bash
# 基础图片优化
launcher tools image

# 指定源目录和输出目录
launcher tools image --source ./images --output ./public/images

# 生成响应式图片
launcher tools image --responsive --sizes 320,640,1024

# 指定格式和质量
launcher tools image --formats webp,avif --quality 85

# 完整配置示例
launcher tools image \
  --source ./src/assets/images \
  --output ./public/images \
  --formats webp,avif,jpeg \
  --quality 80 \
  --responsive \
  --sizes 320,640,768,1024,1280,1920
```

### 配置选项
- `--source, -s`: 图片源目录 (默认: `./src/assets/images`)
- `--output, -o`: 输出目录 (默认: `./public/images`)
- `--formats`: 输出格式，逗号分隔 (默认: `webp,jpeg`)
- `--quality`: 图片质量 1-100 (默认: `80`)
- `--responsive`: 生成响应式图片
- `--sizes`: 响应式尺寸，逗号分隔 (默认: `320,640,768,1024,1280,1920`)

## 🌍 国际化管理工具

自动管理多语言文件，支持翻译提取、验证和同步。

### 功能特点
- ✅ 自动翻译键提取
- ✅ 翻译完整性验证
- ✅ 类型定义生成
- ✅ 多格式支持 (JSON, YAML, JS, TS)
- ✅ 缺失翻译检测
- ✅ 未使用键检测

### 使用方法
```bash
# 基础国际化管理
launcher tools i18n

# 指定语言文件目录和支持的语言
launcher tools i18n --dir ./locales --locales en,zh-CN,ja

# 提取、验证和生成类型
launcher tools i18n --extract --validate --generate-types

# 完整配置示例
launcher tools i18n \
  --dir ./src/locales \
  --locales en,zh-CN,ja,ko \
  --extract \
  --validate \
  --generate-types
```

### 配置选项
- `--dir, -d`: 语言文件目录 (默认: `./src/locales`)
- `--locales, -l`: 支持的语言，逗号分隔 (默认: `en,zh-CN`)
- `--extract`: 提取翻译键
- `--validate`: 验证翻译完整性
- `--generate-types`: 生成类型定义

## 📚 API 文档生成器

自动生成 API 文档，支持多种格式和框架。

### 功能特点
- ✅ 多格式支持 (Markdown, HTML, JSON, OpenAPI)
- ✅ 注释解析
- ✅ 路由自动检测
- ✅ 交互式文档
- ✅ 示例代码生成
- ✅ Swagger UI 集成

### 使用方法
```bash
# 基础 API 文档生成
launcher tools api-docs

# 指定源目录和输出目录
launcher tools api-docs --source ./api --output ./docs/api

# 生成 OpenAPI 规范和交互式文档
launcher tools api-docs --format openapi --interactive

# 包含示例代码
launcher tools api-docs --examples

# 完整配置示例
launcher tools api-docs \
  --source ./src/api \
  --output ./docs/api \
  --format openapi \
  --interactive \
  --examples
```

### 配置选项
- `--source, -s`: API 源目录 (默认: `./src/api`)
- `--output, -o`: 输出目录 (默认: `./docs/api`)
- `--format, -f`: 文档格式 (默认: `markdown`)
- `--interactive`: 生成交互式文档
- `--examples`: 生成示例代码

## 🎨 主题管理工具

支持多主题切换、动态主题生成和主题定制。

### 功能特点
- ✅ 多主题支持
- ✅ 暗色模式
- ✅ CSS 变量生成
- ✅ 主题切换器
- ✅ 系统主题检测
- ✅ 主题预览

### 使用方法
```bash
# 基础主题管理
launcher tools theme

# 指定主题目录和输出目录
launcher tools theme --dir ./themes --output ./public/themes

# 生成主题切换器和支持暗色模式
launcher tools theme --generate-switcher --dark-mode

# 完整配置示例
launcher tools theme \
  --dir ./src/themes \
  --output ./public/themes \
  --generate-switcher \
  --dark-mode
```

### 配置选项
- `--dir, -d`: 主题目录 (默认: `./src/themes`)
- `--output, -o`: 输出目录 (默认: `./public/themes`)
- `--generate-switcher`: 生成主题切换器
- `--dark-mode`: 支持暗色模式

## 📱 PWA 支持工具

自动生成 PWA 所需的文件和配置。

### 功能特点
- ✅ Web App Manifest 生成
- ✅ Service Worker 生成
- ✅ 图标生成
- ✅ 离线页面
- ✅ 推送通知支持
- ✅ 缓存策略配置

### 使用方法
```bash
# 基础 PWA 设置
launcher tools pwa

# 指定应用信息
launcher tools pwa --name "My App" --short-name "MyApp"

# 自定义主题和背景颜色
launcher tools pwa --theme-color "#007bff" --bg-color "#ffffff"

# 生成 Service Worker 和离线页面
launcher tools pwa --generate-sw --offline-page offline.html

# 完整配置示例
launcher tools pwa \
  --name "My Progressive Web App" \
  --short-name "MyPWA" \
  --theme-color "#007bff" \
  --bg-color "#ffffff" \
  --generate-sw \
  --offline-page offline.html
```

### 配置选项
- `--name`: 应用名称 (默认: `My App`)
- `--short-name`: 应用短名称 (默认: `MyApp`)
- `--theme-color`: 主题颜色 (默认: `#000000`)
- `--bg-color`: 背景颜色 (默认: `#ffffff`)
- `--generate-sw`: 生成 Service Worker
- `--offline-page`: 离线页面路径

## 🔧 工具集成

所有工具都可以通过 Vite 插件的形式集成到项目中：

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import {
  createFontConverterPlugin,
  createSVGComponentPlugin,
  createImageOptimizerPlugin,
  createI18nManagerPlugin,
  createAPIDocPlugin,
  createThemeManagerPlugin,
  createPWASupportPlugin
} from '@ldesign/launcher'

export default defineConfig({
  plugins: [
    // 字体转换
    createFontConverterPlugin({
      sourceDir: './src/assets/fonts',
      outputDir: './public/fonts',
      formats: ['woff2', 'woff'],
      subset: true,
      generateCSS: true
    }),
    
    // SVG 组件生成
    createSVGComponentPlugin({
      sourceDir: './src/assets/icons',
      outputDir: './src/components/icons',
      framework: 'vue',
      typescript: true
    }),
    
    // 图片优化
    createImageOptimizerPlugin({
      sourceDir: './src/assets/images',
      outputDir: './public/images',
      outputFormats: ['webp', 'avif', 'jpeg'],
      responsive: true
    }),
    
    // 国际化管理
    createI18nManagerPlugin({
      localesDir: './src/locales',
      locales: ['en', 'zh-CN'],
      autoExtract: true,
      generateTypes: true
    }),
    
    // API 文档生成
    createAPIDocPlugin({
      sourceDir: './src/api',
      outputDir: './docs/api',
      format: 'openapi',
      interactive: true
    }),
    
    // 主题管理
    createThemeManagerPlugin({
      themesDir: './src/themes',
      outputDir: './public/themes',
      generateSwitcher: true,
      supportDarkMode: true
    }),
    
    // PWA 支持
    createPWASupportPlugin({
      appName: 'My App',
      shortName: 'MyApp',
      generateSW: true,
      enableNotifications: true
    })
  ]
})
```

## 📊 使用统计

使用 `launcher tools` 命令可以查看所有可用的工具：

```bash
# 查看所有工具
launcher tools --help

# 查看特定工具的帮助
launcher tools font --help
launcher tools svg --help
launcher tools image --help
launcher tools i18n --help
launcher tools api-docs --help
launcher tools theme --help
launcher tools pwa --help
```
