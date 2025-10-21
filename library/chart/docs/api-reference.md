# API 参考

## 核心 API

### createChart

创建图表实例的便捷方法。

```typescript
function createChart(
  container: HTMLElement | string,
  config: ChartConfig
): Chart
```

**参数：**
- `container`: HTMLElement 或 CSS 选择器字符串
- `config`: 图表配置对象

**返回值：** Chart 实例

**示例：**
```javascript
import { createChart } from '@ldesign/chart'

const chart = createChart('#chart-container', {
  type: 'line',
  data: [1, 2, 3, 4, 5]
})
```

### Chart 类

核心图表类。

#### 构造函数

```typescript
constructor(container: HTMLElement, config: ChartConfig)
```

#### 方法

##### updateData

更新图表数据。

```typescript
async updateData(data: ChartData): Promise<void>
```

**示例：**
```javascript
await chart.updateData([2, 3, 4, 5, 6])
```

##### setTheme

设置主题。

```typescript
setTheme(theme: string | ThemeConfig): void
```

**示例：**
```javascript
chart.setTheme('dark')
// 或
chart.setTheme({
  color: ['#5470c6', '#91cc75'],
  backgroundColor: '#1a1a1a'
})
```

##### setDarkMode

设置暗黑模式。

```typescript
setDarkMode(enabled: boolean): void
```

**示例：**
```javascript
chart.setDarkMode(true)
```

##### setFontSize

设置字体大小。

```typescript
setFontSize(size: number): void
```

**示例：**
```javascript
chart.setFontSize(16)
```

##### resize

手动调整图表大小。

```typescript
resize(): void
```

**示例：**
```javascript
chart.resize()
```

##### refresh

刷新图表（重新生成配置）。

```typescript
async refresh(): Promise<void>
```

**示例：**
```javascript
await chart.refresh()
```

##### getDataURL

获取图表的 Data URL。

```typescript
getDataURL(options?: any): string
```

**示例：**
```javascript
const dataURL = chart.getDataURL()
```

##### on / off

事件监听。

```typescript
on(eventName: string, handler: Function): void
off(eventName: string, handler?: Function): void
```

**示例：**
```javascript
chart.on('click', (params) => {
  console.log('Clicked:', params)
})
```

##### dispose

销毁图表实例。

```typescript
dispose(): void
```

**示例：**
```javascript
chart.dispose()
```

## Vue API

### Chart 组件

```vue
<Chart
  type="line"
  :data="data"
  title="标题"
  :dark-mode="true"
  :font-size="14"
  @ready="onReady"
  @error="onError"
/>
```

#### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `ChartType` | - | 图表类型（必填） |
| data | `ChartData` | - | 图表数据（必填） |
| title | `string \| TitleConfig` | - | 标题 |
| theme | `string \| ThemeConfig` | `'light'` | 主题 |
| darkMode | `boolean` | `false` | 暗黑模式 |
| fontSize | `number \| FontSizeConfig` | `12` | 字体大小 |
| width | `number \| string` | `'100%'` | 宽度 |
| height | `number \| string` | `'400px'` | 高度 |
| lazy | `boolean` | `false` | 懒加载 |
| virtual | `boolean` | `false` | 虚拟渲染 |
| worker | `boolean` | `false` | 使用 Worker |
| cache | `boolean` | `true` | 启用缓存 |
| responsive | `boolean \| ResponsiveConfig` | `true` | 响应式 |
| echarts | `EChartsOption` | - | ECharts 原生配置 |

#### Events

| 名称 | 参数 | 说明 |
|------|------|------|
| ready | `(chart: Chart)` | 图表准备完成 |
| error | `(error: Error)` | 发生错误 |
| dataUpdate | `(data: any)` | 数据更新 |

#### 暴露的方法

```typescript
interface ChartExpose {
  chart: Chart
  refresh: () => void
  resize: () => void
  getDataURL: () => string
  getInstance: () => EChartsInstance
}
```

### useChart

Vue 组合式函数。

```typescript
function useChart(config: MaybeRef<ChartConfig>): {
  chartRef: Ref<HTMLDivElement>
  instance: Ref<Chart>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
  init: (container?: HTMLElement) => Promise<void>
  updateData: (data: ChartData) => void
  setTheme: (theme: string) => void
  setDarkMode: (enabled: boolean) => void
  resize: () => void
  refresh: () => void
}
```

