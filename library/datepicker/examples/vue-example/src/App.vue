<template>
  <div class="container">
    <h1>🗓️ LDesign DatePicker</h1>
    <p class="subtitle">Vue 3 完整功能演示 - 所有选择模式、高级特性、国际化</p>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button class="btn" @click="toggleTheme">
        {{ theme === 'light' ? '🌙' : '☀️' }} {{ theme === 'light' ? '暗色主题' : '亮色主题' }}
      </button>
      <button 
        v-for="lang in languages" 
        :key="lang.value"
        class="btn" 
        :class="{ active: currentLang === lang.value }"
        @click="switchLanguage(lang.value)"
      >
        {{ lang.label }}
      </button>
    </div>
    
    <div class="grid">
      <!-- 1. 基础日期选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📅 基础日期选择</span>
        </h3>
        <p class="description">最常用的单个日期选择模式，支持年月日选择</p>
        <DatePicker 
          v-model="values.date" 
          type="date" 
          :locale="locale"
          placeholder="请选择日期"
          @change="handleChange('date', $event)"
        />
        <div class="output">
          <div class="output-label">选中值：</div>
          {{ formatOutput(values.date) }}
        </div>
      </div>
      
      <!-- 2. 日期范围 -->
      <div class="card">
        <h3 class="card-title">
          <span>📆 日期范围选择</span>
        </h3>
        <p class="description">选择开始日期和结束日期，适用于筛选时间段</p>
        <DatePicker 
          v-model="values.daterange" 
          type="daterange"
          :locale="locale"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          range-separator="→"
        />
        <div class="output">
          <div class="output-label">选中范围：</div>
          {{ formatRangeOutput(values.daterange) }}
        </div>
      </div>
      
      <!-- 3. 月份选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📊 月份选择</span>
        </h3>
        <p class="description">按月份粒度选择，用于月度统计等场景</p>
        <DatePicker 
          v-model="values.month" 
          type="month"
          :locale="locale"
          placeholder="选择月份"
        />
        <div class="output">
          <div class="output-label">选中月份：</div>
          {{ formatMonthOutput(values.month) }}
        </div>
      </div>
      
      <!-- 4. 年份选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📈 年份选择</span>
        </h3>
        <p class="description">按年份粒度选择，用于年度数据等场景</p>
        <DatePicker 
          v-model="values.year" 
          type="year"
          :locale="locale"
          placeholder="选择年份"
        />
        <div class="output">
          <div class="output-label">选中年份：</div>
          {{ formatYearOutput(values.year) }}
        </div>
      </div>
      
      <!-- 5. 日期时间 -->
      <div class="card">
        <h3 class="card-title">
          <span>⏰ 日期时间选择</span>
        </h3>
        <p class="description">同时选择日期和具体时间（时:分:秒）</p>
        <DatePicker 
          v-model="values.datetime" 
          type="datetime"
          :locale="locale"
          placeholder="选择日期时间"
        />
        <div class="output">
          <div class="output-label">选中时间：</div>
          {{ formatDatetimeOutput(values.datetime) }}
        </div>
      </div>
      
      <!-- 6. 时间选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>🕐 时间选择</span>
        </h3>
        <p class="description">仅选择时间，不包含日期部分</p>
        <DatePicker 
          v-model="values.time" 
          type="time"
          :locale="locale"
          placeholder="选择时间"
        />
        <div class="output">
          <div class="output-label">选中时间：</div>
          {{ formatTimeOutput(values.time) }}
        </div>
      </div>
      
      <!-- 7. 禁用日期 -->
      <div class="card">
        <h3 class="card-title">
          <span>🚫 禁用日期</span>
          <span class="feature-badge">高级</span>
        </h3>
        <p class="description">禁用周末和过去的日期，只允许选择未来的工作日</p>
        <DatePicker 
          v-model="values.disabled" 
          type="date"
          :locale="locale"
          :disabled-date="disabledDate"
          placeholder="只能选择未来工作日"
        />
        <div class="output">
          <div class="output-label">禁用规则：</div>
          ✓ 周末被禁用<br>
          ✓ 过去的日期被禁用
        </div>
      </div>
      
      <!-- 8. 快捷选项 -->
      <div class="card">
        <h3 class="card-title">
          <span>⚡ 快捷选项</span>
          <span class="feature-badge">高级</span>
        </h3>
        <p class="description">预设常用的日期范围，快速选择</p>
        <DatePicker 
          v-model="values.shortcuts" 
          type="daterange"
          :locale="locale"
          :shortcuts="shortcuts"
          start-placeholder="开始"
          end-placeholder="结束"
        />
        <div class="output">
          <div class="output-label">可用快捷选项：</div>
          今天、最近7天、最近30天、本月、上月
        </div>
      </div>
      
      <!-- 9. 自定义格式 -->
      <div class="card">
        <h3 class="card-title">
          <span>🎨 自定义格式</span>
          <span class="feature-badge">定制</span>
        </h3>
        <p class="description">自定义日期显示格式</p>
        <DatePicker 
          v-model="values.format" 
          type="date"
          :locale="locale"
          format="YYYY年MM月DD日"
          placeholder="自定义格式"
        />
        <div class="output">
          <div class="output-label">格式：</div>
          YYYY年MM月DD日
        </div>
      </div>
      
      <!-- 10. 清空功能 -->
      <div class="card">
        <h3 class="card-title">
          <span>🗑️ 可清空</span>
        </h3>
        <p class="description">显示清空按钮，快速清除选择</p>
        <DatePicker 
          v-model="values.clearable" 
          type="date"
          :locale="locale"
          clearable
          placeholder="可清空"
          @clear="handleClear"
        />
        <div class="output">
          <div class="output-label">选中值：</div>
          {{ formatOutput(values.clearable) }}
        </div>
      </div>
      
      <!-- 11. 月份范围 -->
      <div class="card">
        <h3 class="card-title">
          <span>📅 月份范围</span>
        </h3>
        <p class="description">选择月份范围，用于季度统计等</p>
        <DatePicker 
          v-model="values.monthrange" 
          type="monthrange"
          :locale="locale"
          start-placeholder="开始月份"
          end-placeholder="结束月份"
        />
        <div class="output">
          <div class="output-label">选中范围：</div>
          {{ formatMonthRangeOutput(values.monthrange) }}
        </div>
      </div>
      
      <!-- 12. 年份范围 -->
      <div class="card">
        <h3 class="card-title">
          <span>📊 年份范围</span>
        </h3>
        <p class="description">选择年份范围，用于跨年统计</p>
        <DatePicker 
          v-model="values.yearrange" 
          type="yearrange"
          :locale="locale"
          start-placeholder="开始年份"
          end-placeholder="结束年份"
        />
        <div class="output">
          <div class="output-label">选中范围：</div>
          {{ formatYearRangeOutput(values.yearrange) }}
        </div>
      </div>
      
      <!-- 13. 日期时间范围 -->
      <div class="card">
        <h3 class="card-title">
          <span>⏰ 日期时间范围</span>
          <span class="feature-badge">双面板+时间</span>
        </h3>
        <p class="description">选择带时间的日期范围，适用于精确时间段筛选</p>
        <DatePicker 
          v-model="values.datetimerange" 
          type="datetimerange"
          :locale="locale"
          start-placeholder="开始日期时间"
          end-placeholder="结束日期时间"
        />
        <div class="output">
          <div class="output-label">选中范围：</div>
          {{ formatDatetimeRangeOutput(values.datetimerange) }}
        </div>
      </div>
      
      <!-- 14. 星期选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📅 星期选择</span>
          <span class="feature-badge">整周</span>
        </h3>
        <p class="description">按周选择日期，自动选择整周（周一到周日）</p>
        <DatePicker 
          v-model="values.week" 
          type="week"
          :locale="locale"
          placeholder="选择星期"
        />
        <div class="output">
          <div class="output-label">选中周：</div>
          {{ formatWeekOutput(values.week) }}
        </div>
      </div>
      
      <!-- 15. 季度选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📊 季度选择</span>
          <span class="feature-badge">季度</span>
        </h3>
        <p class="description">按季度选择，用于季度报表和统计</p>
        <DatePicker 
          v-model="values.quarter" 
          type="quarter"
          :locale="locale"
          placeholder="选择季度"
        />
        <div class="output">
          <div class="output-label">选中季度：</div>
          {{ formatQuarterOutput(values.quarter) }}
        </div>
      </div>
      
      <!-- 16. 多个日期选择 -->
      <div class="card">
        <h3 class="card-title">
          <span>📅 多个日期选择</span>
          <span class="feature-badge">多选</span>
        </h3>
        <p class="description">可以选择多个不连续的日期，适用于批量操作</p>
        <DatePicker 
          v-model="values.dates" 
          type="dates"
          :locale="locale"
          placeholder="选择多个日期"
        />
        <div class="output">
          <div class="output-label">选中日期：</div>
          {{ formatDatesOutput(values.dates) }}
        </div>
      </div>
    </div>
    
    <!-- 事件日志 -->
    <div class="card" style="margin-top: 30px;">
      <h3 class="card-title">📋 事件日志（最近10条）</h3>
      <div class="output" style="max-height: 200px; overflow-y: auto;">
        <div v-for="(log, index) in eventLogs" :key="index" style="margin-bottom: 5px;">
          <span style="color: #999;">{{ log.time }}</span> - 
          <span style="color: #667eea;">{{ log.type }}</span>: 
          {{ log.message }}
        </div>
        <div v-if="eventLogs.length === 0" style="color: #999;">
          暂无事件记录
        </div>
      </div>
    </div>
    
    <!-- 功能特性 -->
    <div class="card" style="margin-top: 30px;">
      <h3 class="card-title">✨ 核心特性</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
        <div>
          <h4 style="color: #667eea; margin-bottom: 10px;">🎯 选择模式</h4>
          <ul style="line-height: 2; color: #666;">
            <li>✓ 16 种选择模式</li>
            <li>✓ 单选/多选/范围</li>
            <li>✓ 日期/时间/年月/周/季度</li>
            <li>✓ 灵活组合</li>
          </ul>
        </div>
        <div>
          <h4 style="color: #667eea; margin-bottom: 10px;">🎨 主题定制</h4>
          <ul style="line-height: 2; color: #666;">
            <li>✓ CSS Variables</li>
            <li>✓ 亮色/暗色主题</li>
            <li>✓ 自定义颜色</li>
            <li>✓ 响应式设计</li>
          </ul>
        </div>
        <div>
          <h4 style="color: #667eea; margin-bottom: 10px;">🌍 国际化</h4>
          <ul style="line-height: 2; color: #666;">
            <li>✓ 6+ 语言包</li>
            <li>✓ 自定义语言</li>
            <li>✓ 本地化格式</li>
            <li>✓ 动态切换</li>
          </ul>
        </div>
        <div>
          <h4 style="color: #667eea; margin-bottom: 10px;">🚀 性能优秀</h4>
          <ul style="line-height: 2; color: #666;">
            <li>✓ 虚拟滚动</li>
            <li>✓ 懒加载</li>
            <li>✓ Tree-shaking</li>
            <li>✓ < 30KB gzip</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';
