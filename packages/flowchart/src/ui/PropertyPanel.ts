/**
 * 属性面板组件
 * 用于编辑选中节点和连接线的属性
 */

import type { EventEmitter } from '@/types/index.js';
import { NodeType } from '@/types/index.js';
import { SimpleEventEmitter, createElement } from '@/utils/index.js';
import type { BaseNode } from '@/nodes/index.js';
import type { BaseEdge } from '@/edges/index.js';
import type { SelectableItem } from '@/managers/index.js';

/**
 * 属性面板配置
 */
export interface PropertyPanelConfig {
  /** 容器元素 */
  container: HTMLElement;
  /** 面板标题 */
  title?: string;
  /** 是否可折叠 */
  collapsible?: boolean;
  /** 默认是否展开 */
  defaultExpanded?: boolean;
}

/**
 * 属性字段配置
 */
export interface PropertyFieldConfig {
  /** 字段键 */
  key: string,
  /** 字段标签 */
  label: string,
  /** 字段类型 */
  type: 'text' | 'number' | 'color' | 'select' | 'checkbox' | 'textarea' | 'custom';
  /** 默认值 */
  defaultValue?: any;
  /** 选项（仅select类型） */
  options?: { value: any; label: string }[];
  /** 最小值（仅number类型） */
  min?: number;
  /** 最大值（仅number类型） */
  max?: number;
  /** 步长（仅number类型） */
  step?: number;
  /** 是否必填 */
  required?: boolean;
  /** 验证函数 */
  validator?: (value: any) => boolean | string;
  /** 变更回调 */
  onChange?: (value: any) => void;
}

/**
 * 属性面板类
 */
export class PropertyPanel extends SimpleEventEmitter implements EventEmitter {
  private container: HTMLElement;
  private element: HTMLElement;
  private headerElement: HTMLElement;
  private contentElement: HTMLElement;
  private config: PropertyPanelConfig;
  private currentItem: SelectableItem | null = null;
  private fields: Map<string, PropertyFieldConfig> = new Map();
  private fieldElements: Map<string, HTMLElement> = new Map();
  private isExpanded = true;
  private disabled = false;

  constructor(config: PropertyPanelConfig) {
    super();
    
    this.config = config;
    this.container = config.container;
    this.isExpanded = config.defaultExpanded !== false;
    
    this.createElement();
    this.render();
  }

  /**
   * 创建面板元素
   */
  private createElement(): void {
    this.element = createElement('div', {
      className: 'flowchart-property-panel',
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        backgroundColor: 'var(--ldesign-bg-color-container)',
        border: '1px solid var(--ldesign-border-level-1-color)',
        borderRadius: 'var(--ls-border-radius-base)',
        overflow: 'hidden'
      }
    });