**示例：**
```vue
<script setup>
import { useChart } from '@ldesign/chart/vue'

const { chartRef, instance } = useChart({
  type: 'line',
  data: [1, 2, 3, 4, 5]
})
</script>

<template>
  <div ref="chartRef"></div>
</template>
```

## React API

### Chart 组件

```tsx
<Chart
  type="line"
  data={data}
  title="Title"
  darkMode={true}
  fontSize={14}
  onReady={handleReady}
  onError={handleError}
/>
```

#### Props

与 Vue 组件的 Props 相同，但使用 camelCase 命名。

#### Ref

```typescript
interface ChartRef {
  chart: Chart | undefined
  refresh: () => void
  resize: () => void
  getDataURL: () => string
  getInstance: () => any
}
```

**示例：**
```tsx
const chartRef = useRef<ChartRef>(null)

// 调用方法
chartRef.current?.refresh()
```

### useChart

React Hook。

```typescript
function useChart(config: ChartConfig): {
  chartRef: RefObject<HTMLDivElement>
  instance: Chart | undefined
  isLoading: boolean
  error: Error | null
  init: (container?: HTMLElement) => Promise<void>
  updateData: (data: ChartData) => void
  setTheme: (theme: string) => void
  setDarkMode: (enabled: boolean) => void
  resize: () => void
  refresh: () => void
}
```

**示例：**
```tsx
import { useChart } from '@ldesign/chart/react'

function MyChart() {
  const { chartRef } = useChart({
    type: 'line',
    data: [1, 2, 3, 4, 5]
  })

  return <div ref={chartRef} />
}
```

## Lit API

### ldesign-chart

Web Component。

```html
<ldesign-chart
  type="line"
  .data="${data}"
  title="Title"
  dark-mode
  font-size="14"
  @ready="${handleReady}"
  @error="${handleError}">
</ldesign-chart>
```

#### Properties

| 名称 | 类型 | 说明 |
|------|------|------|
| type | `string` | 图表类型 |
| data | `ChartData` | 图表数据 |
| title | `string` | 标题 |
| theme | `string` | 主题 |
| darkMode | `boolean` | 暗黑模式 |
| fontSize | `number` | 字体大小 |

#### Methods

```typescript
refresh(): void
resize(): void
getDataURL(): string
```

#### Events

- `ready`: 图表准备完成
- `error`: 发生错误

## 类型定义

### ChartData

```typescript
type ChartData = 
  | number[]  // 简单数组
  | ObjectArray  // 对象数组
  | SimpleChartData  // 标准格式

interface SimpleChartData {
  labels?: string[] | number[]
  datasets: Dataset[]
}

interface Dataset {
  name?: string
  data: number[]
  type?: string
  color?: string
  [key: string]: any
}
```

### ChartType

```typescript
type ChartType = 
  | 'line' | 'bar' | 'pie' | 'scatter' | 'radar'
  | 'gauge' | 'funnel' | 'heatmap' | 'candlestick'
  | 'mixed'
  // ... 更多类型
```

### ChartConfig

```typescript
interface ChartConfig {
  type: ChartType
  data: ChartData
  title?: string | TitleConfig
  theme?: string | ThemeConfig
  darkMode?: boolean
  fontSize?: number | FontSizeConfig
  lazy?: boolean
  virtual?: boolean
  worker?: boolean
  cache?: boolean
  responsive?: boolean
  echarts?: EChartsOption
  // ... 更多配置
}
```

## 主题 API

### themes

预设主题对象。

```typescript
import { themes } from '@ldesign/chart'

console.log(themes.light)
console.log(themes.dark)
```

### getTheme

获取主题。

```typescript
function getTheme(name: string): ThemeConfig | undefined
```

### themeManager

主题管理器。

```typescript
import { themeManager } from '@ldesign/chart'

// 注册自定义主题
themeManager.registerTheme('custom', {
  color: ['#ff0000', '#00ff00'],
  backgroundColor: '#ffffff'
})

// 列出所有主题
const themes = themeManager.listThemes()
```

## 工具 API

### DataParser

数据解析器。

```typescript
import { DataParser } from '@ldesign/chart'

const parser = new DataParser()
const parsed = parser.parse([1, 2, 3, 4, 5])
```

### validateConfig

验证配置。

```typescript
import { validateConfig } from '@ldesign/chart'

const result = validateConfig(config)
if (!result.valid) {
  console.error(result.errors)
}
```

