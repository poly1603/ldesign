# 🚀 Lottie 高级功能文档

本文档介绍 Lottie 插件的所有高级功能，包括音效同步、过渡效果、主题系统、数据绑定、手势控制、预加载队列和无障碍支持。

## 📑 目录

- [音效同步 (AudioSync)](#音效同步-audiosync)
- [过渡效果 (TransitionManager)](#过渡效果-transitionmanager)
- [主题系统 (ThemeManager)](#主题系统-thememanager)
- [数据绑定 (DataBinding)](#数据绑定-databinding)
- [手势控制 (GestureController)](#手势控制-gesturecontroller)
- [预加载队列 (PreloadQueue)](#预加载队列-preloadqueue)
- [无障碍支持 (AccessibilityManager)](#无障碍支持-accessibilitymanager)

---

## 🎵 音效同步 (AudioSync)

将 Lottie 动画与音频精确同步，支持标记点、音量控制和播放速率调整。

### 基本用法

```typescript
import { lottieManager, AudioSync } from '@ldesign/lottie';

// 创建 Lottie 实例
const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json',
  autoplay: false
});

await animation.load();

// 创建音效同步实例
const audioSync = new AudioSync(animation, {
  audioSource: './music.mp3',
  volume: 1.0,
  playbackRate: 1.0,
  loop: true,
  offset: 0,
  
  // 添加标记点
  markers: [
    { name: 'intro', frame: 0, time: 0 },
    { name: 'chorus', frame: 60, time: 2.5 },
    { name: 'outro', frame: 120, time: 5.0 }
  ],
  
  // 事件回调
  onLoad: () => console.log('音频已加载'),
  onPlay: () => console.log('音频开始播放'),
  onPause: () => console.log('音频已暂停'),
  onMarker: (marker) => console.log('到达标记点:', marker.name)
});

// 播放
await audioSync.play();

// 暂停
audioSync.pause();

// 跳转到指定时间
audioSync.seek(2.5);

// 设置音量 (0-1)
audioSync.setVolume(0.5);

// 设置播放速率
audioSync.setPlaybackRate(1.5);

// 添加新标记点
audioSync.addMarker({
  name: 'custom',
  frame: 80,
  time: 3.5,
  callback: () => console.log('自定义标记点触发')
});

// 移除标记点
audioSync.removeMarker('custom');

// 销毁实例
audioSync.destroy();
```

### API 参考

| 方法 | 说明 |
|------|------|
| `play()` | 同步播放动画和音频 |
| `pause()` | 暂停播放 |
| `stop()` | 停止播放并重置 |
| `seek(time)` | 跳转到指定时间（秒） |
| `setVolume(volume)` | 设置音量 (0-1) |
| `setPlaybackRate(rate)` | 设置播放速率 |
| `addMarker(marker)` | 添加标记点 |
| `removeMarker(name)` | 移除标记点 |
| `getCurrentTime()` | 获取当前播放时间 |
| `getDuration()` | 获取音频总时长 |
| `destroy()` | 销毁实例 |

---

## ✨ 过渡效果 (TransitionManager)

为 Lottie 动画添加各种过渡效果，支持淡入淡出、滑动、缩放、旋转等。

### 基本用法

```typescript
import { lottieManager, TransitionManager } from '@ldesign/lottie';

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json'
});

await animation.load();

const transition = new TransitionManager(animation);

// 淡入效果
await transition.fadeIn(300, 'easeInOut');

// 淡出效果
await transition.fadeOut(300, 'easeInOut');

// 滑入效果
await transition.slideIn('left', 400);
await transition.slideIn('right', 400);
await transition.slideIn('top', 400);
await transition.slideIn('bottom', 400);

// 缩放效果
await transition.scale(0, 1, 300, 'easeOutBack');

// 旋转效果
await transition.rotate(0, 360, 600, 'easeInOut');

// 模糊效果
await transition.blur(10, 0, 400, 'easeOut');

// 翻转效果
await transition.flip('Y', 500, 'easeInOut');

// 自定义过渡
await transition.applyTransition({
  type: 'custom',
  duration: 500,
  easing: 'easeInOut',
  transform: (progress, element) => {
    element.style.opacity = String(progress);
    element.style.transform = `scale(${progress})`;
  },
  onComplete: () => console.log('过渡完成')
});

// 组合过渡（同时执行）
await transition.composite([
  { type: 'fade', direction: 'in', duration: 300 },
  { type: 'scale', direction: 'in', duration: 300 }
]);

// 序列过渡（按顺序执行）
await transition.sequence([
  { type: 'slide', direction: 'in', duration: 300 },
  { type: 'fade', direction: 'in', duration: 300, delay: 100 }
]);

// 停止过渡
transition.stop();

// 重置样式
transition.reset();
```

### 内置缓动函数

- `linear` - 线性
- `easeIn` - 加速
- `easeOut` - 减速
- `easeInOut` - 先加速后减速
- `easeInBack` - 回弹加速
- `easeOutBack` - 回弹减速
- `easeInOutBack` - 回弹加减速
- `easeInElastic` - 弹性加速
- `easeOutElastic` - 弹性减速
- `easeInBounce` - 弹跳加速
- `easeOutBounce` - 弹跳减速

---

## 🎨 主题系统 (ThemeManager)

动态替换动画颜色，支持主题切换、亮度/饱和度/色调调整。

### 基本用法

```typescript
import { lottieManager, ThemeManager } from '@ldesign/lottie';

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json'
});

await animation.load();

const themeManager = new ThemeManager(animation);

// 注册主题
themeManager.registerTheme({
  name: 'dark',
  colors: {
    '#ff0000': '#4f46e5',
    '#00ff00': '#7c3aed',
    '#0000ff': '#ec4899'
  },
  autoApply: true
});

// 批量注册主题
themeManager.registerThemes([
  {
    name: 'light',
    colors: { '#ff0000': '#667eea' }
  },
  {
    name: 'sunset',
    colors: { '#ff0000': '#ff6b6b' }
  }
]);

// 应用主题
themeManager.applyTheme('dark');

// 切换主题
themeManager.switchTheme('light');

// 替换单个颜色
themeManager.replaceColor('#ff0000', '#00ff00', {
  recursive: true
});

// 替换多个颜色
themeManager.replaceColors({
  '#ff0000': '#667eea',
  '#00ff00': '#764ba2'
});

// 根据图层名称替换颜色
themeManager.replaceColorByLayer('background', '#ffffff');

// 调整亮度 (0-2, 1为原始值)
themeManager.adjustBrightness(1.2);

// 调整饱和度 (0-2, 1为原始值)
themeManager.adjustSaturation(0.8);

// 应用色调偏移 (0-360度)
themeManager.applyHueShift(30);

// 重置到原始颜色
themeManager.resetColors();

// 获取当前主题
const currentTheme = themeManager.getCurrentTheme();

// 获取所有主题
const themes = themeManager.getAllThemes();

// 移除主题
themeManager.removeTheme('dark');
```

---

## 📊 数据绑定 (DataBinding)

将数据绑定到动画属性，实现数据驱动的动画更新。

### 基本用法

```typescript
import { lottieManager, DataBinding } from '@ldesign/lottie';

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json'
});

await animation.load();

const dataBinding = new DataBinding(animation);

// 绑定数据到动画属性
dataBinding.bind({
  path: 'user.name',
  target: 'textLayer',
  property: 'text',
  formatter: (value) => `Hello, ${value}!`
});

dataBinding.bind({
  path: 'score',
  target: 'scoreLayer',
  property: 'text',
  transform: (value) => Math.round(value),
  formatter: (value) => `Score: ${value}`
});

dataBinding.bind({
  path: 'progress',
  target: 'progressBar',
  property: 'scale',
  transform: (value) => [value, 1]
});

// 批量绑定
dataBinding.bindMany([
  { path: 'color', target: 'background', property: 'color' },
  { path: 'opacity', target: 'overlay', property: 'opacity' }
]);

// 设置数据
dataBinding.setData({
  user: { name: 'Alice' },
  score: 1234.56,
  progress: 0.75,
  color: [1, 0, 0, 1],
  opacity: 0.8
});

// 更新单个数据
dataBinding.update('user.name', 'Bob');
dataBinding.update('score', 2500);

// 批量更新
dataBinding.updateMany({
  'user.name': 'Charlie',
  'score': 3000,
  'progress': 0.9
});

// 获取数据
const data = dataBinding.getData();
const score = dataBinding.getValue('score');

// 监听数据变化
const unwatch = dataBinding.watch('score', (value) => {
  console.log('分数更新:', value);
});

// 取消监听
unwatch();

// 移除绑定
dataBinding.unbind('textLayer', 'text');

// 清除所有绑定
dataBinding.clearBindings();

// 清除所有数据
dataBinding.clearData();
```

### 支持的属性类型

- `text` - 文本内容
- `position` - 位置 [x, y]
- `scale` - 缩放 number 或 [x, y]
- `rotation` - 旋转角度
- `opacity` - 透明度 (0-1)
- `color` - 颜色 [r, g, b, a]

---

## 👆 手势控制 (GestureController)

为 Lottie 动画添加触摸和手势控制功能。

### 基本用法

```typescript
import { lottieManager, GestureController } from '@ldesign/lottie';

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json',
  autoplay: false
});

await animation.load();

const gestureController = new GestureController(animation, {
  enableTouch: true,
  enableSwipe: true,
  enablePinch: true,
  enableRotate: true,
  enableLongPress: true,
  
  // 手势阈值
  swipeThreshold: 50,
  pinchThreshold: 0.1,
  rotateThreshold: 5,
  longPressDelay: 500,
  
  // 手势回调
  onTap: (event) => {
    console.log('轻触', event);
    animation.isPaused() ? animation.play() : animation.pause();
  },
  
  onSwipe: (event) => {
    console.log('滑动', event.direction, event.distance);
    const currentFrame = animation.getCurrentFrame();
    const offset = event.direction === 'left' ? -10 : 10;
    animation.goToAndStop(currentFrame + offset, true);
  },
  
  onPinch: (event) => {
    console.log('捏合', event.scale);
    const container = animation.getContainer();
    container.style.transform = `scale(${event.scale})`;
  },
  
  onRotate: (event) => {
    console.log('旋转', event.rotation);
    const container = animation.getContainer();
    container.style.transform = `rotate(${event.rotation}deg)`;
  },
  
  onLongPress: (event) => {
    console.log('长按', event);
    animation.stop();
  }
});

// 启用/禁用手势
gestureController.enableGesture('tap');
gestureController.disableGesture('swipe');

// 更新配置
gestureController.updateConfig({
  swipeThreshold: 100
});

// 获取配置
const config = gestureController.getConfig();

// 销毁
gestureController.destroy();
```

### 支持的手势类型

- `tap` - 轻触
- `swipe` - 滑动（上下左右）
- `pinch` - 捏合缩放
- `rotate` - 旋转
- `longPress` - 长按

---

## ⚡ 预加载队列 (PreloadQueue)

智能管理多个 Lottie 动画的预加载，支持优先级、并发控制和进度追踪。

### 基本用法

```typescript
import { PreloadQueue } from '@ldesign/lottie';

const preloadQueue = new PreloadQueue({
  concurrency: 3, // 最大并发数
  retryAttempts: 3, // 重试次数
  retryDelay: 1000, // 重试延迟
  timeout: 10000, // 超时时间
  
  // 进度回调
  onProgress: (progress) => {
    console.log(`进度: ${progress.percentage}%`);
    console.log(`已加载: ${progress.loaded}/${progress.total}`);
  },
  
  // 完成回调
  onComplete: (results) => {
    console.log('所有动画加载完成', results);
  },
  
  // 错误回调
  onError: (error) => {
    console.error('加载错误', error);
  }
});

// 添加单个预加载项
await preloadQueue.add({
  url: './animation1.json',
  priority: 10, // 优先级（数字越大越优先）
  metadata: { name: 'loading' }
});

// 批量添加
await preloadQueue.addMany([
  { url: './animation1.json', priority: 10 },
  { url: './animation2.json', priority: 8 },
  { url: './animation3.json', priority: 6 }
]);

// 开始预加载
preloadQueue.start();

// 暂停预加载
preloadQueue.pause();

// 恢复预加载
preloadQueue.resume();

// 清空队列
preloadQueue.clear();

// 获取进度
const progress = preloadQueue.getProgress();
console.log(`总进度: ${progress.percentage}%`);

// 获取队列状态
const state = preloadQueue.getState();
console.log(`状态: ${state}`); // 'idle', 'loading', 'paused', 'completed'

// 获取已加载的动画
const loaded = preloadQueue.getLoadedAnimations();

// 检查动画是否已加载
const isLoaded = preloadQueue.isLoaded('./animation1.json');

// 获取缓存的动画数据
const animationData = preloadQueue.getAnimationData('./animation1.json');

// 移除预加载项
preloadQueue.remove('./animation1.json');

// 销毁队列
preloadQueue.destroy();
```

---

## ♿ 无障碍支持 (AccessibilityManager)

使 Lottie 动画符合无障碍标准，支持键盘导航、屏幕阅读器和减少动画偏好。

### 基本用法

```typescript
import { lottieManager, AccessibilityManager } from '@ldesign/lottie';

const animation = lottieManager.create({
  container: '#animation',
  path: './animation.json'
});

await animation.load();

const accessibilityManager = new AccessibilityManager(animation, {
  // 启用功能
  keyboardNavigation: true,
  screenReader: true,
  skipOption: true,
  respectReducedMotion: true,
  
  // ARIA 属性
  role: 'img',
  ariaLabel: '加载动画',
  title: '正在加载',
  description: '一个旋转的加载指示器',
  
  // 自定义键盘快捷键
  keyboardShortcuts: {
    'Space': () => animation.isPaused() ? animation.play() : animation.pause(),
    'KeyR': () => animation.stop(),
    'KeyF': () => animation.goToAndStop(animation.getTotalFrames(), true),
    'Digit1': () => animation.setSpeed(0.5),
    'Digit2': () => animation.setSpeed(1),
    'Digit3': () => animation.setSpeed(2)
  }
});

// 屏幕阅读器通知
accessibilityManager.announce('动画加载完成', 'polite');
accessibilityManager.announce('发生错误', 'assertive');

// 显示/隐藏控制面板
accessibilityManager.showControls();
accessibilityManager.hideControls();

// 更新配置
accessibilityManager.updateConfig({
  description: '新的动画描述'
});

// 销毁
accessibilityManager.destroy();
```

### 默认键盘快捷键

| 按键 | 功能 |
|------|------|
| Space | 播放/暂停 |
| ← | 快退 (10%) |
| → | 快进 (10%) |
| Home | 跳到开始 |
| End | 跳到结束 |
| R | 重新播放 |

### 无障碍特性

- ✅ ARIA 标签和描述
- ✅ 键盘导航支持
- ✅ 屏幕阅读器通知
- ✅ 减少动画偏好检测
- ✅ 跳过动画选项
- ✅ 可访问的控制面板
- ✅ 焦点管理
- ✅ 状态更新通知

---

## 🎯 综合示例

### 创建一个完整的交互式动画体验

```typescript
import { 
  lottieManager,
  AudioSync,
  TransitionManager,
  ThemeManager,
  DataBinding,
  GestureController,
  AccessibilityManager
} from '@ldesign/lottie';

async function createInteractiveAnimation() {
  // 1. 创建动画实例
  const animation = lottieManager.create({
    container: '#animation',
    path: './animation.json',
    autoplay: false,
    loop: true
  });
  
  await animation.load();
  
  // 2. 添加过渡效果
  const transition = new TransitionManager(animation);
  await transition.fadeIn(600, 'easeOut');
  
  // 3. 应用主题
  const themeManager = new ThemeManager(animation);
  themeManager.registerTheme({
    name: 'custom',
    colors: {
      '#ff0000': '#667eea',
      '#00ff00': '#764ba2'
    }
  });
  themeManager.applyTheme('custom');
  
  // 4. 添加音效同步
  const audioSync = new AudioSync(animation, {
    audioSource: './music.mp3',
    loop: true,
    markers: [
      { name: 'beat1', frame: 30, time: 1.0 },
      { name: 'beat2', frame: 60, time: 2.0 }
    ]
  });
  
  // 5. 数据绑定
  const dataBinding = new DataBinding(animation);
  dataBinding.bind({
    path: 'score',
    target: 'scoreText',
    property: 'text',
    formatter: (value) => `Score: ${value}`
  });
  
  // 6. 手势控制
  const gestureController = new GestureController(animation, {
    enableTouch: true,
    enableSwipe: true,
    onTap: () => audioSync.play(),
    onSwipe: (e) => {
      if (e.direction === 'left') {
        themeManager.switchTheme('dark');
      } else if (e.direction === 'right') {
        themeManager.switchTheme('light');
      }
    }
  });
  
  // 7. 无障碍支持
  const accessibilityManager = new AccessibilityManager(animation, {
    keyboardNavigation: true,
    screenReader: true,
    description: '一个交互式的 Lottie 动画',
    respectReducedMotion: true
  });
  
  // 8. 开始播放
  await audioSync.play();
  
  return {
    animation,
    audioSync,
    transition,
    themeManager,
    dataBinding,
    gestureController,
    accessibilityManager
  };
}

// 使用
const interactive = await createInteractiveAnimation();

// 更新分数
interactive.dataBinding.update('score', 1000);

// 切换主题
interactive.themeManager.switchTheme('sunset');
```

---

## 📝 最佳实践

### 1. 性能优化

```typescript
// 使用预加载队列优化加载性能
const preloadQueue = new PreloadQueue({ concurrency: 3 });
await preloadQueue.addMany([
  { url: './anim1.json', priority: 10 },
  { url: './anim2.json', priority: 8 },
  { url: './anim3.json', priority: 6 }
]);
preloadQueue.start();
```

### 2. 内存管理

```typescript
// 使用完毕后及时销毁实例
audioSync.destroy();
transition.reset();
gestureController.destroy();
accessibilityManager.destroy();
animation.destroy();
```

### 3. 错误处理

```typescript
try {
  await audioSync.play();
} catch (error) {
  console.error('播放失败:', error);
  // 降级处理
  animation.play();
}
```

### 4. 响应式设计

```typescript
// 根据设备性能调整配置
import { getDeviceInfo } from '@ldesign/lottie';

const deviceInfo = getDeviceInfo();

if (deviceInfo.performanceTier === 'low') {
  // 低性能设备禁用复杂功能
  animation.setQuality('low');
} else {
  // 高性能设备启用所有功能
  const audioSync = new AudioSync(animation, config);
  const gestureController = new GestureController(animation, config);
}
```

---

## 🔗 相关资源

- [基础文档](./README.md)
- [API 参考](./API.md)
- [示例代码](../examples/)
- [性能优化指南](./PERFORMANCE.md)

---

## 📄 许可证

MIT License
