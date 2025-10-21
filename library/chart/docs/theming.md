# 主题定制指南

@ldesign/chart 提供了强大的主题系统，支持预设主题、自定义主题和动态切换。

## 预设主题

### 使用预设主题

```javascript
<Chart type="line" :data="data" theme="dark" />
```

### 可用主题

- `light`: 亮色主题（默认）
- `dark`: 暗色主题
- `blue`: 蓝色主题
- `green`: 绿色主题
- `purple`: 紫色主题

### 查看所有主题

```javascript
import { getThemeNames } from '@ldesign/chart'

console.log(getThemeNames())
// ['light', 'dark', 'blue', 'green', 'purple']
```

## 暗黑模式

### 快速切换

```javascript
<Chart type="bar" :data="data" dark-mode />
```

### 动态切换

```vue
<template>
  <div>
    <button @click="toggleDark">切换暗黑模式</button>
    <Chart type="line" :data="data" :dark-mode="isDark" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isDark = ref(false)

const toggleDark = () => {
  isDark.value = !isDark.value
}
</script>
```

### 使用 Composable

```vue
<script setup>
import { useChartTheme } from '@ldesign/chart/vue'

const { theme, darkMode, toggleDarkMode } = useChartTheme()
</script>

<template>
  <div>
    <button @click="toggleDarkMode">Toggle Dark Mode</button>
    <Chart type="line" :data="data" :theme="theme" />
  </div>
</template>
```

## 自定义主题

### 方式一：主题对象

```javascript
const customTheme = {
  color: [
    '#5470c6',
    '#91cc75',
    '#fac858',
    '#ee6666'
  ],
  backgroundColor: '#ffffff',
  textStyle: {
    color: '#333333',
    fontSize: 12
  },
  title: {
    textStyle: {
      color: '#333333',
      fontSize: 18
    }
  },
  legend: {
    textStyle: {
      color: '#333333'
    }
  }
}

<Chart type="line" :data="data" :theme="customTheme" />
```

### 方式二：注册主题

```javascript
import { themeManager } from '@ldesign/chart'

// 注册自定义主题
themeManager.registerTheme('company', {
  color: ['#1890ff', '#52c41a', '#faad14'],
  backgroundColor: '#f0f2f5',
  textStyle: {
    color: '#333',
    fontSize: 14
  }
})

// 使用自定义主题
<Chart type="bar" :data="data" theme="company" />
```

### 方式三：扩展预设主题

```javascript
import { themes, themeManager } from '@ldesign/chart'

// 基于暗色主题扩展
const myDarkTheme = {
  ...themes.dark,
  color: ['#ff6b6b', '#4ecdc4', '#45b7d1'],
  title: {
    ...themes.dark.title,
    textStyle: {
      ...themes.dark.title?.textStyle,
      fontSize: 20
    }
  }
}

themeManager.registerTheme('my-dark', myDarkTheme)
```

## 主题配置详解

### 颜色配置

```javascript
{
  // 主色板
  color: [
    '#5470c6',  // 系列1
    '#91cc75',  // 系列2
    '#fac858',  // 系列3
    '#ee6666',  // 系列4
    // ...更多颜色
  ],
  
  // 背景色
  backgroundColor: '#ffffff',
  
  // 文本样式
  textStyle: {
    color: '#333333',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif'
  }
}
```

### 组件样式

```javascript
{
  // 标题
  title: {
    textStyle: {
      color: '#333',
      fontSize: 18,
      fontWeight: 'bold'
    },
    subtextStyle: {
      color: '#666',
      fontSize: 14
    }
  },
  
  // 图例
  legend: {
    textStyle: {
      color: '#333'
    }
  },
  
  // 提示框
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ccc',
    borderWidth: 1,
    textStyle: {
      color: '#333'
    }
  },
  
  // 坐标轴
  categoryAxis: {
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    axisLabel: {
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: ['#e0e0e0']
      }
    }
  },
  
  valueAxis: {
    axisLine: {
      lineStyle: {
        color: '#ccc'
      }
    },
    axisLabel: {
      color: '#666'
    },
    splitLine: {
      lineStyle: {
        color: ['#e0e0e0']
      }
    }
  }
}
```

### 图表样式

```javascript
{
  // 折线图
  line: {
    itemStyle: {
      borderWidth: 1
    },
    lineStyle: {
      width: 2
    },
    symbolSize: 6,
    smooth: false
  },
  
  // 柱状图
  bar: {
    itemStyle: {
      barBorderWidth: 0
    }
  },
  
  // 饼图
  pie: {
    itemStyle: {
      borderWidth: 0,
      borderColor: '#ccc'
    }
  }
}
```

## 字体定制

### 统一字体大小

```javascript
<Chart type="line" :data="data" :font-size="16" />
```

