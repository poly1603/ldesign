# 平板登录模板 - 默认版本

> 专为平板设备优化的登录界面模板，经过全面性能优化，提供流畅的用户体验。

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](./CHANGELOG.md)
[![Performance](https://img.shields.io/badge/performance-optimized-green.svg)](./OPTIMIZATION_NOTES.md)
[![Accessibility](https://img.shields.io/badge/a11y-supported-green.svg)](#可访问性)

---

## ✨ 特性

### 🚀 性能优化
- ✅ **DOM节点减少27%** - 从15个减少到11个装饰元素
- ✅ **动画元素减少33%** - 从12个减少到8个
- ✅ **GPU加速全覆盖** - 所有动画使用transform3d
- ✅ **CSS Containment** - 优化渲染隔离
- ✅ **静态内容优化** - 使用v-once减少重渲染

### 💾 内存优化
- ✅ **粒子数量减半** - 从8个减少到4个
- ✅ **计算属性合并** - 减少响应式追踪开销
- ✅ **内存占用降低5-10%**

### ♿ 可访问性
- ✅ **prefers-reduced-motion支持** - 尊重用户动画偏好
- ✅ **语义化HTML** - 更好的屏幕阅读器支持
- ✅ **键盘导航友好**

### 🎨 设计特点
- 🎯 平板专用装饰元素（六边形、网格、粒子）
- 🌊 流畅的动画效果
- 📱 横屏竖屏自动适配
- 🎨 完全可自定义主题

---

## 📦 安装使用

### 基础使用

```vue
<template>
  <TabletLoginTemplate
    title="欢迎登录"
    subtitle="在平板上享受更好的体验"
    :primary-color="#667eea"
    :secondary-color="#764ba2"
    :enable-animations="true"
  >
    <template #content>
      <!-- 你的登录表单 -->
      <form>
        <input type="text" placeholder="用户名" />
        <input type="password" placeholder="密码" />
        <button type="submit">登录</button>
      </form>
    </template>
  </TabletLoginTemplate>
</template>

<script setup>
import TabletLoginTemplate from './index.vue'
</script>
```

### Props配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'平板登录'` | 登录标题 |
| `subtitle` | `string` | `'在平板上享受更好的体验'` | 副标题 |
| `logoUrl` | `string` | `''` | Logo图片URL |
| `primaryColor` | `string` | `'#667eea'` | 主题色 |
| `secondaryColor` | `string` | `'#764ba2'` | 次要颜色 |
| `backgroundImage` | `string` | `''` | 背景图片URL |
| `showRemember` | `boolean` | `true` | 显示记住密码 |
| `showRegister` | `boolean` | `true` | 显示注册链接 |
| `showForgot` | `boolean` | `true` | 显示忘记密码 |
| `enableAnimations` | `boolean` | `true` | 启用动画效果 |

### 事件监听

```vue
<TabletLoginTemplate
  @theme-change="handleThemeChange"
  @language-change="handleLanguageChange"
  @dark-mode-change="handleDarkModeChange"
  @size-change="handleSizeChange"
/>
```

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `theme-change` | `(theme: string)` | 主题切换 |
| `language-change` | `(language: string)` | 语言切换 |
| `dark-mode-change` | `(isDark: boolean)` | 暗黑模式切换 |
| `size-change` | `(size: string)` | 尺寸切换 |

### 插槽

| 插槽名 | 说明 |
|--------|------|
| `header` | 头部区域 |
| `content` | 主要内容区域（登录表单） |
| `footer` | 底部区域 |
| `language-selector` | 语言选择器 |
| `color-selector` | 主题色选择器 |
| `dark-mode-toggle` | 暗黑模式切换 |
| `size-selector` | 尺寸选择器 |

---

## 🎨 自定义主题

### 使用CSS变量

```css
.ldesign-template-tablet {
  /* 主题色 */
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --tertiary-color: #45b7d1;
  
  /* 动画时长 */
  --animation-duration-slow: 12s;
  --animation-duration-medium: 8s;
  --animation-duration-fast: 6s;
}
```

### 自定义背景

```vue
<TabletLoginTemplate
  background-image="https://example.com/background.jpg"
/>
```

---

## 📊 性能指标

### 优化效果

| 指标 | 优化前 | 优化后 | 提升 |
|------|--------|--------|------|
| DOM节点 | 15 | 11 | ⬇️ 27% |
| 粒子数 | 8 | 4 | ⬇️ 50% |
| 动画元素 | 12 | 8 | ⬇️ 33% |
| 计算属性 | 2 | 1 | ⬇️ 50% |
| GPU加速 | 部分 | 全部 | ⬆️ 100% |
| 内存占用 | 基准 | -5~10% | ⬇️ 优化 |

### 性能测试

打开 `performance-test.html` 进行性能测试：

```bash
# 在浏览器中打开
open performance-test.html
```

---

## 🔧 高级配置

### 禁用动画（低性能设备）

```vue
<TabletLoginTemplate :enable-animations="false" />
```

### 响应式断点

```css
/* 小屏幕平板 */
@media (max-width: 768px) {
  /* 自动调整 */
}

/* 横屏模式 */
@media (orientation: landscape) and (min-width: 768px) {
  /* 自动调整为横屏布局 */
}
```

---

## 📚 文档

- 📖 [优化说明](./OPTIMIZATION_NOTES.md) - 详细的优化文档
- 🚀 [快速参考](./QUICK_REFERENCE.md) - 快速上手指南
- 📝 [更新日志](./CHANGELOG.md) - 版本更新记录
- 🧪 [性能测试](./performance-test.html) - 性能测试工具

---

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 性能监控

```javascript
// 监控FPS
let frameCount = 0
let lastTime = performance.now()

function measureFPS() {
  frameCount++
  const currentTime = performance.now()
  
  if (currentTime >= lastTime + 1000) {
    const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))
    console.log('FPS:', fps)
    frameCount = 0
    lastTime = currentTime
  }
  
  requestAnimationFrame(measureFPS)
}

requestAnimationFrame(measureFPS)
```

---

## 🐛 故障排查

### 动画卡顿
1. 检查GPU加速是否启用
2. 尝试禁用动画: `:enable-animations="false"`
3. 检查浏览器性能

### 事件不触发
1. 确认使用 `@` 监听事件
2. 检查事件名称（kebab-case）
3. 查看控制台错误

### 样式问题
1. 检查CSS变量是否正确
2. 确认主题色格式
3. 查看浏览器兼容性

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

### 贡献指南
1. Fork本仓库
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

---

## 📄 许可证

MIT License

---

## 🙏 致谢

感谢所有贡献者和使用者！

---

## 📞 联系方式

- 📧 Email: support@ldesign.com
- 🌐 Website: https://ldesign.com
- 💬 Issues: [GitHub Issues](https://github.com/ldesign/template/issues)

---

**最后更新**: 2025-10-06  
**版本**: 2.0.0  
**状态**: ✅ 生产就绪

