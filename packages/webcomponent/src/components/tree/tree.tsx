import { Component, Prop, State, Event, EventEmitter, Watch, h, Host, Element, Method } from '@stencil/core';

export interface TreeNode {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  selectable?: boolean;
  checkable?: boolean;
  draggable?: boolean;   // 节点级：是否允许被拖拽
  droppable?: boolean;   // 节点级：是否允许放入（inside）
  allowDropInside?: boolean;  // 节点级：允许 inside
  allowDropBefore?: boolean;  // 节点级：允许 before
  allowDropAfter?: boolean;   // 节点级：允许 after
  isLeaf?: boolean; // 可选：标识叶子，懒加载时可用
  children?: TreeNode[];
}

@Component({
  tag: 'ldesign-tree',
  styleUrl: 'tree.less',
  shadow: false,
})
export class LdesignTree {
  @Element() el!: HTMLElement;

  /**
   * 树数据（可传入 JSON 字符串或对象数组）
   */
  @Prop() items: string | TreeNode[] = [];

  /** 是否可选择（高亮） */
  @Prop() selectable: boolean = true;
  /** 是否多选 */
  @Prop() multiple: boolean = false;
  /** 是否显示复选框 */
  @Prop() checkable: boolean = false;

  /** 当前选中项（受控，单选为 string，多选为 string[]） */
  @Prop({ mutable: true }) value?: string | string[];
  /** 默认选中项（非受控） */
  @Prop() defaultValue?: string | string[];

  /** 当前展开项（受控） */
  @Prop({ mutable: true }) expandedKeys?: string[] | string;
  /** 默认展开项（非受控） */
  @Prop() defaultExpandedKeys: string[] | string = [];

  /** 当前勾选项（受控） */
  @Prop({ mutable: true }) checkedKeys?: string[] | string;
  /** 默认勾选项（非受控） */
  @Prop() defaultCheckedKeys: string[] | string = [];

  /** 层级缩进（px） */
  @Prop() indent: number = 16;
  /** 是否显示连接线（简易）*/
  @Prop() showLine: boolean = false;
  /** 是否开启节点拖拽重排 */
  @Prop() nodeDraggable: boolean = false;
  /** 是否启用键盘重排（Alt+方向键） */
  @Prop() reorderable: boolean = true;
  /** 拖拽悬停自动展开的延迟（毫秒） */
  @Prop() dragExpandDelay: number = 400;
  /** 全局允许放置位置 */
  @Prop() allowBefore: boolean = true;
  @Prop() allowAfter: boolean = true;
  @Prop() allowInside: boolean = true;
  /** 自定义：是否允许拖拽该节点（JS 赋值） */
  @Prop() allowDrag?: (node: TreeNode) => boolean;
  /** 自定义：是否允许在目标位置放置（JS 赋值） */
  @Prop() allowDrop?: (dragNode: TreeNode, dropNode: TreeNode, position: 'before' | 'after' | 'inside') => boolean;
  /** 限制最大层级深度（根为 depth=1）；未设置则不限制 */
  @Prop() maxDepth?: number;

  /** 远程数据 URL（根或子节点懒加载） */
  @Prop() dataUrl?: string;
  /** 选择器：读取 <script type="application/json"> 的数据 */
  @Prop() itemsSelector?: string;
  /** 启用懒加载：展开时若无 children 则触发加载 */
  @Prop() lazy: boolean = false;
  /** 懒加载参数名（dataUrl 模式下）：父键参数 */
  @Prop() parentParam: string = 'parent';
  /** 可通过 JS 赋值：自定义加载函数 */
  @Prop() loadData?: (node?: TreeNode | undefined) => Promise<TreeNode[]>;
  /** 可通过 JS 赋值：转换函数，将接口原始数据转换为 TreeNode[] */
  @Prop() transform?: (raw: any) => TreeNode[];
  /** 字段映射：当后端字段名非 key/label/children/isLeaf 等时可用；支持 JSON 字符串或对象（JS 赋值） */
  @Prop() fieldMap?: string | { key: string; label: string; children?: string; isLeaf?: string; disabled?: string; icon?: string };

  /** 选中事件 */
  @Event() ldesignSelect!: EventEmitter<{ key: string; keys: string[]; node?: TreeNode }>;
  /** 展开/收起事件 */
  @Event() ldesignExpand!: EventEmitter<{ key: string; expanded: boolean; expandedKeys: string[] }>;
  /** 勾选事件（包含半选） */
  @Event() ldesignCheck!: EventEmitter<{ key: string; checked: boolean; checkedKeys: string[]; halfCheckedKeys: string[] }>;
  /** 拖拽放置事件（也用于键盘重排时回调） */
  @Event() ldesignDrop!: EventEmitter<{ dragKey: string; dropKey: string; position: 'before' | 'after' | 'inside'; items: TreeNode[] }>;
  /** 键盘重排事件（与 drop 事件区分来源） */
  @Event() ldesignMove!: EventEmitter<{ dragKey: string; dropKey: string; position: 'before' | 'after' | 'inside'; items: TreeNode[] }>;

