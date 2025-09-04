---
title: Form 进阶用法
description:
---

### 配合非表单组件使用

@example ./_example/advance-table.vue

### 基础用法

通过设置`code`代码表的值，实现从服务端获取表单项options列表。

@example ./_example/advance-base.vue

### 自定义请求方法

通过设置`load`函数，实现在定义获取代码表的值

@example ./_example/advance-load.vue

### 级联

通过`relation`属性可设置表单项的联动效果，值为一个对象，name为关联的表单项名称，type为联动方式，`empty`代表父层改变后字表单项清空，当为数字的时候则会赋值options中的第几项。

@example ./_example/advance-cascade.vue

### 配合弹窗使用

@example ./_example/advance-dialog.vue

### 只读

@example ./_example/advance-readonly.vue
