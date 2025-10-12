/**
 * 完整的路由器使用示例
 * 展示所有高级功能的集成使用
 */

import {
  createRouter,
  createWebHistory,
  CacheManager,
  type Router,
  type RouteRecordRaw,
  type ScrollBehavior
} from '../src';

// ==================== 1. 初始化路由器 ====================

const scrollBehavior: ScrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  } else if (to.hash) {
    return { el: to.hash, behavior: 'smooth' };
  } else {
    return { top: 0, left: 0 };
  }
};

const router = createRouter({
  history: createWebHistory('/app'),
  routes: [], // Will be added later
  scrollBehavior
});

// ==================== 2. 配置路由缓存 ====================

const cacheManager = new CacheManager({
  maxSize: 100,
  ttl: 5 * 60 * 1000, // 5分钟
  keyGenerator: (route: any) => `${route.path}:${JSON.stringify(route.params)}`,
  shouldCache: (route: any) => {
    // 不缓存管理页面
    return !route.path.startsWith('/admin');
  }
});

// 集成缓存到路由器
router.beforeEach(async (to, from, next) => {
  const cachedData = await cacheManager.get(to.path);
  if (cachedData) {
    console.log('Cache hit:', to.path);
    to.meta.cachedData = cachedData;
  }
  next();
});

router.afterEach((to) => {
  if (to.meta.data && !to.meta.cachedData) {
    cacheManager.set(to.path, to.meta.data);
  }
});

// ==================== 3. 配置懒加载 ====================
// Lazy loading is now handled directly in route definitions

// ==================== 4. 配置预取 ====================
// Prefetching configuration would go here

// ==================== 5. 配置路由 ====================


// 生成路由
function setupRoutes(): RouteRecordRaw[] {
  // 定义路由
  const routes: RouteRecordRaw[] = [
    {
      path: '/',
      name: 'home',
      component: () => import('./pages/Home.vue'),
      meta: { 
        title: 'Home',
        description: 'Welcome to our app',
        keywords: ['home', 'welcome']
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('./pages/Dashboard.vue'),
      meta: { 
        requiresAuth: true,
        roles: ['user', 'admin'],
        title: 'Dashboard'
      },
      children: [
        {
          path: 'profile',
          name: 'profile',
          component: () => import('./pages/Profile.vue'),
          meta: { title: 'Profile' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('./pages/Settings.vue'),
          meta: { 
            title: 'Settings',
            roles: ['admin']
          }
        }
      ]
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('./pages/Products.vue'),
      meta: { 
        title: 'Products',
        cache: true,
        prefetch: true
      }
    },
    {
      path: '/products/:id',
      name: 'product-detail',
      component: () => import('./pages/ProductDetail.vue'),
      props: true,
      meta: { 
        title: 'Product Detail',
        breadcrumb: ['Home', 'Products', ':name']
      }
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('./pages/Search.vue'),
      props: (route) => ({ query: route.query.q }),
      meta: { title: 'Search' }
    },
    {
      path: '/admin',
      component: () => import('./layouts/AdminLayout.vue'),
      meta: { 
        requiresAuth: true,
        roles: ['admin']
      },
      children: [
        {
          path: '',
          name: 'admin-dashboard',
          component: () => import('./pages/admin/Dashboard.vue'),
          meta: { title: 'Admin Dashboard' }
        },
        {
          path: 'users',
          name: 'admin-users',
          component: () => import('./pages/admin/Users.vue'),
          meta: { 
            title: 'User Management',
            permissions: ['users.read', 'users.write']
          }
        },
        {
          path: 'analytics',
          name: 'admin-analytics',
          component: () => import('./pages/admin/Analytics.vue'),
          meta: { 
            title: 'Analytics',
            permissions: ['analytics.read']
          }
        }
      ]
    },
    {
      path: '/auth',
      component: () => import('./layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('./pages/auth/Login.vue'),
          meta: { 
            title: 'Login',
            guest: true
          }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('./pages/auth/Register.vue'),
          meta: { 
            title: 'Register',
            guest: true
          }
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('./pages/auth/ForgotPassword.vue'),
          meta: { 
            title: 'Forgot Password',
            guest: true
          }
        }
      ]
    },
    {
      path: '/error/:code',
      name: 'error',
      component: () => import('./pages/Error.vue'),
      props: true,
      meta: { title: 'Error' }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./pages/404.vue'),
      meta: { title: 'Page Not Found' }
    }
  ];

  // 合并路由
  const allRoutes = [...fileRoutes, ...specialRoutes];
  
  // 优化路由
  const optimizedRoutes = smartManager.optimizeRoutes(allRoutes);
  
  // 添加到路由器
  optimizedRoutes.forEach(route => router.addRoute(route));
}

// ==================== 7. 安全管理 ====================

const securityManager = new RouteSecurityManager({
  authProvider: {
    isAuthenticated: async () => {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      // 验证token
      try {
        const response = await fetch('/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.ok;
      } catch {
        return false;
      }
    },
    hasPermission: async (permission: string) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.permissions?.includes(permission) || false;
    },
    hasRole: async (role: string) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.roles?.includes(role) || false;
    },
    login: async (credentials: any) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Invalid credentials' 
      };
    },
    logout: async () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    refresh: async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;
      
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return true;
      }
      
      return false;
    }
  },
  redirects: {
    login: '/auth/login',
    logout: '/',
    unauthorized: '/error/403',
    forbidden: '/error/403'
  },
  csrfProtection: true,
  xssProtection: true,
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000
  }
});

