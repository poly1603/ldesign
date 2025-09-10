/**
 * UI 文案集中管理（简易 i18n）
 * 默认提供中文文案
 */

export const i18n = {
  statusBar: {
    labels: {
      mode: '模式',
      zoom: '缩放',
      snap: '吸附',
      selection: '选中',
      cursor: '坐标',
      zoomOut: '缩小',
      zoomReset: '重置缩放',
      zoomFit: '适配',
      zoomIn: '放大',
      toggleSnap: '点击切换网格吸附',
      cycleSnap: '切换吸附步长',
    },
    tips: {
      connecting: '连接中：拖到目标端口完成连接',
      connectCanceled: '连接已取消',
      connectCreated: '连接已创建',
      reconnecting: '端点重连中：拖到新的端口完成',
      reconnectCanceled: '已取消端点重连',
      insertWaypoint: '已插入转折点',
      removeWaypoint: '已删除转折点',
      dragWaypoint: '拖拽转折点：按住 Shift 锁轴',
      waypointUpdated: '转折点已更新',
      dragControl: '拖拽控制点：按住 Shift 锁轴',
      controlUpdated: '控制点已更新',
      controlReset: '控制点已重置',
      edgeType: (type: unknown) => `连接线类型：${String(type)}`,
      snapOn: '网格吸附：开',
      snapOff: '网格吸附：关',
      snapSize: (size: number) => `吸附步长: ${size}`,
      selectHint: '提示：双击直角边插入转折点；双击贝塞尔控制点重置',
      panHint: '按住鼠标拖动画布进行平移',
      executed: (name: string) => `已执行：${name}`,
      undone: (name: string) => `已撤销：${name}`,
      redone: (name: string) => `已重做：${name}`,
    }
  }
};

