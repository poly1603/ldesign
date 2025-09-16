/**
 * 智能路由管理器
 * 提供自动路由生成、动态路由、嵌套路由优化、路由分组
 */

import type { 
  RouteRecordRaw, 
  Router, 
  RouteLocationNormalized,
  NavigationGuard 
} from '../types';
import { reactive, computed, watch } from 'vue';

// ============= 智能路由配置 =============
export interface SmartRouteConfig {
  // 自动路由生成
  autoGenerate?: {
    enabled?: boolean;
    pagesDir?: string;
    excludes?: string[];
    layouts?: Record<string, any>;
    importMode?: 'sync' | 'async';
  };
  // 动态路由
  dynamic?: {
    enabled?: boolean;
    loader?: (path: string) => Promise<RouteRecordRaw>;
    cache?: boolean;
    retry?: number;
  };
  // 嵌套路由优化
  nested?: {
    enabled?: boolean;
    maxDepth?: number;
    flattenSingleChild?: boolean;
    mergeParams?: boolean;
  };
  // 路由分组
  grouping?: {
    enabled?: boolean;
    groups?: RouteGroup[];
    defaultGroup?: string;
  };
}

export interface RouteGroup {
  name: string;
  pattern?: RegExp | string;
  prefix?: string;
  layout?: any;
  meta?: Record<string, any>;
  guard?: NavigationGuard;
  priority?: number;
}

// ============= 自动路由生成器 =============
export class AutoRouteGenerator {
  private routes: RouteRecordRaw[] = [];
  private fileRouteMap = new Map<string, RouteRecordRaw>();
  private config: SmartRouteConfig['autoGenerate'];

  constructor(config: SmartRouteConfig['autoGenerate'] = {}) {
    this.config = {
      enabled: true,
      pagesDir: 'src/pages',
      excludes: ['components', 'utils', 'hooks'],
      layouts: {},
      importMode: 'async',
      ...config
    };
  }

  // 从文件系统生成路由
  async generateFromFileSystem(): Promise<RouteRecordRaw[]> {
    if (!this.config.enabled) return [];

    // 在实际环境中，这里会读取文件系统
    // 这里使用模拟数据展示功能
    const files = await this.scanDirectory(this.config.pagesDir!);
    
    for (const file of files) {
      const route = this.fileToRoute(file);
      if (route) {
        this.routes.push(route);
        this.fileRouteMap.set(file, route);
      }
    }

    // 处理嵌套路由
    this.routes = this.nestRoutes(this.routes);
    
    // 应用布局
    this.routes = this.applyLayouts(this.routes);
    
    return this.routes;
  }

  // 扫描目录（模拟实现）
  private async scanDirectory(dir: string): Promise<string[]> {
    // 实际实现中，这里会使用 fs 或 glob 扫描文件
    // 这里返回模拟数据
    return [
      'src/pages/index.vue',
      'src/pages/about.vue',
      'src/pages/users/index.vue',
      'src/pages/users/[id].vue',
      'src/pages/users/[id]/edit.vue',
      'src/pages/admin/index.vue',
      'src/pages/admin/dashboard.vue',
      'src/pages/admin/settings.vue',
      'src/pages/[...404].vue'
    ];
  }

  // 文件路径转路由
  private fileToRoute(file: string): RouteRecordRaw | null {
    // 检查是否需要排除
    if (this.config.excludes?.some(exc => file.includes(exc))) {
      return null;
    }

    // 解析文件路径
    const relativePath = file
      .replace(this.config.pagesDir + '/', '')
      .replace(/\.(vue|tsx?|jsx?)$/, '');
    
    // 转换为路由路径
    let path = '/' + relativePath
      .replace(/index$/, '')
      .replace(/\[\.\.\.(.+)\]/, ':$1(.*)')  // [...slug] -> :slug(.*)
      .replace(/\[(.+)\]/g, ':$1')            // [id] -> :id
      .replace(/\/+$/, '');                   // 移除尾部斜杠
    
    if (path === '/') path = '';
    
    // 生成路由名称
    const name = relativePath
      .replace(/\//g, '-')
      .replace(/\[|\]|\./g, '');
    
    // 生成组件导入
    const component = this.config.importMode === 'async'
      ? () => import(file)
      : require(file).default;
    
    return {
      path,
      name,
      component,
      meta: {
        file,
        generated: true
      }
    };
  }

  // 处理嵌套路由
  private nestRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    const nested: RouteRecordRaw[] = [];
    const routeMap = new Map<string, RouteRecordRaw>();
    
    // 排序，确保父路由先处理
    routes.sort((a, b) => a.path.split('/').length - b.path.split('/').length);
    
    for (const route of routes) {
      const segments = route.path.split('/').filter(Boolean);
      
      if (segments.length === 0 || segments.length === 1) {
        // 顶级路由
        nested.push(route);
        routeMap.set(route.path, route);
      } else {
        // 查找父路由
        const parentPath = '/' + segments.slice(0, -1).join('/');
        const parent = routeMap.get(parentPath);
        
        if (parent) {
          // 添加为子路由
          if (!parent.children) parent.children = [];
          
          // 调整子路由路径
          route.path = segments[segments.length - 1];
          parent.children.push(route);
        } else {
          // 没有找到父路由，作为顶级路由
          nested.push(route);
          routeMap.set(route.path, route);
        }
      }
    }
    
    return nested;
  }

