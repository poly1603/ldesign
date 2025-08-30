# 架构设计

## 🏗️ 整体架构

### 分层架构设计

`@ldesign/template` 采用分层架构设计，从下到上分为四个主要层次：

```
┌─────────────────────────────────────────────────────────────┐
│                    应用层 (Application Layer)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   用户应用      │  │   示例项目      │  │   测试应用      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    集成层 (Integration Layer)                │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ TemplateRenderer│  │ TemplateSelector│  │  useTemplate    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ TemplatePlugin  │  │   指令系统      │  │   全局属性      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    核心层 (Core Layer)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ TemplateManager │  │ TemplateScanner │  │ TemplateLoader  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ DeviceAdapter   │  │   事件系统      │  │   缓存系统      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                    基础层 (Foundation Layer)                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   类型系统      │  │   工具函数      │  │   常量定义      │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 层次职责

#### 1. 基础层 (Foundation Layer)
- **类型系统**: 提供完整的 TypeScript 类型定义
- **工具函数**: 通用的辅助函数和工具方法
- **常量定义**: 系统常量和默认配置

#### 2. 核心层 (Core Layer)
- **TemplateManager**: 模板管理的核心控制器
- **TemplateScanner**: 模板文件扫描和解析
- **TemplateLoader**: 模板组件动态加载
- **DeviceAdapter**: 设备类型检测和适配
- **事件系统**: 事件发布订阅机制
- **缓存系统**: 模板缓存管理

#### 3. 集成层 (Integration Layer)
- **Vue 组件**: TemplateRenderer、TemplateSelector
- **Composition API**: useTemplate 等响应式 API
- **插件系统**: Vue 插件注册和配置
- **指令系统**: Vue 自定义指令
- **全局属性**: 全局方法和属性注入

#### 4. 应用层 (Application Layer)
- **用户应用**: 最终用户的 Vue 应用
- **示例项目**: 演示和测试项目
- **测试应用**: 自动化测试应用

## 🔧 核心模块设计

### 1. TemplateManager (模板管理器)

```typescript
class TemplateManager {
  // 依赖注入
  private scanner: TemplateScanner
  private loader: TemplateLoader
  private deviceAdapter: DeviceAdapter
  
  // 状态管理
  private templates: Map<string, TemplateInfo>
  private categoryIndex: Map<string, Map<DeviceType, TemplateInfo[]>>
  private listeners: Map<string, Set<Function>>
  
  // 核心方法
  async initialize(): Promise<void>
  async scanTemplates(): Promise<ScanResult>
  async render(category: string, ...args): Promise<LoadResult>
  async switchTemplate(category: string, ...args): Promise<LoadResult>
}
```

**设计原则:**
- **单一职责**: 专注于模板的统一管理
- **依赖注入**: 通过构造函数注入依赖模块
- **事件驱动**: 通过事件系统解耦模块间通信
- **状态管理**: 维护模板索引和分类映射

### 2. TemplateScanner (模板扫描器)

```typescript
class TemplateScanner {
  // 配置选项
  private options: ScanOptions
  
  // 核心方法
  async scan(): Promise<ScanResult>
  private async parseTemplate(path: string): Promise<TemplateInfo>
  private async findComponentFile(path: string): Promise<string>
  private createDefaultConfig(info: any): TemplateConfig
}
```

**设计特点:**
- **文件系统抽象**: 支持不同的文件系统实现
- **配置驱动**: 通过配置控制扫描行为
- **错误容错**: 单个模板解析失败不影响整体扫描
- **性能优化**: 并发扫描和缓存机制

### 3. TemplateLoader (模板加载器)

```typescript
class TemplateLoader {
  // 缓存管理
  private cache: Map<string, CacheItem>
  private loadingPromises: Map<string, Promise<Component>>
  
  // 核心方法
  async load(template: TemplateInfo, options?: LoadOptions): Promise<LoadResult>
  private async loadComponent(template: TemplateInfo): Promise<Component>
  private getFromCache(key: string): Component | null
  private setCache(key: string, component: Component): void
}
```

**设计特点:**
- **缓存策略**: 支持 LRU、FIFO 等多种缓存策略
- **并发控制**: 避免同一模板的重复加载
- **超时处理**: 加载超时自动取消
- **错误恢复**: 加载失败时的重试机制

### 4. DeviceAdapter (设备适配器)

```typescript
class DeviceAdapter {
  // 设备信息
  private currentDevice: DeviceType
  private currentDeviceInfo: DeviceInfo
  private listeners: Set<DeviceChangeCallback>
  
