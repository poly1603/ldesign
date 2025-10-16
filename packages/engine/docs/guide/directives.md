# 指令系统

LDesign Engine 提供了强大的指令系统，包含丰富的内置指令和完整的自定义指令支持。指令系统采用模块化设计，每个指令都是独立的模块，支持按需加载和动态注册。

## 快速开始

```typescript
import { createEngine } from '@ldesign/engine'
import { createApp } from 'vue'

const app = createApp({})
const engine = createEngine()

app.use(engine)
```

## 指令分类

### 交互类指令
- `v-click-outside` - 点击外部区域触发
- `v-drag` - 拖拽功能
- `v-infinite-scroll` - 无限滚动

### 性能优化类指令
- `v-debounce` - 防抖处理
- `v-throttle` - 节流处理
- `v-lazy` - 懒加载

### UI反馈类指令
- `v-loading` - 加载状态
- `v-tooltip` - 工具提示

### 工具类指令
- `v-copy` - 复制到剪贴板
- `v-resize` - 元素大小监听

## 内置指令详解

### v-click-outside - 点击外部指令

当用户点击元素外部时触发回调，常用于下拉菜单、弹窗等组件的关闭功能。

```vue
<script setup>
const handleClickOutside = (event) => {
  console.log('Clicked outside:', event)
}

const isDisabled = ref(false)
</script>

<template>
  <!-- 基础用法 -->
  <div v-click-outside="handleClickOutside">
    点击外部关闭
  </div>

  <!-- 高级配置 -->
  <div
    v-click-outside="{
      handler: handleClickOutside,
      exclude: ['.exclude-element'],
      disabled: isDisabled
    }"
  >
    高级配置
  </div>
</template>
```

**配置选项：**
- `handler` - 点击外部时的回调函数
- `exclude` - 排除的元素选择器或元素数组
- `disabled` - 是否禁用指令
- `capture` - 是否使用捕获模式

### v-copy - 复制到剪贴板指令

点击元素时复制指定内容到剪贴板，支持多种复制源和回调处理。

```vue
<script setup>
const handleSuccess = (text) => {
  console.log('复制成功:', text)
}

const handleError = (error) => {
  console.error('复制失败:', error)
}
</script>

<template>
  <!-- 复制元素文本 -->
  <button v-copy>
    复制我
  </button>

  <!-- 复制指定文本 -->
  <button v-copy="'Hello World'">
    复制Hello World
  </button>

  <!-- 完整配置 -->
  <button
    v-copy="{
      text: 'Custom text',
      onSuccess: handleSuccess,
      onError: handleError,
      successClass: 'copy-success'
    }"
  >
    高级复制
  </button>
</template>
```

**配置选项：**
- `text` - 要复制的文本内容
- `target` - 目标元素选择器
- `onSuccess` - 复制成功回调
- `onError` - 复制失败回调
- `successClass` - 成功时添加的CSS类
- `errorClass` - 失败时添加的CSS类

### v-click - 增强点击处理

```vue
<script setup>
function handleClick(event) {
  console.log('按钮被点击', event)
}
</script>

<template>
  <!-- 基础用法 -->
  <button v-click="handleClick">
    点击我
  </button>

  <!-- 防抖点击 -->
  <button v-click.debounce="handleClick">
    防抖点击
  </button>

  <!-- 节流点击 -->
  <button v-click.throttle="handleClick">
    节流点击
  </button>

  <!-- 自定义延迟 -->
  <button v-click.debounce.500="handleClick">
    500ms防抖
  </button>
</template>
```

### v-debounce - 防抖指令

防止事件频繁触发，在指定时间内只执行最后一次，适用于搜索输入、按钮点击等场景。

```vue
<script setup>
const handleInput = (event) => {
  console.log('防抖输入:', event.target.value)
}

const handleClick = () => {
  console.log('防抖点击')
}

const handleSubmit = () => {
  console.log('提交表单')
}
</script>

<template>
  <!-- 基础用法 -->
  <input v-debounce:input="handleInput" placeholder="防抖输入">

  <!-- 自定义延迟 -->
  <button v-debounce:click="{ handler: handleClick, delay: 500 }">
    500ms防抖点击
  </button>

  <!-- 立即执行 + 防抖 -->
  <button
    v-debounce="{
      handler: handleSubmit,
      delay: 1000,
      immediate: true
    }"
  >
    立即执行防抖
  </button>
</template>
```

