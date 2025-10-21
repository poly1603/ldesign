/**
 * 命令模式 - 用于撤销/重做
 */

export interface Command {
  /** 命令名称 */
  name: string;

  /** 执行命令 */
  execute(): void;

  /** 撤销命令 */
  undo(): void;

  /** 重做命令 */
  redo(): void;
}

/**
 * 命令基类
 */
export abstract class BaseCommand implements Command {
  abstract name: string;

  abstract execute(): void;
  abstract undo(): void;

  redo(): void {
    this.execute();
  }
}