// 注册全局守卫
securityManager.registerGuards(router);

// ==================== 8. 调试工具 ====================

const routeDebugger = new RouterDebugger({
  logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.ERROR,
  maxEvents: 500,
  consoleEnabled: true,
  remoteEnabled: process.env.NODE_ENV === 'production',
  remoteEndpoint: '/api/logs/router'
});

// 可视化调试面板（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  const visualDebugger = new RouterVisualDebugger(routeDebugger, 'debug-panel');

  // 添加调试面板切换快捷键
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      const panel = document.getElementById('debug-panel');
      if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
}

// 集成调试器到路由器
router.beforeEach((to, from, next) => {
  routeDebugger.logNavigation(from.path, to.path, to.params);
  next();
});

router.afterEach((to, from) => {
  const navigationTime = routeDebugger.endPerformanceMark(`navigation:${to.path}`);
  routeDebugger.logPerformance(to.path, {
    navigationTime,
    renderTime: 0, // 将在组件中更新
    totalTime: navigationTime,
    cacheHit: !!to.meta.cachedData,
    prefetched: prefetcher.isPrefetched(to.path),
    lazyLoaded: !!to.meta.lazyLoaded
  });
});

router.onError((error, to, from) => {
  routeDebugger.logError(error, to, { from: from.path });
});

// ==================== 9. 高级功能示例 ====================

// 9.1 路由组管理
const adminGroup = smartManager.createGroup('admin', {
  prefix: '/admin',
  middleware: ['auth', 'admin'],
  layout: 'AdminLayout'
});

adminGroup.addRoute({
  path: 'reports',
  name: 'admin-reports',
  component: () => import('./pages/admin/Reports.vue')
});

// 9.2 动态路由权限
async function loadUserRoutes() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (user.role === 'vendor') {
    router.addRoute({
      path: '/vendor',
      name: 'vendor-dashboard',
      component: () => import('./pages/vendor/Dashboard.vue'),
      meta: { requiresAuth: true, roles: ['vendor'] }
    });
  }
  
  if (user.permissions?.includes('reports.view')) {
    router.addRoute('admin', {
      path: 'advanced-reports',
      name: 'advanced-reports',
      component: () => import('./pages/admin/AdvancedReports.vue')
    });
  }
}

// 9.3 路由预加载策略
function setupPreloadStrategies() {
  // 预加载关键路由
  prefetcher.prefetch(['/dashboard', '/products'], 'high');
  
  // 基于用户行为预测
  const userHistory = JSON.parse(localStorage.getItem('routeHistory') || '[]');
  const predictions = prefetcher.predictNextRoutes(userHistory);
  predictions.forEach(route => prefetcher.prefetch(route, 'low'));
  
  // 空闲时预加载
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      prefetcher.prefetchAll(['normal', 'low']);
    });
  }
}

// 9.4 路由缓存预热
async function warmupCache() {
  const criticalRoutes = ['/dashboard', '/products', '/profile'];
  
  for (const route of criticalRoutes) {
    try {
      const response = await fetch(`/api/preload${route}`);
      const data = await response.json();
      cache.set(route, data);
    } catch (error) {
      console.error('Failed to warmup cache for', route, error);
    }
  }
}

