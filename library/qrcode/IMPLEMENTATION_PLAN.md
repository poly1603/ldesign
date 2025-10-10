# Anthony Fu QR Toolkit 完整功能实施计划

## 📋 项目概览

**目标**: 实现 Anthony Fu QR Toolkit 的所有功能
**预计总工作量**: 10-15 天
**开始日期**: 2025-10-10

---

## 🎯 阶段 1: 核心功能（3-5 天）

### ✅ 任务 1.1: Mask Pattern（掩码模式）
**优先级**: ⭐⭐⭐⭐⭐
**预计时间**: 1-2 天
**状态**: 🔵 待开始

**功能描述**:
- 支持 8 种 QR Code 标准掩码（0-7）
- Auto 模式自动选择最佳掩码
- 影响黑白点分布模式

**技术实现**:
1. 修改 `src/core/generator.ts`
2. 检查使用的 qrcode 库是否支持 maskPattern
3. 如果不支持，需要切换到支持的库（如 qrcode-generator）
4. 添加 TypeScript 类型定义

**文件修改**:
- `src/types/index.ts` - 添加类型
- `src/core/generator.ts` - 实现掩码逻辑
- `docs/api/types.md` - 更新文档

**测试用例**:
- [ ] 测试所有 8 种掩码模式
- [ ] 测试 Auto 模式
- [ ] 验证不同掩码的视觉差异
- [ ] 扫描测试所有掩码

---

### ✅ 任务 1.2: Marker Shape 系统重构
**优先级**: ⭐⭐⭐⭐⭐
**预计时间**: 1-2 天
**状态**: 🔵 待开始

**功能描述**:
- Marker Shape: 外框形状（方形、圆形、八边形等）
- Marker Inner: 内部形状（方形、圆形、菱形等）
- Marker Pixel: 外框像素样式（独立配置）
- 支持每个定位点独立配置

**技术实现**:
1. 设计新的类型系统
2. 实现 7-8 种 Marker Shape
3. 实现 5-6 种 Marker Inner
4. 重构渲染逻辑

**新增枚举**:
```typescript
export enum MarkerShape {
  Square = 'square',
  Circle = 'circle',
  RoundedSquare = 'rounded-square',
  Octagon = 'octagon',
  Leaf = 'leaf',
  Frame = 'frame',
  Extra = 'extra',
}

export enum MarkerInner {
  Square = 'square',
  Circle = 'circle',
  Diamond = 'diamond',
  Rounded = 'rounded',
  Petal = 'petal',
  Plus = 'plus',
  Star = 'star',
  Auto = 'auto',
}
```

**文件修改**:
- `src/types/index.ts` - 新类型定义
- `src/renderers/styles/markers.ts` - 新建文件，绘制函数
- `src/renderers/canvas.ts` - 渲染定位点
- `src/renderers/svg.ts` - SVG 定位点

**测试用例**:
- [ ] 测试所有 Marker Shape 组合
- [ ] 测试所有 Marker Inner 组合
- [ ] 测试独立配置 3 个定位点
- [ ] 扫描测试

---

### ✅ 任务 1.3: Rotate（旋转功能）
**优先级**: ⭐⭐⭐⭐
**预计时间**: 0.5 天
**状态**: 🔵 待开始

**功能描述**:
- 支持 0°, 90°, 180°, 270° 旋转
- 改变二维码整体视觉方向

**技术实现**:
1. Canvas: 使用 `ctx.rotate()`
2. SVG: 使用 `transform="rotate()"`
3. 在渲染前应用旋转

**文件修改**:
- `src/types/index.ts` - 添加 rotate 选项
- `src/renderers/canvas.ts` - Canvas 旋转
- `src/renderers/svg.ts` - SVG 旋转

**测试用例**:
- [ ] 测试所有 4 个角度
- [ ] 验证定位点位置正确
- [ ] 扫描测试

---

### ✅ 任务 1.4: Render Type（分层渲染）
**优先级**: ⭐⭐⭐⭐
**预计时间**: 1 天
**状态**: 🔵 待开始

**功能描述**:
- All: 渲染所有内容
- Function: 只渲染功能模块
- Data: 只渲染数据模块
- Guide: 只渲染引导线
- Marker: 只渲染定位点

**技术实现**:
1. 识别不同类型的模块
2. 根据 renderLayer 选择性渲染
3. 分离功能模块和数据模块

**文件修改**:
- `src/types/index.ts` - 添加 RenderLayer 枚举
- `src/renderers/canvas.ts` - 分层渲染逻辑
- `src/renderers/svg.ts` - SVG 分层
- `src/core/generator.ts` - 模块分类

