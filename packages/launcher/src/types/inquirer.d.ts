/**
 * 简化的 inquirer 类型声明
 * 避免 tsup 构建问题
 */

declare module 'inquirer' {
  interface QuestionBase {
    type?: string
    name?: string
    message?: string
    default?: any
    choices?: any[]
    validate?: (input: any) => boolean | string | Promise<boolean | string>
    when?: (answers: any) => boolean | Promise<boolean>
    filter?: (input: any) => any
    transformer?: (input: any, answers?: any) => string
  }

  interface InquirerStatic {
    prompt(questions: QuestionBase | QuestionBase[]): Promise<any>
  }

  // 仅导出具名导出，避免默认导出问题
  export function prompt(questions: QuestionBase | QuestionBase[]): Promise<any>
  export const inquirer: InquirerStatic
}
