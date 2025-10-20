/**
 * 优化的路由组件 - 减少内存占用和虚拟DOM开销
 */

import type { RouteLocationNormalized, RouteLocationRaw } from '../types'
import {
  defineComponent,
  h,
  markRaw,
  onUnmounted,
  type PropType,
  shallowReactive,
  shallowRef,
  type ShallowRef,
  unref,
  type VNode,
  watchEffect,
} from 'vue'
import { ObjectPool } from '../core/matcher/optimized-trie'

/**
 * VNode 缓存管理器 - 减少虚拟节点重复创建
 */
class VNodeCache {
  private cache = new Map<string, VNode>()
  private readonly maxSize = 50
  private accessOrder: string[] = []
  
  get(key: string): VNode | undefined {
    const vnode = this.cache.get(key)
    if (vnode) {
      // 更新访问顺序
      const index = this.accessOrder.indexOf(key)
      if (index > -1) {
        this.accessOrder.splice(index, 1)
      }
      this.accessOrder.push(key)
    }
    return vnode
  }
  
  set(key: string, vnode: VNode): void {
    // 检查缓存大小
    if (!this.cache.has(key) && this.cache.size >= this.maxSize) {
      // 删除最少访问的项
      const lru = this.accessOrder.shift()
      if (lru) {
        this.cache.delete(lru)
      }
    }
    
    this.cache.set(key, vnode)
    
    // 更新访问顺序
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
    this.accessOrder.push(key)
  }
  
  clear(): void {
    this.cache.clear()
    this.accessOrder = []
  }
  
  getSize(): number {
    return this.cache.size
  }
}

// ComponentInstanceCache 已移除


/**
 * 优化的 RouterView 组件
 */
export const OptimizedRouterView = defineComponent({
  name: 'OptimizedRouterView',
  props: {
    name: {
      type: String,
      default: 'default',
    },
    // 使用浅层响应式减少开销
    route: {
      type: Object as PropType<ShallowRef<RouteLocationNormalized>>,
      required: false,
    },
  },
  setup(props) {
    // 使用 shallowRef 减少响应式开销
    const currentComponent = shallowRef<any>(null)
    const pendingComponent = shallowRef<any>(null)
    
    // VNode 缓存
    const vnodeCache = new VNodeCache()
    
    // 组件加载器池 - 复用 Promise
    const loaderPool = new ObjectPool<Promise<any>>(
      () => Promise.resolve(),
      (_promise) => {
        // Promise 无法重置，创建新的
      },
      5
    )
    
    // 错误边界
    const error = shallowRef<Error | null>(null)
    
    // 监听路由变化（优化：使用 watchEffect 减少依赖追踪）
    let cleanup: (() => void) | undefined
    
    watchEffect(() => {
      const route = unref(props.route)
      if (!route) return
      
      const matched = route.matched[route.matched.length - 1]
      if (!matched) {
        currentComponent.value = null
        return
      }
      
      const component = matched.components?.[props.name]
      if (!component) {
        currentComponent.value = null
        return
      }
      
      // 异步组件加载优化
      if (typeof component === 'function') {
        pendingComponent.value = component
        
        // 复用加载器
        const loader = loaderPool.acquire()
        
        Promise.resolve(((component as any))())
          .then((loaded) => {
            if (pendingComponent.value === component) {
              currentComponent.value = markRaw(
                loaded.default || loaded
              )
              pendingComponent.value = null
            }
            loaderPool.release(loader)
          })
          .catch((err) => {
            error.value = err
            loaderPool.release(loader)
          })
      } else {
        currentComponent.value = markRaw(component as any)
      }
    })
    
    // 组件卸载时清理
    onUnmounted(() => {
      cleanup?.()
      vnodeCache.clear()
      loaderPool.clear()
    })
    
    return () => {
      const component = currentComponent.value
      
      if (error.value) {
        // 错误处理
        return h('div', { class: 'router-error' }, [
          h('h3', 'Component Error'),
          h('pre', error.value.message),
        ])
      }
      
      if (!component) {
        return null
      }
      
      // 生成缓存键
      const cacheKey = `${props.name}_${component.name || 'anonymous'}`
      
      // 尝试从缓存获取 VNode
      let vnode = vnodeCache.get(cacheKey)
      
      if (!vnode) {
        // 创建新的 VNode
        vnode = h(component, {
          key: cacheKey,
        })
        
        // 缓存 VNode
        vnodeCache.set(cacheKey, vnode)
      }
      
      return vnode
    }
  },
})

/**
 * 优化的 RouterLink 组件
 */
