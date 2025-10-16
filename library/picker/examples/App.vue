<template>
  <div class="container">
    <h1>🎯 LDesign Picker 示例</h1>
    
    <!-- 基础用法 -->
    <section class="example-section">
      <h2>基础用法</h2>
      <div class="example-row">
        <div class="example-item">
          <label>简单选择器</label>
          <div ref="basicPicker"></div>
          <div class="value-display">当前值: {{ basicValue }}</div>
        </div>
        
        <div class="example-item">
          <label>Vue组件方式</label>
          <PickerComponent
            v-model="vueValue"
            :options="fruits"
            :searchable="true"
            search-placeholder="搜索水果..."
            @change="handleVueChange"
          />
          <div class="value-display">当前值: {{ vueValue }}</div>
        </div>
      </div>
    </section>

    <!-- 3D效果 -->
    <section class="example-section">
      <h2>3D效果与主题</h2>
      <div class="example-row">
        <div class="example-item">
          <label>3D效果（浅色）</label>
          <PickerComponent
            v-model="value3DLight"
            :options="fruits"
            :enable3d="true"
            theme="light"
            :show-mask="true"
          />
        </div>
        
        <div class="example-item">
          <label>3D效果（深色）</label>
          <PickerComponent
            v-model="value3DDark"
            :options="fruits"
            :enable3d="true"
            theme="dark"
            :show-mask="true"
          />
        </div>
      </div>
    </section>

    <!-- Hook用法 -->
    <section class="example-section">
      <h2>Hook用法</h2>
      <div class="example-row">
        <div class="example-item">
          <label>usePicker Hook</label>
          <div ref="hookContainer"></div>
          <div class="value-display">
            当前值: {{ hookValue }}
            <button @click="setRandomValue" class="btn">随机选择</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 多列联动 -->
    <section class="example-section">
      <h2>多列联动 - 日期选择器</h2>
      <div ref="datePickerContainer" class="multi-picker"></div>
      <div class="value-display">
        选中日期: {{ formatDate }}
        <button @click="setToday" class="btn">今天</button>
      </div>
    </section>

    <!-- 自定义配置 -->
    <section class="example-section">
      <h2>自定义配置</h2>
      <div class="example-row">
        <div class="example-item">
          <label>大尺寸 + 慢动画</label>
          <PickerComponent
            v-model="customValue1"
            :options="fruits.slice(0, 5)"
            :visible-items="7"
            :item-height="44"
            :snap-duration="600"
            :friction="0.95"
          />
        </div>
        
        <div class="example-item">
          <label>小尺寸 + 禁用惯性</label>
          <PickerComponent
            v-model="customValue2"
            :options="fruits.slice(0, 5)"
            :visible-items="3"
            :item-height="28"
            :momentum="false"
            :enable3d="true"
          />
        </div>
      </div>
    </section>

    <!-- React示例 -->
    <section class="example-section">
      <h2>React组件示例</h2>
      <div id="react-root"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Picker } from '../src/index';
import { PickerComponent, usePicker, useMultiPicker } from '../src/vue/index';
import type { PickerOption } from '../src/index';

// 示例数据
const fruits: PickerOption[] = [
  { value: 'apple', label: '🍎 苹果' },
  { value: 'banana', label: '🍌 香蕉' },
  { value: 'orange', label: '🍊 橘子' },
  { value: 'grape', label: '🍇 葡萄' },
  { value: 'strawberry', label: '🍓 草莓' },
  { value: 'watermelon', label: '🍉 西瓜' },
  { value: 'peach', label: '🍑 桃子' },
  { value: 'cherry', label: '🍒 樱桃' },
  { value: 'pineapple', label: '🍍 菠萝' },
  { value: 'mango', label: '🥭 芒果' }
];

// 基础用法
const basicPicker = ref<HTMLElement>();
const basicValue = ref('apple');
const vueValue = ref('banana');