  @State() parsedItems: TreeNode[] = [];
  @State() internalSelectedKeys: string[] = [];
  @State() internalExpandedKeys: string[] = [];
  @State() internalCheckedKeys: string[] = [];
  @State() halfCheckedKeys: string[] = [];
  @State() draggingKey?: string;
  @State() overKey?: string;
  @State() overPos?: 'before' | 'after' | 'inside';
  @State() overAllowed?: boolean;
  @State() loadingKeys: string[] = [];
  private dragTimers: Map<string, number> = new Map();

  private keyNodeMap = new Map<string, TreeNode>();
  private parentMap = new Map<string, string | null>();
  private childrenMap = new Map<string, string[]>();
  private childrenRefs: Map<string, HTMLUListElement> = new Map();
  private didInitHeights = false;

  @Watch('items')
  watchItems(val: string | TreeNode[]) {
    this.parsedItems = this.parseItems(val);
    this.rebuildMaps();
    // 重新计算半选
    this.recomputeHalfChecked();
  }

  @Watch('itemsSelector')
  async watchItemsSelector(val?: string) {
    if (val) {
      await this.loadFromSelector(val);
    }
  }

  @Watch('dataUrl')
  async watchDataUrl(val?: string) {
    if (val) {
      await this.loadFromUrl(undefined);
    }
  }

  @Watch('expandedKeys')
  watchExpandedKeys(newVal?: string[] | string) {
    const next = this.parseArray(newVal);
    if (next) {
      this.runOpenCloseAnimations(this.internalExpandedKeys, next);
      this.internalExpandedKeys = [...next];
    }
  }

  @Watch('checkedKeys')
  watchCheckedKeys(newVal?: string[] | string) {
    const next = this.parseArray(newVal) || [];
    this.internalCheckedKeys = [...next];
    this.recomputeHalfChecked();
  }

  @Watch('value')
  watchValue(newVal?: string | string[]) {
    if (newVal === undefined) return;
    const arr = Array.isArray(newVal) ? newVal : (newVal ? [newVal] : []);
    this.internalSelectedKeys = this.multiple ? arr : (arr[0] ? [arr[0]] : []);
  }

  async componentWillLoad() {
    // 1) inline items 优先
    if (this.items && ((Array.isArray(this.items) && this.items.length) || (typeof this.items === 'string' && this.items.trim()))) {
      this.parsedItems = this.parseItems(this.items);
    } else if (this.itemsSelector) {
      await this.loadFromSelector(this.itemsSelector);
    } else if (this.dataUrl) {
      await this.loadFromUrl(undefined);
    } else {
      this.parsedItems = [];
    }
    this.rebuildMaps();

    // 初始化展开
    const initExpanded = this.parseArray(this.expandedKeys) ?? this.parseArray(this.defaultExpandedKeys) ?? [];
    this.internalExpandedKeys = [...initExpanded];

    // 初始化选中
    const initSelectedArr = this.value !== undefined ? (Array.isArray(this.value) ? this.value : (this.value ? [this.value] : []))
      : (this.defaultValue !== undefined ? (Array.isArray(this.defaultValue) ? this.defaultValue : (this.defaultValue ? [this.defaultValue] : [])) : []);
    this.internalSelectedKeys = this.multiple ? initSelectedArr : (initSelectedArr[0] ? [initSelectedArr[0]] : []);

    // 初始化勾选
    const initChecked = this.parseArray(this.checkedKeys) ?? this.parseArray(this.defaultCheckedKeys) ?? [];
    this.internalCheckedKeys = [...initChecked];
    this.recomputeHalfChecked();
  }

