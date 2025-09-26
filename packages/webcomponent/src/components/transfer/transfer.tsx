import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';

export interface TransferItem {
  key: string;
  label: string;
  disabled?: boolean;
}

/**
 * Transfer 穿梭框
 * 支持左右两栏列表，通过按钮将条目在两侧移动。
 */
@Component({
  tag: 'ldesign-transfer',
  styleUrl: 'transfer.less',
  shadow: false,
})
export class LdesignTransfer {
  /** 数据源（可传数组或 JSON 字符串） */
  @Prop() items: string | TransferItem[] = [];

  /** 内部：是否受控（由外部传入 value 判定，一旦判定不再改变） */
  private isControlled: boolean = false;

  /** 目标列表值（受控）*/
  @Prop({ mutable: true }) value?: string[];

  /** 默认值（非受控） */
  @Prop() defaultValue?: string[];

  /** 禁用整个组件 */
  @Prop() disabled: boolean = false;

  /** 是否可搜索 */
  @Prop() filterable: boolean = false;

  /** 左侧面板标题 */
  @Prop() leftTitle: string = '源列表';

  /** 右侧面板标题 */
  @Prop() rightTitle: string = '目标列表';

  /** 列表高度（px） */
  @Prop() listHeight: number = 240;

  /** 值改变事件 */
  @Event() ldesignChange!: EventEmitter<{ value: string[]; movedKeys: string[]; direction: 'left' | 'right' }>; 

  @State() parsedItems: TransferItem[] = [];
  @State() rightKeys: string[] = [];
  @State() leftSelectedKeys: string[] = [];
  @State() rightSelectedKeys: string[] = [];
  @State() leftQuery: string = '';
  @State() rightQuery: string = '';

  @Watch('items')
  watchItems(val: string | TransferItem[]) {
    this.parsedItems = this.parseItems(val);
    this.cleanSelections();
  }

  @Watch('value')
  watchValue(newVal?: string[]) {
    this.rightKeys = this.normalizeToArray(newVal ?? this.rightKeys);
    this.cleanSelections();
  }

  componentWillLoad() {
    this.isControlled = this.value !== undefined;
    this.parsedItems = this.parseItems(this.items);
    const initial = this.value !== undefined ? this.value : this.defaultValue;
    this.rightKeys = this.normalizeToArray(initial);
  }

  private parseItems(val: string | TransferItem[]): TransferItem[] {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private normalizeToArray(val?: string[] | string): string[] {
    if (val === undefined || val === null) return [];
    if (Array.isArray(val)) return val;
    // 支持传入 JSON 字符串
    if (typeof val === 'string' && val.trim().startsWith('[')) {
      try {
        const arr = JSON.parse(val);
        return Array.isArray(arr) ? arr : [];
      } catch { /* ignore */ }
    }
    return [];
  }

  private getLeftItems(): TransferItem[] {
    const rightSet = new Set(this.rightKeys);
    return this.parsedItems.filter((it) => !rightSet.has(it.key));
  }

  private getRightItems(): TransferItem[] {
    const map = new Map(this.parsedItems.map((it) => [it.key, it] as const));
    // 右侧保持 value 顺序
    return this.rightKeys.map((k) => map.get(k)).filter(Boolean) as TransferItem[];
  }

  private filterItems(items: TransferItem[], query: string): TransferItem[] {
    if (!this.filterable) return items;
    const q = (query || '').trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => (it.label || '').toLowerCase().includes(q));
  }

  private cleanSelections() {
    const leftSet = new Set(this.getLeftItems().map((i) => i.key));
    const rightSet = new Set(this.getRightItems().map((i) => i.key));
    this.leftSelectedKeys = this.leftSelectedKeys.filter((k) => leftSet.has(k));
    this.rightSelectedKeys = this.rightSelectedKeys.filter((k) => rightSet.has(k));
  }

  private updateValue(nextRightKeys: string[], movedKeys: string[], direction: 'left' | 'right') {
    if (this.isControlled) {
      // 受控：仅发事件，由外部同步 value
      this.ldesignChange.emit({ value: nextRightKeys.slice(), movedKeys, direction });
    } else {
      // 非受控：内部持有状态，并可同步到对外属性但不改变受控判定
      this.rightKeys = nextRightKeys.slice();
      this.value = nextRightKeys.slice();
      this.ldesignChange.emit({ value: nextRightKeys.slice(), movedKeys, direction });
    }
  }