  // 应用布局
  private applyLayouts(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    const layoutGroups = new Map<string, RouteRecordRaw[]>();
    
    for (const route of routes) {
      // 确定使用的布局
      const layoutName = this.determineLayout(route);
      
      if (layoutName && this.config.layouts?.[layoutName]) {
        if (!layoutGroups.has(layoutName)) {
          layoutGroups.set(layoutName, []);
        }
        layoutGroups.get(layoutName)!.push(route);
      }
    }
    
    // 创建带布局的路由
    const result: RouteRecordRaw[] = [];
    
    for (const [layoutName, groupRoutes] of layoutGroups) {
      result.push({
        path: '',
        component: this.config.layouts![layoutName],
        children: groupRoutes
      });
    }
    
    // 添加无布局的路由
    routes.forEach(route => {
      const hasLayout = Array.from(layoutGroups.values())
        .flat()
        .includes(route);
      
      if (!hasLayout) {
        result.push(route);
      }
    });
    
    return result;
  }

  // 确定路由使用的布局
  private determineLayout(route: RouteRecordRaw): string | null {
    // 可以根据路由路径、名称或 meta 信息确定布局
    if (route.path.startsWith('/admin')) return 'admin';
    if (route.path.startsWith('/auth')) return 'auth';
    return 'default';
  }

  // 添加路由
  addRoute(route: RouteRecordRaw): void {
    this.routes.push(route);
  }

  // 移除路由
  removeRoute(name: string): void {
    const index = this.routes.findIndex(r => r.name === name);
    if (index !== -1) {
      this.routes.splice(index, 1);
    }
  }

  // 获取所有路由
  getRoutes(): RouteRecordRaw[] {
    return this.routes;
  }
}

// ============= 动态路由加载器 =============
export class DynamicRouteLoader {
  private loadedRoutes = new Map<string, RouteRecordRaw>();
  private loadingPromises = new Map<string, Promise<RouteRecordRaw>>();
  private config: SmartRouteConfig['dynamic'];
  private retryCount = new Map<string, number>();

  constructor(private router: Router, config: SmartRouteConfig['dynamic'] = {}) {
    this.config = {
      enabled: true,
      cache: true,
      retry: 3,
      ...config
    };
  }

  // 动态加载路由
  async loadRoute(path: string): Promise<RouteRecordRaw | null> {
    if (!this.config.enabled || !this.config.loader) return null;

    // 检查缓存
    if (this.config.cache && this.loadedRoutes.has(path)) {
      return this.loadedRoutes.get(path)!;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // 创建加载 Promise
    const loadPromise = this.createLoadPromise(path);
    this.loadingPromises.set(path, loadPromise);

    try {
      const route = await loadPromise;
      
      // 缓存路由
      if (this.config.cache) {
        this.loadedRoutes.set(path, route);
      }
      
      // 添加到路由器
      this.router.addRoute(route);
      
      this.loadingPromises.delete(path);
      return route;
    } catch (error) {
      this.loadingPromises.delete(path);
      
      // 重试逻辑
      if (this.shouldRetry(path)) {
        this.retryCount.set(path, (this.retryCount.get(path) || 0) + 1);
        return this.loadRoute(path);
      }
      
      throw error;
    }
  }

  // 创建加载 Promise
  private async createLoadPromise(path: string): Promise<RouteRecordRaw> {
    try {
      const route = await this.config.loader!(path);
      return route;
    } catch (error) {
      console.error(`Failed to load dynamic route: ${path}`, error);
      throw error;
    }
  }

  // 判断是否应该重试
  private shouldRetry(path: string): boolean {
    const count = this.retryCount.get(path) || 0;
    return count < (this.config.retry || 3);
  }

  // 批量加载路由
  async loadRoutes(paths: string[]): Promise<RouteRecordRaw[]> {
    const promises = paths.map(path => this.loadRoute(path));
    const results = await Promise.allSettled(promises);
    
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<RouteRecordRaw | null>).value)
      .filter((route): route is RouteRecordRaw => route !== null);
  }

  // 预加载路由
  preloadRoute(path: string): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => this.loadRoute(path));
    } else {
      setTimeout(() => this.loadRoute(path), 1000);
    }
  }

  // 清除缓存
  clearCache(): void {
    this.loadedRoutes.clear();
    this.retryCount.clear();
  }
}