import { zhCN, enUS, jaJP, createShortcuts } from '@ldesign/datepicker-shared';

// 主题
const theme = ref('light');

// 语言
const currentLang = ref('zh-CN');
const languages = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '日本語', value: 'ja-JP' },
];

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP,
};

const locale = computed(() => locales[currentLang.value]);

// 所有选择器的值
const values = ref({
  date: null,
  daterange: [null, null],
  month: null,
  year: null,
  datetime: null,
  time: null,
  disabled: null,
  shortcuts: [null, null],
  format: null,
  clearable: null,
  monthrange: [null, null],
  yearrange: [null, null],
  datetimerange: [null, null],
  week: null,
  quarter: null,
  dates: [],
});

// 事件日志
const eventLogs = ref([]);

// 快捷选项
const shortcutsPresets = createShortcuts();
const shortcuts = [
  shortcutsPresets.today,
  shortcutsPresets.last7Days,
  shortcutsPresets.last30Days,
  shortcutsPresets.thisMonth,
  shortcutsPresets.lastMonth,
];

// 禁用日期函数
const disabledDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // 禁用过去的日期
  if (date < today) return true;
  
  // 禁用周末
  const day = date.getDay();
  return day === 0 || day === 6;
};

// 主题切换
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme.value);
  addLog('主题切换', `切换到${theme.value === 'light' ? '亮色' : '暗色'}主题`);
};

