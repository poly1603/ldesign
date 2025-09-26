# Mention 提及

在输入框或文本域中，通过输入触发字符（默认 @）呼出下拉候选并插入所选项。

## 基础用法

在任何位置键入 @，继续输入关键字即可出现候选列表，方向键选择，回车确认。

<div class="demo-container">
  <ldesign-mention placeholder="输入 @ 提及成员"
    options='[
      {"value":"1","label":"Alice","description":"FE"},
      {"value":"2","label":"Bob","description":"BE"},
      {"value":"3","label":"Charlie","description":"PM"}
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention placeholder="输入 @ 提及成员"
  options='[{"value":"1","label":"Alice"},{"value":"2","label":"Bob"},{"value":"3","label":"Charlie"}]'
></ldesign-mention>
```

## 自定义数据与过滤

通过 `options` 提供候选项；可选的 `filterOption` 用于自定义过滤策略。

<div class="demo-container">
  <ldesign-mention id="mention-filter-demo"
    placeholder="输入 @a 过滤出 Alice 等"
    options='[
      {"value":"1","label":"Alice","avatar":"https://avatars.githubusercontent.com/u/9919?v=4","description":"前端"},
      {"value":"2","label":"Bob","description":"后端"},
      {"value":"3","label":"Charlie","description":"PM"},
      {"value":"4","label":"David","description":"测试"}
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention
  placeholder="输入 @a 过滤出 Alice 等"
  options='[
    {"value":"1","label":"Alice","avatar":"https://.../a.jpg","description":"前端"},
    {"value":"2","label":"Bob","description":"后端"},
    {"value":"3","label":"Charlie","description":"PM"}
  ]'
></ldesign-mention>
```

```js
// 自定义过滤（演示：优先匹配 label 的开头，否则回退到包含）
const el = document.getElementById('mention-filter-demo');
el.filterOption = (q, opt) => {
  const l = (opt.label || '').toLowerCase();
  const s = (q || '').toLowerCase();
  return l.startsWith(s) || l.includes(s);
};
```

## 多行输入

将 `multiline` 设为 `true` 可以在文本域中使用提及，并配合 `rows` 设置初始行数。

<div class="demo-container">
  <ldesign-mention placeholder="在多行文本中输入 @"
    multiline rows="4"
    options='[
      {"value":"1","label":"Alice"},
      {"value":"2","label":"Bob"},
      {"value":"3","label":"Charlie"}
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention multiline rows="4" placeholder="在多行文本中输入 @"
  options='[{"value":"1","label":"Alice"}]'
></ldesign-mention>
```

### 最大行数（max-rows）

通过 `max-rows` 限制编辑区的最大可见行数，超过后出现纵向滚动条：

<div class="demo-container">
  <ldesign-mention
    placeholder="最多显示 5 行，超过后滚动"
    multiline rows="3" max-rows="5" resizable
    options='[
      {"value":"1","label":"Alice"},
      {"value":"2","label":"Bob"},
      {"value":"3","label":"Charlie"}
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention
  multiline
  rows="3"
  max-rows="5"
  resizable
  placeholder="最多显示 5 行，超过后滚动">
</ldesign-mention>
```

## 异步搜索

监听 `ldesignSearch` 事件进行异步搜索；通过 `loading` 控制加载态，成功后设置 `options`。

<div class="demo-container">
  <ldesign-mention id="mention-async-demo" placeholder="输入 @a 触发异步加载"></ldesign-mention>
</div>

```html
<ldesign-mention id="mention-async-demo" placeholder="输入 @a 触发异步加载"></ldesign-mention>
```

