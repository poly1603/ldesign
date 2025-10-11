# 🚀 Lottie 高级功能示例

本目录包含了 Lottie 插件所有高级功能的完整示例，覆盖 Vanilla JS、React 和 Vue 3 三个框架。

## 📂 文件结构

```
examples/
├── vanilla/
│   ├── index.html              # 基础示例
│   ├── advanced.html           # 高级功能示例 ✨
│   └── device-responsive.html  # 响应式设备检测示例
├── react/
│   └── src/
│       ├── App.tsx             # 基础示例
│       └── AdvancedFeatures.tsx # 高级功能示例 ✨
├── vue/
│   └── src/
│       ├── App.vue             # 基础示例
│       └── AdvancedFeatures.vue # 高级功能示例 ✨
└── advanced-features.html      # 独立的高级功能演示页
```

## ✨ 功能演示

每个高级功能示例都包含以下6个核心功能的完整演示：

### 1. 🎬 过渡效果 (TransitionManager)
- **淡入/淡出效果**：平滑的透明度过渡
- **滑入效果**：从四个方向滑入动画
- **缩放效果**：从小到大或从大到小的缩放
- **旋转效果**：360度旋转动画
- **12+ 内置缓动函数**：easeIn, easeOut, easeInOut, easeBack, easeElastic, easeBounce 等

### 2. 🎨 主题系统 (ThemeManager)
- **主题切换**：浅色、深色、夕阳三种预设主题
- **动态颜色替换**：实时替换动画中的颜色
- **亮度调整**：增加或减少动画整体亮度
- **饱和度调整**：调整颜色饱和度
- **色调偏移**：整体色调旋转

### 3. 📊 数据绑定 (DataBinding)
- **透明度绑定**：实时调整动画透明度
- **缩放绑定**：动态缩放动画
- **响应式更新**：数据变化自动更新动画
- **支持多种属性**：text, position, scale, rotation, opacity, color

### 4. 👆 手势控制 (GestureController)
- **轻触手势**：点击播放/暂停
- **滑动手势**：左右滑动跳转帧
- **捏合手势**：双指缩放（移动端）
- **旋转手势**：双指旋转（移动端）
- **长按手势**：长按触发特定动作

### 5. ⚡ 预加载队列 (PreloadQueue)
- **优先级队列**：按优先级顺序加载
- **并发控制**：限制同时加载数量
- **进度追踪**：实时显示加载进度
- **错误处理**：自动重试失败的加载
- **缓存管理**：智能缓存已加载的动画

### 6. ♿ 无障碍支持 (AccessibilityManager)
- **键盘导航**：完整的键盘快捷键支持
- **屏幕阅读器**：ARIA 标签和状态通知
- **减少动画偏好**：遵循 `prefers-reduced-motion`
- **跳过动画选项**：快速跳转到动画结束
- **符合 WCAG 2.1 标准**

## 🚀 快速开始

### Vanilla JS 示例

1. 打开 `vanilla/advanced.html` 文件
2. 确保已编译 TypeScript 代码：`npm run build`
3. 在浏览器中打开文件即可查看所有功能

```bash
# 方式1：直接打开
start examples/vanilla/advanced.html

# 方式2：使用本地服务器
npx serve examples/vanilla
# 然后访问 http://localhost:3000/advanced.html
```

### React 示例

1. 进入 React 示例目录
```bash
cd examples/react
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在 `App.tsx` 中导入高级功能组件：

```tsx
import AdvancedFeatures from './AdvancedFeatures'

function App() {
  return (
    <LottieProvider>
      <AdvancedFeatures />
    </LottieProvider>
  )
}
```

### Vue 3 示例

1. 进入 Vue 示例目录
```bash
cd examples/vue
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 在 `App.vue` 或路由中使用：

```vue
<template>
  <AdvancedFeatures />
</template>

<script setup>
import AdvancedFeatures from './AdvancedFeatures.vue'
</script>
```

## 📝 代码示例

### 1. 过渡效果使用

