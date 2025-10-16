/**
 * Translation Version Control System
 * Git-like version control for translations with branching, merging, and history
 */

import { EventEmitter } from 'events';
import * as crypto from 'crypto';

interface Commit {
  hash: string;
  parent: string | null;
  author: string;
  email: string;
  timestamp: number;
  message: string;
  changes: Change[];
  tree: string; // Hash of the translation tree at this point
}

interface Change {
  type: 'add' | 'modify' | 'delete';
  locale: string;
  key: string;
  oldValue?: string;
  newValue?: string;
  diff?: Diff;
}

interface Diff {
  added: string[];
  removed: string[];
  context: string[];
}

interface Branch {
  name: string;
  head: string; // Commit hash
  created: number;
  author: string;
  description?: string;
  upstream?: string;
}

interface Tag {
  name: string;
  commit: string;
  author: string;
  timestamp: number;
  message?: string;
  signed?: boolean;
}

interface MergeConflict {
  locale: string;
  key: string;
  ours: string;
  theirs: string;
  base?: string;
  resolved?: boolean;
  resolution?: string;
}

interface Stash {
  id: string;
  message: string;
  timestamp: number;
  author: string;
  changes: Change[];
  branch: string;
}

interface Remote {
  name: string;
  url: string;
  branches: Map<string, string>; // branch name -> commit hash
  lastFetch: number;
}

export class TranslationVersionControl extends EventEmitter {
  private commits: Map<string, Commit> = new Map();
  private branches: Map<string, Branch> = new Map();
  private tags: Map<string, Tag> = new Map();
  private currentBranch: string = 'main';
  private head: string | null = null;
  private workingTree: Map<string, Map<string, string>> = new Map(); // locale -> key -> value
  private stagingArea: Change[] = [];
  private stashes: Stash[] = [];
  private remotes: Map<string, Remote> = new Map();
  private mergeConflicts: MergeConflict[] = [];
  private config: {
    author: string;
    email: string;
    autoStash: boolean;
    autoMerge: boolean;
  };

  constructor() {
    super();
    
    this.config = {
      author: 'User',
      email: 'user@example.com',
      autoStash: true,
      autoMerge: false
    };

    // Initialize with main branch
    this.initRepository();
  }

  private initRepository(): void {
    // Create initial empty commit
    const initialCommit: Commit = {
      hash: this.generateHash('initial'),
      parent: null,
      author: 'System',
      email: 'system@i18n',
      timestamp: Date.now(),
      message: 'Initial commit',
      changes: [],
      tree: this.generateTreeHash()
    };

    this.commits.set(initialCommit.hash, initialCommit);
    
    // Create main branch
    const mainBranch: Branch = {
      name: 'main',
      head: initialCommit.hash,
      created: Date.now(),
      author: 'System',
      description: 'Main branch'
    };

    this.branches.set('main', mainBranch);
    this.head = initialCommit.hash;
    
    this.emit('init', { branch: 'main', commit: initialCommit.hash });
  }

  // Configuration

