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
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
    meta: {
      title: '关于',
      description: '关于页面',
    },
  },
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('../views/User.vue'),
    meta: {
      title: '用户',
      description: '用户页面',
    },
    props: true,
  },
  {
    path: '/posts',
    name: 'Posts',
    component: () => import('../views/Posts.vue'),
    meta: {
      title: '文章',
      description: '文章列表',
    },
    children: [
      {
        path: ':id',
        name: 'Post',
        component: () => import('../views/Post.vue'),
        props: true,
      },
    ],
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/Search.vue'),
    meta: {
      title: '搜索',
      description: '搜索页面',
    },
  },
  {
    path: '/docs',
    name: 'Docs',
    component: () => import('../views/Docs.vue'),
    meta: {
      title: '文档',
      description: '文档页面',
    },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      title: 'Profile',
      description: '用户资料',
      requiresAuth: true,
    },
  },
  {
    path: '/cached-page',
    name: 'CachedPage',
    component: () => import('../views/CachedPage.vue'),
    meta: {
      title: '缓存页面',
      description: '缓存测试页面',
      cache: true,
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/Admin.vue'),
    meta: {
      title: '管理员',
      description: '管理员页面',
      requiresAuth: true,
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
