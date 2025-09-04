---
title: Form 基础用法
description:
---

<!--tabs-start-->
<!--tab-panel-start 示例 -->

<!-- @display ./_usage/index.vue -->

### 基础用法

通过`options`配置表单数据，更多表单组件请参考[https://wuhan.yxybb.com/ldesign/desktop-next/0.10.0](https://wuhan.yxybb.com/ldesign/desktop-next/0.10.0)

@example ./_example/base.vue

<!-- ### 默认值

通过`defaultValue`设置表单默认值

@example ./_example/defaultValue.vue

### 提交表单

可通过表单自带的查询按钮快速提交表单，也可通过组件ref实例调用`submit`方法，还可以通过`button`或者`submit`插槽来自定义提交按钮，可通过`onSubmit`来监听提交事件

::: info
注意：当使用插槽时，可通过设置`Button`的type为`submit`，无需绑定事件。
:::

在使用表单重置时，请务必给当前表单项设置一个`value`值，可通过`v-model`，和`options`进行设置。

@example ./_example/submit.vue

### 重置表单

可通过表单自带的查询按钮快速提交表单，也可通过组件ref实例调用`submit`方法，还可以通过`button`或者`reset`插槽来自定义重置按钮，可通过`onReset`来监听提交事件

::: info
注意：当使用插槽时，可通过设置`Button`的type为`reset`，无需绑定事件。
:::

@example ./_example/reset.vue

### 关联赋值

@example ./_example/relation.vue

### 计算属性

@example ./_example/options.vue

### 延迟赋值

通常用于从服务器请求数据延迟给表单赋值，常用于只读和修改表单的情况下。

@example ./_example/set-value.vue

### 前后容器

通过配置项中的`prefix`和`suffix`可以设置组件前后的内容。

@example ./_example/prefix-suffix.vue

### 条件渲染

通过表单项中的`visible`属性可动态控制当前表单项是否显示

@example ./_example/visible.vue

### 表单赋值

支持`v-model`双向绑定，同时也支持options中直接给表单项单独赋值，通过`props`，给组件传递组件属性。

@example ./_example/value.vue

### 展开收起

默认情况下，表单会渲染`options`中配置的所有表单项，可通过`previewRows`属性配置默认展示行数，多余的可通过展开按钮进行查看，支持2中形式的展开效果：`visible`，`popup`，

::: warning
弹窗模式暂不支持
:::

@example ./_example/preview-rows.vue

### 设置列宽

通过`spanWidth`可设置一列最大宽度，可通过该配置项设置一行显示几列，但是不能完全固定，会根据容器宽度自动计算。

注意：列宽不宜设置太小的值。

@example ./_example/span-width.vue

### 列数设置

效果有些类似`spanWidth`，都是用来控制一行显示多少列。

span可设置form固定列数，当设置该项之后不会根据设备自动调整列数（谨慎使用）。

minSpan设置最小列数，maxSpan设置最大列数。

@example ./_example/max-span.vue

### 按钮位置

通过`buttonPosition`可设置按钮组的排列方式，支持`inline`和`block`.

::: warning
注意：只有在设置了`previewRows`才有效果。
:::

@example ./_example/button-position.vue

### 所占列数

上面已经介绍了很多关于列的设置，通过`options`对象数组中的`span`属性可设置每一项所占列数，如果没有设置则默认占1列，支持数字和字符串。

@example ./_example/span.vue

### 按钮列数

上面介绍了如何给每一个表单项设置列数，通过`buttonSpan`属性，还可以给按钮组设置所占列数，不过一般不推荐修改，过长的按钮组占位会影响页面的美观程度。

@example ./_example/button-span.vue

### 按钮对齐方式

通过`buttonAlign`可设置按钮组的水平对齐方式。

@example ./_example/button-align.vue

### 间距

表单可通过`space`改变表单项之间的间隔，通过`gap`改变标题和表单组件之间的间隔。

@example ./_example/gutter.vue

### 是否显示冒号

通过属性`colon`可设置标题后面显示一个冒号，一般情况不要手动添加冒号，组件会根据当前语言环境自行添加中/英文冒号。

@example ./_example/colon.vue

### 标题位置

通过`labelAlign`可设置表单项标题的对齐方式，支持：`left`，`right`，`top`。

@example ./_example/label-align.vue

### 不同形式的表单

表单默认展现形式为查询表单，可通过`variant`设置不同的表单展现形式，支持：`search`，`entry`，`document`

@example ./_example/variant.vue

### 表单校验

通过`rules`设置表单的校验规则，具体请参考：[Form](https://wuhan.yxybb.com/ldesign/desktop-next/0.10.0/#/components/input-component/form)中对表单校验的介绍，也可以在options中设置rule的值针对某一个表单项的校验规则。

@example ./_example/rules.vue

### 只读模式

给表单设置`readonly`属性，可设置表单为只读模式。

@example ./_example/readonly.vue

### 禁用模式

给表单设置`disabled`属性，可设置表单为禁用模式。

@example ./_example/disabled.vue

### 附加按钮

通过`extraContent`可设置表单附加按钮

@example ./_example/addition-button.vue

### 自定义插槽

表单组件可通过如下插槽自定义一些功能区域。

#### 查询按钮

自定义表单提交按钮

@example ./_example/submit-slot.vue

#### 重置按钮

自定义表单重置按钮

@example ./_example/reset-slot.vue

#### 展开按钮

仅在 `expandType`为`visible`时有效。

@example ./_example/expand-slot.vue

### 分组表单

可以将一个表单根据标题在视觉上拆分成多个表单。

@example ./_example/group.vue

### 展开回调

@example ./_example/on-expand.vue -->

<!--tab-panel-end-->
<!--tab-panel-start API-->
### Form Props

名称 | 类型 | 默认值 | 描述 | 必传
-- | -- | -- | -- | --
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
defaultValue | Object | - | 表单的默认值，不可改变。 | N
value | Object | - | 表单的值，不会改变，通过onChange监听。 | N
v-model | Object | - | 表单的值，支持双向绑定。 | Y
previewRows | Number | - | 表单默认展示的行数，通常用于查询页面顶部的查询条件，当表单项过多的时候可通过设置该项默认隐藏一部分。 | Y
maxSpan | Number | - | 设置表单一行最多可容乃的列数，默认会根据当前容器宽度自动计算，也可以自行设置 | Y
spanWidth | Number | 320 | 每列最小宽度，如果没有设置maxSpan的时候会根据当前配置自动计算一行能容乃多少列 | Y
visible | Boolean | - | 当设置了previewRows时会将剩余的表单项隐藏起来，可通过该项控制是否显示剩余的表单项 | Y
buttonPosition | inline/block | inline | 表单按钮组的排列方式，inline表示紧跟表单项之后，block表示按钮组会独自占领一行空间 | Y
buttonSpan | Number | 1 | 按钮组所占的列数，一般情况无需更改 | Y
buttonAlign | left/center/right | right | 按钮组的水平对齐方式 | Y
gutter | Number | - | 表单项之间的间隔 | Y
space | Number | - | 表单项中标题和表单组件之间的间隔，也称为表单项间水平间隔 | Y
colon | Boolean | - | 是否显示标题后面的冒号。 | Y
labelWidth | Number | - | 标题的宽度，一般情况会自动计算，无需设置 | Y
labelAlign | left/right/top | - | 标题的对齐方式 | Y
resetType | initial/empty | - | 重置表单的方式 | Y
requiredMark | Boolean | - | 是否显示星号必填 | Y
rules | Array | - | 表单校验规则 | Y
variant | document/entry/default | - | 表单形式 | Y
expandType | visible/popup | - | 更多表单的隐藏方式 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y
options | Array | - | 表单配置项，用于配置每一个表单项的详细信息。 | Y

### Affix Events

名称 | 参数 | 描述
-- | -- | --
fixed-change | `(affixed: boolean, context: { top: number })` | 固定状态发生变化时触发
<!--tab-panel-end-->
<!--tabs-end-->
