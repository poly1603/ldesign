# Tree 树

树形控件，用于展示具有层级关系的数据，支持展开/收起、单选/多选，以及复选框（含半选、级联）。基于 Web Components，可在任意框架中直接使用。

## 基础用法

<div class="demo-container">
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

<div class="demo-container">
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

<div class="demo-container">
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

<div class="demo-container">
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

<div class="demo-container">
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

<div class="demo-container" id="tree-ctrl-wrap">
  <div class="demo-row">
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
- 设置 `show-line` 可显示简易的连接线风格。

<div class="demo-container">
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

## 拖拽重排

- 给组件添加 `draggable` 即可启用拖拽。
- 放置规则：
  - 拖拽到条目上方区域 → 插入到该条目之前
  - 拖拽到条目下方区域 → 插入到该条目之后
  - 拖拽到条目中间区域 → 放入该条目作为子节点
- 放置完成会触发 `ldesignDrop` 事件，返回拖拽键、目标键、位置与更新后的数据。

<div class="demo-container">
  <ldesign-tree id="tree-drag" draggable default-expanded-keys='["root"]'></ldesign-tree>
</div>

```html
<ldesign-tree id="tree-drag" draggable default-expanded-keys='["root"]'></ldesign-tree>
<script>
  const el = document.getElementById('tree-drag');
  el.items = [
    { key: 'root', label: '根', children: [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', children: [ { key: 'b1', label: 'B-1' } ] }
    ] }
  ];
  el.addEventListener('ldesignDrop', (e) => {
    console.log('drop', e.detail);
  });
</script>
```

## 多种数据加载方式

### 1. 静态（数组/JSON 字符串）

```html
<ldesign-tree id="tree-static"></ldesign-tree>
<script>
  const el = document.getElementById('tree-static');
  el.items = [ { key: '1', label: '一' }, { key: '2', label: '二' } ];
  // 或：el.setAttribute('items', '[{"key":"1","label":"一"}]')
</script>
```

### 2. Script 标签（JSON）

```html
<script type="application/json" id="my-tree-json">[
  { "key": "docs", "label": "文档", "children": [ { "key": "guide", "label": "指南" } ] },
  { "key": "changelog", "label": "更新日志" }
]</script>

<ldesign-tree items-selector="#my-tree-json"></ldesign-tree>
```

### 3. 远程 URL（根/子节点）

- 设置 `data-url="/api/tree"`
- 根数据：组件加载时发起 GET /api/tree
- 子节点懒加载：设置 `lazy`，展开时会以 `?parent={key}` 请求（参数名可用 `parent-param` 配置，默认 parent）

```html
<ldesign-tree data-url="/api/tree" lazy></ldesign-tree>
```

提示：文档站示例未直连后端，这个用法以代码片段为主。

### 4. 自定义回调（懒加载）

```text
<ldesign-tree id="tree-lazy" lazy default-expanded-keys='[]'></ldesign-tree>

<script>
  const lazy = document.getElementById('tree-lazy');
  lazy.items = [{ key: 'root', label: '根' }];
  lazy.loadData = async (node) => {
    if (!node) {
      return [{ key: 'root', label: '根' }];
    }
    // 模拟异步
    await new Promise(r => setTimeout(r, 300));
    
    if (node.key === 'root') {
      return [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }];
    }
    return [];
  };
</script>
```

也可通过 `transform` 将接口原始数据转为 TreeNode[]。

### 拖拽规则与自动展开

全局位置开关：`allow-before`、`allow-after`、`allow-inside`（默认为 true）。
节点级控制（在 items 中为节点设置）：`draggable?: boolean`（禁止被拖拽）、`droppable?: boolean`（禁止 inside）、以及 `allowDropInside?/allowDropBefore?/allowDropAfter?`。
函数式规则：`allowDrag(node)`、`allowDrop(dragNode, dropNode, position)`。

#### JS 自定义规则示例（返回 false 则禁止）

```html
<script>
  const tree = document.getElementById('tree-drag-advanced');
  tree.allowDrag = (node) => true;
  tree.allowDrop = (dragNode, dropNode, position) => true;
</script>
```

悬停自动展开：设置 `drag-expand-delay`（默认 400ms）。

```html
<ldesign-tree id="tree-drag-advanced" draggable drag-expand-delay="300" show-line></ldesign-tree>
<script>
  const t = document.getElementById('tree-drag-advanced');
  t.items = [ { key: 'root', label: '根', children: [ { key: 'a', label: 'A' }, { key: 'b', label: 'B' } ] } ];
  t.allowDrag = (node) => node.key !== 'root';            // 根节点不可拖拽
  t.allowDrop = (drag, drop, pos) => drop.key !== 'a';     // 不允许拖动到 A 的任意位置
</script>
```

## 键盘重排（Alt + 方向键）

- 需要 `reorderable`（默认 true）。
- 快捷键：
  - Alt + ↑ 将当前项上移（在上一个兄弟前）
  - Alt + ↓ 将当前项下移（在下一个兄弟后）
  - Alt + ← 减小缩进（移到父级之后）
  - Alt + → 增加缩进（移入到前一个兄弟作为子节点）
- 受全局/节点级/函数式规则共同约束（与拖拽一致）。

```html
<ldesign-tree id="tree-kb" show-line></ldesign-tree>
<script>
  const el = document.getElementById('tree-kb');
  el.items = [{ key: 'root', label: '根', children: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }];
</script>
```

## 编程式 API

- getItems(): Promise<TreeNode[]>
- setItems(items: string | TreeNode[]): Promise&lt;void&gt;
- expand(key: string): Promise&lt;void&gt;
- collapse(key: string): Promise&lt;void&gt;
- expandAll(): Promise&lt;void&gt;
- collapseAll(): Promise&lt;void&gt;
- move(dragKey: string, dropKey: string, position: 'before'|'after'|'inside'): Promise&lt;boolean&gt;
- focus(key: string): Promise&lt;void&gt;

```html
<ldesign-tree id="tree-api" show-line></ldesign-tree>
<script>
  const api = document.getElementById('tree-api');
  api.items = [{ key: 'root', label: '根', children: [{ key: 'a', label: 'A' }, { key: 'b', label: 'B' }] }];
  // 编程式移动：将 a 移到 b 之后
  api.move('a', 'b', 'after');
  // 展开根
  api.expand('root');
  // 聚焦 b
  api.focus('b');
</script>
```

## API

### Props

| 属性 | 说明 | 类型 | 默认值 |
|---|---|---|---|
| items | 树数据，支持 JSON 字符串或对象数组 | `string \\| TreeNode[]` | `[]` |
| selectable | 是否可选择（高亮） | `boolean` | `true` |
| multiple | 是否多选（仅影响选择态） | `boolean` | `false` |
| checkable | 是否显示复选框（级联） | `boolean` | `false` |
| value | 当前选中项（受控，单选为 `string`，多选为 `string[]`） | `string \\| string[]` | `-` |
| default-value | 默认选中项（非受控） | `string \\| string[]` | `-` |
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
| ldesignSelect | 点击节点触发（在 `selectable` 时） | `{ key: string; keys: string[]; node?: TreeNode }` |
| ldesignExpand | 展开/收起时触发 | `{ key: string; expanded: boolean; expandedKeys: string[] }` |
| ldesignCheck | 勾选/取消勾选时触发 | `{ key: string; checked: boolean; checkedKeys: string[]; halfCheckedKeys: string[] }` |
