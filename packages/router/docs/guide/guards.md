# 路由守卫

路由守卫是 LDesign Router 提供的强大功能，用于控制路由的访问权限和执行导航过程中的逻辑。

## 🛡️ 守卫类型概览

LDesign Router 提供了三种类型的路由守卫：

- **全局守卫** - 应用于所有路由
- **路由级守卫** - 应用于特定路由
- **组件内守卫** - 应用于特定组件

## 🌐 全局守卫

### 全局前置守卫

在每次导航触发时调用：

```typescript
import { createRouter } from '@ldesign/router'

const router = createRouter({
  // 路由配置...
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  console.log('导航开始:', from.path, '->', to.path)

  // 身份验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
    return
  }

  // 权限检查
  if (to.meta.roles && !hasPermission(to.meta.roles)) {
    next('/403')
    return
  }

  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  next()
})

// 辅助函数
function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

function hasPermission(roles: string[]): boolean {
  const userRoles = getUserRoles()
  return roles.some(role => userRoles.includes(role))
}
```

### 全局解析守卫

在导航被确认之前调用：

```typescript
router.beforeResolve((to, from, next) => {
  // 在这里可以确保所有组件都已经被解析
  console.log('导航即将完成:', to.path)

  // 预加载数据
  if (to.meta.preloadData) {
    preloadRouteData(to)
      .then(() => {
        next()
      })
      .catch(error => {
        console.error('数据预加载失败:', error)
        next(false) // 取消导航
      })
  } else {
    next()
  }
})

async function preloadRouteData(route: RouteLocationNormalized) {
  // 根据路由元信息预加载数据
  const dataLoaders = route.meta.dataLoaders || []
  await Promise.all(dataLoaders.map(loader => loader(route)))
}
```

### 全局后置钩子

导航完成后调用：

```typescript
router.afterEach((to, from, failure) => {
  // 导航完成后的逻辑
  console.log('导航完成:', to.path)

  // 发送页面浏览统计
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: to.meta.title,
      page_location: window.location.href,
      page_path: to.path,
    })
  }

  // 滚动到顶部
  if (!to.hash) {
    window.scrollTo(0, 0)
  }

  // 处理导航失败
  if (failure) {
    console.error('导航失败:', failure)
  }
})
```

## 🎯 路由级守卫

### beforeEnter 守卫

在路由配置中定义：

```typescript
const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    beforeEnter: (to, from, next) => {
      // 检查管理员权限
      if (!isAdmin()) {
        next('/403')
      } else {
        next()
      }
    },
  },

  // 多个守卫
  {
    path: '/sensitive',
    component: SensitivePage,
    beforeEnter: [
      // 身份验证
      (to, from, next) => {
        if (!isAuthenticated()) {
          next('/login')
        } else {
          next()
        }
      },

      // 权限检查
      (to, from, next) => {
        if (!hasHighLevelPermission()) {
          next('/403')
        } else {
          next()
        }
      },

      // 访问日志
      (to, from, next) => {
        logSensitiveAccess(to.path)
        next()
      },
    ],
  },
]
```

### 动态守卫

根据条件动态添加守卫：

```typescript
// 为特定路由添加守卫
function addRouteGuard(routeName: string, guard: NavigationGuard) {
  const route = router.resolve({ name: routeName })
  if (route.matched.length > 0) {
    const routeRecord = route.matched[0]
    routeRecord.beforeEnter = guard
  }
}

// 批量添加守卫
function addGuardsToRoutes(routeNames: string[], guard: NavigationGuard) {
  routeNames.forEach(name => addRouteGuard(name, guard))
}

// 使用示例
addGuardsToRoutes(['AdminUsers', 'AdminSettings'], adminGuard)
```

## 🧩 组件内守卫

### beforeRouteEnter

进入路由前调用：

```vue
<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被确认前调用
    // 不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建

    // 检查权限
    if (!canAccessUser(to.params.id)) {
      next('/403')
      return
    }

    // 预加载数据
    fetchUserData(to.params.id)
      .then(userData => {
        next(vm => {
          // 通过 `vm` 访问组件实例
          vm.userData = userData
        })
      })
      .catch(() => {
        next('/error')
      })
  },
}
</script>
```

### beforeRouteUpdate

路由更新时调用：

```vue
<script>
export default {
  beforeRouteUpdate(to, from, next) {
    // 在当前路由改变，但是该组件被复用时调用
    // 例如：从 /user/1 到 /user/2

    console.log('路由参数变化:', from.params, '->', to.params)

    // 更新数据
    this.loadUserData(to.params.id)
      .then(() => {
        next()
      })
      .catch(error => {
        console.error('数据加载失败:', error)
        next(false) // 取消导航
      })
  },

  methods: {
    async loadUserData(userId) {
      this.loading = true
      try {
        this.userData = await fetchUserData(userId)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
```

### beforeRouteLeave

离开路由前调用：

```vue
<script>
export default {
  beforeRouteLeave(to, from, next) {
    // 导航离开该组件的对应路由时调用
    // 可以访问组件实例 `this`

    if (this.hasUnsavedChanges) {
      const answer = confirm('有未保存的更改，确定要离开吗？')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  },
  data() {
    return {
      hasUnsavedChanges: false,
    }
  },
}
</script>
```

