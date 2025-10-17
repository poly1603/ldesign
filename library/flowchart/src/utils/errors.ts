/**
 * 流程图错误基类
 */
export class FlowChartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FlowChartError';
    Object.setPrototypeOf(this, FlowChartError.prototype);
  }
}

/**
 * 节点相关错误
 */
export class NodeError extends FlowChartError {
  constructor(message: string, public nodeId?: string) {
    super(message);
    this.name = 'NodeError';
    Object.setPrototypeOf(this, NodeError.prototype);
  }
}

/**
 * 边相关错误
 */
export class EdgeError extends FlowChartError {
  constructor(message: string, public edgeId?: string) {
    super(message);
    this.name = 'EdgeError';
    Object.setPrototypeOf(this, EdgeError.prototype);
  }
}

/**
 * 验证错误
 */
export class ValidationError extends FlowChartError {
  constructor(
    message: string,
    public errors: string[] = []
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * 布局错误
 */
export class LayoutError extends FlowChartError {
  constructor(message: string) {
    super(message);
    this.name = 'LayoutError';
    Object.setPrototypeOf(this, LayoutError.prototype);
  }
}

/**
 * 渲染错误
 */
export class RenderError extends FlowChartError {
  constructor(message: string) {
    super(message);
    this.name = 'RenderError';
    Object.setPrototypeOf(this, RenderError.prototype);
  }
}

/**
 * 配置错误
 */
export class ConfigError extends FlowChartError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
    Object.setPrototypeOf(this, ConfigError.prototype);
  }
}