```typescript
import { lottieManager, TransitionManager } from '@ldesign/lottie'

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json'
})

await animation.load()

const transition = new TransitionManager(animation)

// 淡入效果
await transition.fadeIn(600, 'easeOut')

// 滑入效果
await transition.slideIn('left', 500)

// 缩放效果
await transition.scale(0, 1, 500, 'easeOutBack')
```

### 2. 主题系统使用

```typescript
import { ThemeManager } from '@ldesign/lottie'

const themeManager = new ThemeManager(animation)

// 注册主题
themeManager.registerTheme({
  name: 'dark',
  colors: {
    '#ff0000': '#4f46e5',
    '#00ff00': '#7c3aed'
  }
})

// 应用主题
themeManager.applyTheme('dark')

// 调整亮度
themeManager.adjustBrightness(1.3)
```

### 3. 数据绑定使用

```typescript
import { DataBinding } from '@ldesign/lottie'

const dataBinding = new DataBinding(animation)

// 绑定透明度
dataBinding.bind({
  path: 'opacity',
  target: 'layer1',
  property: 'opacity'
})

// 更新数据
dataBinding.update('opacity', 0.5)
```

### 4. 手势控制使用

```typescript
import { GestureController } from '@ldesign/lottie'

const gestureController = new GestureController(animation, {
  enableTouch: true,
  enableSwipe: true,
  
  onTap: () => {
    animation.isPaused() ? animation.play() : animation.pause()
  },
  
  onSwipe: (event) => {
    console.log('滑动方向:', event.direction)
  }
})
```

### 5. 预加载队列使用

```typescript
import { PreloadQueue } from '@ldesign/lottie'

const preloadQueue = new PreloadQueue({
  concurrency: 3,
  onProgress: (progress) => {
    console.log(`进度: ${progress.percentage}%`)
  }
})

// 添加动画到队列
await preloadQueue.addMany([
  { url: './anim1.json', priority: 10 },
  { url: './anim2.json', priority: 8 },
  { url: './anim3.json', priority: 6 }
])

// 开始预加载
preloadQueue.start()
```

### 6. 无障碍支持使用

```typescript
import { AccessibilityManager } from '@ldesign/lottie'

const accessibilityManager = new AccessibilityManager(animation, {
  keyboardNavigation: true,
  screenReader: true,
  description: '一个旋转的加载动画',
  title: '加载中',
  respectReducedMotion: true
})
```

## 🎯 测试功能

每个示例都提供了交互式演示，你可以：

1. **点击按钮** - 触发各种过渡效果
2. **拖动滑块** - 实时调整动画属性
3. **切换主题** - 查看颜色变化效果
4. **使用手势** - 在移动设备上测试手势控制
5. **键盘操作** - 使用键盘快捷键控制动画

## 📱 移动端测试

在移动设备上打开示例，可以测试：

- 触摸手势（轻触、滑动）
- 双指捏合缩放
- 双指旋转
- 长按操作

## 🐛 常见问题

### Q: 示例无法加载动画？
**A:** 确保动画 JSON 文件路径正确，并且已经编译了 TypeScript 代码：
```bash
npm run build
```

### Q: 手势控制不工作？
**A:** 确保在支持触摸的设备上测试，或使用浏览器的设备模拟器。

### Q: 键盘快捷键不响应？
**A:** 确保动画容器已经获得焦点（点击容器或按 Tab 键聚焦）。

### Q: 主题切换没有效果？
**A:** 检查动画中是否包含可以被替换的颜色值。某些动画可能使用了纯色或图片。

## 📚 相关文档

- [高级功能文档](../docs/ADVANCED_FEATURES.md) - 完整的 API 文档和使用指南
- [基础使用文档](../README.md) - 插件基础功能文档
- [API 参考](../docs/API.md) - 详细的 API 文档

## 💡 提示

1. **性能优化**：在生产环境中，根据实际需求选择性使用高级功能
2. **内存管理**：使用完毕后记得调用 `destroy()` 方法释放资源
3. **错误处理**：始终包含 try-catch 来处理可能的错误
4. **浏览器兼容**：某些功能（如 Web Audio API）可能需要用户交互才能启用

## 🤝 贡献

如果你发现示例中的问题或有改进建议，欢迎提交 Issue 或 Pull Request！

## 📄 许可证

MIT License
