import { Component, Prop, State, Event, EventEmitter, Watch, h, Host } from '@stencil/core';
import { Size } from '../../types';

/**
 * Pagination 分页组件
 * 用于数据分页，提供页码切换、页大小切换与快速跳转
 */
@Component({
  tag: 'ldesign-pagination',
  styleUrl: 'pagination.less',
  shadow: false,
})
export class LdesignPagination {
  /** 总条目数 */
  @Prop() total: number = 0;

  /** 当前页（受控） */
  @Prop({ mutable: true }) current?: number;
  /** 默认当前页（非受控） */
  @Prop() defaultCurrent: number = 1;

  /** 每页条数（受控） */
  @Prop({ mutable: true }) pageSize?: number;
  /** 默认每页条数（非受控） */
  @Prop() defaultPageSize: number = 10;

  /** 是否显示每页条数切换器 */
  @Prop() showSizeChanger: boolean = false;
  /** 切换器类型：native 原生下拉；dropdown 使用组件弹层 */
  @Prop() sizeChangerType: 'native' | 'dropdown' = 'dropdown';
  /** 页大小选项（可传数组或逗号分隔字符串） */
  @Prop() pageSizeOptions: number[] | string = [10, 20, 50, 100];
  /** 下拉展示文案模板，仅在 dropdown 模式下生效，支持 {size} */
  @Prop() pageSizeText: string = '{size} 条/页';

  /** 是否显示快速跳转输入框 */
  @Prop() showQuickJumper: boolean = false;

  /** 简洁模式（仅上一页/下一页 + 页码输入） */
  @Prop() simple: boolean = false;

  /** 是否显示首页/末页 */
  @Prop() showFirstLast: boolean = false;

  /** 仅一页时是否隐藏 */
  @Prop() hideOnSinglePage: boolean = false;

  /** 组件禁用 */
  @Prop() disabled: boolean = false;

  /** 组件尺寸 */
  @Prop() size: Size = 'medium';

  /** 是否显示总数文案 */
  @Prop() showTotal: boolean = false;
  /** 总数文案模板，支持 {total}、{rangeStart}、{rangeEnd} */
  @Prop() totalText: string = '共 {total} 条';
  /** 页信息文案模板，支持 {current}、{pageCount} */
  @Prop() pageText: string = '{current}/{pageCount} 页';

  /** 页码省略边界数（两端保留） */
  @Prop() boundaryCount: number = 1;
  /** 当前页两侧展示的邻接页数 */
  @Prop() siblingCount: number = 1;

  /** 页码变化事件 */
  @Event() ldesignChange!: EventEmitter<{ page: number; pageSize: number }>;
  /** 每页条数变化事件 */
  @Event() ldesignPageSizeChange!: EventEmitter<{ pageSize: number; page: number }>;

  /** 内部：快速跳转输入值 */
  @State() quickInput: string = '';

  /** 监听 current 与 pageSize，保证合法范围 */
  @Watch('current')
  onCurrentChange(val?: number) {
    const pageCount = this.pageCount;
    if (val == null) return;
    if (val < 1) this.current = 1;
    if (val > pageCount) this.current = pageCount || 1;
  }

  @Watch('pageSize')
  onPageSizeChange(val?: number) {
    if (val == null || val <= 0) {
      this.pageSize = this.defaultPageSize;
      return;
    }
    const pageCount = this.pageCount;
    if (this.current && this.current > pageCount) {
      // 页大小变化导致页数变少时，收敛当前页
      this.current = pageCount || 1;
    }
  }

  componentWillLoad() {
    // 初始化受控/非受控值
    if (this.current == null) this.current = this.defaultCurrent;
    if (this.pageSize == null) this.pageSize = this.defaultPageSize;

    // 解析 pageSizeOptions（属性可能来自 HTML 字符串）
    this.pageSizeOptions = this.parsePageSizeOptions(this.pageSizeOptions);
  }

