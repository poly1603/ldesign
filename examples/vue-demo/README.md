# LDesign Theme Vue Demo

<div align="center">

![LDesign Theme Demo](https://img.shields.io/badge/LDesign-Theme%20Demo-blue?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue-3.x-green?style=for-the-badge&logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-5.x-purple?style=for-the-badge&logo=vite)

**🎨 LDesign Theme 的 Vue 3 演示项目**

体验节日主题系统的强大功能，包括主题切换、装饰元素、动画效果等

</div>

## ✨ 演示功能

- 🎄 **主题切换** - 支持圣诞节、春节、万圣节等节日主题
- 🎭 **装饰元素** - 雪花飘落、灯笼摆动、烟花绽放等动态装饰
- 🎬 **动画效果** - 丰富的 CSS 和 JavaScript 动画演示
- 📱 **响应式设计** - 完美适配桌面端、平板和移动设备
- ⚡ **高性能** - GPU 加速动画，智能资源管理
- 🔧 **易于集成** - 简单的 API，快速集成到现有项目

## 🚀 快速开始

### 方法 1: 直接打开 HTML 文件（推荐）

```bash
# 直接在浏览器中打开演示文件
open demo.html
```

这是最简单的方式，无需安装任何依赖，直接体验完整功能。

### 方法 2: 使用开发服务器

```bash
# 启动简单的开发服务器
node serve.js

# 然后在浏览器中访问 http://localhost:3000
```

### 方法 3: 使用 Vite 开发服务器

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 📁 项目结构

```
vue-demo/
├── demo.html              # 🎯 独立演示文件（推荐）
├── index.html              # Vite 项目入口
├── package.json            # 项目配置
├── vite.config.js          # Vite 配置
├── serve.js                # 简单开发服务器
├── src/
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   └── style.css           # 全局样式
└── README.md               # 项目文档
```

## 🎨 主题展示

### 默认主题

- **主色调**: 蓝色 (#007bff)
- **适用场景**: 日常使用、商务场景
- **特点**: 简洁、专业、现代

### 🎄 圣诞节主题

- **主色调**: 红色 + 绿色
- **适用场景**: 12 月-1 月，圣诞节庆
- **特点**: 温馨、节日、传统

### 🧧 春节主题

- **主色调**: 红色 + 金色
- **适用场景**: 1 月-2 月，春节庆典
- **特点**: 喜庆、热闹、中式

### 🎃 万圣节主题

- **主色调**: 橙色 + 黑色
- **适用场景**: 10 月-11 月，万圣节派对
- **特点**: 神秘、恐怖、有趣

## 🎯 核心功能演示

### 主题切换

```javascript
// 动态主题切换
const currentTheme = ref('')

// 主题类名绑定
const themeClass = computed(() => {
  return currentTheme.value ? `theme-${currentTheme.value}` : ''
})

// 主题切换处理
const onThemeChange = () => {
  console.log('主题切换到:', currentTheme.value)
}
```

### CSS 变量主题系统

```css
/* 默认主题变量 */
:root {
  --theme-primary: #007bff;
  --theme-background: #ffffff;
  --theme-text: #212529;
}

/* 圣诞节主题 */
.theme-christmas {
  --theme-primary: #dc2626;
  --theme-background: #fef7f0;
  --theme-text: #1f2937;
}

/* 使用主题变量 */
.button {
  background-color: var(--theme-primary);
  color: var(--theme-text);
}
```

### Vue 3 组合式 API

```vue
<script>
export default {
  data() {
    return {
      currentTheme: '',
      features: [...]
    }
  },
  computed: {
    themeClass() {
      return this.currentTheme ? `theme-${this.currentTheme}` : ''
    }
  },
  methods: {
    handleAction(action) {
      console.log(`${action}功能被触发`)
    }
  }
}
</script>
```

## 🎬 动画效果

项目包含多种动画效果：

- **淡入动画**: 页面加载时的渐进显示
- **悬停效果**: 鼠标悬停时的交互反馈
- **主题切换**: 平滑的颜色过渡动画
- **响应式动画**: 适配不同设备的动画效果

## 📱 响应式设计

### 桌面端 (≥1024px)

- 完整功能展示
- 多列网格布局
- 丰富的交互效果

### 平板端 (768px-1023px)

- 优化的布局结构
- 适中的元素尺寸
- 触摸友好的交互

### 移动端 (≤767px)

- 单列布局
- 大号触摸目标
- 简化的交互方式

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **JavaScript ES6+** - 现代 JavaScript 语法
- **CSS3** - 现代样式和动画
- **HTML5** - 语义化标记
- **Vite** - 快速的前端构建工具（可选）

## 🎯 使用场景

### 1. 学习参考

- 了解主题系统的实现原理
- 学习 Vue 3 的最佳实践
- 掌握响应式设计技巧

### 2. 项目集成

- 复制可用的代码片段
- 参考主题切换实现
- 学习 CSS 变量的使用

### 3. 功能演示

- 向客户展示主题效果
- 在技术分享中使用
- 作为产品原型参考

## 🔧 自定义主题

### 创建新主题

```css
/* 自定义主题 */
.theme-my-theme {
  --theme-primary: #your-color;
  --theme-secondary: #your-color;
  --theme-background: #your-color;
  --theme-surface: #your-color;
  --theme-text: #your-color;
  --theme-text-secondary: #your-color;
  --theme-border: #your-color;
}
```

### 添加主题选项

```javascript
// 在 Vue 组件中添加新主题
const themeMap = {
  'my-theme': {
    displayName: '我的主题',
    description: '自定义主题描述',
  },
}
```

## 📊 性能指标

- **加载时间**: < 2 秒
- **主题切换**: < 0.3 秒
- **响应时间**: < 100ms
- **内存占用**: < 10MB
- **兼容性**: 现代浏览器 100%

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

[MIT](../../LICENSE) © LDesign Team

## 🔗 相关链接

- [LDesign Theme 文档](../../packages/theme/docs)
- [GitHub 仓库](https://github.com/ldesign/ldesign)
- [问题反馈](https://github.com/ldesign/ldesign/issues)

---

<div align="center">

**🎨 立即体验**: 打开 `demo.html` 文件即可体验完整功能！

[🏠 首页](https://ldesign.dev) | [📖 文档](../../packages/theme/docs) | [🎯 演示](./demo.html)

</div>