### 分别设置

```javascript
<Chart 
  type="line" 
  :data="data" 
  :font-size="{
    base: 12,
    title: 18,
    legend: 12,
    axisLabel: 11,
    tooltip: 13
  }"
/>
```

### 字体家族

```javascript
const theme = {
  textStyle: {
    fontFamily: '"Microsoft YaHei", "微软雅黑", Arial, sans-serif'
  }
}

<Chart type="bar" :data="data" :theme="theme" />
```

## 颜色方案

### 单色方案

```javascript
const monochromeTheme = {
  color: [
    '#003f5c',
    '#2f4b7c',
    '#665191',
    '#a05195',
    '#d45087',
    '#f95d6a',
    '#ff7c43',
    '#ffa600'
  ]
}
```

### 渐变色

```javascript
const data = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      data: [10, 20, 30],
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#00bcd4' },
            { offset: 1, color: '#2196f3' }
          ]
        }
      }
    }
  ]
}
```

### 品牌色

```javascript
// 科技风
const techColors = ['#00a8ff', '#0097e6', '#273c75', '#353b48']

// 自然风
const natureColors = ['#44bd32', '#4cd137', '#009432', '#006266']

// 暖色调
const warmColors = ['#ff6348', '#ff4757', '#ff6b81', '#ffbe76']

// 冷色调
const coolColors = ['#00d2d3', '#1abc9c', '#0abde3', '#48dbfb']
```

## 响应式主题

### 根据屏幕尺寸

```javascript
const theme = computed(() => {
  const width = window.innerWidth
  
  if (width < 768) {
    return {
      ...themes.light,
      textStyle: { fontSize: 10 },
      title: { textStyle: { fontSize: 14 } }
    }
  } else if (width < 1200) {
    return {
      ...themes.light,
      textStyle: { fontSize: 12 },
      title: { textStyle: { fontSize: 16 } }
    }
  } else {
    return themes.light
  }
})

<Chart type="line" :data="data" :theme="theme" />
```

### 根据系统偏好

```javascript
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

<Chart 
  type="bar" 
  :data="data" 
  :dark-mode="prefersDark" 
/>
```

### 监听系统变化

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

const darkMode = ref(false)

onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  darkMode.value = mediaQuery.matches
  
  const handler = (e) => {
    darkMode.value = e.matches
  }
  
  mediaQuery.addEventListener('change', handler)
  
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handler)
  })
})
```

## 主题切换动画

### 平滑过渡

```css
.ldesign-chart {
  transition: all 0.3s ease;
}
```

### 渐变效果

```javascript
const switchTheme = async (newTheme) => {
  // 淡出
  chartElement.style.opacity = '0'
  
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 切换主题
  chart.setTheme(newTheme)
  
  // 淡入
  chartElement.style.opacity = '1'
}
```

## 完整示例

### 主题切换器

```vue
<template>
  <div class="theme-demo">
    <div class="theme-selector">
      <button 
        v-for="name in themeNames" 
        :key="name"
        :class="{ active: currentTheme === name }"
        @click="currentTheme = name"
      >
        {{ name }}
      </button>
    </div>
    
    <Chart 
      type="line" 
      :data="data" 
      :theme="currentTheme"
      :font-size="fontSize"
    />
    
    <div class="font-controls">
      <button @click="decreaseFontSize">-</button>
      <span>{{ fontSize }}px</span>
      <button @click="increaseFontSize">+</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Chart, getThemeNames } from '@ldesign/chart/vue'

const themeNames = getThemeNames()
const currentTheme = ref('light')
const fontSize = ref(12)

const data = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr'],
  datasets: [
    { name: 'Sales', data: [100, 200, 150, 300] }
  ]
})

const increaseFontSize = () => {
  fontSize.value = Math.min(fontSize.value + 2, 24)
}

const decreaseFontSize = () => {
  fontSize.value = Math.max(fontSize.value - 2, 8)
}
</script>

<style scoped>
.theme-selector button {
  margin: 0 5px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
}

.theme-selector button.active {
  background: #1890ff;
  color: white;
}
</style>
```

## 最佳实践

1. **统一品牌色**：使用公司品牌色作为主色板
2. **适配暗黑模式**：提供亮色和暗色两套方案
3. **保持对比度**：确保文字和背景有足够对比度
4. **测试多种场景**：在不同背景下测试主题效果
5. **性能考虑**：主题切换时考虑过渡动画

## 主题库

推荐的主题配色方案：

### Material Design

```javascript
{
  color: ['#2196f3', '#4caf50', '#ff9800', '#f44336', '#9c27b0']
}
```

### Ant Design

```javascript
{
  color: ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1']
}
```

### Element Plus

```javascript
{
  color: ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399']
}
```

