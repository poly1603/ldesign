# 架构设计详解

## 整体架构

@ldesign/color 采用分层架构设计，确保代码的可维护性、可扩展性和性能优化。

### 架构层次

```
┌─────────────────────────────────────┐
│           Vue 3 适配层               │
│  - 组件 (Components)                │
│  - 组合式 API (Composables)         │
│  - 指令 (Directives)                │
│  - 插件 (Plugin)                    │
├─────────────────────────────────────┤
│           应用层 API                │
│  - 高级功能封装                      │
│  - 业务逻辑抽象                      │
│  - 用户友好接口                      │
├─────────────────────────────────────┤
│           核心功能层                │
│  - 主题管理 (Theme Management)      │
│  - 存储管理 (Storage)               │
│  - 事件系统 (Event System)          │
├─────────────────────────────────────┤
│           工具函数层                │
│  - 颜色转换 (Color Conversion)      │
│  - 调色板生成 (Palette Generation)  │
│  - 可访问性检查 (Accessibility)     │
│  - 性能优化 (Performance)           │
└─────────────────────────────────────┘
```

## 核心模块设计

### 1. 颜色处理模块

#### 颜色转换器 (Color Converter)

```typescript
// 支持的颜色格式
interface ColorFormats {
  hex: string // #ffffff
  rgb: RGB // { r: 255, g: 255, b: 255 }
  hsl: HSL // { h: 0, s: 0, l: 100 }
  hsv: HSV // { h: 0, s: 0, v: 100 }
}

// 转换器接口
interface ColorConverter {
  // 基础转换
  hexToRgb(hex: string): RGB
  rgbToHex(r: number, g: number, b: number): string
  rgbToHsl(r: number, g: number, b: number): HSL
  hslToRgb(h: number, s: number, l: number): RGB

  // 扩展转换
  hexToHsl(hex: string): HSL
  hexToHsv(hex: string): HSV
  hslToHex(h: number, s: number, l: number): string
  hsvToHex(h: number, s: number, v: number): string
}
```

#### 颜色工具 (Color Utils)

```typescript
interface ColorUtils {
  // 颜色调整
  adjustBrightness(color: string, amount: number): string
  adjustSaturation(color: string, amount: number): string
  adjustHue(color: string, amount: number): string

  // 颜色混合
  blendColors(
    base: string,
    overlay: string,
    mode: BlendMode,
    opacity: number
  ): string

  // 颜色分析
  getContrastRatio(color1: string, color2: string): number
  getPerceivedBrightness(color: string): number
  isDark(color: string): boolean
  isLight(color: string): boolean

  // 颜色插值
  interpolateColors(color1: string, color2: string, factor: number): string
  generateColorGradient(start: string, end: string, steps: number): string[]
}
```

### 2. 调色板生成模块

#### 调色板生成器 (Palette Generator)

```typescript
interface PaletteGenerator {
  // 基础调色板
  generateMonochromaticPalette(baseColor: string, count: number): string[]
  generateAnalogousPalette(baseColor: string, count: number): string[]

  // 对比调色板
  generateComplementaryPalette(baseColor: string): string[]
  generateTriadicPalette(baseColor: string): string[]
  generateTetradicPalette(baseColor: string): string[]

  // 渐变生成
  generateLinearGradient(config: GradientConfig): string
  generateRadialGradient(
    stops: GradientStop[],
    shape: string,
    size: string
  ): string
}
```

#### 调色板策略模式

```typescript
abstract class PaletteStrategy {
  abstract generate(baseColor: string, options: PaletteOptions): string[]
}

class MonochromaticStrategy extends PaletteStrategy {
  generate(baseColor: string, options: PaletteOptions): string[] {
    // 单色调色板生成逻辑
    const colors: string[] = []
    const step = options.range / (options.count - 1)

    for (let i = 0; i < options.count; i++) {
      const brightness = -options.range / 2 + step * i
      colors.push(adjustBrightness(baseColor, brightness))
    }

    return colors
  }
}

class AnalogousStrategy extends PaletteStrategy {
  generate(baseColor: string, options: PaletteOptions): string[] {
    // 类似色调色板生成逻辑
    const colors: string[] = []
    const hueStep = options.hueRange / (options.count - 1)

    for (let i = 0; i < options.count; i++) {
      const hueShift = -options.hueRange / 2 + hueStep * i
      colors.push(adjustHue(baseColor, hueShift))
    }

    return colors
  }
}
```

