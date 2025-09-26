# Transfer 穿梭框

用于在左右两栏列表间移动条目，支持受控/非受控、搜索过滤、禁用项等。

> 组件标签：`<ldesign-transfer>`（VitePress 已将 `ldesign-*` 识别为自定义元素，示例可直接运行）

## 基础用法

最基本的左右移动与计数展示。

<div class="demo-block">
  <ldesign-transfer id="tr-basic" filterable left-title="可选项" right-title="已选项"></ldesign-transfer>
</div>

```html
<ldesign-transfer id="tr-basic" filterable left-title="可选项" right-title="已选项"></ldesign-transfer>
<script>
  const items = [
    { key: '1', label: '选项一' },
    { key: '2', label: '选项二' },
    { key: '3', label: '选项三' },
    { key: '4', label: '选项四' },
    { key: '5', label: '选项五', disabled: true },
    { key: '6', label: '选项六' }
  ];
  const tr = document.getElementById('tr-basic');
  tr.items = items;
  tr.value = ['2', '4'];
</script>
```

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 基础用法
  const itemsBasic = [
    { key: '1', label: '选项一' },
    { key: '2', label: '选项二' },
    { key: '3', label: '选项三' },
    { key: '4', label: '选项四' },
    { key: '5', label: '选项五', disabled: true },
    { key: '6', label: '选项六' }
  ]
  const trBasic = document.getElementById('tr-basic')
  if (trBasic && !trBasic.__inited) {
    trBasic.__inited = true
    trBasic.items = itemsBasic
    trBasic.value = ['2', '4']
  }

  // 受控示例
  const itemsCtrl = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' }
  ]
  const trCtrl = document.getElementById('tr-controlled')
  const text = document.getElementById('tr-controlled-text')
  if (trCtrl && !trCtrl.__inited) {
    trCtrl.__inited = true
    trCtrl.items = itemsCtrl
    trCtrl.value = ['b']
    if (text) text.textContent = JSON.stringify(trCtrl.value)
    trCtrl.addEventListener('ldesignChange', (e) => {
      trCtrl.value = e.detail.value
      if (text) text.textContent = JSON.stringify(trCtrl.value)
    })
  }

  // 外部操作示例：全部右移 / 清空右侧
  const itemsOps = [
    { key: '10', label: 'Alpha' },
    { key: '11', label: 'Beta' },
    { key: '12', label: 'Gamma' },
    { key: '13', label: 'Delta' },
    { key: '14', label: 'Epsilon' }
  ]
  const trOps = document.getElementById('tr-ops')
  if (trOps && !trOps.__inited) {
    trOps.__inited = true
    trOps.items = itemsOps
    trOps.value = ['11']
  }
  const btnAllRight = document.getElementById('btn-ops-right')
  const btnClear = document.getElementById('btn-ops-clear')
  btnAllRight && btnAllRight.addEventListener('click', () => {
    if (trOps) trOps.value = itemsOps.map(i => i.key)
  })
  btnClear && btnClear.addEventListener('click', () => {
    if (trOps) trOps.value = []
  })

  // 动态更新 items（模拟后端加载）
  const trDynamic = document.getElementById('tr-dynamic')
  const btnLoadData = document.getElementById('btn-load-data')
  const btnAddItem = document.getElementById('btn-add-item')
  if (trDynamic && !trDynamic.__inited) {
    trDynamic.__inited = true
    trDynamic.items = [{ key: 'loading', label: '加载中...', disabled: true }]
    trDynamic.value = []
  }
  btnLoadData && btnLoadData.addEventListener('click', () => {
    if (trDynamic) {
      // 模拟异步加载
      setTimeout(() => {
        trDynamic.items = [
          { key: 'user1', label: '张三' },
          { key: 'user2', label: '李四' },
          { key: 'user3', label: '王五' },
          { key: 'user4', label: '赵六' }
        ]
      }, 800)
    }
  })
  let nextId = 5
  btnAddItem && btnAddItem.addEventListener('click', () => {
    if (trDynamic && trDynamic.items && trDynamic.items.length) {
      const newItem = { key: `user${nextId}`, label: `用户${nextId}` }
      trDynamic.items = [...trDynamic.items, newItem]
      nextId++
    }
  })

  // 自定义标题/统计显示
  const trCustom = document.getElementById('tr-custom')
  if (trCustom && !trCustom.__inited) {
    trCustom.__inited = true
    trCustom.items = [
      { key: 'task1', label: '任务A' },
      { key: 'task2', label: '任务B' },
      { key: 'task3', label: '任务C' },
      { key: 'task4', label: '任务D' },
      { key: 'task5', label: '任务E' }
    ]
    trCustom.value = ['task2']
    // 监听值变化，更新自定义统计
    trCustom.addEventListener('ldesignChange', (e) => {
      const leftCount = trCustom.items.length - e.detail.value.length
      const rightCount = e.detail.value.length
      trCustom.leftTitle = `待处理 (${leftCount})`
      trCustom.rightTitle = `已完成 (${rightCount})`
    })
    // 初始化标题
    const leftCount = trCustom.items.length - trCustom.value.length
    const rightCount = trCustom.value.length
    trCustom.leftTitle = `待处理 (${leftCount})`
    trCustom.rightTitle = `已完成 (${rightCount})`
  }
})
</script>

