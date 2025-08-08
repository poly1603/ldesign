import {
  type HistoryLocation,
  type HistoryState,
  type NavigationCallback,
  NavigationDirection,
  NavigationType,
  type RouterHistory,
} from '../types'

/**
 * 创建 Web History 模式
 */
export function createWebHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)

  return createHistory({
    base: normalizedBase,
    location: () =>
      window.location.pathname + window.location.search + window.location.hash,
    state: () => window.history.state,
    push: (to: HistoryLocation, data?: HistoryState) => {
      window.history.pushState(data, '', createHref(normalizedBase, to))
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      window.history.replaceState(data, '', createHref(normalizedBase, to))
    },
    go: (delta: number) => {
      window.history.go(delta)
    },
    listen: (callback: NavigationCallback) => {
      const popstateHandler = (_event: PopStateEvent) => {
        const to =
          window.location.pathname +
          window.location.search +
          window.location.hash
        const from = getCurrentLocation()
        callback(to, from, {
          type: NavigationType.pop,
          direction: NavigationDirection.unknown,
          delta: 0,
        })
      }

      window.addEventListener('popstate', popstateHandler)

      return () => {
        window.removeEventListener('popstate', popstateHandler)
      }
    },
  })
}

/**
 * 创建 Hash History 模式
 */
export function createWebHashHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)

  return createHistory({
    base: normalizedBase,
    location: () => window.location.hash.slice(1) || '/',
    state: () => window.history.state,
    push: (to: HistoryLocation, _data?: HistoryState) => {
      window.location.hash = to
    },
    replace: (to: HistoryLocation, _data?: HistoryState) => {
      window.location.replace(`${window.location.href.split('#')[0]}#${to}`)
    },
    go: (delta: number) => {
      window.history.go(delta)
    },
    listen: (callback: NavigationCallback) => {
      const hashchangeHandler = (_event: HashChangeEvent) => {
        const to = window.location.hash.slice(1) || '/'
        const from = getCurrentLocation()
        callback(to, from, {
          type: NavigationType.pop,
          direction: NavigationDirection.unknown,
          delta: 0,
        })
      }

      window.addEventListener('hashchange', hashchangeHandler)

      return () => {
        window.removeEventListener('hashchange', hashchangeHandler)
      }
    },
  })
}

/**
 * 创建内存 History 模式
 */
export function createMemoryHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)
  let currentLocation = '/'
  let currentState: HistoryState = {}
  const stack: Array<{ location: string; state: HistoryState }> = [
    { location: currentLocation, state: currentState },
  ]
  let position = 0
  const listeners: NavigationCallback[] = []

  function triggerListeners(to: string, from: string, info: any) {
    listeners.forEach(callback => {
      try {
        callback(to, from, info)
      } catch (error) {
        console.error('Error in navigation listener:', error)
      }
    })
  }

  return createHistory({
    base: normalizedBase,
    location: () => currentLocation,
    state: () => currentState,
    push: (to: HistoryLocation, data?: HistoryState) => {
      const from = currentLocation
      // 移除当前位置之后的所有记录
      stack.splice(position + 1)
      stack.push({ location: to, state: data || {} })
      position = stack.length - 1
      currentLocation = to
      currentState = data || {}
      triggerListeners(to, from, { type: 'push' })
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      const from = currentLocation
      stack[position] = { location: to, state: data || {} }
      currentLocation = to
      currentState = data || {}
      triggerListeners(to, from, { type: 'replace' })
    },
    go: (delta: number) => {
      const from = currentLocation
      const newPosition = position + delta
      if (newPosition >= 0 && newPosition < stack.length) {
        position = newPosition
        const entry = stack[position]
        if (entry) {
          currentLocation = entry.location
          currentState = entry.state
          triggerListeners(currentLocation, from, { type: 'go', delta })
        }
      }
      // 如果超出范围，保持在边界
      else if (newPosition < 0) {
        position = 0
        const entry = stack[0]
        if (entry) {
          currentLocation = entry.location
          currentState = entry.state
          triggerListeners(currentLocation, from, { type: 'go', delta })
        }
      } else if (newPosition >= stack.length) {
        position = stack.length - 1
        const entry = stack[position]
        if (entry) {
          currentLocation = entry.location
          currentState = entry.state
          triggerListeners(currentLocation, from, { type: 'go', delta })
        }
      }
    },
    listen: (callback: NavigationCallback) => {
      listeners.push(callback)
      return () => {
        const index = listeners.indexOf(callback)
        if (index > -1) {
          listeners.splice(index, 1)
        }
      }
    },
  })
}

/**
 * 创建通用 History 实现
 */
function createHistory(options: {
  base: string
  location: () => string
  state: () => HistoryState
  push: (to: HistoryLocation, data?: HistoryState) => void
  replace: (to: HistoryLocation, data?: HistoryState) => void
  go: (delta: number) => void
  listen: (callback: NavigationCallback) => () => void
}): RouterHistory {
  function getCurrentLocation(): string {
    return options.location()
  }

  function push(to: HistoryLocation, data?: HistoryState): void {
    options.push(to, data)
  }

  function replace(to: HistoryLocation, data?: HistoryState): void {
    options.replace(to, data)
  }

  function go(delta: number): void {
    options.go(delta)
  }

  function back(): void {
    go(-1)
  }

  function forward(): void {
    go(1)
  }

  function listen(callback: NavigationCallback): () => void {
    return options.listen(callback)
  }

  return {
    base: options.base,
    location: getCurrentLocation,
    state: options.state,
    push,
    replace,
    go,
    back,
    forward,
    listen,
  }
}

/**
 * 规范化 base 路径
 */
function normalizeBase(base?: string): string {
  if (!base) {
    if (typeof window !== 'undefined') {
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
    } else {
      base = '/'
    }
  }

  // 确保以 / 开头
  if (!base.startsWith('/')) {
    base = `/${base}`
  }

  // 移除尾部的 /
  return base.replace(/\/$/, '') || '/'
}

/**
 * 创建完整的 href
 */
function createHref(base: string, location: HistoryLocation): string {
  return base + location
}

/**
 * 获取当前位置
 */
function getCurrentLocation(): string {
  return (
    window.location.pathname + window.location.search + window.location.hash
  )
}