// ============= 嵌套路由优化器 =============
export class NestedRouteOptimizer {
  private config: SmartRouteConfig['nested'];

  constructor(config: SmartRouteConfig['nested'] = {}) {
    this.config = {
      enabled: true,
      maxDepth: 5,
      flattenSingleChild: true,
      mergeParams: true,
      ...config
    };
  }

  // 优化嵌套路由
  optimizeRoutes(routes: RouteRecordRaw[]): RouteRecordRaw[] {
    if (!this.config.enabled) return routes;

    return routes.map(route => this.optimizeRoute(route));
  }

  // 优化单个路由
  private optimizeRoute(route: RouteRecordRaw, depth = 0): RouteRecordRaw {
    // 检查深度限制
    if (depth >= (this.config.maxDepth || 5)) {
      console.warn(`Route nesting depth exceeded: ${route.path}`);
      return route;
    }

    const optimized = { ...route };

    // 优化子路由
    if (optimized.children && optimized.children.length > 0) {
      // 扁平化只有一个子路由的情况
      if (this.config.flattenSingleChild && optimized.children.length === 1) {
        const child = optimized.children[0];
        
        // 如果父路由没有自己的组件，可以扁平化
        if (!optimized.component || optimized.component === child.component) {
          return {
            ...child,
            path: this.combinePaths(optimized.path, child.path),
            meta: { ...optimized.meta, ...child.meta }
          };
        }
      }

      // 递归优化子路由
      optimized.children = optimized.children.map(child => 
        this.optimizeRoute(child, depth + 1)
      );

      // 合并参数
      if (this.config.mergeParams) {
        optimized.children = this.mergeChildParams(optimized, optimized.children);
      }
    }

    return optimized;
  }

  // 合并路径
  private combinePaths(parent: string, child: string): string {
    if (child.startsWith('/')) return child;
    
    const parentPath = parent.endsWith('/') ? parent.slice(0, -1) : parent;
    const childPath = child.startsWith('/') ? child.slice(1) : child;
    
    return parentPath + '/' + childPath;
  }

  // 合并子路由参数
  private mergeChildParams(
    parent: RouteRecordRaw, 
    children: RouteRecordRaw[]
  ): RouteRecordRaw[] {
    // 提取父路由的参数
    const parentParams = this.extractParams(parent.path);
    
    return children.map(child => {
      const childParams = this.extractParams(child.path);
      
      // 如果有重复参数，警告
      const duplicates = parentParams.filter(p => childParams.includes(p));
      if (duplicates.length > 0) {
        console.warn(`Duplicate params in nested route: ${duplicates.join(', ')}`);
      }
      
      return {
        ...child,
        meta: {
          ...child.meta,
          inheritedParams: parentParams
        }
      };
    });
  }

  // 提取路径参数
  private extractParams(path: string): string[] {
    const matches = path.match(/:([^/]+)/g) || [];
    return matches.map(m => m.slice(1));
  }
}

// ============= 路由分组管理器 =============
export class RouteGroupManager {
  private groups = new Map<string, RouteGroup>();
  private routeGroupMap = new Map<string, string>();
  private config: SmartRouteConfig['grouping'];

  constructor(config: SmartRouteConfig['grouping'] = {}) {
    this.config = {
      enabled: true,
      groups: [],
      defaultGroup: 'default',
      ...config
    };

    // 初始化分组
    this.config.groups?.forEach(group => {
      this.addGroup(group);
    });
  }