export const OptimizedRouterLink = defineComponent({
  name: 'OptimizedRouterLink',
  props: {
    to: {
      type: [String, Object] as PropType<RouteLocationRaw>,
      required: true,
    },
    replace: Boolean,
    activeClass: {
      type: String,
      default: 'router-link-active',
    },
    exactActiveClass: {
      type: String,
      default: 'router-link-exact-active',
    },
    custom: Boolean,
    ariaCurrentValue: {
      type: String as PropType<'page' | 'step' | 'location' | 'date' | 'time'>,
      default: 'page',
    },
  },
  setup(props, { slots }) {
    // 使用 shallowReactive 减少响应式开销
    const link = shallowReactive({
      href: '',
      route: null as RouteLocationNormalized | null,
      isActive: false,
      isExactActive: false,
    })
    
    // 缓存计算结果
    const hrefCache = new Map<string, string>()
    const classCache = new Map<string, string[]>()
    
    // 计算 href（带缓存）
    const computeHref = (to: RouteLocationRaw): string => {
      const key = typeof to === 'string' ? to : JSON.stringify(to)
      
      if (!hrefCache.has(key)) {
        // 实际计算 href
        const href = typeof to === 'string' ? to : (to as any).path || '/'
        hrefCache.set(key, href)
        
        // 限制缓存大小
        if (hrefCache.size > 100) {
          const firstKey = hrefCache.keys().next().value as string | undefined
          if (firstKey !== undefined) {
            hrefCache.delete(firstKey)
          }
        }
      }
      
      return hrefCache.get(key)!
    }
    
    // 计算 class（带缓存）
    const computeClass = (isActive: boolean, isExactActive: boolean): string[] => {
      const key = `${isActive}_${isExactActive}`
      
      if (!classCache.has(key)) {
        const classes: string[] = []
        if (isActive) classes.push(props.activeClass)
        if (isExactActive) classes.push(props.exactActiveClass)
        classCache.set(key, classes)
      }
      
      return classCache.get(key)!
    }
    
    // 监听属性变化
    watchEffect(() => {
      link.href = computeHref(props.to)
      // 简化的激活状态判断
      link.isActive = false
      link.isExactActive = false
    })
    
    // 点击处理（优化：避免创建新函数）
    const handleClick = (e: MouseEvent) => {
      if (props.custom) return
      
      e.preventDefault()
      
      // 导航逻辑
      console.log('Navigate to:', props.to)
    }
    
    // 组件卸载时清理缓存
    onUnmounted(() => {
      hrefCache.clear()
      classCache.clear()
    })
    
    return () => {
      const children = slots.default?.({
        href: link.href,
        route: link.route,
        navigate: handleClick,
        isActive: link.isActive,
        isExactActive: link.isExactActive,
      })
      
      if (props.custom) {
        return children
      }
      
      const classes = computeClass(link.isActive, link.isExactActive)
      
      return h(
        'a',
        {
          href: link.href,
          class: classes,
          'aria-current': link.isExactActive ? props.ariaCurrentValue : undefined,
          onClick: handleClick,
        },
        children
      )
    }
  },
})

/**
 * 优化的 KeepAlive 包装器
 */
export const OptimizedKeepAlive = defineComponent({
  name: 'OptimizedKeepAlive',
  props: {
    include: [String, RegExp, Array],
    exclude: [String, RegExp, Array],
    max: {
      type: Number,
      default: 10, // 默认缓存10个组件
    },
  },
  setup(props, { slots }) {
    // LRU 缓存管理
    const keys = new Set<string>()
    const cache = new Map<string, VNode>()
    
    // 判断是否应该缓存
    const shouldCache = (name: string): boolean => {
      if (props.include) {
        if (typeof props.include === 'string') {
          return name === props.include
        }
        if (props.include instanceof RegExp) {
          return props.include.test(name)
        }
        if (Array.isArray(props.include)) {
          return props.include.includes(name)
        }
      }
      
      if (props.exclude) {
        if (typeof props.exclude === 'string') {
          return name !== props.exclude
        }
        if (props.exclude instanceof RegExp) {
          return !props.exclude.test(name)
        }
        if (Array.isArray(props.exclude)) {
          return !props.exclude.includes(name)
        }
      }
      
      return true
    }
    
    // 修剪缓存
    const pruneCache = () => {
      if (cache.size <= props.max) return
      
      const keysArray = Array.from(keys)
      const toRemove = keysArray.slice(0, cache.size - props.max)
      
      toRemove.forEach(key => {
        keys.delete(key)
        cache.delete(key)
      })
    }
    
    return () => {
      const children = slots.default?.()
      
      if (!children || children.length === 0) {
        return null
      }
      
      const child = children[0]
      if (!child) return null
      
      const key = (child.type as any)?.name || 'default'
      
      if (!shouldCache(key)) {
        return child
      }
      
      // 从缓存获取或添加到缓存
      if (cache.has(key)) {
        // 更新 LRU 顺序
        keys.delete(key)
        keys.add(key)
        return cache.get(key)
      }
      
      // 添加到缓存
      keys.add(key)
      cache.set(key, child)
      
      // 修剪缓存
      pruneCache()
      
      return child
    }
  },
})

/**
 * 内存使用统计组件（开发模式）
 */
export const MemoryStats = defineComponent({
  name: 'MemoryStats',
  setup() {
    const stats = shallowReactive({
      usedMemory: 0,
      totalMemory: 0,
      percentage: 0,
    })
    
    let interval: number | null = null
    
    const updateStats = () => {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory
        stats.usedMemory = memory.usedJSHeapSize
        stats.totalMemory = memory.totalJSHeapSize
        stats.percentage = (stats.usedMemory / stats.totalMemory) * 100
      }
    }
    
    // 开始监控
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      interval = window.setInterval(updateStats, 1000)
      updateStats()
    }
    
    onUnmounted(() => {
      if (interval) {
        clearInterval(interval)
      }
    })
    
    return () => {
      if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'development') {
        return null
      }
      
      return h('div', {
        style: {
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          padding: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontSize: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
        },
      }, [
        h('div', `Memory: ${(stats.usedMemory / 1024 / 1024).toFixed(2)} MB`),
        h('div', `Total: ${(stats.totalMemory / 1024 / 1024).toFixed(2)} MB`),
        h('div', `Usage: ${stats.percentage.toFixed(1)}%`),
        h('div', {
          style: {
            width: '100px',
            height: '4px',
            background: '#333',
            marginTop: '5px',
          },
        }, [
          h('div', {
            style: {
              width: `${stats.percentage}%`,
              height: '100%',
              background: stats.percentage > 80 ? 'red' : stats.percentage > 60 ? 'orange' : 'green',
            },
          }),
        ]),
      ])
    }
  },
})