  private moveRight = () => {
    if (this.disabled) return;
    // 直接基于当前选中的左侧 keys 进行移动，避免因为列表映射或过滤状态导致的差异
    const toMove = (this.leftSelectedKeys || []).slice();
    if (!toMove.length) return;

    const add = new Set(this.rightKeys || []);
    for (const k of toMove) add.add(k);
    const next = Array.from(add);
    this.updateValue(next, toMove, 'right');
    // 清理左侧选择
    this.leftSelectedKeys = [];
  };

  private moveLeft = () => {
    if (this.disabled) return;
    // 直接根据当前选中的右侧 keys 进行移动，避免在部分场景（如通过 JSON 属性传入 items）下
    // 因映射不一致造成无法识别右侧条目的问题。
    const toMove = (this.rightSelectedKeys || []).slice();
    if (!toMove.length) return;

    const remove = new Set(toMove);
    const next = (this.rightKeys || []).filter((k) => !remove.has(k));
    this.updateValue(next, toMove, 'left');
    // 清理右侧选择
    this.rightSelectedKeys = [];
  };

  private toggleLeft = (key: string, checked: boolean) => {
    if (this.disabled) return;
    const set = new Set(this.leftSelectedKeys);
    if (checked) set.add(key); else set.delete(key);
    this.leftSelectedKeys = Array.from(set);
  };

  private toggleRight = (key: string, checked: boolean) => {
    if (this.disabled) return;
    const set = new Set(this.rightSelectedKeys);
    if (checked) set.add(key); else set.delete(key);
    this.rightSelectedKeys = Array.from(set);
  };

  private renderPanel(title: string, items: TransferItem[], selectedKeys: string[], onToggle: (key: string, checked: boolean) => void, query: string, onQuery: (v: string) => void) {
    const filtered = this.filterItems(items, query);
    const heightStyle = { height: `${this.listHeight}px` } as any;

    return (
      <div class="ldesign-transfer__panel">
        <div class="ldesign-transfer__header">
          <span class="ldesign-transfer__title">{title}</span>
          <span class="ldesign-transfer__count">{selectedKeys.length}/{filtered.length}</span>
        </div>
        {this.filterable && (
          <div class="ldesign-transfer__search">
            <ldesign-input
              value={query}
              placeholder="搜索"
              prefixIcon="search"
              clearable={true}
              onLdesignInput={(e: CustomEvent<string>) => onQuery(e.detail)}
            />
          </div>
        )}
        <div class="ldesign-transfer__list" style={heightStyle}>
          {filtered.map((it) => {
            const disabled = this.disabled || !!it.disabled;
            const checked = selectedKeys.includes(it.key);
            const onRowClick = () => { if (!disabled) onToggle(it.key, !checked); };
            return (
              <div 
                class={{ 'ldesign-transfer__item': true, 'ldesign-transfer__item--disabled': disabled }}
                onClick={onRowClick as any}
              >
                <ldesign-checkbox
                  value={it.key}
                  checked={checked}
                  disabled={disabled}
                  onLdesignChange={(ev: CustomEvent<boolean>) => { ev.stopPropagation(); onToggle(it.key, ev.detail); }}
                >
                  {it.label}
                </ldesign-checkbox>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div class="ldesign-transfer__empty">暂无数据</div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const leftItems = this.getLeftItems();
    const rightItems = this.getRightItems();

    const left = this.renderPanel(
      this.leftTitle,
      leftItems,
      this.leftSelectedKeys,
      this.toggleLeft,
      this.leftQuery,
      (v) => (this.leftQuery = v)
    );

    const right = this.renderPanel(
      this.rightTitle,
      rightItems,
      this.rightSelectedKeys,
      this.toggleRight,
      this.rightQuery,
      (v) => (this.rightQuery = v)
    );

    const canToRight = !this.disabled && this.leftSelectedKeys.length > 0;
    const canToLeft = !this.disabled && this.rightSelectedKeys.length > 0;

    return (
      <Host class={{ 'ldesign-transfer': true, 'ldesign-transfer--disabled': this.disabled }}>
        {left}
        <div class="ldesign-transfer__operations">
          <ldesign-button size="small" disabled={!canToRight} onLdesignClick={this.moveRight} onClick={this.moveRight as any}>
            <ldesign-icon name="chevron-right" />
          </ldesign-button>
          <ldesign-button size="small" disabled={!canToLeft} onLdesignClick={this.moveLeft} onClick={this.moveLeft as any}>
            <ldesign-icon name="chevron-left" />
          </ldesign-button>
        </div>
        {right}
      </Host>
    );
  }
}
