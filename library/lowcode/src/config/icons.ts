/**
 * 图标映射配置
 * 所有图标使用 lucide-vue-next
 */

// 导出常用图标组件
export {
  Save,
  Undo,
  Redo,
  Trash2,
  Eye,
  Download,
  Upload,
  Settings,
  Grid3x3,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Minus,
  Copy,
  Clipboard,
  Search,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Code,
  Play,
  Pause,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Layout,
  Layers,
  Box,
  Type,
  Image,
  Table,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Link,
  FileText,
  Folder,
  File,
  Database,
  Server,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Home,
  Menu,
  PanelLeft,
  PanelRight,
  Sun,
  Moon,
  Palette,
  Languages,
  HelpCircle,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronDownCircle,
  MousePointer,
  Move,
  Square,
  Circle,
  Triangle
} from 'lucide-vue-next';

/**
 * 图标尺寸预设
 */
export const ICON_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;

export type IconSize = keyof typeof ICON_SIZES;

/**
 * 图标分类映射
 */
export const ICON_CATEGORIES = {
  // 编辑操作
  edit: {
    save: 'Save',
    undo: 'Undo',
    redo: 'Redo',
    delete: 'Trash2',
    copy: 'Copy',
    paste: 'Clipboard',
    cut: 'Scissors'
  },

  // 视图控制
  view: {
    eye: 'Eye',
    grid: 'Grid3x3',
    layers: 'Layers',
    zoomIn: 'ZoomIn',
    zoomOut: 'ZoomOut',
    maximize: 'Maximize',
    minimize: 'Minimize'
  },

  // 设备类型
  device: {
    desktop: 'Monitor',
    tablet: 'Tablet',
    mobile: 'Smartphone'
  },

  // 文件操作
  file: {
    download: 'Download',
    upload: 'Upload',
    export: 'Download',
    import: 'Upload',
    save: 'Save'
  },

  // 组件类型
  component: {
    button: 'MousePointer',
    input: 'Type',
    text: 'Type',
    image: 'Image',
    table: 'Table',
    list: 'List',
    container: 'Box',
    layout: 'Layout'
  },

  // 主题设置
  theme: {
    light: 'Sun',
    dark: 'Moon',
    color: 'Palette',
    language: 'Languages'
  },

  // 导航
  navigation: {
    menu: 'Menu',
    home: 'Home',
    settings: 'Settings',
    help: 'HelpCircle'
  },

  // 状态
  status: {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertCircle',
    info: 'Info'
  },

  // 箭头方向
  arrow: {
    down: 'ChevronDown',
    up: 'ChevronUp',
    left: 'ChevronLeft',
    right: 'ChevronRight'
  },

  // 通用操作
  common: {
    add: 'Plus',
    remove: 'Minus',
    close: 'X',
    check: 'Check',
    search: 'Search',
    more: 'MoreVertical',
    edit: 'Edit',
    refresh: 'RefreshCw'
  }
} as const;


