# ld-table



<!-- Auto Generated Below -->


## Overview

Table 表格组件

用于展示行列数据的表格组件，支持排序、筛选、分页等功能

## Properties

| Property           | Attribute           | Description   | Type                             | Default      |
| ------------------ | ------------------- | ------------- | -------------------------------- | ------------ |
| `bordered`         | `bordered`          | 是否显示边框        | `boolean`                        | `false`      |
| `columns`          | `columns`           | 表格列配置         | `TableColumn[]`                  | `[]`         |
| `customClass`      | `custom-class`      | 自定义样式类名       | `string`                         | `undefined`  |
| `data`             | `data`              | 表格数据          | `TableRow[]`                     | `[]`         |
| `emptyText`        | `empty-text`        | 空数据提示         | `string`                         | `'暂无数据'`     |
| `filterable`       | `filterable`        | 是否可筛选         | `boolean`                        | `false`      |
| `fixedHeader`      | `fixed-header`      | 是否固定表头        | `boolean`                        | `false`      |
| `height`           | `height`            | 表格高度（固定表头时使用） | `number \| string`               | `undefined`  |
| `loading`          | `loading`           | 加载状态          | `boolean`                        | `false`      |
| `pagination`       | `pagination`        | 是否显示分页        | `boolean`                        | `false`      |
| `paginationConfig` | `pagination-config` | 分页配置          | `PaginationConfig`               | `undefined`  |
| `resizable`        | `resizable`         | 是否可调整列宽       | `boolean`                        | `false`      |
| `selectable`       | `selectable`        | 是否可选择行        | `boolean`                        | `false`      |
| `selectionType`    | `selection-type`    | 选择类型          | `"checkbox" \| "radio"`          | `'checkbox'` |
| `showHeader`       | `show-header`       | 是否显示表头        | `boolean`                        | `true`       |
| `size`             | `size`              | 表格尺寸          | `"large" \| "medium" \| "small"` | `'medium'`   |
| `sortable`         | `sortable`          | 是否可排序         | `boolean`                        | `false`      |
| `striped`          | `striped`           | 是否显示斑马纹       | `boolean`                        | `false`      |


## Events

| Event          | Description | Type                                |
| -------------- | ----------- | ----------------------------------- |
| `ldFilter`     | 筛选事件        | `CustomEvent<TableFilterEvent>`     |
| `ldPageChange` | 分页事件        | `CustomEvent<TablePageChangeEvent>` |
| `ldRowClick`   | 行点击事件       | `CustomEvent<TableRowClickEvent>`   |
| `ldRowSelect`  | 行选择事件       | `CustomEvent<TableRowSelectEvent>`  |
| `ldSort`       | 排序事件        | `CustomEvent<TableSortEvent>`       |


## Methods

### `clearSelection() => Promise<void>`

清空选择

#### Returns

Type: `Promise<void>`



### `getSelectedRows() => Promise<TableRow[]>`

获取选中的行

#### Returns

Type: `Promise<TableRow[]>`



### `setSelectedRows(keys: (string | number)[]) => Promise<void>`

设置选中的行

#### Parameters

| Name   | Type                   | Description |
| ------ | ---------------------- | ----------- |
| `keys` | `(string \| number)[]` |             |

#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
