import type { ModalAnimation, ModalSize } from './modal';
import type { ModalVariant } from './modal';

export interface ModalBaseOptions {
  title?: string;
  content?: string | HTMLElement;
  /** 状态图标类型 */
  status?: 'info' | 'success' | 'warning' | 'error';
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
  /** 变体（未指定时，移动端默认使用 bottom-sheet） */
  variant?: ModalVariant;
}

/**
 * Prompt 表单：多字段输入，返回值对象
 */
export function promptForm(options: PromptFormOptions): Promise<Record<string, any> | null> {
  const opts = options || ({} as PromptFormOptions);
  return new Promise((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'prompt');

    applyMobileDefaults(modal, opts);
    applyCommonOptions(modal, {
      centered: true,
      closable: true,
      maskClosable: false,
      keyboard: true,
      destroyOnClose: true,
      ...opts,
    });

    const wrap = document.createElement('div');
    wrap.className = 'ldesign-modal__simple';
    const row = document.createElement('div');
    row.className = 'ldesign-modal__simple-row';
    const content = document.createElement('div');
    content.className = 'ldesign-modal__simple-content';

    const errors: Record<string, string> = {};
    const nodes: Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> = {};

    const values: Record<string, any> = { ...(opts.values || {}) };

    (opts.fields || []).forEach((f) => {
      const field = { type: 'text', ...f } as PromptField;
      const container = document.createElement('div');
      container.style.margin = '10px 0';
      if (field.label) {
        const label = document.createElement('div');
        label.style.cssText = 'margin-bottom:6px;color:#374151;font-size:14px;';
        label.textContent = field.label + (field.required ? ' *' : '');
        container.appendChild(label);
      }
      let input: any;
      if (field.type === 'textarea') {
        input = document.createElement('textarea');
        if (field.rows) input.rows = field.rows;
      } else if (field.type === 'select') {
        input = document.createElement('select');
        (field.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value; o.textContent = opt.label; input.appendChild(o);
        });
      } else if (field.type === 'checkbox') {
        input = document.createElement('input'); input.type = 'checkbox';
      } else {
        input = document.createElement('input'); input.type = field.type || 'text';
      }
      if (field.placeholder) (input as any).placeholder = field.placeholder;
      const init = values[field.name] ?? field.value ?? '';
      if (field.type === 'checkbox') input.checked = !!init; else input.value = String(init);
      input.className = 'ldesign-modal__prompt-input';
      input.style.marginTop = field.type === 'checkbox' ? '0' : '6px';
      container.appendChild(input);

      const err = document.createElement('div'); err.className = 'ldesign-modal__error'; err.style.display = 'none'; container.appendChild(err);
      nodes[field.name] = input; (errors as any)[field.name] = '';
      content.appendChild(container);
    });

    row.appendChild(content); wrap.appendChild(row);

    const footer = document.createElement('div'); footer.slot = 'footer';
    const cancelBtn = document.createElement('ldesign-button'); cancelBtn.setAttribute('type', 'text'); cancelBtn.textContent = opts.cancelText || '取消';
    cancelBtn.addEventListener('click', () => { modal.visible = false; scheduleRemoval(modal); resolve(null); });
    const okBtn = document.createElement('ldesign-button'); okBtn.setAttribute('type', (opts.okType || 'primary') as string); okBtn.textContent = opts.okText || '确定';

    const computeValid = () => {
      // 基础校验（不展示错误，只用于禁用按钮）
      let ok = true;
      (opts.fields || []).forEach((f) => {
        const node = nodes[f.name]; if (!node) return; const v = f.type==='checkbox' ? (node as HTMLInputElement).checked : (node as any).value;
        if (f.required && (v == null || v === '' || (f.type==='checkbox' && !v))) ok=false;
        if (ok && f.pattern) { const re = typeof f.pattern==='string'? new RegExp(f.pattern) : f.pattern; if (!re.test(String(v||''))) ok=false; }
        if (ok && typeof f.min==='number' && Number(v) < f.min) ok=false;
        if (ok && typeof f.max==='number' && Number(v) > f.max) ok=false;
      });
      okBtn.setAttribute('disabled', ok ? 'false' : 'true');
      (okBtn as any).disabled = !ok;
      return ok;
    };

    // 初次计算
    computeValid();
    // 监听变化实时计算
    Object.keys(nodes).forEach(name => {
      const n = nodes[name];
      const handler = () => computeValid();
      n.addEventListener('input', handler as any);
      n.addEventListener('change', handler as any);
    });

    okBtn.addEventListener('click', async () => {
      // 收集
      const out: Record<string, any> = {};
      (opts.fields || []).forEach((f) => {
        const node = nodes[f.name];
        if (!node) return;
        if (f.type === 'checkbox') out[f.name] = (node as HTMLInputElement).checked;
        else out[f.name] = (node as any).value;
      });
      // 基础校验
      let ok = true; const errMap: Record<string, string> = {};
      (opts.fields || []).forEach((f) => {
        const node = nodes[f.name]; const v = out[f.name];
        if (f.required && (v == null || v === '' || (f.type==='checkbox' && !v))) { ok=false; errMap[f.name] = '必填项'; return; }
        if (f.pattern) {
          const re = typeof f.pattern === 'string' ? new RegExp(f.pattern) : f.pattern; if (!re.test(String(v||''))) { ok=false; errMap[f.name]='格式不正确'; }
        }
        if (typeof f.min === 'number' && Number(v) < f.min) { ok=false; errMap[f.name] = `最小值 ${f.min}`; }
        if (typeof f.max === 'number' && Number(v) > f.max) { ok=false; errMap[f.name] = `最大值 ${f.max}`; }
      });
      // 自定义校验
      if (ok && opts.validate) {
        try {
          const r = await Promise.resolve(opts.validate(out));
          if (r === false) ok = false; else if (typeof r === 'string') { ok=false; errMap['__global'] = r; }
          else if (r && typeof r === 'object') { ok=false; Object.assign(errMap, r as any); }
        } catch (e) { ok=false; errMap['__global'] = '提交失败'; }
      }
      // 展示错误或关闭
      // 清空
      Object.keys(nodes).forEach(name => { const n = nodes[name]; const errEl = n.nextSibling as HTMLElement; if (errEl && errEl.className.includes('ldesign-modal__error')) errEl.style.display='none'; });
      if (!ok) {
        Object.keys(errMap).forEach(name => {
          if (name === '__global') return;
          const n = nodes[name]; if (!n) return; const errEl = n.nextSibling as HTMLElement; if (!errEl) return;
          errEl.textContent = errMap[name]; errEl.style.display = '';
        });
        return;
      }
      modal.visible = false; scheduleRemoval(modal); resolve(out);
    });

    footer.appendChild(cancelBtn); footer.appendChild(okBtn);
    (modal as HTMLElement).appendChild(wrap);
    (modal as HTMLElement).appendChild(footer);
    (modal as HTMLElement).addEventListener('ldesignClose', () => { scheduleRemoval(modal); resolve(null); }, { once: true } as any);

    document.body.appendChild(modal); modal.visible = true;
  });
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
  /** 校验输入，返回 true/空 表示通过；返回字符串为错误信息；返回 false 使用 errorText */
  validate?: (value: string) => boolean | string | Promise<boolean | string>;
  errorText?: string;
}

