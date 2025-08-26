import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: '首页',
        description: '欢迎使用 @ldesign/store 统一示例'
      }
    },
    {
      path: '/basic',
      name: 'Basic',
      component: () => import('@/views/BasicExamples.vue'),
      meta: {
        title: '基础示例',
        description: '展示基本的状态管理功能'
      }
    },
    {
      path: '/decorators',
      name: 'Decorators',
      component: () => import('@/views/DecoratorExamples.vue'),
      meta: {
        title: '装饰器示例',
        description: '展示装饰器语法的使用'
      }
    },
    {
      path: '/functional',
      name: 'Functional',
      component: () => import('@/views/FunctionalExamples.vue'),
      meta: {
        title: '函数式示例',
        description: '展示函数式 Store 的使用'
      }
    },
    {
      path: '/composition',
      name: 'Composition',
      component: () => import('@/views/CompositionExamples.vue'),
      meta: {
        title: '组合式示例',
        description: '展示组合式 API 的使用'
      }
    },
    {
      path: '/performance',
      name: 'Performance',
      component: () => import('@/views/PerformanceExamples.vue'),
      meta: {
        title: '性能优化',
        description: '展示缓存、防抖、节流等性能优化功能'
      }
    },
    {
      path: '/persistence',
      name: 'Persistence',
      component: () => import('@/views/PersistenceExamples.vue'),
      meta: {
        title: '状态持久化',
        description: '展示状态持久化功能'
      }
    },
    {
      path: '/enterprise',
      name: 'Enterprise',
      component: () => import('@/views/EnterpriseExamples.vue'),
      meta: {
        title: '企业级功能',
        description: '展示企业级应用场景'
      }
    },
    {
      path: '/realtime',
      name: 'Realtime',
      component: () => import('@/views/RealtimeExamples.vue'),
      meta: {
        title: '实时同步',
        description: '展示实时数据同步功能'
      }
    }
  ]
})

// 路由守卫，设置页面标题
router.beforeEach((to) => {
  if (to.meta?.title) {
    document.title = `${to.meta.title} - @ldesign/store 示例`
  }
})

export default router