```js
if (typeof window !== 'undefined') {
  const demo = document.getElementById('mention-async-demo');
  const all = [
    { value: '1', label: 'Alice', description: 'FE' },
    { value: '2', label: 'Bob', description: 'BE' },
    { value: '3', label: 'Charlie', description: 'PM' },
    { value: '4', label: 'David', description: 'QA' },
  ];
  demo.addEventListener('ldesignSearch', (e) => {
    const q = (e.detail?.value || '').toLowerCase();
    demo.loading = true;
    setTimeout(() => {
      demo.loading = false;
      demo.options = all.filter(x => !q || x.label.toLowerCase().includes(q));
    }, 500);
  });
}
```

## 受控用法

设置 `controlled` 为 `true` 时，组件不主动写入内部值，需要外部同步 `value`。

```html
<ldesign-mention id="mention-controlled" controlled value="Hello "></ldesign-mention>
```

```js
const m = document.getElementById('mention-controlled');
m.addEventListener('ldesignChange', (e) => {
  // 外部持有状态，并回填到组件
  m.value = e.detail;
});
```

## 键盘交互

- ArrowUp / ArrowDown：移动高亮
- Enter：选择高亮项并插入
- Esc：关闭候选面板

## API

### 属性

| 属性名 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | `''` | 当前值（受控） |
| `defaultValue` | `string` | `-` | 默认值（非受控） |
| `placeholder` | `string` | `-` | 占位文本 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `readonly` | `boolean` | `false` | 是否只读 |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | 尺寸 |
| `trigger` | `string` | `'@'` | 触发字符（兼容旧属性） |
| `model` | `MentionSegment[] \| string(JSON)` | `-` | 结构化分段初始化，适合直接在属性中写 JSON |
| `value-model` | `MentionModel \| string(JSON)` | `-` | 语义化模型初始化，适合持久化/受控 |
| `value-format` | `'model' \| 'segments' \| 'text'` | `'model'` | 变更事件输出的数据格式（推荐 'model'） |
| `triggers` | `string \| string[]` | `-` | 多个触发字符（如 ['@', '#']） |
| `trigger-configs` | `MentionTriggerConfig[] \| string(JSON)` | `-` | 针对不同触发符的专属配置，包含 options/tokenType/closable |
| `options` | `MentionItem[] \| string(JSON)` | `[]` | 全局候选项列表（若 trigger-configs 中指定 options，则优先使用对应触发符的数据） |
| `filter-option` | `(input: string, option: MentionItem) => boolean` | `-` | 自定义过滤函数（需以属性/脚本方式赋值） |
| `loading` | `boolean` | `false` | 是否加载中 |
| `max-height` | `number` | `240` | 列表最大高度（px） |
| `multiline` | `boolean` | `true` | 是否为多行文本域 |
| `rows` | `number` | `3` | 文本域行数 |
| `resizable` | `boolean` | `true` | 文本域是否可缩放 |
| `autofocus` | `boolean` | `false` | 是否自动聚焦 |
| `controlled` | `boolean` | `false` | 是否受控（为真时内部不更新 value） |
| `token-type` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| 'info'` | `'primary'` | 默认标签外观（可被单项覆盖） |
| `closable` | `boolean` | `true` | 默认标签是否可关闭（可被单项覆盖） |
| `parse-on-init` | `boolean` | `false` | 是否在加载时将文本中的 @xxx/#xxx 解析为标签 |
| `parse-strategy` | `'label' \| 'options'` | `label` | 解析策略：label（直接转换）/options（仅命中候选时转换） |
| `append-to` | `'self' \| 'body' \| 'closest-popup'` | `'body'` | 弹层挂载容器 |

> MentionItem: `{ value: string|number; label: string; avatar?: string; description?: string; disabled?: boolean; tagType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'; closable?: boolean; className?: string; style?: string; data?: any }`
>
> MentionTriggerConfig: `{ char: string; options?: MentionItem[]; tokenType?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'; closable?: boolean }`

> 注意：`parse-on-init` 默认为“自动解析”——当初始 `value` 中包含触发符（如 @ / #）时会转为标签；如需禁止，请显式设置 `parse-on-init="false"`。通过 `model`/`value-model` 进行结构化初始化时不会再触发解析。

### 事件

| 事件名 | 说明 | 回调参数 |
|---|---|---|
| `ldesignSearch` | 搜索（触发字符后的输入变化） | `{ value: string; trigger: string }` |
| `ldesignSelect` | 选择某个候选项 | `{ value: MentionItem; trigger: string, text?: string, mentions?: MentionEntity[] }` |
| `ldesignRemove` | 移除标签（点击 × 或 Backspace 删除） | `{ value: string|number; label: string; trigger: string, text?: string, mentions?: MentionEntity[] }` |
| `ldesignChange` | 内容变化 | `string` |
| `ldesignFocus` | 获得焦点 | `FocusEvent` |
| `ldesignBlur` | 失去焦点 | `FocusEvent` |
| `ldesignValueChange` | 结构化变更 | `{ text: string; mentions: MentionEntity[]; model: MentionSegment[] }` |

## 多触发符与个性化配置

通过 `triggers` 配置多个触发字符，并用 `trigger-configs` 为不同触发符提供专属候选和默认样式。

<div class="demo-container">
  <ldesign-mention
    id="mention-multi-trigger"
    placeholder="输入 @ 或 #"
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "closable": true, "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" }
      ] },
      { "char": "#", "tokenType": "info", "closable": true, "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" }
      ] }
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention
  triggers='["@", "#"]'
  trigger-configs='[
    { "char": "@", "tokenType": "primary", "closable": true, "options": [
      { "value": "1", "label": "Alice" },
      { "value": "2", "label": "Bob" }
    ] },
    { "char": "#", "tokenType": "info", "closable": true, "options": [
      { "value": "t1", "label": "话题一" },
      { "value": "t2", "label": "性能优化" }
    ] }
  ]'
