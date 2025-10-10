# QR Code 项目交接文档 - 继续实施

**创建时间**: 2025-10-10
**项目进度**: 30% 完成（4/16 功能）
**已用时间**: 约 2.5 小时
**剩余工作**: 约 10 天

---

## 📋 快速概览

**目标**: 实现 Anthony Fu QR Toolkit 的所有功能
**项目路径**: `D:\WorkBench\ldesign\library\qrcode`
**主分支**: `master`

---

## ✅ 已完成功能（4个）

### 1. **Rotate（旋转）** ✓
**文件**:
- `src/types/index.ts` - 行 171: `rotate?: 0 | 90 | 180 | 270`
- `src/renderers/canvas.ts` - 行 58-67: 旋转变换逻辑
- `src/renderers/canvas.ts` - 行 133-136: 恢复状态
- `src/renderers/svg.ts` - 行 71-77: SVG transform

**功能**: 支持 0°/90°/180°/270° 四个角度旋转

---

### 2. **Invert（反色）** ✓
**文件**:
- `src/types/index.ts` - 行 173: `invert?: boolean`
- `src/renderers/canvas.ts` - 行 69-74: 颜色交换
- `src/renderers/svg.ts` - 行 42-47: 颜色交换

**功能**: 一键反转前景色和背景色

---

### 3. **Mask Pattern（掩码模式）** ✓
**新建文件**:
- `src/core/mask-pattern.ts` (430 行) - 完整掩码实现

**修改文件**:
- `src/types/index.ts` - 行 226: `maskPattern?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7`
- `src/core/generator.ts` - 集成掩码应用逻辑

**功能**:
- 8 种标准掩码（0-7）
- Auto 模式（-1）自动选择最佳掩码
- FunctionPatternDetector 识别功能区域
- 掩码质量评估算法
- 自动选择最佳掩码

**关键类/函数**:
```typescript
// src/core/mask-pattern.ts
export const MASK_PATTERNS = { 0-7: (row, col) => boolean }
export class FunctionPatternDetector
export function applyMaskPattern(matrix, maskPattern, moduleCount)
export function evaluateMaskPattern(matrix)
export function findBestMaskPattern(matrix, moduleCount)
```

---

### 4. **Marker Shape System（定位点系统）** ✓ (80% 完成)
**新建文件**:
- `src/renderers/styles/markers.ts` (420 行) - Marker 绘制实现

**修改文件**:
- `src/types/index.ts` - 行 53-93: 新增 MarkerShape 和 MarkerInner 枚举
- `src/types/index.ts` - 行 166-186: 扩展 EyeStyleConfig

**新增枚举**:
```typescript
// 7 种外框形状
export enum MarkerShape {
  Square, Circle, RoundedSquare, Octagon, Leaf, Frame, Extra
}

// 8 种内部形状
export enum MarkerInner {
  Square, Circle, Diamond, Rounded, Petal, Plus, Star, Auto
}
```

**新增 API**:
```typescript
export interface EyeStyleConfig {
  markerShape?: MarkerShape;     // NEW
  markerInner?: MarkerInner;      // NEW
  pixelStyle?: DotStyle;          // NEW

  // Legacy API (向后兼容)
  outer?: { style?, color?, gradient? };
  inner?: { style?, color?, gradient? };
}
```

**待完成**:
- [ ] 集成到 `src/renderers/styles/eyes.ts`
- [ ] 添加 SVG marker 支持
- [ ] 测试所有组合

---

## 📂 项目结构

```
qrcode/
├── src/
│   ├── core/
│   │   ├── generator.ts          ✅ 已更新（支持 maskPattern）
│   │   └── mask-pattern.ts       ✅ 新建（掩码系统）
│   ├── renderers/
│   │   ├── canvas.ts             ✅ 已更新（rotate, invert）
│   │   ├── svg.ts                ✅ 已更新（rotate, invert）
│   │   └── styles/
│   │       ├── dots.ts           ✅ 现有（11种样式）
│   │       ├── eyes.ts           ⏳ 待更新（集成markers）
│   │       └── markers.ts        ✅ 新建（marker绘制）
│   └── types/
│       └── index.ts              ✅ 已更新（所有新类型）
├── ANTFU_COMPARISON.md           ✅ 功能对比分析
├── IMPLEMENTATION_PLAN.md        ✅ 实施计划
└── PROGRESS_REPORT.md            ✅ 进度报告
```

---

## ⏳ 待实施功能（12个）

