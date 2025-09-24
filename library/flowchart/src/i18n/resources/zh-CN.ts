/**
 * 中文翻译资源
 */

export const zhCNTranslations = {
  // 通用
  common: {
    ok: '确定',
    cancel: '取消',
    confirm: '确认',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    add: '添加',
    remove: '移除',
    close: '关闭',
    open: '打开',
    copy: '复制',
    paste: '粘贴',
    cut: '剪切',
    undo: '撤销',
    redo: '重做',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    export: '导出',
    import: '导入',
    upload: '上传',
    download: '下载',
    loading: '加载中...',
    error: '错误',
    warning: '警告',
    info: '信息',
    success: '成功',
    yes: '是',
    no: '否',
    all: '全部',
    none: '无',
    selected: '已选择',
    name: '名称',
    type: '类型',
    description: '描述',
    created: '创建时间',
    updated: '更新时间',
    author: '作者',
    version: '版本',
    status: '状态',
    actions: '操作'
  },

  // 流程图编辑器
  flowchart: {
    title: '流程图编辑器',
    
    // 工具栏
    toolbar: {
      select: '选择',
      hand: '手型工具',
      rect: '矩形',
      circle: '圆形',
      diamond: '菱形',
      text: '文本',
      line: '直线',
      arrow: '箭头',
      zoom_in: '放大',
      zoom_out: '缩小',
      zoom_fit: '适应屏幕',
      zoom_actual: '实际大小'
    },

    // 节点类型
    nodes: {
      start: '开始',
      end: '结束',
      process: '处理',
      decision: '判断',
      data: '数据',
      document: '文档',
      manual_input: '手动输入',
      preparation: '准备',
      predefined_process: '预定义处理',
      internal_storage: '内部存储',
      manual_operation: '手动操作',
      delay: '延迟',
      alternate_process: '备选处理',
      decision_yes: '是',
      decision_no: '否'
    },

    // 属性面板
    properties: {
      title: '属性',
      node_properties: '节点属性',
      edge_properties: '连线属性',
      canvas_properties: '画布属性',
      id: 'ID',
      text: '文本',
      width: '宽度',
      height: '高度',
      x: 'X坐标',
      y: 'Y坐标',
      fill: '填充颜色',
      stroke: '边框颜色',
      stroke_width: '边框宽度',
      font_size: '字体大小',
      font_family: '字体',
      font_weight: '字体粗细',
      text_align: '文本对齐',
      opacity: '透明度',
      rotation: '旋转角度',
      border_radius: '圆角半径'
    },

    // 菜单
    menu: {
      file: '文件',
      edit: '编辑',
      view: '视图',
      insert: '插入',
      format: '格式',
      tools: '工具',
      help: '帮助',
      
      // 文件菜单
      new: '新建',
      open: '打开',
      save: '保存',
      save_as: '另存为',
      export: '导出',
      import: '导入',
      print: '打印',
      
      // 编辑菜单
      undo: '撤销',
      redo: '重做',
      cut: '剪切',
      copy: '复制',
      paste: '粘贴',
      delete: '删除',
      select_all: '全选',
      
      // 视图菜单
      zoom_in: '放大',
      zoom_out: '缩小',
      zoom_fit: '适应屏幕',
      zoom_actual: '实际大小',
      grid: '网格',
      rulers: '标尺',
      
      // 插入菜单
      node: '节点',
      edge: '连线',
      text: '文本',
      image: '图片',
      
      // 格式菜单
      align: '对齐',
      distribute: '分布',
      group: '组合',
      ungroup: '取消组合',
      bring_to_front: '置于顶层',
      send_to_back: '置于底层'
    },

    // 对话框
    dialogs: {
      // 新建对话框
      new_flowchart: {
        title: '新建流程图',
        name: '流程图名称',
        template: '模板',
        blank: '空白',
        basic: '基本流程',
        decision_tree: '决策树',
        swimlane: '泳道图'
      },

      // 保存对话框
      save_flowchart: {
        title: '保存流程图',
        name: '文件名',
        format: '格式',
        location: '位置'
      },

      // 导出对话框
      export_flowchart: {
        title: '导出流程图',
        format: '导出格式',
        quality: '质量',
        size: '尺寸',
        background: '背景',
        transparent: '透明',
        white: '白色',
        custom: '自定义'
      },

      // 导入对话框
      import_flowchart: {
        title: '导入流程图',
        file: '选择文件',
        format: '文件格式',
        options: '导入选项',
        merge: '与当前合并',
        replace: '替换当前'
      }
    },

    // 消息
    messages: {
      saved: '流程图保存成功',
      exported: '流程图导出成功',
      imported: '流程图导入成功',
      deleted: '元素已删除',
      copied: '元素已复制',
      pasted: '元素已粘贴',
      error_save: '保存流程图失败',
      error_export: '导出流程图失败',
      error_import: '导入流程图失败',
      error_delete: '删除元素失败',
      error_copy: '复制元素失败',
      error_paste: '粘贴元素失败',
      confirm_delete: '确定要删除此元素吗？',
      confirm_clear: '确定要清空画布吗？',
      unsaved_changes: '您有未保存的更改。是否要在关闭前保存？'
    },

    // 状态
    status: {
      ready: '就绪',
      saving: '保存中...',
      loading: '加载中...',
      exporting: '导出中...',
      importing: '导入中...',
      processing: '处理中...',
      connecting: '连接中...',
      connected: '已连接',
      disconnected: '已断开',
      error: '发生错误'
    },

    // 快捷键
    shortcuts: {
      title: '键盘快捷键',
      general: '常规',
      editing: '编辑',
      navigation: '导航',
      selection: '选择',
      
      ctrl_n: 'Ctrl+N - 新建流程图',
      ctrl_o: 'Ctrl+O - 打开流程图',
      ctrl_s: 'Ctrl+S - 保存流程图',
      ctrl_z: 'Ctrl+Z - 撤销',
      ctrl_y: 'Ctrl+Y - 重做',
      ctrl_c: 'Ctrl+C - 复制',
      ctrl_v: 'Ctrl+V - 粘贴',
      ctrl_x: 'Ctrl+X - 剪切',
      delete: 'Delete - 删除选中项',
      ctrl_a: 'Ctrl+A - 全选',
      esc: 'Esc - 取消选择',
      space: 'Space - 手型工具',
      plus: '+ - 放大',
      minus: '- - 缩小',
      zero: '0 - 适应屏幕'
    }
  },

  // 协作功能
  collaboration: {
    title: '协作',
    users_online: '在线用户',
    invite_users: '邀请用户',
    share_link: '分享链接',
    permissions: '权限',
    view_only: '仅查看',
    edit: '编辑',
    admin: '管理员',
    user_joined: '{{user}} 加入了会话',
    user_left: '{{user}} 离开了会话',
    conflict_detected: '检测到冲突',
    conflict_resolved: '冲突已解决',
    sync_status: '同步状态',
    synced: '已同步',
    syncing: '同步中...',
    sync_failed: '同步失败'
  },

  // 版本控制
  version: {
    title: '版本控制',
    versions: '版本',
    branches: '分支',
    create_version: '创建版本',
    create_branch: '创建分支',
    merge_branch: '合并分支',
    compare_versions: '比较版本',
    restore_version: '恢复版本',
    version_message: '版本说明',
    branch_name: '分支名称',
    main_branch: '主分支',
    current_version: '当前版本',
    latest_version: '最新版本',
    version_created: '版本创建成功',
    branch_created: '分支创建成功',
    branch_merged: '分支合并成功',
    version_restored: '版本恢复成功'
  },

  // 搜索功能
  search: {
    title: '搜索',
    search_placeholder: '搜索节点、连线或文本...',
    advanced_search: '高级搜索',
    search_in: '搜索范围',
    node_text: '节点文本',
    node_type: '节点类型',
    edge_text: '连线文本',
    properties: '属性',
    case_sensitive: '区分大小写',
    whole_word: '全字匹配',
    regex: '正则表达式',
    results: '结果',
    no_results: '未找到结果',
    results_count: '找到 {{count}} 个结果',
    replace: '替换',
    replace_all: '全部替换',
    replaced: '已替换 {{count}} 处'
  },

  // 布局功能
  layout: {
    title: '自动布局',
    apply_layout: '应用布局',
    layout_type: '布局类型',
    hierarchical: '层次布局',
    force_directed: '力导向布局',
    circular: '圆形布局',
    grid: '网格布局',
    tree: '树形布局',
    organic: '有机布局',
    layout_options: '布局选项',
    direction: '方向',
    spacing: '间距',
    alignment: '对齐',
    top_to_bottom: '从上到下',
    left_to_right: '从左到右',
    bottom_to_top: '从下到上',
    right_to_left: '从右到左',
    layout_applied: '布局应用成功'
  },

  // 数据绑定
  databinding: {
    title: '数据绑定',
    data_sources: '数据源',
    add_source: '添加数据源',
    source_type: '数据源类型',
    rest_api: 'REST API',
    websocket: 'WebSocket',
    static_data: '静态数据',
    graphql: 'GraphQL',
    connection_string: '连接字符串',
    test_connection: '测试连接',
    connected: '已连接',
    connection_failed: '连接失败',
    bind_property: '绑定属性',
    expression: '表达式',
    refresh_data: '刷新数据',
    auto_refresh: '自动刷新',
    refresh_interval: '刷新间隔（秒）'
  },

  // 权限管理
  permissions: {
    title: '权限管理',
    users: '用户',
    roles: '角色',
    permissions: '权限',
    add_user: '添加用户',
    add_role: '添加角色',
    edit_user: '编辑用户',
    edit_role: '编辑角色',
    delete_user: '删除用户',
    delete_role: '删除角色',
    assign_role: '分配角色',
    remove_role: '移除角色',
    user_name: '用户名',
    user_email: '用户邮箱',
    role_name: '角色名称',
    role_description: '角色描述',
    permission_name: '权限名称',
    permission_description: '权限描述',
    view_permission: '查看',
    edit_permission: '编辑',
    delete_permission: '删除',
    admin_permission: '管理',
    access_denied: '访问被拒绝',
    insufficient_permissions: '权限不足'
  },

  // 导入导出
  importexport: {
    title: '导入导出',
    import: '导入',
    export: '导出',
    file_format: '文件格式',
    import_options: '导入选项',
    export_options: '导出选项',
    merge_with_current: '与当前合并',
    replace_current: '替换当前',
    preserve_ids: '保留ID',
    include_metadata: '包含元数据',
    compress_output: '压缩输出',
    image_quality: '图片质量',
    image_size: '图片尺寸',
    background_color: '背景颜色',
    transparent_background: '透明背景',
    select_file: '选择文件',
    drag_drop_file: '拖拽文件到此处',
    supported_formats: '支持的格式',
    import_successful: '导入成功',
    export_successful: '导出成功',
    import_failed: '导入失败',
    export_failed: '导出失败',
    invalid_file_format: '无效的文件格式',
    file_too_large: '文件过大'
  }
}
