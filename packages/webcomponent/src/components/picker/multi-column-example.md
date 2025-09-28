# 多列级联选择器扩展示例

虽然当前的 `ldesign-picker` 组件是单列选择器，但可以通过组合多个实例来创建多列级联选择器。

## 示例：日期时间选择器

```html
<div class="datetime-picker">
  <ldesign-picker
    id="year-picker"
    options='[{"value":"2023","label":"2023年"},{"value":"2024","label":"2024年"},{"value":"2025","label":"2025年"}]'
    value="2024"
  ></ldesign-picker>
  
  <ldesign-picker
    id="month-picker"
    options='[{"value":"01","label":"1月"},{"value":"02","label":"2月"},{"value":"03","label":"3月"},{"value":"04","label":"4月"},{"value":"05","label":"5月"},{"value":"06","label":"6月"},{"value":"07","label":"7月"},{"value":"08","label":"8月"},{"value":"09","label":"9月"},{"value":"10","label":"10月"},{"value":"11","label":"11月"},{"value":"12","label":"12月"}]'
    value="01"
  ></ldesign-picker>
  
  <ldesign-picker
    id="day-picker"
    options='[]'
  ></ldesign-picker>
</div>

<style>
  .datetime-picker {
    display: flex;
    gap: 8px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .datetime-picker ldesign-picker {
    flex: 1;
  }
</style>

<script>
  const yearPicker = document.getElementById('year-picker');
  const monthPicker = document.getElementById('month-picker');
  const dayPicker = document.getElementById('day-picker');
  
  // 获取某月的天数
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }
  
  // 更新日期选项
  function updateDays() {
    const year = parseInt(yearPicker.value);
    const month = parseInt(monthPicker.value);
    const daysCount = getDaysInMonth(year, month);
    
    const dayOptions = [];
    for (let i = 1; i <= daysCount; i++) {
      const day = i.toString().padStart(2, '0');
      dayOptions.push({
        value: day,
        label: `${i}日`
      });
    }
    
    dayPicker.options = dayOptions;
    
    // 如果当前选中的日期超出范围，调整到最后一天
    if (parseInt(dayPicker.value) > daysCount) {
      dayPicker.value = daysCount.toString().padStart(2, '0');
    }
  }
  
  // 监听年份和月份变化
  yearPicker.addEventListener('ldesignChange', updateDays);
  monthPicker.addEventListener('ldesignChange', updateDays);
  
  // 初始化
  updateDays();
</script>
```

## 示例：省市区级联选择器

```html
<div class="region-picker">
  <ldesign-picker
    id="province-picker"
    searchable
    search-placeholder="搜索省份..."
    options='[{"value":"beijing","label":"北京市"},{"value":"shanghai","label":"上海市"},{"value":"guangdong","label":"广东省"},{"value":"zhejiang","label":"浙江省"}]'
  ></ldesign-picker>
  
  <ldesign-picker
    id="city-picker"
    searchable
    search-placeholder="搜索城市..."
    options='[]'
  ></ldesign-picker>
  
  <ldesign-picker
    id="district-picker"
    searchable
    search-placeholder="搜索区县..."
    options='[]'
  ></ldesign-picker>
</div>

<script>
  const provincePicker = document.getElementById('province-picker');
  const cityPicker = document.getElementById('city-picker');
  const districtPicker = document.getElementById('district-picker');
  
  // 模拟城市数据
  const cityData = {
    beijing: [
      { value: 'dongcheng', label: '东城区' },
      { value: 'xicheng', label: '西城区' },
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'haidian', label: '海淀区' }
    ],
    shanghai: [
      { value: 'huangpu', label: '黄浦区' },
      { value: 'xuhui', label: '徐汇区' },
      { value: 'changning', label: '长宁区' },
      { value: 'jingan', label: '静安区' }
    ],
    guangdong: [
      { value: 'guangzhou', label: '广州市' },
      { value: 'shenzhen', label: '深圳市' },
      { value: 'dongguan', label: '东莞市' },
      { value: 'foshan', label: '佛山市' }
    ],
    zhejiang: [
      { value: 'hangzhou', label: '杭州市' },
      { value: 'ningbo', label: '宁波市' },
      { value: 'wenzhou', label: '温州市' },
      { value: 'jiaxing', label: '嘉兴市' }
    ]
  };
  
  // 模拟区县数据
  const districtData = {
    guangzhou: [
      { value: 'tianhe', label: '天河区' },
      { value: 'yuexiu', label: '越秀区' },
      { value: 'haizhu', label: '海珠区' },
      { value: 'liwan', label: '荔湾区' }
    ],
    shenzhen: [
      { value: 'nanshan', label: '南山区' },
      { value: 'futian', label: '福田区' },
      { value: 'luohu', label: '罗湖区' },
      { value: 'baoan', label: '宝安区' }
    ],
    hangzhou: [
      { value: 'xihu', label: '西湖区' },
      { value: 'gongshu', label: '拱墅区' },
      { value: 'shangcheng', label: '上城区' },
      { value: 'xiacheng', label: '下城区' }
    ],
    // ... 更多区县数据
  };
  
  // 省份变化时更新城市
  provincePicker.addEventListener('ldesignChange', (e) => {
    const province = e.detail.value;
    const cities = cityData[province] || [];
    cityPicker.options = cities;
    cityPicker.value = cities[0]?.value || '';
    
    // 清空区县
    districtPicker.options = [];
    districtPicker.value = '';
  });
  
  // 城市变化时更新区县
  cityPicker.addEventListener('ldesignChange', (e) => {
    const city = e.detail.value;
    const districts = districtData[city] || [];
    districtPicker.options = districts;
    districtPicker.value = districts[0]?.value || '';
  });
</script>
```

## 示例：时间选择器（时:分:秒）