></ldesign-mention>
```

## 初始解析与策略

开启 `parse-on-init` 可以在加载时把文本中的 `@xxx`、`#xxx` 转为标签；`parse-strategy` 决定解析规则。

- label：直接把触发符后连续非空白作为 label
- options：仅当在对应触发符的数据源中存在同名 label 时才转换

<div class="demo-container">
<ldesign-mention
    id="mention-parse-init"
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "closable": true, "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" },
        { "value": "4", "label": "Diana" }
      ] },
      { "char": "#", "tokenType": "info", "closable": true, "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" },
        { "value": "t4", "label": "新功能" }
      ] }
    ]'
    model='[
      { "type": "text", "text": "欢迎 " },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 参与讨论，今天主题是 " },
      { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
    ]'
  ></ldesign-mention>
</div>

```html
<!-- 为保证默认展示即为“标签样式”，此处直接传入分段数组（无需依赖 parse-on-init） -->
<ldesign-mention
  triggers='["@", "#"]'
  model='[
    { "type": "text", "text": "欢迎 " },
    { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
    { "type": "text", "text": " 参与讨论，今天主题是 " },
    { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
  ]'
></ldesign-mention>
```

### 对照示例（可切换）

<div class="demo-row" style="gap:8px; margin-top: 8px;">
  <button id="btn-compare-seg">数组初始化</button>
  <button id="btn-compare-str">字符串解析</button>
</div>
<div class="demo-container" id="compare-seg" style="margin-top: 8px;">
  <ldesign-mention
    id="mention-compare-seg"
    triggers='["@","#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" },
        { "value": "4", "label": "Diana" }
      ] },
      { "char": "#", "tokenType": "info", "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" },
        { "value": "t4", "label": "新功能" }
      ] }
    ]'
    model='[
      { "type": "text", "text": "欢迎 " },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 参与 " },
      { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
    ]'
  ></ldesign-mention>
</div>
<div class="demo-container" id="compare-str" style="margin-top: 8px; display:none;">
  <ldesign-mention
    id="mention-compare-str"
    triggers='["@","#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" },
        { "value": "4", "label": "Diana" }
      ] },
      { "char": "#", "tokenType": "info", "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" },
        { "value": "t4", "label": "新功能" }
      ] }
    ]'
    parse-on-init="true"
    parse-strategy="options"
    value="欢迎 @Alice 参与 #性能优化"
  ></ldesign-mention>
