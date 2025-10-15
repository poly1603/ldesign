/**
    *    @ldesign/flowchart
    *    A    powerful    approval    workflow    flowchart    editor    based    on    AntV    X6
    */

//    导出核心类
export    {    ApprovalFlowEditor    }    from    './core/ApprovalFlowEditor'

//    导出Vue组件
export    {    ApprovalFlowEditorComponent    }    from    './vue'
export    {    default    as    default    }    from    './vue'

//    导出类型
export    type    {
        NodeType,
        FlowNode,
        FlowEdge,
        FlowData,
        EditorOptions,
        EditorEvents,
        MinimapOptions,
        NodeConfig
}    from    './types'

//    导出节点注册函数
export    {    registerNodes,    registerEdges    }    from    './nodes'

//    导入样式
import    './styles/index.css'
