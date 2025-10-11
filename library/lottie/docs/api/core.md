# API Reference - Core

## createLottie()

Creates and returns a new Lottie instance with automatic loading.

```typescript
function createLottie(config: LottieConfig): ILottieInstance
```

### Parameters

- `config` - [LottieConfig](#lottieconfig) object

### Returns

[ILottieInstance](#ilottieinstance) - The created animation instance

### Example

```typescript
import { createLottie } from '@ldesign/lottie'

const animation = createLottie({
  container: '#lottie',
  path: 'animation.json',
  loop: true,
  autoplay: true
})
```

## loadLottie()

Async function to load an animation from a path.

```typescript
function loadLottie(
  container: HTMLElement | string,
  path: string,
  options?: Partial<LottieConfig>
): Promise<ILottieInstance>
```

### Parameters

- `container` - HTML element or selector string
- `path` - URL to the animation JSON file
- `options` - Optional configuration overrides

### Returns

Promise<[ILottieInstance](#ilottieinstance)>

### Example

```typescript
const animation = await loadLottie(
  '#container',
  'https://example.com/animation.json',
  { loop: false, speed: 2 }
)
```

## loadLottieFromData()

Creates an animation from animation data object.

```typescript
function loadLottieFromData(
  container: HTMLElement | string,
  animationData: any,
  options?: Partial<LottieConfig>
): ILottieInstance
```

### Parameters

- `container` - HTML element or selector string
- `animationData` - Lottie animation JSON object
- `options` - Optional configuration overrides

### Returns

[ILottieInstance](#ilottieinstance)

### Example

```typescript
const data = { /* animation JSON */ }
const animation = loadLottieFromData('#container', data, {
  loop: true
})
```

## Type Definitions

### LottieConfig

Main configuration object for creating animations.

```typescript
interface LottieConfig {
  // Required (one of)
  container?: HTMLElement | string
  path?: string
  animationData?: any

  // Renderer
  renderer?: 'svg' | 'canvas' | 'html'

  // Playback
  loop?: boolean | number
  autoplay?: boolean
  speed?: number
  playMode?: 'normal' | 'bounce' | 'reverse'
  initialSegment?: [number, number]

  // Metadata
  name?: string

  // Quality
  quality?: 'low' | 'medium' | 'high' | 'auto'

  // Loading
  loadStrategy?: 'eager' | 'lazy' | 'intersection'

  // Events
  events?: LottieEvents

  // Style
  style?: Partial<CSSStyleDeclaration>

  // Advanced
  advanced?: AdvancedOptions
}
```

### ILottieInstance

Interface for Lottie animation instances.

```typescript
interface ILottieInstance {
  // Properties
  readonly id: string
  readonly name: string
  readonly state: AnimationState
  readonly animation: AnimationItem | null
  readonly config: LottieConfig
  readonly container: HTMLElement | null

  // Methods
  load(): Promise<void>
  play(): void
  pause(): void
  stop(): void
  destroy(): void
  reset(): void
  resize(): void

  setSpeed(speed: number): void
  setDirection(direction: 1 | -1): void
  goToAndStop(frame: number, isFrame?: boolean): void
  goToAndPlay(frame: number, isFrame?: boolean): void
  playSegments(
    segments: [number, number] | [number, number][],
    forceFlag?: boolean
  ): void

  getMetrics(): PerformanceMetrics | null

  on<K extends keyof LottieEvents>(
    event: K,
    callback: LottieEvents[K]
  ): void

  off<K extends keyof LottieEvents>(
    event: K,
    callback?: LottieEvents[K]
  ): void
}
```

### AnimationState

```typescript
type AnimationState =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'playing'
  | 'paused'
  | 'stopped'
  | 'error'
```

### LottieEvents

```typescript
interface LottieEvents {
  config_ready?: () => void
  data_ready?: () => void
  data_failed?: (error: Error) => void
  DOMLoaded?: () => void
  destroy?: () => void
  enterFrame?: (event: {
    currentTime: number
    totalTime: number
    direction: number
  }) => void
  segmentStart?: () => void
  complete?: () => void
  loopComplete?: () => void
  stateChange?: (state: AnimationState) => void
  performanceWarning?: (metrics: PerformanceMetrics) => void
}
```

### AdvancedOptions

```typescript
interface AdvancedOptions {
  // Performance
  enablePerformanceMonitor?: boolean
  performanceMonitorInterval?: number
  maxMemory?: number
  minFps?: number
  enableAutoDegradation?: boolean

  // Caching
  enableCache?: boolean
  cacheKey?: string

  // Loading
  preload?: boolean
  intersectionOptions?: IntersectionObserverInit
  customLoader?: (path: string) => Promise<any>
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  loadTime: number      // ms
  fps: number          // frames per second
  memory: number       // MB
  duration: number     // ms
  totalFrames: number
}
```

## Constants

### Default Values

```typescript
const DEFAULTS = {
  renderer: 'svg',
  loop: true,
  autoplay: false,
  speed: 1,
  quality: 'high',
  loadStrategy: 'eager',
  playMode: 'normal'
}
```

## See Also

- [LottieManager API](/api/lottie-manager)
- [Vue API](/api/vue)
- [React API](/api/react)