### 3. 可访问性检查模块

#### 可访问性检查器 (Accessibility Checker)

```typescript
interface AccessibilityChecker {
  // WCAG 标准检查
  checkAccessibility(
    fg: string,
    bg: string,
    textSize: TextSize
  ): AccessibilityResult
  isAccessible(
    fg: string,
    bg: string,
    level: WCAGLevel,
    textSize: TextSize
  ): boolean

  // 颜色盲模拟
  simulateColorBlindness(
    color: string,
    type: ColorBlindnessType,
    severity: number
  ): ColorBlindnessSimulation
  checkColorBlindnessAccessibility(
    colors: string[],
    types: ColorBlindnessType[]
  ): ColorBlindnessReport[]

  // 智能建议
  getAccessibleColorSuggestions(
    baseColor: string,
    level: WCAGLevel,
    textSize: TextSize
  ): ColorSuggestion[]
}
```

#### 颜色盲模拟算法

```typescript
class ColorBlindnessSimulator {
  private transformationMatrices = {
    protanopia: [
      [0.567, 0.433, 0.0],
      [0.558, 0.442, 0.0],
      [0.0, 0.242, 0.758],
    ],
    deuteranopia: [
      [0.625, 0.375, 0.0],
      [0.7, 0.3, 0.0],
      [0.0, 0.3, 0.7],
    ],
    tritanopia: [
      [0.95, 0.05, 0.0],
      [0.0, 0.433, 0.567],
      [0.0, 0.475, 0.525],
    ],
  }

  simulate(rgb: RGB, type: ColorBlindnessType): RGB {
    const matrix = this.transformationMatrices[type]
    return {
      r: matrix[0][0] * rgb.r + matrix[0][1] * rgb.g + matrix[0][2] * rgb.b,
      g: matrix[1][0] * rgb.r + matrix[1][1] * rgb.g + matrix[1][2] * rgb.b,
      b: matrix[2][0] * rgb.r + matrix[2][1] * rgb.g + matrix[2][2] * rgb.b,
    }
  }
}
```

### 4. 主题管理模块

#### 主题管理器 (Theme Manager)

```typescript
class ThemeManager extends EventEmitter {
  private themes: Map<string, Theme> = new Map()
  private currentTheme: string = 'light'
  private storage: Storage
  private detector: ThemeDetector
  private cssInjector: CSSInjector

  constructor(options: ThemeManagerOptions) {
    super()
    this.storage = new Storage(options.storage)
    this.detector = new ThemeDetector()
    this.cssInjector = new CSSInjector()

    this.initializeThemes(options.themes)
    this.setupSystemThemeDetection()
  }

  setTheme(themeName: string): void {
    if (!this.themes.has(themeName)) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    const oldTheme = this.currentTheme
    this.currentTheme = themeName

    // 注入 CSS 变量
    const theme = this.themes.get(themeName)!
    this.cssInjector.inject(theme.cssVariables)

    // 保存到存储
    this.storage.set('current-theme', themeName)

    // 触发事件
    this.emit('themeChange', {
      from: oldTheme,
      to: themeName,
      theme,
    })
  }

  private setupSystemThemeDetection(): void {
    this.detector.on('systemThemeChange', theme => {
      if (this.themes.has(theme)) {
        this.setTheme(theme)
      }
    })
  }
}
```

#### 主题检测器 (Theme Detector)

```typescript
class ThemeDetector extends EventEmitter {
  private mediaQuery: MediaQueryList

  constructor() {
    super()
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaQuery.addEventListener('change', this.handleChange.bind(this))
  }

  getCurrentSystemTheme(): 'light' | 'dark' {
    return this.mediaQuery.matches ? 'dark' : 'light'
  }

  private handleChange(event: MediaQueryListEvent): void {
    const theme = event.matches ? 'dark' : 'light'
    this.emit('systemThemeChange', theme)
  }
}
```

### 5. 性能优化模块

#### 缓存系统 (Cache System)

```typescript
interface CacheStrategy<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}

class LRUCache<K, V> implements CacheStrategy<K, V> {
  private capacity: number
  private cache = new Map<K, V>()

  constructor(capacity: number = 100) {
    this.capacity = capacity
  }

  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!
      // 移到最后（最近使用）
      this.cache.delete(key)
      this.cache.set(key, value)
      return value
    }
    return undefined
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最久未使用的项
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    this.cache.set(key, value)
  }
}
```

