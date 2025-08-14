# LDesign Theme Vue Demo - 增强版节日主题系统

<div align="center">

![LDesign Theme Demo](https://img.shields.io/badge/LDesign-Enhanced%20Theme%20Demo-blue?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3.x-green?style=for-the-badge&logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite)

**🎨 LDesign 增强版节日主题系统演示**

体验完整的节日氛围营造，包含动态装饰、完整颜色覆盖、节日动画等

</div>

## 🎪 核心特性

### 🌈 完整颜色系统覆盖

- **主要颜色**: primary, secondary, accent
- **背景颜色**: background, background-secondary, surface, surface-secondary, surface-hover
- **文字颜色**: text, text-secondary, text-muted, text-inverse
- **边框颜色**: border, border-light, border-dark
- **状态颜色**: success, warning, error, info
- **阴影颜色**: shadow, shadow-light, shadow-dark
- **装饰颜色**: decoration-primary, decoration-secondary

### ✨ 节日装饰元素

- **圣诞节**: 🎄 🎅 ❄️ ⭐ 🎁 🔔
- **春节**: 🧧 🐉 🏮 💰 🎆 🎊
- **万圣节**: 🎃 👻 🦇 🕷️ 🕸️ 💀

### 🎬 动态动画效果

- **雪花飘落**: 多层次雪花动画，GPU 加速
- **灯笼摆动**: 传统灯笼摆动效果
- **烟花绽放**: 绚烂烟花爆炸动画
- **南瓜闪烁**: 万圣节南瓜灯闪烁
- **装饰边框**: 流动的彩色边框动画

## 🎨 主题详情

### 🎄 圣诞节主题

```css
/* 配色方案 */
--theme-primary: #dc2626; /* 圣诞红 */
--theme-secondary: #16a34a; /* 圣诞绿 */
--theme-accent: #fbbf24; /* 金色装饰 */
--theme-background: #fef7f0; /* 暖白色背景 */
--theme-surface: #ffffff; /* 纯白表面 */
```

**装饰元素**: 雪花飘落、圣诞树闪烁、圣诞帽摆动 **氛围特色**: 温馨节日、冬季暖意 **适用时间**: 12 月
1 日 - 1 月 7 日

### 🧧 春节主题

```css
/* 配色方案 */
--theme-primary: #dc2626; /* 中国红 */
--theme-secondary: #fbbf24; /* 金色 */
--theme-accent: #f59e0b; /* 深金色 */
--theme-background: #fef3c7; /* 淡金色背景 */
--theme-surface: #ffffff; /* 纯白表面 */
```

**装饰元素**: 灯笼摆动、烟花绽放、金币飘落、福字发光 **氛围特色**: 喜庆热闹、传统文化 **适用时间**:
1 月 20 日 - 2 月 20 日

### 🎃 万圣节主题

```css
/* 配色方案 */
--theme-primary: #ea580c; /* 南瓜橙 */
--theme-secondary: #1f2937; /* 深黑色 */
--theme-accent: #fbbf24; /* 金色点缀 */
--theme-background: #1f2937; /* 深黑色背景 */
--theme-surface: #374151; /* 深灰色表面 */
```

**装饰元素**: 南瓜灯闪烁、幽灵飘浮、蝙蝠飞行、蜘蛛网闪烁 **氛围特色**: 神秘恐怖、秋季诡异 **适用时
间**: 10 月 15 日 - 11 月 5 日

## 🚀 快速开始

### 方法 1: 直接打开 HTML 文件（推荐）

```bash
# 直接在浏览器中打开演示文件
open demo.html
```

### 方法 2: 使用 Vue 开发服务器

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 📁 项目结构

```
vue-demo/
├── demo.html              # 🎯 独立演示文件（完整功能）
├── index.html              # Vue 应用入口
├── src/
│   ├── App.vue             # 主应用组件（增强主题信息）
│   ├── main.ts             # 应用入口
│   └── style.css           # 完整主题系统和装饰动画
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
└── vite.config.ts          # Vite 配置
```

## 🎯 技术实现

### CSS 变量系统

使用 CSS 自定义属性实现主题切换，确保所有 UI 元素都能正确响应主题变化。

### 装饰动画

- **GPU 加速**: 使用 `transform3d` 和 `will-change` 优化性能
- **响应式**: 根据屏幕尺寸自动调整装饰元素
- **可访问性**: 支持 `prefers-reduced-motion` 媒体查询

### 节日氛围营造

- **按钮装饰**: 每个按钮都有对应的节日图标
- **卡片装饰**: 功能卡片右上角显示节日元素
- **边框动画**: 页面顶部的流动彩色边框

## 🌟 使用指南

### 主题切换

点击页面右上角的主题选择器，选择不同的节日主题。

### 查看主题详情

主题切换后，页面会显示当前主题的详细信息，包括：

- 配色方案
- 装饰元素
- 氛围特色
- 适用时间

### 自定义主题

可以通过修改 CSS 变量来创建自定义主题：

```css
.theme-custom {
  --theme-primary: #your-primary-color;
  --theme-secondary: #your-secondary-color;
  --theme-accent: #your-accent-color;
  /* 更多颜色变量... */
}
```

## 🔧 技术栈

- **Vue 3**: 组合式 API，响应式系统
- **TypeScript**: 类型安全，更好的开发体验
- **Vite**: 快速的构建工具
- **CSS Variables**: 动态主题切换
- **CSS Animations**: 丰富的动画效果
- **Responsive Design**: 移动端适配

## 📱 浏览器支持

- Chrome >= 60
- Firefox >= 60
- Safari >= 12
- Edge >= 79

## 📄 许可证

MIT License
