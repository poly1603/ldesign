# 实现细节与技术方案

## 🔧 核心技术实现

### 1. 设备检测集成

#### 技术方案

集成 `@ldesign/device` 包，提供统一的设备检测接口：

```typescript
// 设备检测器初始化
const deviceDetector = new DeviceDetector({
  enableResize: true, // 监听窗口大小变化
  enableOrientation: true, // 监听设备方向变化
  debounceDelay: 100, // 防抖延迟
})

// 获取当前设备类型
const currentDevice = deviceDetector.getDeviceType()
```

#### 实现细节

- **响应式检测**: 实时监听窗口大小和设备方向变化
- **防抖机制**: 避免频繁触发设备变化事件
- **缓存优化**: 缓存检测结果，减少重复计算

### 2. 路由类型扩展

#### 扩展策略

通过模块声明合并扩展现有的路由类型：

```typescript
// 扩展 RouteMeta 接口
interface RouteMeta {
  // 原有字段...
  supportedDevices?: DeviceType[]
  unsupportedMessage?: string
  unsupportedRedirect?: string
  template?: string
  templateCategory?: string
}

// 扩展 RouteRecordRaw 接口
interface RouteRecordRaw {
  // 原有字段...
  deviceComponents?: {
    mobile?: RouteComponent
    tablet?: RouteComponent
    desktop?: RouteComponent
  }
  template?: string
  templateCategory?: string
}
```

#### 类型安全保证

- **严格类型检查**: 所有新增字段都有完整的类型定义
- **可选字段**: 新增字段都是可选的，保证向后兼容
- **泛型支持**: 支持泛型参数，提供更好的类型推断

### 3. 设备访问控制守卫

#### 实现架构

```typescript
class DeviceRouteGuard {
  private getCurrentDevice: () => DeviceType
  private options: DeviceGuardOptions

  createGuard(): NavigationGuard {
    return async (to, from, next) => {
      const currentDevice = this.getCurrentDevice()
      const supportedDevices = this.getSupportedDevices(to)

      if (this.isDeviceSupported(supportedDevices, currentDevice, to)) {
        next()
      } else {
        const redirectTo = this.handleUnsupportedDevice(currentDevice, to)
        next(redirectTo)
      }
    }
  }
}
```

#### 核心逻辑

1. **设备检查**: 获取当前设备类型和路由支持的设备列表
2. **权限验证**: 检查当前设备是否在支持列表中
3. **处理重定向**: 不支持时执行自定义处理逻辑或默认重定向

#### 配置灵活性

```typescript
// 自定义设备检查逻辑
guardOptions: {
  checkSupportedDevices: (supported, current, route) => {
    // 自定义检查逻辑
    return customLogic(supported, current, route)
  },
  onUnsupportedDevice: (device, route) => {
    // 自定义处理逻辑
    return customRedirect(device, route)
  }
}
```

### 4. 设备组件解析器

#### 解析策略

```typescript
class DeviceComponentResolver {
  resolveComponent(record: RouteRecordNormalized): DeviceComponentResolution | null {
    // 1. 优先检查设备特定组件
    const deviceComponent = this.resolveDeviceSpecificComponent(record)
    if (deviceComponent) return deviceComponent

    // 2. 检查常规组件
    const regularComponent = this.resolveRegularComponent(record)
    if (regularComponent) return regularComponent

    // 3. 检查模板配置
    const templateComponent = this.resolveTemplateComponent(record)
    if (templateComponent) return templateComponent

    return null
  }
}
```

#### 回退机制

```typescript
// 智能回退顺序：desktop → tablet → mobile
private resolveDeviceSpecificComponent(record, device) {
  const deviceComponents = record.deviceComponents

  // 优先使用当前设备组件
  if (deviceComponents[device]) {
    return { component: deviceComponents[device], isFallback: false }
  }

  // 按优先级回退
  const fallbackOrder = ['desktop', 'tablet', 'mobile']
  for (const fallbackDevice of fallbackOrder) {
    if (fallbackDevice !== device && deviceComponents[fallbackDevice]) {
      return { component: deviceComponents[fallbackDevice], isFallback: true }
    }
  }

  return null
}
```



### 6. 插件系统实现

#### 插件架构

```typescript
class DeviceRouterPlugin {
  private router: Router
  private deviceDetector: DeviceDetector
  private deviceGuard: DeviceRouteGuard
  private componentResolver: DeviceComponentResolver
  private templateResolver: TemplateRouteResolver

  install(): void {
    // 1. 安装设备访问控制守卫
    if (this.options.enableDeviceGuard) {
      this.router.beforeEach(this.deviceGuard.createGuard())
    }

    // 2. 扩展路由器功能
    this.extendRouter()
  }

  private extendRouter(): void {
    // 扩展 resolve 方法以支持设备组件解析
    const originalResolve = this.router.resolve.bind(this.router)

    this.router.resolve = (to, currentLocation) => {
      const resolved = originalResolve(to, currentLocation)

      // 为每个匹配的路由记录解析设备组件
      resolved.matched = resolved.matched.map(record => {
        const resolution = this.componentResolver.resolveComponent(record)
        if (resolution) {
          return this.updateRecordWithResolution(record, resolution)
        }
        return record
      })

      return resolved
    }
  }
}
```

#### 生命周期管理

- **安装**: 注册守卫、扩展路由器功能
- **卸载**: 清理资源、移除监听器
- **配置**: 支持运行时配置更新

## 🎨 组件系统实现

### 1. DeviceUnsupported 组件

#### 组件架构