export type PromptFieldType = 'text' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox';
export interface PromptField {
  name: string;
  label?: string;
  type?: PromptFieldType;
  placeholder?: string;
  required?: boolean;
  pattern?: string | RegExp;
  min?: number;
  max?: number;
  rows?: number; // textarea rows
  options?: { label: string; value: string }[]; // select
  value?: any;
}
export interface PromptFormOptions extends ModalConfirmOptions {
  fields: PromptField[];
  values?: Record<string, any>;
  /** 返回 false/错误对象可阻止关闭；若返回对象可替换 values */
  validate?: (values: Record<string, any>) => boolean | string | Record<string, string> | Promise<boolean | string | Record<string, string>>;
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
  }
  return content;
}

function createStatusIcon(status?: string): HTMLElement | null {
  if (!status) return null;
  const map: Record<string, string> = {
    info: 'info',
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'x-circle'
  };
  const name = map[status];
  if (!name) return null;
  const wrap = document.createElement('span');
  wrap.className = `ldesign-modal__status ldesign-modal__status--${status}`;
  const icon = document.createElement('ldesign-icon');
  icon.setAttribute('name', name);
  icon.className = 'ldesign-modal__status-icon';
  wrap.appendChild(icon);
  return wrap;
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
function isSmallScreen() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

function applyMobileDefaults(modal: any, opts: ModalBaseOptions) {
  if (opts.variant) { modal.variant = opts.variant; return; }
  if (isSmallScreen()) {
    modal.variant = 'bottom-sheet';
  }
}

export function alertModal(options: ModalAlertOptions | string): Promise<void> {
  const opts: ModalAlertOptions = typeof options === 'string' ? { content: options } : options || {};

  return new Promise<void>((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    // 标记为快捷样式
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'alert');

    applyMobileDefaults(modal, opts);
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
    const row = document.createElement('div');
    row.className = 'ldesign-modal__simple-row';
    const statusIcon = createStatusIcon(opts.status);
    if (statusIcon) row.appendChild(statusIcon);
    const contentWrap = document.createElement('div');
    contentWrap.className = 'ldesign-modal__simple-content';
    const node = ensureContentNode(opts.content || '');
    if (node) contentWrap.appendChild(node);
    row.appendChild(contentWrap);
    body.appendChild(row);

    // 自定义 footer，只放一个 OK 按钮
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.className = 'ldesign-modal__quick-footer';
    // 确保右对齐且有间距（内联保障，不依赖外部样式）
    (footer as HTMLElement).style.display = 'flex';
    (footer as HTMLElement).style.justifyContent = 'flex-end';
    (footer as HTMLElement).style.gap = '12px';
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

    applyMobileDefaults(modal, opts);
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
    const row = document.createElement('div');
    row.className = 'ldesign-modal__simple-row';
    const statusIcon = createStatusIcon(opts.status);
    if (statusIcon) row.appendChild(statusIcon);
    const contentWrap = document.createElement('div');
    contentWrap.className = 'ldesign-modal__simple-content';
    const node = ensureContentNode(opts.content || '');
    if (node) contentWrap.appendChild(node);
    row.appendChild(contentWrap);
    body.appendChild(row);

    // 自定义 footer：取消 + 确定
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.className = 'ldesign-modal__quick-footer';
    (footer as HTMLElement).style.display = 'flex';
    (footer as HTMLElement).style.justifyContent = 'flex-end';
    (footer as HTMLElement).style.gap = '12px';

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
    const okStyle = (opts.okType || ((opts.status === 'warning' || opts.status === 'error') ? 'danger' : 'primary')) as string;
    okBtn.setAttribute('type', okStyle);
    okBtn.textContent = opts.okText || '确定';
    // 兜底：若 gap 样式未生效，给确定按钮一个左外边距
    (okBtn as any as HTMLElement).style.marginLeft = '12px';
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

    applyMobileDefaults(modal, opts);
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

    const row = document.createElement('div');
    row.className = 'ldesign-modal__simple-row';
    const statusIcon = createStatusIcon(opts.status);
    if (statusIcon) row.appendChild(statusIcon);
    const contentCol = document.createElement('div');
    contentCol.className = 'ldesign-modal__simple-content';

    const contentNode = ensureContentNode(opts.content || '');
    if (contentNode) contentCol.appendChild(contentNode);

    const input = document.createElement('input');
    input.type = opts.input?.type || 'text';
    input.placeholder = opts.input?.placeholder || '';
    if (opts.input?.defaultValue != null) input.value = opts.input.defaultValue;
    if (opts.input?.maxlength != null) input.maxLength = opts.input.maxlength!;
    input.className = 'ldesign-modal__prompt-input';
    contentCol.appendChild(input);

    // 错误文本
    const err = document.createElement('div');
    err.className = 'ldesign-modal__error';
    err.style.display = 'none';
    contentCol.appendChild(err);

    row.appendChild(contentCol);
    wrap.appendChild(row);

    // 自定义 footer：取消 + 确定
    const footer = document.createElement('div');
    footer.slot = 'footer';
    footer.className = 'ldesign-modal__quick-footer';
    (footer as HTMLElement).style.display = 'flex';
    (footer as HTMLElement).style.justifyContent = 'flex-end';
    (footer as HTMLElement).style.gap = '12px';

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
    (okBtn as any as HTMLElement).style.marginLeft = '12px';
    okBtn.addEventListener('click', async () => {
      const val = input.value;
      if (opts.validate) {
        try {
          const r = await Promise.resolve(opts.validate(val));
          let pass = false;
          let msg = '';
          if (r === true || r === undefined) pass = true;
          else if (typeof r === 'string') { pass = false; msg = r; }
          else pass = false;
          if (!pass) {
            err.textContent = msg || opts.errorText || '请输入有效的内容';
            err.style.display = '';
            input.setAttribute('aria-invalid', 'true');
            input.focus();
            return;
          }
        } catch (_) {
          err.textContent = opts.errorText || '请输入有效的内容';
          err.style.display = '';
          input.setAttribute('aria-invalid', 'true');
          input.focus();
          return;
        }
      }
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

/**
 * Prompt（密码）: type='password'，带显示/隐藏切换与必填校验
 */
export function promptPassword(options: Omit<ModalPromptOptions, 'input'> & { revealToggle?: boolean }): Promise<string | null> {
  const opts: any = typeof options === 'string' ? { content: options } : options || {};
  opts.input = { ...(opts.input || {}), type: 'password' };
  return new Promise<string | null>((resolve) => {
    const modal = document.createElement('ldesign-modal') as any;
    (modal as HTMLElement).setAttribute('data-quick', '');
    (modal as HTMLElement).setAttribute('data-quick-type', 'prompt');

    applyMobileDefaults(modal, opts);
    applyCommonOptions(modal, {
      centered: true,
      closable: true,
      maskClosable: false,
      keyboard: true,
      destroyOnClose: true,
      ...opts,
    });

    const wrap = document.createElement('div');
    wrap.className = 'ldesign-modal__simple';
    const row = document.createElement('div');
    row.className = 'ldesign-modal__simple-row';
    const contentCol = document.createElement('div');
    contentCol.className = 'ldesign-modal__simple-content';
    const contentNode = ensureContentNode(opts.content || '');
    if (contentNode) contentCol.appendChild(contentNode);

    const box = document.createElement('div');
    box.style.position = 'relative';
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = opts.input?.placeholder || '';
    input.className = 'ldesign-modal__prompt-input';
    box.appendChild(input);
    if (opts.revealToggle !== false) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;color:#6b7280;';
      btn.textContent = '显示';
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.textContent = show ? '隐藏' : '显示';
      });
      box.appendChild(btn);
    }
    contentCol.appendChild(box);

    const err = document.createElement('div');
    err.className = 'ldesign-modal__error';
    err.style.display = 'none';
    contentCol.appendChild(err);

    row.appendChild(contentCol);
    wrap.appendChild(row);

    const footer = document.createElement('div');
    footer.slot = 'footer';
    const cancelBtn = document.createElement('ldesign-button');
    cancelBtn.setAttribute('type', 'text');
    cancelBtn.textContent = opts.cancelText || '取消';
    cancelBtn.addEventListener('click', () => {
      modal.visible = false; scheduleRemoval(modal); resolve(null);
    });

    const okBtn = document.createElement('ldesign-button');
    okBtn.setAttribute('type', (opts.okType || 'primary') as string);
    okBtn.textContent = opts.okText || '确定';
    okBtn.addEventListener('click', () => {
      const v = input.value || '';
      if (!v) { err.textContent = '请输入密码'; err.style.display = ''; input.focus(); return; }
      modal.visible = false; scheduleRemoval(modal); resolve(v);
    });

    footer.appendChild(cancelBtn); footer.appendChild(okBtn);
    (modal as HTMLElement).appendChild(wrap);
    (modal as HTMLElement).appendChild(footer);

    (modal as HTMLElement).addEventListener('ldesignClose', () => { scheduleRemoval(modal); resolve(null); }, { once: true } as any);

    document.body.appendChild(modal);
    modal.visible = true;
    requestAnimationFrame(() => input.focus());
  });
}