```html
<div class="time-picker">
  <ldesign-picker
    id="hour-picker"
    size="small"
    visible-items="5"
  ></ldesign-picker>
  
  <span class="separator">:</span>
  
  <ldesign-picker
    id="minute-picker"
    size="small"
    visible-items="5"
  ></ldesign-picker>
  
  <span class="separator">:</span>
  
  <ldesign-picker
    id="second-picker"
    size="small"
    visible-items="5"
  ></ldesign-picker>
</div>

<style>
  .time-picker {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 16px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }
  
  .time-picker .separator {
    font-size: 20px;
    font-weight: bold;
    color: #6b7280;
  }
</style>

<script>
  const hourPicker = document.getElementById('hour-picker');
  const minutePicker = document.getElementById('minute-picker');
  const secondPicker = document.getElementById('second-picker');
  
  // 生成时间选项
  function generateTimeOptions(max, unit) {
    const options = [];
    for (let i = 0; i < max; i++) {
      const value = i.toString().padStart(2, '0');
      options.push({
        value: value,
        label: value + unit
      });
    }
    return options;
  }
  
  // 初始化选项
  hourPicker.options = generateTimeOptions(24, '时');
  minutePicker.options = generateTimeOptions(60, '分');
  secondPicker.options = generateTimeOptions(60, '秒');
  
  // 设置当前时间
  const now = new Date();
  hourPicker.value = now.getHours().toString().padStart(2, '0');
  minutePicker.value = now.getMinutes().toString().padStart(2, '0');
  secondPicker.value = now.getSeconds().toString().padStart(2, '0');
  
  // 获取选中的时间
  function getSelectedTime() {
    return `${hourPicker.value}:${minutePicker.value}:${secondPicker.value}`;
  }
  
  // 监听变化
  [hourPicker, minutePicker, secondPicker].forEach(picker => {
    picker.addEventListener('ldesignChange', () => {
      console.log('Selected time:', getSelectedTime());
    });
  });
</script>
```

## 高级用法：自定义联动逻辑

```javascript
class MultiColumnPicker {
  constructor(container, config) {
    this.container = container;
    this.columns = [];
    this.config = config;
    this.init();
  }
  
  init() {
    // 创建容器
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'multi-column-picker';
    this.container.appendChild(this.wrapper);
    
    // 创建列
    this.config.columns.forEach((column, index) => {
      const picker = document.createElement('ldesign-picker');
      picker.id = `column-${index}`;
      picker.options = column.options;
      picker.value = column.defaultValue;
      
      // 应用列配置
      if (column.searchable) picker.searchable = true;
      if (column.size) picker.size = column.size;
      if (column.theme) picker.theme = column.theme;
      
      // 添加联动监听
      if (column.onChange) {
        picker.addEventListener('ldesignChange', (e) => {
          column.onChange(e.detail.value, index, this);
        });
      }
      
      this.wrapper.appendChild(picker);
      this.columns.push(picker);
    });
    
    // 应用样式
    this.applyStyles();
  }
  
  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .multi-column-picker {
        display: flex;
        gap: ${this.config.gap || '8px'};
        padding: ${this.config.padding || '16px'};
        background: ${this.config.background || '#fff'};
        border-radius: ${this.config.borderRadius || '8px'};
        ${this.config.customStyles || ''}
      }
      
      .multi-column-picker ldesign-picker {
        flex: ${this.config.columnFlex || '1'};
      }
    `;
    document.head.appendChild(style);
  }
  
  // 获取所有列的值
  getValues() {
    return this.columns.map(picker => picker.value);
  }
  
  // 设置列的值
  setColumnValue(index, value) {
    if (this.columns[index]) {
      this.columns[index].value = value;
    }
  }
  
  // 更新列的选项
  updateColumnOptions(index, options) {
    if (this.columns[index]) {
      this.columns[index].options = options;
    }
  }
  
  // 禁用/启用列
  setColumnDisabled(index, disabled) {
    if (this.columns[index]) {
      this.columns[index].disabled = disabled;
    }
  }
  
  // 销毁
  destroy() {
    this.wrapper.remove();
    this.columns = [];
  }
}

// 使用示例
const multiPicker = new MultiColumnPicker(
  document.getElementById('picker-container'),
  {
    columns: [
      {
        options: [/* ... */],
        defaultValue: '1',
        searchable: true,
        onChange: (value, columnIndex, picker) => {
          // 第一列变化时更新第二列
          if (columnIndex === 0) {
            const newOptions = getOptionsForValue(value);
            picker.updateColumnOptions(1, newOptions);
          }
        }
      },
      {
        options: [/* ... */],
        defaultValue: '1'
      },
      {
        options: [/* ... */],
        defaultValue: '1'
      }
    ],
    gap: '12px',
    padding: '20px',
    background: 'linear-gradient(to bottom, #f9fafb, #fff)',
    borderRadius: '12px'
  }
);
```

## 特性说明

### 联动机制
- 通过监听 `ldesignChange` 事件实现列之间的联动
- 支持动态更新选项列表
- 支持条件禁用某些列

### 性能优化
- 使用防抖处理频繁的联动更新
- 懒加载远程数据
- 虚拟滚动（适用于大数据量）

### 可访问性
- 每列都保持独立的键盘导航
- 支持 Tab 键在列之间切换
- 保持完整的 ARIA 属性

### 样式定制
- 支持独立设置每列的样式
- 支持响应式布局
- 支持主题切换

## 未来扩展方向

1. **内置多列支持**：在组件内部实现多列功能
2. **联动配置化**：通过配置文件定义联动关系
3. **数据源抽象**：支持远程数据源、异步加载
4. **更多预设模板**：日期、时间、地区等常用场景
5. **移动端优化**：底部弹出式选择器