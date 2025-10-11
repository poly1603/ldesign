# 🔍 调试指南

我已经在关键位置添加了详细的日志，帮助我们找出问题所在。

## 📝 已添加日志的位置

1. **CommandManager (`src/core/Command.ts`)**
   - 命令执行开始
   - 可用命令列表
   - 命令执行结果

2. **Editor (`src/core/editor.ts`)**
   - 事件监听器设置
   - Input事件触发
   - handleInput方法调用

3. **Font Plugin (`src/plugins/font.ts`)**
   - setFontSize命令全流程
   - 选区检查
   - DOM操作
   - 事件触发

4. **Table Plugin (`src/plugins/table.ts`)**
   - insertTable命令全流程
   - 对话框确认
   - 表格创建和插入
   - 事件触发

## 🧪 如何测试

### 方法1: 使用现有的示例页面

1. 启动开发服务器：
```bash
npm run dev
```

2. 浏览器访问 http://localhost:5174

3. 打开浏览器开发者工具（F12）

4. 切换到 Console 标签页

5. 在编辑器中进行以下操作：

#### 测试字体大小：
1. 在编辑器中输入一些文字，如："测试文字"
2. 选中这些文字
3. 点击工具栏的字体大小下拉菜单
4. 选择一个字体大小（如 24px）
5. **查看控制台输出**

#### 测试表格：
1. 点击工具栏的表格按钮
2. 选择行列数
3. 点击插入
4. **查看控制台输出**

### 方法2: 使用调试测试页面

已创建 `test-debug.html`，但需要与开发服务器集成。

## 📊 需要收集的信息

请执行上述测试，然后复制以下信息发给我：

### 1. 字体大小测试日志

应该看到类似这样的日志：
```
🚀 [CommandManager] Executing command: "setFontSize" with args: ['24px']
🎨 [FontSize] Command called with size: 24px
🎨 [FontSize] dispatch: exists
🎨 [FontSize] Selection: [Selection object]
🎨 [FontSize] Selected text: 测试文字
🎨 [FontSize] Creating span for selected text
🎨 [FontSize] Span inserted: [HTMLSpanElement]
🎨 [FontSize] setTimeout callback executing
🎨 [FontSize] editorContent found: [HTMLDivElement]
🎨 [FontSize] Dispatching input event
✅ [FontSize] Event dispatched successfully
✅ [FontSize] Command returning true
```

**如果看到❌或日志在某处停止了，请告诉我在哪一步停止了！**

### 2. Input事件监听日志

当你在编辑器中直接打字时，应该看到：
```
🔔 [Editor] Input event fired on contentElement
📝 [Editor] handleInput called
📝 [Editor] Current HTML length: xxx
📝 [Editor] Emitting update event
✅ [Editor] handleInput completed
```

**如果没有看到这些日志，说明input事件监听有问题！**

### 3. 表格插入日志

点击表格按钮后应该看到：
```
🚀 [CommandManager] Executing command: "insertTable"
📋 [Table] insertTable command called
📋 [Table] dispatch: exists
📋 [Table] Showing table dialog
```

确认对话框后：
```
📋 [Table] Dialog confirmed: 3x3
📋 [Table] Selection: [Selection object]
📋 [Table] Table element created: [HTMLTableElement]
📋 [Table] Table inserted into DOM
📋 [Table] setTimeout callback executing
📋 [Table] editorContent found: [HTMLDivElement]
📋 [Table] Dispatching input event
✅ [Table] Event dispatched successfully
```

## 🔎 常见问题排查

### 问题1: 命令没有执行
**症状**: 点击按钮后控制台没有任何日志

**可能原因**:
- 命令没有注册
- 工具栏按钮绑定错误

**日志检查**: 查看是否有 `🚀 [CommandManager] Executing command` 开头的日志

### 问题2: 命令执行了但没有效果  
**症状**: 看到命令日志，但DOM没有变化

**可能原因**:
- Input事件没有触发
- editorContent找不到
- 事件监听器没有正确设置

**日志检查**: 
1. 是否有 `✅ [FontSize] Event dispatched successfully`
2. 之后是否有 `🔔 [Editor] Input event fired`
3. 是否有 `📝 [Editor] handleInput called`

### 问题3: Input事件触发了但没有调用handleInput
**症状**: 看到 `🔔 [Editor] Input event fired` 但没有 `📝 [Editor] handleInput called`

**可能原因**: handleInput绑定问题

## 📤 请提供给我的信息

1. **完整的控制台日志截图或文本**（从开始测试到结束）
2. **操作步骤描述**（你做了什么）
3. **预期结果** vs **实际结果**
4. **浏览器信息**（Chrome/Firefox/Edge及版本）

## 💡 快速测试脚本

在浏览器控制台直接运行：

```javascript
// 检查编辑器是否存在
console.log('Editor instance:', window.editor || window.editorInstance);

// 检查可用命令
if (window.editor) {
  console.log('Available commands:', window.editor.commands.getCommands());
}

// 测试字体大小（需要先选中文字）
if (window.editor && window.getSelection().toString()) {
  window.editor.commands.execute('setFontSize', '24px');
}
```

## 🚨 紧急排查

如果所有日志都正常，但功能还是不工作，请检查：

1. **浏览器控制台是否有其他错误**（红色的错误信息）
2. **CSS样式是否正确加载**
3. **编辑器内容的HTML结构**（在Elements面板查看）
4. **是否有其他JavaScript错误阻止了代码执行**

---

**请按照上述步骤测试后，把控制台的所有日志输出发给我！** 🙏