// 语言切换
const switchLanguage = (lang) => {
  currentLang.value = lang;
  addLog('语言切换', `切换到${languages.find(l => l.value === lang)?.label}`);
};

// 格式化输出
const formatOutput = (value) => {
  return value ? value.toLocaleDateString() : '未选择';
};

const formatRangeOutput = (value) => {
  if (!value || !Array.isArray(value)) return '未选择';
  const [start, end] = value;
  return `${start ? start.toLocaleDateString() : ''} 至 ${end ? end.toLocaleDateString() : ''}`;
};

const formatMonthOutput = (value) => {
  return value ? `${value.getFullYear()}年${value.getMonth() + 1}月` : '未选择';
};

const formatYearOutput = (value) => {
  return value ? `${value.getFullYear()}年` : '未选择';
};

const formatDatetimeOutput = (value) => {
  return value ? value.toLocaleString() : '未选择';
};

const formatTimeOutput = (value) => {
  return value ? value.toLocaleTimeString() : '未选择';
};

const formatMonthRangeOutput = (value) => {
  if (!value || !Array.isArray(value)) return '未选择';
  const [start, end] = value;
  return `${start ? formatMonthOutput(start) : ''} 至 ${end ? formatMonthOutput(end) : ''}`;
};

const formatYearRangeOutput = (value) => {
  if (!value || !Array.isArray(value)) return '未选择';
  const [start, end] = value;
  return `${start ? formatYearOutput(start) : ''} 至 ${end ? formatYearOutput(end) : ''}`;
};

