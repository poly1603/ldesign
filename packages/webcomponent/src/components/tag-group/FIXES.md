# Tag Group 组件修复说明

## 已修复的问题

### 1. TypeScript 类型错误

**问题**: `Cannot find name 'TagData'`

**修复**:
```typescript
// 将 interface 改为 export interface
export interface TagData {
  id: string;
  label: string;
  color?: string;
  closable?: boolean;
  variant?: string;
}
```

### 2. 属性名冲突警告

**问题**: `draggable` 属性与 HTML 标准属性冲突

**修复**: 将 `draggable` 重命名为 `enableDrag`

```typescript
// 旧代码
@Prop() draggable: boolean = false;

// 新代码
@Prop() enableDrag: boolean = false;
```

### 3. 类型不匹配

**问题**: color 和 variant 属性的类型定义需要更严格

**当前解决方案**: 使用 `string` 类型，由 ldesign-tag 组件内部验证

## 使用说明

### 正确的属性名

文档和代码中所有 `draggable` 需要改为 `enable-drag`:

```html
<!-- ❌ 旧的（错误） -->
<ldesign-tag-group draggable></ldesign-tag-group>

<!-- ✅ 新的（正确） -->
<ldesign-tag-group enable-drag></ldesign-tag-group>
```

### 完整示例

```html
<!DOCTYPE html>
<html>
<body>
  <ldesign-tag-group 
    id="my-tags"
    enable-drag
    addable
    add-text="+ 添加标签"
    default-color="primary"
    default-variant="light">
  </ldesign-tag-group>

  <script>
    const tagGroup = document.querySelector('#my-tags');
    
    // 设置初始数据
    tagGroup.tags = [
      { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
    ];
    
    // 监听添加事件
    tagGroup.addEventListener('ldesignAdd', (e) => {
      console.log('新增标签:', e.detail);
    });
    
    // 监听删除事件
    tagGroup.addEventListener('ldesignRemove', (e) => {
      console.log('删除标签:', e.detail);
    });
    
    // 监听顺序变化
    tagGroup.addEventListener('ldesignChange', (e) => {
      console.log('标签变化:', e.detail);
    });
  </script>
</body>
</html>
```

## API 更新

### Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tags | 标签数据数组 | `TagData[]` | `[]` |
| **enable-drag** | 是否启用拖拽排序 | `boolean` | `false` |
| addable | 是否显示添加按钮 | `boolean` | `false` |
| add-text | 添加按钮文本 | `string` | `'+ 添加标签'` |
| input-placeholder | 输入框占位符 | `string` | `'请输入标签名'` |
| default-color | 新标签默认颜色 | `string` | `'default'` |
| default-variant | 新标签默认样式 | `string` | `'light'` |
| overflow | 溢出策略 | `'scroll' \| 'more'` | `'scroll'` |
| max-visible | more模式最多显示数 | `number` | `5` |
| more-prefix | more模式前缀 | `string` | `'+'` |
| show-arrows | 显示滚动箭头 | `boolean` | `true` |
| scroll-step | 滚动步长 | `number` | `120` |
| disabled | 是否禁用 | `boolean` | `false` |

### TagData 接口

```typescript
export interface TagData {
  id: string;           // 唯一标识
  label: string;        // 显示文本
  color?: string;       // 颜色
  variant?: string;     // 样式变体
  closable?: boolean;   // 是否可关闭
}
```

### Events

| 事件名 | 说明 | 参数 |
|--------|------|------|
| ldesignAdd | 添加标签时触发 | `{ label: string, id: string }` |
| ldesignRemove | 删除标签时触发 | `{ tag: TagData, index: number }` |
| ldesignChange | 标签变化时触发 | `TagData[]` |

## 需要手动更新的文件

由于文件被占用，以下文件需要手动更新所有 `draggable` 为 `enable-drag`:

1. **D:\WorkBench\ldesign\docs\components\tag-group.md**
   - 所有 HTML 示例中的 `draggable` → `enable-drag`
   - API 表格中的属性名
   - 所有文本描述

2. **D:\WorkBench\ldesign\packages\webcomponent\src\components\tag-group\ENHANCEMENT_SUMMARY.md**
   - 所有示例代码
   - API 文档

## 查找替换命令

在 VS Code 中:
1. 打开文件
2. Ctrl+H (查找替换)
3. 查找: `draggable`
4. 替换为: `enable-drag`
5. 全部替换

或使用正则表达式更精确替换:
- 查找: `\bdraggable\b` (匹配完整单词)
- 替换为: `enable-drag`

## 验证修复

运行构建命令验证修复:
```bash
npm run build
# 或
pnpm build
```

应该不再有 TypeScript 错误和警告。