// 9.5 性能监控
function setupPerformanceMonitoring() {
  // 监控路由切换性能
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'navigation' || entry.entryType === 'resource') {
        routeDebugger.logPerformance(location.pathname, {
          navigationTime: entry.duration,
          renderTime: entry.renderTime || 0,
          totalTime: entry.duration + (entry.renderTime || 0),
          cacheHit: false,
          prefetched: false,
          lazyLoaded: true
        });
      }
    }
  });

  observer.observe({ entryTypes: ['navigation', 'resource'] });
}

// 9.6 错误恢复
function setupErrorRecovery() {
  let errorCount = 0;
  const maxErrors = 3;
  
  router.onError((error, to, from) => {
    errorCount++;
    
    if (errorCount > maxErrors) {
      // 太多错误，重置应用
      console.error('Too many routing errors, resetting application');
      window.location.href = '/';
      return;
    }
    
    // 尝试恢复
    if (error.name === 'ChunkLoadError') {
      // 清除缓存并重试
      cache.clear();
      setTimeout(() => {
        router.push(to.path);
      }, 1000);
    } else if (error.response?.status === 401) {
      // Token过期，尝试刷新
      securityManager.authProvider.refresh().then(success => {
        if (success) {
          router.push(to.path);
        } else {
          router.push('/auth/login');
        }
      });
    }
  });
  
  // 定期重置错误计数
  setInterval(() => {
    errorCount = 0;
  }, 60000);
}

// ==================== 10. 应用初始化 ====================

async function initializeApp() {
  console.log('Initializing router application...');
  
  try {
    // 1. 设置路由
    await setupRoutes();
    console.log('Routes configured');
    
    // 2. 加载用户特定路由
    await loadUserRoutes();
    console.log('User routes loaded');
    
    // 3. 预热缓存
    await warmupCache();
    console.log('Cache warmed up');
    
    // 4. 设置预加载策略
    setupPreloadStrategies();
    console.log('Preload strategies configured');
    
    // 5. 设置性能监控
    setupPerformanceMonitoring();
    console.log('Performance monitoring enabled');
    
    // 6. 设置错误恢复
    setupErrorRecovery();
    console.log('Error recovery configured');
    
    // 7. 启动路由器
    router.start();
    console.log('Router started successfully');
    
    // 8. 导航到初始路由
    const initialRoute = sessionStorage.getItem('lastRoute') || '/';
    router.push(initialRoute);
    
  } catch (error) {
    console.error('Failed to initialize application:', error);
    routeDebugger.logError(error as Error, undefined, { phase: 'initialization' });
  }
}

// ==================== 11. 实用工具函数 ====================

// 11.1 面包屑导航
export function getBreadcrumbs(route: any): Array<{ name: string; path: string }> {
  const breadcrumbs = [];
  let currentRoute = route;
  
  while (currentRoute) {
    if (currentRoute.meta?.breadcrumb) {
      breadcrumbs.unshift({
        name: currentRoute.meta.title || currentRoute.name,
        path: currentRoute.path
      });
    }
    currentRoute = currentRoute.parent;
  }
  
  return breadcrumbs;
}

// 11.2 路由权限检查
export async function canAccessRoute(route: any): Promise<boolean> {
  if (!route.meta) return true;
  
  const { requiresAuth, roles, permissions, guest } = route.meta;
  
  // 检查认证
  if (requiresAuth) {
    const isAuth = await securityManager.authProvider.isAuthenticated();
    if (!isAuth) return false;
  }
  
  // 检查游客路由
  if (guest) {
    const isAuth = await securityManager.authProvider.isAuthenticated();
    if (isAuth) return false;
  }
  
  // 检查角色
  if (roles?.length) {
    const hasRole = await Promise.all(
      roles.map((role: string) => securityManager.authProvider.hasRole(role))
    );
    if (!hasRole.some(Boolean)) return false;
  }
  
  // 检查权限
  if (permissions?.length) {
    const hasPermission = await Promise.all(
      permissions.map((perm: string) => securityManager.authProvider.hasPermission(perm))
    );
    if (!hasPermission.every(Boolean)) return false;
  }
  
  return true;
}

// 11.3 路由历史管理
class RouteHistory {
  private history: string[] = [];
  private maxSize: number = 50;
  
  push(path: string): void {
    this.history.push(path);
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    this.save();
  }
  
  back(steps: number = 1): string | undefined {
    const index = this.history.length - 1 - steps;
    return this.history[index];
  }
  
  forward(steps: number = 1): string | undefined {
    const index = this.history.length - 1 + steps;
    return this.history[index];
  }
  
