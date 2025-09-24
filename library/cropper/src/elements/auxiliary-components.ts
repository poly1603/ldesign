/**
 * 辅助组件集合
 * 包含 Handle、Grid、Crosshair、Shade、Viewer 等辅助组件
 */

import CropperElement from './cropper-element';
import {
  CROPPER_HANDLE,
  CROPPER_GRID,
  CROPPER_CROSSHAIR,
  CROPPER_SHADE,
  CROPPER_VIEWER,
} from '../utils';

/**
 * 裁剪器手柄组件
 * 用于调整选择区域的尺寸
 */
export class CropperHandle extends CropperElement {
  static $name = CROPPER_HANDLE;
  static $version = '1.0.0';

  protected $style = `
    :host {
      background-color: var(--theme-color, var(--ldesign-brand-color, #722ED1));
      display: block;
      position: absolute;
    }

    :host([action="move"]),
    :host([action="select"]) {
      height: 100% !important;
      left: 0 !important;
      position: absolute !important;
      top: 0 !important;
      width: 100% !important;
    }

    :host([action="move"]) {
      cursor: move;
    }

    :host([action="select"]) {
      cursor: crosshair;
    }

    :host([action$="-resize"]) {
      background-color: transparent;
      height: 12px;
      position: absolute;
      width: 12px;
    }

    :host([action$="-resize"])::after {
      background-color: #fff;
      border: 1px solid rgba(0,0,0,0.2);
      content: "";
      display: block;
      height: 8px;
      left: 50%;
      top: 50%;
      position: absolute;
      width: 8px;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 0 1px rgba(0,0,0,.05);
    }

    :host([action="n-resize"]),
    :host([action="s-resize"]) {
      cursor: ns-resize;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
    }

    :host([action="n-resize"]) {
      top: -6px;
    }

    :host([action="s-resize"]) {
      bottom: -6px;
    }

    :host([action="e-resize"]),
    :host([action="w-resize"]) {
      cursor: ew-resize;
      height: 100%;
      top: 50%;
      transform: translateY(-50%);
    }

    :host([action="e-resize"]) {
      right: -6px;
    }

    :host([action="w-resize"]) {
      left: -6px;
    }

    :host([action="ne-resize"]) {
      cursor: nesw-resize;
      right: -6px;
      top: -6px;
    }

    :host([action="nw-resize"]) {
      cursor: nwse-resize;
      left: -6px;
      top: -6px;
    }

    :host([action="se-resize"]) {
      cursor: nwse-resize;
      right: -6px;
      bottom: -6px;
    }


    :host([action="sw-resize"]) {
      cursor: nesw-resize;
      left: -8px;
      bottom: -8px;
    }

    :host([plain]) {
      background-color: transparent;
    }
  `;

  action = '';
  plain = false;

  protected static get observedAttributes(): string[] {
    return super.observedAttributes.concat(['action', 'plain']);
  }
}

/**
 * 裁剪器网格组件
 * 显示九宫格辅助线
 */
export class CropperGrid extends CropperElement {
  static $name = CROPPER_GRID;
  static $version = '1.0.0';

  protected $style = `
    :host {
      position: absolute;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.8;
    }

    :host([bordered]) {
      border: 1px solid rgba(255, 255, 255, 0.5);
    }

    :host([covered]) {
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px);
      background-size: 33.333% 33.333%;
    }

    :host([role="grid"]) {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr 1fr 1fr;
      gap: 0;
    }
  `;

  bordered = false;
  covered = false;

  protected static get observedAttributes(): string[] {
    return super.observedAttributes.concat(['bordered', 'covered']);
  }
}

/**
 * 裁剪器十字线组件
 * 显示中心十字线
 */
export class CropperCrosshair extends CropperElement {
  static $name = CROPPER_CROSSHAIR;
  static $version = '1.0.0';

  protected $style = `
    :host {
      position: absolute;
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    :host([centered])::before,
    :host([centered])::after {
      content: '';
      position: absolute;
      background-color: rgba(255, 255, 255, 0.8);
    }

    :host([centered])::before {
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
      transform: translateY(-50%);
    }

    :host([centered])::after {
      top: 0;
      left: 50%;
      width: 1px;
      height: 100%;
      transform: translateX(-50%);
    }
  `;

  centered = false;

  protected static get observedAttributes(): string[] {
    return super.observedAttributes.concat(['centered']);
  }
}

/**
 * 裁剪器遮罩组件
 * 显示选择区域外的遮罩
 */
export class CropperShade extends CropperElement {
  static $name = CROPPER_SHADE;
  static $version = '1.0.0';

  protected $style = `
    :host {
      position: absolute;
      display: block;
      background-color: rgba(0, 0, 0, 0.5);
      pointer-events: none;
      inset: 0;
    }

    :host([hidden]) {
      display: none !important;
    }
  `;
}

/**
 * 裁剪器查看器组件
 * 显示裁剪预览
 */
export class CropperViewer extends CropperElement {
  static $name = CROPPER_VIEWER;
  static $version = '1.0.0';

  protected $style = `
    :host {
      position: relative;
      display: block;
      overflow: hidden;
      background-color: var(--ldesign-bg-color-container, #ffffff);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);
    }

    :host img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `;
}
