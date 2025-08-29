# Launcher 架构扩展设计方案

## 🎯 扩展目标

基于现有的 ViteLauncher 架构，扩展以下核心功能：
1. 网络配置功能（代理、别名）
2. 安全与证书功能（SSL 自动生成）
3. 资源处理功能（中文字体优化、SVG 组件转换）
4. Vite 插件生态
5. 开发与构建环境优化

## 📋 现有架构分析

### 核心组件
- **ViteLauncher**: 主控制器，协调各个服务
- **ConfigManager**: 配置管理，支持预设配置和用户配置合并
- **PluginManager**: 插件管理，支持动态加载和依赖解析
- **ProjectDetector**: 项目类型检测
- **ErrorHandler**: 统一错误处理

### 配置系统
- 支持 `ldesign.config.ts/js` 配置文件
- 预设配置系统（Vue、React、Lit 等）
- 配置合并策略（基础配置 + 预设配置 + 用户配置）

### 插件系统
- 基于 Vite 插件生态
- 支持框架特定插件自动加载
- 插件依赖管理和生命周期

## 🏗️ 扩展架构设计

### 1. 网络配置模块 (NetworkManager)

```typescript
interface NetworkManager {
  // 代理配置
  configureProxy(config: ProxyConfig): void
  addProxyRule(rule: ProxyRule): void
  removeProxyRule(pattern: string): void
  
  // 别名配置
  configureAlias(aliases: AliasConfig): void
  addAlias(key: string, path: string): void
  resolveAlias(path: string): string
  
  // CORS 配置
  configureCORS(config: CORSConfig): void
}

interface ProxyConfig {
  [pattern: string]: ProxyRule
}

interface ProxyRule {
  target: string
  changeOrigin?: boolean
  pathRewrite?: Record<string, string>
  headers?: Record<string, string>
  timeout?: number
}
```

### 2. 安全管理模块 (SecurityManager)

```typescript
interface SecurityManager {
  // SSL 证书管理
  generateSSLCert(domain?: string): Promise<SSLCertificate>
  loadSSLCert(certPath: string, keyPath: string): Promise<SSLCertificate>
  getSSLConfig(): SSLConfig
  
  // HTTPS 配置
  enableHTTPS(options?: HTTPSOptions): void
  disableHTTPS(): void
  isHTTPSEnabled(): boolean
}

interface SSLCertificate {
  cert: string
  key: string
  ca?: string
  domain: string
  expiresAt: Date
}
```

### 3. 资源处理模块 (AssetManager)

```typescript
interface AssetManager {
  // 字体优化
  optimizeFonts(config: FontOptimizationConfig): void
  generateFontSubsets(fontPath: string, chars: string): Promise<string>
  preloadFonts(fonts: string[]): void
  
  // SVG 处理
  convertSVGToComponent(svgPath: string, framework: ProjectType): Promise<string>
  optimizeSVG(svgPath: string): Promise<string>
  generateSVGSprite(svgPaths: string[]): Promise<string>
}

interface FontOptimizationConfig {
  subset?: boolean
  preload?: boolean
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
  formats?: ('woff2' | 'woff' | 'ttf')[]
}
```

### 4. 插件生态模块 (PluginEcosystem)

```typescript
interface PluginEcosystem {
  // 内置插件管理
  getBuiltinPlugins(): BuiltinPlugin[]
  enableBuiltinPlugin(name: string, config?: any): void
  disableBuiltinPlugin(name: string): void
  
  // 插件配置
  configurePlugin(name: string, config: any): void
  getPluginConfig(name: string): any
  
  // 插件市场
  searchPlugins(query: string): Promise<PluginInfo[]>
  installPlugin(name: string): Promise<void>
  uninstallPlugin(name: string): Promise<void>
}

interface BuiltinPlugin {
  name: string
  description: string
  category: 'optimization' | 'development' | 'build' | 'analysis'
  framework?: ProjectType[]
  configSchema?: any
}
```

## 🔧 配置扩展

### 扩展 LauncherConfig 类型

