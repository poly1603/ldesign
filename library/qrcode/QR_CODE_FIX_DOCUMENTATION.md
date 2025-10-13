# 二维码无法扫描问题修复文档

## 问题描述
生成的二维码无法被扫描器正确识别，虽然视觉上看起来像是有效的二维码，但实际上数据已损坏。

## 问题根源分析

### 1. 核心问题
在 `src/core/generator.ts` 中，自定义的掩码模式（Mask Pattern）实现**重复应用了掩码**，导致二维码数据损坏。

### 2. 技术细节

#### 问题代码位置
```typescript
// src/core/generator.ts - 原始问题代码
private generateQRData(): void {
    // ...
    this.qr = QRCodeLib(typeNumber, errorCorrectionLevel);
    this.qr.addData(this.config.content);
    this.qr.make(); // <- 这里库已经应用了最优掩码
    
    // 问题：在库已应用掩码后，又尝试应用自定义掩码
    if (this.config.maskPattern !== undefined && this.config.maskPattern !== -1) {
      const originalMatrix = this.getOriginalMatrix(); // <- 获取的是已掩码的数据
      // 再次应用掩码导致数据损坏
      this.customMatrix = applyMaskPattern(originalMatrix, this.config.maskPattern, moduleCount);
    }
}
```

#### 根本原因
1. **qrcode-generator 库的工作流程**：
   - `make()` 方法被调用时，库会：
     - 生成原始数据矩阵
     - 自动选择最优掩码模式（通过评估8种掩码模式）
     - 应用选定的掩码模式
     - 嵌入格式信息（包含掩码模式标识）
   
2. **我们的错误实现**：
   - 在 `make()` 之后通过 `isDark()` 获取的矩阵**已经是掩码后的数据**
   - 我们错误地将其当作"原始数据"
   - 再次应用掩码相当于：`数据 XOR 掩码1 XOR 掩码2`
   - 这完全破坏了二维码的数据结构

### 3. 为什么二维码看起来"正常"但无法扫描？

- **视觉正常**：二维码的三个定位图案（眼睛）仍然完整，看起来像有效的二维码
- **无法扫描**：数据区域被双重掩码破坏，扫描器无法正确解码
- **格式信息不匹配**：嵌入的格式信息指示使用掩码A，但实际数据被掩码A和掩码B双重处理

## 解决方案

### 临时修复（已实施）
禁用自定义掩码模式功能，始终使用 qrcode-generator 库的内置掩码选择：

```typescript
// src/core/generator.ts - 修复后
private generateQRData(): void {
    const typeNumber = this.config.typeNumber || 0;
    const errorCorrectionLevel = this.config.errorCorrectionLevel || 'M';

    this.qr = QRCodeLib(typeNumber, errorCorrectionLevel);
    this.qr.addData(this.config.content);
    this.qr.make();

    // 始终使用库的内置掩码模式选择
    this.customMatrix = null;
    
    // 如果用户请求了自定义掩码，发出警告
    if (this.config.maskPattern !== undefined && this.config.maskPattern !== null) {
      console.warn(
        'Custom mask patterns are currently disabled to ensure QR code compatibility. ' +
        'The QR code will use the library\'s optimized mask pattern selection.'
      );
    }
}
```

### 长期解决方案（如果需要自定义掩码）

要正确实现自定义掩码模式，需要：

1. **修改或扩展 qrcode-generator 库**：
   - 在应用掩码之前获取原始数据矩阵
   - 或提供 API 来指定使用哪个掩码模式

2. **实现完整的 QR 码生成流程**：
   ```typescript
   // 伪代码 - 正确的实现方式
   function generateWithCustomMask(data, maskPattern) {
     // 1. 生成原始数据矩阵（未掩码）
     const rawMatrix = generateRawDataMatrix(data);
     
     // 2. 应用选定的掩码模式
     const maskedMatrix = applyMaskPattern(rawMatrix, maskPattern);
     
     // 3. 计算并嵌入格式信息（包含掩码模式标识）
     embedFormatInfo(maskedMatrix, maskPattern, errorCorrection);
     
     // 4. 嵌入版本信息（如果需要）
     embedVersionInfo(maskedMatrix);
     
     return maskedMatrix;
   }
   ```

3. **关键注意事项**：
   - 掩码不应应用于功能模块（定位图案、时序图案、格式信息等）
   - 格式信息必须正确反映所使用的掩码模式
   - 需要正确处理所有 QR 码版本（1-40）

## 验证方法

### 测试文件
创建了 `test-qr-fix.html` 用于验证修复：
- **Test 1**: 不指定掩码（使用库默认） - ✅ 可扫描
- **Test 2**: 自定义掩码（已禁用） - ✅ 可扫描
- **Test 3**: 指定掩码模式0（已禁用） - ✅ 可扫描
- **Test 4**: 直接使用 qrcode-generator - ✅ 可扫描（参考基准）
- **Test 5**: 修复版本 - ✅ 可扫描
- **Test 6**: 对比分析 - 验证像素差异

### 验证步骤
1. 构建项目：`npm run build`
2. 打开测试页面：`test-qr-fix.html`
3. 使用手机扫描器测试每个二维码
4. 所有二维码都应能正确扫描

## 影响范围

### 受影响的功能
- `maskPattern` 配置选项（临时失效）
- 自动掩码选择功能（临时失效）

### 不受影响的功能
- 所有样式功能（颜色、形状、渐变等）
- Logo 嵌入
- 错误纠正级别
- SVG/Canvas 渲染
- React/Vue 组件

## 建议

1. **短期**：保持当前修复，确保二维码功能正常
2. **中期**：如果确实需要自定义掩码功能，考虑：
   - 使用支持自定义掩码的库（如 qr.js）
   - 或自行实现完整的 QR 码生成器
3. **文档更新**：更新 API 文档，说明 `maskPattern` 选项当前不可用

## 总结

问题的根本原因是对 qrcode-generator 库工作原理的误解，导致在已掩码的数据上重复应用掩码。通过禁用自定义掩码功能，确保了二维码的正确生成和可扫描性。这个修复优先考虑了功能的正确性和用户体验。