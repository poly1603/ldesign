import  type  {  Graph,  Node,  Edge  }  from  '@antv/x6'

/**
  *  节点类型
  */
export  enum  NodeType  {
    /**  开始节点  */
    Start  =  'start',
    /**  审批节点  */
    Approval  =  'approval',
    /**  条件节点  */
    Condition  =  'condition',
    /**  抄送节点  */
    CC  =  'cc',
    /**  并行节点  */
    Parallel  =  'parallel',
    /**  结束节点  */
    End  =  'end'
}

/**
  *  节点数据接口
  */
export  interface  FlowNode  {
    /**  节点ID  */
    id:  string
    /**  节点类型  */
    type:  NodeType  |  string
    /**  X坐标  */
    x:  number
    /**  Y坐标  */
    y:  number
    /**  节点标签  */
    label:  string
    /**  节点宽度  */
    width?:  number
    /**  节点高度  */
    height?:  number
    /**  扩展数据  */
    data?:  Record<string,  any>
}

/**
  *  边数据接口
  */
export  interface  FlowEdge  {
    /**  边ID  */
    id?:  string
    /**  源节点ID  */
    source:  string
    /**  目标节点ID  */
    target:  string
    /**  边标签  */
    label?:  string
    /**  扩展数据  */
    data?:  Record<string,  any>
}

/**
  *  流程图数据
  */
export  interface  FlowData  {
    /**  节点列表  */
    nodes:  FlowNode[]
    /**  边列表  */
    edges:  FlowEdge[]
}

/**
  *  编辑器配置
  */
export  interface  EditorOptions  {
    /**  容器元素  */
    container:  HTMLElement  |  string
    /**  是否只读模式  */
    readonly?:  boolean
    /**  是否显示网格  */
    grid?:  boolean
    /**  网格大小  */
    gridSize?:  number
    /**  是否启用小地图  */
    minimap?:  boolean
    /**  小地图配置  */
    minimapOptions?:  MinimapOptions
    /**  是否启用工具栏  */
    toolbar?:  boolean  |  ToolbarOptions
    /**  是否启用对齐线  */
    snapline?:  boolean
    /**  是否启用键盘快捷键  */
    keyboard?:  boolean
    /**  是否启用撤销重做  */
    history?:  boolean
    /**  是否启用剪贴板  */
    clipboard?:  boolean
    /**  是否启用选择  */
    selecting?:  boolean
    /**  初始数据  */
    data?:  FlowData
    /**  画布宽度  */
    width?:  number
    /**  画布高度  */
    height?:  number
}

/**
  *  小地图配置
  */
export  interface  MinimapOptions  {
    enabled?:  boolean
    container?:  HTMLElement
    width?:  number
    height?:  number
    padding?:  number
}

/**
  *  事件回调类型
  */
export  interface  EditorEvents  {
    /**  数据变化  */
    change:  (data:  FlowData)  =>  void
    /**  节点点击  */
    'node:click':  (node:  Node)  =>  void
    /**  节点双击  */
    'node:dblclick':  (node:  Node)  =>  void
    /**  节点选中  */
    'node:selected':  (node:  Node)  =>  void
    /**  边点击  */
    'edge:click':  (edge:  Edge)  =>  void
    /**  边双击  */
    'edge:dblclick':  (edge:  Edge)  =>  void
    /**  画布点击  */
    'blank:click':  ()  =>  void
    /**  历史变化  */
    'history:change':  ()  =>  void
    /**  缩放变化  */
    'scale:change':  ()  =>  void
}

/**
  *  节点配置
  */
export  interface  NodeConfig  {
    type:  string
    width:  number
    height:  number
    label:  string
    icon?:  string
    color?:  string
}

/**
  *  工具栏配置
  */
export  interface  ToolbarOptions  {
    /**  工具栏容器  */
    container?:  HTMLElement  |  string
    /**  工具栏位置  */
    position?:  'top'  |  'bottom'  |  'left'  |  'right'
    /**  自定义工具  */
    tools?:  ToolbarTool[]
}

/**
  *  工具栏工具配置
  */
export  interface  ToolbarTool  {
    /**  工具名称  */
    name:  string
    /**  工具图标  */
    icon:  string
    /**  工具提示  */
    title:  string
    /**  点击动作  */
    action:  (editor:  any)  =>  void
    /**  是否为分隔符  */
    separator?:  boolean
    /**  是否可见  */
    visible?:  boolean  |  ((editor:  any)  =>  boolean)
}