### 阶段 1：核心功能（剩余 2 个）

#### 5. ⏳ **完成 Marker Shape 集成**
**预计时间**: 30 分钟
**优先级**: ⭐⭐⭐⭐⭐

**任务**:
1. 更新 `src/renderers/styles/eyes.ts`:
   - 导入 `drawMarkerShape`, `drawMarkerInnerShape`
   - 在 `drawEye()` 中添加新 API 支持
   - 保持向后兼容

2. 添加 SVG marker 支持:
   - 创建 SVG path 生成函数
   - 类似 `getDotSVGPath()` 的模式

**示例代码**:
```typescript
// src/renderers/styles/eyes.ts
import { drawMarkerShape, drawMarkerInnerShape } from './markers';

export function drawEye(...) {
  if (eyeConfig.markerShape) {
    // Use new API
    drawMarkerShape(ctx, x, y, size, eyeConfig.markerShape);
    drawMarkerInnerShape(ctx, x, y, size, eyeConfig.markerInner || MarkerInner.Auto);
  } else {
    // Use legacy API (existing code)
    // ...
  }
}
```

---

#### 6. ⏳ **Render Type（分层渲染）**
**预计时间**: 1 天
**优先级**: ⭐⭐⭐⭐

**功能**:
- All: 渲染所有内容
- Function: 只渲染功能模块（定位点、时序、对齐）
- Data: 只渲染数据模块
- Guide: 只渲染引导线
- Marker: 只渲染定位点

**新增类型**:
```typescript
// src/types/index.ts
export enum RenderLayer {
  All = 'all',
  Function = 'function',
  Data = 'data',
  Guide = 'guide',
  Marker = 'marker',
}

export interface QRCodeConfig {
  // ...
  renderLayer?: RenderLayer;
}
```

**实现策略**:
1. 在 `generator.ts` 中添加模块分类方法:
   ```typescript
   isDataModule(row, col): boolean
   isFunctionModule(row, col): boolean
   isTimingPattern(row, col): boolean
   isAlignmentPattern(row, col): boolean
   ```

2. 在 `canvas.ts` 和 `svg.ts` 的渲染循环中:
   ```typescript
   if (this.shouldRenderModule(row, col, renderLayer)) {
     drawDot(...);
   }
   ```

**参考**: `mask-pattern.ts` 的 `FunctionPatternDetector` 可重用

---

### 阶段 2：视觉增强（5 个）

#### 7. ⏳ **Sub Markers（对齐图案）**
**预计时间**: 0.5 天
**优先级**: ⭐⭐⭐⭐

**新增类型**:
```typescript
export enum SubMarkerStyle {
  Square = 'square',
  Circle = 'circle',
  Rounded = 'rounded',
  Cross = 'cross',
  Plus = 'plus',
}

export interface QRCodeStyle {
  subMarkerStyle?: SubMarkerStyle;
}
```

**实现**:
1. 在 `generator.ts` 中识别对齐图案位置
2. 在 `canvas.ts` 中对这些位置应用特殊样式
3. 创建 `drawSubMarker()` 函数

---

#### 8. ⏳ **Margin Noise（边距噪声）**
**预计时间**: 0.5 天
**优先级**: ⭐⭐⭐

**新增类型**:
```typescript
export interface MarginNoiseConfig {
  enabled: boolean;
  density?: number;  // 0-1
  size?: number;     // pixels
  color?: string;
  seed?: number;
}

export interface QRCodeStyle {
  marginNoise?: MarginNoiseConfig;
}
```

**实现**:
1. 创建 `src/utils/noise.ts`
2. 在渲染完成后，在边距区域添加随机点
3. 支持种子以实现可重现性

---

#### 9. ⏳ **Safe Space（安全区域策略）**
**预计时间**: 0.5 天
**优先级**: ⭐⭐⭐

**新增类型**:
```typescript
export enum SafeSpace {
  Full = 'full',        // 标准边距
  Marker = 'marker',    // 只保护定位点
  Minimal = 'minimal',  // 最小边距
  Extreme = 'extreme',  // 极小边距
  None = 'none',        // 无边距
}

export interface QRCodeStyle {
  safeSpace?: SafeSpace;
}
```

**实现**: 在 `generator.ts` 中根据策略动态计算 margin

---

#### 10. ⏳ **Seed（随机种子）**
**预计时间**: 0.5 天
**优先级**: ⭐⭐⭐

**新增类型**:
```typescript
export interface QRCodeConfig {
  seed?: number;
}
```

