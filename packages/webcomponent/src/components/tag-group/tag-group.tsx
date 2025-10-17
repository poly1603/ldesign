import { Component, Prop, h, Host, Element, State, Listen, Event, EventEmitter, Watch } from '@stencil/core';

export interface TagData {
  id: string;
  label: string;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  closable?: boolean;
  variant?: 'light' | 'solid' | 'outline' | 'ghost' | 'dashed' | 'elevated';
}

/**
 * TagGroup 标签组
 * - 支持拖拽排序
 * - 支持动态添加标签
 * - overflow="scroll" 提供横向滚动和可选箭头
 * - overflow="more" 根据 maxVisible 折叠为 +N
 */
@Component({
  tag: 'ldesign-tag-group',
  styleUrl: 'tag-group.less',
  shadow: false,
})
export class LdesignTagGroup {
  @Element() el!: HTMLElement;

  /** 溢出策略：wrap（自动换行） | more（+N 收纳） */
  @Prop() overflow: 'wrap' | 'more' = 'wrap';

  /** more 模式下最多展示的项数（超出将折叠） */
  @Prop() maxVisible: number = 5;

  /** more 展示文本前缀，例如 "+" */
  @Prop() morePrefix: string = '+'

  /** 是否启用拖拽排序 */
  @Prop() enableDrag: boolean = false;

  /** 是否显示添加按钮 */
  @Prop() addable: boolean = false;

  /** 添加按钮文本 */
  @Prop() addText: string = '+ 添加标签';

  /** 输入框占位符 */
  @Prop() inputPlaceholder: string = '请输入标签名';

  /** 标签数据（受控模式） */
  @Prop({ mutable: true }) tags: TagData[] = [];

  /** 新标签默认颜色 */
  @Prop() defaultColor: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';

  /** 新标签默认样式 */
  @Prop() defaultVariant: 'light' | 'solid' | 'outline' | 'ghost' | 'dashed' | 'elevated' = 'light';

  /** 是否禁用 */
  @Prop() disabled: boolean = false;

  /** 内部状态：隐藏的元素文本 */
  @State() hiddenTexts: string[] = [];

  /** 是否显示输入框 */
  @State() showInput: boolean = false;

  /** 输入框值 */
  @State() inputValue: string = '';

  /** 拖拽中的标签索引 */
  @State() draggedIndex: number = -1;

  /** 拖拽悬停的目标索引 */
  @State() dragOverIndex: number = -1;

  /** 新添加的标签ID（用于动画） */
  @State() newlyAddedId: string = '';

  /** 标签添加事件 */
  @Event() ldesignAdd!: EventEmitter<{ label: string; id: string }>;

  /** 标签删除事件 */
  @Event() ldesignRemove!: EventEmitter<{ tag: TagData; index: number }>;

  /** 标签顺序改变事件 */
  @Event() ldesignChange!: EventEmitter<TagData[]>;

  private slotEl?: HTMLSlotElement;
  private inputRef?: HTMLInputElement;

  @Watch('tags')
  onTagsChange() {
    this.updateHidden();
  }

  componentDidLoad() {
    this.updateHidden();
  }

  @Listen('resize', { target: 'window' })
  onWindowResize() {
    if (this.overflow === 'more') {
      // 重新计算隐藏项（maxVisible 改变布局时）
      this.updateHidden();
    }
  }

  private updateHidden() {
    if (!this.slotEl) return;
    if (this.overflow !== 'more') {
      this.hiddenTexts = [];
      // 清理隐藏标记
      this.slotEl.assignedElements().forEach((el: Element) => el.removeAttribute('data-hidden-by-group'));
      return;
    }
    const els = this.slotEl.assignedElements({ flatten: true });
    const toHide = els.slice(this.maxVisible);
    const toShow = els.slice(0, this.maxVisible);
    toShow.forEach(el => el.removeAttribute('data-hidden-by-group'));
    toHide.forEach(el => el.setAttribute('data-hidden-by-group', 'true'));
    this.hiddenTexts = toHide.map(el => (el as HTMLElement).innerText?.trim() || el.tagName.toLowerCase());
  }

  private onSlotChange = () => {
    this.updateHidden();
  };

