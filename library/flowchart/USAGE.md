#  使用指南

##  快速开始

###  1.  安装依赖

```bash
pnpm  install
```

###  2.  查看示例

```bash
pnpm  dev
```

打开浏览器访问  `http://localhost:5173/examples/index.html`

##  API  文档

###  ApprovalFlowEditor  类

核心编辑器类,可以在任何JavaScript环境中使用。

####  构造函数

```typescript
constructor(options:  EditorOptions)
```

**options  参数:**

-  `container`:  `HTMLElement  |  string`  -  容器元素或选择器(必填)
-  `readonly`:  `boolean`  -  是否只读模式,默认  `false`
-  `grid`:  `boolean`  -  是否显示网格,默认  `true`
-  `gridSize`:  `number`  -  网格大小,默认  `10`
-  `minimap`:  `boolean`  -  是否启用小地图,默认  `false`
-  `snapline`:  `boolean`  -  是否启用对齐线,默认  `true`
-  `keyboard`:  `boolean`  -  是否启用键盘快捷键,默认  `true`
-  `history`:  `boolean`  -  是否启用撤销重做,默认  `true`
-  `clipboard`:  `boolean`  -  是否启用剪贴板,默认  `true`
-  `selecting`:  `boolean`  -  是否启用选择,默认  `true`
-  `data`:  `FlowData`  -  初始数据
-  `width`:  `number`  -  画布宽度
-  `height`:  `number`  -  画布高度

####  方法

**setData(data:  FlowData)**

设置流程图数据。

```typescript
editor.setData({
        nodes:  [
                {  id:  'start',  type:  'start',  x:  100,  y:  100,  label:  '开始'  }
        ],
        edges:  []
})
```

**getData():  FlowData**

获取当前流程图数据。

```typescript
const  data  =  editor.getData()
console.log(data)
```

**addNode(node:  FlowNode)**

添加节点。

```typescript
editor.addNode({
        id:  'approval-1',
        type:  'approval',
        x:  200,
        y:  200,
        label:  '审批节点'
})
```

**removeNode(nodeId:  string)**

删除节点。

```typescript
editor.removeNode('approval-1')
```

**updateNode(nodeId:  string,  data:  Partial<FlowNode>)**

更新节点。

```typescript
editor.updateNode('approval-1',  {
        label:  '新标签',
        x:  300,
        y:  300
})
```

**centerContent()**

将内容居中显示。

```typescript
editor.centerContent()
```

**zoom(factor:  number,  options?)**

缩放画布。

```typescript
editor.zoom(0.1)  //  放大
editor.zoom(-0.1)  //  缩小
```

**zoomToFit(options?)**

缩放到适应画布。

```typescript
editor.zoomToFit({  padding:  20,  maxScale:  1  })
```

**undo()**

撤销操作。

```typescript
editor.undo()
```

**redo()**

重做操作。

```typescript
editor.redo()
```

**clear()**

清空画布。

```typescript
editor.clear()
```

**toJSON()**

导出为JSON格式。

```typescript
const  json  =  editor.toJSON()
```

**fromJSON(data)**

从JSON格式导入。

```typescript
editor.fromJSON(jsonData)
```

**toPNG(options?)**

导出为PNG图片。

```typescript
const  png  =  await  editor.toPNG({
        backgroundColor:  '#ffffff',
        padding:  20
})
```

**toSVG()**

导出为SVG格式。

```typescript
const  svg  =  await  editor.toSVG()
```

**on(event,  handler)**

监听事件。

```typescript
editor.on('change',  (data)  =>  {
        console.log('数据变化:',  data)
})

editor.on('node:click',  (node)  =>  {
        console.log('节点点击:',  node)
})
```

**off(event,  handler)**

移除事件监听。

```typescript
editor.off('change',  handler)
```

**getGraph()**

获取底层X6  Graph实例。

```typescript
const  graph  =  editor.getGraph()
```

**destroy()**

销毁编辑器。

```typescript
editor.destroy()
```

###  Vue  组件

####  Props

-  `data`:  `FlowData`  -  流程数据
-  `readonly`:  `boolean`  -  是否只读
-  `grid`:  `boolean`  -  是否显示网格
-  `gridSize`:  `number`  -  网格大小
-  `minimap`:  `boolean`  -  是否启用小地图
-  `snapline`:  `boolean`  -  是否启用对齐线
-  `keyboard`:  `boolean`  -  是否启用键盘快捷键
-  `history`:  `boolean`  -  是否启用撤销重做
-  `clipboard`:  `boolean`  -  是否启用剪贴板
-  `selecting`:  `boolean`  -  是否启用选择
-  `width`:  `number`  -  画布宽度
-  `height`:  `number`  -  画布高度

