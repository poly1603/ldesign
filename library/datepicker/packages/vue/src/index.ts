/**
 * @ldesign/datepicker-vue
 * Vue 3 日期选择器组件
 */

import type { App } from 'vue';
import DatePicker from './components/DatePicker.vue';

// 导出组件
export { DatePicker };

// 导出类型
export type { PickerType, PickerValue, Locale } from '@ldesign/datepicker-shared';

// 导出 composable
export { useDatePicker } from './composables/useDatePicker';

// Vue插件安装
export default {
  install(app: App) {
    app.component('LDatePicker', DatePicker);
    app.component('DatePicker', DatePicker);
  },
};





