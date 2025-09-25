import type { ModalAnimation, ModalSize } from './modal';

export interface ModalBaseOptions {
  title?: string;
  content?: string | HTMLElement;
  size?: ModalSize;
  centered?: boolean;
  animation?: ModalAnimation;
  mask?: boolean;
  closable?: boolean;
  maskClosable?: boolean;
  keyboard?: boolean;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  className?: string;
  destroyOnClose?: boolean;
}

export interface ModalAlertOptions extends ModalBaseOptions {
  okText?: string;
  /** OK 按钮风格（对应 ldesign-button 的 type） */
  okType?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'text' | 'link' | 'dashed';
}

export interface ModalConfirmOptions extends ModalBaseOptions {
  okText?: string;
  cancelText?: string;
  /** OK 按钮风格（对应 ldesign-button 的 type） */
  okType?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'text' | 'link' | 'dashed';
}

export interface ModalPromptOptions extends ModalConfirmOptions {
  input?: {
    type?: string;
    placeholder?: string;
    defaultValue?: string;
    maxlength?: number;
  };
}

/**
 * 内部：为 <ldesign-modal> 应用通用选项
 */
function applyCommonOptions(modal: any, opts: ModalBaseOptions) {
  if (opts.title != null) modal.modalTitle = opts.title;
  if (opts.size != null) modal.size = opts.size;
  if (opts.centered != null) modal.centered = opts.centered;
  if (opts.animation != null) modal.animation = opts.animation;
  if (opts.mask != null) modal.mask = opts.mask;
  if (opts.closable != null) modal.closable = opts.closable;
  if (opts.maskClosable != null) modal.maskClosable = opts.maskClosable;
  if (opts.keyboard != null) modal.keyboard = opts.keyboard;
  if (opts.width != null) modal.width = opts.width as any;
  if (opts.height != null) modal.height = opts.height as any;
  if (opts.zIndex != null) modal.zIndex = opts.zIndex;
  if (opts.destroyOnClose != null) modal.destroyOnClose = opts.destroyOnClose;
  if (opts.className) (modal as HTMLElement).classList.add(opts.className);
}

function ensureContentNode(content?: string | HTMLElement): Node | null {
  if (content == null) return null;
  if (typeof content === 'string') {
    const div = document.createElement('div');
    div.textContent = content; // 默认按纯文本处理，避免 XSS
    return div;
    // 如需支持富文本，可改为 div.innerHTML = content;
  }
  return content;
}

function scheduleRemoval(modal: HTMLElement, delay = 320) {
  setTimeout(() => {
    try {
      modal.remove();
    } catch (_) {}
  }, delay);
}

/**
 * Alert：仅一个确认按钮
 */
export function alertModal(options: ModalAlertOptions | string): Promise<void> {
  const opts: ModalAlertOptions = typeof options === 'string' ? { content: options } : options || {};

  return new Promise<void>((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    // 标记为快捷样式
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'alert');

    applyCommonOptions(modal, {
      centered: true,
      closable: false,
      maskClosable: false,
      keyboard: false,
      destroyOnClose: true,
      ...opts,
    });

    // 内容
    const body = document.createElement('div');
    body.className = 'ldesign-modal__simple';
    const node = ensureContentNode(opts.content || '');
    if (node) body.appendChild(node);

    // 自定义 footer，只放一个 OK 按钮
    const footer = document.createElement('div');
    footer.slot = 'footer';
    const okBtn = document.createElement('ldesign-button');
    okBtn.setAttribute('type', (opts.okType || 'primary') as string);
    okBtn.textContent = opts.okText || '确定';
    okBtn.addEventListener('click', () => {
      modal.visible = false;
      scheduleRemoval(modal);
      resolve();
    });
    footer.appendChild(okBtn);

    (modal as HTMLElement).appendChild(body);
    (modal as HTMLElement).appendChild(footer);

    document.body.appendChild(modal);
    modal.visible = true;
  });
}

/**
 * Confirm：确认/取消，返回 true/false
 */
