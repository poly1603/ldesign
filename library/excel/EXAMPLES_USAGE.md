# Excel Viewer 示例项目使用说明

## 🚨 重要说明

当前项目由于核心库依赖 Luckysheet，需要确保以下几点才能正常使用：

### 1. Luckysheet 依赖

所有示例都需要正确加载 Luckysheet CDN 资源：

```html
<!-- CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/css/pluginsCss.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/plugins.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/css/luckysheet.css">

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/plugins/js/plugin.js"></script>
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>
```

### 2. 当前状态

#### ✅ 示例项目已启动

所有 4 个示例项目均已成功启动在以下端口：

- **Vanilla JS**: http://localhost:3000
- **Vue 3**: http://localhost:3001
- **React**: http://localhost:3002
- **Lit**: http://localhost:3003

#### ⚠️ 功能限制

由于以下原因，当前 Excel 渲染功能可能无法完全正常工作：

1. **Luckysheet 集成问题**：
   - Luckysheet 需要在全局 window 对象上可用
   - 需要正确的容器 ID
   - 需要特定的数据格式

2. **核心库未完全实现**：
   - Parser 模块依赖 xlsx 库（需要安装）
   - Renderer 模块依赖 Luckysheet（CDN加载时机问题）
   - 数据转换逻辑需要完善

3. **依赖项问题**：
   - xlsx、luckysheet、html2canvas 等库需要正确安装或加载

## 🔧 如何验证功能

### 方法 1：检查页面是否正常加载

1. 打开浏览器访问任一示例地址
2. 检查页面是否正确显示（标题、按钮等）
3. 打开浏览器控制台查看是否有错误

**预期结果**：
- ✅ 页面正确显示
- ✅ 按钮可以点击
- ✅ 状态显示"等待加载文件..."

### 方法 2：检查 Luckysheet 是否加载

在浏览器控制台执行：

```javascript
console.log(typeof window.luckysheet);
// 应该输出 "object" 或 "function"
```

如果输出 "undefined"，说明 Luckysheet 未正确加载。

### 方法 3：手动测试文件上传

1. 准备一个简单的 Excel 文件（.xlsx）
2. 点击"选择 Excel 文件"按钮
3. 选择文件后查看状态提示
4. 查看控制台是否有错误信息

**可能的错误**：
- ❌ "Luckysheet is not loaded" - Luckysheet 未加载
- ❌ "Cannot find module 'xlsx'" - xlsx 模块未找到
- ❌ TypeError - 数据格式转换错误

## 🎯 推荐的测试步骤

### Step 1：访问 Vanilla JS 示例

```bash
# 确保服务正在运行
http://localhost:3000
```

**检查项**：
1. [ ] 页面标题显示正确
2. [ ] 所有按钮显示正常
3. [ ] 状态栏显示"等待加载文件..."
4. [ ] 控制台无严重错误

### Step 2：访问 Vue 示例

```bash
http://localhost:3001
```

**检查项**：
1. [ ] Vue 组件正确渲染
2. [ ] 页面 UI 正常
3. [ ] 控制台无 Vue 相关错误

### Step 3：访问 React 示例

```bash
http://localhost:3002
```

**检查项**：
1. [ ] React 组件正确渲染
2. [ ] 页面 UI 正常
3. [ ] 控制台无 React 相关错误

### Step 4：访问 Lit 示例

```bash
http://localhost:3003
```

**检查项**：
1. [ ] Web Component 正确加载
2. [ ] 页面 UI 正常
3. [ ] 控制台无 Lit 相关错误

## 🐛 已知问题和解决方案

### 问题 1：Luckysheet 未定义

**错误信息**：
```
Uncaught ReferenceError: luckysheet is not defined
```

**原因**：CDN 加载时机问题或网络问题

**解决方案**：
```html
<!-- 确保 Luckysheet 在主代码之前加载 -->
<script src="https://cdn.jsdelivr.net/npm/luckysheet@latest/dist/luckysheet.umd.js"></script>
<script type="module" src="/main.js"></script>
```

