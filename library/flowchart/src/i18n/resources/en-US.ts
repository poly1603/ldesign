/**
 * 英语翻译资源
 */

export const enUSTranslations = {
  // 通用
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    close: 'Close',
    open: 'Open',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    undo: 'Undo',
    redo: 'Redo',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    export: 'Export',
    import: 'Import',
    upload: 'Upload',
    download: 'Download',
    loading: 'Loading...',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    success: 'Success',
    yes: 'Yes',
    no: 'No',
    all: 'All',
    none: 'None',
    selected: 'Selected',
    name: 'Name',
    type: 'Type',
    description: 'Description',
    created: 'Created',
    updated: 'Updated',
    author: 'Author',
    version: 'Version',
    status: 'Status',
    actions: 'Actions'
  },

  // 流程图编辑器
  flowchart: {
    title: 'Flowchart Editor',
    
    // 工具栏
    toolbar: {
      select: 'Select',
      hand: 'Hand Tool',
      rect: 'Rectangle',
      circle: 'Circle',
      diamond: 'Diamond',
      text: 'Text',
      line: 'Line',
      arrow: 'Arrow',
      zoom_in: 'Zoom In',
      zoom_out: 'Zoom Out',
      zoom_fit: 'Fit to Screen',
      zoom_actual: 'Actual Size'
    },

    // 节点类型
    nodes: {
      start: 'Start',
      end: 'End',
      process: 'Process',
      decision: 'Decision',
      data: 'Data',
      document: 'Document',
      manual_input: 'Manual Input',
      preparation: 'Preparation',
      predefined_process: 'Predefined Process',
      internal_storage: 'Internal Storage',
      manual_operation: 'Manual Operation',
      delay: 'Delay',
      alternate_process: 'Alternate Process',
      decision_yes: 'Yes',
      decision_no: 'No'
    },

    // 属性面板
    properties: {
      title: 'Properties',
      node_properties: 'Node Properties',
      edge_properties: 'Edge Properties',
      canvas_properties: 'Canvas Properties',
      id: 'ID',
      text: 'Text',
      width: 'Width',
      height: 'Height',
      x: 'X Position',
      y: 'Y Position',
      fill: 'Fill Color',
      stroke: 'Stroke Color',
      stroke_width: 'Stroke Width',
      font_size: 'Font Size',
      font_family: 'Font Family',
      font_weight: 'Font Weight',
      text_align: 'Text Align',
      opacity: 'Opacity',
      rotation: 'Rotation',
      border_radius: 'Border Radius'
    },

    // 菜单
    menu: {
      file: 'File',
      edit: 'Edit',
      view: 'View',
      insert: 'Insert',
      format: 'Format',
      tools: 'Tools',
      help: 'Help',
      
      // 文件菜单
      new: 'New',
      open: 'Open',
      save: 'Save',
      save_as: 'Save As',
      export: 'Export',
      import: 'Import',
      print: 'Print',
      
      // 编辑菜单
      undo: 'Undo',
      redo: 'Redo',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      delete: 'Delete',
      select_all: 'Select All',
      
      // 视图菜单
      zoom_in: 'Zoom In',
      zoom_out: 'Zoom Out',
      zoom_fit: 'Fit to Screen',
      zoom_actual: 'Actual Size',
      grid: 'Grid',
      rulers: 'Rulers',
      
      // 插入菜单
      node: 'Node',
      edge: 'Edge',
      text: 'Text',
      image: 'Image',
      
      // 格式菜单
      align: 'Align',
      distribute: 'Distribute',
      group: 'Group',
      ungroup: 'Ungroup',
      bring_to_front: 'Bring to Front',
      send_to_back: 'Send to Back'
    },

    // 对话框
    dialogs: {
      // 新建对话框
      new_flowchart: {
        title: 'New Flowchart',
        name: 'Flowchart Name',
        template: 'Template',
        blank: 'Blank',
        basic: 'Basic Process',
        decision_tree: 'Decision Tree',
        swimlane: 'Swimlane'
      },

      // 保存对话框
      save_flowchart: {
        title: 'Save Flowchart',
        name: 'File Name',
        format: 'Format',
        location: 'Location'
      },

      // 导出对话框
      export_flowchart: {
        title: 'Export Flowchart',
        format: 'Export Format',
        quality: 'Quality',
        size: 'Size',
        background: 'Background',
        transparent: 'Transparent',
        white: 'White',
        custom: 'Custom'
      },

      // 导入对话框
      import_flowchart: {
        title: 'Import Flowchart',
        file: 'Select File',
        format: 'File Format',
        options: 'Import Options',
        merge: 'Merge with current',
        replace: 'Replace current'
      }
    },

    // 消息
    messages: {
      saved: 'Flowchart saved successfully',
      exported: 'Flowchart exported successfully',
      imported: 'Flowchart imported successfully',
      deleted: 'Element deleted',
      copied: 'Element copied',
      pasted: 'Element pasted',
      error_save: 'Failed to save flowchart',
      error_export: 'Failed to export flowchart',
      error_import: 'Failed to import flowchart',
      error_delete: 'Failed to delete element',
      error_copy: 'Failed to copy element',
      error_paste: 'Failed to paste element',
      confirm_delete: 'Are you sure you want to delete this element?',
      confirm_clear: 'Are you sure you want to clear the canvas?',
      unsaved_changes: 'You have unsaved changes. Do you want to save before closing?'
    },

    // 状态
    status: {
      ready: 'Ready',
      saving: 'Saving...',
      loading: 'Loading...',
      exporting: 'Exporting...',
      importing: 'Importing...',
      processing: 'Processing...',
      connecting: 'Connecting...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      error: 'Error occurred'
    },

    // 快捷键
    shortcuts: {
      title: 'Keyboard Shortcuts',
      general: 'General',
      editing: 'Editing',
      navigation: 'Navigation',
      selection: 'Selection',
      
      ctrl_n: 'Ctrl+N - New flowchart',
      ctrl_o: 'Ctrl+O - Open flowchart',
      ctrl_s: 'Ctrl+S - Save flowchart',
      ctrl_z: 'Ctrl+Z - Undo',
      ctrl_y: 'Ctrl+Y - Redo',
      ctrl_c: 'Ctrl+C - Copy',
      ctrl_v: 'Ctrl+V - Paste',
      ctrl_x: 'Ctrl+X - Cut',
      delete: 'Delete - Delete selected',
      ctrl_a: 'Ctrl+A - Select all',
      esc: 'Esc - Deselect all',
      space: 'Space - Hand tool',
      plus: '+ - Zoom in',
      minus: '- - Zoom out',
      zero: '0 - Fit to screen'
    }
  },

  // 协作功能
  collaboration: {
    title: 'Collaboration',
    users_online: 'Users Online',
    invite_users: 'Invite Users',
    share_link: 'Share Link',
    permissions: 'Permissions',
    view_only: 'View Only',
    edit: 'Edit',
    admin: 'Admin',
    user_joined: '{{user}} joined the session',
    user_left: '{{user}} left the session',
    conflict_detected: 'Conflict detected',
    conflict_resolved: 'Conflict resolved',
    sync_status: 'Sync Status',
    synced: 'Synced',
    syncing: 'Syncing...',
    sync_failed: 'Sync Failed'
  },

  // 版本控制
  version: {
    title: 'Version Control',
    versions: 'Versions',
    branches: 'Branches',
    create_version: 'Create Version',
    create_branch: 'Create Branch',
    merge_branch: 'Merge Branch',
    compare_versions: 'Compare Versions',
    restore_version: 'Restore Version',
    version_message: 'Version Message',
    branch_name: 'Branch Name',
    main_branch: 'Main',
    current_version: 'Current Version',
    latest_version: 'Latest Version',
    version_created: 'Version created successfully',
    branch_created: 'Branch created successfully',
    branch_merged: 'Branch merged successfully',
    version_restored: 'Version restored successfully'
  },

  // 搜索功能
  search: {
    title: 'Search',
    search_placeholder: 'Search nodes, edges, or text...',
    advanced_search: 'Advanced Search',
    search_in: 'Search In',
    node_text: 'Node Text',
    node_type: 'Node Type',
    edge_text: 'Edge Text',
    properties: 'Properties',
    case_sensitive: 'Case Sensitive',
    whole_word: 'Whole Word',
    regex: 'Regular Expression',
    results: 'Results',
    no_results: 'No results found',
    results_count: '{{count}} results found',
    replace: 'Replace',
    replace_all: 'Replace All',
    replaced: 'Replaced {{count}} occurrences'
  },

  // 布局功能
  layout: {
    title: 'Auto Layout',
    apply_layout: 'Apply Layout',
    layout_type: 'Layout Type',
    hierarchical: 'Hierarchical',
    force_directed: 'Force Directed',
    circular: 'Circular',
    grid: 'Grid',
    tree: 'Tree',
    organic: 'Organic',
    layout_options: 'Layout Options',
    direction: 'Direction',
    spacing: 'Spacing',
    alignment: 'Alignment',
    top_to_bottom: 'Top to Bottom',
    left_to_right: 'Left to Right',
    bottom_to_top: 'Bottom to Top',
    right_to_left: 'Right to Left',
    layout_applied: 'Layout applied successfully'
  },

  // 数据绑定
  databinding: {
    title: 'Data Binding',
    data_sources: 'Data Sources',
    add_source: 'Add Data Source',
    source_type: 'Source Type',
    rest_api: 'REST API',
    websocket: 'WebSocket',
    static_data: 'Static Data',
    graphql: 'GraphQL',
    connection_string: 'Connection String',
    test_connection: 'Test Connection',
    connected: 'Connected',
    connection_failed: 'Connection Failed',
    bind_property: 'Bind Property',
    expression: 'Expression',
    refresh_data: 'Refresh Data',
    auto_refresh: 'Auto Refresh',
    refresh_interval: 'Refresh Interval (seconds)'
  },

  // 权限管理
  permissions: {
    title: 'Permissions',
    users: 'Users',
    roles: 'Roles',
    permissions: 'Permissions',
    add_user: 'Add User',
    add_role: 'Add Role',
    edit_user: 'Edit User',
    edit_role: 'Edit Role',
    delete_user: 'Delete User',
    delete_role: 'Delete Role',
    assign_role: 'Assign Role',
    remove_role: 'Remove Role',
    user_name: 'User Name',
    user_email: 'User Email',
    role_name: 'Role Name',
    role_description: 'Role Description',
    permission_name: 'Permission Name',
    permission_description: 'Permission Description',
    view_permission: 'View',
    edit_permission: 'Edit',
    delete_permission: 'Delete',
    admin_permission: 'Admin',
    access_denied: 'Access Denied',
    insufficient_permissions: 'Insufficient Permissions'
  },

  // 导入导出
  importexport: {
    title: 'Import/Export',
    import: 'Import',
    export: 'Export',
    file_format: 'File Format',
    import_options: 'Import Options',
    export_options: 'Export Options',
    merge_with_current: 'Merge with Current',
    replace_current: 'Replace Current',
    preserve_ids: 'Preserve IDs',
    include_metadata: 'Include Metadata',
    compress_output: 'Compress Output',
    image_quality: 'Image Quality',
    image_size: 'Image Size',
    background_color: 'Background Color',
    transparent_background: 'Transparent Background',
    select_file: 'Select File',
    drag_drop_file: 'Drag and drop file here',
    supported_formats: 'Supported Formats',
    import_successful: 'Import successful',
    export_successful: 'Export successful',
    import_failed: 'Import failed',
    export_failed: 'Export failed',
    invalid_file_format: 'Invalid file format',
    file_too_large: 'File too large'
  }
}
