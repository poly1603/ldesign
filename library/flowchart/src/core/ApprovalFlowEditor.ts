import  {  Graph,  Node,  Edge  }  from  '@antv/x6'
import  {  Snapline  }  from  '@antv/x6-plugin-snapline'
import  {  Keyboard  }  from  '@antv/x6-plugin-keyboard'
import  {  Clipboard  }  from  '@antv/x6-plugin-clipboard'
import  {  History  }  from  '@antv/x6-plugin-history'
import  {  Selection  }  from  '@antv/x6-plugin-selection'
import  {  MiniMap  }  from  '@antv/x6-plugin-minimap'
import  {  Scroller  }  from  '@antv/x6-plugin-scroller'
import  {  Transform  }  from  '@antv/x6-plugin-transform'
import  {  Dnd  }  from  '@antv/x6-plugin-dnd'
import  {  registerNodes,  registerEdges  }  from  '../nodes'
import  {  Toolbar,  ToolbarOptions  }  from  '../components/Toolbar'
import  type  {  EditorOptions,  FlowData,  FlowNode,  FlowEdge,  EditorEvents  }  from  '../types'

/**
  *  审批流程图编辑器
  */
export  class  ApprovalFlowEditor  {
    private  graph:  Graph
    private  readonly:  boolean
    private  toolbar:  Toolbar  |  null  =  null
    private  eventHandlers:  Map<string,  Set<Function>>  =  new  Map()

    constructor(options:  EditorOptions)  {
        this.readonly  =  options.readonly  ||  false

        //  注册自定义节点和边
        registerNodes()
        registerEdges()

        //  获取容器
        const  container  =  typeof  options.container  ===  'string'
            ?  document.querySelector(options.container)
            :  options.container

        if  (!container)  {
            throw  new  Error('Container  not  found')
        }

        //  创建画布
        this.graph  =  new  Graph({
            container:  container  as  HTMLElement,
            width:  options.width  ||  800,
            height:  options.height  ||  600,
            grid:  options.grid  !==  false  ?  {
                size:  options.gridSize  ||  10,
                visible:  true,
                type:  'dot',
                args:  {
                    color:  '#D0D0D0',
                    thickness:  1
                }
            }  :  false,
            panning:  !this.readonly  ?  {
                enabled:  true,
                modifiers:  'shift'
            }  :  false,
            mousewheel:  {
                enabled:  true,
                modifiers:  ['ctrl',  'meta'],
                minScale:  0.5,
                maxScale:  2
            },
            connecting:  !this.readonly  ?  {
                snap:  true,
                allowBlank:  false,
                allowLoop:  false,
                allowNode:  false,
                allowEdge:  false,
                allowMulti:  false,
                highlight:  true,
                connector:  'rounded',
                router:  {
                    name:  'manhattan',
                    args:  {
                        padding:  10
                    }
                },
                createEdge()  {
                    return  this.createEdge({
                        shape:  'approval-edge',
                        zIndex:  -1
                    })
                },
                validateConnection({  targetMagnet  })  {
                    return  !!targetMagnet
                }
            }  :  undefined,
            highlighting:  {
                magnetAvailable:  {
                    name:  'stroke',
                    args:  {
                        attrs:  {
                            fill:  '#5F95FF',
                            stroke:  '#5F95FF'
                        }
                    }
                }
            },
            interacting:  this.readonly  ?  false  :  undefined,
            autoResize:  true
        })

        //  初始化插件
        this.initPlugins(options)

        //  设置初始数据
        if  (options.data)  {
            this.setData(options.data)
        }

        //  绑定事件
        this.bindEvents()
    }