####  Events

-  `change`:  数据变化事件
-  `node-click`:  节点点击事件
-  `node-dblclick`:  节点双击事件
-  `node-selected`:  节点选中事件
-  `edge-click`:  边点击事件
-  `edge-dblclick`:  边双击事件
-  `blank-click`:  画布点击事件
-  `ready`:  编辑器就绪事件

####  Expose  Methods

通过  ref  可以访问以下方法:

```vue
<template>
    <ApprovalFlowEditor  ref="editorRef"  />
</template>

<script  setup>
import  {  ref  }  from  'vue'

const  editorRef  =  ref()

//  使用方法
editorRef.value.getData()
editorRef.value.setData(data)
editorRef.value.addNode(node)
//  ...  等等
</script>
```

##  节点类型

-  `start`:  开始节点(绿色圆形)
-  `approval`:  审批节点(蓝色矩形)
-  `condition`:  条件节点(橙色菱形)
-  `cc`:  抄送节点(青色矩形)
-  `parallel`:  并行节点(紫色菱形)
-  `end`:  结束节点(红色圆形)

##  键盘快捷键

-  `Ctrl/Cmd  +  C`:  复制
-  `Ctrl/Cmd  +  X`:  剪切
-  `Ctrl/Cmd  +  V`:  粘贴
-  `Ctrl/Cmd  +  Z`:  撤销
-  `Ctrl/Cmd  +  Shift  +  Z`:  重做
-  `Delete/Backspace`:  删除选中元素

##  数据格式

```typescript
interface  FlowData  {
        nodes:  Array<{
                id:  string
                type:  'start'  |  'approval'  |  'condition'  |  'cc'  |  'parallel'  |  'end'
                x:  number
                y:  number
                label:  string
                width?:  number
                height?:  number
                data?:  Record<string,  any>
        }>
        edges:  Array<{
                id?:  string
                source:  string
                target:  string
                label?:  string
                data?:  Record<string,  any>
        }>
}
```

##  高级用法

###  自定义节点样式

```typescript
import  {  Graph  }  from  '@antv/x6'

//  注册自定义节点
Graph.registerNode('custom-node',  {
        inherit:  'rect',
        width:  120,
        height:  60,
        attrs:  {
                body:  {
                        fill:  '#ff0000',
                        stroke:  '#000000'
                },
                label:  {
                        fill:  '#ffffff'
                }
        }
})
```

###  监听更多事件

```typescript
const  graph  =  editor.getGraph()

//  监听X6原生事件
graph.on('node:mouseenter',  ({  node  })  =>  {
        console.log('鼠标进入节点',  node)
})

graph.on('edge:connected',  ({  edge  })  =>  {
        console.log('边连接完成',  edge)
})
```

###  自定义连接规则

```typescript
const  graph  =  editor.getGraph()

//  设置连接验证
graph.on('edge:connected',  ({  edge  })  =>  {
        const  source  =  edge.getSourceNode()
        const  target  =  edge.getTargetNode()

        //  自定义规则:  结束节点不能连接到其他节点
        if  (source?.shape  ===  'end')  {
                edge.remove()
                alert('结束节点不能作为起点')
        }
})
```

##  常见问题

###  Q:  如何实现节点拖拽创建?

A:  参考  `examples/index.html`  中的拖拽实现。

###  Q:  如何保存和加载流程图?

A:  使用  `getData()`  和  `setData()`  方法:

```typescript
//  保存
const  data  =  editor.getData()
localStorage.setItem('flowchart',  JSON.stringify(data))

//  加载
const  savedData  =  JSON.parse(localStorage.getItem('flowchart'))
editor.setData(savedData)
```

###  Q:  如何实现节点双击编辑?

A:  监听  `node:dblclick`  事件:

```typescript
editor.on('node:dblclick',  (node)  =>  {
        const  newLabel  =  prompt('请输入新标签',  node.getAttrByPath('label/text'))
        if  (newLabel)  {
                editor.updateNode(node.id,  {  label:  newLabel  })
        }
})
```

###  Q:  如何导出高清图片?

A:  使用  `toPNG`  方法并设置合适的参数:

```typescript
const  png  =  await  editor.toPNG({
        backgroundColor:  '#ffffff',
        padding:  40
})
```

##  更多资源

-  [AntV  X6  官方文档](https://x6.antv.antgroup.com/)
-  [示例代码](./examples)