**配置选项：**
- `handler` - 事件处理函数
- `delay` - 防抖延迟时间（默认300ms）
- `immediate` - 是否立即执行
- `maxWait` - 最大等待时间
- `event` - 监听的事件类型

### v-throttle - 节流指令

限制事件触发频率，在指定时间内最多执行一次，适用于滚动、鼠标移动等高频事件。

```vue
<script setup>
const handleClick = () => {
  console.log('节流点击')
}

const handleScroll = (event) => {
  console.log('滚动位置:', event.target.scrollTop)
}

const handleMouseMove = (event) => {
  console.log('鼠标位置:', event.clientX, event.clientY)
}
</script>

<template>
  <!-- 基础用法 -->
  <button v-throttle:click="handleClick">
    节流点击
  </button>

  <!-- 滚动节流 -->
  <div
    v-throttle:scroll="{ handler: handleScroll, delay: 100 }"
    style="height: 200px; overflow-y: auto;"
  >
    滚动内容...
  </div>

  <!-- 鼠标移动节流 -->
  <div
    v-throttle:mousemove="{
      handler: handleMouseMove,
      delay: 16
    }" style="width: 300px; height: 200px; border: 1px solid #ccc;"
  >
    鼠标移动区域
  </div>
</template>
```

**配置选项：**
- `handler` - 事件处理函数
- `delay` - 节流间隔时间（默认300ms）
- `leading` - 是否在开始时执行
- `trailing` - 是否在结束时执行
- `event` - 监听的事件类型

### v-lazy - 懒加载指令

当元素进入视口时触发加载，支持图片懒加载和自定义内容懒加载。

```vue
<script setup>
const handleLazyLoad = (el, entry) => {
  console.log('元素进入视口:', el, entry)
}
</script>

<template>
  <!-- 图片懒加载 -->
  <img v-lazy="'/path/to/image.jpg'" alt="懒加载图片">

  <!-- 带占位符 -->
  <img
    v-lazy="{
      src: '/path/to/image.jpg',
      placeholder: '/path/to/placeholder.jpg',
      error: '/path/to/error.jpg'
    }" alt="带占位符的懒加载"
  >

  <!-- 自定义回调 -->
  <div
    v-lazy="{
      callback: handleLazyLoad,
      threshold: 0.5,
      rootMargin: '100px'
    }"
  >
    自定义懒加载内容
  </div>
</template>
```

**配置选项：**
- `src` - 图片源地址
- `placeholder` - 占位图片
- `error` - 错误图片
- `callback` - 自定义回调函数
- `threshold` - 触发阈值
- `rootMargin` - 根边距
- `once` - 是否只触发一次

### v-loading - 加载状态指令

显示加载状态和加载动画，支持多种动画效果和自定义样式。

```vue
<script setup>
const isLoading = ref(false)
const isFullscreenLoading = ref(false)
</script>

<template>
  <!-- 基础用法 -->
  <div v-loading="isLoading" style="height: 200px;">
    内容区域
  </div>

  <!-- 自定义样式 -->
  <div
    v-loading="{
      loading: isLoading,
      text: '数据加载中...',
      spinner: 'dots',
      size: 'large',
      color: '#ff6b6b'
    }"
  >
    自定义加载样式
  </div>

  <!-- 全屏加载 -->
  <button
    v-loading="{
      loading: isFullscreenLoading,
      text: '处理中，请稍候...',
      fullscreen: true
    }"
  >
    全屏加载
  </button>
</template>
```

**配置选项：**
- `loading` - 是否显示加载状态
- `text` - 加载文本
- `spinner` - 动画类型（default/dots/pulse/bounce）
- `size` - 大小（small/medium/large）
- `color` - 颜色
- `fullscreen` - 是否全屏显示

### v-debounce - 输入防抖（旧版本兼容）

```vue
<script setup>
function handleInput(value, event) {
  console.log('输入内容:', value)
}
</script>

<template>
  <!-- 输入防抖 -->
  <input v-debounce="handleInput" placeholder="输入内容">

  <!-- 自定义延迟时间 -->
  <input v-debounce.300="handleInput" placeholder="300ms防抖">

  <!-- 立即执行 -->
  <input v-debounce.immediate="handleInput" placeholder="立即执行">
</template>
```

### v-throttle - 事件节流

