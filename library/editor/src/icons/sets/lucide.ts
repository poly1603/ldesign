/**
 * Lucide 图标集
 * 现代、清晰的图标库
 */

import type { IconSet, IconDefinition, IconCategory } from '../types'
import { IconCategory as Category } from '../types'

/**
 * Lucide 图标集实现
 */
export class LucideIconSet implements IconSet {
  name = 'lucide' as const
  displayName = 'Lucide Icons'
  version = '0.263.0'
  author = 'Lucide'
  license = 'ISC'
  icons: Map<string, IconDefinition> = new Map()
  
  constructor() {
    this.loadIcons()
  }
  
  /**
   * 加载图标
   */
  private loadIcons(): void {
    const iconDefinitions: IconDefinition[] = [
      // 格式化图标
      {
        name: 'bold',
        svg: '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>',
        category: Category.FORMAT,
        tags: ['text', 'bold', 'format']
      },
      {
        name: 'italic',
        svg: '<line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>',
        category: Category.FORMAT,
        tags: ['text', 'italic', 'format']
      },
      {
        name: 'underline',
        svg: '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>',
        category: Category.FORMAT,
        tags: ['text', 'underline', 'format']
      },
      {
        name: 'strikethrough',
        svg: '<path d="M16 4H9a3 3 0 0 0-2.83 4"/><path d="M14 12a4 4 0 0 1 0 8H6"/><line x1="4" y1="12" x2="20" y2="12"/>',
        category: Category.FORMAT,
        tags: ['text', 'strikethrough', 'format']
      },
      {
        name: 'code',
        svg: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
        category: Category.FORMAT,
        tags: ['code', 'programming']
      },
      
      // 标题图标
      {
        name: 'heading',
        svg: '<path d="M6 12h12"/><path d="M6 20V4"/><path d="M18 20V4"/>',
        category: Category.EDITOR,
        tags: ['heading', 'title', 'h1', 'h2', 'h3']
      },
      {
        name: 'heading-1',
        svg: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="m17 12 3-2v8"/>',
        category: Category.EDITOR,
        tags: ['heading', 'h1']
      },
      {
        name: 'heading-2',
        svg: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
        category: Category.EDITOR,
        tags: ['heading', 'h2']
      },
      {
        name: 'heading-3',
        svg: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>',
        category: Category.EDITOR,
        tags: ['heading', 'h3']
      },
      {
        name: 'pilcrow',
        svg: '<path d="M13 4v16"/><path d="M17 4v16"/><path d="M19 4H9.5a4.5 4.5 0 0 0 0 9H13"/>',
        category: Category.EDITOR,
        tags: ['paragraph', 'text']
      },
      
      // 列表图标
      {
        name: 'list',
        svg: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
        category: Category.EDITOR,
        tags: ['list', 'bullet', 'ul']
      },
      {
        name: 'list-ordered',
        svg: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>',
        category: Category.EDITOR,
        tags: ['list', 'numbered', 'ol']
      },
      {
        name: 'list-checks',
        svg: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
        category: Category.EDITOR,
        tags: ['list', 'todo', 'task', 'checkbox']
      },
      
      // 对齐图标
      {
        name: 'align-left',
        svg: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/>',
        category: Category.FORMAT,
        tags: ['align', 'text', 'left']
      },
      {
        name: 'align-center',
        svg: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/>',
        category: Category.FORMAT,
        tags: ['align', 'text', 'center']
      },
      {
        name: 'align-right',
        svg: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/>',
        category: Category.FORMAT,
        tags: ['align', 'text', 'right']
      },
      {
        name: 'align-justify',
        svg: '<line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/>',
        category: Category.FORMAT,
        tags: ['align', 'text', 'justify']
      },
      
      // 缩进图标
      {
        name: 'indent',
        svg: '<polyline points="3 8 7 12 3 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>',
        category: Category.FORMAT,
        tags: ['indent', 'format']
      },
      {
        name: 'outdent',
        svg: '<polyline points="7 8 3 12 7 16"/><line x1="21" y1="12" x2="11" y2="12"/><line x1="21" y1="6" x2="11" y2="6"/><line x1="21" y1="18" x2="11" y2="18"/>',
        category: Category.FORMAT,
        tags: ['outdent', 'format']
      },
      
      // 引用和代码块
      {
        name: 'quote',
        svg: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
        category: Category.EDITOR,
        tags: ['quote', 'blockquote']
      },
      {
        name: 'code-2',
        svg: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
        category: Category.EDITOR,
        tags: ['code', 'programming']
      },
      
      // 媒体图标
      {
        name: 'image',
        svg: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
        category: Category.MEDIA,
        tags: ['image', 'photo', 'picture']
      },
      {
        name: 'video',
        svg: '<path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>',
        category: Category.MEDIA,
        tags: ['video', 'movie', 'film']
      },
      
      // 链接图标
      {
        name: 'link',
        svg: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
        category: Category.EDITOR,
        tags: ['link', 'url', 'hyperlink']
      },
      {
        name: 'unlink',
        svg: '<path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71"/><path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71"/><line x1="8" y1="2" x2="8" y2="5"/><line x1="2" y1="8" x2="5" y2="8"/><line x1="16" y1="19" x2="16" y2="22"/><line x1="19" y1="16" x2="22" y2="16"/>',
        category: Category.EDITOR,
        tags: ['unlink', 'remove link']
      },
      
      // 表格图标
      {
        name: 'table',
        svg: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
        category: Category.EDITOR,
        tags: ['table', 'grid']
      },
      
      // 历史操作
      {
        name: 'undo',
        svg: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
        category: Category.ACTION,
        tags: ['undo', 'history', 'back']
      },
      {
        name: 'redo',
        svg: '<path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/>',
        category: Category.ACTION,
        tags: ['redo', 'history', 'forward']
      },
      
      // 表情和特殊符号
      {
        name: 'smile',
        svg: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
        category: Category.OTHER,
        tags: ['emoji', 'smile', 'face']
      },
      {
        name: 'separator-horizontal',
        svg: '<line x1="3" y1="12" x2="21" y2="12"/><polyline points="8 8 12 4 16 8"/><polyline points="16 16 12 20 8 16"/>',
        category: Category.EDITOR,
        tags: ['separator', 'divider', 'hr']
      },
      
      // 文件和模板
      {
        name: 'file-text',
        svg: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
        category: Category.FILE,
        tags: ['file', 'document', 'template']
      },
      
      // 工具图标
      {
        name: 'search',
        svg: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
        category: Category.ACTION,
        tags: ['search', 'find']
      },
      {
        name: 'replace',
        svg: '<path d="M14 4c0-1.1.9-2 2-2"/><path d="M20 2c1.1 0 2 .9 2 2"/><path d="M22 8c0 1.1-.9 2-2 2"/><path d="M16 10c-1.1 0-2-.9-2-2"/><path d="m3 7 3 3 3-3"/><path d="M6 10V5c0-1.7 1.3-3 3-3h7"/><rect width="8" height="8" x="2" y="14" rx="2"/><path d="M14 14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/><path d="M20 14c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2"/>',
        category: Category.ACTION,
        tags: ['replace', 'find']
      },
      {
        name: 'maximize',
        svg: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
        category: Category.ACTION,
        tags: ['fullscreen', 'maximize', 'expand']
      },
      {
        name: 'minimize',
        svg: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
        category: Category.ACTION,
        tags: ['minimize', 'exit fullscreen']
      },
      
      // 颜色和样式
      {
        name: 'palette',
        svg: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
        category: Category.FORMAT,
        tags: ['color', 'palette', 'paint']
      },
      {
        name: 'paint-bucket',
        svg: '<path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"/><path d="m5 2 5 5"/><path d="M2 13h15"/><path d="M22 20a2 2 0 1 1-4 0c0-1.6 1.7-2.4 2-4 .3 1.6 2 2.4 2 4Z"/>',
        category: Category.FORMAT,
        tags: ['background', 'fill', 'color']
      },
      {
        name: 'pipette',
        svg: '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
        category: Category.FORMAT,
        tags: ['color picker', 'eyedropper']
      },
      
      // AI 相关
      {
        name: 'sparkles',
        svg: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
        category: Category.OTHER,
        tags: ['ai', 'magic', 'sparkle']
      },
      {
        name: 'lightbulb',
        svg: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
        category: Category.OTHER,
        tags: ['ai', 'idea', 'suggest']
      },
      {
        name: 'languages',
        svg: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
        category: Category.OTHER,
        tags: ['translate', 'language', 'i18n']
      },
      {
        name: 'wand',
        svg: '<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/>',
        category: Category.OTHER,
        tags: ['ai', 'improve', 'magic']
      },
      
      // 箭头
      {
        name: 'arrow-up',
        svg: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
        category: Category.ARROW,
        tags: ['arrow', 'up']
      },
      {
        name: 'arrow-down',
        svg: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
        category: Category.ARROW,
        tags: ['arrow', 'down']
      },
      {
        name: 'arrow-left',
        svg: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
        category: Category.ARROW,
        tags: ['arrow', 'left']
      },
      {
        name: 'arrow-right',
        svg: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
        category: Category.ARROW,
        tags: ['arrow', 'right']
      },
      {
        name: 'chevron-up',
        svg: '<path d="m18 15-6-6-6 6"/>',
        category: Category.ARROW,
        tags: ['chevron', 'up']
      },
      {
        name: 'chevron-down',
        svg: '<path d="m6 9 6 6 6-6"/>',
        category: Category.ARROW,
        tags: ['chevron', 'down']
      },
      {
        name: 'chevron-left',
        svg: '<path d="m15 18-6-6 6-6"/>',
        category: Category.ARROW,
        tags: ['chevron', 'left']
      },
      {
        name: 'chevron-right',
        svg: '<path d="m9 18 6-6-6-6"/>',
        category: Category.ARROW,
        tags: ['chevron', 'right']
      },
      
      // 其他常用图标
      {
        name: 'x',
        svg: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
        category: Category.ACTION,
        tags: ['close', 'remove', 'delete']
      },
      {
        name: 'check',
        svg: '<polyline points="20 6 9 17 4 12"/>',
        category: Category.ACTION,
        tags: ['check', 'ok', 'done']
      },
      {
        name: 'plus',
        svg: '<path d="M5 12h14"/><path d="M12 5v14"/>',
        category: Category.ACTION,
        tags: ['add', 'plus', 'new']
      },
      {
        name: 'minus',
        svg: '<path d="M5 12h14"/>',
        category: Category.ACTION,
        tags: ['remove', 'minus', 'subtract']
      },
      {
        name: 'refresh-cw',
        svg: '<path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/>',
        category: Category.ACTION,
        tags: ['refresh', 'reload', 'sync']
      },
      {
        name: 'download',
        svg: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
        category: Category.ACTION,
        tags: ['download', 'save']
      },
      {
        name: 'upload',
        svg: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
        category: Category.ACTION,
        tags: ['upload', 'import']
      },
      {
        name: 'settings',
        svg: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
        category: Category.ACTION,
        tags: ['settings', 'config', 'preferences']
      },
      {
        name: 'help-circle',
        svg: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
        category: Category.OTHER,
        tags: ['help', 'question', 'info']
      },
      {
        name: 'info',
        svg: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
        category: Category.OTHER,
        tags: ['info', 'information']
      },
      {
        name: 'more-horizontal',
        svg: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
        category: Category.OTHER,
        tags: ['more', 'menu', 'options']
      }
    ]
    
    // 将图标添加到集合中
    iconDefinitions.forEach(icon => {
      this.icons.set(icon.name, icon)
    })
  }
  
  /**
   * 获取图标
   */
  getIcon(name: string): IconDefinition | null {
    return this.icons.get(name) || null
  }
  
  /**
   * 获取所有图标
   */
  getAllIcons(): IconDefinition[] {
    return Array.from(this.icons.values())
  }
  
  /**
   * 按分类获取图标
   */
  getIconsByCategory(category: IconCategory): IconDefinition[] {
    return this.getAllIcons().filter(icon => icon.category === category)
  }
  
  /**
   * 搜索图标
   */
  searchIcons(query: string): IconDefinition[] {
    const lowerQuery = query.toLowerCase()
    return this.getAllIcons().filter(icon => 
      icon.name.toLowerCase().includes(lowerQuery) ||
      icon.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }
}