  // 监听器
  private resizeObserver?: ResizeObserver
  private mediaQueryLists: MediaQueryList[]
  
  // 核心方法
  initialize(): void
  getCurrentDevice(): DeviceType
  setDeviceType(deviceType: DeviceType): void
  addDeviceChangeListener(callback: DeviceChangeCallback): () => void
}
```

**设计特点:**
- **多种检测方式**: 支持窗口大小、媒体查询、用户代理等
- **响应式监听**: 实时监听设备变化
- **事件驱动**: 设备变化时触发相应事件
- **内存管理**: 自动清理事件监听器

## 🎨 设计模式应用

### 1. 观察者模式 (Observer Pattern)
- **应用场景**: 事件系统、设备变化监听
- **实现方式**: EventEmitter 模式
- **优势**: 解耦模块间通信，支持一对多通知

### 2. 策略模式 (Strategy Pattern)
- **应用场景**: 缓存策略、设备检测策略
- **实现方式**: 策略接口和具体策略类
- **优势**: 算法可替换，易于扩展

### 3. 工厂模式 (Factory Pattern)
- **应用场景**: 模板实例创建、配置对象创建
- **实现方式**: 工厂函数和工厂类
- **优势**: 封装创建逻辑，统一创建接口

### 4. 单例模式 (Singleton Pattern)
- **应用场景**: 全局模板管理器实例
- **实现方式**: 静态实例和懒加载
- **优势**: 确保全局唯一性，节省资源

### 5. 装饰器模式 (Decorator Pattern)
- **应用场景**: 模板组件增强、缓存装饰
- **实现方式**: 高阶组件和装饰函数
- **优势**: 动态添加功能，不修改原有代码

### 6. 适配器模式 (Adapter Pattern)
- **应用场景**: 不同设备类型适配、文件系统适配
- **实现方式**: 适配器类和接口转换
- **优势**: 兼容不同接口，提高复用性

## 🔄 数据流设计

### 1. 模板扫描流程

```
用户初始化
    ↓
TemplateManager.initialize()
    ↓
TemplateScanner.scan()
    ↓
扫描模板目录
    ↓
解析模板配置
    ↓
构建模板索引
    ↓
触发扫描完成事件
```

### 2. 模板渲染流程

```
用户请求渲染
    ↓
TemplateManager.render()
    ↓
查找最佳模板
    ↓
TemplateLoader.load()
    ↓
检查缓存
    ↓
动态加载组件
    ↓
缓存组件实例
    ↓
返回渲染结果
```

### 3. 设备切换流程

```
窗口大小变化
    ↓
DeviceAdapter 监听
    ↓
检测新设备类型
    ↓
触发设备变化事件
    ↓
TemplateManager 响应
    ↓
自动切换模板
    ↓
更新 UI 显示
```

## 🚀 性能优化设计

### 1. 懒加载机制
- **模板组件**: 按需加载，减少初始包大小
- **配置文件**: 延迟解析，提升启动速度
- **样式文件**: 动态导入，避免样式冲突

### 2. 缓存策略
- **内存缓存**: 已加载的模板组件
- **配置缓存**: 模板配置信息
- **索引缓存**: 模板分类索引

### 3. 并发控制
- **扫描并发**: 并行扫描多个模板目录
- **加载去重**: 避免同一模板的重复加载
- **事件节流**: 设备变化事件的节流处理

### 4. 内存管理
- **自动清理**: 事件监听器的自动清理
- **缓存淘汰**: LRU 算法的缓存淘汰
- **弱引用**: 避免循环引用导致的内存泄漏

## 🔧 扩展性设计

### 1. 插件系统
- **插件接口**: 标准化的插件接口定义
- **生命周期钩子**: 插件可以监听的生命周期事件
- **配置扩展**: 插件可以扩展系统配置

### 2. 自定义扩展点
- **模板解析器**: 支持自定义模板解析逻辑
- **加载器**: 支持自定义模板加载策略
- **缓存策略**: 支持自定义缓存实现
- **设备检测**: 支持自定义设备检测逻辑

### 3. 事件系统
- **标准事件**: 系统定义的标准事件
- **自定义事件**: 用户可以定义和触发自定义事件
- **事件过滤**: 支持事件的过滤和转换

### 4. 配置系统
- **分层配置**: 支持全局、分类、模板三级配置
- **动态配置**: 运行时动态修改配置
- **配置验证**: 配置项的类型检查和验证