```vue
<script setup>
function handleScroll(event) {
  console.log('滚动事件', event)
}

function handleMouseMove(event) {
  console.log('鼠标位置:', event.clientX, event.clientY)
}
</script>

<template>
  <!-- 滚动节流 -->
  <div v-throttle:scroll="handleScroll" class="scroll-container">
    滚动内容
  </div>

  <!-- 鼠标移动节流 -->
  <div v-throttle:mousemove.100="handleMouseMove">
    鼠标移动区域
  </div>
</template>
```

### v-tooltip - 工具提示

```vue
<script setup>
import { ref } from 'vue'

const tooltipContent = ref('动态提示内容')
</script>

<template>
  <!-- 基础提示 -->
  <span v-tooltip="'这是一个提示'">悬停查看提示</span>

  <!-- 自定义位置 -->
  <span v-tooltip.top="'顶部提示'">顶部提示</span>
  <span v-tooltip.bottom="'底部提示'">底部提示</span>
  <span v-tooltip.left="'左侧提示'">左侧提示</span>
  <span v-tooltip.right="'右侧提示'">右侧提示</span>

  <!-- 动态内容 -->
  <span v-tooltip="tooltipContent">动态提示</span>

  <!-- 配置选项 -->
  <span
    v-tooltip="{
      content: '自定义提示',
      delay: 500,
      theme: 'dark',
    }"
  >配置提示</span>
</template>
```

### v-loading - 加载状态

```vue
<script setup>
import { ref } from 'vue'

const isLoading = ref(false)

function startLoading() {
  isLoading.value = true

  setTimeout(() => {
    isLoading.value = false
  }, 3000)
}
</script>

<template>
  <!-- 基础加载 -->
  <div v-loading="isLoading">
    内容区域
  </div>

  <!-- 自定义加载文本 -->
  <div v-loading="isLoading" loading-text="正在加载...">
    内容区域
  </div>

  <!-- 自定义加载样式 -->
  <div
    v-loading="{
      loading: isLoading,
      text: '处理中...',
      spinner: 'dots',
      background: 'rgba(0, 0, 0, 0.8)',
    }"
  >
    内容区域
  </div>
</template>
```

### v-show-animate - 显示动画

```vue
<script setup>
import { ref } from 'vue'

const isVisible = ref(true)
</script>

<template>
  <!-- 淡入淡出 -->
  <div v-show-animate.fade="isVisible">
    淡入淡出内容
  </div>

  <!-- 滑动效果 -->
  <div v-show-animate.slide="isVisible">
    滑动内容
  </div>

  <!-- 缩放效果 -->
  <div v-show-animate.scale="isVisible">
    缩放内容
  </div>

  <!-- 自定义动画 -->
  <div
    v-show-animate="{
      show: isVisible,
      enter: 'fadeInUp',
      leave: 'fadeOutDown',
      duration: 500,
    }"
  >
    自定义动画内容
  </div>
</template>
```

### v-drag - 拖拽功能

```vue
<script setup>
function handleDrag(position, event) {
  console.log('拖拽位置:', position)
}

function handleDragStart(event) {
  console.log('开始拖拽')
}

function handleDragEnd(event) {
  console.log('结束拖拽')
}
</script>

<template>
  <!-- 基础拖拽 -->
  <div v-drag="handleDrag" class="draggable">
    拖拽我
  </div>

  <!-- 限制拖拽方向 -->
  <div v-drag.x="handleDrag">
    只能水平拖拽
  </div>
  <div v-drag.y="handleDrag">
    只能垂直拖拽
  </div>

  <!-- 拖拽配置 -->
  <div
    v-drag="{
      onDrag: handleDrag,
      onStart: handleDragStart,
      onEnd: handleDragEnd,
      containment: '.container',
      grid: [10, 10],
    }"
  >
    配置拖拽
  </div>
</template>
```

### v-resize - 大小调整

```vue
<script setup>
function handleResize(size, event) {
  console.log('新大小:', size)
}
</script>

<template>
  <!-- 基础调整大小 -->
  <div v-resize="handleResize" class="resizable">
    调整我的大小
  </div>

  <!-- 限制调整方向 -->
  <div v-resize.horizontal="handleResize">
    只能水平调整
  </div>
  <div v-resize.vertical="handleResize">
    只能垂直调整
  </div>

  <!-- 调整配置 -->
  <div
    v-resize="{
      onResize: handleResize,
      minWidth: 100,
      minHeight: 100,
      maxWidth: 500,
      maxHeight: 500,
      handles: ['se', 'sw', 'ne', 'nw'],
    }"
  >
    配置调整大小
  </div>
</template>
```

