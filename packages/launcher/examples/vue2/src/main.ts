import Vue from 'vue';
import VueCompositionAPI from '@vue/composition-api';
import App from './App.vue';
import './styles/main.scss';

// 启用 Composition API 插件
Vue.use(VueCompositionAPI);

// 全局配置
Vue.config.productionTip = false;

// 创建 Vue 实例
new Vue({
  render: (h) => h(App),
}).$mount('#app');