    /**
      *  初始化插件
      */
    private  initPlugins(options:  EditorOptions)  {
        //  对齐线
        if  (options.snapline  !==  false  &&  !this.readonly)  {
            this.graph.use(
                new  Snapline({
                    enabled:  true
                })
            )
        }

        //  键盘快捷键
        if  (options.keyboard  !==  false  &&  !this.readonly)  {
            this.graph.use(
                new  Keyboard({
                    enabled:  true
                })
            )

            //  绑定快捷键
            this.graph.bindKey(['meta+c',  'ctrl+c'],  ()  =>  {
                const  cells  =  this.graph.getSelectedCells()
                if  (cells.length)  {
                    this.graph.copy(cells)
                }
                return  false
            })

            this.graph.bindKey(['meta+x',  'ctrl+x'],  ()  =>  {
                const  cells  =  this.graph.getSelectedCells()
                if  (cells.length)  {
                    this.graph.cut(cells)
                }
                return  false
            })

            this.graph.bindKey(['meta+v',  'ctrl+v'],  ()  =>  {
                if  (!this.graph.isClipboardEmpty())  {
                    const  cells  =  this.graph.paste({  offset:  32  })
                    this.graph.cleanSelection()
                    this.graph.select(cells)
                }
                return  false
            })

            this.graph.bindKey(['backspace',  'delete'],  ()  =>  {
                const  cells  =  this.graph.getSelectedCells()
                if  (cells.length)  {
                    this.graph.removeCells(cells)
                }
            })

            this.graph.bindKey(['meta+z',  'ctrl+z'],  ()  =>  {
                if  (this.graph.canUndo())  {
                    this.graph.undo()
                }
                return  false
            })

            this.graph.bindKey(['meta+shift+z',  'ctrl+shift+z'],  ()  =>  {
                if  (this.graph.canRedo())  {
                    this.graph.redo()
                }
                return  false
            })
        }

        //  剪贴板
        if  (options.clipboard  !==  false  &&  !this.readonly)  {
            this.graph.use(
                new  Clipboard({
                    enabled:  true
                })
            )
        }

        //  撤销重做
        if  (options.history  !==  false  &&  !this.readonly)  {
            this.graph.use(
                new  History({
                    enabled:  true
                })
            )
        }

        //  选择
        if  (options.selecting  !==  false  &&  !this.readonly)  {
            this.graph.use(
                new  Selection({
                    enabled:  true,
                    multiple:  true,
                    rubberband:  true,
                    movable:  true,
                    showNodeSelectionBox:  true
                })
            )
        }

        //  小地图
        if  (options.minimap  &&  !this.readonly)  {
            this.graph.use(
                new  MiniMap({
                    container:  options.minimapOptions?.container,
                    width:  options.minimapOptions?.width  ||  200,
                    height:  options.minimapOptions?.height  ||  160,
                    padding:  options.minimapOptions?.padding  ||  10
                })
            )
        }

        //  工具栏
        if  (options.toolbar  !==  false  &&  !this.readonly)  {
            const  toolbarOptions  =  typeof  options.toolbar  ===  'object'  
                ?  options.toolbar  
                :  {  container:  this.graph.container  as  HTMLElement  }
            
            this.toolbar  =  new  Toolbar(this,  toolbarOptions)
        }

        //  滚动
        if  (!this.readonly)  {
            this.graph.use(
                new  Scroller({
                    enabled:  true,
                    pannable:  true,
                    pageVisible:  false,
                    pageBreak:  false
                })
            )
        }

        //  变换
        if  (!this.readonly)  {
            this.graph.use(
                new  Transform({
                    resizing:  {
                        enabled:  true,
                        minWidth:  60,
                        minHeight:  40,
                        orthogonal:  false
                    },
                    rotating:  false
                })
            )
        }
    }

    /**
      *  绑定事件
      */
    private  bindEvents()  {
        //  节点事件
        this.graph.on('node:click',  ({  node  })  =>  {
            this.emit('node:click',  node)
        })

        this.graph.on('node:dblclick',  ({  node  })  =>  {
            this.emit('node:dblclick',  node)
        })

        this.graph.on('node:selected',  ({  node  })  =>  {
            this.emit('node:selected',  node)
        })

        //  边事件
        this.graph.on('edge:click',  ({  edge  })  =>  {
            this.emit('edge:click',  edge)
        })

        this.graph.on('edge:dblclick',  ({  edge  })  =>  {
            this.emit('edge:dblclick',  edge)
        })

        //  画布事件
        this.graph.on('blank:click',  ()  =>  {
            this.emit('blank:click')
        })

        //  数据变化事件
        if  (!this.readonly)  {
            this.graph.on('node:added  node:removed  node:changed  edge:added  edge:removed  edge:changed',  ()  =>  {
                this.emit('change',  this.getData())
            })
        }
    }