    // 创建头部
    this.headerElement = createElement('div', {
      className: 'property-panel-header',
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 'var(--ls-padding-sm)',
        backgroundColor: 'var(--ldesign-bg-color-component)',
        borderBottom: '1px solid var(--ldesign-border-level-1-color)',
        cursor: this.config.collapsible ? 'pointer' : 'default',
        userSelect: 'none'
      }
    });

    const titleElement = createElement('span', {
      className: 'property-panel-title',
      textContent: this.config.title || '属性',
      style: {
        fontSize: 'var(--ls-font-size-sm)',
        fontWeight: '500',
        color: 'var(--ldesign-text-color-primary)'
      }
    });

    this.headerElement.appendChild(titleElement);

    if (this.config.collapsible) {
      const toggleElement = createElement('span', {
        className: 'property-panel-toggle',
        textContent: this.isExpanded ? '▼' : '▶',
        style: {
          fontSize: '12px',
          color: 'var(--ldesign-text-color-secondary)',
          transition: 'transform 0.2s ease'
        }
      });

      this.headerElement.appendChild(toggleElement);
      this.headerElement.addEventListener('click', () => this.toggle());
    }

    // 创建内容区域
    this.contentElement = createElement('div', {
      className: 'property-panel-content',
      style: {
        display: this.isExpanded ? 'block' : 'none',
        padding: 'var(--ls-padding-sm)',
        maxHeight: '400px',
        overflowY: 'auto'
      }
    });

    this.element.appendChild(this.headerElement);
    this.element.appendChild(this.contentElement);
    this.container.appendChild(this.element);
  }

  /**
   * 渲染面板
   */
  private render(): void {
    this.contentElement.innerHTML = '';
    this.fieldElements.clear();

    if (!this.currentItem) {
      this.renderEmptyState();
      return;
    }

    this.renderFields();
  }

  /**
   * 渲染空状态
   */
  private renderEmptyState(): void {
    const emptyElement = createElement('div', {
      className: 'property-panel-empty',
      textContent: '请选择一个节点或连接线',
      style: {
        textAlign: 'center',
        padding: 'var(--ls-padding-lg)',
        color: 'var(--ldesign-text-color-placeholder)',
        fontSize: 'var(--ls-font-size-sm)'
      }
    });

    this.contentElement.appendChild(emptyElement);
  }

  /**
   * 渲染字段
   */
  private renderFields(): void {
    for (const [key, field] of this.fields) {
      const fieldElement = this.createFieldElement(field);
      this.fieldElements.set(key, fieldElement);
      this.contentElement.appendChild(fieldElement);
    }
  }

  /**
   * 创建字段元素
   */
  private createFieldElement(field: PropertyFieldConfig): HTMLElement {
    const fieldElement = createElement('div', {
      className: 'property-field',
      style: {
        marginBottom: 'var(--ls-margin-sm)'
      }
    });

    // 创建标签
    const labelElement = createElement('label', {
      className: 'property-field-label',
      textContent: field.label,
      style: {
        display: 'block',
        marginBottom: 'var(--ls-margin-xs)',
        fontSize: 'var(--ls-font-size-xs)',
        fontWeight: '500',
        color: 'var(--ldesign-text-color-primary)'
      }
    });

    fieldElement.appendChild(labelElement);

    // 自定义字段（例如审批人列表）
    if (field.type === 'custom') {
      let customElement: HTMLElement | null = null;
      if (field.key === 'approversList') {
        customElement = this.createApproversListElement();
      } else if (field.key === 'bezierControls') {
        customElement = this.createBezierControlsElement();
      }
      fieldElement.appendChild(customElement || createElement('div'));
      return fieldElement;
    }

    // 创建字段元素
    const inputElement = this.createInputElement(field);
    // 禁用只读
    if (this.disabled) {
      (inputElement as any).disabled = true;
      inputElement.querySelectorAll?.('input,select,textarea,button').forEach?.((el: any) => el.disabled = true);
    }
    fieldElement.appendChild(inputElement);

    return fieldElement;
  }

  /**
   * 创建贝塞尔控制点工具区
   */
  private createBezierControlsElement(): HTMLElement {
    const wrap = createElement('div', {
      className: 'bezier-controls',
      style: {
        display: 'flex',
        gap: '8px'
      }
    });

    const resetBtn = createElement('button', {
      textContent: '重置控制点',
      style: {
        padding: '4px 8px',
        border: '1px solid var(--ldesign-border-level-1-color)',
        borderRadius: '4px',
        backgroundColor: 'var(--ldesign-bg-color-component)',
        cursor: 'pointer'
      }
    });

    if (!this.disabled) {
      resetBtn.addEventListener('click', () => {
        if (!this.currentItem || 'position' in this.currentItem) return;
        const edge = this.currentItem as BaseEdge;
        this.emit('property:change', {
          item: this.currentItem,
          key: 'resetCustomControlPoints',
          value: true,
          updateData: { customControlPoints: undefined }
        });
      });
    } else {
      (resetBtn as HTMLButtonElement).disabled = true;
    }

    wrap.appendChild(resetBtn);
    return wrap;
  }

  /**
   * 创建输入元素
   */
  private createInputElement(field: PropertyFieldConfig): HTMLElement {
    const baseStyle = {
      width: '100%',
      padding: 'var(--ls-padding-xs)',
      border: '1px solid var(--ldesign-border-level-1-color)',
      borderRadius: 'var(--ls-border-radius-sm)',
      fontSize: 'var(--ls-font-size-xs)',
      backgroundColor: 'var(--ldesign-bg-color-component)',
      color: 'var(--ldesign-text-color-primary)'
    };

    let element: HTMLElement;

    switch (field.type) {
      case 'text':
        element = createElement('input', {
          type: 'text',
          value: this.getFieldValue(field.key) || field.defaultValue || '',
          style: baseStyle
        });
        break;

      case 'number':
        element = createElement('input', {
          type: 'number',
          value: this.getFieldValue(field.key) || field.defaultValue || 0,
          min: field.min,
          max: field.max,
          step: field.step,
          style: baseStyle
        });
        break;

      case 'color':
        element = createElement('input', {
          type: 'color',
          value: this.getFieldValue(field.key) || field.defaultValue || '#000000',
          style: { ...baseStyle, height: '32px' }
        });
        break;

      case 'checkbox':
        element = createElement('input', {
          type: 'checkbox',
          checked: this.getFieldValue(field.key) || field.defaultValue || false,
          style: {
            width: 'auto',
            margin: '0'
          }
        });
        break;

      case 'textarea':
        element = createElement('textarea', {
          value: this.getFieldValue(field.key) || field.defaultValue || '',
          style: {
            ...baseStyle,
            minHeight: '60px',
            resize: 'vertical'
          }
        });
        break;

      case 'select':
        element = createElement('select', {
          style: baseStyle
        });
        
        if (field.options) {
          for (const option of field.options) {
            const optionElement = createElement('option', {
              value: option.value,
              textContent: option.label,
              selected: this.getFieldValue(field.key) === option.value
            });
            element.appendChild(optionElement);
          }
        }
        break;

      default:
        element = createElement('input', {
          type: 'text',
          value: this.getFieldValue(field.key) || field.defaultValue || '',
          style: baseStyle
        });
    }

    // 添加事件监听
    const eventType = field.type === 'checkbox' ? 'change' : 'input';
    element.addEventListener(eventType, (event) => {
      const target = event.target as HTMLInputElement;
      let value: any;

      if (field.type === 'checkbox') {
        value = target.checked;
      } else if (field.type === 'number') {
        value = parseFloat(target.value) || 0;
      } else {
        value = target.value;
      }

      this.updateFieldValue(field.key, value);
      field.onChange?.(value);
    });

    return element;
  }

  /**
   * 创建审批人列表自定义控件
   */
  private createApproversListElement(): HTMLElement {
    // 容器
    const container = createElement('div', {
      className: 'approvers-list',
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }
    });

    // 取当前列表
    const getApprovers = (): Array<{ id: string; name: string }> => {
      if (!this.currentItem || !('position' in this.currentItem)) return [];
      const node = this.currentItem as BaseNode;
      const props = (node.getData().properties || {}) as any;
      const cfg = props.approvalConfig || {};
      return Array.isArray(cfg.approvers) ? cfg.approvers : [];
    };

    const renderRows = () => {
      container.innerHTML = '';

      const rowsWrap = createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }
      });

      const approvers = getApprovers();
      approvers.forEach((appr, idx) => {
        const row = createElement('div', {
          style: {
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
          }
        });

        const nameInput = createElement('input', {
          type: 'text',
          value: appr.name || '',
          placeholder: '姓名',
          style: {
            width: '160px',
            padding: '4px 6px',
            border: '1px solid var(--ldesign-border-level-1-color)',
            borderRadius: '4px',
            fontSize: '12px'
          }
        });

        const idInput = createElement('input', {
          type: 'text',
          value: appr.id || '',
          placeholder: 'ID',
          style: {
            width: '120px',
            padding: '4px 6px',
            border: '1px solid var(--ldesign-border-level-1-color)',
            borderRadius: '4px',
            fontSize: '12px'
          }
        });

        const removeBtn = createElement('button', {
          textContent: '删除',
          style: {
            padding: '4px 8px',
            border: '1px solid var(--ldesign-border-level-1-color)',
            borderRadius: '4px',
            backgroundColor: 'var(--ldesign-bg-color-component)',
            cursor: 'pointer'
          }
        });

        // 事件
        if (!this.disabled) {
          nameInput.addEventListener('input', () => update(idx, { name: (nameInput as HTMLInputElement).value }));
          idInput.addEventListener('input', () => update(idx, { id: (idInput as HTMLInputElement).value }));
          removeBtn.addEventListener('click', () => remove(idx));
        } else {
          (nameInput as HTMLInputElement).disabled = true;
          (idInput as HTMLInputElement).disabled = true;
          (removeBtn as HTMLButtonElement).disabled = true;
        }

        row.appendChild(nameInput);
        row.appendChild(idInput);
        row.appendChild(removeBtn);
        rowsWrap.appendChild(row);
      });

      container.appendChild(rowsWrap);

      const addBtn = createElement('button', {
        textContent: '新增审批人',
        style: {
          width: '100%',
          padding: '6px 8px',
          border: '1px dashed var(--ldesign-border-level-1-color)',
          borderRadius: '4px',
          backgroundColor: 'var(--ldesign-bg-color-component)',
          cursor: 'pointer'
        }
      });
      if (!this.disabled) {
        addBtn.addEventListener('click', add);
      } else {
        (addBtn as HTMLButtonElement).disabled = true;
      }

      container.appendChild(addBtn);
    };

    const emitChange = (newApprovers: Array<{ id: string; name: string }>) => {
      if (!this.currentItem) return;
      const node = this.currentItem as BaseNode;
      const currentProps = (node.getData().properties || {}) as any;
      const currentCfg = currentProps.approvalConfig || { type: 'single', approvers: [] };

      this.emit('property:change', {
        item: this.currentItem,
        key: 'approvers',
        value: newApprovers,
        updateData: {
          properties: {
            ...currentProps,
            approvalConfig: {
              ...currentCfg,
              approvers: newApprovers
            }
          }
        }
      });
    };

    const update = (idx: number, patch: Partial<{ id: string; name: string }>) => {
      const list = getApprovers().map(a => ({ ...a }));
      if (!list[idx]) return;
      list[idx] = { ...list[idx], ...patch };
      emitChange(list);
    };

    const remove = (idx: number) => {
      const list = getApprovers().map(a => ({ ...a }));
      list.splice(idx, 1);
      emitChange(list);
    };

    const add = () => {
      const list = getApprovers().map(a => ({ ...a }));
      list.push({ id: `u_${Date.now()}`, name: '' });
      emitChange(list);
    };

    // 初次渲染
    renderRows();

    return container;
  }

  /**
   * 获取字段值
   */
  private getFieldValue(key: string): any {
    if (!this.currentItem) {
      return undefined;
    }

    // 根据项目类型获取值
    if ('position' in this.currentItem) {
      // 节点
      const node = this.currentItem as BaseNode;
      const data = node.getData();
      const props = data.properties || {} as any;
      const approval = props.approvalConfig || {};
      
      switch (key) {
        case 'label':
          return data.label;
        case 'x':
          return data.position.x;
        case 'y':
          return data.position.y;
        case 'width':
          return data.size?.width;
        case 'height':
          return data.size?.height;
        case 'fillColor':
          return data.style?.fillColor;
        case 'strokeColor':
          return data.style?.strokeColor;
        case 'strokeWidth':
          return data.style?.strokeWidth;
        // 审批节点特有字段映射
        case 'approvalType':
          return approval.type;
        case 'allowDelegate':
          return approval.allowDelegate ?? false;
        case 'allowAddSign':
          return approval.allowAddSign ?? false;
        case 'timeout':
          return approval.timeout ?? 0;
        case 'timeoutAction':
          return approval.timeoutAction;
        case 'approversText': {
          const list = Array.isArray(approval.approvers) ? approval.approvers : [];
          // 简化展示为逗号分隔的名字
          return list.map((a: any) => a?.name || a?.id).filter(Boolean).join(',');
        }
        default:
          return data.properties?.[key];
      }
    } else {
      // 连接线
      const edge = this.currentItem as BaseEdge;
      const data = edge.getData();
      
      switch (key) {
        case 'label':
          return data.label;
        case 'strokeColor':
          return data.style?.strokeColor;
        case 'strokeWidth':
          return data.style?.strokeWidth;
        case 'useCustomControlPoints':
          return Array.isArray((data as any).customControlPoints) && (data as any).customControlPoints.length >= 2;
        default:
          return data.properties?.[key];
      }
    }
  }

  /**
   * 更新字段值
   */
  private updateFieldValue(key: string, value: any): void {
    if (!this.currentItem) {
      return;
    }

    const updateData: any = {};

    // 审批节点特有字段映射到 nested properties.approvalConfig
    const isNode = 'position' in this.currentItem;
    const isApproval = isNode && (this.currentItem as any).type === NodeType.APPROVAL;

    const setApprovalConfig = (patch: any) => {
      const node = this.currentItem as BaseNode;
      const currentProps = (node.getData().properties || {}) as any;
      const currentCfg = currentProps.approvalConfig || { type: 'single', approvers: [] };
      updateData.properties = {
        ...currentProps,
        approvalConfig: {
          ...currentCfg,
          ...patch
        }
      };
    };

    const parseApprovers = (text: string) => {
      if (!text || typeof text !== 'string') return [] as any[];
      const t = text.trim();
      if (!t) return [] as any[];
      // 优先尝试JSON
      try {
        const arr = JSON.parse(t);
        if (Array.isArray(arr)) {
          return arr.map((a, idx) => ({
            id: (a && a.id) || `u_${idx}`,
            name: (a && a.name) || String(a)
          }));
        }
      } catch {}
      // 否则按逗号分隔名字
      return t.split(',').map(s => s.trim()).filter(Boolean).map((name, idx) => ({ id: `u_${idx}`, name }));
    };

    // 根据字段类型构建更新数据
    switch (key) {
      case 'label':
        updateData.label = value;
        break;
      case 'x':
      case 'y':
        if (isNode) {
          const node = this.currentItem as BaseNode;
          const currentPos = node.getData().position;
          updateData.position = {
            ...currentPos,
            [key]: value
          };
        }
        break;
      case 'width':
      case 'height':
        if (isNode) {
          const node = this.currentItem as BaseNode;
          const currentSize = node.getData().size || { width: 100, height: 60 };
          updateData.size = {
            ...currentSize,
            [key]: value
          };
        }
        break;
      case 'fillColor':
      case 'strokeColor':
      case 'strokeWidth':
        const currentStyle = this.currentItem.getData().style || {};
        updateData.style = {
          ...currentStyle,
          [key]: value
        };
        break;
      case 'controlPointOffset': {
        // 仅对Bezier生效
        if (!('position' in this.currentItem)) {
          const edge = this.currentItem as BaseEdge;
          if ((edge as any).type === 'bezier') {
            updateData.controlPointOffset = Number(value) || 0;
          }
        }
        break;
      }
      case 'useCustomControlPoints': {
        // 勾选启用仅作为UI标识，不直接下发数据；取消勾选则清除自定义控制点
        if (!('position' in this.currentItem)) {
          const edge = this.currentItem as BaseEdge;
          if ((edge as any).type === 'bezier') {
            if (!value) {
              updateData.customControlPoints = undefined;
            } else {
              // 仅切换UI，不发出无效数据
              return;
            }
          }
        }
        break;
      }
      // 审批节点字段
      case 'approvalType':
        if (isApproval) setApprovalConfig({ type: value });
        break;
      case 'allowDelegate':
        if (isApproval) setApprovalConfig({ allowDelegate: !!value });
        break;
      case 'allowAddSign':
        if (isApproval) setApprovalConfig({ allowAddSign: !!value });
        break;
      case 'timeout':
        if (isApproval) setApprovalConfig({ timeout: Number(value) || 0 });
        break;
      case 'timeoutAction':
        if (isApproval) setApprovalConfig({ timeoutAction: value });
        break;
      case 'approversText':
        if (isApproval) setApprovalConfig({ approvers: parseApprovers(String(value)) });
        break;
      default: {
        const currentProperties = this.currentItem.getData().properties || {};
        updateData.properties = {
          ...currentProperties,
          [key]: value
        };
        break;
      }
    }

    // 不在这里直接更新底层数据，交由上层（编辑器）统一通过命令模式处理
    // 发射更新事件（使用字符串事件名，避免对枚举的依赖）
    this.emit('property:change', {
      item: this.currentItem,
      key,
      value,
      updateData
    });
  }

  /**
   * 设置当前项目
   */
  setCurrentItem(item: SelectableItem | null): void {
    this.currentItem = item;
    this.setupFields();
    this.render();
  }

  /**
   * 设置字段配置
   */
  private setupFields(): void {
    this.fields.clear();

    if (!this.currentItem) {
      return;
    }

    if ('position' in this.currentItem) {
      // 节点字段
      this.setupNodeFields();
    } else {
      // 连接线字段
      this.setupEdgeFields();
    }
  }

  /**
   * 设置节点字段
   */
  private setupNodeFields(): void {
    this.fields.set('label', {
      key: 'label',
      label: '标签',
      type: 'text',
      required: true
    });

    this.fields.set('x', {
      key: 'x',
      label: 'X坐标',
      type: 'number',
      step: 1
    });

    this.fields.set('y', {
      key: 'y',
      label: 'Y坐标',
      type: 'number',
      step: 1
    });

    this.fields.set('width', {
      key: 'width',
      label: '宽度',
      type: 'number',
      min: 20,
      step: 1
    });

    this.fields.set('height', {
      key: 'height',
      label: '高度',
      type: 'number',
      min: 20,
      step: 1
    });

    this.fields.set('fillColor', {
      key: 'fillColor',
      label: '填充颜色',
      type: 'color'
    });

    this.fields.set('strokeColor', {
      key: 'strokeColor',
      label: '边框颜色',
      type: 'color'
    });

    this.fields.set('strokeWidth', {
      key: 'strokeWidth',
      label: '边框宽度',
      type: 'number',
      min: 0,
      step: 1
    });

    // 审批节点扩展字段
    if (this.currentItem && 'position' in this.currentItem && (this.currentItem as any).type === NodeType.APPROVAL) {
      this.fields.set('approvalType', {
        key: 'approvalType',
        label: '审批类型',
        type: 'select',
        options: [
          { value: 'single', label: '单人审批' },
          { value: 'multiple', label: '多人审批' },
          { value: 'all', label: '会签(全体通过)' },
          { value: 'any', label: '或签(任意通过)' }
        ]
      });

      this.fields.set('allowDelegate', {
        key: 'allowDelegate',
        label: '允许委托',
        type: 'checkbox'
      });

      this.fields.set('allowAddSign', {
        key: 'allowAddSign',
        label: '允许加签',
        type: 'checkbox'
      });

      this.fields.set('timeout', {
        key: 'timeout',
        label: '超时时间(小时)',
        type: 'number',
        min: 0,
        step: 1
      });

      this.fields.set('timeoutAction', {
        key: 'timeoutAction',
        label: '超时处理',
        type: 'select',
        options: [
          { value: 'auto-approve', label: '自动同意' },
          { value: 'auto-reject', label: '自动拒绝' },
          { value: 'escalate', label: '升级处理' }
        ]
      });

      // 结构化的审批人列表控件
      this.fields.set('approversList', {
        key: 'approversList',
        label: '审批人列表',
        type: 'custom'
      });

      // 兼容：文本方式编辑
      this.fields.set('approversText', {
        key: 'approversText',
        label: '审批人(逗号分隔或JSON)',
        type: 'textarea'
      });
    }
  }

  /**
   * 设置连接线字段
   */
  private setupEdgeFields(): void {
    this.fields.set('label', {
      key: 'label',
      label: '标签',
      type: 'text'
    });

    this.fields.set('strokeColor', {
      key: 'strokeColor',
      label: '线条颜色',
      type: 'color'
    });

    this.fields.set('strokeWidth', {
      key: 'strokeWidth',
      label: '线条宽度',
      type: 'number',
      min: 1,
      step: 1
    });

    // Bezier专属：控制点偏移
    if (this.currentItem && !('position' in this.currentItem)) {
      const edge = this.currentItem as BaseEdge;
      if ((edge as any).type === 'bezier') {
        this.fields.set('controlPointOffset', {
          key: 'controlPointOffset',
          label: '控制点偏移',
          type: 'number',
          min: 0,
          step: 1
        });
        // 是否使用自定义控制点
        this.fields.set('useCustomControlPoints', {
          key: 'useCustomControlPoints',
          label: '自定义控制点',
          type: 'checkbox',
          defaultValue: this.getFieldValue('useCustomControlPoints')
        });
        // 控制区：重置按钮
        this.fields.set('bezierControls', {
          key: 'bezierControls',
          label: '控制点操作',
          type: 'custom'
        });
      }
    }
  }

  /**
   * 切换展开/折叠
   */
  toggle(): void {
    this.isExpanded = !this.isExpanded;
    this.contentElement.style.display = this.isExpanded ? 'block' : 'none';
    
    if (this.config.collapsible) {
      const toggleElement = this.headerElement.querySelector('.property-panel-toggle');
      if (toggleElement) {
        toggleElement.textContent = this.isExpanded ? '▼' : '▶';
      }
    }
  }

  /**
   * 展开面板
   */
  expand(): void {
    if (!this.isExpanded) {
      this.toggle();
    }
  }

  /**
   * 折叠面板
   */
  collapse(): void {
    if (this.isExpanded) {
      this.toggle();
    }
  }

  /**
   * 显示面板
   */
  show(): void {
    this.element.style.display = 'flex';
  }

  /**
   * 隐藏面板
   */
  hide(): void {
    this.element.style.display = 'none';
  }

  /**
   * 设置禁用状态
   */
  setDisabled(disabled: boolean): void {
    this.disabled = !!disabled;
    this.render();
  }

  /**
   * 销毁面板
   */
  destroy(): void {
    this.element.remove();
    this.fields.clear();
    this.fieldElements.clear();
    this.removeAllListeners();
  }
}