</div>

## 标签移除事件

点击标签右侧的 × 或在标签右侧按 Backspace 会触发 `ldesignRemove` 事件。

为确保示例稳定，下面示例使用 model 分段初始化，避免依赖 parse-on-init 的字符串解析。

<div class="demo-container">
  <div id="mention-remove-log" class="demo-row" style="margin-bottom:12px;color:#666;">最近移除：无</div>
  <ldesign-mention
    id="mention-remove"
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [ { "value": "1", "label": "Alice" }, { "value": "2", "label": "Bob" } ] },
      { "char": "#", "tokenType": "warning", "options": [ { "value": "t1", "label": "话题一" } ] }
    ]'
    model='[
      { "type": "text", "text": "欢迎 " },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 参与 " },
      { "type": "mention", "trigger": "#", "label": "话题一", "value": "t1" },
      { "type": "text", "text": " 讨论" }
    ]'
  ></ldesign-mention>
</div>

```html
<ldesign-mention
  id="mention-remove"
  triggers='["@", "#"]'
  trigger-configs='[
    { "char": "@", "tokenType": "primary", "options": [ { "value": "1", "label": "Alice" }, { "value": "2", "label": "Bob" } ] },
    { "char": "#", "tokenType": "warning", "options": [ { "value": "t1", "label": "话题一" } ] }
  ]'
  model='[
    { "type": "text", "text": "欢迎 " },
    { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
    { "type": "text", "text": " 参与 " },
    { "type": "mention", "trigger": "#", "label": "话题一", "value": "t1" },
    { "type": "text", "text": " 讨论" }
  ]'
></ldesign-mention>
<script>
  const rm = document.getElementById('mention-remove')
  rm.addEventListener('ldesignRemove', (e) => {
    console.log('remove', e.detail)
  })
</script>
```

## 只读与禁用

在只读或禁用模式下，输入区不可编辑、标签不可关闭、候选不会打开。

<div class="demo-container">
  <div class="demo-row"><span class="demo-label">只读：</span></div>
  <ldesign-mention
    id="mention-readonly"
    readonly
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [ { "value": "1", "label": "Alice" } ] },
      { "char": "#", "tokenType": "info",    "options": [ { "value": "t2", "label": "性能优化" } ] }
    ]'
    model='[
      { "type": "text", "text": "只读示例：" },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 参与 " },
      { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
    ]'
  ></ldesign-mention>

  <div class="demo-row" style="margin-top:12px;"><span class="demo-label">禁用：</span></div>
  <ldesign-mention
    id="mention-disabled"
    disabled
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [ { "value": "1", "label": "Alice" } ] },
      { "char": "#", "tokenType": "warning", "options": [ { "value": "t1", "label": "话题一" } ] }
    ]'
    model='[
      { "type": "text", "text": "禁用示例：" },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 的 " },
      { "type": "mention", "trigger": "#", "label": "话题一", "value": "t1" }
    ]'
  ></ldesign-mention>
</div>

```html
<!-- 只读 -->
<ldesign-mention readonly ... parse-on-init="true" value="只读示例：@Alice 参与 #性能优化"></ldesign-mention>
<!-- 禁用 -->
<ldesign-mention disabled ... parse-on-init="true" value="禁用示例：@Alice 的 #话题一"></ldesign-mention>
```

## 关闭自动解析

如果不想在初始值中自动转换为标签，可显式设置 `parse-on-init="false"`。

<div class="demo-container">
  <ldesign-mention
    id="mention-no-autoparse"
    triggers='["@", "#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" }
      ] },
      { "char": "#", "tokenType": "info", "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" }
      ] }
    ]'
    parse-on-init="false"
    value="不解析示例：@Alice 与 #话题一 将以纯文本显示"
  ></ldesign-mention>