## 受控模式

通过监听 `ldesignChange` 并回写 `value` 属性，实现完全受控。

<div class="demo-block">
  <ldesign-transfer id="tr-controlled" left-title="源" right-title="目标"></ldesign-transfer>
  <div style="margin-top:8px;color:var(--vp-c-text-2);font-size:13px">
    当前值：<span id="tr-controlled-text"></span>
  </div>
</div>

```html
<ldesign-transfer id="tr-controlled"></ldesign-transfer>
<script>
  const items = [
    { key: 'a', label: 'A' },
    { key: 'b', label: 'B' },
    { key: 'c', label: 'C' }
  ];
  const tr = document.getElementById('tr-controlled');
  const text = document.getElementById('tr-controlled-text');
  tr.items = items;
  tr.value = ['b']; // 初值
  text.textContent = JSON.stringify(tr.value);
  tr.addEventListener('ldesignChange', (e) => {
    tr.value = e.detail.value; // 回写实现受控
    text.textContent = JSON.stringify(tr.value);
  });
</script>
```


## 使用 JSON 属性

也可以直接通过属性传入 JSON 字符串（注意转义）。

<div class="demo-block">
  <ldesign-transfer
    id="tr-json"
    :items="'[' + JSON.stringify({key:'1',label:'One'}) + ',' + JSON.stringify({key:'2',label:'Two'}) + ']'"
    default-value='["2"]'
    left-title="可选"
    right-title="已选"
  />
</div>

```html
<ldesign-transfer
  items='[{"key":"1","label":"One"},{"key":"2","label":"Two"}]'
  default-value='["2"]'
/>
```

## 禁用

支持整体禁用与项级禁用。

<div class="demo-block">
  <ldesign-transfer
    id="tr-disabled"
    :items="'[' + JSON.stringify({key:'x',label:'X'}) + ',' + JSON.stringify({key:'y',label:'Y',disabled:true}) + ']'"
    disabled
  />
</div>

```html
<ldesign-transfer
  items='[{"key":"x","label":"X"},{"key":"y","label":"Y","disabled":true}]'
  disabled
/>
```

## 外部操作（演示示例）

通过外部按钮控制 Transfer 的值，演示“全部右移”和“清空右侧”。

<div class="demo-block">
  <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap;">
    <ldesign-button id="btn-ops-right" type="primary">全部右移</ldesign-button>
    <ldesign-button id="btn-ops-clear" type="outline">清空右侧</ldesign-button>
  </div>
  <ldesign-transfer id="tr-ops" filterable left-title="可选" right-title="已选"></ldesign-transfer>
</div>

```html
<ldesign-button id="btn-ops-right">全部右移</ldesign-button>
<ldesign-button id="btn-ops-clear">清空右侧</ldesign-button>
<ldesign-transfer id="tr-ops"></ldesign-transfer>
<script>
  const items = [
    { key: '10', label: 'Alpha' },
    { key: '11', label: 'Beta' },
    { key: '12', label: 'Gamma' }
  ]
  const tr = document.getElementById('tr-ops')
  tr.items = items
  document.getElementById('btn-ops-right').onclick = () => {
    tr.value = items.map(i => i.key)
  }
  document.getElementById('btn-ops-clear').onclick = () => {
    tr.value = []
  }
</script>
```

