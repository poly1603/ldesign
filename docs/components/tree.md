# Tree 树

树形控件，用于展示具有层级关系的数据，支持展开/收起、单选/多选、高亮选择，及复选框选择（含半选、级联）。基于 Web Components，可在任意框架中直接使用。

## 基础用法

> 通过设置 `items` 属性（可传 JSON 字符串或对象数组）来渲染树。

<div class="demo-block">
  <ldesign-tree id="tree-basic"></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-basic"></ldesign-tree>
<script>
  const el = document.getElementById('tree-basic');
  el.items = [
    {
      key: 'docs', label: '文档', children: [
        { key: 'guide', label: '指南' },
        { key: 'api', label: 'API' }
      ]
    },
    { key: 'changelog', label: '更新日志' }
  ];
</script>
```

## 默认展开

使用 `default-expanded-keys` 指定默认展开的节点。

<div class="demo-block">
  <ldesign-tree id="tree-default-expand" default-expanded-keys='["docs"]'></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-default-expand" default-expanded-keys='["docs"]'></ldesign-tree>
<script>
  const el = document.getElementById('tree-default-expand');
  el.items = [
    { key: 'docs', label: '文档', children: [ { key: 'guide', label: '指南' } ] },
    { key: 'changelog', label: '更新日志' }
  ];
</script>
```

## 选择（单选/多选）

- 默认 `selectable=true` 可点击高亮。
- 通过 `multiple` 启用多选。

<div class="demo-block">
  <ldesign-tree id="tree-select"></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-select"></ldesign-tree>
<script>
  const el = document.getElementById('tree-select');
  el.items = [
    { key: '1', label: '一级 1', children: [ { key: '1-1', label: '子 1-1' }, { key: '1-2', label: '子 1-2' } ] },
    { key: '2', label: '一级 2' }
  ];
  el.addEventListener('ldesignSelect', (e) => {
    console.log('select', e.detail);
  });
</script>
```

多选：

<div class="demo-block">
  <ldesign-tree id="tree-multiple" multiple></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-multiple" multiple></ldesign-tree>
<script>
  const el = document.getElementById('tree-multiple');
  el.items = [
    { key: 'a', label: 'A', children: [ { key: 'a-1', label: 'A-1' }, { key: 'a-2', label: 'A-2' } ] },
    { key: 'b', label: 'B' }
  ];
</script>
```

## 复选框（级联选择）

设置 `checkable` 可显示复选框。勾选会自动级联：
- 勾选父节点会勾选所有子节点；
- 取消父节点会取消所有子节点；
- 子节点部分勾选时，父节点显示半选状态。

<div class="demo-block">
  <ldesign-tree id="tree-check" checkable default-expanded-keys='["root"]'></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-check" checkable default-expanded-keys='["root"]'></ldesign-tree>
<script>
  const el = document.getElementById('tree-check');
  el.items = [
    { key: 'root', label: '根', children: [
      { key: 'x', label: 'X' },
      { key: 'y', label: 'Y', children: [ { key: 'y-1', label: 'Y-1' }, { key: 'y-2', label: 'Y-2' } ] }
    ] }
  ];
  el.addEventListener('ldesignCheck', (e) => {
    console.log('check', e.detail);
  });