</div>

```html
<ldesign-mention parse-on-init="false" value="不解析示例：@Alice 与 #话题一 将以纯文本显示"></ldesign-mention>
```

## 结构化初始化与受控

结构化值可以完整描述“文本 + 已选标签”的模型，推荐使用：

- 分段模型（model，适合直接写在属性里）：
  - [ { type: 'text', text }, { type: 'mention', trigger, label, value } ... ]
- 语义模型（value-model，适合持久化）：
  - { text: string, mentions: [{ value, label, trigger, start, length }] }

<div class="demo-container">
  <div class="demo-row"><span class="demo-label">分段（model）</span></div>
  <ldesign-mention
    id="mention-model-demo"
    triggers='["@","#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" }
      ] },
      { "char": "#", "tokenType": "info", "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" }
      ] }
    ]'
    model='[
      { "type": "text", "text": "欢迎 " },
      { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
      { "type": "text", "text": " 参与 " },
      { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
    ]'
  ></ldesign-mention>

  <div class="demo-row" style="margin-top:12px;"><span class="demo-label">语义（value-model）</span></div>
  <ldesign-mention
    id="mention-value-model-demo"
    triggers='["@","#"]'
    trigger-configs='[
      { "char": "@", "tokenType": "primary", "options": [
        { "value": "1", "label": "Alice" },
        { "value": "2", "label": "Bob" },
        { "value": "3", "label": "Charlie" }
      ] },
      { "char": "#", "tokenType": "info", "options": [
        { "value": "t1", "label": "话题一" },
        { "value": "t2", "label": "性能优化" },
        { "value": "t3", "label": "Bug修复" }
      ] }
    ]'
    value-format="model"
    value-model='{
      "text": "欢迎 @Alice 参与 #性能优化",
      "mentions": [
        { "value": "1", "label": "Alice", "trigger": "@", "start": 3,  "length": 6 },
        { "value": "t2","label": "性能优化", "trigger": "#", "start": 12, "length": 4 }
      ]
    }'
  ></ldesign-mention>
</div>

```html
<!-- 分段（model）初始化 -->
<ldesign-mention
  triggers='["@","#"]'
  model='[
    { "type": "text", "text": "欢迎 " },
    { "type": "mention", "trigger": "@", "label": "Alice", "value": "1" },
    { "type": "text", "text": " 参与 " },
    { "type": "mention", "trigger": "#", "label": "性能优化", "value": "t2" }
  ]'>
</ldesign-mention>

<!-- 语义（value-model）初始化；并指定 value-format 决定事件输出结构 -->
<ldesign-mention
  value-format="model"
  value-model='{
    "text": "欢迎 @Alice 参与 #性能优化",
    "mentions": [
      { "value": "1", "label": "Alice", "trigger": "@", "start": 3,  "length": 6 },
      { "value": "t2","label": "性能优化", "trigger": "#", "start": 12, "length": 4 }
    ]
  }'>
</ldesign-mention>
```

> 事件建议：监听 `ldesignValueChange`，可一次性拿到 `{ text, mentions, model }`；旧的 `ldesignChange` 仅返回纯文本，仍兼容。

## 注意事项

- 初始化传入 value 若包含触发符（如 @ / #），默认会自动解析为标签（可通过 `parse-on-init="false"` 禁用）。
- 只读（readonly）或禁用（disabled）时，输入区不可编辑、已插入的标签不可关闭；候选不会打开。
- 目前候选面板锚定在输入框下方（而非精确光标位置）。如需“光标定位弹出”，可后续引入虚拟参考定位进行增强。