    /**
      *  设置数据
      */
    setData(data:  FlowData)  {
        const  {  nodes,  edges  }  =  data

        //  清空画布
        this.graph.clearCells()

        //  添加节点
        nodes.forEach((node)  =>  {
            this.graph.addNode({
                id:  node.id,
                shape:  node.type,
                x:  node.x,
                y:  node.y,
                width:  node.width,
                height:  node.height,
                label:  node.label,
                data:  node.data
            })
        })

        //  添加边
        edges.forEach((edge)  =>  {
            this.graph.addEdge({
                id:  edge.id,
                shape:  'approval-edge',
                source:  edge.source,
                target:  edge.target,
                label:  edge.label,
                data:  edge.data
            })
        })

        //  居中显示
        this.centerContent()
    }

    /**
      *  获取数据
      */
    getData():  FlowData  {
        const  nodes:  FlowNode[]  =  []
        const  edges:  FlowEdge[]  =  []

        this.graph.getNodes().forEach((node)  =>  {
            const  position  =  node.position()
            const  size  =  node.size()

            nodes.push({
                id:  node.id,
                type:  node.shape,
                x:  position.x,
                y:  position.y,
                width:  size.width,
                height:  size.height,
                label:  node.getAttrByPath('label/text')  ||  '',
                data:  node.getData()
            })
        })

        this.graph.getEdges().forEach((edge)  =>  {
            const  source  =  edge.getSourceCellId()
            const  target  =  edge.getTargetCellId()

            if  (source  &&  target)  {
                edges.push({
                    id:  edge.id,
                    source,
                    target,
                    label:  edge.getAttrByPath('label/text')  ||  '',
                    data:  edge.getData()
                })
            }
        })

        return  {  nodes,  edges  }
    }

    /**
      *  添加节点
      */
    addNode(node:  FlowNode)  {
        return  this.graph.addNode({
            id:  node.id,
            shape:  node.type,
            x:  node.x,
            y:  node.y,
            width:  node.width,
            height:  node.height,
            label:  node.label,
            data:  node.data
        })
    }

    /**
      *  删除节点
      */
    removeNode(nodeId:  string)  {
        const  node  =  this.graph.getCellById(nodeId)
        if  (node)  {
            this.graph.removeCell(node)
        }
    }

    /**
      *  更新节点
      */
    updateNode(nodeId:  string,  data:  Partial<FlowNode>)  {
        const  node  =  this.graph.getCellById(nodeId)  as  Node
        if  (node)  {
            if  (data.label  !==  undefined)  {
                node.setAttrByPath('label/text',  data.label)
            }
            if  (data.x  !==  undefined  ||  data.y  !==  undefined)  {
                node.position(data.x  ||  node.position().x,  data.y  ||  node.position().y)
            }
            if  (data.width  !==  undefined  ||  data.height  !==  undefined)  {
                const  size  =  node.size()
                node.size(data.width  ||  size.width,  data.height  ||  size.height)
            }
            if  (data.data)  {
                node.setData(data.data)
            }
        }
    }

    /**
      *  居中显示内容
      */
    centerContent()  {
        this.graph.centerContent()
    }

    /**
      *  缩放
      */
    zoom(factor:  number,  options?:  {  center?:  {  x:  number;  y:  number  }  })  {
        this.graph.zoom(factor,  options)
        this.emit('scale:change')
    }

    /**
      *  缩放到指定比例
      */
    zoomTo(ratio:  number,  options?:  {  center?:  {  x:  number;  y:  number  }  })  {
        this.graph.zoomTo(ratio,  options)
        this.emit('scale:change')
    }

    /**
      *  缩放到适应
      */
    zoomToFit(options?:  {  padding?:  number;  maxScale?:  number  })  {
        this.graph.zoomToFit({
            padding:  options?.padding  ||  20,
            maxScale:  options?.maxScale  ||  1
        })
    }

    /**
      *  撤销
      */
    undo()  {
        if  (this.graph.canUndo())  {
            this.graph.undo()
            this.emit('history:change')
        }
    }

    /**
      *  重做
      */
    redo()  {
        if  (this.graph.canRedo())  {
            this.graph.redo()
            this.emit('history:change')
        }
    }

    /**
      *  是否可以撤销
      */
    canUndo()  {
        return  this.graph.canUndo()
    }

    /**
      *  是否可以重做
      */
    canRedo()  {
        return  this.graph.canRedo()
    }

    /**
      *  清空画布
      */
    clear()  {
        this.graph.clearCells()
    }