  private parseItems(val: string | TreeNode[]): TreeNode[] {
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch { return []; }
    }
    return Array.isArray(val) ? val : [];
  }

  private parseFieldMap(): { key: string; label: string; children: string; isLeaf?: string; disabled?: string; icon?: string } | undefined {
    const fm = this.fieldMap as any;
    if (!fm) return undefined;
    if (typeof fm === 'string') {
      try { return JSON.parse(fm); } catch { return undefined; }
    }
    if (typeof fm === 'object') return fm as any;
    return undefined;
  }

  private mapFields(nodes: any[], fm: { key: string; label: string; children: string; isLeaf?: string; disabled?: string; icon?: string }): TreeNode[] {
    if (!Array.isArray(nodes)) return [];
    return nodes.map((n: any) => {
      const out: TreeNode = {
        key: n[fm.key],
        label: n[fm.label],
        icon: fm.icon ? n[fm.icon] : undefined,
        disabled: fm.disabled ? !!n[fm.disabled] : undefined,
        isLeaf: fm.isLeaf ? !!n[fm.isLeaf] : undefined,
        children: undefined,
        selectable: undefined,
        checkable: undefined,
      };
      const childrenRaw = n[fm.children];
      if (Array.isArray(childrenRaw)) out.children = this.mapFields(childrenRaw, fm);
      return out;
    });
  }

  private applyTransform(raw: any): TreeNode[] {
    try {
      const arr = this.transform ? this.transform(raw) : raw;
      const fm = this.parseFieldMap();
      if (fm) return this.mapFields(arr, { children: 'children', ...fm } as any);
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  }

  private async loadFromSelector(selector: string) {
    const el = document.querySelector(selector) as HTMLScriptElement | null;
    if (!el) { this.parsedItems = []; return; }
    try {
      const json = JSON.parse(el.textContent || '[]');
      this.parsedItems = this.applyTransform(json);
      this.rebuildMaps();
    } catch { this.parsedItems = []; }
  }

  private async loadFromUrl(parentKey?: string) {
    if (!this.dataUrl) return;
    const url = new URL(this.dataUrl, window.location.href);
    if (parentKey) url.searchParams.set(this.parentParam, parentKey);
    const res = await fetch(url.toString(), { credentials: 'same-origin' }).catch(() => undefined);
    if (!res || !res.ok) return;
    const raw = await res.json().catch(() => undefined);
    const data = this.applyTransform(raw);
    if (parentKey) {
      this.attachChildren(parentKey, data);
    } else {
      this.parsedItems = data;
      this.rebuildMaps();
    }
  }

  private attachChildren(parentKey: string, children: TreeNode[]) {
    const patch = (list: TreeNode[]): boolean => {
      for (const n of list) {
        if (n.key === parentKey) {
          n.children = children;
          return true;
        }
        if (n.children && patch(n.children)) return true;
      }
      return false;
    };
    const cloned = this.cloneNodes(this.parsedItems);
    patch(cloned);
    this.parsedItems = cloned;
    this.rebuildMaps();
  }

  private parseArray(val: string[] | string | undefined): string[] | undefined {
    if (val === undefined) return undefined;
    if (Array.isArray(val)) return val;
    if (typeof val === 'string') {
      const s = val.trim();
      if (!s) return [];
      try { const arr = JSON.parse(s); return Array.isArray(arr) ? arr : [s]; } catch {
        if (s.includes(',')) return s.split(',').map(x => x.trim()).filter(Boolean);
        return [s];
      }
    }
    return [];
  }

  private rebuildMaps() {
    this.keyNodeMap.clear();
    this.parentMap.clear();
    this.childrenMap.clear();
    const walk = (nodes: TreeNode[], parent: string | null) => {
      for (const n of nodes || []) {
        this.keyNodeMap.set(n.key, n);
        this.parentMap.set(n.key, parent);
        const childKeys = (n.children || []).map(c => c.key);
        this.childrenMap.set(n.key, childKeys);
        if (n.children && n.children.length) walk(n.children, n.key);
      }
    };
    walk(this.parsedItems, null);
  }

  private getChildrenKeys(key: string): string[] {
    return this.childrenMap.get(key) || [];
  }

  private isDescendant(ancestor: string, target: string): boolean {
    const kids = this.getChildrenKeys(ancestor);
    if (!kids.length) return false;
    if (kids.includes(target)) return true;
    return kids.some(k => this.isDescendant(k, target));
  }

  private findListAndIndex(key: string, list: TreeNode[] = this.parsedItems, parentKey: string | null = null): { list: TreeNode[]; index: number; parentKey: string | null } | null {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (n.key === key) return { list, index: i, parentKey };
      if (n.children) {
        const res = this.findListAndIndex(key, n.children, n.key);
        if (res) return res;
      }
    }
    return null;
  }

  private cloneNodes(nodes: TreeNode[]): TreeNode[] {
    return JSON.parse(JSON.stringify(nodes));
  }

  private moveNode(dragKey: string, dropKey: string, position: 'before' | 'after' | 'inside', source: 'drop' | 'keyboard' | 'api' = 'drop'): boolean {
    if (dragKey === dropKey) return false;
    if (this.isDescendant(dragKey, dropKey)) return false; // 不能把父节点拖到其子孙下面

    const data = this.cloneNodes(this.parsedItems);

    const dragInfo = this.findListAndIndex(dragKey, data);
    const dropInfo = this.findListAndIndex(dropKey, data);
    if (!dragInfo || !dropInfo) return false;

    const [dragNode] = dragInfo.list.splice(dragInfo.index, 1);

    if (position === 'inside') {
      dropInfo.list[dropInfo.index].children = dropInfo.list[dropInfo.index].children || [];
      dropInfo.list[dropInfo.index].children!.push(dragNode);
      // 自动展开目标
      const nextExpanded = new Set(this.internalExpandedKeys);
      nextExpanded.add(dropKey);
      this.setExpandedKeys(Array.from(nextExpanded));
    } else {
      // 插入到 drop 同级
      const parent = this.findListAndIndex(dropKey, data)!.list;
      const idx = parent.findIndex(n => n.key === dropKey);
      const insertIndex = position === 'before' ? idx : idx + 1;
      parent.splice(insertIndex, 0, dragNode);
    }

    this.parsedItems = data;
    this.rebuildMaps();

    // 事件通知
    this.ldesignDrop.emit({ dragKey, dropKey, position, items: data });
    if (source === 'keyboard') {
      this.ldesignMove.emit({ dragKey, dropKey, position, items: data });
    }
    return true;
  }

  // 计算某个 key 的深度（根为 1）
  private getDepthOfKey(key: string): number {
    let depth = 0;
    let cur: string | null = key;
    while (cur) {
      depth += 1;
      cur = this.parentMap.get(cur) || null;
    }
    return depth;
  }

  // 计算子树高度（节点自身为 1）
  private getSubtreeHeight(key: string): number {
    const node = this.keyNodeMap.get(key);
    if (!node) return 0;
    const dfs = (n: TreeNode): number => {
      if (!n.children || n.children.length === 0) return 1;
      let maxChild = 0;
      for (const c of n.children) {
        const mapped = this.keyNodeMap.get(c.key) || c;
        maxChild = Math.max(maxChild, dfs(mapped));
      }
      return 1 + maxChild;
    };
    return dfs(node);
  }

  private getDescendantKeys(key: string): string[] {
    const res: string[] = [];
    const dfs = (k: string) => {
      const kids = this.getChildrenKeys(k);
      for (const c of kids) {
        res.push(c);
        dfs(c);
      }
    };
    dfs(key);
    return res;
  }

  private getAncestorKeys(key: string): string[] {
    const res: string[] = [];
    let cur = this.parentMap.get(key) || null;
    while (cur) {
      res.push(cur);
      cur = this.parentMap.get(cur) || null;
    }
    return res;
  }

  private isLeaf(key: string): boolean {
    const kids = this.childrenMap.get(key);
    return !kids || kids.length === 0;
  }

  private isExpanded(key: string): boolean {
    return this.internalExpandedKeys.includes(key);
  }

  private isSelected(key: string): boolean {
    return this.internalSelectedKeys.includes(key);
  }

  private isChecked(key: string): boolean {
    return this.internalCheckedKeys.includes(key);
  }

  private isHalfChecked(key: string): boolean {
    return this.halfCheckedKeys.includes(key);
  }

  private setExpandedKeys(next: string[]) {
    const prev = this.internalExpandedKeys;
    this.runOpenCloseAnimations(prev, next);
    this.internalExpandedKeys = next;
    // 同步受控属性（与 Menu 行为对齐）
    this.expandedKeys = [...next];
  }

  private toggleExpand = async (key: string) => {
    const open = this.isExpanded(key);
    const node = this.keyNodeMap.get(key);

    if (!open && this.lazy) {
      const needLoad = !node?.children || node.children.length === 0;
      if (needLoad && (!node?.isLeaf)) {
        // 标记 loading
        this.loadingKeys = Array.from(new Set([ ...this.loadingKeys, key ]));
        try {
          if (this.loadData) {
            const children = await this.loadData(node);
            this.attachChildren(key, Array.isArray(children) ? children : []);
          } else if (this.dataUrl) {
            await this.loadFromUrl(key);
          }
        } finally {
          this.loadingKeys = this.loadingKeys.filter(k => k !== key);
        }
      }
    }

    const next = open ? this.internalExpandedKeys.filter(k => k !== key) : [...this.internalExpandedKeys, key];
    this.setExpandedKeys(next);
    this.ldesignExpand.emit({ key, expanded: !open, expandedKeys: [...next] });
  };

  private setSelectedKeys(next: string[]) {
    this.internalSelectedKeys = next;
    // 不写入 value（更贴合受控用法预期），仅在外部监听事件后自行同步
  }

  private toggleSelect = (key: string) => {
    if (!this.selectable) return;
    const node = this.keyNodeMap.get(key);
    if (node?.disabled || node?.selectable === false) return;

    let next: string[];
    if (this.multiple) {
      if (this.isSelected(key)) next = this.internalSelectedKeys.filter(k => k !== key);
      else next = [...this.internalSelectedKeys, key];
    } else {
      next = this.isSelected(key) ? [] : [key];
    }

    this.setSelectedKeys(next);
    this.ldesignSelect.emit({ key, keys: [...next], node });
  };

  private setCheckedState(checkedSet: Set<string>, halfSet: Set<string>) {
    this.internalCheckedKeys = Array.from(checkedSet);
    this.halfCheckedKeys = Array.from(halfSet);
    // 同步受控属性
    this.checkedKeys = [...this.internalCheckedKeys];
  }

  private recomputeHalfChecked() {
    const checked = new Set(this.internalCheckedKeys);
    const half = new Set<string>();

    // 自底向上：若某节点的直接子级部分选中，则该节点半选；若全部选中则该节点选中
    // 为提升性能，这里一次性扫描所有父节点
    const keys = Array.from(this.keyNodeMap.keys());
    // 多次迭代直到稳定（树深度有限，通常很快稳定）
    let changed = true;
    while (changed) {
      changed = false;
      for (const k of keys) {
        const children = this.getChildrenKeys(k);
        if (!children.length) continue;
        const total = children.length;
        let checkedCnt = 0;
        let halfCnt = 0;
        for (const c of children) {
          if (checked.has(c)) checkedCnt++;
          else if (half.has(c)) halfCnt++;
        }
        const prevChecked = checked.has(k);
        const prevHalf = half.has(k);
        let nextChecked = prevChecked;
        let nextHalf = prevHalf;
        if (checkedCnt === total) {
          // 所有子级选中 -> 该父级选中
          nextChecked = true;
          nextHalf = false;
        } else if (checkedCnt > 0 || halfCnt > 0) {
          // 部分选中 -> 半选
          nextChecked = false;
          nextHalf = true;
        } else {
          // 全未选 -> 清除
          nextChecked = false;
          nextHalf = false;
        }
        if (nextChecked !== prevChecked) { changed = true; nextChecked ? checked.add(k) : checked.delete(k); }
        if (nextHalf !== prevHalf) { changed = true; nextHalf ? half.add(k) : half.delete(k); }
      }
    }

    this.internalCheckedKeys = Array.from(checked);
    this.halfCheckedKeys = Array.from(half);
  }

  private toggleCheck = (key: string) => {
    if (!this.checkable) return;
    const node = this.keyNodeMap.get(key);
    if (node?.disabled || node?.checkable === false) return;

    const checked = new Set(this.internalCheckedKeys);
    const half = new Set(this.halfCheckedKeys);

    const isChecked = checked.has(key);
    const allDesc = this.getDescendantKeys(key);

    if (isChecked) {
      // 取消：自身 + 子孙全部移除
      checked.delete(key);
      for (const d of allDesc) checked.delete(d);
    } else {
      // 选中：自身 + 子孙全部加入
      checked.add(key);
      for (const d of allDesc) checked.add(d);
    }

    // 自底向上处理祖先
    const ancestors = this.getAncestorKeys(key);
    for (const anc of ancestors) {
      const children = this.getChildrenKeys(anc);
      const total = children.length;
      let cnt = 0;
      for (const c of children) if (checked.has(c)) cnt++;
      if (cnt === 0) {
        checked.delete(anc);
        half.delete(anc);
      } else if (cnt === total) {
        checked.add(anc);
        half.delete(anc);
      } else {
        checked.delete(anc);
        half.add(anc);
      }
    }

    this.setCheckedState(checked, half);
    this.ldesignCheck.emit({ key, checked: !isChecked, checkedKeys: [...this.internalCheckedKeys], halfCheckedKeys: [...this.halfCheckedKeys] });
  };

  private getSiblings(key: string): { parentKey: string | null; list: string[]; index: number } | null {
    let result: { parentKey: string | null; list: string[]; index: number } | null = null;
    const walk = (nodes: TreeNode[], parent: string | null) => {
      const keys = nodes.map(n => n.key);
      const idx = keys.indexOf(key);
      if (idx >= 0) {
        result = { parentKey: parent, list: keys, index: idx };
        return true;
      }
      for (const n of nodes) {
        if (n.children && walk(n.children, n.key)) return true;
      }
      return false;
    };
    walk(this.parsedItems, null);
    return result;
  }

  private canDrop(dragKey: string, dropKey: string, pos: 'before'|'after'|'inside'): boolean {
    if (!dragKey || !dropKey) return false;
    if (dragKey === dropKey) return false;
    if (this.isDescendant(dragKey, dropKey)) return false;
    const dragNode = this.keyNodeMap.get(dragKey)!;
    const dropNode = this.keyNodeMap.get(dropKey)!;
    // global
    const treeAllow = (p: 'before'|'after'|'inside') => p==='before'?this.allowBefore: p==='after'?this.allowAfter:this.allowInside;
    if (!treeAllow(pos)) return false;
    // node level
    if (pos === 'inside') {
      if (dropNode.droppable === false) return false;
      if (dropNode.allowDropInside === false) return false;
    }
    if (pos === 'before' && dropNode.allowDropBefore === false) return false;
    if (pos === 'after'  && dropNode.allowDropAfter  === false) return false;
    // 深度限制（如果设置）
    if (this.maxDepth && this.maxDepth > 0) {
      const subtree = this.getSubtreeHeight(dragKey);
      if (pos === 'inside') {
        const newDepth = this.getDepthOfKey(dropKey) + subtree;
        if (newDepth > this.maxDepth) return false;
      } else {
        // before/after 放在 drop 的父级下
        const parent = this.parentMap.get(dropKey);
        const parentDepth = parent ? this.getDepthOfKey(parent) : 0; // parentDepth=0 表示插入为根
        const newDepth = parentDepth + subtree; // parent depth + subtree height
        if (newDepth > this.maxDepth) return false;
      }
    }
    // custom
    if (this.allowDrop && this.allowDrop(dragNode, dropNode, pos) === false) return false;
    return true;
  }

  private onItemKeyDown = (key: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this.checkable) this.toggleCheck(key); else this.toggleSelect(key);
      return;
    }
    if (!e.altKey) {
      if (e.key === 'ArrowRight') {
        if (!this.isLeaf(key) && !this.isExpanded(key)) this.toggleExpand(key);
      } else if (e.key === 'ArrowLeft') {
        if (!this.isLeaf(key) && this.isExpanded(key)) this.toggleExpand(key);
      }
      return;
    }

    // Alt + 方向键：键盘重排
    if (!this.reorderable) return;
    const sib = this.getSiblings(key);
    if (!sib) return;
    const { parentKey, list, index } = sib;

    if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      const prevKey = list[index - 1];
      if (this.canDrop(key, prevKey, 'before')) this.moveNode(key, prevKey, 'before', 'keyboard');
      return;
    }

    if (e.key === 'ArrowDown' && index < list.length - 1) {
      e.preventDefault();
      const nextKey = list[index + 1];
      if (this.canDrop(key, nextKey, 'after')) this.moveNode(key, nextKey, 'after', 'keyboard');
      return;
    }

    if (e.key === 'ArrowLeft' && parentKey) {
      e.preventDefault();
      if (this.canDrop(key, parentKey, 'after')) this.moveNode(key, parentKey, 'after', 'keyboard');
      return;
    }

    if (e.key === 'ArrowRight' && index > 0) {
      e.preventDefault();
      const prevKey = list[index - 1];
      if (this.canDrop(key, prevKey, 'inside')) this.moveNode(key, prevKey, 'inside', 'keyboard');
      return;
    }
  };

  private onDragStart = (key: string) => (e: DragEvent) => {
    if (!this.nodeDraggable) return;
    const node = this.keyNodeMap.get(key);
    if (node?.disabled) return;
    if (node && node.draggable === false) { e.preventDefault(); return; }
    if (this.allowDrag && node && this.allowDrag(node) === false) { e.preventDefault(); return; }
    this.draggingKey = key;
    try { e.dataTransfer?.setData('text/plain', key); } catch {}
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  };

  private onDragOver = (key: string) => (e: DragEvent) => {
    if (!this.nodeDraggable || !this.draggingKey) return;
    if (key === this.draggingKey) return;
    if (this.isDescendant(this.draggingKey, key)) return; // 禁止拖到自己的子孙
    const dragNode = this.keyNodeMap.get(this.draggingKey)!;
    const dropNode = this.keyNodeMap.get(key)!;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const threshold = Math.max(6, rect.height * 0.25);
    let pos: 'before' | 'after' | 'inside';
    if (y < threshold) pos = 'before';
    else if (y > rect.height - threshold) pos = 'after';
    else pos = 'inside';

    // 全局/节点级位置限制
    const treeAllow = (p: 'before'|'after'|'inside') => p==='before'?this.allowBefore: p==='after'?this.allowAfter:this.allowInside;
    const nodeAllow = (p: 'before'|'after'|'inside') => {
      if (p==='inside') {
        if (dropNode.droppable === false) return false;
        if (dropNode.allowDropInside === false) return false;
        return true;
      }
      if (p==='before') return dropNode.allowDropBefore !== false;
      if (p==='after')  return dropNode.allowDropAfter  !== false;
      return true;
    };
    if (!treeAllow(pos) || !nodeAllow(pos)) return;

    const allowed = this.canDrop(this.draggingKey, key, pos);
    if (this.allowDrop && this.allowDrop(dragNode, dropNode, pos) === false) {
      this.overKey = key; this.overPos = pos; this.overAllowed = false;
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
      return;
    }

    this.overKey = key; this.overPos = pos; this.overAllowed = allowed;
    if (allowed) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    } else {
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
    }

    // 悬停自动展开
    const t = this.dragTimers.get(key);
    if (t) { clearTimeout(t); this.dragTimers.delete(key); }
    if (pos === 'inside' && !this.isExpanded(key) && !dropNode.isLeaf) {
      const timer = window.setTimeout(() => {
        // 再次确认仍然悬停该节点
        if (this.overKey === key && this.overPos === 'inside') {
          this.toggleExpand(key);
        }
        this.dragTimers.delete(key);
      }, Math.max(0, this.dragExpandDelay || 0));
      this.dragTimers.set(key, timer as unknown as number);
    }
  };

  private onDragLeave = (key: string) => (_e: DragEvent) => {
    const t = this.dragTimers.get(key); if (t) { clearTimeout(t); this.dragTimers.delete(key); }
  };

  private onDrop = (key: string) => (e: DragEvent) => {
    if (!this.nodeDraggable || !this.draggingKey) return;
    e.preventDefault();
    const pos = this.overKey === key ? (this.overPos || 'inside') : 'inside';
    const dragNode = this.keyNodeMap.get(this.draggingKey);
    const dropNode = this.keyNodeMap.get(key);

    // 全局/节点级位置限制再次校验
    const treeAllow = (p: 'before'|'after'|'inside') => p==='before'?this.allowBefore: p==='after'?this.allowAfter:this.allowInside;
    const nodeAllow = (p: 'before'|'after'|'inside') => {
      if (!dropNode) return true;
      if (p==='inside') {
        if (dropNode.droppable === false) return false;
        if (dropNode.allowDropInside === false) return false;
        return true;
      }
      if (p==='before') return dropNode.allowDropBefore !== false;
      if (p==='after')  return dropNode.allowDropAfter  !== false;
      return true;
    };

    let allowed = treeAllow(pos) && nodeAllow(pos);
    if (allowed && this.allowDrop && dragNode && dropNode) {
      allowed = this.allowDrop(dragNode, dropNode, pos) !== false;
    }

    if (allowed && this.canDrop(this.draggingKey, key, pos)) {
      this.moveNode(this.draggingKey, key, pos);
    }
    // 清理
    const t = this.dragTimers.get(key); if (t) { clearTimeout(t); this.dragTimers.delete(key); }
    this.dragTimers.forEach(v => clearTimeout(v)); this.dragTimers.clear();
    this.draggingKey = undefined;
    this.overKey = undefined; this.overPos = undefined;
  };

  private onDragEnd = () => {
    this.dragTimers.forEach(v => clearTimeout(v));
    this.dragTimers.clear();
    this.draggingKey = undefined;
    this.overKey = undefined; this.overPos = undefined; this.overAllowed = undefined;
  };

  private renderNode(node: TreeNode, level: number) {
    const k = node.key;
    const leaf = this.isLeaf(k);
    const expanded = this.isExpanded(k);
    const selected = this.isSelected(k);
    const checked = this.isChecked(k);
    const half = this.isHalfChecked(k);

    const paddingLeft = `${(level - 1) * this.indent}px`;

    const itemClasses = {
      'ldesign-tree__item': true,
      'ldesign-tree__item--selected': selected,
      'ldesign-tree__item--disabled': !!node.disabled,
      'ldesign-tree__item--leaf': leaf,
      'ldesign-tree__item--drag-over': this.nodeDraggable && this.overKey === k,
      'ldesign-tree__item--drag-before': this.nodeDraggable && this.overKey === k && this.overPos === 'before',
      'ldesign-tree__item--drag-after': this.nodeDraggable && this.overKey === k && this.overPos === 'after',
      'ldesign-tree__item--drag-inside': this.nodeDraggable && this.overKey === k && this.overPos === 'inside',
      'ldesign-tree__item--drag-deny': this.nodeDraggable && this.overKey === k && this.overAllowed === false,
    } as any;

    const onArrowClick = (ev?: MouseEvent) => { ev?.stopPropagation?.(); if (!leaf) this.toggleExpand(k); };
    const onItemClick = () => this.toggleSelect(k);

    return (
      <li class="ldesign-tree__node" role="none" data-key={k}>
        <div
          class={itemClasses}
          style={{ paddingLeft }}
          role="treeitem"
          data-key={k}
          aria-expanded={!leaf ? String(expanded) : undefined}
          aria-selected={this.selectable ? String(selected) : undefined}
          aria-disabled={String(!!node.disabled)}
          tabindex={node.disabled ? -1 : 0}
          onKeyDown={this.onItemKeyDown(k)}
          onClick={onItemClick}
          draggable={this.nodeDraggable && !node.disabled}
          onDragStart={this.onDragStart(k)}
          onDragOver={this.onDragOver(k)}
          onDragLeave={this.onDragLeave(k)}
          onDrop={this.onDrop(k)}
          onDragEnd={this.onDragEnd}
        >
          <span class={{
            'ldesign-tree__arrow': true,
            'ldesign-tree__arrow--leaf': leaf,
            'ldesign-tree__arrow--expanded': expanded,
            'ldesign-tree__arrow--loading': this.loadingKeys.includes(k),
          }} onClick={onArrowClick} aria-hidden="true">
            {!leaf ? (
              this.loadingKeys.includes(k)
                ? <ldesign-icon name="loader-2" size="small" class="ldesign-tree__loading" />
                : <ldesign-icon name="chevron-right" size="small" />
            ) : <span class="ldesign-tree__arrow-placeholder"></span>}
          </span>

          {this.checkable && (
            <span class="ldesign-tree__checkbox" onClick={(e) => e.stopPropagation()}>
              <ldesign-checkbox
                checked={checked}
                indeterminate={half}
                onLdesignChange={() => this.toggleCheck(k)}
              />
            </span>
          )}

          {node.icon ? (
            <span class="ldesign-tree__icon"><ldesign-icon name={node.icon} size="small" /></span>
          ) : (!leaf ? <span class="ldesign-tree__icon"><ldesign-icon name="folder" size="small" /></span> : <span class="ldesign-tree__icon"><ldesign-icon name="file" size="small" /></span>)}

          <span class="ldesign-tree__label">{node.label}</span>
        </div>

        {!leaf && (
<ul
            class="ldesign-tree__children"
            role="group"
            ref={el => { if (el) this.childrenRefs.set(k, el); else this.childrenRefs.delete(k); }}
          >
            {(node.children || []).map(child => this.renderNode(child, level + 1))}
          </ul>
        )}
      </li>
    );
  }

  private renderTree(nodes: TreeNode[], level: number = 1) {
    return nodes.map(n => this.renderNode(n, level));
  }


  private runOpenCloseAnimations(prev: string[], next: string[]) {
    const toOpen = next.filter(k => !prev.includes(k));
    const toClose = prev.filter(k => !next.includes(k));
    toOpen.forEach(k => this.animateOpen(k));
    toClose.forEach(k => this.animateClose(k));
  }

  private animateOpen(key: string) {
    const el = this.childrenRefs.get(key);
    if (!el) return;
    el.style.display = 'block';
    el.style.overflow = 'hidden';
    el.style.height = '0px';
    requestAnimationFrame(() => {
      const sh = el.scrollHeight;
      el.style.height = `${sh}px`;
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.height = 'auto';
      el.style.overflow = '';
    };
    el.addEventListener('transitionend', onEnd);
  }

  private animateClose(key: string) {
    const el = this.childrenRefs.get(key);
    if (!el) return;
    const current = el.scrollHeight;
    el.style.overflow = 'hidden';
    el.style.height = `${current}px`;
    requestAnimationFrame(() => {
      el.style.height = '0px';
    });
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return;
      el.removeEventListener('transitionend', onEnd);
      el.style.display = 'block';
      el.style.overflow = 'hidden';
    };
    el.addEventListener('transitionend', onEnd);
  }

  componentDidRender() {
    if (!this.didInitHeights) {
      // 初次渲染：默认展开的子树设置为 auto 高度
      this.internalExpandedKeys.forEach(k => {
        const el = this.childrenRefs.get(k);
        if (el) {
          el.style.display = 'block';
          el.style.overflow = '';
          el.style.height = 'auto';
        }
      });
      this.didInitHeights = true;
    }
  }

  private getLineOffset(): number {
    return Math.max(8, Math.round(this.indent * 0.625));
  }

  // Public Methods
  @Method() async getItems(): Promise<TreeNode[]> { return this.cloneNodes(this.parsedItems); }
  @Method() async setItems(items: string | TreeNode[]): Promise<void> { this.parsedItems = this.parseItems(items); this.rebuildMaps(); }
  @Method() async expand(key: string): Promise<void> { if (!this.isExpanded(key)) await this.toggleExpand(key); }
  @Method() async collapse(key: string): Promise<void> { if (this.isExpanded(key)) await this.toggleExpand(key); }
  @Method() async expandAll(): Promise<void> { const allKeys = Array.from(this.keyNodeMap.keys()).filter(k => !this.isLeaf(k)); this.setExpandedKeys(allKeys); }
  @Method() async collapseAll(): Promise<void> { this.setExpandedKeys([]); }
  @Method() async move(dragKey: string, dropKey: string, position: 'before'|'after'|'inside'): Promise<boolean> { if (!this.canDrop(dragKey, dropKey, position)) return false; return this.moveNode(dragKey, dropKey, position, 'api'); }
  @Method() async focusKey(key: string): Promise<void> { const el = this.el.querySelector(`.ldesign-tree__item[data-key="${key}"]`) as HTMLElement | null; if (el) el.focus(); }

  render() {
    return (
      <Host style={{ ['--ld-tree-indent' as any]: `${this.indent}px`, ['--ld-tree-line-offset' as any]: `${this.getLineOffset()}px` }}>
        <ul class={{
          'ldesign-tree': true,
          'ldesign-tree--line': this.showLine,
        }} role="tree">
          {this.renderTree(this.parsedItems, 1)}
        </ul>
      </Host>
    );
  }
}