  private parsePageSizeOptions(val: number[] | string): number[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      try {
        // 优先尝试 JSON 数组
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.map(n => Number(n)).filter(n => !Number.isNaN(n));
      } catch {}
      // 退化：逗号分隔
      return val
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => !Number.isNaN(n));
    }
    return [10, 20, 50, 100];
  }

  private get pageSizeValue(): number {
    return Math.max(1, Number(this.pageSize ?? this.defaultPageSize) || 10);
  }

  private get pageCount(): number {
    const size = this.pageSizeValue;
    return Math.max(1, Math.ceil((Number(this.total) || 0) / size));
  }

  private get currentValue(): number {
    const cur = Number(this.current ?? this.defaultCurrent) || 1;
    return Math.min(Math.max(1, cur), this.pageCount);
  }

  private getRange() {
    const start = (this.currentValue - 1) * this.pageSizeValue + 1;
    const end = Math.min(this.total, this.currentValue * this.pageSizeValue);
    return { start: this.total === 0 ? 0 : start, end: this.total === 0 ? 0 : end };
  }

  private format(template: string, vars: Record<string, string | number>) {
    return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
  }

  private setPage(next: number) {
    if (this.disabled) return;
    const page = Math.min(Math.max(1, Math.floor(next)), this.pageCount);
    const pageSize = this.pageSizeValue;

    // 受控：current 已有值 => 仅触发事件
    // 非受控：修改 current
    if (this.current !== undefined) {
      this.ldesignChange.emit({ page, pageSize });
    } else {
      this.current = page;
      this.ldesignChange.emit({ page, pageSize });
    }
  }

  private changePageSize(nextSize: number) {
    if (this.disabled) return;
    const size = Math.max(1, Math.floor(nextSize));
    // 受控/非受控处理
    const nextPage = 1; // 切换页大小后回到第一页
    if (this.pageSize !== undefined) {
      this.ldesignPageSizeChange.emit({ pageSize: size, page: nextPage });
      // 如果消费者未同步修改 current，我们不主动改 current；但发出 change 以便联动
      this.ldesignChange.emit({ page: Math.min(this.currentValue, Math.max(1, Math.ceil(this.total / size))), pageSize: size });
    } else {
      this.pageSize = size;
      this.current = nextPage;
      this.ldesignPageSizeChange.emit({ pageSize: size, page: nextPage });
      this.ldesignChange.emit({ page: nextPage, pageSize: size });
    }
  }

  private getPages(): (number | 'ellipsis')[] {
    const totalPages = this.pageCount;
    const current = this.currentValue;
    const boundary = Math.max(0, Math.floor(this.boundaryCount));
    const sibling = Math.max(0, Math.floor(this.siblingCount));

    if (totalPages <= 1) return [1];

    const pages: (number | 'ellipsis')[] = [];

    const left = Math.max(1, current - sibling);
    const right = Math.min(totalPages, current + sibling);

    const showLeftEllipsis = left > 1 + boundary + 1; // 左侧需要省略
    const showRightEllipsis = right < totalPages - boundary - 1; // 右侧需要省略

    // 左边界
    for (let i = 1; i <= Math.min(boundary, totalPages); i++) pages.push(i);

    if (showLeftEllipsis) pages.push('ellipsis');

    // 中间区
    for (let i = Math.max(boundary + 1, left); i <= Math.min(right, totalPages - boundary); i++) {
      pages.push(i);
    }

    if (showRightEllipsis) pages.push('ellipsis');

    // 右边界
    for (let i = Math.max(totalPages - boundary + 1, boundary + 1); i <= totalPages; i++) pages.push(i);

    // 去重/排序（保险）
    const normalized: (number | 'ellipsis')[] = [];
    const seen = new Set<string>();
    for (const it of pages) {
      if (typeof it === 'number') {
        if (!seen.has(`n${it}`)) {
          normalized.push(it);
          seen.add(`n${it}`);
        }
      } else {
        normalized.push(it);
      }
    }
    normalized.sort((a, b) => {
      if (a === 'ellipsis' && b === 'ellipsis') return 0;
      if (a === 'ellipsis') return 1;
      if (b === 'ellipsis') return -1;
      return a - b;
    });

    // 再插入省略号（根据相邻页缺口判断）
    const finalList: (number | 'ellipsis')[] = [];
    let prevNum: number | undefined;
    for (const it of normalized) {
      if (typeof it === 'number') {
        if (prevNum !== undefined && it - prevNum > 1) {
          finalList.push('ellipsis');
        }
        finalList.push(it);
        prevNum = it;
      }
    }
    return finalList.length ? finalList : [1];
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    switch (e.key) {
      case 'ArrowLeft':
        this.setPage(this.currentValue - 1);
        e.preventDefault();
        break;
      case 'ArrowRight':
        this.setPage(this.currentValue + 1);
        e.preventDefault();
        break;
      case 'Home':
        this.setPage(1);
        e.preventDefault();
        break;
      case 'End':
        this.setPage(this.pageCount);
        e.preventDefault();
        break;
    }
  };

  private renderTotal() {
    if (!this.showTotal) return null;
    const { start, end } = this.getRange();
    const text = this.format(this.totalText, {
      total: this.total,
      rangeStart: start,
      rangeEnd: end,
    });
    return <span class="ldesign-pagination__total" aria-live="polite">{text}</span>;
  }

  private renderSizeChanger() {
    if (!this.showSizeChanger) return null;
    const options = (this.pageSizeOptions as number[])?.length ? (this.pageSizeOptions as number[]) : [10, 20, 50, 100];

    if (this.sizeChangerType === 'native') {
      return (
        <label class="ldesign-pagination__sizes">
          <span class="ldesign-pagination__sizes-label">每页</span>
          <select
            class="ldesign-pagination__sizes-select"
            disabled={this.disabled}
            onChange={(e: any) => this.changePageSize(Number(e.target.value))}
            aria-label="每页条数"
          >
            {options.map(opt => (
              <option value={String(opt)} selected={String(opt) === String(this.pageSizeValue)}>{opt}</option>
            ))}
          </select>
          <span class="ldesign-pagination__sizes-label">条</span>
        </label>
      );
    }

    // dropdown 模式
    const display = this.pageSizeText.replace('{size}', String(this.pageSizeValue));
    return (
      <ldesign-popup placement="bottom-start" trigger="click" appendTo="body" strategy="fixed" interactive={true} arrow={false}>
        <button slot="trigger" class="ldesign-pagination__sizes-compact" disabled={this.disabled} aria-label="每页条数">
          <span class="ldesign-pagination__sizes-compact-text">{display}</span>
          <ldesign-icon name="chevron-down" size="small" />
        </button>
        <ul class="ldesign-pagination__sizes-list" role="listbox" aria-label="选择每页条数">
          {options.map(opt => (
            <li>
              <button
                class={{ 'ldesign-pagination__sizes-item': true, 'is-active': opt === this.pageSizeValue }}
                role="option"
                aria-selected={opt === this.pageSizeValue ? 'true' : 'false'}
                onClick={() => this.changePageSize(opt)}
              >
                {this.pageSizeText.replace('{size}', String(opt))}
              </button>
            </li>
          ))}
        </ul>
      </ldesign-popup>
    );
  }
  private renderQuickJumper() {
    if (!this.showQuickJumper) return null;
    const commit = () => {
      const n = Number(this.quickInput);
      if (!Number.isNaN(n) && n >= 1) this.setPage(n);
      this.quickInput = '';
    };
    return (
      <label class="ldesign-pagination__jumper">
        <span class="ldesign-pagination__jumper-label">跳至</span>
        <input
          class="ldesign-pagination__jumper-input"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="页码"
          value={this.quickInput}
          disabled={this.disabled}
          onInput={(e: any) => (this.quickInput = e.target.value.replace(/[^0-9]/g, ''))}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              commit();
            }
          }}
          aria-label="跳转页码"
        />
        <span class="ldesign-pagination__jumper-label">页</span>
      </label>
    );
  }

  private renderSimple() {
    const page = this.currentValue;
    const count = this.pageCount;
    const pageText = this.format(this.pageText, { current: page, pageCount: count });
    return (
      <div class={this.getRootClass()} role="navigation" aria-label="分页导航" aria-disabled={this.disabled ? 'true' : 'false'} onKeyDown={this.handleKeyDown}>
        {this.renderTotal()}
        <button
          class={{ 'ldesign-pagination__prev': true, 'is-disabled': this.disabled || page <= 1 }}
          disabled={this.disabled || page <= 1}
          aria-label="上一页"
          onClick={() => this.setPage(page - 1)}
        >
          <ldesign-icon name="chevron-left"></ldesign-icon>
        </button>
        <span class="ldesign-pagination__simple-text" aria-live="polite">{pageText}</span>
        <button
          class={{ 'ldesign-pagination__next': true, 'is-disabled': this.disabled || page >= count }}
          disabled={this.disabled || page >= count}
          aria-label="下一页"
          onClick={() => this.setPage(page + 1)}
        >
          <ldesign-icon name="chevron-right"></ldesign-icon>
        </button>
        {this.renderSizeChanger()}
        {this.renderQuickJumper()}
      </div>
    );
  }

  private getRootClass(): string {
    const classes = [
      'ldesign-pagination',
      `ldesign-pagination--${this.size}`,
    ];
    if (this.disabled) classes.push('ldesign-pagination--disabled');
    return classes.join(' ');
  }

  render() {
    const count = this.pageCount;
    const current = this.currentValue;

    if (this.hideOnSinglePage && count <= 1) return null;

    if (this.simple) return this.renderSimple();

    const pages = this.getPages();

    return (
      <Host>
        <div
          class={this.getRootClass()}
          role="navigation"
          aria-label="分页导航"
          aria-disabled={this.disabled ? 'true' : 'false'}
          onKeyDown={this.handleKeyDown}
        >
          {this.renderTotal()}

          {this.showFirstLast && (
            <button
              class={{ 'ldesign-pagination__first': true, 'is-disabled': this.disabled || current <= 1 }}
              disabled={this.disabled || current <= 1}
              aria-label="第一页"
              onClick={() => this.setPage(1)}
            >
              <ldesign-icon name="chevrons-left"></ldesign-icon>
            </button>
          )}

          <button
            class={{ 'ldesign-pagination__prev': true, 'is-disabled': this.disabled || current <= 1 }}
            disabled={this.disabled || current <= 1}
            aria-label="上一页"
            onClick={() => this.setPage(current - 1)}
          >
            <ldesign-icon name="chevron-left"></ldesign-icon>
          </button>

          <ul class="ldesign-pagination__pages" role="list">
            {pages.map((p, idx) => (
              p === 'ellipsis' ? (
                <li class="ldesign-pagination__ellipsis" aria-hidden="true" key={`e-${idx}`}>…</li>
              ) : (
                <li key={`p-${p}`}>
                  <button
                    class={{ 'ldesign-pagination__page': true, 'is-active': p === current }}
                    aria-current={p === current ? 'page' : undefined}
                    aria-label={`第 ${p} 页`}
                    disabled={this.disabled}
                    onClick={() => this.setPage(p as number)}
                  >
                    {p}
                  </button>
                </li>
              )
            ))}
          </ul>

          <button
            class={{ 'ldesign-pagination__next': true, 'is-disabled': this.disabled || current >= count }}
            disabled={this.disabled || current >= count}
            aria-label="下一页"
            onClick={() => this.setPage(current + 1)}
          >
            <ldesign-icon name="chevron-right"></ldesign-icon>
          </button>

          {this.showFirstLast && (
            <button
              class={{ 'ldesign-pagination__last': true, 'is-disabled': this.disabled || current >= count }}
              disabled={this.disabled || current >= count}
              aria-label="最后一页"
              onClick={() => this.setPage(count)}
            >
              <ldesign-icon name="chevrons-right"></ldesign-icon>
            </button>
          )}

          {this.renderSizeChanger()}
          {this.renderQuickJumper()}
        </div>
      </Host>
    );
  }
}