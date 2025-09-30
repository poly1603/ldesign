# Picker 滚轮选择器

高性能、功能丰富的滚轮选择器组件，提供流畅的交互体验和丰富的自定义选项。

## 基础用法

最简单的用法，传入选项数组即可。

:::demo
```html
<template>
  <ldesign-picker
    :options="options"
    v-model:value="value"
    @change="handleChange"
  ></ldesign-picker>
  <p>当前选中：{{ value }}</p>
</template>

<script setup>
import { ref } from 'vue';

const value = ref('banana');
const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' }
]);

const handleChange = (e) => {
  console.log('选中值变化:', e.detail);
};
</script>
```
:::

## 搜索功能

启用搜索功能，支持实时筛选和键盘快速跳转。

:::demo
```html
<template>
  <ldesign-picker
    searchable
    search-placeholder="搜索水果..."
    highlight-match
    keyboard-quick-jump
    :options="longOptions"
    v-model:value="searchValue"
  ></ldesign-picker>
  <p style="margin-top: 10px;">提示：输入字母快速跳转，如 "a" 跳转到 Apple</p>
</template>

<script setup>
import { ref } from 'vue';

const searchValue = ref('apple');
const longOptions = ref([
  { value: 'apple', label: '🍎 Apple' },
  { value: 'apricot', label: '🍑 Apricot' },
  { value: 'avocado', label: '🥑 Avocado' },
  { value: 'banana', label: '🍌 Banana' },
  { value: 'blueberry', label: '🫐 Blueberry' },
  { value: 'cherry', label: '🍒 Cherry' },
  { value: 'coconut', label: '🥥 Coconut' },
  { value: 'dragon-fruit', label: '🐉 Dragon Fruit' },
  { value: 'durian', label: '👺 Durian' },
  { value: 'grape', label: '🍇 Grape' },
  { value: 'kiwi', label: '🥝 Kiwi' },
  { value: 'lemon', label: '🍋 Lemon' },
  { value: 'mango', label: '🥭 Mango' },
  { value: 'melon', label: '🍈 Melon' },
  { value: 'orange', label: '🍊 Orange' },
  { value: 'peach', label: '🍑 Peach' },
  { value: 'pear', label: '🍐 Pear' },
  { value: 'pineapple', label: '🍍 Pineapple' },
  { value: 'strawberry', label: '🍓 Strawberry' },
  { value: 'watermelon', label: '🍉 Watermelon' }
]);
</script>
```
:::

## 不同尺寸

提供三种尺寸供选择。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>小尺寸</h4>
      <ldesign-picker
        size="small"
        :options="options"
        v-model:value="smallValue"
      ></ldesign-picker>
    </div>
    <div>
      <h4>中尺寸（默认）</h4>
      <ldesign-picker
        size="medium"
        :options="options"
        v-model:value="mediumValue"
      ></ldesign-picker>
    </div>
    <div>
      <h4>大尺寸</h4>
      <ldesign-picker
        size="large"
        :options="options"
        v-model:value="largeValue"
      ></ldesign-picker>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const smallValue = ref('apple');
const mediumValue = ref('banana');
const largeValue = ref('orange');

const options = ref([
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄' },
  { value: 'watermelon', label: '西瓜' }
]);
</script>
```
:::

## 主题定制

支持明暗主题切换和自定义样式。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>浅色主题</h4>
      <ldesign-picker
        theme="light"
        :options="options"
        v-model:value="lightValue"
      ></ldesign-picker>
    </div>
    <div>
      <h4>深色主题</h4>
      <ldesign-picker
        theme="dark"
        :options="options"
        v-model:value="darkValue"
        style="background: #1f2937; border-radius: 8px; padding: 10px;"
      ></ldesign-picker>
    </div>
    <div>
      <h4>自定义颜色</h4>
      <ldesign-picker
        :options="options"
        v-model:value="customValue"
        :style="{
          '--ldesign-picker-active-color': '#10b981',
          '--ldesign-picker-active-bg': 'rgba(16, 185, 129, 0.1)',
          '--ldesign-picker-border': '#10b981'
        }"
      ></ldesign-picker>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const lightValue = ref('apple');
const darkValue = ref('banana');
const customValue = ref('orange');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' }
]);
</script>
```
:::

## 视觉效果

提供 3D 透视效果和渐变遮罩。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>3D 效果</h4>
      <ldesign-picker
        enable3d
        :options="options"
        v-model:value="threeDValue"
      ></ldesign-picker>
    </div>
    <div>
      <h4>渐变遮罩</h4>
      <ldesign-picker
        show-mask
        :options="options"
        v-model:value="maskValue"
      ></ldesign-picker>
    </div>
    <div>
      <h4>全部效果</h4>
      <ldesign-picker
        enable3d
        show-mask
        :options="options"
        v-model:value="allValue"
      ></ldesign-picker>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const threeDValue = ref('apple');
