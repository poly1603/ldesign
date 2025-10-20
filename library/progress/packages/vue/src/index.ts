import { App } from 'vue';
import LinearProgress from './LinearProgress';
import CircleProgress from './CircleProgress';
import PolygonProgress from './PolygonProgress';
import HeartProgress from './HeartProgress';

// 导出所有组件
export { 
  LinearProgress, 
  CircleProgress,
  PolygonProgress,
  HeartProgress,
};

// 导出类型
export * from '@ldesign/progress-core';

// Vue 插件
export default {
  install(app: App) {
    app.component('LdLinearProgress', LinearProgress);
    app.component('LdCircleProgress', CircleProgress);
    app.component('LdPolygonProgress', PolygonProgress);
    app.component('LdHeartProgress', HeartProgress);
  },
};