**测试用例**:
- [ ] 测试所有 5 种渲染层
- [ ] 验证模块分类正确
- [ ] 组合渲染测试

---

## 🎨 阶段 2: 视觉增强（2-3 天）

### ✅ 任务 2.1: Sub Markers（对齐图案）
**优先级**: ⭐⭐⭐⭐
**预计时间**: 0.5 天
**状态**: 🔵 待开始

**功能描述**:
- 为 QR Code 的对齐图案设置独立样式
- 支持方形、圆形、十字等

**新增枚举**:
```typescript
export enum SubMarkerStyle {
  Square = 'square',
  Circle = 'circle',
  Rounded = 'rounded',
  Cross = 'cross',
  Plus = 'plus',
}
```

**文件修改**:
- `src/types/index.ts`
- `src/renderers/canvas.ts`
- `src/renderers/svg.ts`

---

### ✅ 任务 2.2: Margin Noise（边距噪声）
**优先级**: ⭐⭐⭐
**预计时间**: 0.5 天
**状态**: 🔵 待开始

**功能描述**:
- 在边距区域添加随机噪声
- 可配置密度和尺寸

**新增接口**:
```typescript
export interface MarginNoiseConfig {
  enabled: boolean;
  density?: number;  // 0-1
  size?: number;     // 像素
  color?: string;
  seed?: number;
}
```

**文件修改**:
- `src/types/index.ts`
- `src/renderers/canvas.ts`
- `src/utils/noise.ts` - 新建文件

---

### ✅ 任务 2.3: Safe Space（安全区域策略）
**优先级**: ⭐⭐⭐
**预计时间**: 0.5 天
**状态**: 🔵 待开始

**功能描述**:
- Full: 完整边距
- Marker: 只保护定位点
- Minimal: 最小边距
- Extreme: 极小边距
- None: 无边距

**新增枚举**:
```typescript
export enum SafeSpace {
  Full = 'full',
  Marker = 'marker',
  Minimal = 'minimal',
  Extreme = 'extreme',
  None = 'none',
}
```

**文件修改**:
- `src/types/index.ts`
- `src/core/generator.ts`
- `src/renderers/canvas.ts`

---

### ✅ 任务 2.4: Seed（随机种子）
**优先级**: ⭐⭐⭐
**预计时间**: 0.5 天
**状态**: 🔵 待开始

**功能描述**:
- 控制所有随机效果的种子
- 确保效果可重现

**技术实现**:
1. 实现伪随机数生成器（PRNG）
2. 应用到 liquid、marginNoise 等功能

**文件修改**:
- `src/types/index.ts`
- `src/utils/random.ts` - 新建文件，PRNG 实现
- `src/renderers/styles/dots.ts` - 使用 PRNG

---

### ✅ 任务 2.5: Invert（反色）
**优先级**: ⭐⭐
**预计时间**: 0.25 天
**状态**: 🔵 待开始

**功能描述**:
- 快速反转前景色和背景色
- 一键生成反色版本

**文件修改**:
- `src/types/index.ts`
- `src/core/generator.ts`

---

### ✅ 任务 2.6: Transform（透视变换）
**优先级**: ⭐⭐⭐
**预计时间**: 1 天
**状态**: 🔵 待开始

**功能描述**:
- Perspective X/Y: 透视变换
- Scale: 整体缩放

**新增接口**:
```typescript
export interface TransformConfig {
  perspectiveX?: number;  // -1 to 1
  perspectiveY?: number;  // -1 to 1
  scale?: number;         // 0-2
}
```

**技术实现**:
1. Canvas: 使用 `setTransform()`
2. SVG: 使用 `transform` 属性
3. 透视变换矩阵计算

**文件修改**:
- `src/types/index.ts`
- `src/renderers/canvas.ts`
- `src/renderers/svg.ts`
- `src/utils/transform.ts` - 新建文件

---

## 🔷 阶段 3: 样式扩展（1 天）

### ✅ 任务 3.1: 新增 3 种 Pixel Style
**优先级**: ⭐⭐⭐
**预计时间**: 1 天
**状态**: 🔵 待开始

**新增样式**:
1. **Half-Circle** (半圆形 ◐)
2. **Horizontal** (横线 ⚊)
3. **Vertical** (竖线 ⚋)

**文件修改**:
- `src/types/index.ts` - 添加枚举
- `src/renderers/styles/dots.ts` - 实现绘制函数
- Canvas 和 SVG 版本

