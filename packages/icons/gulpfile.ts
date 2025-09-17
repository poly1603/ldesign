import { parallel, series } from 'gulp';

import { reactTask } from './packages/react/gulp';
import { svgTask } from './packages/svg/gulp';
import { vueTask } from './packages/vue/gulp';
import { vueNextTask } from './packages/vue-next/gulp';
import { reactNativeTask } from './packages/react-native/gulp';
import { flutterTask } from './packages/flutter/gulp';

// import { svgSpriteTask } from './resources/svg-sprite/gulp';
// import { iconFontTask } from './resources/icon-font/gulp';

// import { iconViewTask } from './packages/view/gulp';
// import { wcTask } from './packages/web-components/gulp';

const source: string[] = ['svg/*.svg'];

// 优化的并行构建 - 最大化并行度提升速度
export default parallel(
  reactTask(source),
  vueTask(source),
  vueNextTask(source),
  svgTask(source),
  reactNativeTask(),
  // flutterTask(), // 暂时禁用 Flutter，避免依赖问题
  // svgSpriteTask(),
  // iconViewTask(),
  // wcTask(source),
);

// 单独的任务导出
export const buildReact = reactTask(source);
export const buildVue = vueTask(source);
export const buildVueNext = vueNextTask(source);
export const buildSvg = svgTask(source);
export const buildReactNative = reactNativeTask();
export const buildFlutter = flutterTask();

// 快速构建任务（跳过 icon font 生成）
export const buildFast = parallel(
  reactTask(source),
  vueTask(source),
  vueNextTask(source),
  svgTask(source),
  reactNativeTask(),
);
