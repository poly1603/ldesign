# Table 表格

展示行列数据。

## 基础用法

最简单的表格用法。

<Demo 
  title="基础表格" 
  description="最基本的表格展示。"
  :code='`<ld-table>
  <p>基础表格内容</p>
</ld-table>`'
>
  <ld-table>
    <p>基础表格内容</p>
  </ld-table>
</Demo>

## 带边框表格

有边框的表格显示效果。

<Demo 
  title="带边框表格" 
  description="通过 bordered 属性添加边框。"
  :code='`<ld-table bordered>
  <p>带边框的表格内容</p>
</ld-table>`'
>
  <ld-table bordered>
    <p>带边框的表格内容</p>
  </ld-table>
</Demo>

## API

### 属性

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `data` | 显示的数据 | `any[]` | `[]` |
| `columns` | 表格列的配置 | `Column[]` | `[]` |
| `bordered` | 是否显示边框 | `boolean` | `false` |
| `selectable` | 是否可选择 | `boolean` | `false` |
| `loading` | 是否加载中 | `boolean` | `false` |
| `empty-text` | 空数据时显示的文本 | `string` | `'暂无数据'` |

### 事件

| 事件名 | 说明 | 回调参数 |
| --- | --- | --- |
| `ldRowClick` | 点击行时触发 | `(row: any, index: number) => void` |
| `ldSelectionChange` | 选择改变时触发 | `(selection: any[]) => void` |

### 插槽

| 插槽名 | 说明 |
| --- | --- |
| default | 表格内容 |
| header | 表头内容 |
| empty | 空状态内容 |
