import DefaultTheme from 'vitepress/theme';
import ComponentDemo from '../components/ComponentDemo.vue';
import './custom.css';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('ComponentDemo', ComponentDemo);
  },
};