# Demo 重构计划

## 问题分析

当前demo目录存在以下问题：

### ❌ 当前结构（有问题）
```
demo/
├── src/
│   ├── components/    ❌ 不应该在demo中
│   │   ├── controls.js
│   │   ├── filters.js
│   │   ├── presets.js
│   │   └── ui.js
│   ├── utils/         ❌ 不应该在demo中
│   │   ├── history.js
│   │   ├── icons.js
│   │   ├── keyboard.js
│   │   └── samples.js
│   ├── styles/        ❌ 不应该在demo中
│   │   └── main.css
│   └── main.js
├── index.html
└── package.json
```

**问题**：
1. demo中包含了大量功能代码（components、utils、styles）
2. demo应该只是简单的使用示例，不应该重新实现功能
3. 用户使用库时需要的是编译后的文件，而不是这些源码

## 解决方案

### ✅ 推荐结构（简洁）

```
demo/
├── simple-demo.html        ✅ 最简单的使用示例
├── advanced-demo.html      ✅ 高级功能示例
├── presets-demo.html       ✅ 预设模板示例
├── events-demo.html        ✅ 事件监听示例
└── README.md               ✅ 使用说明
```

每个demo文件都应该：
1. 只引入编译后的库文件（`../dist/cropper.js` 和 `../dist/cropper.css`）
2. 简单的HTML结构
3. 简短的初始化代码：`new Cropper(image, options)`
4. 清晰的注释说明

### 📦 如果需要高级功能

如果 `demo/src/components` 和 `demo/src/utils` 中的功能是库需要的，应该：

1. **迁移到库源码**：
   ```
   library/cropper/src/
   ├── components/
   │   ├── Toolbar.ts       ← 从 demo/src/components 迁移
   │   ├── PresetManager.ts ← 从 demo/src/components 迁移
   │   └── HistoryManager.ts ← 从 demo/src/utils 迁移
   ```

2. **导出为库的一部分**：
   ```typescript
   // src/index.ts
   export { Cropper } from './core/Cropper';
   export { Toolbar } from './components/Toolbar';
   export { PresetManager } from './components/PresetManager';
   export { HistoryManager } from './components/HistoryManager';
   ```

3. **demo中使用导出的功能**：
   ```javascript
   // demo中
   import { Cropper, Toolbar, PresetManager } from '../dist/cropper.js';
   
   const cropper = new Cropper(image, options);
   const toolbar = new Toolbar(cropper);
   const presets = new PresetManager(cropper);
   ```

## 实施步骤

### 步骤1：清理demo（推荐立即执行）

```bash
# 备份当前demo/src（以防需要）
cd D:\WorkBench\ldesign\library\cropper\demo
mkdir backup
xcopy src backup\src /E /I

# 删除不需要的目录
Remove-Item -Recurse -Force src
```

### 步骤2：使用简洁的demo

使用新创建的 `simple-demo.html` 作为主要示例：
- 访问：http://localhost:5173/demo/simple-demo.html
- 只需100行代码就能完整演示所有功能

### 步骤3：（可选）迁移有用的功能到库

如果demo/src中有必要的功能：
1. 识别哪些功能是库应该提供的
2. 将代码迁移到 `library/cropper/src/components/`
3. 用TypeScript重写
4. 添加类型定义
5. 在 `src/index.ts` 中导出
6. 更新构建配置

## 示例对比

### ❌ 复杂的demo（当前）

```html
<!-- 需要复杂的构建配置 -->
<script type="module">
  import { initControls } from './src/components/controls.js';
  import { initFilters } from './src/components/filters.js';
  import { initPresets } from './src/components/presets.js';
  import { HistoryManager } from './src/utils/history.js';
  import { KeyboardShortcuts } from './src/utils/keyboard.js';
  // ... 更多imports
  
  // 需要大量初始化代码
  const cropper = new Cropper(image, options);
  initControls(cropper);
  initFilters(cropper);
  // ... 更多初始化
</script>
```

### ✅ 简洁的demo（推荐）

```html
<!-- 只需引入库文件 -->
<script type="module">
  import { Cropper } from '../dist/cropper.js';
  
  // 就这么简单！
  const cropper = new Cropper(image, {
    aspectRatio: 16 / 9,
    viewMode: 1
  });
</script>
```

## 结论

**demo应该展示"如何使用库"，而不是"如何实现库"**

- ✅ 简洁明了的使用示例
- ✅ 易于理解和复制
- ✅ 无需复杂的构建配置
- ✅ 快速上手

**建议立即使用 `simple-demo.html`，删除 `demo/src` 目录。**
