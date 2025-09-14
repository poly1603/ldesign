/**
 * Vue 3 适配器
 * 
 * 提供Vue 3组件包装器，使树形组件能够在Vue应用中使用
 */

import { defineComponent, ref, onMounted, onUnmounted, watch, computed, h, type PropType } from 'vue'
import { Tree } from '../core/tree'
import type { TreeOptions, TreeNodeData } from '../types'

/**
 * Vue 3 树形组件
 */
export const LDesignTree = defineComponent({
  name: 'LDesignTree',
  props: {
    // 数据
    data: {
      type: Array as PropType<TreeNodeData[]>,
      default: () => [],
    },
    
    // 配置选项
    options: {
      type: Object as PropType<Partial<TreeOptions>>,
      default: () => ({}),
    },

    // 选中的节点
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },

    // 展开的节点
    expandedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },

    // 选择模式
    selectionMode: {
      type: String as PropType<'single' | 'multiple' | 'cascade'>,
      default: 'single',
    },

    // 是否显示复选框
    showCheckbox: {
      type: Boolean,
      default: false,
    },

    // 是否可拖拽
    draggable: {
      type: Boolean,
      default: false,
    },

    // 是否可搜索
    searchable: {
      type: Boolean,
      default: false,
    },

    // 搜索关键词
    searchKeyword: {
      type: String,
      default: '',
    },

    // 虚拟滚动
    virtualScroll: {
      type: Boolean,
      default: false,
    },

    // 异步加载
    asyncLoad: {
      type: Function as PropType<(node: any) => Promise<TreeNodeData[]>>,
      default: undefined,
    },

    // 主题
    theme: {
      type: String as PropType<'light' | 'dark' | 'compact' | 'comfortable'>,
      default: 'light',
    },

    // 尺寸
    size: {
      type: String as PropType<'small' | 'medium' | 'large'>,
      default: 'medium',
    },

    // 是否禁用
    disabled: {
      type: Boolean,
      default: false,
    },

    // 加载状态
    loading: {
      type: Boolean,
      default: false,
    },

    // 空状态文本
    emptyText: {
      type: String,
      default: '暂无数据',
    },
  },

  emits: [
    'update:selectedKeys',
    'update:expandedKeys',
    'update:searchKeyword',
    'select',
    'expand',
    'collapse',
    'check',
    'uncheck',
    'dragStart',
    'dragEnd',
    'drop',
    'search',
    'load',
    'error',
  ],

  setup(props, { emit, expose }) {
    const containerRef = ref<HTMLElement>()
    const treeInstance = ref<Tree>()

    // 计算配置
    const treeOptions = computed<TreeOptions>(() => ({
      selection: {
        mode: props.selectionMode,
        showCheckbox: props.showCheckbox,
      },
      dragDrop: {
        enabled: props.draggable,
      },
      search: {
        enabled: props.searchable,
      },
      virtualScroll: {
        enabled: props.virtualScroll,
      },
      async: {
        enabled: !!props.asyncLoad,
        loader: props.asyncLoad,
      },
      theme: props.theme,
      size: props.size,
      disabled: props.disabled,
      loading: props.loading,
      emptyText: props.emptyText,
      ...props.options,
    }))

    // 初始化树形组件
    const initTree = () => {
      if (!containerRef.value) return

      treeInstance.value = new Tree(containerRef.value, treeOptions.value)

      // 绑定事件
      treeInstance.value.on('select', (nodeIds: string[]) => {
        emit('update:selectedKeys', nodeIds)
        emit('select', nodeIds)
      })

      treeInstance.value.on('expand', (nodeId: string) => {
        const expandedKeys = [...props.expandedKeys]
        if (!expandedKeys.includes(nodeId)) {
          expandedKeys.push(nodeId)
          emit('update:expandedKeys', expandedKeys)
        }
        emit('expand', nodeId)
      })

      treeInstance.value.on('collapse', (nodeId: string) => {
        const expandedKeys = props.expandedKeys.filter(id => id !== nodeId)
        emit('update:expandedKeys', expandedKeys)
        emit('collapse', nodeId)
      })

      treeInstance.value.on('check', (nodeIds: string[]) => {
        emit('check', nodeIds)
      })

      treeInstance.value.on('uncheck', (nodeIds: string[]) => {
        emit('uncheck', nodeIds)
      })

      treeInstance.value.on('dragStart', (nodeId: string) => {
        emit('dragStart', nodeId)
      })

      treeInstance.value.on('dragEnd', (nodeId: string) => {
        emit('dragEnd', nodeId)
      })

      treeInstance.value.on('drop', (data: any) => {
        emit('drop', data)
      })

      treeInstance.value.on('search', (keyword: string, results: any[]) => {
        emit('update:searchKeyword', keyword)
        emit('search', keyword, results)
      })

      treeInstance.value.on('load', (nodeId: string, data: TreeNodeData[]) => {
        emit('load', nodeId, data)
      })

      treeInstance.value.on('error', (error: Error) => {
        emit('error', error)
      })

      // 设置初始数据
      if (props.data.length > 0) {
        treeInstance.value.setData(props.data)
      }

      // 设置初始选中状态
      if (props.selectedKeys.length > 0) {
        treeInstance.value.setSelectedNodes(props.selectedKeys)
      }

      // 设置初始展开状态
      if (props.expandedKeys.length > 0) {
        treeInstance.value.setExpandedNodes(props.expandedKeys)
      }

      // 设置初始搜索关键词
      if (props.searchKeyword) {
        treeInstance.value.search(props.searchKeyword)
      }
    }

    // 监听数据变化
    watch(() => props.data, (newData) => {
      if (treeInstance.value) {
        treeInstance.value.setData(newData)
      }
    }, { deep: true })

    // 监听选中状态变化
    watch(() => props.selectedKeys, (newKeys) => {
      if (treeInstance.value) {
        treeInstance.value.setSelectedNodes(newKeys)
      }
    })

    // 监听展开状态变化
    watch(() => props.expandedKeys, (newKeys) => {
      if (treeInstance.value) {
        treeInstance.value.setExpandedNodes(newKeys)
      }
    })

    // 监听搜索关键词变化
    watch(() => props.searchKeyword, (newKeyword) => {
      if (treeInstance.value) {
        treeInstance.value.search(newKeyword)
      }
    })

    // 监听配置变化
    watch(treeOptions, (newOptions) => {
      if (treeInstance.value) {
        treeInstance.value.updateOptions(newOptions)
      }
    }, { deep: true })

    // 生命周期
    onMounted(() => {
      initTree()
    })

    onUnmounted(() => {
      if (treeInstance.value) {
        treeInstance.value.destroy()
      }
    })

    // 暴露方法
    expose({
      // 获取树实例
      getTreeInstance: () => treeInstance.value,
      
      // 数据操作
      setData: (data: TreeNodeData[]) => treeInstance.value?.setData(data),
      getData: () => treeInstance.value?.getData(),
      addNode: (nodeData: TreeNodeData, parentId?: string) => treeInstance.value?.addNode(nodeData, parentId),
      removeNode: (nodeId: string) => treeInstance.value?.removeNode(nodeId),
      updateNode: (nodeId: string, nodeData: Partial<TreeNodeData>) => treeInstance.value?.updateNode(nodeId, nodeData),
      
      // 选择操作
      selectNode: (nodeId: string) => treeInstance.value?.selectNode(nodeId),
      unselectNode: (nodeId: string) => treeInstance.value?.unselectNode(nodeId),
      selectAll: () => treeInstance.value?.selectAll(),
      unselectAll: () => treeInstance.value?.unselectAll(),
      getSelectedNodes: () => treeInstance.value?.getSelectedNodes(),
      
      // 展开操作
      expandNode: (nodeId: string) => treeInstance.value?.expandNode(nodeId),
      collapseNode: (nodeId: string) => treeInstance.value?.collapseNode(nodeId),
      expandAll: () => treeInstance.value?.expandAll(),
      collapseAll: () => treeInstance.value?.collapseAll(),
      
      // 搜索操作
      search: (keyword: string) => treeInstance.value?.search(keyword),
      clearSearch: () => treeInstance.value?.clearSearch(),
      
      // 滚动操作
      scrollToNode: (nodeId: string) => treeInstance.value?.scrollToNode(nodeId),
      
      // 刷新
      refresh: () => treeInstance.value?.refresh(),
    })

    return {
      containerRef,
    }
  },

  render() {
    return h('div', {
      ref: 'containerRef',
      class: [
        'ldesign-tree-vue',
        {
          [`ldesign-tree--${this.theme}`]: this.theme !== 'light',
          [`ldesign-tree--${this.size}`]: this.size !== 'medium',
          'ldesign-tree--disabled': this.disabled,
          'ldesign-tree--loading': this.loading,
        },
      ],
    })
  },
})

/**
 * Vue 3 插件
 */
export const LDesignTreePlugin = {
  install(app: any) {
    app.component('LDesignTree', LDesignTree)
  },
}

// 默认导出
export default LDesignTree
