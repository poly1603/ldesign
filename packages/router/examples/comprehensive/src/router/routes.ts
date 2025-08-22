/**
 * 路由配置
 * 展示各种路由配置方式和功能
 */

import type { RouteRecordRaw } from '@ldesign/router'

export const routes: RouteRecordRaw[] = [
  // 首页
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页',
      icon: 'home',
      showInMenu: true,
      order: 1
    }
  },
  
  // 仪表板
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    // 设备特定组件
    deviceComponents: {
      mobile: () => import('../views/mobile/Dashboard.vue'),
      tablet: () => import('../views/tablet/Dashboard.vue'),
      desktop: () => import('../views/desktop/Dashboard.vue')
    },
    meta: {
      title: '仪表板',
      icon: 'dashboard',
      showInMenu: true,
      order: 2,
      requiresAuth: true
    }
  },
  
  // 用户管理模块
  {
    path: '/users',
    name: 'UserModule',
    component: () => import('../views/layouts/ModuleLayout.vue'),
    meta: {
      title: '用户管理',
      icon: 'users',
      showInMenu: true,
      order: 3,
      requiresAuth: true,
      roles: ['admin', 'user-manager']
    },
    children: [
      {
        path: '',
        name: 'UserList',
        component: () => import('../views/users/UserList.vue'),
        meta: {
          title: '用户列表',
          breadcrumb: '用户列表'
        }
      },
      {
        path: 'create',
        name: 'UserCreate',
        component: () => import('../views/users/UserCreate.vue'),
        meta: {
          title: '创建用户',
          breadcrumb: '创建用户'
        }
      },
      {
        path: ':id',
        name: 'UserDetail',
        component: () => import('../views/users/UserDetail.vue'),
        props: true,
        meta: {
          title: '用户详情',
          breadcrumb: '用户详情'
        }
      },
      {
        path: ':id/edit',
        name: 'UserEdit',
        component: () => import('../views/users/UserEdit.vue'),
        props: true,
        meta: {
          title: '编辑用户',
          breadcrumb: '编辑用户'
        }
      }
    ]
  },
  
  // 产品管理模块
  {
    path: '/products',
    name: 'ProductModule',
    component: () => import('../views/layouts/ModuleLayout.vue'),
    meta: {
      title: '产品管理',
      icon: 'products',
      showInMenu: true,
      order: 4,
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'ProductList',
        component: () => import('../views/products/ProductList.vue'),
        meta: {
          title: '产品列表',
          breadcrumb: '产品列表'
        }
      },
      {
        path: 'categories',
        name: 'ProductCategories',
        component: () => import('../views/products/ProductCategories.vue'),
        meta: {
          title: '产品分类',
          breadcrumb: '产品分类'
        }
      },
      {
        path: ':id',
        name: 'ProductDetail',
        component: () => import('../views/products/ProductDetail.vue'),
        props: route => ({
          id: Number(route.params.id),
          tab: route.query.tab || 'info'
        }),
        meta: {
          title: '产品详情',
          breadcrumb: '产品详情'
        }
      }
    ]
  },
  
  // 设置页面
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: {
      title: '设置',
      icon: 'settings',
      showInMenu: true,
      order: 5,
      requiresAuth: true
    }
  },
  
  // 功能演示页面
  {
    path: '/demos',
    name: 'DemoModule',
    component: () => import('../views/layouts/ModuleLayout.vue'),
    meta: {
      title: '功能演示',
      icon: 'demo',
      showInMenu: true,
      order: 6
    },
    children: [
      {
        path: 'animations',
        name: 'AnimationDemo',
        component: () => import('../views/demos/AnimationDemo.vue'),
        meta: {
          title: '路由动画',
          breadcrumb: '路由动画'
        }
      },
      {
        path: 'caching',
        name: 'CachingDemo',
        component: () => import('../views/demos/CachingDemo.vue'),
        meta: {
          title: '组件缓存',
          breadcrumb: '组件缓存'
        }
      },
      {
        path: 'device-adaptation',
        name: 'DeviceAdaptationDemo',
        component: () => import('../views/demos/DeviceAdaptationDemo.vue'),
        // 设备支持限制
        supportedDevices: ['mobile', 'tablet', 'desktop'],
        meta: {
          title: '设备适配',
          breadcrumb: '设备适配'
        }
      },
      {
        path: 'performance',
        name: 'PerformanceDemo',
        component: () => import('../views/demos/PerformanceDemo.vue'),
        meta: {
          title: '性能监控',
          breadcrumb: '性能监控'
        }
      },
      {
        path: 'preloading',
        name: 'PreloadingDemo',
        component: () => import('../views/demos/PreloadingDemo.vue'),
        meta: {
          title: '预加载策略',
          breadcrumb: '预加载策略'
        }
      }
    ]
  },
  
  // 认证相关页面
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/Login.vue'),
    meta: {
      title: '登录',
      layout: 'auth',
      hideInMenu: true
    }
  },
  
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/auth/Register.vue'),
    meta: {
      title: '注册',
      layout: 'auth',
      hideInMenu: true
    }
  },
  
  // 错误页面
  {
    path: '/unauthorized',
    name: 'Unauthorized',
    component: () => import('../views/errors/Unauthorized.vue'),
    meta: {
      title: '无权限访问',
      hideInMenu: true
    }
  },
  
  {
    path: '/device-not-supported',
    name: 'DeviceNotSupported',
    component: () => import('../views/errors/DeviceNotSupported.vue'),
    meta: {
      title: '设备不支持',
      hideInMenu: true
    }
  },
  
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('../views/errors/NotFound.vue'),
    meta: {
      title: '页面未找到',
      hideInMenu: true
    }
  },
  
  // 通配符路由（必须放在最后）
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]