  // 拖拽相关方法
  private onDragStart = (e: DragEvent, index: number) => {
    if (!this.enableDrag || this.disabled) return;
    this.draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    }
    (e.target as HTMLElement).classList.add('dragging');
  };

  private onDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).classList.remove('dragging');
    this.draggedIndex = -1;
    this.dragOverIndex = -1;
  };

  private onDragOver = (e: DragEvent, index: number) => {
    if (!this.enableDrag || this.disabled) return;
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  };

  private onDragLeave = () => {
    this.dragOverIndex = -1;
  };

  private onDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!this.enableDrag || this.disabled || this.draggedIndex === -1) return;

    const newTags = [...this.tags];
    const [draggedTag] = newTags.splice(this.draggedIndex, 1);
    newTags.splice(dropIndex, 0, draggedTag);

    this.tags = newTags;
    this.ldesignChange.emit(newTags);
    this.draggedIndex = -1;
    this.dragOverIndex = -1;
  };

  // 添加标签相关方法
  private showInputBox = () => {
    if (this.disabled) return;
    this.showInput = true;
    setTimeout(() => {
      this.inputRef?.focus();
    }, 100);
  };

  private hideInputBox = () => {
    this.showInput = false;
    this.inputValue = '';
  };

  private handleInputChange = (e: Event) => {
    this.inputValue = (e.target as HTMLInputElement).value;
  };

  private handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.addTag();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.hideInputBox();
    }
  };

  private handleInputBlur = () => {
    // 延迟隐藏，给点击事件时间
    setTimeout(() => {
      if (this.inputValue.trim()) {
        this.addTag();
      } else {
        this.hideInputBox();
      }
    }, 200);
  };

  private addTag = () => {
    const label = this.inputValue.trim();
    if (!label) {
      this.hideInputBox();
      return;
    }

    const newTag: TagData = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label,
      color: this.defaultColor,
      variant: this.defaultVariant,
      closable: true,
    };

    this.tags = [...this.tags, newTag];
    this.newlyAddedId = newTag.id;
    this.ldesignAdd.emit({ label, id: newTag.id });
    this.hideInputBox();

    // 清除动画标记
    setTimeout(() => {
      this.newlyAddedId = '';
    }, 600);
  };

  private removeTag = (index: number) => {
    if (this.disabled) return;
    const tag = this.tags[index];
    const newTags = this.tags.filter((_, i) => i !== index);
    this.tags = newTags;
    this.ldesignRemove.emit({ tag, index });
    this.ldesignChange.emit(newTags);
  };

  render() {
    const showMore = this.overflow === 'more' && this.hiddenTexts.length > 0;
    const moreCount = this.hiddenTexts.length;
    const hasSlotContent = this.tags.length === 0; // 如果没有tags数据，使用slot

    return (
      <Host
        class={{
          'ldesign-tag-group': true,
          'ldesign-tag-group--wrap': this.overflow === 'wrap',
          'ldesign-tag-group--more': this.overflow === 'more',
          'ldesign-tag-group--draggable': this.enableDrag,
          'ldesign-tag-group--disabled': this.disabled,
        }}
      >
        <div class="ldesign-tag-group__viewport">
          <div class="ldesign-tag-group__list">
            {/* 受控模式：渲染tags数组 */}
            {!hasSlotContent &&
              this.tags.map((tag, index) => {
                const isVisible = this.overflow !== 'more' || index < this.maxVisible;
                if (!isVisible) return null;

                const isDragging = this.draggedIndex === index;
                const isDragOver = this.dragOverIndex === index;
                const isNewlyAdded = this.newlyAddedId === tag.id;

                return (
                  <div
                    key={tag.id}
                    class={{
                      'ldesign-tag-group__item': true,
                      'ldesign-tag-group__item--dragging': isDragging,
                      'ldesign-tag-group__item--drag-over': isDragOver,
                      'ldesign-tag-group__item--newly-added': isNewlyAdded,
                    }}
                    draggable={this.enableDrag && !this.disabled}
                    onDragStart={e => this.onDragStart(e, index)}
                    onDragEnd={this.onDragEnd}
                    onDragOver={e => this.onDragOver(e, index)}
                    onDragLeave={this.onDragLeave}
                    onDrop={e => this.onDrop(e, index)}
                  >
                    <ldesign-tag
                      color={tag.color}
                      variant={tag.variant}
                      closable={tag.closable}
                      disabled={this.disabled}
                      onLdesignClose={() => this.removeTag(index)}
                    >
                      {tag.label}
                    </ldesign-tag>
                  </div>
                );
              })}

            {/* 非受控模式：使用slot */}
            {hasSlotContent && <slot ref={el => (this.slotEl = el as HTMLSlotElement)} onSlotchange={this.onSlotChange}></slot>}

            {/* 添加标签输入框 */}
            {this.addable && this.showInput && (
              <div class="ldesign-tag-group__input-wrapper">
                <input
                  ref={el => (this.inputRef = el as HTMLInputElement)}
                  type="text"
                  class="ldesign-tag-group__input"
                  placeholder={this.inputPlaceholder}
                  value={this.inputValue}
                  disabled={this.disabled}
                  onInput={this.handleInputChange}
                  onKeyDown={this.handleInputKeyDown}
                  onBlur={this.handleInputBlur}
                />
              </div>
            )}

            {/* 添加标签按钮 */}
            {this.addable && !this.showInput && (
              <ldesign-tag
                class="ldesign-tag-group__add-btn"
                variant="dashed"
                color="default"
                clickable
                disabled={this.disabled}
                onClick={this.showInputBox}
              >
                {this.addText}
              </ldesign-tag>
            )}
          </div>
        </div>

        {showMore && (
          <ldesign-popup placement="bottom" interactive={true} trigger="click">
            <ldesign-tag slot="trigger" variant="light" color="default" clickable>
              {this.morePrefix}
              {moreCount}
            </ldesign-tag>
            <div class="ldesign-tag-group__more-list">
              {this.hiddenTexts.map((text, i) => (
                <div class="ldesign-tag-group__more-item" role="listitem" aria-setsize={moreCount} aria-posinset={i + 1}>
                  {text}
                </div>
              ))}
            </div>
          </ldesign-popup>
        )}
      </Host>
    );
  }
}