```typescript
interface LauncherConfig {
  // 现有配置...
  
  // 网络配置
  network?: {
    proxy?: ProxyConfig
    alias?: AliasConfig
    cors?: CORSConfig
  }
  
  // 安全配置
  security?: {
    https?: boolean
    ssl?: {
      cert?: string
      key?: string
      ca?: string
      auto?: boolean
    }
  }
  
  // 资源配置
  assets?: {
    fonts?: FontOptimizationConfig
    svg?: {
      componentGeneration?: boolean
      optimization?: boolean
      sprite?: boolean
    }
  }
  
  // 插件配置
  plugins?: {
    builtin?: Record<string, any>
    external?: string[]
    disabled?: string[]
  }
  
  // 开发环境配置
  development?: {
    hmr?: boolean
    errorOverlay?: boolean
    sourcemap?: boolean | 'inline' | 'hidden'
    devtools?: boolean
  }
  
  // 构建配置
  build?: {
    analysis?: boolean
    compression?: 'gzip' | 'brotli' | 'both'
    splitting?: boolean
    treeshaking?: boolean
    minification?: 'esbuild' | 'terser' | 'swc'
  }
}
```

## 📁 目录结构扩展

```
src/
├── core/
│   ├── ViteLauncher.ts          # 主控制器（扩展）
│   └── index.ts
├── services/
│   ├── ConfigManager.ts         # 配置管理（扩展）
│   ├── PluginManager.ts         # 插件管理（扩展）
│   ├── ProjectDetector.ts
│   ├── ErrorHandler.ts
│   ├── NetworkManager.ts        # 新增：网络配置管理
│   ├── SecurityManager.ts       # 新增：安全管理
│   ├── AssetManager.ts          # 新增：资源处理管理
│   └── PluginEcosystem.ts       # 新增：插件生态管理
├── plugins/                     # 新增：内置插件
│   ├── optimization/
│   │   ├── compression.ts
│   │   ├── tree-shaking.ts
│   │   └── code-splitting.ts
│   ├── development/
│   │   ├── hmr-enhanced.ts
│   │   ├── error-overlay.ts
│   │   └── devtools.ts
│   ├── build/
│   │   ├── analyzer.ts
│   │   ├── bundle-size.ts
│   │   └── performance.ts
│   └── assets/
│       ├── font-optimizer.ts
│       ├── svg-processor.ts
│       └── image-optimizer.ts
├── utils/
│   ├── ssl-generator.ts         # 新增：SSL 证书生成
│   ├── font-processor.ts        # 新增：字体处理
│   ├── svg-converter.ts         # 新增：SVG 转换
│   └── proxy-helper.ts          # 新增：代理配置助手
├── types/
│   ├── index.ts                 # 扩展类型定义
│   ├── network.ts               # 新增：网络相关类型
│   ├── security.ts              # 新增：安全相关类型
│   ├── assets.ts                # 新增：资源相关类型
│   └── plugins.ts               # 新增：插件相关类型
└── templates/                   # 项目模板（扩展）
    ├── vue3/
    ├── react/
    ├── lit/
    └── configs/                 # 新增：配置模板
        ├── proxy.template.ts
        ├── ssl.template.ts
        └── optimization.template.ts
```

## 🔄 集成流程

### 1. 初始化流程扩展
```
ViteLauncher 初始化
├── 加载基础服务
├── 初始化网络管理器
├── 初始化安全管理器
├── 初始化资源管理器
├── 初始化插件生态
└── 应用扩展配置
```

### 2. 开发服务器启动流程扩展
```
项目检测
├── 加载扩展配置
├── 配置网络代理
├── 配置 SSL（如果启用）
├── 加载内置插件
├── 优化资源处理
├── 启动开发服务器
└── 应用开发环境增强
```

### 3. 构建流程扩展
```
构建准备
├── 分析项目依赖
├── 应用构建优化插件
├── 处理资源优化
├── 执行构建
├── 生成构建分析报告
└── 应用后处理优化
```

## 📊 实现优先级

### Phase 1: 基础扩展（高优先级）
1. 网络配置功能（代理、别名）
2. 基础插件生态（内置插件框架）
3. 配置系统扩展

### Phase 2: 安全与资源（中优先级）
1. SSL 自动生成功能
2. 中文字体优化
3. SVG 组件转换

### Phase 3: 高级功能（低优先级）
1. 构建分析和优化
2. 开发环境增强
3. 插件市场集成

## 🧪 测试策略

### 单元测试
- 各个管理器的独立功能测试
- 配置合并和验证测试
- 插件加载和依赖解析测试

### 集成测试
- 完整的项目创建和启动流程测试
- 多框架兼容性测试
- 配置文件加载和应用测试

### E2E 测试
- 真实项目场景测试
- 性能基准测试
- 错误处理和恢复测试