// 3D效果
const value3DLight = ref('orange');
const value3DDark = ref('grape');

// 自定义配置
const customValue1 = ref('strawberry');
const customValue2 = ref('banana');

// Hook用法
const hookContainer = ref<HTMLElement>();
const hookPicker = usePicker({
  container: hookContainer,
  options: fruits,
  defaultValue: 'cherry',
  enable3d: true
});
const hookValue = computed(() => hookPicker.currentOption.value?.label || '-');

const setRandomValue = () => {
  const randomIndex = Math.floor(Math.random() * fruits.length);
  hookPicker.setValue(fruits[randomIndex].value);
};

// 多列联动 - 日期
const datePickerContainer = ref<HTMLElement>();
const currentDate = new Date();

const generateYears = () => {
  const years: PickerOption[] = [];
  for (let i = 2020; i <= 2030; i++) {
    years.push({ value: i, label: `${i}年` });
  }
  return years;
};

const generateMonths = () => {
  const months: PickerOption[] = [];
  for (let i = 1; i <= 12; i++) {
    months.push({ value: i, label: `${i}月` });
  }
  return months;
};

const generateDays = (year: number, month: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const days: PickerOption[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ value: i, label: `${i}日` });
  }
  return days;
};

const datePicker = useMultiPicker({
  container: datePickerContainer,
  columns: [
    {
      key: 'year',
      options: generateYears(),
      value: currentDate.getFullYear()
    },
    {
      key: 'month', 
      options: generateMonths(),
      value: currentDate.getMonth() + 1
    },
    {
      key: 'day',
      options: generateDays(currentDate.getFullYear(), currentDate.getMonth() + 1),
      value: currentDate.getDate()
    }
  ],
  onChange: (values) => {
    if (values.year && values.month) {
      const days = generateDays(values.year as number, values.month as number);
      datePicker.setColumnOptions('day', days);
      
      // 如果当前日期超出范围，设置为最后一天
      const currentDay = values.day as number;
      if (currentDay > days.length) {
        datePicker.setColumnValue('day', days.length);
      }
    }
  }
});

const formatDate = computed(() => {
  const { year, month, day } = datePicker.values.value;
  return year && month && day ? `${year}年${month}月${day}日` : '-';
});

const setToday = () => {
  const today = new Date();
  datePicker.setColumnValue('year', today.getFullYear());
  datePicker.setColumnValue('month', today.getMonth() + 1);
  datePicker.setColumnValue('day', today.getDate());
};

// 事件处理
const handleVueChange = (value: string | number | undefined, option?: PickerOption) => {
  console.log('Vue组件值变化:', value, option);
};

// 生命周期
onMounted(() => {
  // 初始化原生Picker
  if (basicPicker.value) {
    new Picker(basicPicker.value, {
      options: fruits,
      defaultValue: 'apple',
      onChange: (value, option) => {
        basicValue.value = option?.label || String(value) || '-';
      }
    });
  }

  // 初始化React示例
  initReactExample();
});

// React示例初始化
async function initReactExample() {
  // 动态导入React相关
  const React = await import('react');
  const ReactDOM = await import('react-dom/client');
  const { PickerComponent: ReactPicker } = await import('../src/react/index');
  
  const ReactApp = () => {
    const [value, setValue] = React.useState('apple');
    
    return React.createElement('div', { className: 'example-item' },
      React.createElement('label', null, 'React组件'),
      React.createElement(ReactPicker, {
        value,
        options: fruits,
        searchable: true,
        enable3d: true,
        onChange: (val: string | number | undefined) => {
          setValue(val as string);
          console.log('React组件值变化:', val);
        }
      }),
      React.createElement('div', { className: 'value-display' },
        `当前值: ${fruits.find(f => f.value === value)?.label || '-'}`
      )
    );
  };
  
  const root = ReactDOM.createRoot(document.getElementById('react-root')!);
  root.render(React.createElement(ReactApp));
}
</script>