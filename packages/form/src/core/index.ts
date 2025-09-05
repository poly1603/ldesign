/**
 * 核心库导出
 *
 * @description
 * 导出框架无关的核心功能，包括表单实例、字段实例、验证器等
 */

// === 核心类 ===
export { Form, createForm } from './form';
export { Field, createField } from './field';

// === 状态管理 ===
export {
  FormStateManager,
  FieldStateManager,
  createFormStateManager,
  createFieldStateManager
} from './state';

// === 验证器系统 ===
export {
  ValidatorRegistryImpl,
  ValidatorExecutorImpl,
  ValidatorFactoryImpl,
  createValidatorRegistry,
  createValidatorExecutor,
  createValidatorFactory,
  validatorFactory
} from './validator';

// === 事件系统 ===
export {
  EventBusImpl,
  createEventBus,
  createTypedEventBus,
  EVENT_NAMES
} from './events';

// === 默认导出 ===
export default {
  Form,
  Field,
  FormStateManager,
  FieldStateManager,
  ValidatorRegistryImpl,
  ValidatorExecutorImpl,
  EventBusImpl,
  createForm,
  createField,
  createFormStateManager,
  createFieldStateManager,
  createValidatorRegistry,
  createValidatorExecutor,
  createEventBus,
  EVENT_NAMES
};