## 自定义指令

### 创建自定义指令

```typescript
// 注册全局指令
engine.directives.register('highlight', {
  mounted(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  },

  updated(el, binding) {
    el.style.backgroundColor = binding.value || 'yellow'
  },
})

// 使用指令
// <div v-highlight="'red'">高亮文本</div>
```

### 指令生命周期

```typescript
engine.directives.register('lifecycle-demo', {
  // 绑定元素的父组件被挂载前调用
  beforeMount(el, binding, vnode, prevVnode) {
    console.log('beforeMount')
  },

  // 绑定元素的父组件被挂载后调用
  mounted(el, binding, vnode, prevVnode) {
    console.log('mounted')
  },

  // 绑定元素的父组件更新前调用
  beforeUpdate(el, binding, vnode, prevVnode) {
    console.log('beforeUpdate')
  },

  // 绑定元素的父组件及其子组件都更新后调用
  updated(el, binding, vnode, prevVnode) {
    console.log('updated')
  },

  // 绑定元素的父组件卸载前调用
  beforeUnmount(el, binding, vnode, prevVnode) {
    console.log('beforeUnmount')
  },

  // 绑定元素的父组件卸载后调用
  unmounted(el, binding, vnode, prevVnode) {
    console.log('unmounted')
  },
})
```

### 复杂指令示例

```typescript
// 图片懒加载指令
engine.directives.register('lazy', {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = binding.value
          img.classList.remove('lazy')
          observer.unobserve(img)
        }
      })
    })

    el.classList.add('lazy')
    observer.observe(el)

    // 保存观察器引用以便清理
    el._lazyObserver = observer
  },

  unmounted(el) {
    if (el._lazyObserver) {
      el._lazyObserver.disconnect()
    }
  },
})

// 权限控制指令
engine.directives.register('permission', {
  mounted(el, binding) {
    const permission = binding.value
    const hasPermission = engine.auth.hasPermission(permission)

    if (!hasPermission) {
      el.style.display = 'none'
      // 或者移除元素
      // el.parentNode?.removeChild(el)
    }
  },

  updated(el, binding) {
    const permission = binding.value
    const hasPermission = engine.auth.hasPermission(permission)

    el.style.display = hasPermission ? '' : 'none'
  },
})

// 无限滚动指令
engine.directives.register('infinite-scroll', {
  mounted(el, binding) {
    const callback = binding.value
    const options = binding.modifiers

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback()
          }
        })
      },
      {
        threshold: options.threshold || 0.1,
      }
    )

    // 创建触发元素
    const trigger = document.createElement('div')
    trigger.style.height = '1px'
    el.appendChild(trigger)

    observer.observe(trigger)

    el._infiniteScrollObserver = observer
    el._infiniteScrollTrigger = trigger
  },

  unmounted(el) {
    if (el._infiniteScrollObserver) {
      el._infiniteScrollObserver.disconnect()
    }
    if (el._infiniteScrollTrigger) {
      el._infiniteScrollTrigger.remove()
    }
  },
})
```

## 指令配置

### 全局配置

```typescript
const engine = createEngine({
  directives: {
    // 启用内置指令
    builtin: {
      click: true,
      debounce: true,
      throttle: true,
      tooltip: true,
      loading: true,
      showAnimate: true,
      drag: true,
      resize: true,
    },

    // 自定义指令配置
    custom: {
      // 注册自定义指令
      highlight: {
        mounted(el, binding) {
          el.style.backgroundColor = binding.value
        },
      },
    },

    // 指令默认配置
    defaults: {
      debounce: {
        delay: 300,
      },
      throttle: {
        delay: 100,
      },
      tooltip: {
        placement: 'top',
        delay: 0,
      },
    },
  },
})
```

## 最佳实践

### 1. 指令命名

```typescript
// 使用有意义的名称
engine.directives.register('auto-focus', {
  /* ... */
})
engine.directives.register('click-outside', {
  /* ... */
})
engine.directives.register('scroll-spy', {
  /* ... */
})

// 避免与内置指令冲突
// ❌ 不好
engine.directives.register('show', {
  /* ... */
})

// ✅ 好
engine.directives.register('custom-show', {
  /* ... */
})
```