</script>
```

## 受控用法

- 选中项：`value`（单选为 string，多选为 string[]）。
- 展开项：`expanded-keys`。
- 勾选项：`checked-keys`。

下面示例通过按钮控制展开/选中/勾选。

<div class="demo-block" id="tree-ctrl-wrap">
  <div style="margin-bottom:8px; display:flex; gap:8px; flex-wrap:wrap;">
    <ldesign-button id="btn-expand">切换展开 docs</ldesign-button>
    <ldesign-button id="btn-select" type="secondary">选中 api</ldesign-button>
    <ldesign-button id="btn-check" type="secondary">勾选 guide</ldesign-button>
  </div>
  <ldesign-tree id="tree-ctrl" checkable expanded-keys='["docs"]'></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-ctrl" checkable expanded-keys='["docs"]'></ldesign-tree>
<script>
  const el = document.getElementById('tree-ctrl');
  el.items = [
    { key: 'docs', label: '文档', children: [ { key: 'guide', label: '指南' }, { key: 'api', label: 'API' } ] },
    { key: 'changelog', label: '更新日志' }
  ];
  // 展开
  document.getElementById('btn-expand').addEventListener('click', () => {
    const cur = el.expandedKeys || [];
    el.expandedKeys = cur.includes('docs') ? cur.filter(k => k !== 'docs') : [...cur, 'docs'];
  });
  // 选中
  document.getElementById('btn-select').addEventListener('click', () => {
    el.value = 'api';
  });
  // 勾选
  document.getElementById('btn-check').addEventListener('click', () => {
    const cur = new Set(el.checkedKeys || []);
    if (cur.has('guide')) cur.delete('guide'); else cur.add('guide');
    el.checkedKeys = Array.from(cur);
  });
</script>
```

## 自定义图标与连线

- 每个节点可设置 `icon` 字段（例如 `folder`、`file` 等来自 `ldesign-icon`）。
- 设置 `show-line` 显示简易的连接线风格。

<div class="demo-block">
  <ldesign-tree id="tree-icons" show-line default-expanded-keys='["root"]'></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-icons" show-line default-expanded-keys='["root"]'></ldesign-tree>
<script>
  const el = document.getElementById('tree-icons');
  el.items = [
    { key: 'root', label: '项目', icon: 'folder', children: [
      { key: 'src', label: 'src', icon: 'folder', children: [ { key: 'index', label: 'index.ts', icon: 'file' } ] },
      { key: 'README', label: 'README.md', icon: 'file' }
    ] }
  ];
</script>
```

## 键盘可访问

- Enter / Space：切换选中（或勾选，若启用 `checkable`）。
- ArrowRight：展开当前项（若可展开）。
- ArrowLeft：收起当前项（若已展开）。

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| items | 树数据，支持 JSON 字符串或对象数组 | `string \| TreeNode[]` | `[]` |
| selectable | 是否可选择（高亮） | `boolean` | `true` |
| multiple | 是否多选（仅影响选择态） | `boolean` | `false` |
| checkable | 是否显示复选框（级联） | `boolean` | `false` |
| value | 当前选中项（受控，单选为 `string`，多选为 `string[]`） | `string \| string[]` | `-` |
| default-value | 默认选中项（非受控） | `string \| string[]` | `-` |
| expanded-keys | 当前展开项（受控） | `string[]` | `-` |
| default-expanded-keys | 默认展开项（非受控） | `string[]` | `[]` |
| checked-keys | 当前勾选项（受控） | `string[]` | `-` |
| default-checked-keys | 默认勾选项（非受控） | `string[]` | `[]` |
| indent | 层级缩进（px） | `number` | `16` |
| show-line | 是否显示连接线风格 | `boolean` | `false` |

节点类型 TreeNode：

```ts
interface TreeNode {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  children?: TreeNode[];
}
```

### Events

| 事件 | 说明 | 回调参数 |
|---|---|---|
| ldesignSelect | 点击节点触发（仅在 `selectable` 时） | `{ key: string; keys: string[]; node?: TreeNode }` |
| ldesignExpand | 展开/收起时触发 | `{ key: string; expanded: boolean; expandedKeys: string[] }` |
| ldesignCheck | 勾选/取消勾选时触发 | `{ key: string; checked: boolean; checkedKeys: string[]; halfCheckedKeys: string[] }` |

### 无障碍

- 使用 `role="tree"/"treeitem"/"group"` 及 `aria-expanded/aria-selected/aria-disabled`。
- 键盘交互见上文“键盘可访问”。