export function confirmModal(options: ModalConfirmOptions | string): Promise<boolean> {
  const opts: ModalConfirmOptions = typeof options === 'string' ? { content: options } : options || {};

  return new Promise<boolean>((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    // 标记为快捷样式
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'confirm');

    applyCommonOptions(modal, {
      centered: true,
      closable: true,
      maskClosable: false,
      keyboard: true,
      destroyOnClose: true,
      ...opts,
    });

    // 内容
    const body = document.createElement('div');
    body.className = 'ldesign-modal__simple';
    const node = ensureContentNode(opts.content || '');
    if (node) body.appendChild(node);

    // 自定义 footer：取消 + 确定
    const footer = document.createElement('div');
    footer.slot = 'footer';

    const cancelBtn = document.createElement('ldesign-button');
    // 使用更轻的文本按钮，减少视觉噪音
    cancelBtn.setAttribute('type', 'text');
    cancelBtn.textContent = opts.cancelText || '取消';
    cancelBtn.addEventListener('click', () => {
      modal.visible = false;
      scheduleRemoval(modal);
      resolve(false);
    });

    const okBtn = document.createElement('ldesign-button');
    okBtn.setAttribute('type', (opts.okType || 'primary') as string);
    okBtn.textContent = opts.okText || '确定';
    okBtn.addEventListener('click', () => {
      modal.visible = false;
      scheduleRemoval(modal);
      resolve(true);
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    (modal as HTMLElement).appendChild(body);
    (modal as HTMLElement).appendChild(footer);

    // 其他关闭途径视为取消
    (modal as HTMLElement).addEventListener('ldesignClose', () => {
      scheduleRemoval(modal);
      resolve(false);
    }, { once: true } as any);

    document.body.appendChild(modal);
    modal.visible = true;
  });
}

/**
 * Prompt：带输入框，确认返回字符串，取消返回 null
 */
export function promptModal(options: ModalPromptOptions | string): Promise<string | null> {
  const opts: ModalPromptOptions = typeof options === 'string' ? { content: options } : options || {};

  return new Promise<string | null>((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    // 标记为快捷样式
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'prompt');

    applyCommonOptions(modal, {
      centered: true,
      closable: true,
      maskClosable: false,
      keyboard: true,
      destroyOnClose: true,
      ...opts,
    });

    // 内容 + 输入框
    const wrap = document.createElement('div');
    wrap.className = 'ldesign-modal__simple';

    const contentNode = ensureContentNode(opts.content || '');
    if (contentNode) wrap.appendChild(contentNode);

    const input = document.createElement('input');
    input.type = opts.input?.type || 'text';
    input.placeholder = opts.input?.placeholder || '';
    if (opts.input?.defaultValue != null) input.value = opts.input.defaultValue;
    if (opts.input?.maxlength != null) input.maxLength = opts.input.maxlength!;
    input.className = 'ldesign-modal__prompt-input';
    wrap.appendChild(input);

    // 自定义 footer：取消 + 确定
    const footer = document.createElement('div');
    footer.slot = 'footer';

    const cancelBtn = document.createElement('ldesign-button');
    // 更轻的文本样式
    cancelBtn.setAttribute('type', 'text');
    cancelBtn.textContent = opts.cancelText || '取消';
    cancelBtn.addEventListener('click', () => {
      modal.visible = false;
      scheduleRemoval(modal);
      resolve(null);
    });

    const okBtn = document.createElement('ldesign-button');
    okBtn.setAttribute('type', (opts.okType || 'primary') as string);
    okBtn.textContent = opts.okText || '确定';
    okBtn.addEventListener('click', () => {
      const val = input.value;
      modal.visible = false;
      scheduleRemoval(modal);
      resolve(val);
    });

    footer.appendChild(cancelBtn);
    footer.appendChild(okBtn);

    (modal as HTMLElement).appendChild(wrap);
    (modal as HTMLElement).appendChild(footer);

    // 其他关闭途径视为取消
    (modal as HTMLElement).addEventListener('ldesignClose', () => {
      scheduleRemoval(modal);
      resolve(null);
    }, { once: true } as any);

    document.body.appendChild(modal);
    modal.visible = true;

    // 初始聚焦输入框
    requestAnimationFrame(() => input.focus());
  });
}
