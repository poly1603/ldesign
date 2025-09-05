declare module 'figlet' {
  interface FigletOptions {
    font?: string
    horizontalLayout?: 'default' | 'fitted' | 'controlled smushing' | 'universal smushing'
    verticalLayout?: 'default' | 'fitted' | 'controlled smushing' | 'universal smushing'
    width?: number
    whitespaceBreak?: boolean
  }

  function figlet(text: string, callback: (err: Error | null, data: string) => void): void
  function figlet(
    text: string,
    options: FigletOptions,
    callback: (err: Error | null, data: string) => void
  ): void
  function figlet(text: string, options?: FigletOptions): string

  export = figlet
}
