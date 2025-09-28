# ldesign-circle-navigation



<!-- Auto Generated Below -->


## Overview

CircleNavigation 圆形导航组件
支持通过 width/height 控制圆的尺寸，默认正上方为第一个元素

## Properties

| Property              | Attribute              | Description                                                  | Type                   | Default     |
| --------------------- | ---------------------- | ------------------------------------------------------------ | ---------------------- | ----------- |
| `clockwise`           | `clockwise`            | 是否顺时针排布                                                      | `boolean`              | `true`      |
| `ellipseAxis`         | `ellipse-axis`         | 椭圆端点轴：auto 根据宽高选择；x 左右为端点；y 上下为端点                            | `"auto" \| "x" \| "y"` | `'auto'`    |
| `ellipseSpacing`      | `ellipse-spacing`      | 椭圆半弧内的间距策略：'arc' 按弧长均分，'angle' 按角度均分（更“均匀”的视觉效果）             | `"angle" \| "arc"`     | `'angle'`   |
| `enableDrag`          | `enable-drag`          | 是否启用拖动旋转                                                     | `boolean`              | `true`      |
| `friction`            | `friction`             | 惯性摩擦系数（0-1，越小惯性越大）                                           | `number`               | `0.95`      |
| `frontAngle`          | `front-angle`          | 视角正前方的角度（度），默认 90° 即底部为“最近”                                  | `number`               | `90`        |
| `height`              | `height`               | 圆形容器高度（不传则等于 width）                                          | `number \| string`     | `undefined` |
| `maxScale`            | `max-scale`            |                                                              | `number`               | `1.2`       |
| `minScale`            | `min-scale`            | 透视缩放范围：最小与最大缩放因子                                             | `number`               | `0.8`       |
| `minVelocity`         | `min-velocity`         | 最小旋转速度（度/帧，低于此速度停止旋转）                                        | `number`               | `0.1`       |
| `momentum`            | `momentum`             | 是否启用惯性/动量效果                                                  | `boolean`              | `true`      |
| `padding`             | `padding`              | 与圆边缘的内边距（px），用于避免项目贴边                                        | `number`               | `8`         |
| `perspective`         | `perspective`          | 是否启用透视（近大远小）效果                                               | `boolean`              | `false`     |
| `perspectiveDistance` | `perspective-distance` | 3D 透视距离（px，对应 CSS perspective），zDepth>0 时生效                  | `number`               | `600`       |
| `perspectiveOrigin`   | `perspective-origin`   | 3D 透视原点（CSS perspective-origin），如 '50% 50%' 'center 80%'     | `string`               | `undefined` |
| `rotateSensitivity`   | `rotate-sensitivity`   | 旋转灵敏度（度/像素）                                                  | `number`               | `0.5`       |
| `showTrack`           | `show-track`           | 是否显示圆形轨道                                                     | `boolean`              | `true`      |
| `snapAngle`           | `snap-angle`           | 吸附角度间隔（度）                                                    | `number`               | `45`        |
| `snapPoints`          | `snap-points`          | 是否启用吸附点                                                      | `boolean`              | `false`     |
| `snapThreshold`       | `snap-threshold`       | 吸附阈值（度，在此范围内会自动吸附）                                           | `number`               | `15`        |
| `startAngle`          | `start-angle`          | 起始角度（度），默认 -90 表示第一个项在正上方；0 表示第一个项在最右侧                       | `number`               | `-90`       |
| `touchRotate`         | `touch-rotate`         | 是否启用触摸手势旋转                                                   | `boolean`              | `true`      |
| `width`               | `width`                | 圆形容器宽度（数字按 px 处理，亦可传入如 '20rem' / '240px' / '50%'）            | `number \| string`     | `240`       |
| `zDepth`              | `z-depth`              | 3D 透视：Z 轴偏移幅度（px）。>0 则开启 translateZ；与 perspectiveDistance 联动 | `number`               | `0`         |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
