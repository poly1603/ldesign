# ldesign-circle-navigation



<!-- Auto Generated Below -->


## Overview

CircleNavigation 圆形导航组件
支持通过 width/height 控制圆的尺寸，默认正上方为第一个元素

## Properties

| Property              | Attribute              | Description                                                  | Type               | Default     |
| --------------------- | ---------------------- | ------------------------------------------------------------ | ------------------ | ----------- |
| `clockwise`           | `clockwise`            | 是否顺时针排布                                                      | `boolean`          | `true`      |
| `ellipseSpacing`      | `ellipse-spacing`      | 椭圆半弧内的间距策略：'arc' 按弧长均分，'angle' 按角度均分（更“均匀”的视觉效果）             | `"angle" \| "arc"` | `'angle'`   |
| `frontAngle`          | `front-angle`          | 视角正前方的角度（度），默认 90° 即底部为“最近”                                  | `number`           | `90`        |
| `height`              | `height`               | 圆形容器高度（不传则等于 width）                                          | `number \| string` | `undefined` |
| `maxScale`            | `max-scale`            |                                                              | `number`           | `1.2`       |
| `minScale`            | `min-scale`            | 透视缩放范围：最小与最大缩放因子                                             | `number`           | `0.8`       |
| `padding`             | `padding`              | 与圆边缘的内边距（px），用于避免项目贴边                                        | `number`           | `8`         |
| `perspective`         | `perspective`          | 是否启用透视（近大远小）效果                                               | `boolean`          | `false`     |
| `perspectiveDistance` | `perspective-distance` | 3D 透视距离（px，对应 CSS perspective），zDepth>0 时生效                  | `number`           | `600`       |
| `perspectiveOrigin`   | `perspective-origin`   | 3D 透视原点（CSS perspective-origin），如 '50% 50%' 'center 80%'     | `string`           | `undefined` |
| `showTrack`           | `show-track`           | 是否显示圆形轨道                                                     | `boolean`          | `true`      |
| `startAngle`          | `start-angle`          | 起始角度（度），默认 -90 表示第一个项在正上方；0 表示第一个项在最右侧                       | `number`           | `-90`       |
| `width`               | `width`                | 圆形容器宽度（数字按 px 处理，亦可传入如 '20rem' / '240px' / '50%'）            | `number \| string` | `240`       |
| `zDepth`              | `z-depth`              | 3D 透视：Z 轴偏移幅度（px）。>0 则开启 translateZ；与 perspectiveDistance 联动 | `number`           | `0`         |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