const maskValue = ref('banana');
const allValue = ref('orange');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' },
  { value: 'peach', label: '🍑 桃子' },
  { value: 'pear', label: '🍐 梨' }
]);
</script>
```
:::

## iOS 风格 3D 效果

使用推荐参数实现最接近 iOS 原生的 3D 滚轮效果。

:::demo
```html
<template>
  <div>
    <h4>iOS 风格 3D 选择器</h4>
    <ldesign-picker
      enable-3d
      visible-items="5"
      show-mask
      :options="options"
      v-model:value="iosValue"
      :style="{
        '--ldesign-picker-3d-perspective': '700px',
        '--ldesign-picker-3d-radius': '120px',
        '--ldesign-picker-3d-rotate': '30deg',
        '--ldesign-picker-3d-step-deg': '22deg',
        '--ldesign-picker-3d-scale-min': '0.7',
        '--ldesign-picker-3d-scale-max': '1.12'
      }"
    ></ldesign-picker>
    <div style="margin-top: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">推荐的 iOS 风格参数：</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #666;">
        <li>透视距离: 700px</li>
        <li>圆柱半径: 120px</li>
        <li>最大旋转: 30deg</li>
        <li>步进角度: 22deg</li>
        <li>缩放范围: 0.7 - 1.12</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const iosValue = ref('apple');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' },
  { value: 'peach', label: '🍑 桃子' },
  { value: 'pear', label: '🍐 梨' },
  { value: 'strawberry', label: '🍓 草莓' },
  { value: 'cherry', label: '🍒 樱桃' },
  { value: 'pineapple', label: '🍍 菠萝' }
]);
</script>
```
:::

## 交互增强

支持触觉反馈和音效（移动端效果更佳）。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>触觉反馈</h4>
      <ldesign-picker
        haptic-feedback
        :haptic-intensity="20"
        :options="options"
        v-model:value="hapticValue"
      ></ldesign-picker>
      <p style="font-size: 12px;">移动端有振动反馈</p>
    </div>
    <div>
      <h4>音效反馈</h4>
      <ldesign-picker
        sound-effects
        :sound-volume="0.3"
        :options="options"
        v-model:value="soundValue"
      ></ldesign-picker>
      <p style="font-size: 12px;">滚动时有音效</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const hapticValue = ref('apple');
const soundValue = ref('banana');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' }
]);
</script>
```
:::

## 禁用状态

可以禁用整个组件或特定选项。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>禁用组件</h4>
      <ldesign-picker
        disabled
        :options="options"
        value="banana"
      ></ldesign-picker>
    </div>
    <div>
      <h4>禁用特定选项</h4>
      <ldesign-picker
        :options="optionsWithDisabled"
        v-model:value="partialValue"
      ></ldesign-picker>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const partialValue = ref('apple');

const options = ref([
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' }
]);

const optionsWithDisabled = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉', disabled: true },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄', disabled: true },
  { value: 'watermelon', label: '🍉 西瓜' }
]);
</script>
```
:::

## 自定义物理效果

调整惯性、摩擦和阻力等物理参数。

:::demo
```html
<template>
  <div style="display: flex; gap: 20px;">
    <div>
      <h4>低摩擦（滑得更远）</h4>
      <ldesign-picker
        :friction="0.98"
        :options="options"
        v-model:value="lowFriction"
      ></ldesign-picker>
    </div>
    <div>
      <h4>高摩擦（快速停止）</h4>
      <ldesign-picker
        :friction="0.85"
        :options="options"
        v-model:value="highFriction"
      ></ldesign-picker>
    </div>
    <div>
      <h4>无惯性</h4>
      <ldesign-picker
        :momentum="false"
        :options="options"
        v-model:value="noMomentum"
      ></ldesign-picker>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const lowFriction = ref('apple');
const highFriction = ref('banana');
const noMomentum = ref('orange');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' },
  { value: 'peach', label: '🍑 桃子' },
  { value: 'pear', label: '🍐 梨' },
  { value: 'cherry', label: '🍒 樱桃' }
]);
</script>
```
:::

## 程序控制

通过方法控制选择器的行为。

:::demo
```html
<template>
  <ldesign-picker
    ref="pickerRef"
    :options="options"
    v-model:value="controlValue"
  ></ldesign-picker>
  
  <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
    <button @click="scrollToFirst">滚动到第一项</button>
    <button @click="scrollToLast">滚动到最后一项</button>
    <button @click="scrollToRandom">随机选择</button>
    <button @click="scrollToIndex">滚动到第3项</button>
    <button @click="centerCurrent">居中当前项</button>
  </div>
  <p>当前选中：{{ controlValue }}</p>