## 🎨 组合式 API 中的守卫

### onBeforeRouteUpdate

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from '@ldesign/router'
import { ref } from 'vue'

const userData = ref(null)
const hasUnsavedChanges = ref(false)

// 路由更新守卫
onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    userData.value = await fetchUserData(to.params.id)
  }
})

// 路由离开守卫
onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = confirm('有未保存的更改，确定要离开吗？')
    if (!answer) return false
  }
})
</script>
```

### 自定义守卫 Hook

```typescript
// composables/useRouteGuard.ts
import { onBeforeRouteLeave } from '@ldesign/router'
import { ref, Ref } from 'vue'

export function useUnsavedChangesGuard(hasChanges: Ref<boolean>) {
  onBeforeRouteLeave(() => {
    if (hasChanges.value) {
      return confirm('有未保存的更改，确定要离开吗？')
    }
  })
}

export function useAuthGuard() {
  onBeforeRouteEnter((to, from, next) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
      next('/login')
    } else {
      next()
    }
  })
}

// 在组件中使用
export default {
  setup() {
    const hasUnsavedChanges = ref(false)

    useUnsavedChangesGuard(hasUnsavedChanges)
    useAuthGuard()

    return {
      hasUnsavedChanges,
    }
  },
}
```

## 🔧 高级守卫模式

### 守卫链

创建可复用的守卫链：

```typescript
// guards/index.ts
export const authGuard: NavigationGuard = (to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
}

export const permissionGuard: NavigationGuard = (to, from, next) => {
  if (to.meta.roles && !hasPermission(to.meta.roles)) {
    next('/403')
  } else {
    next()
  }
}

export const logGuard: NavigationGuard = (to, from, next) => {
  console.log(`访问页面: ${to.path}`)
  next()
}

// 组合守卫
export function createGuardChain(...guards: NavigationGuard[]): NavigationGuard {
  return async (to, from, next) => {
    for (const guard of guards) {
      const result = await new Promise<boolean>(resolve => {
        guard(to, from, result => {
          if (result === false || typeof result === 'string' || typeof result === 'object') {
            resolve(false)
          } else {
            resolve(true)
          }
        })
      })

      if (!result) {
        return
      }
    }
    next()
  }
}

// 使用守卫链
const adminGuardChain = createGuardChain(authGuard, permissionGuard, logGuard)

const routes = [
  {
    path: '/admin',
    component: AdminDashboard,
    beforeEnter: adminGuardChain,
  },
]
```

### 异步守卫

处理异步操作的守卫：

```typescript
const asyncAuthGuard: NavigationGuard = async (to, from, next) => {
  try {
    // 异步验证 token
    const isValid = await validateToken()

    if (!isValid) {
      next('/login')
      return
    }

    // 获取用户信息
    const user = await getCurrentUser()

    // 检查权限
    if (to.meta.roles && !user.roles.some(role => to.meta.roles.includes(role))) {
      next('/403')
      return
    }

    next()
  } catch (error) {
    console.error('认证失败:', error)
    next('/login')
  }
}
```

### 条件守卫

根据条件动态应用守卫：

```typescript
function conditionalGuard(condition: () => boolean, guard: NavigationGuard): NavigationGuard {
  return (to, from, next) => {
    if (condition()) {
      guard(to, from, next)
    } else {
      next()
    }
  }
}

// 使用示例
const developmentOnlyGuard = conditionalGuard(
  () => process.env.NODE_ENV === 'development',
  (to, from, next) => {
    console.log('开发环境守卫')
    next()
  }
)
```

## 🎯 守卫最佳实践

### 1. 守卫职责单一

```typescript
// ✅ 推荐：单一职责
function authGuard(to, from, next) {
  if (!isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
}

function permissionGuard(to, from, next) {
  if (!hasPermission(to.meta.roles)) {
    next('/403')
  } else {
    next()
  }
}

// ❌ 避免：职责混合
function mixedGuard(to, from, next) {
  // 身份验证 + 权限检查 + 日志记录...
}
```

### 2. 错误处理

```typescript
// ✅ 推荐：完善的错误处理
const safeGuard: NavigationGuard = async (to, from, next) => {
  try {
    const result = await someAsyncOperation()
    if (result.success) {
      next()
    } else {
      next('/error')
    }
  } catch (error) {
    console.error('守卫执行失败:', error)
    next('/error')
  }
}
```

### 3. 性能优化

```typescript
// ✅ 推荐：缓存验证结果
const cachedAuthGuard = (() => {
  let lastCheck = 0
  let lastResult = false
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟

  return (to, from, next) => {
    const now = Date.now()

    if (now - lastCheck < CACHE_DURATION) {
      if (lastResult) {
        next()
      } else {
        next('/login')
      }
      return
    }

    // 重新验证
    isAuthenticated().then(result => {
      lastCheck = now
      lastResult = result

      if (result) {
        next()
      } else {
        next('/login')
      }
    })
  }
})()
```

通过合理使用路由守卫，你可以构建安全、可控的应用导航体验。接下来，让我们学
习[嵌套路由](/guide/nested-routes)的使用方法。
