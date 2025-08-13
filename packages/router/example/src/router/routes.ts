// 简化的路由配置，使用懒加载避免克隆问题
export const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      description: '欢迎使用 @ldesign/router 示例应用',
    },
  },
  {
    path: '/basic',
    name: 'Basic',
    component: () => import('../views/BasicRouting.vue'),
    meta: {
      title: '基础路由',
      description: '演示基础路由功能',
    },
  },
  {
    path: '/nested',
    name: 'Nested',
    component: () => import('../views/NestedRouting.vue'),
    meta: {
      title: '嵌套路由',
      description: '演示嵌套路由功能',
    },
    children: [
      {
        path: '',
        name: 'NestedDefault',
        component: () => import('../views/nested/Default.vue'),
      },
      {
        path: 'child1',
        name: 'NestedChild1',
        component: () => import('../views/nested/Child1.vue'),
        meta: {
          title: '子路由 1',
        },
      },
      {
        path: 'child2',
        name: 'NestedChild2',
        component: () => import('../views/nested/Child2.vue'),
        meta: {
          title: '子路由 2',
        },
      },
    ],
  },
  {
    path: '/dynamic/:id',
    name: 'Dynamic',
    component: () => import('../views/DynamicRouting.vue'),
    meta: {
      title: '动态路由',
      description: '演示动态路由参数',
    },
    props: true,
  },
  {
    path: '/guards',
    name: 'Guards',
    component: () => import('../views/RouteGuards.vue'),
    meta: {
      title: '路由守卫',
      description: '演示路由守卫功能',
      requiresAuth: true,
      permission: 'admin',
    },
  },
  {
    path: '/lazy',
    name: 'Lazy',
    component: () => import('../views/LazyLoading.vue'),
    meta: {
      title: '懒加载',
      description: '演示组件懒加载',
    },
  },
  {
    path: '/plugins',
    name: 'Plugins',
    component: () => import('../views/PluginDemo.vue'),
    meta: {
      title: '插件演示',
      description: '演示动画、缓存、预加载等插件功能',
      animation: 'slideLeft',
      cache: true,
      preload: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: {
      title: '登录',
      description: '用户登录页面',
    },
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue'),
    meta: {
      title: '页面未找到',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]