const formatDatetimeRangeOutput = (value) => {
  if (!value || !Array.isArray(value)) return '未选择';
  const [start, end] = value;
  return `${start ? start.toLocaleString() : ''} 至 ${end ? end.toLocaleString() : ''}`;
};

const formatWeekOutput = (value) => {
  if (!value) return '未选择';
  const weekNumber = getWeekNumber(value);
  return `${value.getFullYear()}年 第${weekNumber}周`;
};

const formatQuarterOutput = (value) => {
  if (!value) return '未选择';
  const quarter = Math.floor(value.getMonth() / 3) + 1;
  return `${value.getFullYear()}年 Q${quarter}`;
};

const formatDatesOutput = (value) => {
  if (!value || !Array.isArray(value) || value.length === 0) return '未选择';
  if (value.length === 1) return value[0].toLocaleDateString();
  return `已选择 ${value.length} 个日期`;
};

// 获取周数
const getWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
};

// 添加日志
const addLog = (type, message) => {
  const now = new Date();
  const time = now.toLocaleTimeString();
  eventLogs.value.unshift({ time, type, message });
  if (eventLogs.value.length > 10) {
    eventLogs.value.pop();
  }
};

// 事件处理
const handleChange = (type, value) => {
  addLog('change', `${type}: ${JSON.stringify(value)}`);
};

const handleClear = () => {
  addLog('clear', '清空选择');
};
</script>