**实现**:
1. 创建 `src/utils/random.ts` - 伪随机数生成器（PRNG）
2. 在 liquid、marginNoise 等功能中使用 PRNG
3. 确保相同 seed 产生相同结果

**PRNG 示例**:
```typescript
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // LCG algorithm
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}
```

---

#### 11. ⏳ **Transform（透视变换）**
**预计时间**: 1 天
**优先级**: ⭐⭐⭐

**新增类型**:
```typescript
export interface TransformConfig {
  perspectiveX?: number;  // -1 to 1
  perspectiveY?: number;  // -1 to 1
  scale?: number;         // 0-2
}

export interface QRCodeStyle {
  transform?: TransformConfig;
}
```

**实现**:
1. 创建 `src/utils/transform.ts` - 变换矩阵计算
2. Canvas: 使用 `setTransform()`
3. SVG: 使用 `transform` 属性

**透视变换矩阵**:
```typescript
function getPerspectiveMatrix(perspX: number, perspY: number) {
  // 3D 透视投影矩阵
  return [
    1, 0, perspX / 1000,
    0, 1, perspY / 1000,
    0, 0, 1
  ];
}
```

---

### 阶段 3：样式扩展（1 个）

#### 12. ⏳ **新增 3 种 Pixel Style**
**预计时间**: 1 天
**优先级**: ⭐⭐⭐

**新增样式**:
```typescript
export enum DotStyle {
  // ... existing
  HalfCircle = 'half-circle',  // ◐
  Horizontal = 'horizontal',   // ⚊
  Vertical = 'vertical',       // ⚋
}
```

**实现**: 在 `src/renderers/styles/dots.ts` 中添加绘制函数

**Half-Circle**:
```typescript
function drawHalfCircle(ctx, x, y, size) {
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const radius = size / 2;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI); // 上半圆
  ctx.closePath();
  ctx.fill();
}
```

---

### 阶段 4：工具功能（4 个）

#### 13-16. ⏳ **Compare / Verify / Camera / Boost ECC**
**预计时间**: 5+ 天
**优先级**: ⭐⭐ (可选)

**说明**: 这些是独立的工具功能，可以在核心功能完成后实施

---

## 🔧 技术要点

### 构建命令
```bash
cd "D:\WorkBench\ldesign\library\qrcode"
npm run build
```

### 示例项目
```bash
cd examples/vite-demo
npm install
npm run dev
```

### 类型系统
- 所有新功能都必须有完整的 TypeScript 类型
- 使用枚举而非字符串字面量
- 保持向后兼容

### 代码规范
- 添加 JSDoc 注释
- 函数命名: `drawXxx`, `getXxx`, `isXxx`
- 文件组织: 功能模块化

---

## 📊 当前构建状态

✅ **所有已实现功能构建通过**
- dist/index.esm.js
- dist/index.cjs.js
- dist/index.umd.js
- dist/vue.*.js
- dist/react.*.js

---

## 🚀 下一步行动

### 立即执行（第一优先级）:
1. ✅ 完成 Marker Shape 集成（30分钟）
2. ⏳ 实现 Render Type（1天）

### 短期计划:
3. ⏳ Sub Markers（0.5天）
4. ⏳ Margin Noise（0.5天）
5. ⏳ Safe Space（0.5天）
6. ⏳ Seed（0.5天）
7. ⏳ Transform（1天）

### 中期计划:
8. ⏳ 新增 3 种样式（1天）

### 长期计划（可选）:
9. ⏳ 工具功能（5天）

---

## 📝 重要提示

1. **向后兼容**: 所有新 API 都应与现有代码兼容
2. **渐进实施**: 每完成一个功能立即构建测试
3. **文档更新**: 及时更新 PROGRESS_REPORT.md
4. **Git 提交**: 每个功能完成后提交

---

## 💡 快速启动指令

在新对话中，您可以直接说：

> "继续实施 Anthony Fu QR Toolkit 的所有功能。当前进度 30%，已完成 Rotate/Invert/Mask Pattern/Marker Shape。请阅读 `PROGRESS_REPORT.md` 和这个交接文档，然后继续实现下一个功能。"

或者更简单：

> "继续实施 QR Code 项目���请先读取 `D:\WorkBench\ldesign\library\qrcode\HANDOVER.md`"

---

**项目路径**: `D:\WorkBench\ldesign\library\qrcode`
**Git 状态**: master 分支，已有多个新文件待提交
**下一个任务**: 完成 Marker Shape 集成（30分钟）