  // 添加分组
  addGroup(group: RouteGroup): void {
    this.groups.set(group.name, group);
  }

  // 移除分组
  removeGroup(name: string): void {
    this.groups.delete(name);
    
    // 移除该分组的路由映射
    for (const [route, groupName] of this.routeGroupMap) {
      if (groupName === name) {
        this.routeGroupMap.delete(route);
      }
    }
  }

  // 将路由分组
  groupRoutes(routes: RouteRecordRaw[]): Map<string, RouteRecordRaw[]> {
    const grouped = new Map<string, RouteRecordRaw[]>();
    
    // 按优先级排序分组
    const sortedGroups = Array.from(this.groups.values())
      .sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    for (const route of routes) {
      const groupName = this.determineGroup(route, sortedGroups);
      
      if (!grouped.has(groupName)) {
        grouped.set(groupName, []);
      }
      
      grouped.get(groupName)!.push(this.applyGroupSettings(route, groupName));
      this.routeGroupMap.set(route.name as string, groupName);
    }
    
    return grouped;
  }

  // 确定路由所属分组
  private determineGroup(route: RouteRecordRaw, groups: RouteGroup[]): string {
    for (const group of groups) {
      if (this.matchesGroup(route, group)) {
        return group.name;
      }
    }
    
    return this.config.defaultGroup || 'default';
  }

  // 检查路由是否匹配分组
  private matchesGroup(route: RouteRecordRaw, group: RouteGroup): boolean {
    // 根据模式匹配
    if (group.pattern) {
      const pattern = typeof group.pattern === 'string' 
        ? new RegExp(group.pattern)
        : group.pattern;
      
      if (pattern.test(route.path)) {
        return true;
      }
    }
    
    // 根据前缀匹配
    if (group.prefix && route.path.startsWith(group.prefix)) {
      return true;
    }
    
    return false;
  }

  // 应用分组设置
  private applyGroupSettings(route: RouteRecordRaw, groupName: string): RouteRecordRaw {
    const group = this.groups.get(groupName);
    if (!group) return route;
    
    const applied = { ...route };
    
    // 应用布局
    if (group.layout && !applied.component) {
      applied.component = group.layout;
    }
    
    // 应用 meta
    if (group.meta) {
      applied.meta = {
        ...group.meta,
        ...applied.meta,
        group: groupName
      };
    }
    
    // 应用守卫
    if (group.guard) {
      const originalBeforeEnter = applied.beforeEnter;
      
      applied.beforeEnter = async (to, from, next) => {
        // 先执行分组守卫
        const groupResult = await group.guard!(to, from, next);
        
        if (groupResult === false) {
          return false;
        }
        
        // 再执行原有守卫
        if (originalBeforeEnter) {
          return originalBeforeEnter(to, from, next);
        }
        
        return true;
      };
    }
    
    return applied;
  }

  // 获取分组信息
  getGroup(name: string): RouteGroup | undefined {
    return this.groups.get(name);
  }

  // 获取路由所属分组
  getRouteGroup(routeName: string): string | undefined {
    return this.routeGroupMap.get(routeName);
  }

  // 获取分组下的所有路由
  getGroupRoutes(groupName: string, routes: RouteRecordRaw[]): RouteRecordRaw[] {
    return routes.filter(route => 
      this.routeGroupMap.get(route.name as string) === groupName
    );
  }
}

// ============= 智能路由管理器主类 =============
export class SmartRouteManager {
  private autoGenerator: AutoRouteGenerator;
  private dynamicLoader: DynamicRouteLoader;
  private nestedOptimizer: NestedRouteOptimizer;
  private groupManager: RouteGroupManager;
  private router: Router;
  private config: SmartRouteConfig;
  
  // 响应式状态
  public state = reactive({
    routes: [] as RouteRecordRaw[],
    groups: new Map<string, RouteRecordRaw[]>(),
    loading: false,
    error: null as Error | null
  });

  constructor(router: Router, config: SmartRouteConfig = {}) {
    this.router = router;
    this.config = config;
    
    this.autoGenerator = new AutoRouteGenerator(config.autoGenerate);
    this.dynamicLoader = new DynamicRouteLoader(router, config.dynamic);
    this.nestedOptimizer = new NestedRouteOptimizer(config.nested);
    this.groupManager = new RouteGroupManager(config.grouping);
  }