**测试用例**:
- [ ] 测试所有新样式
- [ ] 扫描测试
- [ ] 与渐变组合测试

---

## 🛠️ 阶段 4: 工具功能（5+ 天）

### ✅ 任务 4.1: Compare（对比工具）
**优先级**: ⭐⭐
**预计时间**: 2 天
**状态**: 🔵 待开始

**功能描述**:
- 上传图片与生成的二维码对比
- 像素级对比
- 可视化差异
- 生成修正建议

**技术实现**:
1. 图像上传和处理
2. 像素对比算法
3. 差异可视化
4. UI 界面

**新建文件**:
- `src/tools/compare.ts`
- `src/utils/image-processing.ts`
- UI 组件（React/Vue）

---

### ✅ 任务 4.2: Verify（验证工具）
**优先级**: ⭐⭐
**预计时间**: 1 天
**状态**: 🔵 待开始

**功能描述**:
- 扫描二维码
- 验证内容是否正确
- 显示扫描结果

**技术实现**:
1. 集成二维码扫描库（jsQR 或 qr-scanner）
2. 解码逻辑
3. UI 界面

**新建文件**:
- `src/tools/verify.ts`
- UI 组件

---

### ✅ 任务 4.3: Camera（摄像头扫描）
**优先级**: ⭐
**预计时间**: 1 天
**状态**: 🔵 待开始

**功能描述**:
- 使用摄像头实时扫描
- 显示扫描结果
- 支持多种扫描算法

**技术实现**:
1. WebRTC 摄像头访问
2. 实时视频流处理
3. 二维码检测和解码
4. UI 界面

**新建文件**:
- `src/tools/camera.ts`
- UI 组件

---

### ✅ 任务 4.4: Boost ECC（增强错误修正）
**优先级**: ⭐⭐⭐⭐
**预计时间**: 2+ 天（可选）
**状态**: 🔵 待开始

**功能描述**:
- 超过 H 级别的错误修正
- 用于极度装饰性的二维码

**技术实现**:
1. 研究 Reed-Solomon 编码
2. 实现或集成自定义纠错算法
3. 可能需要完全自定义 QR Code 生成器

**难度**: 极高，可能需要专门研究

---

## 📦 阶段 5: 文档和测试（2 天）

### ✅ 任务 5.1: 完整文档
**预计时间**: 1 天

**内容**:
- API 文档更新
- 使用指南
- 示例代码
- 最佳实践

---

### ✅ 任务 5.2: 测试套件
**预计时间**: 1 天

**内容**:
- 单元测试
- 集成测试
- 视觉回归测试
- 扫描测试

---

## 🚀 实施顺序

### 第 1 周（Day 1-5）
- ✅ Day 1-2: Mask Pattern + Marker Shape 重构
- ✅ Day 3: Rotate + Render Type
- ✅ Day 4: Sub Markers + Margin Noise + Safe Space
- ✅ Day 5: Seed + Invert + Transform 开始

### 第 2 周（Day 6-10）
- ✅ Day 6: Transform 完成 + 3 种新样式
- ✅ Day 7-8: Compare 工具
- ✅ Day 9: Verify + Camera
- ✅ Day 10: Boost ECC（研究和评估）

### 第 3 周（Day 11-15）
- ✅ Day 11-12: 文档和测试
- ✅ Day 13-14: Bug 修复和优化
- ✅ Day 15: 最终验收和发布

---

## 📊 进度追踪

### 阶段 1: 核心功能
- [ ] Mask Pattern
- [ ] Marker Shape 重构
- [ ] Rotate
- [ ] Render Type

### 阶段 2: 视觉增强
- [ ] Sub Markers
- [ ] Margin Noise
- [ ] Safe Space
- [ ] Seed
- [ ] Invert
- [ ] Transform

### 阶段 3: 样式扩展
- [ ] Half-Circle, Horizontal, Vertical

### 阶段 4: 工具功能
- [ ] Compare
- [ ] Verify
- [ ] Camera
- [ ] Boost ECC（可选）

### 阶段 5: 文档和测试
- [ ] 完整文档
- [ ] 测试套件

---

## 🎯 成功标准

1. ✅ 所有 Anthony Fu QR Toolkit 的功能都已实现
2. ✅ 所有功能都有完整的 TypeScript 类型
3. ✅ 所有功能都有文档和示例
4. ✅ 通过所有测试用例
5. ✅ 扫描测试通过率 > 95%
6. ✅ 代码质量和性能符合标准

---

**开始实施日期**: 2025-10-10
**预计完成日期**: 2025-10-25
**当前状态**: 🔵 规划完成，准备开始实施
