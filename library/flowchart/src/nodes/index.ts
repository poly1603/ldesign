import  {  Graph  }  from  '@antv/x6'
import  {  NodeType  }  from  '../types'

/**
  *  节点基础样式配置
  */
const  baseNodeConfig  =  {
    attrs:  {
        body:  {
            strokeWidth:  1,
            stroke:  '#5F95FF',
            fill:  '#EFF4FF',
            rx:  4,
            ry:  4
        },
        label:  {
            fontSize:  14,
            fill:  '#262626',
            textAnchor:  'middle',
            textVerticalAnchor:  'middle'
        }
    },
    ports:  {
        groups:  {
            top:  {
                position:  'top',
                attrs:  {
                    circle:  {
                        r:  4,
                        magnet:  true,
                        stroke:  '#5F95FF',
                        strokeWidth:  1,
                        fill:  '#fff'
                    }
                }
            },
            right:  {
                position:  'right',
                attrs:  {
                    circle:  {
                        r:  4,
                        magnet:  true,
                        stroke:  '#5F95FF',
                        strokeWidth:  1,
                        fill:  '#fff'
                    }
                }
            },
            bottom:  {
                position:  'bottom',
                attrs:  {
                    circle:  {
                        r:  4,
                        magnet:  true,
                        stroke:  '#5F95FF',
                        strokeWidth:  1,
                        fill:  '#fff'
                    }
                }
            },
            left:  {
                position:  'left',
                attrs:  {
                    circle:  {
                        r:  4,
                        magnet:  true,
                        stroke:  '#5F95FF',
                        strokeWidth:  1,
                        fill:  '#fff'
                    }
                }
            }
        }
    }
}

/**
  *  注册所有节点类型
  */
export  function  registerNodes()  {
    //  开始节点
    Graph.registerNode(
        NodeType.Start,
        {
            inherit:  'circle',
            width:  60,
            height:  60,
            attrs:  {
                body:  {
                    strokeWidth:  2,
                    stroke:  '#52C41A',
                    fill:  '#F6FFED'
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'bottom'  }
                ]
            }
        },
        true
    )

    //  审批节点
    Graph.registerNode(
        NodeType.Approval,
        {
            inherit:  'rect',
            width:  120,
            height:  60,
            ...baseNodeConfig,
            attrs:  {
                body:  {
                    strokeWidth:  1,
                    stroke:  '#5F95FF',
                    fill:  '#EFF4FF',
                    rx:  4,
                    ry:  4
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'top'  },
                    {  group:  'bottom'  }
                ]
            }
        },
        true
    )

    //  条件节点
    Graph.registerNode(
        NodeType.Condition,
        {
            inherit:  'polygon',
            width:  100,
            height:  60,
            attrs:  {
                body:  {
                    strokeWidth:  1,
                    stroke:  '#FFA940',
                    fill:  '#FFF7E6',
                    refPoints:  '0,10  10,0  20,10  10,20'
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'top'  },
                    {  group:  'right'  },
                    {  group:  'bottom'  },
                    {  group:  'left'  }
                ]
            }
        },
        true
    )

    //  抄送节点
    Graph.registerNode(
        NodeType.CC,
        {
            inherit:  'rect',
            width:  120,
            height:  60,
            ...baseNodeConfig,
            attrs:  {
                body:  {
                    strokeWidth:  1,
                    stroke:  '#13C2C2',
                    fill:  '#E6FFFB',
                    rx:  4,
                    ry:  4
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'top'  },
                    {  group:  'bottom'  }
                ]
            }
        },
        true
    )

    //  并行节点
    Graph.registerNode(
        NodeType.Parallel,
        {
            inherit:  'polygon',
            width:  100,
            height:  60,
            attrs:  {
                body:  {
                    strokeWidth:  1,
                    stroke:  '#722ED1',
                    fill:  '#F9F0FF',
                    refPoints:  '0,10  10,0  20,10  10,20'
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'top'  },
                    {  group:  'right'  },
                    {  group:  'bottom'  },
                    {  group:  'left'  }
                ]
            }
        },
        true
    )

    //  结束节点
    Graph.registerNode(
        NodeType.End,
        {
            inherit:  'circle',
            width:  60,
            height:  60,
            attrs:  {
                body:  {
                    strokeWidth:  2,
                    stroke:  '#FF4D4F',
                    fill:  '#FFF1F0'
                },
                label:  {
                    fontSize:  14,
                    fill:  '#262626'
                }
            },
            ports:  {
                ...baseNodeConfig.ports,
                items:  [
                    {  group:  'top'  }
                ]
            }
        },
        true
    )
}

/**
  *  注册边样式
  */
export  function  registerEdges()  {
    Graph.registerEdge(
        'approval-edge',
        {
            inherit:  'edge',
            attrs:  {
                line:  {
                    stroke:  '#A2B1C3',
                    strokeWidth:  2,
                    targetMarker:  {
                        name:  'block',
                        width:  12,
                        height:  8
                    }
                }
            },
            router:  {
                name:  'manhattan',
                args:  {
                    padding:  10
                }
            },
            connector:  {
                name:  'rounded',
                args:  {
                    radius:  8
                }
            }
        },
        true
    )
}
