# 指令系统

Vue3 Engine 提供了丰富的自定义指令，扩展了 Vue 的指令功能，包括事件处理、动画、交互等常用功能。

## 内置指令

### v-click - 增强点击处理

```vue
<script setup>
function handleClick(event) {
  console.log('按钮被点击', event)
}
</script>

<template>
  <!-- 基础用法 -->
  <button v-click="handleClick">点击我</button>

  <!-- 防抖点击 -->
  <button v-click.debounce="handleClick">防抖点击</button>

  <!-- 节流点击 -->
  <button v-click.throttle="handleClick">节流点击</button>

  <!-- 自定义延迟 -->
  <button v-click.debounce.500="handleClick">500ms防抖</button>
</template>
```

### v-debounce - 输入防抖

```vue
<script setup>
function handleInput(value, event) {
  console.log('输入内容:', value)
}
</script>

<template>
  <!-- 输入防抖 -->
  <input v-debounce="handleInput" placeholder="输入内容" />

  <!-- 自定义延迟时间 -->
  <input v-debounce.300="handleInput" placeholder="300ms防抖" />

  <!-- 立即执行 -->
  <input v-debounce.immediate="handleInput" placeholder="立即执行" />
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
  <div v-throttle:scroll="handleScroll" class="scroll-container">滚动内容</div>

  <!-- 鼠标移动节流 -->
  <div v-throttle:mousemove.100="handleMouseMove">鼠标移动区域</div>
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
    >配置提示</span
  >
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
  <div v-loading="isLoading">内容区域</div>

  <!-- 自定义加载文本 -->
  <div v-loading="isLoading" loading-text="正在加载...">内容区域</div>

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
  <div v-show-animate.fade="isVisible">淡入淡出内容</div>

  <!-- 滑动效果 -->
  <div v-show-animate.slide="isVisible">滑动内容</div>

  <!-- 缩放效果 -->
  <div v-show-animate.scale="isVisible">缩放内容</div>

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
  <div v-drag="handleDrag" class="draggable">拖拽我</div>

  <!-- 限制拖拽方向 -->
  <div v-drag.x="handleDrag">只能水平拖拽</div>
  <div v-drag.y="handleDrag">只能垂直拖拽</div>

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
  <div v-resize="handleResize" class="resizable">调整我的大小</div>

  <!-- 限制调整方向 -->
  <div v-resize.horizontal="handleResize">只能水平调整</div>
  <div v-resize.vertical="handleResize">只能垂直调整</div>

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
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
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
      entries => {
        entries.forEach(entry => {
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
    } catch (error) {
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
    const handler = event => {
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
    const unwatch = engine.state.watch(statePath, newValue => {
      if (el.tagName === 'INPUT') {
        el.value = newValue
      } else {
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