</template>

<script setup>
import { ref } from 'vue';

const pickerRef = ref(null);
const controlValue = ref('banana');

const options = ref([
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橙子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'watermelon', label: '🍉 西瓜' },
  { value: 'peach', label: '🍑 桃子' },
  { value: 'pear', label: '🍐 梨' }
]);

const scrollToFirst = async () => {
  await pickerRef.value.scrollToValue('apple', { animate: true });
};

const scrollToLast = async () => {
  await pickerRef.value.scrollToValue('pear', { animate: true });
};

const scrollToRandom = async () => {
  const randomIndex = Math.floor(Math.random() * options.value.length);
  const randomValue = options.value[randomIndex].value;
  await pickerRef.value.scrollToValue(randomValue, { animate: true });
};

const scrollToIndex = async () => {
  await pickerRef.value.scrollToIndex(2, { animate: true });
};

const centerCurrent = async () => {
  await pickerRef.value.centerToCurrent(true);
};
</script>
```
:::

## 多列级联示例

通过组合多个 Picker 实现级联选择。

:::demo
```html
<template>
  <div style="display: flex; gap: 10px;">
    <ldesign-picker
      :options="yearOptions"
      v-model:value="year"
      @change="updateDays"
      size="small"
    ></ldesign-picker>
    
    <ldesign-picker
      :options="monthOptions"
      v-model:value="month"
      @change="updateDays"
      size="small"
    ></ldesign-picker>
    
    <ldesign-picker
      :options="dayOptions"
      v-model:value="day"
      size="small"
    ></ldesign-picker>
  </div>
  
  <p style="margin-top: 10px;">选中日期：{{ year }}-{{ month }}-{{ day }}</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const year = ref('2024');
const month = ref('01');
const day = ref('01');

const yearOptions = ref([
  { value: '2023', label: '2023年' },
  { value: '2024', label: '2024年' },
  { value: '2025', label: '2025年' }
]);

const monthOptions = ref([]);
for (let i = 1; i <= 12; i++) {
  const value = i.toString().padStart(2, '0');
  monthOptions.value.push({ value, label: `${i}月` });
}

const dayOptions = ref([]);

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

const updateDays = () => {
  const daysCount = getDaysInMonth(parseInt(year.value), parseInt(month.value));
  dayOptions.value = [];
  
  for (let i = 1; i <= daysCount; i++) {
    const value = i.toString().padStart(2, '0');
    dayOptions.value.push({ value, label: `${i}日` });
  }
  
  // 如果当前选中的日期超出范围，调整到最后一天
  if (parseInt(day.value) > daysCount) {
    day.value = daysCount.toString().padStart(2, '0');
  }
};

