import    {    defineComponent,    ref,    onMounted,    onUnmounted,    watch,    h,    PropType    }    from    'vue'
import    {    ApprovalFlowEditor    }    from    './core/ApprovalFlowEditor'
import    type    {    FlowData,    EditorOptions    }    from    './types'

/**
    *    Vue    组件
    */
export    const    ApprovalFlowEditorComponent    =    defineComponent({
        name:    'ApprovalFlowEditor',
        props:    {
                //    流程数据
                data:    {
                        type:    Object    as    PropType<FlowData>,
                        default:    ()    =>    ({    nodes:    [],    edges:    []    })
                },
                //    是否只读
                readonly:    {
                        type:    Boolean,
                        default:    false
                },
                //    是否显示网格
                grid:    {
                        type:    Boolean,
                        default:    true
                },
                //    网格大小
                gridSize:    {
                        type:    Number,
                        default:    10
                },
                //    是否启用小地图
                minimap:    {
                        type:    Boolean,
                        default:    false
                },
                //    是否启用对齐线
                snapline:    {
                        type:    Boolean,
                        default:    true
                },
                //    是否启用键盘快捷键
                keyboard:    {
                        type:    Boolean,
                        default:    true
                },
                //    是否启用撤销重做
                history:    {
                        type:    Boolean,
                        default:    true
                },
                //    是否启用剪贴板
                clipboard:    {
                        type:    Boolean,
                        default:    true
                },
                //    是否启用选择
                selecting:    {
                        type:    Boolean,
                        default:    true
                },
                //    是否启用工具栏
                toolbar:    {
                        type:    [Boolean,    Object],
                        default:    true
                },
                //    画布宽度
                width:    {
                        type:    Number,
                        default:    undefined
                },
                //    画布高度
                height:    {
                        type:    Number,
                        default:    undefined
                }
        },
        emits:    ['change',    'node-click',    'node-dblclick',    'node-selected',    'edge-click',    'edge-dblclick',    'blank-click',    'ready'],
        setup(props,    {    emit,    expose    })    {
                const    containerRef    =    ref<HTMLDivElement>()
                const    minimapRef    =    ref<HTMLDivElement>()
                let    editor:    ApprovalFlowEditor    |    null    =    null

                onMounted(()    =>    {
                        if    (!containerRef.value)    return

                        //    创建编辑器
                        const    options:    EditorOptions    =    {
                                container:    containerRef.value,
                                readonly:    props.readonly,
                                grid:    props.grid,
                                gridSize:    props.gridSize,
                                minimap:    props.minimap,
                                minimapOptions:    props.minimap    ?    {
                                        enabled:    true,
                                        container:    minimapRef.value
                                }    :    undefined,
                                snapline:    props.snapline,
                                keyboard:    props.keyboard,
                                history:    props.history,
                                clipboard:    props.clipboard,
                                selecting:    props.selecting,
                                toolbar:    props.toolbar,
                                width:    props.width    ||    containerRef.value.clientWidth,
                                height:    props.height    ||    containerRef.value.clientHeight,
                                data:    props.data
                        }

                        editor    =    new    ApprovalFlowEditor(options)

                        //    绑定事件
                        editor.on('change',    (data)    =>    emit('change',    data))
                        editor.on('node:click',    (node)    =>    emit('node-click',    node))
                        editor.on('node:dblclick',    (node)    =>    emit('node-dblclick',    node))
                        editor.on('node:selected',    (node)    =>    emit('node-selected',    node))
                        editor.on('edge:click',    (edge)    =>    emit('edge-click',    edge))
                        editor.on('edge:dblclick',    (edge)    =>    emit('edge-dblclick',    edge))
                        editor.on('blank:click',    ()    =>    emit('blank-click'))

                        //    触发    ready    事件
                        emit('ready',    editor)
                })

                onUnmounted(()    =>    {
                        if    (editor)    {
                                editor.destroy()
                                editor    =    null
                        }
                })

                //    监听数据变化
                watch(
                        ()    =>    props.data,
                        (newData)    =>    {
                                if    (editor    &&    newData)    {
                                        editor.setData(newData)
                                }
                        },
                        {    deep:    true    }
                )

                //    暴露方法
                expose({
                        getEditor:    ()    =>    editor,
                        getData:    ()    =>    editor?.getData(),
                        setData:    (data:    FlowData)    =>    editor?.setData(data),
                        addNode:    (node:    any)    =>    editor?.addNode(node),
                        removeNode:    (nodeId:    string)    =>    editor?.removeNode(nodeId),
                        updateNode:    (nodeId:    string,    data:    any)    =>    editor?.updateNode(nodeId,    data),
                        centerContent:    ()    =>    editor?.centerContent(),
                        zoom:    (factor:    number,    options?:    any)    =>    editor?.zoom(factor,    options),
                        zoomToFit:    (options?:    any)    =>    editor?.zoomToFit(options),
                        undo:    ()    =>    editor?.undo(),
                        redo:    ()    =>    editor?.redo(),
                        clear:    ()    =>    editor?.clear(),
                        toJSON:    ()    =>    editor?.toJSON(),
                        fromJSON:    (data:    any)    =>    editor?.fromJSON(data),
                        toPNG:    (options?:    any)    =>    editor?.toPNG(options),
                        toSVG:    ()    =>    editor?.toSVG()
                })

                return    ()    =>    {
                        const    containerStyle    =    {
                                width:    props.width    ?    `${props.width}px`    :    '100%',
                                height:    props.height    ?    `${props.height}px`    :    '100%',
                                position:    'relative'    as    const
                        }

                        return    h('div',    {    class:    'approval-flow-editor-wrapper',    style:    containerStyle    },    [
                                h('div',    {    ref:    containerRef,    class:    'approval-flow-editor-container'    }),
                                props.minimap    &&    h('div',    {    ref:    minimapRef,    class:    'approval-flow-editor-minimap'    })
                        ])
                }
        }
})

export    default    ApprovalFlowEditorComponent
