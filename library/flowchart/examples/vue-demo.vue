<template>
    <div  class="demo-container">
        <div  class="header">
            <h1>Vue  组件示例</h1>
            <p>使用  Vue  组件方式集成审批流程图编辑器</p>
        </div>

        <div  class="content">
            <div  class="main">
                <ApprovalFlowEditor
                    :data="flowData"
                    :readonly="readonly"
                    :toolbar="true"
                />
            </div>
        </div>
    </div>
</template>

<script  setup  lang="ts">
import  {  ref  }  from  'vue'
import  {  ApprovalFlowEditor  }  from  '../src/index.ts'
import  type  {  FlowData  }  from  '../src/types'

const  readonly  =  ref(false)

const  flowData  =  ref<FlowData>({
    nodes:  [
        {
            id:  'start-1',
            type:  'start',
            x:  400,
            y:  100,
            label:  '开始'
        },
        {
            id:  'approval-1',
            type:  'approval',
            x:  350,
            y:  220,
            label:  '提交申请'
        },
        {
            id:  'condition-1',
            type:  'condition',
            x:  360,
            y:  340,
            label:  '金额判断'
        },
        {
            id:  'approval-2',
            type:  'approval',
            x:  250,
            y:  460,
            label:  '总监审批'
        },
        {
            id:  'approval-3',
            type:  'approval',
            x:  450,
            y:  460,
            label:  '经理审批'
        },
        {
            id:  'end-1',
            type:  'end',
            x:  400,
            y:  580,
            label:  '结束'
        }
    ],
    edges:  [
        {  source:  'start-1',  target:  'approval-1'  },
        {  source:  'approval-1',  target:  'condition-1'  },
        {  source:  'condition-1',  target:  'approval-2',  label:  '>  10000'  },
        {  source:  'condition-1',  target:  'approval-3',  label:  '<=  10000'  },
        {  source:  'approval-2',  target:  'end-1'  },
        {  source:  'approval-3',  target:  'end-1'  }
    ]
})
</script>

<style  scoped>
.demo-container  {
    width:  100%;
    height:  100vh;
    display:  flex;
    flex-direction:  column;
    background:  #f5f5f5;
}

.header  {
    background:  #fff;
    padding:  20px;
    box-shadow:  0  2px  8px  rgba(0,  0,  0,  0.1);
}

.header  h1  {
    font-size:  24px;
    margin-bottom:  10px;
}

.header  p  {
    color:  #666;
}

.content  {
    flex:  1;
    display:  flex;
    gap:  20px;
    padding:  20px;
    overflow:  hidden;
}

.main  {
    flex:  1;
    background:  #fff;
    border-radius:  4px;
    box-shadow:  0  2px  8px  rgba(0,  0,  0,  0.1);
    display:  flex;
    flex-direction:  column;
    overflow:  hidden;
}
</style>