    /**
      *  清空画布（别名）
      */
    clearGraph()  {
        this.clear()
    }

    /**
      *  导出JSON
      */
    toJSON()  {
        return  this.graph.toJSON()
    }

    /**
      *  从JSON导入
      */
    fromJSON(data:  any)  {
        this.graph.fromJSON(data)
    }

    /**
      *  导出PNG
      */
    async  toPNG(options?:  {  backgroundColor?:  string;  padding?:  number  }):  Promise<string>  {
        //  使用  X6  的  export  功能
        return  await  (this.graph  as  any).exportPNG({
            backgroundColor:  options?.backgroundColor  ||  '#ffffff',
            padding:  options?.padding  ||  20
        })  ||  ''
    }

    /**
      *  导出PNG文件
      */
    async  exportPNG(filename:  string  =  'flowchart.png',  options?:  {  backgroundColor?:  string;  padding?:  number  })  {
        const  dataUri  =  await  this.toPNG(options)
        const  link  =  document.createElement('a')
        link.href  =  dataUri
        link.download  =  filename
        link.click()
    }

    /**
      *  导出SVG
      */
    async  toSVG():  Promise<string>  {
        //  使用  X6  的  export  功能
        return  await  (this.graph  as  any).exportSVG()  ||  ''
    }

    /**
      *  事件监听
      */
    on<K  extends  keyof  EditorEvents>(event:  K,  handler:  EditorEvents[K])  {
        if  (!this.eventHandlers.has(event))  {
            this.eventHandlers.set(event,  new  Set())
        }
        this.eventHandlers.get(event)!.add(handler  as  Function)
    }

    /**
      *  移除事件监听
      */
    off<K  extends  keyof  EditorEvents>(event:  K,  handler:  EditorEvents[K])  {
        const  handlers  =  this.eventHandlers.get(event)
        if  (handlers)  {
            handlers.delete(handler  as  Function)
        }
    }

    /**
      *  触发事件
      */
    private  emit(event:  string,  ...args:  any[])  {
        const  handlers  =  this.eventHandlers.get(event)
        if  (handlers)  {
            handlers.forEach((handler)  =>  handler(...args))
        }
    }

    /**
      *  获取Graph实例
      */
    getGraph()  {
        return  this.graph
    }

    /**
      *  切换全屏
      */
    toggleFullscreen()  {
        const  container  =  this.getContainer()
        if  (!document.fullscreenElement)  {
            container.requestFullscreen()
        }  else  {
            document.exitFullscreen()
        }
    }

    /**
      *  验证流程
      */
    validate():  {  valid:  boolean;  errors:  string[]  }  {
        const  errors:  string[]  =  []
        const  nodes  =  this.graph.getNodes()
        const  edges  =  this.graph.getEdges()
        
        //  检查是否有节点
        if  (nodes.length  ===  0)  {
            errors.push('流程图中没有节点')
        }
        
        //  检查是否有开始节点
        const  startNodes  =  nodes.filter(node  =>  node.shape  ===  'start-node')
        if  (startNodes.length  ===  0)  {
            errors.push('没有开始节点')
        }  else  if  (startNodes.length  >  1)  {
            errors.push('不能有多个开始节点')
        }
        
        //  检查是否有结束节点
        const  endNodes  =  nodes.filter(node  =>  node.shape  ===  'end-node')
        if  (endNodes.length  ===  0)  {
            errors.push('没有结束节点')
        }
        
        //  检查没有连接的节点
        nodes.forEach(node  =>  {
            const  connectedEdges  =  edges.filter(
                edge  =>  edge.getSourceCellId()  ===  node.id  ||  edge.getTargetCellId()  ===  node.id
            )
            if  (connectedEdges.length  ===  0  &&  node.shape  !==  'start-node'  &&  node.shape  !==  'end-node')  {
                errors.push(`节点  "${node.getAttrByPath('label/text')  ||  node.id}"  没有连接`)
            }
        })
        
        return  {
            valid:  errors.length  ===  0,
            errors
        }
    }

    /**
      *  获取容器
      */
    getContainer():  HTMLElement  {
        return  this.graph.container  as  HTMLElement
    }

    /**
      *  销毁
      */
    destroy()  {
        if  (this.toolbar)  {
            this.toolbar.destroy()
            this.toolbar  =  null
        }
        this.eventHandlers.clear()
        this.graph.dispose()
    }
}