<script>
if (typeof window !== 'undefined') {
  const run = () => {
    // 自定义过滤演示
    const filterDemo = document.getElementById('mention-filter-demo');
    if (filterDemo && !filterDemo.__inited_filter) {
      filterDemo.filterOption = (q, opt) => {
        const l = (opt.label || '').toLowerCase();
        const s = (q || '').toLowerCase();
        return l.startsWith(s) || l.includes(s);
      };
      filterDemo.__inited_filter = true;
    }

    // 异步搜索演示
    const asyncDemo = document.getElementById('mention-async-demo');
    if (asyncDemo && !asyncDemo.__inited_async) {
      const all = [
        { value: '1', label: 'Alice', description: 'FE' },
        { value: '2', label: 'Bob', description: 'BE' },
        { value: '3', label: 'Charlie', description: 'PM' },
        { value: '4', label: 'David', description: 'QA' },
      ];
      asyncDemo.addEventListener('ldesignSearch', (e) => {
        const q = (e.detail?.value || '').toLowerCase();
        asyncDemo.loading = true;
        setTimeout(() => {
          asyncDemo.loading = false;
          asyncDemo.options = all.filter(x => !q || x.label.toLowerCase().includes(q));
        }, 400);
      });
      asyncDemo.__inited_async = true;
    }

    // 受控演示：将 change 回填为 value
    const ctl = document.getElementById('mention-controlled');
    if (ctl && !ctl.__inited_ctl) {
      ctl.addEventListener('ldesignChange', (e) => {
        ctl.value = e.detail;
      });
      ctl.__inited_ctl = true;
    }
  };
  // 多次尝试，适配组件定义与路由切换
  setTimeout(run, 0);
  setTimeout(run, 100);
setTimeout(run, 300);

  // 多触发符 + 移除/解析演示绑定
  const bindDemos = () => {
    const multi = document.getElementById('mention-multi-trigger')
    if (multi && !multi.__inited_multi) {
      multi.addEventListener('ldesignSelect', (e) => console.log('multi select', e.detail))
      multi.__inited_multi = true
    }

    const parseInit = document.getElementById('mention-parse-init')
    if (parseInit && !parseInit.__inited_parse) {
      parseInit.addEventListener('ldesignSelect', (e) => console.log('parse select', e.detail))
      parseInit.__inited_parse = true
    }

    const rm = document.getElementById('mention-remove')
    const log = document.getElementById('mention-remove-log')
    if (rm && !rm.__inited_remove) {
      rm.addEventListener('ldesignRemove', (e) => {
        console.log('remove', e.detail)
        if (log) {
          const { value, label, trigger } = e.detail || {}
          log.textContent = `最近移除：${trigger || ''}${label || ''}（value=${value ?? ''}）`
        }
      })
      rm.__inited_remove = true
    }
  }
  setTimeout(bindDemos, 0)
  setTimeout(bindDemos, 100)
setTimeout(bindDemos, 300)

  // 结构化演示：绑定 ldesignValueChange
  const bindStructured = () => {
    const a = document.getElementById('mention-model-demo')
    const b = document.getElementById('mention-value-model-demo')
    const bind = (el) => {
      if (el && !el.__inited_struct) {
        el.addEventListener('ldesignValueChange', (e) => {
          console.log('[mention][value-change]', e.detail)
        })
        el.__inited_struct = true
      }
    }
    bind(a); bind(b)
  }
  setTimeout(bindStructured, 0)
  setTimeout(bindStructured, 100)
  setTimeout(bindStructured, 300)

  // 切换：数组初始化 vs 字符串解析
  const segBtn = document.getElementById('btn-compare-seg')
  const strBtn = document.getElementById('btn-compare-str')
  const segBox = document.getElementById('compare-seg')
  const strBox = document.getElementById('compare-str')
  const activate = (which) => {
    if (!segBox || !strBox) return
    if (which === 'seg') { segBox.style.display = ''; strBox.style.display = 'none' }
    else { segBox.style.display = 'none'; strBox.style.display = '' }
  }
  segBtn?.addEventListener('click', () => activate('seg'))
  strBtn?.addEventListener('click', () => activate('str'))
  // 默认显示数组初始化
  activate('seg')
}
</script>
