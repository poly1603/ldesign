# NavigationGuard API

导航守卫是 LDesign Router 的核心功能，用于控制路由导航的访问权限和执行流程。

## 📋 类型定义

### NavigationGuard

基础导航守卫类型：

```typescript
type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => any
```

### NavigationGuardNext

导航守卫的 next 函数：

```typescript
interface NavigationGuardNext {
  (): void
  (error: Error): void
  (location: RouteLocationRaw): void
  (valid: boolean): void
}
```

### NavigationGuardWithThis

带有 this 上下文的导航守卫：

```typescript
type NavigationGuardWithThis<T> = (
  this: T,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => any
```

## 🛡️ 全局守卫

### beforeEach

全局前置守卫，在每次导航前执行：

```typescript
router.beforeEach((to, from, next) => {
  console.log('导航到:', to.path)

  // 检查认证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})
```

**参数说明：**

- `to`: 即将进入的目标路由
- `from`: 当前导航正要离开的路由
- `next`: 控制导航流程的函数

**next() 用法：**

```typescript
// 继续导航
next()

// 取消导航
next(false)

// 重定向到其他路由
next('/login')
next({ name: 'Login' })

// 传递错误
next(new Error('导航失败'))
```

### beforeResolve

全局解析守卫，在导航被确认之前、所有组件内守卫和异步路由组件被解析之后调用：

```typescript
router.beforeResolve((to, from, next) => {
  // 在这里可以确保所有组件都已经解析完成
  console.log('路由即将解析完成')
  next()
})
```

### afterEach

全局后置钩子，导航完成后执行：

```typescript
router.afterEach((to, from, failure) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 发送页面浏览统计
  analytics.track('page_view', {
    path: to.path,
    name: to.name,
  })

  // 处理导航失败
  if (failure) {
    console.error('导航失败:', failure)
  }
})
```

## 🎯 路由级守卫

### beforeEnter

路由配置中的守卫：

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 检查管理员权限
      if (!hasAdminRole()) {
        next('/403')
      } else {
        next()
      }
    },
  },

  // 多个守卫
  {
    path: '/protected',
    component: Protected,
    beforeEnter: [
      // 认证检查
      (to, from, next) => {
        if (!isAuthenticated()) {
          next('/login')
        } else {
          next()
        }
      },
      // 权限检查
      (to, from, next) => {
        if (!hasPermission(to.meta.permission)) {
          next('/403')
        } else {
          next()
        }
      },
    ],
  },
]
```

## 🏗️ 组件内守卫

### beforeRouteEnter

进入路由前的守卫：

```vue
<script setup>
import { onBeforeRouteEnter } from '@ldesign/router'

// 组合式 API
onBeforeRouteEnter((to, from, next) => {
  // 在渲染该组件的对应路由被确认前调用
  // 不能获取组件实例 `this`，因为当守卫执行前，组件实例还没被创建

  // 可以通过传一个回调给 next 来访问组件实例
  next(vm => {
    // 通过 `vm` 访问组件实例
    vm.loadData()
  })
})
</script>
```

```vue
<!-- Options API -->
<script>
export default {
  beforeRouteEnter(to, from, next) {
    // 在渲染该组件的对应路由被确认前调用
    next(vm => {
      // 通过 `vm` 访问组件实例
      vm.loadUserData(to.params.id)
    })
  },
}
</script>
```

### beforeRouteUpdate

路由更新时的守卫：

```vue
<script setup>
import { onBeforeRouteUpdate } from '@ldesign/router'

// 组合式 API
onBeforeRouteUpdate((to, from, next) => {
  // 在当前路由改变，但是该组件被复用时调用
  // 例如：从 /user/1 导航到 /user/2

  console.log('路由参数变化:', from.params, '->', to.params)

  // 重新加载数据
  loadUserData(to.params.id)

  next()
})
</script>
```

```vue
<!-- Options API -->
<script>
export default {
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时调用
    this.loadUserData(to.params.id)
    next()
  },
}
</script>
```

### beforeRouteLeave

离开路由前的守卫：

```vue
<script setup>
import { onBeforeRouteLeave } from '@ldesign/router'
import { ref } from 'vue'

const hasUnsavedChanges = ref(false)

