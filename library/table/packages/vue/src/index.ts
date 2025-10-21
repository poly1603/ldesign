/**
 * @ldesign/table-vue
 * Vue 3表格组件
 */

import type { App } from 'vue';
import LTable from './components/LTable.vue';
import LTableColumn from './components/LTableColumn.vue';

// 导入样式
import '@ldesign/table-styles/src/index.css';

// 导出组件
export { LTable, LTableColumn };

// 导出类型
export type * from '@ldesign/table-core';

// 导出composables
export { useTable } from './composables/useTable';

// 插件安装函数
export function install(app: App) {
  app.component('LTable', LTable);
  app.component('LTableColumn', LTableColumn);
}

// 默认导出
export default {
  install,
};



