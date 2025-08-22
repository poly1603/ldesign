# 🎉 LDesign Festival Demo - 节日主题挂件系统演示

> 一个展示 LDesign Theme 节日主题挂件系统强大功能的交互式演示项目

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./package.json)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../../LICENSE)

## ✨ 功能亮点

### 🎨 智能主题系统

- **自动主题推荐** - 根据当前日期智能推荐合适的节日主题
- **无缝主题切换** - 平滑的过渡动画，视觉体验丝滑流畅
- **主题持久化** - 自动保存用户的主题偏好，刷新页面后保持选择

### 🎭 动态挂件系统

- **SVG 矢量图标** - 高质量的矢量装饰，支持任意缩放不失真
- **智能挂件联动** - 主题切换时所有挂件自动更新为新主题风格
- **灵活挂件控制** - 支持单独控制每个挂件的显示、隐藏和样式

### 📱 现代化体验

- **完全响应式** - 完美适配桌面、平板、手机等各种设备
- **性能优化** - GPU 加速动画，60fps 流畅体验
- **无障碍支持** - 支持键盘导航和屏幕阅读器

### 🛠️ 开发者友好

- **TypeScript 全覆盖** - 完整的类型定义，开发体验极佳
- **组件化设计** - 高度模块化，易于扩展和维护
- **完整测试覆盖** - 单元测试 + E2E 测试，质量有保障

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0

### 安装与运行

```bash
# 克隆项目
git clone <repository-url>
cd ldesign/packages/theme/examples/festival-demo

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 在浏览器中打开 http://localhost:5173
```

### 构建与部署

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview

# 运行测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e
```

## 🎨 主题展示

### 🧧 春节主题

- **主色调**: 中国红 (#DC2626) + 金色 (#F59E0B)
- **装饰元素**: 红灯笼、福字、烟花、梅花、中国龙、金币
- **激活时间**: 1 月 20 日 - 3 月 5 日
- **设计理念**: 传承中华文化，营造浓厚的新年氛围

### 🎄 圣诞主题

- **主色调**: 圣诞绿 (#16A34A) + 圣诞红 (#DC2626) + 金色 (#FFD700)
- **装饰元素**: 圣诞树、铃铛、雪花、礼物盒、星星、圣诞老人
- **激活时间**: 12 月 1 日 - 1 月 6 日
- **设计理念**: 温馨浪漫的西方节日氛围

### ⚪ 默认主题

- **主色调**: 经典蓝 (#1890FF) + 紫色 (#722ED1) + 绿色 (#52C41A)
- **装饰元素**: 简约光点、几何图形、波浪线条
- **设计理念**: 简洁优雅，适合日常使用

## 🎯 核心特性演示

### 1. 挂件系统演示

- **按钮挂件** - 展示各种类型按钮的装饰效果
- **卡片挂件** - 信息卡片、产品卡片、通知卡片等
- **表单挂件** - 输入框、选择器、文本域的装饰
- **面板挂件** - 控制面板、信息面板、工具面板
- **背景挂件** - 页面背景装饰效果

### 2. 主题管理器

- 实时显示当前主题状态
- 一键获取智能主题推荐
- 自动/手动主题切换模式
- 主题切换历史记录

### 3. 状态监控栏

- 实时挂件数量统计
- 性能状态监控
- 主题切换历史
- 调试信息显示

## 🛠️ 技术架构

### 核心技术栈

- **前端框架**: Vue 3.4+ (Composition API)
- **开发语言**: TypeScript 5.3+
- **构建工具**: Vite 5.0+
- **样式方案**: Less + CSS Variables
- **主题系统**: @ldesign/theme + @ldesign/color

### 测试框架

- **单元测试**: Vitest + Vue Test Utils
- **E2E 测试**: Playwright
- **覆盖率**: V8 Coverage

### 开发工具

- **代码规范**: ESLint + Prettier
- **类型检查**: Vue TSC
- **包管理**: pnpm workspace

## 📖 使用指南

### 基础用法

```typescript
import { initializeWidgetSystem, switchTheme, applyWidget } from '@ldesign/theme'

// 初始化挂件系统
initializeWidgetSystem({
  theme: 'default',
  autoApply: true,
  loadStyles: true,
})

// 切换主题
await switchTheme('spring-festival')

// 为元素应用挂件
const button = document.querySelector('.my-button')
applyWidget(button, 'button')
```

### 高级配置

```typescript
import { createThemeSwitcher } from '@ldesign/theme'

// 创建主题切换器
const themeSwitcher = createThemeSwitcher({
  defaultTheme: 'default',
  autoSwitch: true,
  enableTransitions: true,
  persistTheme: true,
  onThemeChange: event => {
    console.log('主题已切换:', event.theme)
  },
})
```

## 🎮 交互指南

### 主题切换

1. 点击页面顶部的主题按钮
2. 观察页面元素的装饰变化
3. 体验平滑的过渡动画效果

### 挂件控制

1. 使用各演示区域的控制按钮
2. 实时开启/关闭挂件显示
3. 调整挂件透明度和动画速度

### 调试模式

1. 点击"开启调试模式"按钮
2. 观察挂件边界和类型标识
3. 查看状态栏的调试信息

## 🔧 自定义开发

### 添加新主题

```typescript
import { createFestivalTheme } from '@ldesign/theme'

const myTheme = createFestivalTheme({
  id: 'my-theme',
  name: '我的主题',
  description: '自定义主题描述',
  primaryColor: '#FF6B6B',
  widgets: [
    // 挂件配置
  ],
})
```

### 创建自定义挂件

```typescript
import { applyWidget } from '@ldesign/theme'

// 为自定义元素应用挂件
const myElement = document.querySelector('.my-element')
applyWidget(myElement, 'button')
```

## 📊 性能指标

- **首屏加载**: < 1.5s
- **主题切换**: < 300ms
- **挂件渲染**: < 100ms
- **内存占用**: < 50MB
- **包体积**: < 200KB (gzipped)

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](../../CONTRIBUTING.md) 了解详情。

### 开发流程

1. Fork 项目
2. 创建特性分支
3. 提交变更
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目基于 [MIT 许可证](../../LICENSE) 开源。

## 🙏 致谢

感谢所有为 LDesign 项目做出贡献的开发者们！

---

<div align="center">
  <p>如果这个项目对你有帮助，请给我们一个 ⭐️</p>
  <p>Made with ❤️ by LDesign Team</p>
</div>