#### 闲时处理器 (Idle Processor)

```typescript
class IdleProcessor {
  private taskQueue: (() => void)[] = []
  private isProcessing = false
  private options: IdleProcessorOptions

  constructor(options: IdleProcessorOptions = {}) {
    this.options = {
      timeout: 5000,
      ...options,
    }
  }

  schedule(task: () => void): void {
    this.taskQueue.push(task)
    if (!this.isProcessing) {
      this.processNext()
    }
  }

  private processNext(): void {
    if (this.taskQueue.length === 0) {
      this.isProcessing = false
      return
    }

    this.isProcessing = true

    if ('requestIdleCallback' in window) {
      requestIdleCallback(deadline => this.processTasks(deadline), {
        timeout: this.options.timeout,
      })
    } else {
      // 降级处理
      setTimeout(() => {
        this.processTasks({ timeRemaining: () => 5 } as IdleDeadline)
      }, 0)
    }
  }

  private processTasks(deadline: IdleDeadline): void {
    while (deadline.timeRemaining() > 0 && this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!
      try {
        task()
      } catch (error) {
        console.error('Idle task error:', error)
      }
    }

    this.processNext()
  }
}
```

## Vue 3 适配层设计

### 组合式 API 设计

```typescript
// useTheme 组合式函数
export function useTheme(options: UseThemeOptions = {}) {
  const themeManager = inject(THEME_MANAGER_KEY)
  const currentTheme = ref(themeManager.getCurrentTheme())
  const systemTheme = ref(themeManager.getSystemTheme())

  const setTheme = (theme: string) => {
    themeManager.setTheme(theme)
  }

  const toggleTheme = () => {
    const themes = themeManager.getAvailableThemes()
    const currentIndex = themes.indexOf(currentTheme.value)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  // 监听主题变化
  onMounted(() => {
    themeManager.on('themeChange', event => {
      currentTheme.value = event.to
    })

    themeManager.on('systemThemeChange', theme => {
      systemTheme.value = theme
    })
  })

  return {
    currentTheme: readonly(currentTheme),
    systemTheme: readonly(systemTheme),
    setTheme,
    toggleTheme,
    availableThemes: themeManager.getAvailableThemes(),
  }
}
```

### 组件设计模式

```typescript
// 颜色选择器组件
export const ColorPicker = defineComponent({
  name: 'ColorPicker',
  props: {
    modelValue: String,
    showAlpha: Boolean,
    showPresets: Boolean,
    presets: Array as PropType<string[]>,
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const localValue = ref(props.modelValue)
    const colorUtils = useColorUtils()

    const updateColor = (color: string) => {
      localValue.value = color
      emit('update:modelValue', color)
      emit('change', color)
    }

    return {
      localValue,
      updateColor,
      ...colorUtils,
    }
  },
})
```

## 扩展性设计

### 插件系统

```typescript
interface ColorPlugin {
  name: string
  version: string
  install(app: App, options?: any): void
}

class PluginManager {
  private plugins = new Map<string, ColorPlugin>()

  register(plugin: ColorPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} already registered`)
      return
    }

    this.plugins.set(plugin.name, plugin)
  }

  install(app: App, pluginName: string, options?: any): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`)
    }

    plugin.install(app, options)
  }
}
```

### 适配器模式

```typescript
interface FrameworkAdapter {
  name: string
  install(options: AdapterOptions): void
  createComponent(definition: ComponentDefinition): any
  createDirective(definition: DirectiveDefinition): any
}

class VueAdapter implements FrameworkAdapter {
  name = 'vue'

  install(options: AdapterOptions): void {
    // Vue 特定的安装逻辑
  }

  createComponent(definition: ComponentDefinition): any {
    return defineComponent(definition)
  }

  createDirective(definition: DirectiveDefinition): any {
    return definition
  }
}
```

这种架构设计确保了：

1. **模块化**：每个功能模块独立，便于维护和测试
2. **可扩展性**：通过插件和适配器模式支持功能扩展
3. **性能优化**：内置缓存和闲时处理机制
4. **类型安全**：完整的 TypeScript 类型定义
5. **框架无关**：核心功能不依赖特定框架