// 组合式 API
onBeforeRouteLeave((to, from, next) => {
  // 导航离开该组件的对应路由时调用

  if (hasUnsavedChanges.value) {
    const answer = window.confirm('你有未保存的更改，确定要离开吗？')
    if (answer) {
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
})
</script>
```

```vue
<!-- Options API -->
<script>
export default {
  beforeRouteLeave(to, from, next) {
    if (this.hasUnsavedChanges) {
      const answer = window.confirm('你有未保存的更改，确定要离开吗？')
      next(answer)
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

## 🔧 高级用法

### 异步守卫

```typescript
// 异步认证检查
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      // 异步验证 token
      const isValid = await validateToken()
      if (isValid) {
        next()
      } else {
        next('/login')
      }
    } catch (error) {
      console.error('认证检查失败:', error)
      next('/login')
    }
  } else {
    next()
  }
})
```

### 条件守卫

```typescript
// 根据条件动态添加守卫
function createAuthGuard(requiredRole) {
  return (to, from, next) => {
    const userRole = getCurrentUserRole()
    if (userRole === requiredRole) {
      next()
    } else {
      next('/403')
    }
  }
}

// 使用条件守卫
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: createAuthGuard('admin'),
  },
  {
    path: '/moderator',
    component: Moderator,
    beforeEnter: createAuthGuard('moderator'),
  },
]
```

### 守卫链

```typescript
// 创建守卫链
function createGuardChain(...guards) {
  return async (to, from, next) => {
    for (const guard of guards) {
      try {
        await new Promise((resolve, reject) => {
          guard(to, from, result => {
            if (result === false || result instanceof Error) {
              reject(result)
            } else if (typeof result === 'string' || typeof result === 'object') {
              reject(new Error('Redirect'))
            } else {
              resolve()
            }
          })
        })
      } catch (error) {
        return next(error)
      }
    }
    next()
  }
}

// 使用守卫链
function authGuard(to, from, next) {
  if (isAuthenticated()) {
    next()
  } else {
    next('/login')
  }
}

function permissionGuard(to, from, next) {
  if (hasPermission(to.meta.permission)) {
    next()
  } else {
    next('/403')
  }
}

function auditGuard(to, from, next) {
  logAccess(to.path)
  next()
}

// 组合守卫
const routes = [
  {
    path: '/sensitive',
    component: Sensitive,
    beforeEnter: createGuardChain(authGuard, permissionGuard, auditGuard),
  },
]
```

## 🎯 实际应用示例

### 用户认证系统

```typescript
// 认证状态管理
let isAuthenticated = false
let userRoles = []

// 登录函数
async function login(credentials) {
  const response = await api.login(credentials)
  isAuthenticated = true
  userRoles = response.user.roles
  localStorage.setItem('token', response.token)
}

// 登出函数
function logout() {
  isAuthenticated = false
  userRoles = []
  localStorage.removeItem('token')
}

// 认证守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // 检查角色权限
  if (to.meta.roles && !to.meta.roles.some(role => userRoles.includes(role))) {
    next('/403')
    return
  }

  next()
})

// 登录成功后的重定向
router.afterEach((to, from) => {
  if (to.name === 'Login' && from.name && isAuthenticated) {
    const redirectPath = to.query.redirect || '/dashboard'
    router.replace(redirectPath)
  }
})
```

### 权限控制系统

```typescript
// 权限定义
const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  ADMIN_ACCESS: 'admin:access',
}

// 权限检查函数
function hasPermission(permission) {
  const userPermissions = getCurrentUser()?.permissions || []
  return userPermissions.includes(permission)
}

// 权限守卫
function createPermissionGuard(requiredPermission) {
  return (to, from, next) => {
    if (hasPermission(requiredPermission)) {
      next()
    } else {
      next({
        name: 'Forbidden',
        params: { message: '您没有访问此页面的权限' },
      })
    }
  }
}

// 路由配置
const routes = [
  {
    path: '/users',
    component: UserList,
    beforeEnter: createPermissionGuard(PERMISSIONS.USER_READ),
  },
  {
    path: '/users/:id/edit',
    component: UserEdit,
    beforeEnter: createPermissionGuard(PERMISSIONS.USER_WRITE),
  },
  {
    path: '/admin',
    component: AdminPanel,
    beforeEnter: createPermissionGuard(PERMISSIONS.ADMIN_ACCESS),
  },
]
```

### 数据预加载

```typescript
// 数据预加载守卫
router.beforeEach(async (to, from, next) => {
  // 检查是否需要预加载数据
  if (to.meta.preloadData) {
    try {
      // 显示加载状态
      showGlobalLoading()

      // 预加载数据
      const data = await loadRouteData(to)

      // 将数据存储到路由元信息中
      to.meta.preloadedData = data

      next()
    } catch (error) {
      console.error('数据预加载失败:', error)
      next('/error')
    } finally {
      hideGlobalLoading()
    }
  } else {
    next()
  }
})

// 数据加载函数
async function loadRouteData(route) {
  switch (route.name) {
    case 'UserProfile':
      return await api.getUser(route.params.id)
    case 'ProductDetail':
      return await api.getProduct(route.params.id)
    default:
      return null
  }
}
```

## 🎯 最佳实践

### 1. 守卫执行顺序

```typescript
// 守卫执行顺序：
// 1. 全局前置守卫 (beforeEach)
// 2. 路由级守卫 (beforeEnter)
// 3. 组件内守卫 (beforeRouteEnter)
// 4. 全局解析守卫 (beforeResolve)
// 5. 导航确认
// 6. 全局后置钩子 (afterEach)
// 7. DOM 更新
// 8. 组件内守卫 (beforeRouteEnter 的 next 回调)
```

### 2. 错误处理

```typescript
// ✅ 推荐：完善的错误处理
router.beforeEach((to, from, next) => {
  try {
    if (to.meta.requiresAuth && !isAuthenticated()) {
      next('/login')
    } else {
      next()
    }
  } catch (error) {
    console.error('守卫执行错误:', error)
    next(error)
  }
})

// ❌ 避免：忽略错误
router.beforeEach((to, from, next) => {
  // 可能抛出错误的代码
  const user = JSON.parse(localStorage.getItem('user'))
  if (user.role === 'admin') {
    next()
  }
})
```

### 3. 性能优化

```typescript
// ✅ 推荐：避免重复检查
const authCache = new Map()

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const cacheKey = `auth_${getCurrentUserId()}`

    if (!authCache.has(cacheKey)) {
      const isValid = await validateAuth()
      authCache.set(cacheKey, isValid)
    }

    if (authCache.get(cacheKey)) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})
```

导航守卫是构建安全、可控的路由系统的重要工具，合理使用可以实现复杂的访问控制和用户体验优化。
