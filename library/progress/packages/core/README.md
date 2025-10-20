# @ldesign/progress-core

核心进度条库，框架无关，支持多种进度条类型。

## 安装

```bash
npm install @ldesign/progress-core
```

## 使用

```javascript
import { LinearProgress, CircleProgress } from '@ldesign/progress-core';
import '@ldesign/progress-core/dist/index.css';

// 创建线性进度条
const linearProgress = new LinearProgress('#container', {
  value: 50,
  color: '#409eff',
  showText: true,
});

// 创建圆形进度条
const circleProgress = new CircleProgress('#container', {
  value: 75,
  radius: 60,
  strokeWidth: 8,
});
```

## 支持的进度条类型

- `LinearProgress` - 线性进度条
- `CircleProgress` - 圆形进度条
- `SemiCircleProgress` - 半圆进度条
- `DashboardProgress` - 仪表盘进度
- `StepProgress` - 步骤进度条
- `SegmentProgress` - 分段进度条
- `WaveProgress` - 水波纹进度

查看主项目 README 获取详细文档。


