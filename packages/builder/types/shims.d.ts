declare module 'rollup-plugin-esbuild' {
  const esbuild: any
  export default esbuild
}

declare module 'rollup-plugin-sass' {
  const sass: any
  export default sass
}

declare module 'rollup-plugin-less' {
  const less: any
  export default less
}

declare module 'rollup-plugin-stylus' {
  const stylus: any
  export default stylus
}

declare module 'rollup-plugin-svelte' {
  const svelte: any
  export default svelte
}

declare module '@rollup/plugin-strip' {
  const strip: any
  export default strip
}

declare module 'rollup-plugin-filesize' {
  const filesize: any
  export default filesize
}

declare module 'rollup-plugin-serve' {
  const serve: any
  export default serve
}

declare module 'rollup-plugin-livereload' {
  const livereload: any
  export default livereload
}

declare module 'less' {
  export function render(input: string, options?: any): Promise<{ css: string }>
}