```typescript
export default defineComponent({
  name: 'DeviceUnsupported',
  props: {
    device: { type: String as () => DeviceType, default: 'desktop' },
    message: { type: String, default: '当前系统不支持在此设备上查看' },
    supportedDevices: { type: Array as () => DeviceType[], default: () => ['desktop'] },
  },
  setup(props) {
    // 响应式数据和计算属性
    const deviceNames = computed(() => {
      return props.supportedDevices.map(device => getDeviceFriendlyName(device))
    })

    // 事件处理
    const goBack = () => {
      if (window.history.length > 1) {
        window.history.back()
      } else {
        window.location.href = '/'
      }
    }

    return { deviceNames, goBack }
  },
})
```

#### 样式设计

- **响应式布局**: 适配不同屏幕尺寸
- **友好界面**: 清晰的视觉层次和交互反馈
- **无障碍支持**: 符合 WCAG 标准的无障碍设计

### 2. Composition API 实现

#### useDeviceRoute 实现

```typescript
export function useDeviceRoute(options: UseDeviceRouteOptions = {}) {
  const router = useRouter()
  const route = useRoute()
  const devicePlugin = (router as any).devicePlugin

  // 响应式状态
  const currentDevice = ref<DeviceType>('desktop')

  // 计算属性
  const isCurrentRouteSupported = computed(() => {
    return checkDeviceSupport(route.value, currentDevice.value)
  })

  // 方法
  const isRouteSupported = (path: string): boolean => {
    return devicePlugin?.isRouteSupported(path) ?? true
  }

  // 生命周期
  onMounted(() => {
    if (devicePlugin && options.autoDetect) {
      currentDevice.value = devicePlugin.getCurrentDevice()

      // 监听设备变化
      const unwatch = devicePlugin.onDeviceChange((device: DeviceType) => {
        currentDevice.value = device
      })

      onUnmounted(unwatch)
    }
  })

  return {
    currentDevice,
    isCurrentRouteSupported,
    isRouteSupported,
  }
}
```

## 🧪 测试实现策略

### 1. 单元测试

```typescript
describe('DeviceRouteGuard', () => {
  let guard: DeviceRouteGuard
  let getCurrentDevice: () => DeviceType

  beforeEach(() => {
    getCurrentDevice = vi.fn(() => 'desktop')
    guard = new DeviceRouteGuard(getCurrentDevice)
  })

  it('应该允许支持的设备访问', async () => {
    const guardFn = guard.createGuard()
    const next = vi.fn()

    const to = createMockRoute({
      meta: { supportedDevices: ['desktop'] },
    })

    await guardFn(to, createMockRoute(), next)

    expect(next).toHaveBeenCalledWith()
  })
})
```

### 2. E2E 测试

```typescript
test('应该在不同设备上显示不同的组件', async ({ page }) => {
  // 桌面端
  await page.setViewportSize({ width: 1200, height: 800 })
  let componentName = await page.locator('[data-testid="component-name"]').textContent()
  expect(componentName).toContain('Desktop')

  // 移动端
  await page.setViewportSize({ width: 375, height: 667 })
  componentName = await page.locator('[data-testid="component-name"]').textContent()
  expect(componentName).toContain('Mobile')
})
```

## 🚀 性能优化实现

### 1. 懒加载机制

```typescript
// 设备组件懒加载
deviceComponents: {
  mobile: () => import('@/views/mobile/Home.vue'),
  desktop: () => import('@/views/desktop/Home.vue')
}


```

### 2. 缓存策略

```typescript
class DeviceComponentResolver {
  private cache = new Map<string, DeviceComponentResolution>()

  resolveComponent(record: RouteRecordNormalized) {
    const cacheKey = this.generateCacheKey(record)

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const resolution = this.doResolveComponent(record)
    this.cache.set(cacheKey, resolution)

    return resolution
  }
}
```

### 3. 防抖处理

```typescript
// 设备变化防抖
const debouncedDeviceChange = debounce((device: DeviceType) => {
  this.handleDeviceChange(device)
}, 100)

deviceDetector.on('deviceChange', debouncedDeviceChange)
```

## 🔧 工具函数实现

### 1. 设备支持检查

```typescript
export function checkDeviceSupport(
  route: RouteLocationNormalized,
  currentDevice: DeviceType
): boolean {
  const supportedDevices = getSupportedDevicesFromRoute(route)

  // 没有限制时支持所有设备
  if (!supportedDevices || supportedDevices.length === 0) {
    return true
  }

  return supportedDevices.includes(currentDevice)
}
```

### 2. 组件解析工具

```typescript
export function resolveDeviceComponent(
  deviceComponents: Record<DeviceType, RouteComponent>,
  currentDevice: DeviceType
): DeviceComponentResolution | null {
  // 优先使用当前设备组件
  if (deviceComponents[currentDevice]) {
    return {
      component: deviceComponents[currentDevice],
      deviceType: currentDevice,
      isFallback: false,
      source: 'deviceComponents',
    }
  }

  // 智能回退
  const fallbackOrder: DeviceType[] = ['desktop', 'tablet', 'mobile']
  for (const fallbackDevice of fallbackOrder) {
    if (fallbackDevice !== currentDevice && deviceComponents[fallbackDevice]) {
      return {
        component: deviceComponents[fallbackDevice],
        deviceType: fallbackDevice,
        isFallback: true,
        source: 'deviceComponents',
      }
    }
  }

  return null
}
```

这些实现细节展示了设备适配功能的完整技术方案，从底层的设备检测到上层的用户接口，每个环节都经过精心设
计和优化，确保功能的稳定性、性能和易用性。
