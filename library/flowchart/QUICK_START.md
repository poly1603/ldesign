#    快速开始指南

##    🚀    5分钟上手

###    第一步:    安装依赖

在项目根目录运行:

```bash
pnpm    install
```

###    第二步:    查看示例

启动开发服务器:

```bash
pnpm    dev
```

打开浏览器访问:    http://localhost:5173/examples/index.html

###    第三步:    在你的项目中使用

####    方式一:    Vue    组件(推荐)

```vue
<template>
    <ApprovalFlowEditor
        :data="flowData"
        :readonly="false"
        @change="handleChange"
    />
</template>

<script    setup>
import    {    ref    }    from    'vue'
import    {    ApprovalFlowEditor    }    from    '@ldesign/flowchart'
import    '@ldesign/flowchart/dist/index.css'

const    flowData    =    ref({
    nodes:    [
        {
            id:    'start',
            type:    'start',
            x:    100,
            y:    100,
            label:    '开始'
        }
    ],
    edges:    []
})

const    handleChange    =    (data)    =>    {
    console.log('数据变化:',    data)
}
</script>
```

####    方式二:    原生    JavaScript

```html
<!DOCTYPE    html>
<html>
<head>
    <link    rel="stylesheet"    href="node_modules/@ldesign/flowchart/dist/index.css">
</head>
<body>
    <div    id="app"    style="width:    100%;    height:    600px;"></div>

    <script    type="module">
        import    {    ApprovalFlowEditor    }    from    '@ldesign/flowchart'

        const    editor    =    new    ApprovalFlowEditor({
            container:    '#app',
            data:    {
                nodes:    [
                    {    id:    'start',    type:    'start',    x:    100,    y:    100,    label:    '开始'    }
                ],
                edges:    []
            }
        })

        editor.on('change',    (data)    =>    console.log(data))
    </script>
</body>
</html>
```

##    📦    项目结构

```
flowchart/
├──    src/                            #    源代码
│      ├──    core/                        #    核心功能
│      │      └──    ApprovalFlowEditor.ts        #    编辑器主类
│      ├──    nodes/                      #    节点定义
│      │      └──    index.ts                  #    节点注册
│      ├──    types/                      #    类型定义
│      │      └──    index.ts                  #    类型导出
│      ├──    styles/                    #    样式文件
│      │      └──    index.css                #    主样式
│      ├──    vue.ts                      #    Vue组件
│      └──    index.ts                    #    入口文件
├──    examples/                      #    示例
│      ├──    index.html                  #    原生JS示例
│      └──    vue-demo.vue                #    Vue组件示例
├──    package.json
├──    tsconfig.json
├──    vite.config.ts
├──    README.md                        #    项目说明
├──    USAGE.md                          #    使用文档
└──    QUICK_START.md                    #    快速开始
```

##    🎨    节点类型

|    节点类型    |    说明    |    颜色    |    形状    |
|------------|--------|--------|--------|
|    start          |    开始节点    |    绿色    |    圆形    |
|    approval    |    审批节点    |    蓝色    |    矩形    |
|    condition    |    条件节点    |    橙色    |    菱形    |
|    cc                |    抄送节点    |    青色    |    矩形    |
|    parallel    |    并行节点    |    紫色    |    菱形    |
|    end              |    结束节点    |    红色    |    圆形    |

##    ⌨️    键盘快捷键

-    `Ctrl/Cmd    +    C`:    复制选中节点
-    `Ctrl/Cmd    +    V`:    粘贴节点
-    `Ctrl/Cmd    +    Z`:    撤销
-    `Ctrl/Cmd    +    Shift    +    Z`:    重做
-    `Delete`:    删除选中元素

##    💡    常用功能

###    添加节点

```typescript
editor.addNode({
    id:    'node-1',
    type:    'approval',
    x:    200,
    y:    200,
    label:    '审批节点'
})
```

###    获取数据

```typescript
const    data    =    editor.getData()
console.log(data)
```

###    导出图片

```typescript
const    png    =    await    editor.toPNG()
const    a    =    document.createElement('a')
a.href    =    png
a.download    =    'flowchart.png'
a.click()
```

###    撤销/重做

```typescript
editor.undo()    //    撤销
editor.redo()    //    重做
```

###    缩放

```typescript
editor.zoom(0.1)                            //    放大
editor.zoom(-0.1)                          //    缩小
editor.zoomToFit()                          //    适应画布
editor.centerContent()                  //    居中
```

##    🔧    配置选项

```typescript
const    editor    =    new    ApprovalFlowEditor({
    container:    '#app',                  //    容器(必填)
    readonly:    false,                        //    是否只读
    grid:    true,                                  //    显示网格
    gridSize:    10,                              //    网格大小
    minimap:    true,                            //    小地图
    snapline:    true,                          //    对齐线
    keyboard:    true,                          //    键盘快捷键
    history:    true,                            //    撤销重做
    clipboard:    true,                        //    剪贴板
    selecting:    true,                        //    选择功能
    width:    800,                                  //    画布宽度
    height:    600                                  //    画布高度
})
```

##    📚    更多文档

-    [完整    API    文档](./USAGE.md)
-    [AntV    X6    官方文档](https://x6.antv.antgroup.com/)

##    💬    问题反馈

如有问题,请提交    Issue。

##    📄    许可证

MIT    License