  // 初始化
  async initialize(): Promise<void> {
    this.state.loading = true;
    this.state.error = null;
    
    try {
      // 生成自动路由
      const generatedRoutes = await this.autoGenerator.generateFromFileSystem();
      
      // 优化嵌套路由
      const optimizedRoutes = this.nestedOptimizer.optimizeRoutes(generatedRoutes);
      
      // 分组路由
      const groupedRoutes = this.groupManager.groupRoutes(optimizedRoutes);
      
      // 添加到路由器
      for (const routes of groupedRoutes.values()) {
        routes.forEach(route => this.router.addRoute(route));
      }
      
      // 更新状态
      this.state.routes = optimizedRoutes;
      this.state.groups = groupedRoutes;
    } catch (error) {
      this.state.error = error as Error;
      console.error('Failed to initialize smart route manager:', error);
    } finally {
      this.state.loading = false;
    }
  }

  // 动态添加路由
  async addDynamicRoute(path: string): Promise<void> {
    const route = await this.dynamicLoader.loadRoute(path);
    if (route) {
      // 优化路由
      const optimized = this.nestedOptimizer.optimizeRoutes([route])[0];
      
      // 分组
      const grouped = this.groupManager.groupRoutes([optimized]);
      
      // 更新状态
      this.state.routes.push(optimized);
      
      for (const [groupName, routes] of grouped) {
        if (!this.state.groups.has(groupName)) {
          this.state.groups.set(groupName, []);
        }
        this.state.groups.get(groupName)!.push(...routes);
      }
    }
  }

  // 批量添加动态路由
  async addDynamicRoutes(paths: string[]): Promise<void> {
    const routes = await this.dynamicLoader.loadRoutes(paths);
    
    if (routes.length > 0) {
      // 优化路由
      const optimized = this.nestedOptimizer.optimizeRoutes(routes);
      
      // 分组
      const grouped = this.groupManager.groupRoutes(optimized);
      
      // 更新状态
      this.state.routes.push(...optimized);
      
      for (const [groupName, groupRoutes] of grouped) {
        if (!this.state.groups.has(groupName)) {
          this.state.groups.set(groupName, []);
        }
        this.state.groups.get(groupName)!.push(...groupRoutes);
      }
    }
  }

  // 获取路由统计
  getStatistics(): RouteStatistics {
    const stats: RouteStatistics = {
      total: this.state.routes.length,
      groups: this.state.groups.size,
      dynamic: 0,
      nested: 0,
      maxDepth: 0
    };
    
    // 计算统计信息
    for (const route of this.state.routes) {
      if (route.meta?.generated) stats.dynamic++;
      
      const depth = this.calculateDepth(route);
      if (depth > 0) stats.nested++;
      if (depth > stats.maxDepth) stats.maxDepth = depth;
    }
    
    return stats;
  }

  // 计算路由深度
  private calculateDepth(route: RouteRecordRaw, depth = 0): number {
    if (!route.children || route.children.length === 0) {
      return depth;
    }
    
    return Math.max(
      ...route.children.map(child => this.calculateDepth(child, depth + 1))
    );
  }

  // 查找路由
  findRoute(predicate: (route: RouteRecordRaw) => boolean): RouteRecordRaw | undefined {
    return this.state.routes.find(predicate);
  }

  // 按组获取路由
  getRoutesByGroup(groupName: string): RouteRecordRaw[] {
    return this.state.groups.get(groupName) || [];
  }

  // 清理
  clear(): void {
    this.dynamicLoader.clearCache();
    this.state.routes = [];
    this.state.groups.clear();
  }
}

// ============= 类型定义 =============
interface RouteStatistics {
  total: number;
  groups: number;
  dynamic: number;
  nested: number;
  maxDepth: number;
}

// ============= 导出便捷函数 =============
let defaultManager: SmartRouteManager | null = null;

export function setupSmartRouteManager(
  router: Router,
  config?: SmartRouteConfig
): SmartRouteManager {
  if (!defaultManager) {
    defaultManager = new SmartRouteManager(router, config);
    defaultManager.initialize();
  }
  return defaultManager;
}

export function getRouteStatistics(): RouteStatistics | null {
  return defaultManager?.getStatistics() || null;
}

export function addDynamicRoute(path: string): Promise<void> {
  if (!defaultManager) {
    throw new Error('Smart route manager not initialized');
  }
  return defaultManager.addDynamicRoute(path);
}