  clear(): void {
    this.history = [];
    this.save();
  }
  
  getAll(): string[] {
    return [...this.history];
  }
  
  private save(): void {
    localStorage.setItem('routeHistory', JSON.stringify(this.history));
  }
  
  private load(): void {
    const saved = localStorage.getItem('routeHistory');
    if (saved) {
      this.history = JSON.parse(saved);
    }
  }
}

export const routeHistory = new RouteHistory();

// 11.4 路由搜索
export class RouteSearch {
  private routes: any[] = [];
  
  constructor(routes: any[]) {
    this.routes = this.flattenRoutes(routes);
  }
  
  search(query: string): any[] {
    const lowercaseQuery = query.toLowerCase();
    
    return this.routes.filter(route => {
      const searchableText = [
        route.path,
        route.name,
        route.meta?.title,
        route.meta?.description,
        ...(route.meta?.keywords || [])
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(lowercaseQuery);
    });
  }
  
  private flattenRoutes(routes: any[], parent?: any): any[] {
    const flat: any[] = [];
    
    for (const route of routes) {
      flat.push({ ...route, parent });
      
      if (route.children) {
        flat.push(...this.flattenRoutes(route.children, route));
      }
    }
    
    return flat;
  }
}

// 11.5 路由分析
export class RouteAnalytics {
  track(event: string, route: any, data?: any): void {
    // 发送到分析服务
    if (typeof gtag !== 'undefined') {
      gtag('event', event, {
        page_path: route.path,
        page_title: route.meta?.title,
        ...data
      });
    }
    
    // 本地统计
    const analytics = JSON.parse(localStorage.getItem('routeAnalytics') || '{}');
    const key = `${event}:${route.path}`;
    analytics[key] = (analytics[key] || 0) + 1;
    localStorage.setItem('routeAnalytics', JSON.stringify(analytics));
  }
  
  getStats(): any {
    return JSON.parse(localStorage.getItem('routeAnalytics') || '{}');
  }
  
  getMostVisited(limit: number = 10): Array<{ path: string; count: number }> {
    const stats = this.getStats();
    const visits = Object.entries(stats)
      .filter(([key]) => key.startsWith('visit:'))
      .map(([key, count]) => ({
        path: key.replace('visit:', ''),
        count: count as number
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return visits;
  }
}

export const routeAnalytics = new RouteAnalytics();

// ==================== 12. 导出配置 ====================

export {
  router,
  cache,
  lazyLoader,
  prefetcher,
  renderer,
  smartManager,
  securityManager,
  debugger as routerDebugger,
  initializeApp
};

// ==================== 13. Vue插件集成 ====================

export const RouterPlugin = {
  install(app: any) {
    // 注入路由器
    app.config.globalProperties.$router = router;
    app.provide('router', router);
    
    // 注入工具
    app.config.globalProperties.$routeCache = cache;
    app.config.globalProperties.$routeSecurity = securityManager;
    app.config.globalProperties.$routeDebug = routeDebugger;
    
    // 全局组件
    app.component('RouterLink', {
      props: ['to', 'prefetch'],
      setup(props: any) {
        const handleMouseEnter = () => {
          if (props.prefetch !== false) {
            prefetcher.prefetch(props.to);
          }
        };
        
        return () => h('a', {
          href: props.to,
          onMouseenter: handleMouseEnter,
          onClick: (e: Event) => {
            e.preventDefault();
            router.push(props.to);
          }
        }, slots.default?.());
      }
    });
    
    app.component('RouterView', {
      setup() {
        const currentRoute = router.currentRoute;
        
        return () => {
          const component = currentRoute.value?.component;
          if (!component) return null;
          
          return h(Suspense, {
            timeout: 0,
            onPending: () => console.log('Loading route...'),
            onResolve: () => console.log('Route loaded'),
            onFallback: () => console.log('Showing fallback')
          }, {
            default: () => h(component),
            fallback: () => h('div', 'Loading...')
          });
        };
      }
    });
    
    // 全局混入
    app.mixin({
      beforeRouteEnter(to: any, from: any, next: Function) {
        routeAnalytics.track('enter', to);
        next();
      },
      beforeRouteLeave(to: any, from: any, next: Function) {
        routeAnalytics.track('leave', from);
        next();
      }
    });
  }
};

// ==================== 14. 启动应用 ====================

// 自动初始化（如果在浏览器环境）
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initializeApp);
}

declare const h: any;
declare const Suspense: any;
declare const slots: any;
declare const gtag: any;