  setConfig(config: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...config };
    this.emit('config:update', this.config);
  }

  // Working tree operations

  getTranslation(locale: string, key: string): string | undefined {
    return this.workingTree.get(locale)?.get(key);
  }

  setTranslation(locale: string, key: string, value: string): void {
    if (!this.workingTree.has(locale)) {
      this.workingTree.set(locale, new Map());
    }
    
    const oldValue = this.workingTree.get(locale)!.get(key);
    this.workingTree.get(locale)!.set(key, value);

    // Track change
    const change: Change = {
      type: oldValue === undefined ? 'add' : 'modify',
      locale,
      key,
      oldValue,
      newValue: value,
      diff: this.calculateDiff(oldValue, value)
    };

    // Auto-stage if configured
    this.trackChange(change);
    
    this.emit('translation:change', change);
  }

  deleteTranslation(locale: string, key: string): void {
    const oldValue = this.workingTree.get(locale)?.get(key);
    if (oldValue !== undefined) {
      this.workingTree.get(locale)!.delete(key);
      
      const change: Change = {
        type: 'delete',
        locale,
        key,
        oldValue,
        newValue: undefined
      };

      this.trackChange(change);
      this.emit('translation:delete', change);
    }
  }

  // Staging operations

  add(pattern?: string | RegExp): void {
    // Add changes to staging area
    // Pattern can be used to selectively stage changes
    
    this.emit('stage:add', { pattern, count: this.stagingArea.length });
  }

  reset(pattern?: string | RegExp): void {
    // Remove from staging area
    if (pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      this.stagingArea = this.stagingArea.filter(change => 
        !regex.test(`${change.locale}:${change.key}`)
      );
    } else {
      this.stagingArea = [];
    }
    
    this.emit('stage:reset', { pattern });
  }

  // Commit operations

  commit(message: string, options?: { amend?: boolean; author?: string; email?: string }): string {
    if (this.stagingArea.length === 0 && !options?.amend) {
      throw new Error('Nothing to commit');
    }

    const parent = options?.amend ? this.getCommit(this.head!)?.parent : this.head;
    const changes = options?.amend 
      ? [...(this.getCommit(this.head!)?.changes || []), ...this.stagingArea]
      : this.stagingArea;

    const commit: Commit = {
      hash: this.generateHash(message + Date.now()),
      parent,
      author: options?.author || this.config?.author,
      email: options?.email || this.config?.email,
      timestamp: Date.now(),
      message,
      changes,
      tree: this.generateTreeHash()
    };

    this.commits.set(commit.hash, commit);
    this.head = commit.hash;
    
    // Update branch head
    const branch = this.branches.get(this.currentBranch);
    if (branch) {
      branch.head = commit.hash;
    }

    // Clear staging area
    this.stagingArea = [];

    this.emit('commit', commit);
    return commit.hash;
  }

  // Branch operations

  branch(name: string, options?: { from?: string; checkout?: boolean }): void {
    if (this.branches.has(name)) {
      throw new Error(`Branch '${name}' already exists`);
    }

    const startPoint = options?.from || this.head!;
    
    const branch: Branch = {
      name,
      head: startPoint,
      created: Date.now(),
      author: this.config?.author
    };

    this.branches.set(name, branch);
    
    if (options?.checkout) {
      this.checkout(name);
    }

    this.emit('branch:create', branch);
  }

  checkout(target: string, options?: { force?: boolean; createNew?: boolean }): void {
    // Check for uncommitted changes
    if (this.stagingArea.length > 0 && !options?.force) {
      if (this.config?.autoStash) {
        this.stash('Auto-stash before checkout');
      } else {
        throw new Error('Uncommitted changes. Use force or stash changes.');
      }
    }

    if (options?.createNew) {
      this.branch(target, { checkout: true });
      return;
    }

    // Check if target is branch or commit
    const branch = this.branches.get(target);
    const commit = this.commits.get(target);

    if (branch) {
      this.currentBranch = target;
      this.head = branch.head;
      this.loadTreeFromCommit(branch.head);
    } else if (commit) {
      // Detached HEAD state
      this.currentBranch = 'HEAD';
      this.head = target;
      this.loadTreeFromCommit(target);
    } else {
      throw new Error(`Invalid target: ${target}`);
    }

    this.emit('checkout', { target, branch: this.currentBranch, head: this.head });
  }

  merge(branch: string, options?: { strategy?: 'recursive' | 'ours' | 'theirs'; noCommit?: boolean }): void {
    const sourceBranch = this.branches.get(branch);
    if (!sourceBranch) {
      throw new Error(`Branch '${branch}' not found`);
    }

    const sourceCommit = this.commits.get(sourceBranch.head);
    const targetCommit = this.commits.get(this.head!);

    if (!sourceCommit || !targetCommit) {
      throw new Error('Invalid commits');
    }

    // Find common ancestor
    const commonAncestor = this.findCommonAncestor(sourceCommit.hash, targetCommit.hash);
    
    // Fast-forward if possible
    if (commonAncestor === targetCommit.hash) {
      this.head = sourceCommit.hash;
      this.branches.get(this.currentBranch)!.head = sourceCommit.hash;
      this.loadTreeFromCommit(sourceCommit.hash);
      this.emit('merge:fast-forward', { from: branch, to: this.currentBranch });
      return;
    }

    // Three-way merge
    const conflicts = this.performThreeWayMerge(
      commonAncestor,
      targetCommit.hash,
      sourceCommit.hash,
      options?.strategy || 'recursive'
    );

    if (conflicts.length > 0) {
      this.mergeConflicts = conflicts;
      this.emit('merge:conflict', { conflicts, from: branch, to: this.currentBranch });
      
      if (!this.config?.autoMerge) {
        throw new Error(`Merge conflicts detected: ${conflicts.length} conflicts`);
      }
    }

    if (!options?.noCommit) {
      this.commit(`Merge branch '${branch}' into ${this.currentBranch}`);
    }

    this.emit('merge:complete', { from: branch, to: this.currentBranch, conflicts: conflicts.length });
  }

  resolveConflict(locale: string, key: string, resolution: string): void {
    const conflict = this.mergeConflicts.find(c => c.locale === locale && c.key === key);
    if (conflict) {
      conflict.resolved = true;
      conflict.resolution = resolution;
      
      // Apply resolution to working tree
      this.setTranslation(locale, key, resolution);
      
      // Check if all conflicts resolved
      const unresolvedCount = this.mergeConflicts.filter(c => !c.resolved).length;
      
      this.emit('conflict:resolve', { locale, key, resolution, remaining: unresolvedCount });
      
      if (unresolvedCount === 0) {
        this.mergeConflicts = [];
        this.emit('conflict:all-resolved');
      }
    }
  }

  // History operations

  log(options?: { limit?: number; since?: number; author?: string; branch?: string }): Commit[] {
    let commits: Commit[] = [];
    let current = options?.branch 
      ? this.branches.get(options.branch)?.head 
      : this.head;

    while (current && commits.length < (options?.limit || 100)) {
      const commit = this.commits.get(current);
      if (!commit) break;
      
      // Apply filters
      if (options?.since && commit.timestamp < options.since) break;
      if (options?.author && commit.author !== options.author) {
        current = commit.parent;
        continue;
      }
      
      commits.push(commit);
      current = commit.parent;
    }

    return commits;
  }

  diff(from?: string, to?: string): Change[] {
    const fromCommit = from ? this.commits.get(from) : null;
    const toCommit = to ? this.commits.get(to) : this.commits.get(this.head!);

    if (!toCommit) return [];

    const fromTree = fromCommit ? this.getTreeFromCommit(fromCommit.hash) : new Map();
    const toTree = this.getTreeFromCommit(toCommit.hash);

    return this.calculateTreeDiff(fromTree, toTree);
  }

  blame(locale: string, key: string): { commit: Commit; line: string }[] {
    // Track changes to a specific translation through history
    const blameInfo: { commit: Commit; line: string }[] = [];
    
    let current = this.head;
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      
      const change = commit.changes.find(c => c.locale === locale && c.key === key);
      if (change) {
        blameInfo.push({
          commit,
          line: change.newValue || ''
        });
      }
      
      current = commit.parent;
    }

    return blameInfo;
  }

  // Stash operations

  stash(message?: string): string {
    if (this.stagingArea.length === 0) {
      throw new Error('No changes to stash');
    }

    const stash: Stash = {
      id: this.generateHash('stash' + Date.now()),
      message: message || `WIP on ${this.currentBranch}`,
      timestamp: Date.now(),
      author: this.config?.author,
      changes: [...this.stagingArea],
      branch: this.currentBranch
    };

    this.stashes.push(stash);
    this.stagingArea = [];
    
    this.emit('stash:save', stash);
    return stash.id;
  }

  stashPop(index: number = 0): void {
    if (index >= this.stashes.length) {
      throw new Error('Invalid stash index');
    }

    const stash = this.stashes[index];
    this.stagingArea = [...this.stagingArea, ...stash.changes];
    this.stashes.splice(index, 1);
    
    // Apply changes to working tree
    for (const change of stash.changes) {
      if (change.type === 'delete') {
        this.deleteTranslation(change.locale, change.key);
      } else if (change.newValue) {
        this.setTranslation(change.locale, change.key, change.newValue);
      }
    }
    
    this.emit('stash:pop', stash);
  }

  stashList(): Stash[] {
    return [...this.stashes];
  }

  // Tag operations

  tag(name: string, options?: { message?: string; commit?: string; signed?: boolean }): void {
    if (this.tags.has(name)) {
      throw new Error(`Tag '${name}' already exists`);
    }

    const tag: Tag = {
      name,
      commit: options?.commit || this.head!,
      author: this.config?.author,
      timestamp: Date.now(),
      message: options?.message,
      signed: options?.signed
    };

    this.tags.set(name, tag);
    this.emit('tag:create', tag);
  }

  // Remote operations

  addRemote(name: string, url: string): void {
    if (this.remotes.has(name)) {
      throw new Error(`Remote '${name}' already exists`);
    }

    const remote: Remote = {
      name,
      url,
      branches: new Map(),
      lastFetch: 0
    };

    this.remotes.set(name, remote);
    this.emit('remote:add', remote);
  }

  fetch(remoteName: string = 'origin'): Promise<void> {
    return new Promise((resolve, reject) => {
      const remote = this.remotes.get(remoteName);
      if (!remote) {
        reject(new Error(`Remote '${remoteName}' not found`));
        return;
      }

      // Simulate fetching from remote
      // In real implementation, would connect to remote server
      setTimeout(() => {
        remote.lastFetch = Date.now();
        this.emit('fetch:complete', { remote: remoteName });
        resolve();
      }, 1000);
    });
  }

  push(remoteName: string = 'origin', branch?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const remote = this.remotes.get(remoteName);
      if (!remote) {
        reject(new Error(`Remote '${remoteName}' not found`));
        return;
      }

      const branchToPush = branch || this.currentBranch;
      const branchObj = this.branches.get(branchToPush);
      if (!branchObj) {
        reject(new Error(`Branch '${branchToPush}' not found`));
        return;
      }

      // Simulate pushing to remote
      setTimeout(() => {
        remote.branches.set(branchToPush, branchObj.head);
        this.emit('push:complete', { remote: remoteName, branch: branchToPush });
        resolve();
      }, 1000);
    });
  }

  pull(remoteName: string = 'origin', branch?: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.fetch(remoteName);
        
        const remote = this.remotes.get(remoteName);
        const branchToPull = branch || this.currentBranch;
        const remoteHead = remote?.branches.get(branchToPull);
        
        if (remoteHead) {
          // Merge remote branch
          this.merge(`${remoteName}/${branchToPull}`);
        }
        
        this.emit('pull:complete', { remote: remoteName, branch: branchToPull });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Cherry-pick

  cherryPick(commitHash: string): void {
    const commit = this.commits.get(commitHash);
    if (!commit) {
      throw new Error(`Commit '${commitHash}' not found`);
    }

    // Apply changes from commit
    for (const change of commit.changes) {
      if (change.type === 'delete') {
        this.deleteTranslation(change.locale, change.key);
      } else if (change.newValue) {
        this.setTranslation(change.locale, change.key, change.newValue);
      }
    }

    // Create new commit
    this.commit(`Cherry-pick: ${commit.message}`, {
      author: commit.author,
      email: commit.email
    });

    this.emit('cherry-pick', { commit: commitHash });
  }

  // Rebase

  rebase(onto: string, options?: { interactive?: boolean }): void {
    // Simplified rebase implementation
    const targetBranch = this.branches.get(onto);
    if (!targetBranch) {
      throw new Error(`Branch '${onto}' not found`);
    }

    // Get commits to rebase
    const commits = this.log({ branch: this.currentBranch });
    const commonAncestor = this.findCommonAncestor(this.head!, targetBranch.head);
    
    // Filter commits after common ancestor
    const commitsToRebase = commits.filter(c => {
      let current = c.hash;
      while (current && current !== commonAncestor) {
        const commit = this.commits.get(current);
        current = commit?.parent || null;
      }
      return current !== commonAncestor;
    });

    // Checkout target branch
    this.checkout(onto);

    // Apply commits
    for (const commit of commitsToRebase.reverse()) {
      for (const change of commit.changes) {
        if (change.type === 'delete') {
          this.deleteTranslation(change.locale, change.key);
        } else if (change.newValue) {
          this.setTranslation(change.locale, change.key, change.newValue);
        }
      }
      
      this.commit(commit.message, {
        author: commit.author,
        email: commit.email
      });
    }

    this.emit('rebase:complete', { onto, commits: commitsToRebase.length });
  }

  // Helper methods

  private trackChange(change: Change): void {
    // Remove any existing change for the same key
    this.stagingArea = this.stagingArea.filter(
      c => !(c.locale === change.locale && c.key === change.key)
    );
    this.stagingArea.push(change);
  }

  private generateHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 7);
  }

  private generateTreeHash(): string {
    const treeContent = JSON.stringify(Array.from(this.workingTree.entries()));
    return this.generateHash(treeContent);
  }

  private getCommit(hash: string): Commit | undefined {
    return this.commits.get(hash);
  }

  private loadTreeFromCommit(commitHash: string): void {
    // Reconstruct working tree from commit history
    this.workingTree.clear();
    
    let current: string | null = commitHash;
    const changes: Change[] = [];
    
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      changes.unshift(...commit.changes);
      current = commit.parent;
    }

    // Apply all changes in order
    for (const change of changes) {
      if (!this.workingTree.has(change.locale)) {
        this.workingTree.set(change.locale, new Map());
      }
      
      if (change.type === 'delete') {
        this.workingTree.get(change.locale)!.delete(change.key);
      } else if (change.newValue) {
        this.workingTree.get(change.locale)!.set(change.key, change.newValue);
      }
    }
  }

  private getTreeFromCommit(commitHash: string): Map<string, Map<string, string>> {
    const tree: Map<string, Map<string, string>> = new Map();
    
    let current: string | null = commitHash;
    const changes: Change[] = [];
    
    while (current) {
      const commit = this.commits.get(current);
      if (!commit) break;
      changes.unshift(...commit.changes);
      current = commit.parent;
    }

    for (const change of changes) {
      if (!tree.has(change.locale)) {
        tree.set(change.locale, new Map());
      }
      
      if (change.type === 'delete') {
        tree.get(change.locale)!.delete(change.key);
      } else if (change.newValue) {
        tree.get(change.locale)!.set(change.key, change.newValue);
      }
    }

    return tree;
  }

  private calculateTreeDiff(
    fromTree: Map<string, Map<string, string>>,
    toTree: Map<string, Map<string, string>>
  ): Change[] {
    const changes: Change[] = [];

    // Check for additions and modifications
    for (const [locale, toKeys] of toTree) {
      const fromKeys = fromTree.get(locale);
      
      for (const [key, toValue] of toKeys) {
        const fromValue = fromKeys?.get(key);
        
        if (fromValue === undefined) {
          changes.push({
            type: 'add',
            locale,
            key,
            newValue: toValue
          });
        } else if (fromValue !== toValue) {
          changes.push({
            type: 'modify',
            locale,
            key,
            oldValue: fromValue,
            newValue: toValue,
            diff: this.calculateDiff(fromValue, toValue)
          });
        }
      }
    }

    // Check for deletions
    for (const [locale, fromKeys] of fromTree) {
      const toKeys = toTree.get(locale);
      
      for (const [key, fromValue] of fromKeys) {
        if (!toKeys?.has(key)) {
          changes.push({
            type: 'delete',
            locale,
            key,
            oldValue: fromValue
          });
        }
      }
    }

    return changes;
  }

  private calculateDiff(oldValue?: string, newValue?: string): Diff {
    // Simplified diff calculation
    // In real implementation, would use proper diff algorithm
    const diff: Diff = {
      added: [],
      removed: [],
      context: []
    };

    if (!oldValue) {
      diff.added = newValue ? [newValue] : [];
    } else if (!newValue) {
      diff.removed = [oldValue];
    } else {
      // Simple line-by-line diff
      const oldLines = oldValue.split('\n');
      const newLines = newValue.split('\n');
      
      // This is a very simplified diff - real implementation would use
      // algorithms like Myers' diff algorithm
      diff.removed = oldLines.filter(l => !newLines.includes(l));
      diff.added = newLines.filter(l => !oldLines.includes(l));
      diff.context = newLines.filter(l => oldLines.includes(l));
    }

    return diff;
  }

  private findCommonAncestor(hash1: string, hash2: string): string | null {
    const ancestors1 = new Set<string>();
    let current = hash1;
    
    while (current) {
      ancestors1.add(current);
      const commit = this.commits.get(current);
      current = commit?.parent || null;
    }

    current = hash2;
    while (current) {
      if (ancestors1.has(current)) {
        return current;
      }
      const commit = this.commits.get(current);
      current = commit?.parent || null;
    }

    return null;
  }

  private performThreeWayMerge(
    base: string | null,
    ours: string,
    theirs: string,
    strategy: 'recursive' | 'ours' | 'theirs'
  ): MergeConflict[] {
    const conflicts: MergeConflict[] = [];
    
    const baseTree = base ? this.getTreeFromCommit(base) : new Map();
    const ourTree = this.getTreeFromCommit(ours);
    const theirTree = this.getTreeFromCommit(theirs);

    // Process all keys
    const allKeys = new Set<string>();
    for (const [locale, keys] of [...ourTree, ...theirTree, ...baseTree]) {
      for (const key of keys.keys()) {
        allKeys.add(`${locale}:${key}`);
      }
    }

    for (const fullKey of allKeys) {
      const [locale, key] = fullKey.split(':');
      
      const baseValue = baseTree.get(locale)?.get(key);
      const ourValue = ourTree.get(locale)?.get(key);
      const theirValue = theirTree.get(locale)?.get(key);

      if (ourValue !== theirValue) {
        if (strategy === 'ours') {
          // Keep our version
          if (ourValue) {
            this.setTranslation(locale, key, ourValue);
          }
        } else if (strategy === 'theirs') {
          // Keep their version
          if (theirValue) {
            this.setTranslation(locale, key, theirValue);
          }
        } else {
          // Recursive strategy - check if conflict
          if (baseValue === ourValue) {
            // We didn't change, take theirs
            if (theirValue) {
              this.setTranslation(locale, key, theirValue);
            }
          } else if (baseValue === theirValue) {
            // They didn't change, take ours
            if (ourValue) {
              this.setTranslation(locale, key, ourValue);
            }
          } else {
            // Both changed - conflict
            conflicts.push({
              locale,
              key,
              ours: ourValue || '',
              theirs: theirValue || '',
              base: baseValue
            });
          }
        }
      }
    }

    return conflicts;
  }

  // Status and info

  status(): {
    branch: string;
    head: string | null;
    staged: number;
    conflicts: number;
    stashes: number;
    ahead: number;
    behind: number;
  } {
    // Calculate ahead/behind for current branch
    let ahead = 0;
    let behind = 0;
    
    const branch = this.branches.get(this.currentBranch);
    if (branch?.upstream) {
      const upstream = this.branches.get(branch.upstream);
      if (upstream) {
        // Count commits ahead
        let current = branch.head;
        while (current && current !== upstream.head) {
          ahead++;
          const commit = this.commits.get(current);
          current = commit?.parent || null;
        }
        
        // Count commits behind
        current = upstream.head;
        while (current && current !== branch.head) {
          behind++;
          const commit = this.commits.get(current);
          current = commit?.parent || null;
        }
      }
    }

    return {
      branch: this.currentBranch,
      head: this.head,
      staged: this.stagingArea.length,
      conflicts: this.mergeConflicts.length,
      stashes: this.stashes.length,
      ahead,
      behind
    };
  }

  // Export/Import

  export(): string {
    const data = {
      commits: Array.from(this.commits.entries()),
      branches: Array.from(this.branches.entries()),
      tags: Array.from(this.tags.entries()),
      config: this.config,
      version: '1.0.0'
    };
    
    return JSON.stringify(data, null, 2);
  }

  import(data: string): void {
    const parsed = JSON.parse(data);
    
    this.commits = new Map(parsed.commits);
    this.branches = new Map(parsed.branches);
    this.tags = new Map(parsed.tags);
    this.config = parsed.config;
    
    // Reset to main branch
    this.checkout('main');
    
    this.emit('import:complete');
  }
}

// Export singleton instance
export const versionControl = new TranslationVersionControl();

// Type exports
export type {
  Commit,
  Change,
  Diff,
  Branch,
  Tag,
  MergeConflict,
  Stash,
  Remote
};