### 2. 性能优化

```typescript
// 使用防抖和节流
engine.directives.register('optimized-scroll', {
  mounted(el, binding) {
    const handler = engine.utils.throttle(binding.value, 100)
    el.addEventListener('scroll', handler)
    el._scrollHandler = handler
  },

  unmounted(el) {
    if (el._scrollHandler) {
      el.removeEventListener('scroll', el._scrollHandler)
    }
  },
})

// 避免内存泄漏
engine.directives.register('safe-directive', {
  mounted(el, binding) {
    // 保存引用以便清理
    el._cleanup = []

    const observer = new MutationObserver(callback)
    observer.observe(el, { childList: true })

    el._cleanup.push(() => observer.disconnect())
  },

  unmounted(el) {
    // 清理所有资源
    if (el._cleanup) {
      el._cleanup.forEach(cleanup => cleanup())
      el._cleanup = null
    }
  },
})
```

### 3. 错误处理

```typescript
engine.directives.register('safe-directive', {
  mounted(el, binding) {
    try {
      // 指令逻辑
      this.setupDirective(el, binding)
    }
    catch (error) {
      engine.logger.error('指令初始化失败:', error)

      // 降级处理
      this.fallbackSetup(el, binding)
    }
  },

  setupDirective(el, binding) {
    // 主要逻辑
  },

  fallbackSetup(el, binding) {
    // 降级逻辑
  },
})
```

### 4. 指令组合

```typescript
// 创建指令组合
function createFormDirectives() {
  return {
    'form-validate': {
      mounted(el, binding) {
        // 表单验证逻辑
      },
    },

    'form-submit': {
      mounted(el, binding) {
        // 表单提交逻辑
      },
    },

    'form-reset': {
      mounted(el, binding) {
        // 表单重置逻辑
      },
    },
  }
}

// 批量注册
const formDirectives = createFormDirectives()
Object.entries(formDirectives).forEach(([name, directive]) => {
  engine.directives.register(name, directive)
})
```

## 指令工具

### 指令管理器

```typescript
class DirectiveManager {
  private directives = new Map()

  register(name: string, directive: any) {
    if (this.directives.has(name)) {
      engine.logger.warn(`指令 ${name} 已存在，将被覆盖`)
    }

    this.directives.set(name, directive)
    engine.logger.info(`指令 ${name} 注册成功`)
  }

  unregister(name: string) {
    if (this.directives.has(name)) {
      this.directives.delete(name)
      engine.logger.info(`指令 ${name} 已注销`)
    }
  }

  get(name: string) {
    return this.directives.get(name)
  }

  list() {
    return Array.from(this.directives.keys())
  }
}
```

### 指令调试

```typescript
// 调试指令
engine.directives.register('debug', {
  mounted(el, binding, vnode) {
    console.group(`指令调试: ${binding.arg || 'debug'}`)
    console.log('元素:', el)
    console.log('绑定值:', binding.value)
    console.log('修饰符:', binding.modifiers)
    console.log('虚拟节点:', vnode)
    console.groupEnd()
  },

  updated(el, binding, vnode, prevVnode) {
    console.log(`指令更新: ${binding.arg || 'debug'}`, {
      oldValue: prevVnode.props?.[binding.arg],
      newValue: binding.value,
    })
  },
})
```

## 与其他系统集成

### 与事件系统集成

```typescript
engine.directives.register('event-bridge', {
  mounted(el, binding) {
    const eventName = binding.arg
    const handler = (event) => {
      engine.events.emit(`directive:${eventName}`, {
        element: el,
        event,
        value: binding.value,
      })
    }

    el.addEventListener(eventName, handler)
    el._eventHandler = handler
  },

  unmounted(el) {
    if (el._eventHandler) {
      el.removeEventListener(binding.arg, el._eventHandler)
    }
  },
})
```

### 与状态管理集成

```typescript
engine.directives.register('state-sync', {
  mounted(el, binding) {
    const statePath = binding.value

    // 监听状态变化
    const unwatch = engine.state.watch(statePath, (newValue) => {
      if (el.tagName === 'INPUT') {
        el.value = newValue
      }
      else {
        el.textContent = newValue
      }
    })

    el._stateUnwatch = unwatch
  },

  unmounted(el) {
    if (el._stateUnwatch) {
      el._stateUnwatch()
    }
  },
})
```
