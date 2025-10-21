/**
 * 事件控制器 - 处理DOM事件并转发为图事件
 */

import { EventBus } from '../../utils/EventBus';
import { GraphEvent } from '../../types/graph';

export class EventController {
  private svg: SVGSVGElement;
  private eventBus: EventBus;

  constructor(svg: SVGSVGElement, eventBus: EventBus) {
    this.svg = svg;
    this.eventBus = eventBus;
    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    this.svg.addEventListener('click', this.handleClick);
    this.svg.addEventListener('dblclick', this.handleDblClick);
    this.svg.addEventListener('contextmenu', this.handleContextMenu);
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.svg.removeEventListener('click', this.handleClick);
    this.svg.removeEventListener('dblclick', this.handleDblClick);
    this.svg.removeEventListener('contextmenu', this.handleContextMenu);
  }

  /**
   * 处理点击事件
   */
  private handleClick = (e: MouseEvent): void => {
    const target = e.target as Element;

    // 查找节点
    const nodeElement = target.closest('.fc-node');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      if (nodeId) {
        this.eventBus.emit(GraphEvent.NODE_CLICK, { id: nodeId, event: e });
        return;
      }
    }

    // 查找边
    const edgeElement = target.closest('.fc-edge');
    if (edgeElement) {
      const edgeId = edgeElement.getAttribute('data-id');
      if (edgeId) {
        this.eventBus.emit(GraphEvent.EDGE_CLICK, { id: edgeId, event: e });
        return;
      }
    }

    // 画布点击
    this.eventBus.emit(GraphEvent.CANVAS_CLICK, { event: e });
  };

  /**
   * 处理双击事件
   */
  private handleDblClick = (e: MouseEvent): void => {
    const target = e.target as Element;

    // 查找节点
    const nodeElement = target.closest('.fc-node');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      if (nodeId) {
        this.eventBus.emit(GraphEvent.NODE_DBLCLICK, { id: nodeId, event: e });
        return;
      }
    }

    // 查找边
    const edgeElement = target.closest('.fc-edge');
    if (edgeElement) {
      const edgeId = edgeElement.getAttribute('data-id');
      if (edgeId) {
        this.eventBus.emit(GraphEvent.EDGE_DBLCLICK, { id: edgeId, event: e });
        return;
      }
    }

    // 画布双击
    this.eventBus.emit(GraphEvent.CANVAS_DBLCLICK, { event: e });
  };

  /**
   * 处理右键菜单事件
   */
  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();

    const target = e.target as Element;

    // 查找节点
    const nodeElement = target.closest('.fc-node');
    if (nodeElement) {
      const nodeId = nodeElement.getAttribute('data-id');
      if (nodeId) {
        this.eventBus.emit(GraphEvent.NODE_CONTEXTMENU, { id: nodeId, event: e });
        return;
      }
    }

    // 查找边
    const edgeElement = target.closest('.fc-edge');
    if (edgeElement) {
      const edgeId = edgeElement.getAttribute('data-id');
      if (edgeId) {
        this.eventBus.emit(GraphEvent.EDGE_CONTEXTMENU, { id: edgeId, event: e });
        return;
      }
    }

    // 画布右键
    this.eventBus.emit(GraphEvent.CANVAS_CONTEXTMENU, { event: e });
  };

  /**
   * 销毁控制器
   */
  destroy(): void {
    this.unbindEvents();
  }
}


