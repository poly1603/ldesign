import type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationType,
  RouterHistory,
} from './types'

/**
 * 创建 Web History 模式
 */
export function createWebHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)

  return createHistory({
    base: normalizedBase,
    location: () => window.location.pathname + window.location.search + window.location.hash,
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
      const popstateHandler = (event: PopStateEvent) => {
        const to = window.location.pathname + window.location.search + window.location.hash
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
    push: (to: HistoryLocation, data?: HistoryState) => {
      window.location.hash = to
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      const href = `${window.location.href.replace(/#.*$/, '')}#${to}`
      window.location.replace(href)
    },
    go: (delta: number) => {
      window.history.go(delta)
    },
    listen: (callback: NavigationCallback) => {
      const hashchangeHandler = (event: HashChangeEvent) => {
        const to = window.location.hash.slice(1) || '/'
        const from = new URL(event.oldURL).hash.slice(1) || '/'
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
 * 创建内存 History 模式（用于 SSR 或测试）
 */
export function createMemoryHistory(base?: string): RouterHistory {
  const normalizedBase = normalizeBase(base)
  let location = '/'
  let state: HistoryState = {}
  const stack: Array<{ location: HistoryLocation, state: HistoryState }> = [{ location, state }]
  let position = 0
  const listeners: NavigationCallback[] = []

  return createHistory({
    base: normalizedBase,
    location: () => location,
    state: () => state,
    push: (to: HistoryLocation, data?: HistoryState) => {
      position++
      if (position < stack.length) {
        stack.splice(position)
      }
      stack.push({ location: to, state: data || {} })
      location = to
      state = data || {}

      listeners.forEach((listener) => {
        listener(to, location, {
          type: NavigationType.push,
          direction: NavigationDirection.forward,
          delta: 1,
        })
      })
    },
    replace: (to: HistoryLocation, data?: HistoryState) => {
      stack[position] = { location: to, state: data || {} }
      location = to
      state = data || {}

      listeners.forEach((listener) => {
        listener(to, location, {
          type: NavigationType.push,
          direction: NavigationDirection.unknown,
          delta: 0,
        })
      })
    },
    go: (delta: number) => {
      const newPosition = position + delta
      if (newPosition < 0 || newPosition >= stack.length) {
        return
      }

      const from = location
      position = newPosition
      const entry = stack[position]
      location = entry.location
      state = entry.state

      listeners.forEach((listener) => {
        listener(location, from, {
          type: NavigationType.pop,
          direction: delta > 0 ? NavigationDirection.forward : NavigationDirection.back,
          delta,
        })
      })
    },
    listen: (callback: NavigationCallback) => {
      listeners.push(callback)
      return () => {
        const index = listeners.indexOf(callback)
        if (index > -1)
          listeners.splice(index, 1)
      }
    },
  })
}

/**
 * 创建通用历史管理器
 */
function createHistory(options: {
  base: string
  location: () => HistoryLocation
  state: () => HistoryState
  push: (to: HistoryLocation, data?: HistoryState) => void
  replace: (to: HistoryLocation, data?: HistoryState) => void
  go: (delta: number) => void
  listen: (callback: NavigationCallback) => () => void
}): RouterHistory {
  const { base, location, state, push, replace, go, listen } = options

  return {
    base,
    get location() {
      return location()
    },
    get state() {
      return state()
    },
    push,
    replace,
    go,
    back: (triggerListeners = true) => go(-1),
    forward: (triggerListeners = true) => go(1),
    listen,
    createHref: (location: HistoryLocation) => createHref(base, location),
    destroy: () => {
      // 清理资源
    },
  }
}

/**
 * 标准化 base 路径
 */
function normalizeBase(base?: string): string {
  if (!base) {
    if (typeof window !== 'undefined') {
      const baseEl = document.querySelector('base')
      base = (baseEl && baseEl.getAttribute('href')) || '/'
      base = base.replace(/^\w+:\/\/[^/]+/, '')
    }
    else {
      base = '/'
    }
  }

  if (base[0] !== '/') {
    base = `/${base}`
  }

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
function getCurrentLocation(): HistoryLocation {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search + window.location.hash
  }
  return '/'
}