## 动态更新数据（模拟后端加载）

演示动态更新 `items` 数据源，模拟从后端异步加载数据的场景。

<div class="demo-block">
  <div style="display:flex;gap:8px;margin-bottom:8px;align-items:center;flex-wrap:wrap;">
    <ldesign-button id="btn-load-data" type="primary">加载数据</ldesign-button>
    <ldesign-button id="btn-add-item" type="outline">添加新项</ldesign-button>
  </div>
  <ldesign-transfer id="tr-dynamic" filterable left-title="用户列表" right-title="已选用户"></ldesign-transfer>
</div>

```html
<ldesign-button id="btn-load-data">加载数据</ldesign-button>
<ldesign-button id="btn-add-item">添加新项</ldesign-button>
<ldesign-transfer id="tr-dynamic"></ldesign-transfer>
<script>
  const tr = document.getElementById('tr-dynamic')
  tr.items = [{ key: 'loading', label: '加载中...', disabled: true }]
  
  document.getElementById('btn-load-data').onclick = () => {
    setTimeout(() => {
      tr.items = [
        { key: 'user1', label: '张三' },
        { key: 'user2', label: '李四' },
        { key: 'user3', label: '王五' }
      ]
    }, 800)
  }
  
  let nextId = 4
  document.getElementById('btn-add-item').onclick = () => {
    const newItem = { key: `user${nextId}`, label: `用户${nextId}` }
    tr.items = [...tr.items, newItem]
    nextId++
  }
</script>
```

## 自定义标题/统计显示

动态更新左右标题，实时显示统计信息。

<div class="demo-block">
  <ldesign-transfer id="tr-custom" filterable></ldesign-transfer>
</div>

```html
<ldesign-transfer id="tr-custom"></ldesign-transfer>
<script>
  const tr = document.getElementById('tr-custom')
  tr.items = [
    { key: 'task1', label: '任务A' },
    { key: 'task2', label: '任务B' },
    { key: 'task3', label: '任务C' }
  ]
  tr.value = ['task2']
  
  // 监听值变化，更新标题统计
  tr.addEventListener('ldesignChange', (e) => {
    const leftCount = tr.items.length - e.detail.value.length
    const rightCount = e.detail.value.length
    tr.leftTitle = `待处理 (${leftCount})`
    tr.rightTitle = `已完成 (${rightCount})`
  })
  
  // 初始化标题
  const leftCount = tr.items.length - tr.value.length
  const rightCount = tr.value.length
  tr.leftTitle = `待处理 (${leftCount})`
  tr.rightTitle = `已完成 (${rightCount})`
</script>
```

## 事件

- `ldesignChange`: 值变化时触发，参数 `{ value: string[]; movedKeys: string[]; direction: 'left' | 'right' }`

```html
<ldesign-transfer id="tr-events"></ldesign-transfer>
<script>
  const tr = document.getElementById('tr-events');
  tr.items = [ {key:'1',label:'One'}, {key:'2',label:'Two'} ];
  tr.addEventListener('ldesignChange', (e) => {
    console.log('change:', e.detail);
  });
</script>
```

## API

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| items | 数据源（可数组或 JSON 字符串） | `TransferItem[] \| string` | `[]` |
| value | 受控值（右侧 keys） | `string[]` | - |
| defaultValue | 非受控初值（右侧 keys） | `string[]` | - |
| disabled | 禁用组件 | `boolean` | `false` |
| filterable | 开启搜索 | `boolean` | `false` |
| leftTitle | 左侧标题 | `string` | `源列表` |
| rightTitle | 右侧标题 | `string` | `目标列表` |
| listHeight | 列表高度 | `number` | `240` |

`TransferItem`：`{ key: string; label: string; disabled?: boolean }`

| 事件 | 说明 | 回调参数 |
| --- | --- | --- |
| ldesignChange | 值变化（左右移动） | `{ value: string[]; movedKeys: string[]; direction: 'left' | 'right' }` |
