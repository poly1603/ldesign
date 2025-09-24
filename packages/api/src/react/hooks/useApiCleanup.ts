import { useEffect } from 'react'

/** 组件卸载时执行清理（占位，按需扩展） */
export function useApiCleanup(fn?: () => void) {
  useEffect(() => () => {
    try { fn?.() }
    catch {}
  }, [])
}
