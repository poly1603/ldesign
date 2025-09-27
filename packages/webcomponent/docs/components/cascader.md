# Cascader 级联选择器

基于 `<ldesign-popup>` 与 `<ldesign-drawer>` 的级联选择器：
- PC 使用 Popup 作为承载
- 移动端自动切换为 Drawer（也可通过 `overlay` 强制）

- 组件标签：`<ldesign-cascader>`
- 依赖：`<ldesign-popup>`、`<ldesign-drawer>`

## 基础用法
<div class="demo-container">
  <ldesign-cascader id="cascader-basic" placeholder="请选择地区"></ldesign-cascader>
</div>

```html
<ldesign-cascader id="cascader-basic" placeholder="请选择地区"></ldesign-cascader>
<script>
  const data = [
    { label: '江苏省', value: 'js', children: [
      { label: '南京市', value: 'nj', children: [ { label: '玄武区', value: 'xw' }, { label: '秦淮区', value: 'qh' }, { label: '建邺区', value: 'jy' } ] },
      { label: '苏州市', value: 'sz' }
    ]},
    { label: '浙江省', value: 'zj', children: [
      { label: '杭州市', value: 'hz', children: [ { label: '西湖区', value: 'xh' }, { label: '滨江区', value: 'bj' } ] }
    ]}
  ];
  document.getElementById('cascader-basic').setAttribute('options', JSON.stringify(data));
</script>
```

## 点击非叶子即提交（changeOnSelect）
<div class="demo-container">
  <ldesign-cascader id="cascader-change" change-on-select placeholder="选择省/市"></ldesign-cascader>
</div>

```html
<ldesign-cascader id="cascader-change" change-on-select placeholder="选择省/市"></ldesign-cascader>
<script>
  document.getElementById('cascader-change').setAttribute('options', JSON.stringify(window.__cascaderDemoData))
</script>
```

## 移动端 Drawer 承载（强制）
<div class="demo-container">
  <ldesign-cascader id="cascader-drawer" overlay="drawer" drawer-title="请选择地区"></ldesign-cascader>
</div>

```html
<ldesign-cascader id="cascader-drawer" overlay="drawer" drawer-title="请选择地区"></ldesign-cascader>
<script>
  document.getElementById('cascader-drawer').setAttribute('options', JSON.stringify(window.__cascaderDemoData))
</script>
```

## 受控可见性（手动模式）
<div class="demo-container" style="display:flex; gap: 8px; align-items:center;">
  <ldesign-button id="btn-open-cascader">打开/关闭</ldesign-button>
  <ldesign-cascader id="cascader-manual" trigger="manual"></ldesign-cascader>
</div>

```html
<ldesign-button id="btn-open-cascader">打开/关闭</ldesign-button>
<ldesign-cascader id="cascader-manual" trigger="manual"></ldesign-cascader>
<script>
  const el = document.getElementById('cascader-manual');
  el.setAttribute('options', JSON.stringify(window.__cascaderDemoData));
  document.getElementById('btn-open-cascader').addEventListener('click', () => { el.visible = !el.visible; });
</script>
```

## 自定义分隔符与清空
<div class="demo-container">
  <ldesign-cascader id="cascader-sep" separator=" > " clearable placeholder="自定义分隔符"></ldesign-cascader>
</div>

```html
<ldesign-cascader id="cascader-sep" separator=" > " clearable placeholder="自定义分隔符"></ldesign-cascader>
<script>
  document.getElementById('cascader-sep').setAttribute('options', JSON.stringify(window.__cascaderDemoData))
</script>
```

## 面板尺寸（Popup 模式）
<div class="demo-container">
  <ldesign-cascader id="cascader-size" panel-width="520" list-max-height="220"></ldesign-cascader>
</div>

```html
<ldesign-cascader id="cascader-size" panel-width="520" list-max-height="220"></ldesign-cascader>
<script>
  document.getElementById('cascader-size').setAttribute('options', JSON.stringify(window.__cascaderDemoData))
</script>
```

## 事件
- `ldesignChange`: `{ value: string[] | undefined, options: CascaderOption[] }`
- `ldesignVisibleChange`: `boolean`

## 属性（Props）
- options: CascaderOption[] | string(JSON)
- value / default-value: 选中路径（数组）
- placeholder: 占位文案，默认“请选择”
- separator: 触发器显示的层级分隔符，默认 ` / `
- clearable: 是否可清空，默认 false
- change-on-select: 点击非叶子是否直接触发变更，默认 false
- close-on-select: 选择后自动关闭（非 manual 模式），默认 true
- overlay: 'auto' | 'popup' | 'drawer'，默认 auto（窗口宽度 < md 时自动 Drawer）
- trigger: 'click' | 'manual'，默认 click
- visible: 受控可见性（仅 manual 有效）
- placement: Popup 位置，默认 'bottom-start'
- drawer-placement / drawer-size / drawer-title: Drawer 配置
- list-max-height: 列表最大高度（像素），默认 280
- panel-width: 面板宽度（Popup 模式）

> 下方脚本为演示代码，构建站点时自动运行以填充示例数据。

<script setup>
import { onMounted } from 'vue'

// 共享示例数据供多个 demo 复用
const demoData = [
  { label: '江苏省', value: 'js', children: [
    { label: '南京市', value: 'nj', children: [
      { label: '玄武区', value: 'xw' },
      { label: '秦淮区', value: 'qh' },
      { label: '建邺区', value: 'jy' },
    ] },
    { label: '苏州市', value: 'sz', children: [
      { label: '姑苏区', value: 'gs' },
      { label: '吴中区', value: 'wz' },
    ] },
  ]},
  { label: '浙江省', value: 'zj', children: [
    { label: '杭州市', value: 'hz', children: [
      { label: '西湖区', value: 'xh' },
      { label: '滨江区', value: 'bj' },
      { label: '余杭区', value: 'yh' },
    ] },
    { label: '宁波市', value: 'nb', children: [ { label: '海曙区', value: 'hs' } ] },
  ]},
]

onMounted(() => {
  // 暴露到 window 以便 <script> 示例里直接复用
  window.__cascaderDemoData = demoData

  const ids = ['cascader-basic','cascader-change','cascader-drawer','cascader-manual','cascader-sep','cascader-size']
  ids.forEach(id => {
    const el = document.getElementById(id)
    if (el) el.setAttribute('options', JSON.stringify(demoData))
  })
  
  // 绑定手动模式按钮事件
  const btnOpen = document.getElementById('btn-open-cascader')
  const cascaderManual = document.getElementById('cascader-manual')
  if (btnOpen && cascaderManual) {
    btnOpen.addEventListener('click', () => {
      cascaderManual.visible = !cascaderManual.visible
    })
  }
})
</script>