onMounted(() => {
  updateDays();
});
</script>
```
:::

## API

### 属性

| 属性名 | 说明 | 类型 | 默认值 |
|-------|------|------|--------|
| options | 选项列表 | `PickerOption[] \| string` | `[]` |
| value | 当前选中值 | `string` | - |
| defaultValue | 默认值（非受控） | `string` | - |
| disabled | 是否禁用 | `boolean` | `false` |
| size | 尺寸 | `'small' \| 'medium' \| 'large'` | `'medium'` |
| theme | 主题 | `'light' \| 'dark' \| 'auto'` | `'light'` |
| searchable | 是否显示搜索框 | `boolean` | `false` |
| searchPlaceholder | 搜索框占位符 | `string` | `'搜索选项...'` |
| searchIgnoreCase | 搜索时忽略大小写 | `boolean` | `true` |
| searchDebounce | 搜索防抖延迟（ms） | `number` | `300` |
| keyboardQuickJump | 键盘快速跳转 | `boolean` | `true` |
| highlightMatch | 高亮匹配文本 | `boolean` | `true` |
| enable3d | 启用3D效果 | `boolean` | `false` |
| showMask | 显示渐变遮罩 | `boolean` | `false` |
| hapticFeedback | 触觉反馈 | `boolean` | `true` |
| hapticIntensity | 触觉强度（ms） | `number` | `10` |
| soundEffects | 启用音效 | `boolean` | `false` |
| soundVolume | 音效音量 | `number` | `0.3` |
| soundUrl | 自定义音效URL | `string` | - |
| visibleItems | 可见项数 | `number` | `5` |
| panelHeight | 面板高度（px） | `number` | - |
| itemHeight | 项高度（px） | `number` | - |
| friction | 摩擦系数（0-1） | `number` | `0.92` |
| momentum | 启用惯性 | `boolean` | `true` |
| resistance | 边界阻力（0-1） | `number` | `0.35` |
| maxOverscroll | 最大越界距离（px） | `number` | - |
| maxOverscrollRatio | 最大越界比例 | `number` | - |
| dragFollow | 拖拽跟随比例 | `number` | `1` |
| dragSmoothing | 拖拽平滑时间（ms） | `number` | - |
| snapDuration | 吸附动画时长（ms） | `number` | `260` |
| snapDurationWheel | 滚轮吸附时长（ms） | `number` | `150` |

### 事件

| 事件名 | 说明 | 回调参数 |
|-------|------|----------|
| ldesignChange | 选中值变化时触发 | `{ value: string, option?: PickerOption }` |
| ldesignPick | 选择过程中触发 | `{ value: string, option?: PickerOption, context: { trigger: string } }` |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| scrollToValue | 滚动到指定值 | `(value: string, options?: ScrollOptions)` | `Promise<void>` |
| scrollToIndex | 滚动到指定索引 | `(index: number, options?: ScrollOptions)` | `Promise<void>` |
| centerToCurrent | 居中当前值 | `(smooth?: boolean)` | `Promise<void>` |

### 类型定义

```typescript
interface PickerOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface ScrollOptions {
  animate?: boolean;
  silent?: boolean;
  trigger?: 'program' | 'click' | 'scroll' | 'wheel' | 'keyboard' | 'touch';
}
```

### CSS 变量

组件提供了丰富的 CSS 变量用于自定义样式：

```css
:host {
  /* 基础颜色 */
  --ldesign-picker-bg: #fff;
  --ldesign-picker-border: #e5e7eb;
  --ldesign-picker-text: #111827;
  --ldesign-picker-text-secondary: #9ca3af;
  
  /* 激活状态 */
  --ldesign-picker-active-color: #1d4ed8;
  --ldesign-picker-active-bg: rgba(29, 78, 216, 0.08);
  
  /* 搜索框 */
  --ldesign-picker-search-bg: #f9fafb;
  --ldesign-picker-search-border: #e5e7eb;
  
  /* 高亮 */
  --ldesign-picker-highlight-bg: #fef3c7;
  --ldesign-picker-highlight-color: #92400e;
  
  /* 其他 */
  --ldesign-picker-disabled-opacity: 0.6;
  --ldesign-picker-border-radius: 6px;
  --ldesign-picker-transition: 200ms cubic-bezier(0.22,0.61,0.36,1);
  
  /* 遮罩渐变 */
  --ldesign-picker-mask-gradient-top: linear-gradient(to bottom, rgba(255,255,255,0.95), transparent);
  --ldesign-picker-mask-gradient-bottom: linear-gradient(to top, rgba(255,255,255,0.95), transparent);
  
  /* 3D 效果 */
  --ldesign-picker-3d-perspective: 500px;     /* 透视距离 */
  --ldesign-picker-3d-radius: 100px;          /* 圆柱半径 */
  --ldesign-picker-3d-rotate: 25deg;          /* 最大旋转角度 */
  --ldesign-picker-3d-step-deg: 18deg;        /* 每项旋转步进 */
  --ldesign-picker-3d-scale-min: 0.85;        /* 边缘最小缩放 */
  --ldesign-picker-3d-scale-max: 1.05;        /* 中心最大缩放 */
}
```

## 键盘快捷键

| 按键 | 功能 |
|------|------|
| ↑/↓ | 上下移动选择 |
| Home | 跳转到第一项 |
| End | 跳转到最后一项 |
| PageUp | 向上翻页 |
| PageDown | 向下翻页 |
| Enter/Space | 确认选择 |
| Escape | 退出搜索（如果在搜索中） |
| 字母/数字 | 快速跳转到以该字符开头的选项 |

## 无障碍

组件完全支持无障碍访问：

- 完整的 ARIA 属性支持
- 键盘导航支持
- 屏幕阅读器友好
- 高对比度模式支持

## 性能优化

- **节流机制**：拖拽时自动节流，减少重渲染
- **防抖搜索**：搜索输入自动防抖
- **虚拟滚动**：大数据量时自动优化（计划中）
- **GPU 加速**：使用 `transform3d` 提升性能

## 注意事项

1. **移动端体验**：触觉反馈功能需要设备支持 Vibration API
2. **音效**：需要用户交互后才能播放（浏览器限制）
3. **大数据量**：超过 100 个选项建议启用搜索功能
4. **级联选择**：多列级联需要组合多个 Picker 实例