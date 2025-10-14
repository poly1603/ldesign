# @ldesign/color 架构文档

## 📁 项目结构

```
packages/color/
├── src/
│   ├── core/                 # 🎯 核心功能模块
│   │   ├── Color.ts          # 基础颜色类
│   │   └── index.ts          # 模块导出
│   │
│   ├── advanced/             # 🚀 高级功能模块
│   │   ├── ColorAdvanced.ts  # 高级颜色类（LAB/XYZ/OKLAB等）
│   │   └── index.ts
│   │
│   ├── animation/            # 🎬 动画系统
│   │   ├── ColorAnimation.ts # 颜色动画、缓动函数
│   │   ├── Easing.ts         # 缓动函数库
│   │   └── index.ts
│   │
│   ├── algorithms/           # 🧮 算法模块
│   │   ├── ColorScheme.ts    # 配色方案生成器
│   │   ├── AIColor.ts        # AI 配色算法
│   │   └── index.ts
│   │
│   ├── visualization/        # 📊 可视化模块
│   │   ├── ColorVisualization.ts # 色轮、光谱、3D空间
│   │   └── index.ts
│   │
│   ├── plugins/              # 🔌 插件系统
│   │   ├── ColorPlugin.ts    # 插件管理器
│   │   ├── built-in/         # 内置插件
│   │   │   ├── CMYK.ts
│   │   │   ├── ColorBlindness.ts
│   │   │   └── GlowBlend.ts
│   │   └── index.ts
│   │
│   ├── utils/                # 🔧 工具函数
│   │   ├── cache.ts          # 缓存系统
│   │   ├── performance.ts    # 性能优化
│   │   ├── validators.ts     # 验证器
│   │   └── index.ts
│   │
│   ├── types/                # 📝 类型定义
│   │   ├── index.ts          # 公共类型
│   │   ├── color.ts          # 颜色相关类型
│   │   └── plugin.ts         # 插件相关类型
│   │
│   └── index.ts              # 主入口文件
│
├── test/                      # 🧪 测试文件
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # 端到端测试
│
├── examples/                  # 📚 示例代码
│   ├── basic/                 # 基础示例
│   ├── advanced/              # 高级示例
│   └── plugins/               # 插件示例
│
├── docs/                      # 📖 文档
│   ├── api/                   # API 文档
│   ├── guides/                # 使用指南
│   └── tutorials/             # 教程
│
├── dist/                      # 📦 构建输出
├── lib/                       # CommonJS 输出
├── es/                        # ES Module 输出
│
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── LICENSE
```

## 🏗️ 模块架构

### 1. 核心层 (Core Layer)

**职责**：提供基础的颜色处理能力

- `Color` 类：基础颜色操作
- 支持 RGB、HSL、HSV 等基础颜色空间
- 颜色格式转换
- 基础颜色操作（加亮、加深、混合等）

```typescript
import { Color } from '@ldesign/color/core';
```

### 2. 高级层 (Advanced Layer)

**职责**：提供专业的颜色处理能力

- `ColorAdvanced` 类：继承自 `Color`
- 支持 LAB、LCH、XYZ、OKLAB、OKLCH 等专业颜色空间
- Delta E 颜色差异计算
- 色彩心理学分析
- 颜色温度检测

```typescript
import { ColorAdvanced } from '@ldesign/color/advanced';
```

### 3. 动画层 (Animation Layer)

**职责**：提供颜色动画能力

- `ColorAnimation` 类：颜色过渡动画
- `Easing` 类：20+ 缓动函数
- 关键帧动画支持
- 贝塞尔曲线

```typescript
import { ColorAnimation, Easing } from '@ldesign/color/animation';
```

### 4. 算法层 (Algorithms Layer)

**职责**：提供配色算法

- `ColorSchemeGenerator`：设计系统配色生成
  - Material Design
  - Ant Design
  - Tailwind CSS
  - Bootstrap
- AI 配色建议
- 色彩和谐算法

```typescript
import { ColorSchemeGenerator } from '@ldesign/color/algorithms';
```

### 5. 可视化层 (Visualization Layer)

**职责**：生成可视化数据

- 色轮生成
- 光谱生成
- 3D 颜色空间（RGB立方体、HSL圆柱、LAB球体）
- 渐变生成
- SVG/Canvas 数据输出

```typescript
import { ColorVisualization } from '@ldesign/color/visualization';
```

### 6. 插件层 (Plugin Layer)

**职责**：提供扩展能力

- `PluginManager`：插件管理器
- 支持自定义颜色空间
- 支持自定义混合模式
- 支持自定义分析器
- 内置插件：CMYK、色盲模拟等

```typescript
import { PluginManager } from '@ldesign/color/plugins';
```

## 🔄 数据流

```
用户输入
    ↓
[验证层] → 输入验证
    ↓
[核心层] → 基础处理
    ↓
[高级层] → 专业处理（可选）
    ↓
[算法层] → 配色生成（可选）
    ↓
[动画层] → 动画处理（可选）
    ↓
[可视化层] → 可视化输出（可选）
    ↓
[插件层] → 扩展处理（可选）
    ↓
输出结果
```

## 📊 依赖关系

```
┌──────────────┐
│   index.ts   │ ← 主入口
└──────┬───────┘
       │
       ├──→ core/        (独立)
       │
       ├──→ advanced/    (依赖: core)
       │
       ├──→ animation/   (依赖: advanced)
       │
       ├──→ algorithms/  (依赖: advanced)
       │
       ├──→ visualization/ (依赖: advanced)
       │
       ├──→ plugins/     (依赖: core, advanced)
       │
       ├──→ utils/       (独立)
       │
       └──→ types/       (独立)
```

## 🎯 设计原则

1. **模块化**：每个模块独立负责特定功能
2. **渐进式**：可以只使用需要的模块
3. **零依赖**：核心模块无外部依赖
4. **类型安全**：完整的 TypeScript 支持
5. **可扩展**：通过插件系统扩展功能
6. **高性能**：智能缓存和懒加载

## 💡 使用建议

### 基础使用（~10KB）
只需要基础颜色处理时：
```typescript
import { Color } from '@ldesign/color/core';
```

### 专业使用（~25KB）
需要专业颜色空间时：
```typescript
import { ColorAdvanced } from '@ldesign/color/advanced';
```

### 完整使用（~40KB）
需要所有功能时：
```typescript
import { Color, ColorAdvanced, ColorAnimation, ColorSchemeGenerator } from '@ldesign/color';
```

### 按需加载
使用动态导入实现按需加载：
```typescript
// 只在需要时加载高级功能
const { ColorAdvanced } = await import('@ldesign/color/advanced');

// 只在需要时加载动画
const { ColorAnimation } = await import('@ldesign/color/animation');
```

## 🚀 性能优化

1. **Tree Shaking**：未使用的模块会被自动移除
2. **代码分割**：每个模块可独立打包
3. **懒加载**：支持动态导入
4. **缓存策略**：
   - LRU 缓存：频繁计算结果
   - Memoization：纯函数结果
   - WeakMap：对象关联数据
5. **Web Worker**：复杂计算可在 Worker 中执行

## 📈 扩展计划

- [ ] WebAssembly 加速
- [ ] GPU 加速（WebGL）
- [ ] 图像处理（主色提取）
- [ ] 实时协作
- [ ] 云端同步
- [ ] 机器学习集成