### 问题 2：xlsx 模块未找到

**错误信息**：
```
Cannot find module 'xlsx'
```

**原因**：xlsx 依赖未安装

**解决方案**：
```bash
cd packages/core
pnpm install xlsx
```

### 问题 3：Excel 文件无法渲染

**可能原因**：
1. Luckysheet 未正确初始化
2. 数据格式转换错误
3. 容器 ID 不匹配

**调试步骤**：
```javascript
// 在浏览器控制台
// 1. 检查 Luckysheet
console.log(window.luckysheet);

// 2. 检查容器
console.log(document.getElementById('excel-viewer'));

// 3. 尝试手动初始化
luckysheet.create({
  container: 'excel-viewer',
  data: [{ name: 'Sheet1', celldata: [] }]
});
```

## 📋 功能清单

### 当前可用功能

| 功能 | Vanilla | Vue | React | Lit | 状态 |
|------|---------|-----|-------|-----|------|
| 页面加载 | ✅ | ✅ | ✅ | ✅ | 正常 |
| UI 显示 | ✅ | ✅ | ✅ | ✅ | 正常 |
| 文件选择 | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 需验证 |
| Excel 渲染 | ⚠️ | ⚠️ | ⚠️ | ⚠️ | 需验证 |
| 编辑功能 | ❌ | ❌ | ❌ | ❌ | 未验证 |
| 导出功能 | ❌ | ❌ | ❌ | ❌ | 未验证 |
| 搜索功能 | ❌ | ❌ | ❌ | ❌ | 未验证 |

### 待实现/验证功能

- [ ] 完整的 Excel 文件解析
- [ ] Luckysheet 渲染集成
- [ ] 编辑功能验证
- [ ] 导出功能验证
- [ ] 搜索功能验证
- [ ] 大文件性能测试
- [ ] 多工作表支持验证

## 🚀 下一步工作

### 高优先级

1. **修复 xlsx 依赖问题**
   ```bash
   cd packages/core
   pnpm install xlsx luckysheet html2canvas
   ```

2. **验证 Luckysheet 集成**
   - 确保 Luckysheet 正确加载
   - 验证数据格式转换
   - 测试渲染功能

3. **创建测试 Excel 文件**
   - 准备简单的测试数据
   - 测试文件上传功能
   - 验证渲染效果

### 中优先级

4. **完善错误处理**
   - 添加更详细的错误提示
   - 改善用户体验

5. **功能验证**
   - 逐一测试各项功能
   - 记录问题和bug

### 低优先级

6. **性能优化**
7. **文档完善**
8. **添加更多示例**

## 📞 帮助和支持

如果遇到问题，请检查：

1. **浏览器控制台** - 查看错误信息
2. **网络面板** - 检查资源加载情况
3. **Luckysheet 文档** - https://mengshukeji.gitee.io/LuckysheetDocs/
4. **SheetJS 文档** - https://sheetjs.com/

## 🎯 测试检查清单

访问每个示例项目，记录以下信息：

### Vanilla JS (localhost:3000)
- [ ] 页面正常加载
- [ ] UI 显示正确
- [ ] Luckysheet 已加载
- [ ] 可以选择文件
- [ ] 控制台错误：__________

### Vue (localhost:3001)
- [ ] 页面正常加载
- [ ] UI 显示正确
- [ ] Vue 组件渲染
- [ ] 可以选择文件
- [ ] 控制台错误：__________

### React (localhost:3002)
- [ ] 页面正常加载
- [ ] UI 显示正确
- [ ] React 组件渲染
- [ ] 可以选择文件
- [ ] 控制台错误：__________

### Lit (localhost:3003)
- [ ] 页面正常加载
- [ ] UI 显示正确
- [ ] Web Component 加载
- [ ] 可以选择文件
- [ ] 控制台错误：__________

---

**更新时间**: 2025-01-20  
**状态**: 测试中

